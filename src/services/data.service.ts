// Data Service - Handles export/import of subscription data
import { Subscription } from '../types/subscription';

export const DataService = {
  exportData: async (subscriptions: Subscription[]): Promise<void> => {
    try {
      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        subscriptions,
      };
      
      // In a real app, this would use Share API or file system
      console.log('Exported data:', JSON.stringify(exportData, null, 2));
      return Promise.resolve();
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  },

  importData: async (data: string): Promise<Subscription[]> => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.subscriptions || !Array.isArray(parsed.subscriptions)) {
        throw new Error('Invalid data format');
      }
      return parsed.subscriptions;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  },
};
