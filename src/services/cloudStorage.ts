// Cloud storage service for Netlify
class CloudStorageService {
  private baseUrl: string;
  private userId: string | null = null;

  constructor() {
    this.baseUrl = '/.netlify/functions/api';
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    const url = `${this.baseUrl}/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.userId}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async saveData(collection: string, data: any[]): Promise<void> {
    try {
      // Clear existing data and save new data
      await this.makeRequest(collection, {
        method: 'DELETE',
        body: JSON.stringify({ clearAll: true })
      });

      // Save new data in batches
      for (const item of data) {
        await this.makeRequest(collection, {
          method: 'POST',
          body: JSON.stringify(item)
        });
      }
    } catch (error) {
      console.error(`Failed to save ${collection} to cloud:`, error);
      // Fallback to localStorage
      localStorage.setItem(`bankmate_${collection}`, JSON.stringify(data));
    }
  }

  async loadData(collection: string): Promise<any[]> {
    try {
      const data = await this.makeRequest(collection, { method: 'GET' });
      return data || [];
    } catch (error) {
      console.error(`Failed to load ${collection} from cloud:`, error);
      // Fallback to localStorage
      const fallbackData = localStorage.getItem(`bankmate_${collection}`);
      return fallbackData ? JSON.parse(fallbackData) : [];
    }
  }

  async updateItem(collection: string, id: string, updates: any): Promise<void> {
    try {
      await this.makeRequest(collection, {
        method: 'PUT',
        body: JSON.stringify({ id, ...updates })
      });
    } catch (error) {
      console.error(`Failed to update ${collection} item:`, error);
      throw error;
    }
  }

  async deleteItem(collection: string, id: string): Promise<void> {
    try {
      await this.makeRequest(collection, {
        method: 'DELETE',
        body: JSON.stringify({ id })
      });
    } catch (error) {
      console.error(`Failed to delete ${collection} item:`, error);
      throw error;
    }
  }

  // Sync local data to cloud
  async syncToCloud(): Promise<void> {
    if (!this.userId) return;

    try {
      const collections = ['employees', 'leads', 'branches', 'tasks', 'metaLeads'];
      
      for (const collection of collections) {
        const localData = localStorage.getItem(`bankmate_${collection}`);
        if (localData) {
          const data = JSON.parse(localData);
          await this.saveData(collection, data);
        }
      }
      
      console.log('Data synced to cloud successfully');
    } catch (error) {
      console.error('Failed to sync data to cloud:', error);
    }
  }

  // Sync cloud data to local
  async syncFromCloud(): Promise<void> {
    if (!this.userId) return;

    try {
      const collections = ['employees', 'leads', 'branches', 'tasks', 'metaLeads'];
      
      for (const collection of collections) {
        const cloudData = await this.loadData(collection);
        if (cloudData.length > 0) {
          localStorage.setItem(`bankmate_${collection}`, JSON.stringify(cloudData));
        }
      }
      
      console.log('Data synced from cloud successfully');
    } catch (error) {
      console.error('Failed to sync data from cloud:', error);
    }
  }
}

export const cloudStorage = new CloudStorageService();