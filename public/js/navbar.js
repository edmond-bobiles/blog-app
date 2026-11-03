function initNavbar() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (user && user.username) {
        const safeUsername = typeof escapeHtml === 'function' ? escapeHtml(user.username) : user.username;

        // Desktop user indicator before Logout
        const desktopLogout = document.querySelector('.hidden.md\\:flex .logoutLink');
        if (desktopLogout && !document.getElementById('nav-user-badge')) {
            const badge = document.createElement('span');
            badge.id = 'nav-user-badge';
            badge.className = 'inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-900/60 border border-slate-700/60 px-2.5 py-1 rounded-md';
            badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span>${safeUsername}</span>`;
            desktopLogout.parentNode.insertBefore(badge, desktopLogout);
        }

        // Mobile user indicator at top of mobile dropdown
        const mobileMenuContainer = document.querySelector('#mobile-menu > div');
        if (mobileMenuContainer && !document.getElementById('nav-user-badge-mobile')) {
            const mobileBadge = document.createElement('div');
            mobileBadge.id = 'nav-user-badge-mobile';
            mobileBadge.className = 'px-3 py-2 text-xs text-slate-400 border-b border-gray-700/60 mb-1 flex items-center gap-2';
            mobileBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span><span>Signed in as <strong class="text-white">${safeUsername}</strong></span>`;
            mobileMenuContainer.insertBefore(mobileBadge, mobileMenuContainer.firstChild);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();
}
