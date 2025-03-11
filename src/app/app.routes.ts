import { Routes } from '@angular/router';
import { DocumentListComponent } from './pages/document-list/document-list.component';
import { DocumentSearchComponent } from './pages/document-search/document-search.component';

export const routes: Routes = [
  { path: '', redirectTo: 'documents', pathMatch: 'full' },
    { path: 'documents', component: DocumentListComponent },
  { path: 'search', component: DocumentSearchComponent }
];
