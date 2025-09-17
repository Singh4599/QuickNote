// Modern Toast Notification System for MediVerse AI
class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.init();
  }

  init() {
    // Create toast container
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);

    // Add CSS styles
    this.addStyles();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      }

      .toast {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 16px 20px;
        min-width: 300px;
        max-width: 400px;
        color: #ffffff;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        pointer-events: auto;
        position: relative;
        overflow: hidden;
      }

      .toast.show {
        transform: translateX(0);
        opacity: 1;
      }

      .toast.hide {
        transform: translateX(100%);
        opacity: 0;
      }

      .toast::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #10b981, #059669);
        animation: toastProgress 5s linear;
      }

      .toast.success::before {
        background: linear-gradient(90deg, #10b981, #059669);
      }

      .toast.error::before {
        background: linear-gradient(90deg, #ef4444, #dc2626);
      }

      .toast.warning::before {
        background: linear-gradient(90deg, #f59e0b, #d97706);
      }

      .toast.info::before {
        background: linear-gradient(90deg, #3b82f6, #2563eb);
      }

      @keyframes toastProgress {
        from { width: 100%; }
        to { width: 0%; }
      }

      .toast-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        font-weight: 600;
      }

      .toast-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .toast-close:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
      }

      .toast-body {
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.4;
      }

      @media (max-width: 480px) {
        .toast-container {
          left: 20px;
          right: 20px;
          top: 20px;
        }
        
        .toast {
          min-width: auto;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  show(message, type = 'info', duration = 5000) {
    const toast = this.createToast(message, type, duration);
    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto remove
    setTimeout(() => {
      this.hide(toast);
    }, duration);

    return toast;
  }

  createToast(message, type, duration) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    };

    toast.innerHTML = `
      <div class="toast-header">
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <span>${titles[type] || titles.info}</span>
      </div>
      <div class="toast-body">${message}</div>
      <button class="toast-close" onclick="window.Toast.hide(this.parentElement)">×</button>
    `;

    return toast;
  }

  hide(toast) {
    if (!toast || !toast.parentElement) return;

    toast.classList.remove('show');
    toast.classList.add('hide');

    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 400);
  }

  success(message, duration = 5000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 7000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 6000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 5000) {
    return this.show(message, 'info', duration);
  }

  clear() {
    this.toasts.forEach(toast => this.hide(toast));
  }
}

// Initialize global toast manager
window.Toast = new ToastManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToastManager;
}
