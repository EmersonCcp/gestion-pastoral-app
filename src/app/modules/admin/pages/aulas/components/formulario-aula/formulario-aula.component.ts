import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Aula } from 'src/app/shared/interfaces/entities/aula.entity';
import { Parroquia } from 'src/app/shared/interfaces/entities/parroquia.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AulaService } from 'src/app/shared/services/aula.service';
import { ParroquiaService } from 'src/app/shared/services/parroquia.service';

@Component({
  selector: 'app-formulario-aula',
  templateUrl: './formulario-aula.component.html',
  styleUrls: ['./formulario-aula.component.scss']
})
export class FormularioAulaComponent implements OnInit {
  form: FormGroup;
  loading = false;
  parroquias: Parroquia[] = [];

  constructor(
    private fb: FormBuilder,
    private service: AulaService,
    private parroquiaService: ParroquiaService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<FormularioAulaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Aula | null
  ) {
    this.form = this.fb.group({
      nombre: [data?.nombre || '', [Validators.required]],
      capacidad: [data?.capacidad || null],
      ubicacion: [data?.ubicacion || ''],
      parroquia_id: [data?.parroquia_id || null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadParroquias();
  }

  loadParroquias() {
    this.loading = true;
    this.parroquiaService.getAll({ per_page: 100 }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.parroquias = res.data;
      }
    });
  }

  guardar() {
    if (this.form.invalid) return;

    this.loading = true;
    this.alertService.loader();

    const request$ = this.data
      ? this.service.update(this.data.id, this.form.value)
      : this.service.create(this.form.value);

    request$.subscribe({
      next: (res: any) => {
        this.loading = false;
        this.alertService.close();
        if (res.ok) {
          this.alertService.successOrError('Registro guardado');
          this.dialogRef.close(true);
        } else {
          this.alertService.successOrError('Error', res.error.message, 'error');
        }
      },
      error: () => {
        this.loading = false;
        this.alertService.close();
        this.alertService.successOrError('Error inesperado', '', 'error');
      }
    });
  }

  cerrar() {
    this.dialogRef.close();
  }
}
