import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { TipoPersona } from 'src/app/shared/interfaces/entities/persona.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { PersonaService } from 'src/app/shared/services/persona.service';
import { TipoPersonaService } from 'src/app/shared/services/tipo-persona.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DocumentoPersonaService } from 'src/app/shared/services/documento-persona.service';
import { StorageAdapterService } from 'src/app/shared/services/storage-adapter.service';
import { DocumentoPersona } from 'src/app/shared/interfaces/entities/persona.entity';

@Component({
  selector: 'app-formulario-persona',
  templateUrl: './formulario-persona.component.html',
  styleUrls: ['./formulario-persona.component.scss']
})
export class FormularioPersonaComponent implements OnInit {
  loading = false;
  id = 0;
  form: FormGroup;
  disabled = false;
  sigla = 'personas';
  editMode = false;
  tipos: TipoPersona[] = [];

  // Documents
  documentos: DocumentoPersona[] = [];
  loadingDocs = false;
  uploadingDoc = false;

  constructor(
    private service: PersonaService,
    private tipoService: TipoPersonaService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private alertService: AlertService,
    private documentoService: DocumentoPersonaService,
    private storageService: StorageAdapterService
  ) {
    this.form = this.initForm();
  }

  ngOnInit() {
    this.activatedRoute.params.pipe(take(1)).subscribe((param) => {
      this.handleParams(param);
    });
  }

  handleParams(param: any) {
    this.id = Number(param['id']) || 0;
    this.editMode = this.id !== 0;
    const mode = param['mode'];
    this.disabled = mode === 'view';

    if (this.id > 0) {
      this.loadData();
      this.loadDocumentos();
    } else {
      const currentMov = this.authService.getSelectedMovimientoId();
      this.loadTipos(currentMov);
    }

    if (this.disabled) {
      this.form.disable();
    }
  }

  private loadData() {
    this.loading = true;
    this.service.getById(this.id).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        const persona = res.data;
        this.form.patchValue({
          ...persona,
          tipos_personas_ids: persona.tiposPersonas?.map((t: any) => t.id) || []
        });
        this.loadTipos(persona.movimiento_id);
      } else {
        const errorMsg = res?.error?.message || 'Error inesperado';
        this.alertService.successOrError('Ocurrió un error', errorMsg, 'error');
      }
    });
  }

  loadTipos(movimientoId: number | null) {
    if (!movimientoId) return;
    this.loading = true;
    this.tipoService.getAll({ per_page: 100, movimiento_id: movimientoId }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.tipos = res.data;
      }
    });
  }

  loadDocumentos() {
    this.loadingDocs = true;
    this.documentoService.getByPersona(this.id).subscribe((res: any) => {
      this.loadingDocs = false;
      if (res.ok) {
        this.documentos = res.data;
      }
    });
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file || !this.id) return;

    const movId = this.authService.getSelectedMovimientoId();
    if (!movId) return;

    this.uploadingDoc = true;
    this.alertService.loader();

    try {
      // Sanitizar el nombre del archivo (quitar acentos y espacios)
      const cleanName = file.name
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');

      const path = `movimiento_${movId}/personas/${this.id}/documentos/${Date.now()}_${cleanName}`;
      const url = await this.storageService.upload(file, path);

      const docData: any = {
        nombre: file.name,
        url: url,
        path: path,
        tipo: file.type,
        persona_id: this.id,
        movimiento_id: movId
      };

      this.documentoService.create(docData).subscribe((res: any) => {
        this.uploadingDoc = false;
        this.alertService.close();
        if (res.ok) {
          this.alertService.successOrError('Documento subido');
          this.loadDocumentos();
        }
      });
    } catch (error: any) {
      this.uploadingDoc = false;
      this.alertService.close();
      this.alertService.successOrError('Error al subir', error.message, 'error');
    }
  }

  eliminarDocumento(doc: DocumentoPersona) {
    this.alertService.confirmDelete(async () => {
      this.alertService.loader();
      try {
        await this.storageService.delete(doc.path);
        this.documentoService.delete(doc.id).subscribe((res: any) => {
          this.alertService.close();
          if (res.ok) {
            this.alertService.successOrError('Documento eliminado');
            this.loadDocumentos();
          }
        });
      } catch (error: any) {
        this.alertService.close();
        this.alertService.successOrError('Error al eliminar', error.message, 'error');
      }
    });
  }

  initForm() {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.maxLength(100)]],
      documento: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email]],
      telefono: [''],
      direccion: [''],
      genero: [''],
      fecha_nacimiento: [''],
      tipos_personas_ids: [[], [Validators.required, Validators.minLength(1)]],
    });
  }

  goBack() {
    this.router.navigate([`admin/${this.sigla}`]);
  }

  private save(data: any) {
    const request$ =
      this.id === 0
        ? this.service.create(data)
        : this.service.update(this.id, data);

    request$.subscribe({
      next: (res: any) => {
        this.alertService.close();
        if (!res.ok) {
          this.alertService.successOrError(res.error.message, '', 'error');
          return;
        }
        this.alertService.successOrError('Registro guardado');
        this.router.navigate([`admin/${this.sigla}`]);
      },
      error: () => {
        this.alertService.close();
        this.alertService.successOrError('Error inesperado', '', 'error');
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.alertService.loader();
    
    const dto = {
      ...this.form.value,
      fecha_nacimiento: this.form.value.fecha_nacimiento || null,
      tipos_personas_ids: this.form.value.tipos_personas_ids.map(Number)
    };
    
    this.save(dto);
  }

  isTipoSelected(id: number): boolean {
    const selected = this.form.get('tipos_personas_ids')?.value || [];
    return selected.includes(id);
  }

  toggleTipo(id: number) {
    if (this.disabled) return;
    
    const selected = [...(this.form.get('tipos_personas_ids')?.value || [])];
    const index = selected.indexOf(id);
    
    if (index === -1) {
      selected.push(id);
    } else {
      selected.splice(index, 1);
    }
    
    this.form.get('tipos_personas_ids')?.setValue(selected);
    this.form.get('tipos_personas_ids')?.markAsDirty();
  }

  get nombreControl(): FormControl { return this.form.get('nombre') as FormControl; }
  get apellidoControl(): FormControl { return this.form.get('apellido') as FormControl; }
  get documentoControl(): FormControl { return this.form.get('documento') as FormControl; }
  get emailControl(): FormControl { return this.form.get('email') as FormControl; }
  get telefonoControl(): FormControl { return this.form.get('telefono') as FormControl; }
  get direccionControl(): FormControl { return this.form.get('direccion') as FormControl; }
  get generoControl(): FormControl { return this.form.get('genero') as FormControl; }
  get fechaNacimientoControl(): FormControl { return this.form.get('fecha_nacimiento') as FormControl; }
}
