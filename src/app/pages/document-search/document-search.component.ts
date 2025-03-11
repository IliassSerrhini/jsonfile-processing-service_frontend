import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.model';

@Component({
  selector: 'app-document-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSnackBarModule
  ],
  templateUrl: './document-search.component.html',
  styleUrl: './document-search.component.css'
})
export class DocumentSearchComponent implements OnInit, AfterViewInit {
  // Search parameters
  searchQuery: string = '';
  showFilters: boolean = false;
  statusFilter: string = '';
  fileTypeFilter: string = '';

  // Data storage and results
  allDocuments: Document[] = []; // Store all documents
  searchResults: Document[] = [];
  hasSearched: boolean = false;
  loading: boolean = false;

  // Table data
  dataSource = new MatTableDataSource<Document>([]);
  displayedColumns: string[] = ['documentId', 'name', 'originalFileName', 'processedAt', 'status', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private documentService: DocumentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Load all documents at startup
    this.loadAllDocuments();
  }

  ngAfterViewInit(): void {
    // Connect paginator
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  loadAllDocuments(): void {
    this.loading = true;

    this.documentService.getDocuments().subscribe({
      next: (documents) => {
        this.allDocuments = documents;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading documents', error);
        this.snackBar.open('Error loading documents', 'OK', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  search(): void {
    this.hasSearched = true;
    this.loading = true;

    // Apply client-side filtering
    this.searchResults = this.allDocuments.filter(doc => {
      // Text search (case-insensitive)
      if (this.searchQuery && !this.matchesText(doc, this.searchQuery)) {
        return false;
      }

      // Status filter
      if (this.statusFilter === 'valid' && !doc.valid) {
        return false;
      }

      if (this.statusFilter === 'invalid' && doc.valid) {
        return false;
      }

      // File type filter
      if (this.fileTypeFilter && doc.originalFileName &&
        !doc.originalFileName.toLowerCase().endsWith(this.fileTypeFilter)) {
        return false;
      }

      return true;
    });

    // Update data source
    this.dataSource.data = this.searchResults;

    // Reconnect paginator
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      this.loading = false;
    });
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.fileTypeFilter = '';
  }

  downloadDocument(document: Document): void {
    this.loading = true;
    this.documentService.downloadDocument(document.minioObjectName).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.originalFileName;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error downloading document', error);
        this.snackBar.open('Error downloading document', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  highlightMatch(text: string): string {
    if (!this.searchQuery || !text) {
      return text;
    }

    const escapedQuery = this.escapeRegExp(this.searchQuery);
    const regex = new RegExp(escapedQuery, 'gi');
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
  }

  private matchesText(doc: Document, query: string): boolean {
    const queryLower = query.toLowerCase();

    // Check if any of the document's text fields contain the query
    return <boolean>(
      (doc.documentId && doc.documentId.toLowerCase().includes(queryLower)) ||
      (doc.name && doc.name.toLowerCase().includes(queryLower)) ||
      (doc.originalFileName && doc.originalFileName.toLowerCase().includes(queryLower))
    );
  }

  // Helper to escape special characters in the search query for RegExp
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
