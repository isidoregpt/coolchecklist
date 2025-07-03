// Enhanced Chore Checklist App with modern features
class ChoreApp {
  constructor() {
    this.chores = [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadFromStorage();
    this.updateUI();
  }

  bindEvents() {
    // Auto-resize textarea
    const textarea = document.getElementById('choreInput');
    textarea.addEventListener('input', this.autoResizeTextarea);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.generateChecklist();
      }
    });

    // Save to localStorage on page unload
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });
  }

  autoResizeTextarea(e) {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(140, textarea.scrollHeight) + 'px';
  }

  generateChecklist() {
    const input = document.getElementById('choreInput').value.trim();
    
    if (!input) {
      this.showNotification('Please enter at least one chore.', 'warning');
      return;
    }

    // Parse chores from input
    const choreTexts = input
      .split('\n')
      .map(item => item.trim().replace(/^[•\-\*]\s*/, '')) // Remove bullet points
      .filter(item => item);

    if (choreTexts.length === 0) {
      this.showNotification('Please enter valid chores.', 'warning');
      return;
    }

    // Create chore objects
    this.chores = choreTexts.map((text, index) => ({
      id: Date.now() + index,
      text: text,
      completed: false,
      createdAt: new Date()
    }));

    this.updateUI();
    this.saveToStorage();
    this.showNotification(`Created ${this.chores.length} chore${this.chores.length > 1 ? 's' : ''}!`, 'success');
    
    // Add subtle animation delay for better UX
    setTimeout(() => {
      document.getElementById('checklistContainer').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 300);
  }

  toggleChore(id) {
    const chore = this.chores.find(c => c.id === id);
    if (chore) {
      chore.completed = !chore.completed;
      chore.completedAt = chore.completed ? new Date() : null;
      this.updateUI();
      this.saveToStorage();
      
      // Haptic feedback for mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      // Show completion celebration
      if (chore.completed && this.getAllCompleted().length === this.chores.length) {
        setTimeout(() => {
          this.showNotification('🎉 All chores completed! Great job!', 'success');
        }, 500);
      }
    }
  }

  removeChore(id) {
    this.chores = this.chores.filter(c => c.id !== id);
    this.updateUI();
    this.saveToStorage();
    this.showNotification('Chore removed', 'info');
  }

  clearAll() {
    if (this.chores.length === 0) {
      this.showNotification('No chores to clear.', 'info');
      return;
    }

    if (confirm('Are you sure you want to clear all chores?')) {
      this.chores = [];
      document.getElementById('choreInput').value = '';
      this.updateUI();
      this.saveToStorage();
      this.showNotification('All chores cleared', 'info');
    }
  }

  updateUI() {
    this.updateChecklist();
    this.updateProgress();
  }

  updateChecklist() {
    const emptyState = document.getElementById('emptyState');
    const checklistContainer = document.getElementById('checklistContainer');
    const choreList = document.getElementById('choreList');

    if (this.chores.length === 0) {
      emptyState.style.display = 'block';
      checklistContainer.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    checklistContainer.style.display = 'block';

    // Render chores
    choreList.innerHTML = this.chores.map(chore => this.createChoreHTML(chore)).join('');

    // Add event listeners
    this.chores.forEach(chore => {
      const choreElement = document.querySelector(`[data-id="${chore.id}"]`);
      if (choreElement) {
        const checkbox = choreElement.querySelector('.chore-checkbox input');
        const removeBtn = choreElement.querySelector('.chore-remove');
        
        checkbox.addEventListener('change', () => this.toggleChore(chore.id));
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeChore(chore.id);
        });
        
        // Make entire item clickable
        choreElement.addEventListener('click', (e) => {
          if (e.target.closest('.chore-remove')) return;
          checkbox.checked = !checkbox.checked;
          this.toggleChore(chore.id);
        });
      }
    });
  }

  createChoreHTML(chore) {
    return `
      <li class="chore-item ${chore.completed ? 'completed' : ''}" data-id="${chore.id}">
        <div class="chore-checkbox">
          <input type="checkbox" ${chore.completed ? 'checked' : ''}>
          <span class="checkmark">✓</span>
        </div>
        <span class="chore-text">${this.escapeHtml(chore.text)}</span>
        <button class="chore-remove" title="Remove chore">×</button>
      </li>
    `;
  }

  updateProgress() {
    if (this.chores.length === 0) return;

    const completed = this.getAllCompleted().length;
    const total = this.chores.length;
    const percentage = Math.round((completed / total) * 100);

    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${completed} of ${total} completed`;
    }
  }

  getAllCompleted() {
    return this.chores.filter(chore => chore.completed);
  }

  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-message">${message}</span>
      <button class="notification-close">×</button>
    `;

    // Add styles
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: this.getNotificationColor(type),
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: '1000',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '300px',
      animation: 'slideInRight 0.3s ease-out'
    });

    // Add animation keyframes
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 16px;
      padding: 0;
      margin-left: 8px;
      opacity: 0.8;
    `;
    
    closeBtn.addEventListener('click', () => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    });

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  }

  getNotificationColor(type) {
    const colors = {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#6366f1'
    };
    return colors[type] || colors.info;
  }

  saveToStorage() {
    try {
      const data = {
        chores: this.chores,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('choreApp', JSON.stringify(data));
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('choreApp');
      if (stored) {
        const data = JSON.parse(stored);
        this.chores = data.chores || [];
        
        // Convert date strings back to Date objects
        this.chores.forEach(chore => {
          if (chore.createdAt) chore.createdAt = new Date(chore.createdAt);
          if (chore.completedAt) chore.completedAt = new Date(chore.completedAt);
        });
      }
    } catch (error) {
      console.warn('Could not load from localStorage:', error);
      this.chores = [];
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Global functions for HTML onclick handlers
function generateChecklist() {
  window.choreApp.generateChecklist();
}

function clearAll() {
  window.choreApp.clearAll();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.choreApp = new ChoreApp();
});

// PWA Support - Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
