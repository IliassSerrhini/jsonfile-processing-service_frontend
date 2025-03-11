export interface Document {
  id?: number;
  documentId: string;
  name: string;
  content: string;
  originalFileName: string;
  minioObjectName: string;
  processedAt: Date;
  valid: boolean;
}

export interface DocumentPage {
  content: Document[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
