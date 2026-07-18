import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AsistenciaService } from 'src/app/shared/services/asistencia.service';
import { PeriodoService } from 'src/app/shared/services/periodo.service';
import { GrupoService } from 'src/app/shared/services/grupo.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-escanear-planilla',
  templateUrl: './escanear-planilla.component.html',
  styleUrls: ['./escanear-planilla.component.scss'],
})
export class EscanearPlanillaComponent implements OnInit {
  periodos: any[] = [];
  grupos: any[] = [];

  periodo_id: number | null = null;
  grupo_id: number | null = null;

  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;

  scanning = false;
  saving = false;

  fechas: string[] = [];
  fechasSeleccionadas: Set<string> = new Set<string>();
  alumnosAsistencias: any[] = [];

  constructor(
    private asistenciaService: AsistenciaService,
    private periodoService: PeriodoService,
    private grupoService: GrupoService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPeriodos();
    this.loadGrupos();
  }

  loadPeriodos() {
    this.periodoService.getAll().subscribe((res: any) => {
      if (res.ok) this.periodos = res.data;
    });
  }

  loadGrupos() {
    const movId = this.authService.getSelectedMovimientoId();
    if (!movId) return;
    this.grupoService.getAll({ movimiento_id: movId }).subscribe((res: any) => {
      if (res.ok) this.grupos = res.data;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput() {
    document.getElementById('fileInput')?.click();
  }

  escanear() {
    if (!this.periodo_id || !this.grupo_id || !this.selectedFile) {
      this.alertService.successOrError('Atención', 'Por favor selecciona Período, Grupo y carga una foto de la planilla.', 'warning');
      return;
    }

    this.scanning = true;
    this.alertService.loader();

    const formData = new FormData();
    formData.append('periodo_id', this.periodo_id.toString());
    formData.append('grupo_id', this.grupo_id.toString());
    formData.append('file', this.selectedFile);

    this.asistenciaService.scanPlanilla(formData).subscribe({
      next: (res: any) => {
        this.scanning = false;
        this.alertService.close();
        if (res.ok) {
          this.fechas = res.data.fechas_detectadas || [];
          this.fechasSeleccionadas = new Set<string>(this.fechas);
          this.alumnosAsistencias = res.data.asistencias || [];
          this.alertService.successOrError('Éxito', 'Planilla escaneada correctamente. Por favor verifica los datos.', 'success');
        } else {
          this.alertService.successOrError('Error', res.error?.message || 'Error al escanear', 'error');
        }
      },
      error: (err: any) => {
        this.scanning = false;
        this.alertService.close();
        this.alertService.successOrError('Error', err?.error?.error?.message || 'Error de conexión con el servidor', 'error');
      }
    });
  }

  toggleAsistencia(alumno: any, fecha: string) {
    const estados: ('PRESENTE' | 'AUSENTE' | 'JUSTIFICADO' | 'VACIO')[] = ['PRESENTE', 'AUSENTE', 'JUSTIFICADO', 'VACIO'];
    const actual = alumno.asistencias[fecha] || 'VACIO';
    const nextIndex = (estados.indexOf(actual) + 1) % estados.length;
    alumno.asistencias[fecha] = estados[nextIndex];
  }

  toggleFechaSeleccionada(fecha: string) {
    if (this.fechasSeleccionadas.has(fecha)) {
      this.fechasSeleccionadas.delete(fecha);
    } else {
      this.fechasSeleccionadas.add(fecha);
    }
  }

  guardar() {
    if (!this.periodo_id || !this.grupo_id || this.alumnosAsistencias.length === 0) return;

    this.saving = true;
    this.alertService.loader();

    const movId = this.authService.getSelectedMovimientoId() || 0;

    const lote = Array.from(this.fechasSeleccionadas).map(fecha => {
      const asistenciasFecha = this.alumnosAsistencias
        .filter(a => a.persona_id !== null && a.asistencias[fecha] !== 'VACIO')
        .map(a => ({
          persona_id: a.persona_id,
          estado: a.asistencias[fecha]
        }));
      return {
        fecha,
        asistencias: asistenciasFecha
      };
    });

    const payload = {
      periodo_id: this.periodo_id,
      grupo_id: this.grupo_id,
      movimiento_id: movId,
      lote
    };

    this.asistenciaService.guardarLote(payload).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.alertService.close();
        if (res.ok) {
          this.alertService.successOrError('Éxito', 'Asistencias guardadas correctamente.', 'success');
          this.router.navigate(['/admin/asistencias']);
        } else {
          this.alertService.successOrError('Error', res.error?.message || 'Error al guardar', 'error');
        }
      },
      error: () => {
        this.saving = false;
        this.alertService.close();
        this.alertService.successOrError('Error', 'No se pudo guardar el lote de asistencias', 'error');
      }
    });
  }

  volver() {
    this.router.navigate(['/admin/asistencias']);
  }
}
