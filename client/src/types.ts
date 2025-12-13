export type ApiResponse<T> = { success: boolean; data?: T; error?: string };

export type Project = {
  id: string;
  name: string;
  description?: string;
  issuer?: string;
  issueDate?: string;
  qrX?: number;
  qrY?: number;
  templateUrl?: string;
  createdAt?: string;
};

export type Batch = {
  id: string;
  projectId: string;
  zipFileUrl?: string | null;
  validationStatus: 'VALID' | 'INVALID';
  processingStatus: 'NOT_STARTED' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRecords?: number | null;
  validRecords?: number | null;
  processedCount?: number | null;
  successCount?: number | null;
  failedCount?: number | null;
  queuedAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  validationErrors?: any[] | null;
  missingFilesCount?: number | null;
  extraFilesCount?: number | null;
  duplicateFilesCount?: number | null;
};

export type Certificate = {
  id: string;
  excelCertId: string;
  fileName: string;
  status: 'PENDING' | 'ISSUED' | 'FAILED';
  finalPdfUrl?: string | null;
  validationError?: string | null;
  processedAt?: string | null;
};
