import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InventarioService } from 'src/app/shared/services/inventario.service';
import { LibroService } from 'src/app/shared/services/libro.service';
import { PersonaService } from 'src/app/shared/services/persona.service';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-formulario-asignacion-libro',
  templateUrl: './formulario-asignacion-libro.component.html'
})
export class FormularioAsignacionLibroComponent implements OnInit {
  form!: FormGroup;
  libros: any[] = [];
  personas: any[] = [];
  loading = false;

  tipos = [
    { label: 'Venta', value: 'VENTA' },
    { label: 'Préstamo', value: 'PRESTAMO' }
  ];

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private libroService: LibroService,
    private personaService: PersonaService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<FormularioAsignacionLibroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarDatos();
  }

  initForm() {
    this.form = this.fb.group({
      libro_id: [null, Validators.required],
      persona_id: [null, Validators.required],
      tipo: ['PRESTAMO', Validators.required],
      fecha_entrega: [new Date().toISOString().split('T')[0], Validators.required],
      fecha_devolucion_esperada: [null],
      observaciones: ['']
    });

    // Validar fecha de devolución solo para préstamos
    this.form.get('tipo')?.valueChanges.subscribe(tipo => {
      const devControl = this.form.get('fecha_devolucion_esperada');
      if (tipo === 'PRESTAMO') {
        devControl?.setValidators([Validators.required]);
      } else {
        devControl?.clearValidators();
      }
      devControl?.updateValueAndValidity();
    });
  }

  cargarDatos() {
    this.loading = true;
    
    // Cargar libros con stock
    this.libroService.getAll({ page: 1, per_page: 100 }).subscribe((res: any) => {
      if (res.ok) this.libros = res.data.filter((l: any) => l.stock_actual > 0);
    });

    // Cargar personas para el select
    this.personaService.getAll({ page: 1, per_page: 200 }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.personas = res.data.map((p: any) => ({
          ...p,
          nombre_completo: `${p.apellido}, ${p.nombre}`
        }));
      }
    });
  }

  guardar() {
    if (this.form.invalid) return;

    this.alertService.loader();
    this.inventarioService.asignarLibro(this.form.value).subscribe(res => {
      this.alertService.close();
      if (res.ok) {
        this.alertService.successOrError('Libro asignado con éxito');
        this.dialogRef.close(true);
      } else {
        this.alertService.successOrError('Error', res.error.message, 'error');
      }
    });
  }
}
