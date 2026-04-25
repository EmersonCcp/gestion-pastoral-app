import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { Libro } from 'src/app/shared/interfaces/entities/libro.entity';
import { TipoPersona } from 'src/app/shared/interfaces/entities/persona.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { LibroService } from 'src/app/shared/services/libro.service';
import { TipoPersonaService } from 'src/app/shared/services/tipo-persona.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { StorageAdapterService } from 'src/app/shared/services/storage-adapter.service';

@Component({
  selector: 'app-formulario-libro',
  templateUrl: './formulario-libro.component.html'
})
export class FormularioLibroComponent implements OnInit {
  loading = false;
  id = 0;
  form: FormGroup;
  editMode = false;
  tiposPersonas: TipoPersona[] = [];
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private service: LibroService,
    private tipoPersonaService: TipoPersonaService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private alertService: AlertService,
    private storageService: StorageAdapterService
  ) {
    this.form = this.initForm();
  }

  ngOnInit() {
    this.loadTiposPersonas();
    this.activatedRoute.params.pipe(take(1)).subscribe((param) => {
      this.id = Number(param['id']) || 0;
      this.editMode = this.id !== 0;
      if (this.id > 0) this.loadData();
    });
  }

  private loadData() {
    this.loading = true;
    this.service.getById(this.id).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.form.patchValue(res.data);
      }
    });
  }

  loadTiposPersonas() {
    const movId = this.authService.getSelectedMovimientoId();
    if (!movId) return;
    this.tipoPersonaService.getAll({ per_page: 100, movimiento_id: movId }).subscribe((res: any) => {
      if (res.ok) this.tiposPersonas = res.data;
    });
  }

  initForm() {
    return this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: [''],
      tipo_persona_id: [null, [Validators.required]],
      estado: [true],
      imagen_url: [null]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.alertService.loader();

    try {
      const data = { ...this.form.value };

      if (this.selectedFile) {
        const path = `libros/${Date.now()}_${this.selectedFile.name}`;
        const imageUrl = await this.storageService.upload(this.selectedFile, path);
        data.imagen_url = imageUrl;
      }

      const request$ = this.id === 0 ? this.service.create(data) : this.service.update(this.id, data);

      request$.subscribe((res: any) => {
        this.loading = false;
        this.alertService.close();
        if (res.ok) {
          this.alertService.successOrError('Libro guardado');
          this.router.navigate(['/admin/libros']);
        }
      });
    } catch (error: any) {
      this.loading = false;
      this.alertService.close();
      this.alertService.successOrError('Error al subir la imagen', error.message, 'error');
    }
  }

  goBack() {
    this.router.navigate(['/admin/libros']);
  }
}
