/* ═══════════════════════════════════════════════════════
   KAAMGAR CONNECT — Interactive JS v3
   Features: Theme, Toast, OTP, Upload, Chat, Animations
   ═══════════════════════════════════════════════════════ */
'use strict';

/* ── Theme Manager ──────────────────────────────────────── */
const Theme = {
  key: 'kc-theme',
  init() {
    const saved = localStorage.getItem(this.key) || 'light';
    this.apply(saved, false);
  },
  apply(t, animate = true) {
    if (animate) {
      document.body.style.transition = 'background .35s, color .35s';
    }
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.setAttribute('data-bs-theme', t === 'dark' ? 'dark' : 'light');
    localStorage.setItem(this.key, t);

    // Update all toggle icons
    document.querySelectorAll('[data-theme-icon]').forEach(icon => {
      icon.className = t === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    });
    document.querySelectorAll('[data-theme-label]').forEach(el => {
      el.textContent = t === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
  },
  toggle() {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    this.apply(cur === 'dark' ? 'light' : 'dark');
  }
};

/* ── Toast System ───────────────────────────────────────── */
const Toast = {
  container: null,
  icons: { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' },
  colors: { success: '#059669', error: '#e11d48', warning: '#d97706', info: '#4f46e5' },

  init() {
    this.container = document.getElementById('toastContainer');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toastContainer';
      this.container.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
      document.body.appendChild(this.container);
    }
  },

  show(msg, type = 'info', duration = 4500) {
    const id = 'toast-' + Date.now();
    const color = this.colors[type] || this.colors.info;
    const icon  = this.icons[type]  || this.icons.info;
    const el = document.createElement('div');
    el.id = id;
    el.style.cssText = `
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 4px solid ${color};
      border-radius: 14px;
      padding: .9rem 1.1rem;
      min-width: 290px; max-width: 380px;
      box-shadow: var(--shadow-xl);
      display: flex; align-items: flex-start; gap: .75rem;
      pointer-events: all;
      animation: toastSlide .3s cubic-bezier(.34,1.56,.64,1) both;
      font-family: var(--font);
    `;
    el.innerHTML = `
      <i class="bi ${icon}" style="color:${color};font-size:1.1rem;flex-shrink:0;margin-top:1px;"></i>
      <div style="flex:1;font-size:.875rem;font-weight:500;color:var(--text);line-height:1.5;">${msg}</div>
      <button onclick="document.getElementById('${id}').remove()"
        style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:1.1rem;padding:0;line-height:1;flex-shrink:0;">×</button>
    `;
    this.container.appendChild(el);

    // Add CSS animation
    if (!document.getElementById('toast-style')) {
      const style = document.createElement('style');
      style.id = 'toast-style';
      style.textContent = `@keyframes toastSlide{from{opacity:0;transform:translateX(20px) scale(.96);}to{opacity:1;transform:none;}}`;
      document.head.appendChild(style);
    }

    setTimeout(() => {
      el.style.animation = 'none';
      el.style.transition = 'opacity .3s, transform .3s';
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      setTimeout(() => el.remove(), 300);
    }, duration);
  },
  success(m) { this.show(m, 'success'); },
  error(m)   { this.show(m, 'error'); },
  warning(m) { this.show(m, 'warning'); },
  info(m)    { this.show(m, 'info'); }
};

/* ── Navbar scroll effect ───────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('mainNavbar');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Flash message auto-dismiss ─────────────────────────── */
function initFlashMessages() {
  document.querySelectorAll('.kc-alert[data-auto-dismiss]').forEach(el => {
    setTimeout(() => {
      el.style.transition = 'opacity .5s, max-height .5s, padding .5s, margin .5s';
      el.style.opacity = '0';
      el.style.maxHeight = '0';
      el.style.padding = '0';
      el.style.margin = '0';
      setTimeout(() => el.remove(), 500);
    }, 5000);
  });
}

/* ── OTP Input ──────────────────────────────────────────── */
function initOTP() {
  const inputs = [...document.querySelectorAll('.kc-otp-input')];
  if (!inputs.length) return;

  inputs.forEach((inp, i) => {
    inp.addEventListener('input', e => {
      inp.value = inp.value.replace(/\D/g,'').slice(0,1);
      if (inp.value && inputs[i+1]) inputs[i+1].focus();
      updateOTPHidden();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && inputs[i-1]) inputs[i-1].focus();
      if (e.key === 'ArrowRight' && inputs[i+1]) inputs[i+1].focus();
      if (e.key === 'ArrowLeft' && inputs[i-1]) inputs[i-1].focus();
    });
    inp.addEventListener('paste', e => {
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,'');
      if (text.length >= 4) {
        inputs.forEach((el, idx) => el.value = text[idx] || '');
        const lastFilled = Math.min(text.length - 1, inputs.length - 1);
        inputs[lastFilled].focus();
        updateOTPHidden();
        e.preventDefault();
      }
    });
    inp.addEventListener('click', () => inp.select());
  });

  function updateOTPHidden() {
    const hidden = document.querySelector('input[name="otp"]');
    if (hidden) hidden.value = inputs.map(i => i.value).join('');
  }

  const form = document.querySelector('.kc-otp-form');
  if (form) {
    form.addEventListener('submit', updateOTPHidden);
  }
}

/* ── File Upload ────────────────────────────────────────── */
function initUploads() {
  document.querySelectorAll('.kc-upload').forEach(area => {
    const fi = area.querySelector('input[type="file"]');
    if (!fi) return;

    ['dragenter','dragover'].forEach(e => area.addEventListener(e, ev => {
      ev.preventDefault(); area.classList.add('kc-upload-drag');
    }));
    ['dragleave','drop'].forEach(e => area.addEventListener(e, ev => {
      ev.preventDefault(); area.classList.remove('kc-upload-drag');
      if (e === 'drop' && ev.dataTransfer?.files[0]) handleFile(area, ev.dataTransfer.files[0]);
    }));
    fi.addEventListener('change', e => {
      if (e.target.files[0]) handleFile(area, e.target.files[0]);
    });

    function handleFile(a, file) {
      const maxMB = parseInt(a.dataset.maxMb || 5);
      if (file.size > maxMB * 1024 * 1024) { Toast.error(`File too large (max ${maxMB}MB)`); return; }
      a.classList.add('has-file');
      const icon = a.querySelector('.upload-icon');
      const text = a.querySelector('.upload-text');
      const hint = a.querySelector('.upload-hint');
      if (icon) icon.textContent = '✅';
      if (text) text.textContent = file.name;
      if (hint) hint.textContent = `${(file.size/1024/1024).toFixed(2)}MB · Click to replace`;
      Toast.success('File selected successfully!');
    }
  });
}

/* ── Role Toggle ────────────────────────────────────────── */
function initRoleToggle() {
  document.querySelectorAll('.kc-role-group').forEach(group => {
    const btns  = group.querySelectorAll('.kc-role-btn');
    const input = group.closest('form')?.querySelector('input[name="role"]');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (input) input.value = btn.dataset.role;
        document.querySelectorAll('[data-role-show]').forEach(el => {
          el.style.display = el.dataset.roleShow === btn.dataset.role ? '' : 'none';
        });
      });
    });
  });
}

/* ── Profile Photo Preview ──────────────────────────────── */
function initPhotoPreview() {
  const inp = document.querySelector('input[name="profile_photo"]');
  if (!inp) return;
  inp.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { Toast.error('Please select an image file.'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      document.querySelectorAll('.kc-profile-avatar, .profile-avatar-preview').forEach(el => {
        if (el.tagName === 'IMG') {
          el.src = ev.target.result;
        } else {
          el.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
        }
      });
    };
    reader.readAsDataURL(file);
    Toast.info('Photo selected. Save profile to apply changes.');
  });
}

/* ── Scroll Reveal ──────────────────────────────────────── */
function initScrollReveal() {
  const ob = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('kc-fade-in');
        ob.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.kc-reveal').forEach(el => ob.observe(el));
}

/* ── Counter Animation ──────────────────────────────────── */
function initCounters() {
  const ob = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target._counted) {
        e.target._counted = true;
        const target = parseInt(e.target.dataset.count || 0);
        const suffix = e.target.dataset.suffix || '';
        const dur = 1800;
        const start = performance.now();
        const tick = now => {
          const progress = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          e.target.textContent = Math.floor(eased * target).toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => ob.observe(el));
}

/* ── Progress Bars ──────────────────────────────────────── */
function initProgressBars() {
  const ob = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const bar = e.target.querySelector('.kc-progress-bar, .match-fill');
        if (bar) {
          const pct = bar.dataset.pct || bar.dataset.width || 0;
          setTimeout(() => bar.style.width = pct + '%', 100);
        }
        ob.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.kc-progress, .match-bar').forEach(el => ob.observe(el));
}

/* ── Chat ───────────────────────────────────────────────── */
function initChat() {
  const msgBox = document.getElementById('chat-messages');
  if (msgBox) {
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  // Send on Enter
  const chatInput = document.querySelector('.kc-chat-input');
  const sendBtn   = document.querySelector('.kc-send-btn');
  if (chatInput && sendBtn) {
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendBtn.click(); }
    });
  }

  // Chat list search
  const chatSearch = document.getElementById('chatSearch');
  if (chatSearch) {
    chatSearch.addEventListener('input', () => {
      const q = chatSearch.value.toLowerCase();
      document.querySelectorAll('.kc-chat-item').forEach(item => {
        item.style.display = (item.dataset.name || '').toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  // AJAX polling for new messages
  const pollUrl  = msgBox?.dataset.pollUrl;
  const roomPk   = msgBox?.dataset.roomPk;
  if (pollUrl && roomPk) {
    let lastId = parseInt(msgBox.dataset.lastId || 0);
    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    setInterval(async () => {
      try {
        const res = await fetch(`${pollUrl}?after=${lastId}`);
        if (!res.ok) return;
        const data = await res.json();
        data.messages?.forEach(m => {
          if (!document.querySelector(`[data-msg-id="${m.id}"]`)) {
            appendMsg(m);
            if (m.id > lastId) lastId = m.id;
          }
        });
      } catch (e) {}
    }, 3000);

    function appendMsg(m) {
      const div = document.createElement('div');
      div.dataset.msgId = m.id;
      div.className = `kc-msg ${m.mine ? 'mine' : 'theirs'} d-flex flex-column`;
      div.innerHTML = `
        <div class="kc-msg-bubble">${esc(m.text)}</div>
        <div class="kc-msg-time">${m.time}${m.mine ? ' <i class="bi bi-check2-all" style="color:rgba(255,255,255,.7)"></i>' : ''}</div>
      `;
      msgBox.appendChild(div);
      msgBox.scrollTop = msgBox.scrollHeight;
    }
    function esc(t) {
      return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    }

    // AJAX send (no page reload)
    const form = document.getElementById('chatForm');
    if (form) {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const input = form.querySelector('.kc-chat-input');
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        input.focus();
        try {
          const fd = new FormData();
          fd.append('text', text);
          fd.append('csrfmiddlewaretoken', csrf);
          await fetch(window.location.href, { method: 'POST', body: fd });
          setTimeout(() => {
            fetch(`${pollUrl}?after=${lastId}`)
              .then(r => r.json())
              .then(d => d.messages?.forEach(m => {
                if (!document.querySelector(`[data-msg-id="${m.id}"]`)) {
                  appendMsg(m);
                  if (m.id > lastId) lastId = m.id;
                }
              }));
          }, 200);
        } catch (e) { Toast.error('Failed to send message.'); }
      });
    }
  }
}

/* ── Confirm buttons ────────────────────────────────────── */
function initConfirm() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-confirm]');
    if (btn && !confirm(btn.dataset.confirm)) e.preventDefault();
  });
}

/* ── Character counter ──────────────────────────────────── */
function initCharCounter() {
  document.querySelectorAll('[data-maxchars]').forEach(el => {
    const max = parseInt(el.dataset.maxchars);
    const counter = document.createElement('div');
    counter.style.cssText = 'text-align:right;font-size:.72rem;margin-top:.3rem;';
    counter.style.color = 'var(--muted)';
    el.parentElement.appendChild(counter);
    const update = () => {
      const len = el.value.length;
      counter.textContent = `${len} / ${max}`;
      counter.style.color = len > max * .9 ? 'var(--danger)' : 'var(--muted)';
    };
    el.addEventListener('input', update);
    update();
  });
}

/* ── Live search filter ─────────────────────────────────── */
function initLiveSearch() {
  document.querySelectorAll('[data-live-search]').forEach(input => {
    const target = input.dataset.liveSearch;
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      document.querySelectorAll(`[data-search-parent="${target}"]`).forEach(item => {
        const text = (item.dataset.searchText || item.textContent || '').toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    });
  });
}

/* ── Password strength ──────────────────────────────────── */
function initPasswordStrength() {
  const pwInput = document.querySelector('input[name="new_password"], input[name="password"]');
  const meter   = document.getElementById('pw-strength');
  if (!pwInput || !meter) return;

  pwInput.addEventListener('input', () => {
    const pw = pwInput.value;
    let score = 0;
    if (pw.length >= 8)  score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#e11d48', '#d97706', '#2563eb', '#059669'];
    const widths = ['0%','25%','50%','75%','100%'];

    meter.style.width = widths[score];
    meter.style.background = colors[score];
    const label = document.getElementById('pw-label');
    if (label) { label.textContent = labels[score]; label.style.color = colors[score]; }
  });
}

/* ── Star rating interactive ────────────────────────────── */
function initStarRating() {
  document.querySelectorAll('.star-picker').forEach(group => {
    const stars  = [...group.querySelectorAll('.star')];
    const hidden = group.querySelector('input[type="hidden"]');

    const highlight = n => stars.forEach((s, i) => {
      s.style.color = i < n ? '#f59e0b' : 'var(--muted-light)';
    });

    stars.forEach((star, i) => {
      star.addEventListener('mouseenter', () => highlight(i+1));
      star.addEventListener('mouseleave', () => highlight(parseInt(hidden?.value||0)));
      star.addEventListener('click', () => {
        if (hidden) hidden.value = i+1;
        highlight(i+1);
      });
    });
  });
}

/* ── Tooltip (Bootstrap) ────────────────────────────────── */
function initTooltips() {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    new bootstrap.Tooltip(el, { trigger: 'hover' });
  });
}

/* ── Mobile category hero search ────────────────────────── */
function initHeroSearch() {
  const btn = document.getElementById('heroSearchBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const q   = document.getElementById('heroQuery')?.value?.trim() || '';
    const cat = document.getElementById('heroCat')?.value || '';
    const loc = document.getElementById('heroLoc')?.value?.trim() || '';
    const params = new URLSearchParams();
    if (q)   params.set('search', q);
    if (cat) params.set('category', cat);
    if (loc) params.set('location', loc);
    window.location.href = '/jobs/?' + params.toString();
  });
  ['heroQuery','heroLoc'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') btn.click();
    });
  });
}

/* ── Smooth anchor scrolling ────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ── Auto-close alerts ──────────────────────────────────── */
function initAlerts() {
  document.querySelectorAll('.kc-alert').forEach(el => {
    setTimeout(() => {
      el.style.transition = 'opacity .4s, max-height .4s, padding .4s, margin .4s';
      el.style.opacity = '0'; el.style.maxHeight = '0';
      el.style.padding = '0'; el.style.margin = '0';
      setTimeout(() => el.remove(), 400);
    }, 5500);

    el.querySelector('.btn-close')?.addEventListener('click', () => {
      el.style.transition = 'opacity .25s'; el.style.opacity = '0';
      setTimeout(() => el.remove(), 250);
    });
  });
}

/* ── Number format in stat cards ────────────────────────── */
function initStatTrends() {
  document.querySelectorAll('[data-trend]').forEach(el => {
    const val = parseFloat(el.dataset.trend);
    const icon = val >= 0 ? '↑' : '↓';
    const cls  = val >= 0 ? 'trend-up' : 'trend-down';
    el.innerHTML = `<span class="${cls}">${icon} ${Math.abs(val)}%</span> vs last month`;
  });
}

/* ── INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Toast.init();
  initNavbar();
  initFlashMessages();
  initOTP();
  initUploads();
  initRoleToggle();
  initPhotoPreview();
  initScrollReveal();
  initCounters();
  initProgressBars();
  initChat();
  initConfirm();
  initCharCounter();
  initLiveSearch();
  initPasswordStrength();
  initStarRating();
  initTooltips();
  initHeroSearch();
  initSmoothScroll();
  initAlerts();
  initStatTrends();

  // Theme toggle buttons
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => Theme.toggle());
  });

  // Show page after load (prevents FOUC)
  document.body.style.visibility = 'visible';
});

/* ── Collapsible Sidebar ──────────────────────────────────── */
function initSidebar() {
  const sidebar   = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  if (!sidebar || !toggleBtn) return;

  const COLLAPSED_KEY = 'kc-sidebar-collapsed';
  const isCollapsed = localStorage.getItem(COLLAPSED_KEY) === '1';
  if (isCollapsed) sidebar.classList.add('collapsed');

  toggleBtn.addEventListener('click', () => {
    const collapsed = sidebar.classList.toggle('collapsed');
    localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0');
    toggleBtn.querySelector('i').className = collapsed
      ? 'bi bi-layout-sidebar'
      : 'bi bi-layout-sidebar-reverse';
    // Dispatch resize event so charts re-render if needed
    window.dispatchEvent(new Event('resize'));
  });

  // Show tooltips on collapsed links
  sidebar.querySelectorAll('.sidebar-link').forEach(link => {
    const text = link.querySelector('span')?.textContent?.trim();
    if (text) link.setAttribute('title', text);
    link.addEventListener('mouseenter', () => {
      if (sidebar.classList.contains('collapsed')) {
        link.setAttribute('data-bs-toggle', 'tooltip');
        link.setAttribute('data-bs-placement', 'right');
      } else {
        link.removeAttribute('data-bs-toggle');
      }
    });
  });
}

/* ── Save Job AJAX ────────────────────────────────────────── */
function initSaveJob() {
  document.querySelectorAll('.save-job-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      const url  = btn.dataset.url;
      const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
      if (!url || !csrf) return;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRFToken': csrf },
        });
        const data = await res.json();
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = data.saved ? 'bi bi-bookmark-heart-fill' : 'bi bi-bookmark-heart';
          icon.classList.add('save-animate');
          icon.addEventListener('animationend', () => icon.classList.remove('save-animate'), {once:true});
          icon.style.color = data.saved ? '#f59e0b' : '';
        }
        const text = btn.querySelector('.save-text');
        if (text) text.textContent = data.saved ? 'Saved' : 'Save';
        Toast[data.saved ? 'success' : 'info'](data.msg);
      } catch (e) {
        Toast.error('Failed to save job. Please try again.');
      }
    });
  });
}

/* ── Analytics bars ───────────────────────────────────────── */
function initAnalyticsBars() {
  const bars = document.querySelectorAll('.chart-bar[data-height]');
  if (!bars.length) return;
  const ob = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        bars.forEach(bar => {
          setTimeout(() => { bar.style.height = bar.dataset.height + 'px'; }, 100);
        });
        ob.disconnect();
      }
    });
  });
  const wrap = document.querySelector('.chart-bar-wrap');
  if (wrap) ob.observe(wrap);
}

/* ── Navbar search dropdown ───────────────────────────────── */
function initNavSearch() {
  const inp = document.getElementById('navSearchInput');
  if (!inp) return;
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = inp.value.trim();
      if (q) window.location.href = `/jobs/?search=${encodeURIComponent(q)}`;
    }
  });
}

/* ── Profile tabs ─────────────────────────────────────────── */
function initProfileTabs() {
  const tabs = document.querySelectorAll('.profile-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.querySelectorAll('.profile-tab-content').forEach(el => {
        el.style.display = el.id === target ? '' : 'none';
      });
    });
  });
}

/* ── Resume file name display ─────────────────────────────── */
function initResumeUpload() {
  document.querySelectorAll('input[type="file"][name="resume"]').forEach(inp => {
    inp.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const allowed = ['application/pdf','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
        Toast.error('Please upload PDF, DOC, or DOCX only.');
        inp.value = ''; return;
      }
      if (file.size > 5*1024*1024) { Toast.error('File too large (max 5MB)'); inp.value=''; return; }
      const display = inp.closest('.resume-upload-area') || inp.parentElement;
      const nameEl = display.querySelector('.resume-filename');
      if (nameEl) nameEl.textContent = file.name;
      display.classList.add('has-file');
      Toast.success(`Resume "${file.name}" selected!`);
    });
  });
}

/* ── Notification mark read on click ──────────────────────── */
function initNotifClick() {
  document.querySelectorAll('.notif-item[data-link]').forEach(item => {
    item.addEventListener('click', () => {
      const link = item.dataset.link;
      if (link && link !== '#') window.location.href = link;
    });
  });
}

/* ── Run new inits ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initSaveJob();
  initAnalyticsBars();
  initNavSearch();
  initProfileTabs();
  initResumeUpload();
  initNotifClick();
  initScrollTop();
});

/* ── Scroll to top button ──────────────────────────────────── */
function initScrollTop() {
  // Create button
  const btn = document.createElement('button');
  btn.className = 'kc-scroll-top';
  btn.title = 'Back to top';
  btn.innerHTML = '<i class="bi bi-chevron-up"></i>';
  btn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
