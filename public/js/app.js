// E-STARSSA Shared Client Engine (Vanilla JS, Zero-build, 100% fast)

const EStarssa = {
  // Navigation items by role
  navItems: {
    STARSSA: [
      { href: '/starssa/index.html', path: '/starssa', label: 'Asosiy', icon: '🏠' },
      { href: '/starssa/attendance.html', path: '/starssa/attendance', label: 'Davomat Qilish', icon: '📋' },
      { href: '/starssa/history.html', path: '/starssa/history', label: 'Davomat Tarixi', icon: '📜' },
      { href: '/starssa/homework.html', path: '/starssa/homework', label: 'Uyga Vazifa', icon: '📚' },
      { href: '/starssa/students.html', path: '/starssa/students', label: "O'quvchilar", icon: '👥' },
      { href: '/starssa/announcements.html', path: '/starssa/announcements', label: "E'lonlar", icon: '📢' },
      { href: '/starssa/anonymous-messages.html', path: '/starssa/anonymous-messages', label: "Anonim Xabarlar", icon: '🕵️' }
    ],
    USTOZ: [
      { href: '/ustoz/index.html', path: '/ustoz', label: 'Asosiy', icon: '🏠' },
      { href: '/ustoz/approve.html', path: '/ustoz/approve', label: 'Tasdiqlash', icon: '✓' },
      { href: '/ustoz/students.html', path: '/ustoz/students', label: "O'quvchilar", icon: '👥' },
      { href: '/ustoz/history.html', path: '/ustoz/history', label: 'Davomat Tarixi', icon: '📜' },
      { href: '/ustoz/announcements.html', path: '/ustoz/announcements', label: "E'lonlar", icon: '📢' }
    ],
    ADMIN: [
      { href: '/admin/index.html', path: '/admin', label: 'Asosiy', icon: '🏠' },
      { href: '/admin/students.html', path: '/admin/students', label: "O'quvchilar", icon: '👥' },
      { href: '/admin/attendance.html', path: '/admin/attendance', label: 'Davomat', icon: '📋' },
      { href: '/admin/users.html', path: '/admin/users', label: 'Akkauntlar', icon: '🔑' },
      { href: '/admin/ratings.html', path: '/admin/ratings', label: 'Reyting & Sertifikat', icon: '🏆' },
      { href: '/admin/announcements.html', path: '/admin/announcements', label: "E'lonlar", icon: '📢' }
    ]
  },

  // Get current user info from session
  async getUser() {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Require authentication and role
  async requireAuth(allowedRoles = []) {
    const user = await this.getUser();
    if (!user) {
      window.location.href = '/login.html';
      return null;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role.toUpperCase())) {
      window.location.href = `/${user.role.toLowerCase()}/index.html`;
      return null;
    }
    return user;
  },

  // Logout
  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/login.html';
  },

  // Render Sidebar & Header
  renderLayout(activePath, role, user) {
    const roleUpper = (role || 'STARSSA').toUpperCase();
    const items = this.navItems[roleUpper] || [];

    const roleName = roleUpper === 'STARSSA' ? 'Starssa' : roleUpper === 'USTOZ' ? 'Ustoz' : 'Admin';
    const roleColor = roleUpper === 'STARSSA'
      ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      : roleUpper === 'USTOZ'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
      : 'bg-purple-500/20 text-purple-300 border-purple-400/30';

    const currentPath = window.location.pathname;

    // Desktop Sidebar
    const sidebarHtml = `
      <aside class="hidden md:flex w-64 bg-[#0a1128] text-white shadow-2xl z-30 flex-col flex-shrink-0">
        <div class="p-6 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-2xl">⭐</span>
            <span class="text-2xl font-serif font-black tracking-wider text-white">E-STARSSA</span>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${roleColor}">
              ${roleName}
            </span>
            <span class="text-xs text-slate-400 font-medium truncate max-w-[120px]">
              ${user?.assigned_group || user?.full_name || ''}
            </span>
          </div>
        </div>

        <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
          ${items.map(item => {
            const isActive = currentPath.endsWith(item.href) || currentPath.includes(item.path);
            const activeClass = isActive 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 font-semibold' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium';
            return `
              <a href="${item.href}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${activeClass}">
                <span class="text-lg">${item.icon}</span>
                <span>${item.label}</span>
              </a>
            `;
          }).join('')}
        </nav>

        <div class="p-4 border-t border-slate-800">
          <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div class="truncate mr-2">
              <p class="text-xs font-bold text-white truncate">${user?.full_name || user?.username || 'Foydalanuvchi'}</p>
              <p class="text-[10px] text-slate-400 truncate">@${user?.username || ''}</p>
            </div>
            <button onclick="EStarssa.logout()" title="Chiqish" class="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
              🚪
            </button>
          </div>
        </div>
      </aside>
    `;

    // Mobile Bottom Navigation Bar
    const bottomItems = items.slice(0, 4);
    const bottomHtml = `
      <div class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 shadow-2xl">
        <div class="flex items-center justify-around">
          ${bottomItems.map(item => {
            const isActive = currentPath.endsWith(item.href) || currentPath.includes(item.path);
            const activeClass = isActive ? 'text-blue-600 font-bold' : 'text-slate-500';
            return `
              <a href="${item.href}" class="flex flex-col items-center py-1 px-2 text-[10px] ${activeClass}">
                <span class="text-xl mb-0.5">${item.icon}</span>
                <span>${item.label.split(' ')[0]}</span>
              </a>
            `;
          }).join('')}
          <button onclick="document.getElementById('mobileMoreMenu').classList.toggle('hidden')" class="flex flex-col items-center py-1 px-2 text-[10px] text-slate-500">
            <span class="text-xl mb-0.5">⋯</span>
            <span>Menyu</span>
          </button>
        </div>
      </div>

      <!-- Mobile More Menu Modal -->
      <div id="mobileMoreMenu" class="hidden md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
        <div class="bg-white rounded-t-3xl p-6 space-y-3 max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <span class="font-bold text-slate-900 text-lg">Barcha bo'limlar</span>
            <button onclick="document.getElementById('mobileMoreMenu').classList.add('hidden')" class="text-slate-400 text-2xl leading-none">&times;</button>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-2">
            ${items.map(item => `
              <a href="${item.href}" class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <span class="text-xl">${item.icon}</span>
                <span>${item.label}</span>
              </a>
            `).join('')}
          </div>
          <div class="pt-4 border-t border-slate-100">
            <button onclick="EStarssa.logout()" class="w-full py-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-sm flex items-center justify-center gap-2">
              🚪 Chiqish (${user?.username || ''})
            </button>
          </div>
        </div>
      </div>
    `;

    const container = document.getElementById('layoutContainer');
    if (container) {
      container.insertAdjacentHTML('afterbegin', sidebarHtml);
      container.insertAdjacentHTML('beforeend', bottomHtml);
    }
  }
};
