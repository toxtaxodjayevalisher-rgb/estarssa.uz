"use client";
import { useEffect, useState } from 'react';

type BirthdayStudent = {
  id: string;
  full_name: string;
  group_name: string;
  phone?: string | null;
  birth_date?: string | null;
  age?: number;
  text: string;
};

export default function BirthdayBanner() {
  const [birthdays, setBirthdays] = useState<BirthdayStudent[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/birthdays/today')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.birthdays)) {
          setBirthdays(data.birthdays);
        }
      })
      .catch(() => {});
  }, []);

  if (dismissed || birthdays.length === 0) return null;

  return (
    <div className="space-y-3 mb-6 animate-fadeIn">
      {birthdays.map((b) => (
        <div 
          key={b.id} 
          className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white p-4 sm:p-5 rounded-2xl shadow-xl flex items-center justify-between gap-4 border border-white/20"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
              🎂
            </div>
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight flex flex-wrap items-center gap-2">
                <span>Bugun {b.full_name} ismli o'quvchining tug'ilgan kuni!</span>
                <span className="text-xs bg-white text-rose-600 font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                  🎉 Tabriklaymiz!
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/90 mt-0.5 font-medium">
                {b.group_name} guruhi o'quvchisi{b.age ? ` bugun ${b.age} yoshga to'ldi` : ''}. Jamoamiz nomidan mustahkam sog'liq va o'qishlarida ulkan zafarlar tilaymiz!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl hidden sm:inline-block">🎈🥳</span>
            <button 
              onClick={() => setDismissed(true)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition"
              title="Yopish"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
