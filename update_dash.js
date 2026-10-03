const fs = require('fs');

function updateDashboard(role) {
  const filePath = 'app/' + role + '/page.tsx';
  let code = fs.readFileSync(filePath, 'utf8');

  // Add state for alerts
  if (!code.includes('const [alerts, setAlerts]')) {
    code = code.replace(
      'const [expanded, setExpanded] = useState<Record<string, boolean>>({});',
      'const [expanded, setExpanded] = useState<Record<string, boolean>>({});\n  const [alerts, setAlerts] = useState<any[]>([]);\n  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);'
    );
  }

  // Add fetch for alerts
  if (!code.includes('/api/alerts')) {
    code = code.replace(
      'fetch(\'/api/attendance/top-violators\').then(r => r.json()).then(data => setViolators(data));',
      'fetch(\'/api/attendance/top-violators\').then(r => r.json()).then(data => setViolators(data));\n    fetch(\'/api/alerts\').then(r => r.json()).then(data => setAlerts(data));'
    );
  }

  // Add Alerts UI
  const alertUI = `
        {alerts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg shadow">
            <h2 className="text-red-700 font-bold text-xl mb-4">⚠️ Diqqat! Tizim ogohlantirishi</h2>
            <div className="space-y-4">
              {alerts.map(a => (
                <div key={a.id} className="bg-white p-4 rounded shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{a.student.full_name}</h3>
                    <p className="text-red-600">{a.reason}</p>
                  </div>
                  <button onClick={() => setSelectedAlert(a)} className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700">
                    Ko'rib chiqish
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
`;

  if (!code.includes('Diqqat! Tizim ogohlantirishi')) {
    code = code.replace('{stats && (stats.status !== \'Boshlanmagan\' ? (', alertUI + '\n        {stats && (stats.status !== \'Boshlanmagan\' ? (');
  }

  // Add Alert Modal
  const isUstoz = role === 'ustoz';
  const ustozButtons = `
                  <button onClick={async () => {
                    const res = await fetch('/api/alerts/resolve', { 
                      method: 'POST', 
                      headers: {'Content-Type':'application/json'},
                      body: JSON.stringify({ alert_id: selectedAlert.id, action: 'excuse' })
                    });
                    if(res.ok) {
                      alert("O'quvchi kechirildi va holatlar uzrli deb topildi.");
                      setSelectedAlert(null);
                      fetch('/api/alerts').then(r=>r.json()).then(d=>setAlerts(d));
                    }
                  }} className="bg-green-600 text-white px-4 py-3 rounded text-center font-bold hover:bg-green-700 w-full">
                    Kechirilsin (Sabablari asosli)
                  </button>
                  <button onClick={async () => {
                    const res = await fetch('/api/alerts/resolve', { 
                      method: 'POST', 
                      headers: {'Content-Type':'application/json'},
                      body: JSON.stringify({ alert_id: selectedAlert.id, action: 'warn' })
                    });
                    if(res.ok) {
                      alert('Ota-onasi ogohlantirildi!');
                      setSelectedAlert(null);
                      fetch('/api/alerts').then(r=>r.json()).then(d=>setAlerts(d));
                    }
                  }} className="bg-red-600 text-white px-4 py-3 rounded text-center font-bold hover:bg-red-700 w-full">
                    Ota-onasini ogohlantirish (Sababsiz)
                  </button>
  `;
  const starssaButtons = `
                  <p className="text-center text-red-600 font-bold p-3 bg-red-50 rounded border border-red-200">
                    Ushbu qoidabuzarlikni faqat USTOZ hal qila oladi. Hozirda kutilmoqda...
                  </p>
  `;

  const alertModal = `
        {selectedAlert && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-red-600">Qoidabuzarlik holati</h2>
                <button onClick={() => setSelectedAlert(null)} className="text-gray-500 hover:text-black font-bold text-xl">&times;</button>
              </div>
              <div className="mb-4 text-sm text-gray-700 bg-gray-50 p-4 rounded border">
                <p><strong>O'quvchi:</strong> {selectedAlert.student.full_name}</p>
                <p><strong>Holat:</strong> {selectedAlert.reason}</p>
              </div>
              <h3 className="font-bold mb-2">Tushuntirish xatlari va sabablari</h3>
              <div className="overflow-y-auto flex-1 mb-4 border p-2 rounded">
                <ul className="space-y-2">
                  {selectedAlert.student.attendances.map((r) => (
                    <li key={r.id} className="p-2 border-b bg-white">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">{new Date(r.date).toLocaleDateString()}</span>
                        <span className={r.status === 'KELMADI' ? 'text-red-600' : 'text-yellow-600'}>
                          {r.status === 'KELMADI' ? 'Kelmagan' : 'Kechikkan'}
                        </span>
                      </div>
                      <p className="text-sm"><strong>Sabab:</strong> {r.note || 'Kiritilmagan'}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex flex-col space-y-2 mt-auto pt-4 border-t">
                ${isUstoz ? ustozButtons : starssaButtons}
              </div>
            </div>
          </div>
        )}
`;

  if (!code.includes('Qoidabuzarlik holati')) {
    code = code.replace('{selectedViolator && (', alertModal + '\n        {selectedViolator && (');
  }

  fs.writeFileSync(filePath, code);
}

updateDashboard('starssa');
updateDashboard('ustoz');
