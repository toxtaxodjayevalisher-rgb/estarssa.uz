const fs = require('fs');

let content = fs.readFileSync('app/admin/students/page.tsx', 'utf8');

// Replace handleGroupSubmit
content = content.replace(
  `  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingGroupId ? \`/api/groups/\${editingGroupId}\` : '/api/groups';
    const method = editingGroupId ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupForm)
    });
    
    if (res.ok) {
      await fetchData();
      setShowGroupForm(false);
      setEditingGroupId(null);
      setGroupForm({ name: '' });
    } else {
      alert("Xatolik (balki bunday guruh allaqachon mavjud)");
    }
  };`,
  `  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingGroupId ? \`/api/groups/\${editingGroupId}\` : '/api/groups';
    const method = editingGroupId ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupForm)
    });
    
    if (res.ok) {
      const data = await res.json();
      await fetchData();
      setShowGroupForm(false);
      setEditingGroupId(null);
      setGroupForm({ name: '' });
      if (!editingGroupId) {
        window.location.href = '/admin/groups/' + data.id;
      }
    } else {
      alert("Xatolik (balki bunday guruh allaqachon mavjud)");
    }
  };`
);

fs.writeFileSync('app/admin/students/page.tsx', content);
console.log('Fixed group submit navigation');
