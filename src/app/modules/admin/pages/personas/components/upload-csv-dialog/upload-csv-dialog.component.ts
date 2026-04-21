import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PersonaService } from 'src/app/shared/services/persona.service';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-upload-csv-dialog',
  templateUrl: './upload-csv-dialog.component.html',
  styles: [`
    .animate-progress-indeterminate {
      width: 50%;
      position: absolute;
      animation: indeterminate 1.5s infinite linear;
    }
    @keyframes indeterminate {
      0% { left: -50%; }
      100% { left: 100%; }
    }
  `]
})
export class UploadCsvDialogComponent {
  selectedFile: File | null = null;
  uploading = false;
  isDragging = false;
  results: { imported: number, failed: number, errors: any[] } | null = null;

  constructor(
    private dialogRef: MatDialogRef<UploadCsvDialogComponent>,
    private service: PersonaService,
    private alertService: AlertService
  ) {}

  close(refresh = false) {
    if (!this.uploading) {
      this.dialogRef.close(refresh);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv' || file.name.endsWith('.csv')) {
      this.selectedFile = file;
    } else {
      this.alertService.successOrError('Tipo de archivo no válido', 'Por favor selecciona un archivo .csv', 'error');
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv')) {
        this.selectedFile = file;
      } else {
        this.alertService.successOrError('Error', 'Solo se permiten archivos .csv', 'error');
      }
    }
  }

  onUpload() {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.service.uploadCsv(this.selectedFile).subscribe({
      next: (res: any) => {
        this.uploading = false;
        if (res.ok) {
          this.results = res.data;
          if (this.results?.failed === 0) {
            this.alertService.successOrError('Éxito', `Se han importado ${res.data.imported} registros correctamente.`, 'success');
            this.close(true);
          }
        } else {
          this.alertService.successOrError('Error en la importación', res.error?.message || 'Ocurrió un error', 'error');
        }
      },
      error: (err) => {
        this.uploading = false;
        this.alertService.successOrError('Error', 'No se pudo conectar con el servidor', 'error');
      }
    });
  }
}
