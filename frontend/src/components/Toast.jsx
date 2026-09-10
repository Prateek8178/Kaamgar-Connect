// Toast utility — plain JS object, no React hooks needed

let toastCounter = 0;

const Toast = {
  _container: null,
  _getContainer() {
    if (!this._container) {
      this._container = document.getElementById('toastContainer');
    }
    return this._container;
  },
  _show(message, type = 'info', duration = 4000) {
    const container = this._getContainer();
    if (!container) return;

    const id = `toast-${++toastCounter}`;
    const icons = { success: 'check-circle-fill', error: 'x-circle-fill', warning: 'exclamation-triangle-fill', info: 'info-circle-fill' };
    const colors = { success: '#059669', error: '#e11d48', warning: '#f59e0b', info: '#4f46e5' };

    const toast = document.createElement('div');
    toast.id = id;
    toast.className = 'kc-toast';
    toast.style.cssText = `
      display:flex;align-items:center;gap:12px;padding:14px 18px;
      background:var(--surface,#fff);border:1px solid var(--border,#e4e4e8);
      border-left:4px solid ${colors[type]};border-radius:12px;
      box-shadow:0 8px 24px rgba(0,0,0,.12);margin-bottom:8px;
      max-width:380px;min-width:260px;animation:slideInRight .3s ease;
      font-family:var(--font,'DM Sans',sans-serif);font-size:.9rem;
    `;
    toast.innerHTML = `
      <i class="bi bi-${icons[type]}" style="color:${colors[type]};font-size:1.1rem;flex-shrink:0;"></i>
      <span style="flex:1;color:var(--text-primary,#111)">${message}</span>
      <button onclick="document.getElementById('${id}').remove()" style="background:none;border:none;cursor:pointer;color:var(--text-tertiary,#888);padding:0;font-size:1.1rem;">×</button>
    `;

    container.appendChild(toast);
    setTimeout(() => { if (document.getElementById(id)) document.getElementById(id).remove(); }, duration);
  },
  success(msg, dur) { this._show(msg, 'success', dur); },
  error(msg, dur) { this._show(msg, 'error', dur); },
  warning(msg, dur) { this._show(msg, 'warning', dur); },
  info(msg, dur) { this._show(msg, 'info', dur); },
};

// Make Toast globally accessible (for main.js compatibility)
window.Toast = Toast;

export default Toast;
