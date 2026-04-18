import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Persona } from 'src/app/shared/interfaces/entities/persona.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { PersonaService } from 'src/app/shared/services/persona.service';
import { TipoPersonaService } from 'src/app/shared/services/tipo-persona.service';

@Component({
  selector: 'app-listado-personas',
  templateUrl: './listado-personas.component.html',
  styleUrls: ['./listado-personas.component.scss'],
})
export class ListadoPersonasComponent implements OnInit {
  personas: Persona[] = [];
  tiposPersonas: any[] = [];
  per_page = 10;
  page = 1;
  loading = true;
  search = '';
  tipoPersonaSelected: number | null = null;
  total_items = 0;
  total_pages = 0;

  constructor(
    private service: PersonaService,
    private tipoPersonaService: TipoPersonaService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.loadTipos();
  }

  loadTipos() {
    this.tipoPersonaService.getAll().subscribe((res: any) => {
      if (res.ok) {
        this.tiposPersonas = res.data;
      }
    });
  }

  loadData() {
    this.loading = true;
    const query: any = {
      page: this.page,
      per_page: this.per_page,
      nombre: this.search,
    };

    if (this.tipoPersonaSelected) {
      query.tipo_persona_id = this.tipoPersonaSelected;
    }

    this.service.getAll(query).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.personas = res.data;
        this.total_items = res.meta.paging?.total_items || 0;
        this.total_pages = res.meta.paging?.total_pages || 0;
      } else {
        const errorMsg = res?.error?.message || 'Error inesperado';
        this.alertService.successOrError('Ocurrió un error', errorMsg, 'error');
      }
    });
  }

  nextPage() {
    if (this.page < this.total_pages) {
      this.page++;
      this.loadData();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadData();
    }
  }

  private searchTimeout: any;

  onSearchChange(event: any) {
    this.search = event.target.value;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (this.search === '') {
      this.page = 1;
      this.loadData();
      return;
    }

    if (this.search.length < 3) return;

    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.loadData();
    }, 400);
  }

  editar(p: Persona) {
    this.router.navigate([`/admin/personas/${p.id}/edit`]);
  }

  verPerfil(p: Persona) {
    this.router.navigate([`/admin/personas/${p.id}/perfil`]);
  }

  eliminar(persona: Persona) {
    this.alertService.confirmDelete(() => {
      this.alertService.loader();
      this.service.delete(persona.id).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.alertService.successOrError('Éxito', 'Persona eliminada correctamente', 'success');
            this.personas = this.personas.filter((p) => p.id !== persona.id);
          } else {
            this.alertService.successOrError('Error', res.error.message, 'error');
          }
        },
        error: () => {
          this.alertService.successOrError('Error', 'No se pudo eliminar la persona', 'error');
        },
      });
    });
  }
}
