// Network detection utility
// Monitors online/offline status

let isOnline = navigator.onLine;
const listeners = new Set<(online: boolean) => void>();

function updateStatus() {
  isOnline = navigator.onLine;
  listeners.forEach(cb => cb(isOnline));
}

// Listen to browser events
window.addEventListener('online', updateStatus);
window.addEventListener('offline', updateStatus);

export const network = {
  isOnline(): boolean {
    return isOnline;
  },

  onStatusChange(callback: (online: boolean) => void): () => void {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  // Debounced check - useful when unsure
  async checkConnection(): Promise<boolean> {
    if (!navigator.onLine) return false;
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      // Try to fetch a small resource (Google favicon or your own endpoint)
      await fetch('https://www.google.com/favicon.ico', {
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      return true;
    } catch {
      return false;
    }
  }
};

export default network;
