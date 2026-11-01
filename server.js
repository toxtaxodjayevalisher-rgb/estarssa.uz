require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const TELEGRAM_BOT_TOKEN = '8983797302:AAFBsLv62LUEQPsmqZCIzyTmXA_UIpJx5hQ';
const STUDENT_GROUP_ID = '-1004395732727';
const CHAT_ADMIN = '-5459131960';
const DEFAULT_CHAT_IDS = [STUDENT_GROUP_ID, '1973751873', CHAT_ADMIN];

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Telegram helper functions
async function sendTelegramMessage(text, targetChatIds = DEFAULT_CHAT_IDS) {
  const ids = Array.isArray(targetChatIds) ? targetChatIds : [targetChatIds];
  const results = [];
  for (const chatId of ids) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: String(chatId), text, parse_mode: 'HTML' })
      });
      const data = await res.json();
      if (data.ok) results.push({ chatId, messageId: data.result.message_id });
    } catch (e) {
      console.error(`Telegram send error (${chatId}):`, e.message);
    }
  }
  return results;
}

async function sendTelegramPhoto(caption, buffer, filename = 'photo.jpg', targetChatIds = DEFAULT_CHAT_IDS) {
  const ids = Array.isArray(targetChatIds) ? targetChatIds : [targetChatIds];
  const results = [];
  for (const chatId of ids) {
    try {
      const form = new FormData();
      form.append('chat_id', String(chatId));
      form.append('caption', caption);
      form.append('parse_mode', 'HTML');
      form.append('photo', new Blob([buffer], { type: 'image/jpeg' }), filename);

      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (data.ok) results.push({ chatId, messageId: data.result.message_id });
    } catch (e) {
      console.error(`Telegram photo send error (${chatId}):`, e.message);
    }
  }
  return results;
}

// Authentication middleware
function authMiddleware(req, res, next) {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) return res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Sessiya eskirgan" });
  }
}

// ================= API ROUTES =================

// 1. Auth: Login, Logout, Me
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "Login yoki parol noto'g'ri" });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: "Login yoki parol noto'g'ri" });

    if (user.status !== 'ACTIVE') return res.status(403).json({ error: "Akkaunt bloklangan" });

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username, assigned_group: user.assigned_group, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return res.json({ success: true, role: user.role, full_name: user.full_name, username: user.username });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  return res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json(decoded);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

// 2. Attendance
app.get('/api/attendance', authMiddleware, async (req, res) => {
  try {
    const group = req.query.group;
    const where = group ? { group_name: group } : {};
    const students = await prisma.student.findMany({ where, orderBy: { full_name: 'asc' } });
    return res.json(students);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.post('/api/attendance', authMiddleware, async (req, res) => {
  try {
    const { action, session_id, date, group_name, records, submit } = req.body;
    const auth = req.user;

    if (action === 'edit_draft') {
      await prisma.attendance.deleteMany({ where: { session_id } });
      await prisma.attendanceSession.update({
        where: { id: session_id },
        data: { status: 'DRAFT', submitted_at: null, approved_by_id: null, approved_at: null }
      });
      await sendTelegramMessage(`⚠️ <b>DIQQAT! Davomat bekor qilindi!</b>\n\n👤 Bekor qilgan: <b>${auth.username}</b>\n\nQayta davomat qilinishi lozim!`);
      return res.json({ success: true });
    }

    const finalGroupName = (group_name && group_name !== 'Barchasi') ? group_name : (auth.assigned_group || 'IG2-26');
    const sessionDate = new Date(date || new Date());
    const dayStart = new Date(sessionDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(sessionDate); dayEnd.setHours(23, 59, 59, 999);

    let session = await prisma.attendanceSession.findFirst({
      where: { date: { gte: dayStart, lte: dayEnd }, group_name: finalGroupName }
    });

    if (!session) {
      session = await prisma.attendanceSession.create({
        data: {
          date: dayStart,
          group_name: finalGroupName,
          created_by_id: auth.id,
          status: submit ? 'SENT_FOR_APPROVAL' : 'DRAFT',
          submitted_at: submit ? new Date() : null
        }
      });
    } else {
      session = await prisma.attendanceSession.update({
        where: { id: session.id },
        data: {
          status: submit ? 'SENT_FOR_APPROVAL' : 'DRAFT',
          submitted_at: submit ? new Date() : session.submitted_at
        }
      });
      await prisma.attendance.deleteMany({ where: { session_id: session.id } });
    }

    const attendanceData = (records || []).map(r => ({
      student_id: r.student_id,
      session_id: session.id,
      date: sessionDate,
      status: r.status,
      note: r.note || null
    }));

    if (attendanceData.length > 0) {
      await prisma.attendance.createMany({ data: attendanceData });
    }

    if (submit) {
      const studentIds = records.map(r => r.student_id);
      const dbStudents = await prisma.student.findMany({ where: { id: { in: studentIds } } });
      const studentMap = {};
      dbStudents.forEach(s => { studentMap[s.id] = s; });

      const notPresent = (records || []).filter(r => r.status !== 'KELDI');
      let tgMsg = '';
      if (notPresent.length === 0) {
        tgMsg = `Assalomu alaykum\n${finalGroupName} 100%`;
      } else {
        const list = notPresent.map(r => {
          const s = studentMap[r.student_id];
          const name = s?.full_name || "O'quvchi";
          let reason = (r.note || '').trim();
          if (!reason) {
            if (r.status === 'UZR_LI') reason = 'kasal';
            else if (r.status === 'KELMADI') reason = 'sababsiz';
            else if (r.status === 'KECHIKIB_KELDI') reason = 'kechikdi';
          }
          return `${name}(${reason})`;
        }).join('\n');
        tgMsg = `Assalomu alaykum\n${finalGroupName}\n${list}`;
      }
      await sendTelegramMessage(tgMsg, [CHAT_ADMIN, '1973751873']);
    }

    return res.json({ success: true, session });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server xatosi: " + e.message });
  }
});

app.get('/api/attendance/stats', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);

    const where = { date: { gte: startOfDay, lte: endOfDay } };
    if (req.user.assigned_group) {
      where.OR = [{ group_name: req.user.assigned_group }, { group_name: 'Barchasi' }];
    }

    const session = await prisma.attendanceSession.findFirst({
      where,
      include: { records: { include: { student: true } } },
      orderBy: { submitted_at: 'desc' }
    });

    if (!session) {
      return res.json({ keldi: [], kechikdi: [], sababli: [], kelmadi: [], records: [], status: 'Boshlanmagan' });
    }

    const keldi = session.records.filter(r => r.status === 'KELDI').map(r => r.student);
    const kechikdi = session.records.filter(r => r.status === 'KECHIKIB_KELDI').map(r => r.student);
    const sababli = session.records.filter(r => r.status === 'UZR_LI').map(r => r.student);
    const kelmadi = session.records.filter(r => r.status === 'KELMADI').map(r => r.student);

    return res.json({
      session_id: session.id,
      group_name: session.group_name,
      keldi, kechikdi, sababli, kelmadi,
      records: session.records,
      status: session.status
    });
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.get('/api/attendance/top-violators', authMiddleware, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendances = await prisma.attendance.findMany({
      where: { date: { gte: thirtyDaysAgo }, status: { in: ['KELMADI', 'KECHIKIB_KELDI'] } },
      include: { student: true, session: true },
      orderBy: { date: 'desc' }
    });

    const studentMap = new Map();
    attendances.forEach(a => {
      if (!studentMap.has(a.student_id)) {
        studentMap.set(a.student_id, { student: a.student, total_violations: 0, records: [] });
      }
      const s = studentMap.get(a.student_id);
      s.total_violations += 1;
      s.records.push({ id: a.id, date: a.date, status: a.status, note: a.note || '' });
    });

    const top = Array.from(studentMap.values()).sort((a, b) => b.total_violations - a.total_violations).slice(0, 5);
    return res.json(top);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.get('/api/attendance/approve', authMiddleware, async (req, res) => {
  try {
    const where = { status: 'SENT_FOR_APPROVAL' };
    if (req.user.assigned_group) {
      where.OR = [{ group_name: req.user.assigned_group }, { group_name: 'Barchasi' }];
    }
    const sessions = await prisma.attendanceSession.findMany({
      where,
      include: { records: { include: { student: true }, orderBy: { student: { full_name: 'asc' } } } },
      orderBy: { date: 'desc' }
    });
    return res.json(sessions);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.post('/api/attendance/approve', authMiddleware, async (req, res) => {
  try {
    const { session_id, action } = req.body;
    if (action === 'approve') {
      const session = await prisma.attendanceSession.update({
        where: { id: session_id },
        data: { status: 'APPROVED', approved_by_id: req.user.id, approved_at: new Date() }
      });
      const archiveExists = await prisma.attendanceArchive.findUnique({ where: { attendance_session_id: session.id } });
      if (!archiveExists) {
        await prisma.attendanceArchive.create({ data: { attendance_session_id: session.id } });
      }
    } else if (action === 'redo') {
      await prisma.attendanceSession.update({
        where: { id: session_id },
        data: { status: 'DRAFT', submitted_at: null }
      });
    } else if (action === 'reject') {
      await prisma.attendance.deleteMany({ where: { session_id } });
      await prisma.attendanceSession.delete({ where: { id: session_id } });
    }
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.get('/api/attendance/history', authMiddleware, async (req, res) => {
  try {
    const where = { status: 'APPROVED' };
    if (req.user.assigned_group) {
      where.OR = [{ group_name: req.user.assigned_group }, { group_name: 'Barchasi' }];
    }
    const sessions = await prisma.attendanceSession.findMany({
      where,
      include: { records: { include: { student: true } } },
      orderBy: { date: 'desc' }
    });
    return res.json(sessions);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.get('/api/attendance/starssa-history', authMiddleware, async (req, res) => {
  try {
    const where = {};
    if (req.user.assigned_group) {
      where.OR = [{ group_name: req.user.assigned_group }, { group_name: 'Barchasi' }];
    }
    const sessions = await prisma.attendanceSession.findMany({
      where,
      include: { records: { include: { student: true } } },
      orderBy: { date: 'desc' }
    });
    return res.json(sessions);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

// 3. Homework
app.get('/api/homework', authMiddleware, async (req, res) => {
  try {
    const status = req.query.status || 'ACTIVE';
    const homework = await prisma.homework.findMany({
      where: { status },
      orderBy: { date: 'desc' }
    });
    return res.json(homework);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.post('/api/homework', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { date, group_name, tasks } = req.body;
    const parsedTasks = typeof tasks === 'string' ? JSON.parse(tasks) : tasks;
    let image_url = null;

    if (req.file) {
      const b64 = req.file.buffer.toString('base64');
      image_url = `data:${req.file.mimetype || 'image/jpeg'};base64,${b64}`;
    }

    const d = new Date(date);
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const hwDate = `${days[d.getDay()]} (${d.getDate()}-${months[d.getMonth()]})`;

    for (const t of parsedTasks) {
      await prisma.homework.create({
        data: {
          date: new Date(date),
          subject: t.subject,
          content: t.content,
          group_name,
          image_url,
          created_by: req.user.username,
          status: 'ACTIVE'
        }
      });
    }

    let tgMsg = `📚 <b>Yangi uyga vazifa!</b>\n\n📅 Sana: ${hwDate}\n👥 Guruh: ${group_name}\n`;
    for (const t of parsedTasks) {
      tgMsg += `\n📖 Fan: <b>${t.subject}</b>\n📝 Vazifa:\n${t.content}\n`;
    }
    tgMsg += `\n👤 Kiritdi: ${req.user.username}`;

    if (req.file) {
      await sendTelegramPhoto(tgMsg, req.file.buffer, req.file.originalname, STUDENT_GROUP_ID);
    } else {
      await sendTelegramMessage(tgMsg, STUDENT_GROUP_ID);
    }

    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server xatosi: " + e.message });
  }
});

// 4. Announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const list = await prisma.announcement.findMany({ orderBy: { created_at: 'desc' } });
    return res.json(list);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.post('/api/announcements', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const caption = `<b>${title}</b>\n\n${content}`;
    let imageUrl = null;

    if (req.file) {
      const b64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype || 'image/jpeg'};base64,${b64}`;
      await sendTelegramPhoto(caption, req.file.buffer, req.file.originalname, STUDENT_GROUP_ID);
    } else {
      await sendTelegramMessage(caption, STUDENT_GROUP_ID);
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        image_url: imageUrl,
        created_by: "E'lon"
      }
    });
    return res.json(announcement);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.delete('/api/announcements/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

// 5. Students
app.get('/api/students', authMiddleware, async (req, res) => {
  try {
    const where = {};
    if (req.user.assigned_group && req.user.role !== 'ADMIN') {
      where.group_name = req.user.assigned_group;
    }
    const students = await prisma.student.findMany({ where, orderBy: { full_name: 'asc' } });
    return res.json(students);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.post('/api/students', authMiddleware, async (req, res) => {
  try {
    const { full_name, group_name, phone, birth_date } = req.body;
    const student = await prisma.student.create({
      data: {
        full_name,
        group_name,
        phone: phone || null,
        birth_date: birth_date ? new Date(birth_date) : null
      }
    });
    return res.json(student);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.put('/api/students/:id', authMiddleware, async (req, res) => {
  try {
    const { full_name, group_name, phone, birth_date } = req.body;
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        full_name,
        group_name,
        phone: phone || null,
        birth_date: birth_date ? new Date(birth_date) : null
      }
    });
    return res.json(student);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.delete('/api/students/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

// 6. Users (Accounts)
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Faqat Admin uchun" });
    const users = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: { id: true, username: true, role: true, full_name: true, status: true, assigned_group: true, phone: true, birth_date: true, created_at: true },
      orderBy: { created_at: 'desc' }
    });
    return res.json(users);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.post('/api/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Faqat Admin uchun" });
    const { username, password, role, full_name, phone, birth_date, assigned_group } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password_hash,
        role,
        full_name,
        phone: phone || null,
        birth_date: birth_date ? new Date(birth_date) : null,
        assigned_group: assigned_group || null
      }
    });
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.put('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Faqat Admin uchun" });
    const { username, password, role, full_name, phone, birth_date, assigned_group, status } = req.body;
    const updateData = {
      username,
      role,
      full_name,
      phone: phone || null,
      birth_date: birth_date ? new Date(birth_date) : null,
      assigned_group: assigned_group || null,
      status: status || 'ACTIVE'
    };
    if (password && password.trim()) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData
    });
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Faqat Admin uchun" });
    await prisma.user.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// 7. Groups
app.get('/api/groups', async (req, res) => {
  try {
    const list = await prisma.group.findMany({ orderBy: { created_at: 'desc' } });
    return res.json(list);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

// 8. Anonymous Messages
app.get('/api/starssa/anonymous-messages', authMiddleware, async (req, res) => {
  try {
    const list = await prisma.anonymousMessage.findMany({ orderBy: { created_at: 'desc' } });
    return res.json({ messages: list });
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.post('/api/starssa/anonymous-messages', authMiddleware, async (req, res) => {
  try {
    const { message_id, reply } = req.body;
    const targetMsg = await prisma.anonymousMessage.findUnique({ where: { id: message_id } });
    if (!targetMsg) return res.status(404).json({ error: "Topilmadi" });

    const responder = `Starssa (${req.user.full_name || req.user.username})`;
    await prisma.anonymousMessage.update({
      where: { id: message_id },
      data: { reply: reply.trim(), replied_at: new Date(), replied_by: responder, status: 'REPLIED' }
    });

    const studentNotification = `📬 <b>Starssadan javob xabari!</b>\n\n` +
      `Siz yuborgan anonim xabar:\n<i>«${targetMsg.message}»</i>\n\n` +
      `💬 <b>Javob:</b>\n<b>${reply.trim()}</b>\n\n` +
      `<i>E-STARSSA Tizimi</i>`;

    await sendTelegramMessage(studentNotification, targetMsg.telegram_chat_id);
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// 9. Send direct/group telegram message to student
app.post('/api/starssa/send-message', authMiddleware, async (req, res) => {
  try {
    const { student_id, message, target } = req.body;
    const student = await prisma.student.findUnique({ where: { id: student_id } });
    if (!student) return res.status(404).json({ error: "O'quvchi topilmadi" });

    const sender = req.user.full_name || req.user.username;
    let targetChatId = STUDENT_GROUP_ID;
    let sentTo = 'guruhga';

    if (target === 'direct' && student.phone) {
      const cleanPhone = student.phone.replace(/\D/g, '').slice(-9);
      const userMatch = await prisma.user.findFirst({
        where: { telegram_id: { not: null }, phone: { contains: cleanPhone } }
      });
      if (userMatch?.telegram_id) {
        targetChatId = userMatch.telegram_id;
        sentTo = "o'quvchi shaxsiy lichkasiga";
      }
    }

    const tgText = target === 'direct'
      ? `📩 <b>Sizga yangi xabar!</b>\n\n👤 <b>Hurmatli ${student.full_name}!</b>\n\n💬 ${message.trim()}\n\n<i>Yuboruvchi: ${sender}</i>`
      : `👤 <b>DIQQAT: ${student.full_name} (${student.group_name})</b>\n\n💬 ${message.trim()}\n\n<i>Yuboruvchi: ${sender}</i>`;

    await sendTelegramMessage(tgText, targetChatId);
    return res.json({ success: true, sent_to: sentTo });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// 10. Birthdays & Stats
app.get('/api/birthdays/today', async (req, res) => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit' });
    const [tYear, tMonth, tDay] = formatter.format(now).split('-').map(Number);

    const students = await prisma.student.findMany({ where: { status: 'ACTIVE', birth_date: { not: null } } });
    const birthdays = students.filter(s => {
      const b = new Date(s.birth_date);
      return (b.getUTCMonth() + 1 === tMonth && b.getUTCDate() === tDay) ||
             (b.getMonth() + 1 === tMonth && b.getDate() === tDay);
    }).map(s => ({
      id: s.id,
      full_name: s.full_name,
      group_name: s.group_name,
      text: `Bugun ${s.full_name} ismli o'quvchining tavallud ayyomi! 🎉`
    }));

    return res.json({ birthdays });
  } catch (e) {
    return res.json({ birthdays: [] });
  }
});

app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const attendances = await prisma.attendance.findMany({
      where: { date: { gte: sevenDaysAgo } },
      include: { session: true }
    });

    const groupsMap = {};
    attendances.forEach(a => {
      const gName = a.session?.group_name || 'Boshqa';
      if (!groupsMap[gName]) groupsMap[gName] = { total: 0, keldi: 0 };
      groupsMap[gName].total++;
      if (a.status === 'KELDI' || a.status === 'KECHIKIB_KELDI') groupsMap[gName].keldi++;
    });

    const groupRankings = Object.keys(groupsMap).map(name => ({
      name,
      percentage: Math.round((groupsMap[name].keldi / groupsMap[name].total) * 100) || 0
    })).sort((a, b) => b.percentage - a.percentage);

    return res.json({ groupRankings });
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

// 11. Admin Attendance & Holidays
app.get('/api/admin/attendance', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Faqat Admin uchun" });
    const sessions = await prisma.attendanceSession.findMany({
      orderBy: { date: 'desc' },
      include: { records: true, created_by: { select: { full_name: true } } }
    });
    return res.json(sessions);
  } catch (e) {
    return res.status(500).json({ error: "Server xatosi" });
  }
});

app.post('/api/admin/attendance', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Faqat Admin uchun" });
    const { date, group_name } = req.body;
    await prisma.attendanceSession.upsert({
      where: { date_group_name: { date: new Date(date), group_name } },
      update: { status: 'HOLIDAY' },
      create: { date: new Date(date), group_name, status: 'HOLIDAY', created_by_id: req.user.id }
    });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// 12. Telegram Webhook Endpoint
const STARSSA_INFO_TEXT = `🌟 <b>E-STARSSA Tizimi Haqida Ma'lumot</b>\n\nAssalomu alaykum!\n\n<b>E-STARSSA</b> — bu guruh davomati, o'quv intizomi va kundalik faoliyatni nazorat qilish uchun yaratilgan qulay elektron platforma.\n\n📌 <b>Asosiy imkoniyatlar:</b>\n▫️ 📚 <b>Uyga vazifalar:</b> Fanlar bo'yicha berilgan barcha topshiriqlar shu guruhga muntazam yuboriladi.\n▫️ 📢 <b>E'lonlar va yangiliklar:</b> Muhim sanalar va tadbirlar yetkaziladi.\n▫️ 📋 <b>Davomat nazorati:</b> Starssa davomatni kiritadi, ustoz tasdiqlaydi.\n▫️ ⚠️ <b>Intizom monitoringi:</b> Darsga kechikishlar va intizom hisobi yuritiladi.\n\n🌐 <b>Platforma veb-sayti:</b>\n👉 https://e-starssa.netlify.app/`;

app.get('/api/telegram/webhook', (req, res) => {
  return res.json({ status: 'active', version: '3.0-express', commands: ['/start', '/hw', '/help'] });
});

app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const body = req.body;
    const message = body?.message;
    if (!message) return res.json({ ok: true });

    const chatId = message.chat?.id;
    const text = (message.text || '').trim();
    const lower = text.toLowerCase();

    if (lower === '/start' || lower.startsWith('/start@') || lower.startsWith('/start ') || lower === '/info') {
      await sendTelegramMessage(STARSSA_INFO_TEXT, chatId);
    } else if (lower === '/hw' || lower.startsWith('/hw@') || lower.startsWith('/hw ')) {
      const latest = await prisma.homework.findFirst({ where: { status: 'ACTIVE' }, orderBy: { date: 'desc' } });
      if (!latest) {
        await sendTelegramMessage("ℹ️ Hozircha yangi uyga vazifalar mavjud emas.", chatId);
      } else {
        const hwText = `📚 <b>Oxirgi uyga vazifa:</b>\n\n📖 Fan: <b>${latest.subject}</b>\n👥 Guruh: <b>${latest.group_name}</b>\n📝 Vazifa:\n${latest.content}`;
        await sendTelegramMessage(hwText, chatId);
      }
    } else if (lower === '/help' || lower.startsWith('/help@')) {
      const alertText = `🔔 <b>DIQQAT, HURMATLI STARSSA!</b>\n\nGuruh o'quvchilari tomonidan <b>/help</b> buyrug'i orqali yangi uyga vazifani yuklash so'raldi!\n\nIltimos, uyga vazifalarni tizimga kiriting!`;
      await sendTelegramMessage(alertText, ['6820579298', '1973751873']);
      await sendTelegramMessage("✅ <b>Uyga vazifa so'rovi yuborildi!</b>\n\nStarssaga eslatma yetkazildi.", chatId);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.json({ ok: true });
  }
});

// ================= STATIC FILES & ROUTE REWRITES =================
app.use(express.static(path.join(__dirname, 'public')));

// Clean page rewrites
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get('/starssa', (req, res) => res.sendFile(path.join(__dirname, 'public/starssa/index.html')));
app.get('/starssa/attendance', (req, res) => res.sendFile(path.join(__dirname, 'public/starssa/attendance.html')));
app.get('/starssa/history', (req, res) => res.sendFile(path.join(__dirname, 'public/starssa/history.html')));
app.get('/starssa/homework', (req, res) => res.sendFile(path.join(__dirname, 'public/starssa/homework.html')));
app.get('/starssa/students', (req, res) => res.sendFile(path.join(__dirname, 'public/starssa/students.html')));
app.get('/starssa/announcements', (req, res) => res.sendFile(path.join(__dirname, 'public/starssa/announcements.html')));
app.get('/starssa/anonymous-messages', (req, res) => res.sendFile(path.join(__dirname, 'public/starssa/anonymous-messages.html')));

app.get('/ustoz', (req, res) => res.sendFile(path.join(__dirname, 'public/ustoz/index.html')));
app.get('/ustoz/approve', (req, res) => res.sendFile(path.join(__dirname, 'public/ustoz/approve.html')));
app.get('/ustoz/students', (req, res) => res.sendFile(path.join(__dirname, 'public/ustoz/students.html')));
app.get('/ustoz/history', (req, res) => res.sendFile(path.join(__dirname, 'public/ustoz/history.html')));
app.get('/ustoz/announcements', (req, res) => res.sendFile(path.join(__dirname, 'public/ustoz/announcements.html')));

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public/admin/index.html')));
app.get('/admin/students', (req, res) => res.sendFile(path.join(__dirname, 'public/admin/students.html')));
app.get('/admin/attendance', (req, res) => res.sendFile(path.join(__dirname, 'public/admin/attendance.html')));
app.get('/admin/users', (req, res) => res.sendFile(path.join(__dirname, 'public/admin/users.html')));
app.get('/admin/ratings', (req, res) => res.sendFile(path.join(__dirname, 'public/admin/ratings.html')));
app.get('/admin/announcements', (req, res) => res.sendFile(path.join(__dirname, 'public/admin/announcements.html')));

// Catch-all fallback -> index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 E-STARSSA Express Server running on port ${PORT}`);
});
