# E-STARSSA Davomat Boshqaruv Tizimi

E-STARSSA - bu akademik litseylar uchun maxsus ishlab chiqilgan, zamonaviy va professional davomat boshqaruv tizimi. 
Loyiha **Next.js (App Router)**, **PostgreSQL (Prisma)** va **Telegram Bot API** asosida qurilgan.

## Texnologiyalar
- **Frontend & Backend**: Next.js 14, React, Tailwind CSS, Shadcn UI
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: JWT, bcrypt
- **Deploy**: Netlify (Frontend va Serverless API)

---

## 1. Mahalliy muhitda ishga tushirish (Local Setup)

Loyiha kodini o'z kompyuteringizda ishga tushirish uchun quyidagi bosqichlarni bajaring:

### 1.1. Ma'lumotlar bazasini tayyorlash (PostgreSQL)
Loyiha faqat PostgreSQL bilan ishlaydi. 
1. [Supabase](https://supabase.com) yoki [Neon.tech](https://neon.tech) saytiga kiring va yangi loyiha (database) yarating.
2. U yerdan PostgreSQL ulanish ssilkasi (`DATABASE_URL`) ni oling.

### 1.2. Telegram Bot tayyorlash
1. Telegramda `@BotFather` orqali yangi bot yarating.
2. Bot tokenini oling.

### 1.3. `.env` faylini yaratish
Loyiha papkasida `.env` faylini yarating va quyidagilarni kiriting:

```env
DATABASE_URL="postgresql://user:password@host:port/db_name?sslmode=require"
TELEGRAM_BOT_TOKEN="sizning_bot_tokeningiz"
JWT_SECRET="juda_maxfiy_kalit_soz_yozing_bu_yerga"
```

### 1.4. Kutubxonalarni o'rnatish va bazani shakllantirish
Terminalda quyidagi komandalarni ketma-ket ishlating:

```bash
npm install
npx prisma generate
npx prisma db push
```

### 1.5. Boshlang'ich foydalanuvchilarni yaratish (Seed)
Tizimda 3 ta rol (ADMIN, STARSSA, USTOZ) uchun boshlang'ich akkauntlarni yaratish:

```bash
npx prisma db seed
```
*(Bunda parollar bcrypt yordamida himoyalanib bazaga tushadi)*

**Demo Akkauntlar:**
- **Login:** `admin` | **Parol:** `123456`
- **Login:** `starssa` | **Parol:** `123456`
- **Login:** `ustoz` | **Parol:** `123456`

### 1.6. Loyihani ishga tushirish
```bash
npm run dev
```
Brauzerda `http://localhost:3000/login` ga kiring.

---

## 2. Netlify ga Deploy Qilish (Production)

Next.js App Router loyihasini Netlify-ga chiqarish qadamlari:

1. Kodingizni GitHub / GitLab / Bitbucket dagi repozitoriyaga joylang (`git push`).
2. Netlify ga kirib, **"Add new site" -> "Import an existing project"** ni tanlang.
3. Repozitoriyani tanlagandan so'ng, Netlify Next.js ni avtomatik taniydi.
4. **Environment Variables** (Muhit o'zgaruvchilari) bo'limiga `.env` dagi ma'lumotlarni qo'shing:
   - `DATABASE_URL`
   - `TELEGRAM_BOT_TOKEN`
   - `JWT_SECRET`
5. **Build command:** `npm run build`
6. **Publish directory:** `.next`
7. "Deploy Site" tugmasini bosing.

> **Eslatma:** Prisma Next.js muhitida ishlashi uchun `package.json` ning build scriptini shunday o'zgartirib qo'yish kerak:
> `"build": "prisma generate && next build"`

---

## 3. Cron Jobs (Avtomatik 08:35 va 14:00 Xabarlar)
Vaqt zonasi: `Asia/Tashkent`

Netlify-da rejalashtirilgan vazifalarni (cron) ishlatish uchun loyihada **Netlify Scheduled Functions** dan foydalaniladi. 
Ular orqali quyidagi funksiyalar serverda avtomatik ishlaydi:
- **08:35 (Dushanba-Juma):** Telegram bot orqali STARSSA'ga "Bugungi davomatni qildingizmi?" eslatmasi.
- **14:00 (Dushanba-Juma):** Ustozga "Bugungi davomatni tasdiqladingizmi?" eslatmasi (agar `status != APPROVED` bo'lsa).

Tizim real holatga o'tkazilganda ushbu cron vazifalar Netlify serverlarida uzluksiz ishlaydi.

---

## 4. Tizimning Asosiy Qoidalari (Biznes Mantiq)

- **Avtorizatsiya:** Hamma API yo'llari va interfeyslar JWT token va Role-Based tekshiruvidan o'tadi. USTOZ aslo Admin sahifasiga kira olmaydi.
- **Davomat Holatlari:** Faqat 3 ta - `KELDI`, `KECHIKIB_KELDI`, `KELMADI`.
- **Davomat Jarayoni:**
  1. STARSSA davomat oladi (DRAFT).
  2. "Tasdiqlash uchun yuborish" ni bosadi (SENT_FOR_APPROVAL). Bot ustozga xabar yuboradi.
  3. USTOZ ko'rib chiqib tasdiqlaydi (APPROVED). Ma'lumot arxivga tushadi.
- **Nazorat Tizimi:** O'quvchi bir oyda 3 marta KELMADI bo'lsa, avtomatik `Application` (Nazorat) yaratiladi va Ustozga xabar ketadi. Bitta oy uchun bir o'quvchiga faqat bitta xabar boradi.

Loyiha to'liq shakllantirildi. Yuqoridagi qo'llanma asosida ishga tushiring!
