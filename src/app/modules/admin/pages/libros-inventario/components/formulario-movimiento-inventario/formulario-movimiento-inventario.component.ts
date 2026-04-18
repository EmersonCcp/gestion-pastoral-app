import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InventarioService } from 'src/app/shared/services/inventario.service';
import { LibroService } from 'src/app/shared/services/libro.service';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-formulario-movimiento-inventario',
  templateUrl: './formulario-movimiento-inventario.component.html'
})
export class FormularioMovimientoInventarioComponent implements OnInit {
  form!: FormGroup;
  libros: any[] = [];
  loadingLibros = false;
  
  tipos = [
    { label: 'Ingreso (Entrada)', value: 'INGRESO' },
    { label: 'Egreso (Salida)', value: 'EGRESO' }
  ];

  motivosIngreso = [
    { label: 'Compra', value: 'COMPRA' },
    { label: 'Donación', value: 'DONACION' },
    { label: 'Ajuste Manual', value: 'AJUSTE_MANUAL' }
  ];

  motivosEgreso = [
    { label: 'Pérdida', value: 'BAJA_PERDIDA' },
    { label: 'Dañado', value: 'BAJA_DANIADO' },
    { label: 'Transferencia', value: 'TRANSFERENCIA' },
    { label: 'Ajuste Manual', value: 'AJUSTE_MANUAL' }
  ];

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private libroService: LibroService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<FormularioMovimientoInventarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarLibros();
  }

  initForm() {
    this.form = this.fb.group({
      libro_id: [null, Validators.required],
      tipo: ['INGRESO', Validators.required],
      motivo: ['COMPRA', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      observaciones: ['']
    });

    // Cambiar motivos dinámicamente según el tipo
    this.form.get('tipo')?.valueChanges.subscribe(tipo => {
      const motivoControl = this.form.get('motivo');
      if (tipo === 'INGRESO') {
        motivoControl?.setValue('COMPRA');
      } else {
        motivoControl?.setValue('BAJA_PERDIDA');
      }
    });
  }

  cargarLibros() {
    this.loadingLibros = true;
    this.libroService.getAll({ page: 1, per_page: 100 }).subscribe((res:any) => {
      this.loadingLibros = false;
      if (res.ok) this.libros = res.data;
    });
  }

  guardar() {
    if (this.form.invalid) return;

    this.alertService.loader();
    this.inventarioService.registrarMovimiento(this.form.value).subscribe(res => {
      this.alertService.close();
      if (res.ok) {
        this.alertService.successOrError('Movimiento registrado con éxito');
        this.dialogRef.close(true);
      } else {
        this.alertService.successOrError('Error', res.error.message, 'error');
      }
    });
  }

  get motivosActuales() {
    return this.form.get('tipo')?.value === 'INGRESO' ? this.motivosIngreso : this.motivosEgreso;
  }
}
