import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Persona } from 'src/app/shared/interfaces/entities/persona.entity';
import { AsistenciaService } from 'src/app/shared/services/asistencia.service';
import { PersonaService } from 'src/app/shared/services/persona.service';
import { AsignacionService } from 'src/app/shared/services/asignacion.service';
import { DocumentoPersonaService } from 'src/app/shared/services/documento-persona.service';
import { StorageAdapterService } from 'src/app/shared/services/storage-adapter.service';
import { DocumentoPersona } from 'src/app/shared/interfaces/entities/persona.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-persona-perfil',
  templateUrl: './persona-perfil.component.html',
  styleUrls: ['./persona-perfil.component.scss']
})
export class PersonaPerfilComponent implements OnInit {
  persona: Persona | null = null;
  asistenciasSummary: any[] = [];
  asignaciones: any[] = [];
  loading = false;
  loadingSummary = false;
  loadingAsignaciones = false;
  
  // History table
  history: any[] = [];
  loadingHistory = false;
  historyPage = 1;
  historyPerPage = 10;
  historyTotal = 0;
  
  // Documents
  documentos: DocumentoPersona[] = [];
  loadingDocs = false;
  uploadingDoc = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private personaService: PersonaService,
    private asistenciaService: AsistenciaService,
    private asignacionService: AsignacionService,
    private documentoService: DocumentoPersonaService,
    private storageService: StorageAdapterService,
    private alertService: AlertService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const personaId = +id;
        this.loadPersona(personaId);
        this.loadSummary(personaId);
        this.loadAsignaciones(personaId);
        this.loadHistory(personaId);
        this.loadDocumentos(personaId);
      }
    });
  }

  loadAsignaciones(id: number) {
    this.loadingAsignaciones = true;
    // Assuming we have a way to filter asignaciones by persona_id. 
    // If our current API doesn't support it directly in getAll, we might need a specific endpoint or use a filter.
    // Based on previous work, Personas are related to Asignaciones.
    this.asignacionService.getAll({ persona_id: id }).subscribe((res: any) => {
      this.loadingAsignaciones = false;
      if (res.ok) {
        this.asignaciones = res.data;
      }
    });
  }

  loadPersona(id: number) {
    this.loading = true;
    this.personaService.getById(id).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.persona = res.data;
      }
    });
  }

  loadSummary(id: number) {
    this.loadingSummary = true;
    this.asistenciaService.getPersonaSummary(id).subscribe((res: any) => {
      this.loadingSummary = false;
      if (res.ok) {
        this.asistenciasSummary = res.data;
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.historyTotal / this.historyPerPage);
  }

  loadHistory(id: number, page: number = 1) {
    this.historyPage = page;
    this.loadingHistory = true;
    this.asistenciaService.getPersonaHistory(id, page, this.historyPerPage).subscribe((res: any) => {
      this.loadingHistory = false;
      if (res.ok) {
        this.history = res.data;
        this.historyTotal = res.meta?.paging?.total_items || 0;
      }
    });
  }

  loadDocumentos(id: number) {
    this.loadingDocs = true;
    this.documentoService.getByPersona(id).subscribe((res: any) => {
      this.loadingDocs = false;
      if (res.ok) {
        this.documentos = res.data;
      }
    });
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file || !this.persona) return;

    const movId = this.authService.getSelectedMovimientoId();
    if (!movId) return;

    this.uploadingDoc = true;
    this.alertService.loader();

    try {
      // Sanitizar el nombre del archivo (quitar acentos y espacios)
      const cleanName = file.name
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quita acentos
        .replace(/\s+/g, '_') // Cambia espacios por guiones bajos
        .replace(/[^a-zA-Z0-9._-]/g, ''); // Quita caracteres especiales

      const path = `movimiento_${movId}/personas/${this.persona.id}/documentos/${Date.now()}_${cleanName}`;
      const url = await this.storageService.upload(file, path);

      const docData: Partial<DocumentoPersona> = {
        nombre: file.name,
        url: url,
        path: path,
        tipo: file.type,
        persona_id: this.persona.id,
        movimiento_id: movId
      };

      this.documentoService.create(docData).subscribe((res: any) => {
        this.uploadingDoc = false;
        this.alertService.close();
        if (res.ok) {
          this.alertService.successOrError('Documento subido correctamente');
          this.loadDocumentos(this.persona!.id);
        }
      });

    } catch (error: any) {
      this.uploadingDoc = false;
      this.alertService.close();
      this.alertService.successOrError('Error al subir archivo', error.message, 'error');
    }
  }

  eliminarDocumento(doc: DocumentoPersona) {
    this.alertService.confirmDelete(async () => {
      this.alertService.loader();
      try {
        // 1. Delete from Cloud
        await this.storageService.delete(doc.path);
        
        // 2. Delete from DB
        this.documentoService.delete(doc.id).subscribe((res: any) => {
          this.alertService.close();
          if (res.ok) {
            this.alertService.successOrError('Documento eliminado');
            this.loadDocumentos(this.persona!.id);
          }
        });
      } catch (error: any) {
        this.alertService.close();
        this.alertService.successOrError('Error al eliminar', error.message, 'error');
      }
    });
  }

  onHistoryPageChange(page: number) {
    if (this.persona) {
      this.loadHistory(this.persona.id, page);
    }
  }

  goBack() {
    this.router.navigate(['/admin/personas']);
  }
}
