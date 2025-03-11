import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.model';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatPaginatorModule
  ],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.css'
})
export class DocumentListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Document>([]);
  displayedColumns: string[] = ['documentId', 'name', 'originalFileName', 'processedAt', 'status', 'actions'];
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private documentService: DocumentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngAfterViewInit(): void {
    // This is the crucial part - it must come after data is loaded
    // Otherwise, the paginator won't recognize the data properly
    this.dataSource.paginator = this.paginator;
  }

  loadDocuments(): void {
    this.loading = true;
    this.documentService.getDocuments().subscribe({
      next: (documents) => {
        // Set the data
        this.dataSource.data = documents;

        // Set the paginator after data is loaded
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching documents', error);
        this.snackBar.open('Error loading documents', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  deleteDocument(id: number): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.loading = true;
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.snackBar.open('Document deleted successfully', 'Close', { duration: 3000 });
          this.loadDocuments();
        },
        error: (error) => {
          console.error('Error deleting document', error);
          this.snackBar.open('Error deleting document', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
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

  getStatusText(valid: boolean): string {
    return valid ? 'Valid' : 'Invalid';
  }
}
