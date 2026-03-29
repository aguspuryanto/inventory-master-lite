// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

// Database Types
export interface DatabaseResult<T = any> {
  data?: T;
  error?: any;
  success: boolean;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// Sync Types
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync?: Date;
  error?: string;
}

// Toast Types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Filter Types
export interface FilterOptions {
  search?: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Pagination Types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Export/Import Types
export interface ImportResult<T = any> {
  data: T[];
  errors: string[];
  totalProcessed: number;
  successCount: number;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeHeaders?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
