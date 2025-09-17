// Modern Loader System for MediVerse AI
class LoaderManager {
  constructor() {
    this.activeLoaders = new Map();
    this.init();
  }

  init() {
    this.addStyles();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .loader-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .loader-overlay.show {
        opacity: 1;
      }

      .loader-content {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 40px;
        text-align: center;
        color: #ffffff;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        transform: scale(0.9);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .loader-overlay.show .loader-content {
        transform: scale(1);
      }

      .loader-spinner {
        width: 60px;
        height: 60px;
        margin: 0 auto 20px;
        position: relative;
      }

      .loader-spinner::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 3px solid rgba(16, 185, 129, 0.2);
        border-top: 3px solid #10b981;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loader-spinner::after {
        content: '';
        position: absolute;
        top: 6px;
        left: 6px;
        width: calc(100% - 12px);
        height: calc(100% - 12px);
        border: 2px solid rgba(16, 185, 129, 0.1);
        border-top: 2px solid #059669;
        border-radius: 50%;
        animation: spin 1.5s linear infinite reverse;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .loader-text {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .loader-subtext {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
      }

      .loader-progress {
        width: 200px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        margin: 20px auto 0;
        overflow: hidden;
      }

      .loader-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #059669);
        border-radius: 2px;
        width: 0%;
        transition: width 0.3s ease;
        animation: progressPulse 2s ease-in-out infinite;
      }

      @keyframes progressPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      /* Inline loaders */
      .inline-loader {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
      }

      .inline-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(16, 185, 129, 0.2);
        border-top: 2px solid #10b981;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      /* Button loaders */
      .btn-loading {
        position: relative;
        pointer-events: none;
        opacity: 0.7;
      }

      .btn-loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 16px;
        height: 16px;
        margin: -8px 0 0 -8px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid #ffffff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .btn-loading .btn-text {
        opacity: 0;
      }

      /* Card skeleton loaders */
      .skeleton-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 20px;
        animation: skeletonPulse 1.5s ease-in-out infinite;
      }

      .skeleton-line {
        height: 12px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        margin-bottom: 12px;
        animation: skeletonPulse 1.5s ease-in-out infinite;
      }

      .skeleton-line.short { width: 60%; }
      .skeleton-line.medium { width: 80%; }
      .skeleton-line.long { width: 100%; }

      @keyframes skeletonPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
  }

  show(text = 'Loading...', subtext = '', progress = null) {
    const id = Date.now().toString();
    
    const overlay = document.createElement('div');
    overlay.className = 'loader-overlay';
    overlay.id = `loader-${id}`;

    const progressHtml = progress !== null ? `
      <div class="loader-progress">
        <div class="loader-progress-bar" style="width: ${progress}%"></div>
      </div>
    ` : '';

    overlay.innerHTML = `
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <div class="loader-text">${text}</div>
        ${subtext ? `<div class="loader-subtext">${subtext}</div>` : ''}
        ${progressHtml}
      </div>
    `;

    document.body.appendChild(overlay);
    
    // Trigger animation
    requestAnimationFrame(() => {
      overlay.classList.add('show');
    });

    this.activeLoaders.set(id, overlay);
    return id;
  }

  updateProgress(id, progress, text = null, subtext = null) {
    const overlay = this.activeLoaders.get(id);
    if (!overlay) return;

    const progressBar = overlay.querySelector('.loader-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (text) {
      const textEl = overlay.querySelector('.loader-text');
      if (textEl) textEl.textContent = text;
    }

    if (subtext) {
      const subtextEl = overlay.querySelector('.loader-subtext');
      if (subtextEl) subtextEl.textContent = subtext;
    }
  }

  hide(id) {
    const overlay = this.activeLoaders.get(id);
    if (!overlay) return;

    overlay.classList.remove('show');
    
    setTimeout(() => {
      if (overlay.parentElement) {
        overlay.parentElement.removeChild(overlay);
      }
      this.activeLoaders.delete(id);
    }, 300);
  }

  hideAll() {
    this.activeLoaders.forEach((overlay, id) => {
      this.hide(id);
    });
  }

  // Utility methods
  showButtonLoader(button) {
    if (!button) return;
    
    button.classList.add('btn-loading');
    const text = button.querySelector('.btn-text') || button;
    if (!button.querySelector('.btn-text')) {
      button.innerHTML = `<span class="btn-text">${button.innerHTML}</span>`;
    }
  }

  hideButtonLoader(button) {
    if (!button) return;
    
    button.classList.remove('btn-loading');
  }

  createInlineLoader(text = 'Loading...') {
    const loader = document.createElement('div');
    loader.className = 'inline-loader';
    loader.innerHTML = `
      <div class="inline-spinner"></div>
      <span>${text}</span>
    `;
    return loader;
  }

  createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.innerHTML = `
      <div class="skeleton-line short"></div>
      <div class="skeleton-line long"></div>
      <div class="skeleton-line medium"></div>
      <div class="skeleton-line long"></div>
    `;
    return card;
  }
}

// Initialize global loader manager
window.Loader = new LoaderManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoaderManager;
}
