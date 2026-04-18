import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Persona } from 'src/app/shared/interfaces/entities/persona.entity';
import { AsistenciaService } from 'src/app/shared/services/asistencia.service';
import { PersonaService } from 'src/app/shared/services/persona.service';
import { AsignacionService } from 'src/app/shared/services/asignacion.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private personaService: PersonaService,
    private asistenciaService: AsistenciaService,
    private asignacionService: AsignacionService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPersona(+id);
      this.loadSummary(+id);
      this.loadAsignaciones(+id);
    }
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

  goBack() {
    this.router.navigate(['/admin/personas']);
  }
}
