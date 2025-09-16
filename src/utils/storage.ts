// Enhanced storage utility with IndexedDB and automatic backup
class PersistentStorage {
  private dbName = 'BankmateDB';
  private version = 2;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('employees')) {
          db.createObjectStore('employees', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('leads')) {
          db.createObjectStore('leads', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('branches')) {
          db.createObjectStore('branches', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('metaLeads')) {
          db.createObjectStore('metaLeads', { keyPath: 'id' });
        }
      };
    });
  }

  async saveData(storeName: string, data: any[]): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Clear existing data
      store.clear();
      
      // Add new data
      data.forEach(item => store.add(item));
      
      transaction.oncomplete = () => {
        // Also backup to localStorage as fallback
        localStorage.setItem(`bankmate_${storeName}`, JSON.stringify(data));
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async loadData(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        let data = request.result;
        
        // If IndexedDB is empty, try to restore from localStorage
        if (data.length === 0) {
          const fallbackData = localStorage.getItem(`bankmate_${storeName}`);
          if (fallbackData) {
            data = JSON.parse(fallbackData);
            // Restore to IndexedDB
            if (data.length > 0) {
              this.saveData(storeName, data);
            }
          }
        }
        
        resolve(data);
      };
      request.onerror = () => {
        // Fallback to localStorage if IndexedDB fails
        const fallbackData = localStorage.getItem(`bankmate_${storeName}`);
        resolve(fallbackData ? JSON.parse(fallbackData) : []);
      };
    });
  }

  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      
      store.put({ key, value, timestamp: Date.now() });
      
      transaction.oncomplete = () => {
        localStorage.setItem(`bankmate_setting_${key}`, JSON.stringify(value));
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async loadSetting(key: string, defaultValue: any = null): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.value);
        } else {
          // Try localStorage fallback
          const fallbackData = localStorage.getItem(`bankmate_setting_${key}`);
          resolve(fallbackData ? JSON.parse(fallbackData) : defaultValue);
        }
      };
      request.onerror = () => {
        const fallbackData = localStorage.getItem(`bankmate_setting_${key}`);
        resolve(fallbackData ? JSON.parse(fallbackData) : defaultValue);
      };
    });
  }

  // Export all data for backup
  async exportAllData(): Promise<string> {
    const allData = {
      employees: await this.loadData('employees'),
      leads: await this.loadData('leads'),
      branches: await this.loadData('branches'),
      tasks: await this.loadData('tasks'),
      timestamp: Date.now(),
      version: this.version
    };
    
    return JSON.stringify(allData, null, 2);
  }

  // Import data from backup
  async importAllData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.employees) await this.saveData('employees', data.employees);
      if (data.leads) await this.saveData('leads', data.leads);
      if (data.branches) await this.saveData('branches', data.branches);
      if (data.tasks) await this.saveData('tasks', data.tasks);
      
      console.log('Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }
}

export const persistentStorage = new PersistentStorage();