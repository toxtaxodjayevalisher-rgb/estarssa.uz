const fs = require('fs');
let content = fs.readFileSync('app/admin/students/page.tsx', 'utf8');

content = content.replace(
  `  const deleteStudent = async (id: string) => {\r\n    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;\r\n    const res = await fetch(\`/api/students/\${id}\`, { method: 'DELETE' });\r\n    if (res.ok) fetchData();\r\n  };`,
  `  const deleteStudent = async (id: string) => {\r\n    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;\r\n    const res = await fetch(\`/api/students/\${id}\`, { method: 'DELETE' });\r\n    if (res.ok) fetchData();\r\n    else alert("O'chirishda xatolik yuz berdi");\r\n  };`
);

content = content.replace(
  `  const deleteStudent = async (id: string) => {\n    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;\n    const res = await fetch(\`/api/students/\${id}\`, { method: 'DELETE' });\n    if (res.ok) fetchData();\n  };`,
  `  const deleteStudent = async (id: string) => {\n    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;\n    const res = await fetch(\`/api/students/\${id}\`, { method: 'DELETE' });\n    if (res.ok) fetchData();\n    else alert("O'chirishda xatolik yuz berdi");\n  };`
);

fs.writeFileSync('app/admin/students/page.tsx', content);
