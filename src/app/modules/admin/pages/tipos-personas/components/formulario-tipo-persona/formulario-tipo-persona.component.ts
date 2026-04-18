import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TipoPersona } from 'src/app/shared/interfaces/entities/persona.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { TipoPersonaService } from 'src/app/shared/services/tipo-persona.service';

@Component({
  selector: 'app-formulario-tipo-persona',
  templateUrl: './formulario-tipo-persona.component.html',
  styleUrls: ['./formulario-tipo-persona.component.scss']
})
export class FormularioTipoPersonaComponent implements OnInit {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private service: TipoPersonaService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<FormularioTipoPersonaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TipoPersona | null
  ) {
    this.form = this.fb.group({
      nombre: [data?.nombre || '', [Validators.required]],
      descripcion: [data?.descripcion || '']
    });
  }

  ngOnInit(): void {}

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
