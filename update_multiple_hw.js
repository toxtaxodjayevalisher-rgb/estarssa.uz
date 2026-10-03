const fs = require('fs');

// --- UPDATE API ROUTE ---
let apiCode = fs.readFileSync('app/api/homework/route.ts', 'utf8');

const apiReplacement = `const dateStr = formData.get('date') as string;
    const group_name = formData.get('group_name') as string;
    const tasksStr = formData.get('tasks') as string;
    const image = formData.get('image') as File | null;
    
    if (!dateStr || !group_name || !tasksStr) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }

    let tasks = [];
    try {
      tasks = JSON.parse(tasksStr);
    } catch(e) {
      return NextResponse.json({ error: "Xato ma'lumot formati" }, { status: 400 });
    }

    let image_url = null;
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mimeType = image.type || 'image/jpeg';
      image_url = \`data:\${mimeType};base64,\${base64}\`;
    }

    const d = new Date(dateStr);
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const hwDate = \`\${days[d.getDay()]} (\${d.getDate()}-\${months[d.getMonth()]})\`;

    // Save to DB
    for (const t of tasks) {
      await prisma.homework.create({
        data: {
          date: new Date(dateStr),
          subject: t.subject,
          content: t.content,
          group_name,
          image_url,
          created_by: auth.id,
          status: 'ACTIVE'
        }
      });
    }

    // Send to Telegram
    let tgMsg = \`📚 <b>Yangi uyga vazifa!</b>\\n\\n📅 Sana: \${hwDate}\\n👥 Guruh: \${group_name}\\n\`;
    for (const t of tasks) {
      tgMsg += \`\\n📖 Fan: <b>\${t.subject}</b>\\n📝 Vazifa:\\n\${t.content}\\n\`;
    }
    tgMsg += \`\\n👤 Kiritdi: \${auth.username}\`;`;

apiCode = apiCode.replace(/const dateStr = formData\.get\('date'\)[\s\S]*?tgMsg \+= `\\n👤 Kiritdi: \$\{auth\.username\}`;/, apiReplacement);

fs.writeFileSync('app/api/homework/route.ts', apiCode);

// --- UPDATE UI PAGE ---
let uiCode = fs.readFileSync('app/starssa/homework/page.tsx', 'utf8');

// Replace state
uiCode = uiCode.replace(/const \[formData, setFormData\] = useState\(\{.*?\}\);/, 
  `const [date, setDate] = useState('');
  const [group_name, setGroupName] = useState('');
  const [tasks, setTasks] = useState([{ subject: '', content: '' }]);`);

// Replace submit handler body prep
uiCode = uiCode.replace(/body\.append\('date', formData\.date\);[\s\S]*?body\.append\('content', formData\.content\);/, 
  `body.append('date', date);
    body.append('group_name', group_name);
    body.append('tasks', JSON.stringify(tasks));`);

// Replace form fields
const newFormFields = `
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Guruh nomi</label>
              <input required className="w-full border p-2 rounded" placeholder="Masalan: IG2-26" value={group_name} onChange={e => setGroupName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Qaysi kunga (Sana va hafta kuni)</label>
              <input type="date" required className="w-full border p-2 rounded" value={date} onChange={e => setDate(e.target.value)} />
              {date && <p className="text-xs text-gray-500 mt-1">Tanlangan kun: {new Date(date).toLocaleDateString('uz-UZ', {weekday: 'long', day: 'numeric', month: 'long'})}</p>}
            </div>
          </div>
          
          <div className="mt-4 border-t pt-4">
            <h3 className="font-bold text-lg mb-4">Fanlar va vazifalar:</h3>
            {tasks.map((task, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded border mb-4 relative">
                {tasks.length > 1 && (
                  <button type="button" onClick={() => {
                    const newTasks = [...tasks];
                    newTasks.splice(index, 1);
                    setTasks(newTasks);
                  }} className="absolute top-2 right-2 text-red-500 text-sm font-bold">O'chirish</button>
                )}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Fan nomi</label>
                  <input required className="w-full border p-2 rounded" placeholder="Masalan: Matematika" value={task.subject} onChange={e => {
                    const newTasks = [...tasks];
                    newTasks[index].subject = e.target.value;
                    setTasks(newTasks);
                  }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vazifa matni</label>
                  <textarea required rows={3} className="w-full border p-2 rounded" placeholder="Uyga vazifani kiriting..." value={task.content} onChange={e => {
                    const newTasks = [...tasks];
                    newTasks[index].content = e.target.value;
                    setTasks(newTasks);
                  }}></textarea>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setTasks([...tasks, { subject: '', content: '' }])} className="text-blue-600 border border-blue-600 rounded px-4 py-2 hover:bg-blue-50">
              + Yana boshqa fan qo'shish
            </button>
          </div>
`;

uiCode = uiCode.replace(/<div className="grid grid-cols-2 gap-4">[\s\S]*?<\/textarea>\s*<\/div>/, newFormFields);
uiCode = uiCode.replace(/<p className="text-sm text-gray-500 mb-2">Bitta vazifani.*?<\/p>/, '');
uiCode = uiCode.replace(/setHomeworks\(\[resData, \.\.\.homeworks\]\);/, `fetch('/api/homework?status=ACTIVE').then(r => r.json()).then(setHomeworks);`);
uiCode = uiCode.replace(/alert\("Uyga vazifa muvaffaqiyatli saqlandi! Yana qo'shishingiz mumkin."\);/, `alert("Uyga vazifalar muvaffaqiyatli yuborildi!");\n        setTasks([{ subject: '', content: '' }]);\n        setDate('');\n        setGroupName('');\n        setImage(null);`);

fs.writeFileSync('app/starssa/homework/page.tsx', uiCode);
