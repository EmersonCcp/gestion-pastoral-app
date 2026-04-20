import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { PersonaService } from '../../../../../../shared/services/persona.service';
import { AlertService } from '../../../../../../shared/services/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { FormularioRelacionModalComponent } from './../formulario-relacion-modal/formulario-relacion-modal.component';
@Component({
  selector: 'app-persona-relaciones',
  templateUrl: './persona-relaciones.component.html',
})
export class PersonaRelacionesComponent implements OnInit {
  @Input() personaId!: number;
  @Input() relaciones: any[] = [];
  @Input() parienteDe: any[] = [];
  @Output() refresh = new EventEmitter<void>();

  loading = false;

  constructor(
    private service: PersonaService,
    private alertService: AlertService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  openVinculoModal() {
    const dialogRef = this.dialog.open(FormularioRelacionModalComponent, {
      width: '500px',
      data: { personaId: this.personaId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refresh.emit();
      }
    });
  }

  eliminarVinculo(id: number) {
    this.alertService.confirmDelete(() => {
      this.alertService.loader();
      this.service.removeRelacion(id).subscribe((res: any) => {
        this.alertService.close();
        if (res.ok) {
          this.alertService.successOrError('Vínculo eliminado');
          this.refresh.emit();
        }
      });
    });
  }

  goToProfile(id: number) {
    this.router.navigate(['/admin/personas/perfil', id]);
  }

  getInverseParentesco(parentesco: string): string {
    const map: any = {
      'PADRE': 'HIJO/A',
      'MADRE': 'HIJO/A',
      'HIJO': 'PADRE/MADRE',
      'HERMANO': 'HERMANO/A',
      'ABUELO': 'NIETO/A',
      'NIETO': 'ABUELO/A',
      'TIO': 'SOBRINO/A',
      'SOBRINO': 'TIO/A',
      'CONYUGE': 'CÓNYUGE',
      'TUTOR': 'PROTEGIDO/A'
    };
    return map[parentesco] || 'PARIENTE';
  }
}
