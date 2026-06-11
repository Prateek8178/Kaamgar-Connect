import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';

function App() {
  useEffect(() => {
    // Theme toggle button handler (mirrors main.js)
    const handleThemeToggle = () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      html.setAttribute('data-bs-theme', next);
      localStorage.setItem('theme', next);
      const icon = document.getElementById('themeIcon');
      if (icon) {
        icon.className = next === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
      }
    };

    document.addEventListener('click', (e) => {
      if (e.target.closest('#themeToggle')) handleThemeToggle();
    });

    // Scroll to top button
    const scrollBtn = document.getElementById('scrollTopBtn');
    if (scrollBtn) {
      window.addEventListener('scroll', () => {
        scrollBtn.classList.toggle('show', window.scrollY > 400);
      });
      scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // Sidebar collapse
    const sidebar = document.getElementById('sidebar');
    const layout = document.getElementById('mainLayout');
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle && sidebar) {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved === '1') { sidebar?.classList.add('collapsed'); layout?.classList.add('sidebar-collapsed'); }
      sidebarToggle.addEventListener('click', () => {
        const collapsed = sidebar.classList.toggle('collapsed');
        layout?.classList.toggle('sidebar-collapsed', collapsed);
        localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0');
      });
    }

    document.body.classList.add('loaded');
    document.documentElement.style.visibility = 'visible';
  }, []);

  return (
    <>
      {/* Global toast container — fixed top-right, always present for all pages */}
      <div id="toastContainer"></div>
      <AppRoutes />
      {/* Scroll to top button */}
      <button id="scrollTopBtn" className="kc-scroll-top" title="Back to top">
        <i className="bi bi-arrow-up-short"></i>
      </button>
    </>
  );
}

export default App;
