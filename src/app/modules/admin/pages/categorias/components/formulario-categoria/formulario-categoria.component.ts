import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ICreateCategoriaDto } from 'src/app/shared/interfaces/dtos/create-categoria.dto';
import { ICategoria } from 'src/app/shared/interfaces/entities/categoria.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CategoriaService } from 'src/app/shared/services/categoria.service';

@Component({
  selector: 'app-formulario-categoria',
  templateUrl: './formulario-categoria.component.html',
  styleUrls: ['./formulario-categoria.component.scss'],
})
export class FormularioCategoriaComponent {
  form!: FormGroup;
  @Input() categoria!: ICategoria;
  @Output() saved = new EventEmitter<void>();
  @Input() loading = false;

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private categoriaService: CategoriaService,
    private dialogRef: MatDialogRef<FormularioCategoriaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ICategoria | null,
  ) { }

  ngOnInit(): void {
    this.form = this.initForm(this.data || null);
    this.loading = true;
  }

  initForm(data?: ICategoria | null) {
    return this.fb.group({
      nombre: [data?.nombre, Validators.required],
      estado: [data?.estado ?? true, Validators.required],
    });
  }

  get nombreControl(): FormControl {
    return this.form.get('nombre') as FormControl;
  }

  get estadoControl(): FormControl {
    return this.form.get('estado') as FormControl;
  }



  guardar() {
    if (this.form.invalid) return;

    this.alertService.loader();

    const dto: ICreateCategoriaDto = {
      ...this.form.value,
    };

    if (this.data) {
      this.categoriaService.update(this.data.id, dto).subscribe((res) => {
        this.alertService.close();
        if (res.ok) {
          this.dialogRef.close(res.data);

          this.alertService.successOrError(
            'Operación exitosa',
            'Registro guardado',
            'success',
          );
        } else {
          const errorMsg = res?.error.message || res?.error?.message || res?.error.code || 'Error inesperado';
          if (this.alertService) {
            this.alertService.successOrError('Ocurrió un error', errorMsg, 'error');
          } else {
            console.error('API Error:', errorMsg);
          }
        }
      });
    } else {
      this.categoriaService.create(dto).subscribe((res) => {
        this.alertService.close();
        if (res.ok) {
          this.dialogRef.close(res.data);

          this.alertService.successOrError(
            'Operación exitosa',
            'Registro guardado',
            'success',
          );
        } else {
          const errorMsg = res?.error.message || res?.error?.message || res?.error.code || 'Error inesperado';
          if (this.alertService) {
            this.alertService.successOrError('Ocurrió un error', errorMsg, 'error');
          } else {
            console.error('API Error:', errorMsg);
          }
        }
      });
    }
  }

  cerrar() {
    this.dialogRef.close();
  }
}
