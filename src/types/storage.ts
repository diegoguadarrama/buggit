export interface StorageUsage {
  total_size: number;
  file_count: number;
  last_updated: string;
}

export interface StorageUsageHistory {
  id: string;
  user_id: string;
  total_size: number;
  file_count: number;
  recorded_at: string;
}
