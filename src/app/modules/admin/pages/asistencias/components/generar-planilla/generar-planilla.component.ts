import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Grupo } from 'src/app/shared/interfaces/entities/grupo.entity';
import { Periodo } from 'src/app/shared/interfaces/entities/periodo.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AsistenciaService } from 'src/app/shared/services/asistencia.service';
import { GrupoService } from 'src/app/shared/services/grupo.service';
import { PeriodoService } from 'src/app/shared/services/periodo.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-generar-planilla',
  templateUrl: './generar-planilla.component.html',
  styleUrls: ['./generar-planilla.component.scss']
})
export class GenerarPlanillaComponent implements OnInit {
  periodos: Periodo[] = [];
  grupos: Grupo[] = [];
  planillaLoading = false;
  planillaData: any = null;
  
  planillaDto = {
    periodo_id: null as number | null,
    grupo_id: null as number | null,
    fecha_inicio: '',
    fecha_fin: ''
  };

  // Checkbox selection for preview
  selectedParticipantIds = new Set<number>();
  selectedFechas = new Set<string>();
  todasFechasSeleccionadas = true;

  // Additional empty rows for manual input
  cantFilasVacias = 0;
  filasVaciasData: { nombre_completo: string }[] = [];
  modoEdicion = true;

  actualizarFilasVacias() {
    const cant = Math.max(0, Number(this.cantFilasVacias) || 0);
    while (this.filasVaciasData.length < cant) {
      this.filasVaciasData.push({ nombre_completo: '' });
    }
    if (this.filasVaciasData.length > cant) {
      this.filasVaciasData = this.filasVaciasData.slice(0, cant);
    }
  }

  toggleModoEdicion() {
    this.modoEdicion = !this.modoEdicion;
  }

  onNombreCompletoChange(alumno: any, value: string) {
    const parts = value.trim().split(/\s+/);
    alumno.nombre = parts[0] || '';
    alumno.apellido = parts.slice(1).join(' ') || '';
  }

  onFechaCambiada(indice: number, nuevaFecha: string) {
    const fechas = this.planillaData.fechas;
    const viejaFecha = fechas[indice];
    if (viejaFecha === nuevaFecha || !nuevaFecha) return;

    fechas[indice] = nuevaFecha;

    if (this.planillaData.alumnos) {
      for (const a of this.planillaData.alumnos) {
        if (a.asistencias && viejaFecha in a.asistencias) {
          a.asistencias[nuevaFecha] = a.asistencias[viejaFecha];
          delete a.asistencias[viejaFecha];
        }
      }
    }

    if (this.selectedFechas.has(viejaFecha)) {
      this.selectedFechas.delete(viejaFecha);
      this.selectedFechas.add(nuevaFecha);
    }
  }

  constructor(
    private service: AsistenciaService,
    private periodoService: PeriodoService,
    private grupoService: GrupoService,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.planillaDto.fecha_inicio = dayjs().startOf('year').format('YYYY-MM-DD');
    this.planillaDto.fecha_fin = dayjs().endOf('year').format('YYYY-MM-DD');
    this.loadCatalogs();
  }

  loadCatalogs() {
    const movId = this.authService.getSelectedMovimientoId();
    if (!movId) return;

    this.periodoService.getAll({ per_page: 100, movimiento_id: movId }).subscribe((res: any) => {
      if (res.ok) this.periodos = res.data;
    });
    this.grupoService.getAll({ per_page: 200, movimiento_id: movId }).subscribe((res: any) => {
      if (res.ok) this.grupos = res.data.filter((g: any) => g.parent_id !== null);
    });
  }

  generarPlanilla() {
    if (!this.planillaDto.periodo_id) {
      this.alertService.successOrError('Debes seleccionar un período');
      return;
    }
    if (!this.planillaDto.grupo_id) {
      this.alertService.successOrError('Debes seleccionar un grupo');
      return;
    }
    if (!this.planillaDto.fecha_inicio || !this.planillaDto.fecha_fin) {
      this.alertService.successOrError('Debes seleccionar un rango de fechas válido');
      return;
    }

    this.planillaLoading = true;
    const params = {
      periodo_id: Number(this.planillaDto.periodo_id),
      grupo_id: Number(this.planillaDto.grupo_id),
      fecha_inicio: this.planillaDto.fecha_inicio,
      fecha_fin: this.planillaDto.fecha_fin
    };

    this.service.getReportePlanilla(params).subscribe({
      next: (res: any) => {
        this.planillaLoading = false;
        if (res.ok) {
          this.planillaData = res.data;
          this.actualizarFilasVacias();
          // By default, select all participants and all dates
          this.selectedParticipantIds.clear();
          if (this.planillaData.alumnos) {
            this.planillaData.alumnos.forEach((a: any) => {
              this.selectedParticipantIds.add(a.id);
            });
          }
          this.selectedFechas.clear();
          if (this.planillaData.fechas) {
            this.planillaData.fechas.forEach((f: string) => this.selectedFechas.add(f));
          }
          this.todasFechasSeleccionadas = true;
        } else {
          this.alertService.successOrError(res.message || 'Error al generar la planilla', '', 'error');
        }
      },
      error: () => {
        this.planillaLoading = false;
        this.alertService.successOrError('Error de conexión con el servidor', '', 'error');
      }
    });
  }

  // Date selection helpers
  toggleFecha(fecha: string) {
    if (this.selectedFechas.has(fecha)) {
      this.selectedFechas.delete(fecha);
    } else {
      this.selectedFechas.add(fecha);
    }
    this.todasFechasSeleccionadas = this.selectedFechas.size === this.planillaData.fechas.length;
  }

  isFechaSelected(fecha: string): boolean {
    return this.selectedFechas.has(fecha);
  }

  toggleTodasFechas() {
    this.todasFechasSeleccionadas = !this.todasFechasSeleccionadas;
    if (this.todasFechasSeleccionadas) {
      this.planillaData.fechas.forEach((f: string) => this.selectedFechas.add(f));
    } else {
      this.selectedFechas.clear();
    }
  }

  getFechasFiltradas(): string[] {
    return (this.planillaData?.fechas || []).filter((f: string) => this.selectedFechas.has(f));
  }

  // Selection helpers
  toggleParticipant(id: number) {
    if (this.selectedParticipantIds.has(id)) {
      this.selectedParticipantIds.delete(id);
    } else {
      this.selectedParticipantIds.add(id);
    }
  }

  isParticipantSelected(id: number): boolean {
    return this.selectedParticipantIds.has(id);
  }

  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedParticipantIds.clear();
    } else {
      if (this.planillaData && this.planillaData.alumnos) {
        this.planillaData.alumnos.forEach((a: any) => {
          this.selectedParticipantIds.add(a.id);
        });
      }
    }
  }

  isAllSelected(): boolean {
    if (!this.planillaData || !this.planillaData.alumnos || this.planillaData.alumnos.length === 0) {
      return false;
    }
    return this.selectedParticipantIds.size === this.planillaData.alumnos.length;
  }

  descargarPlanillaPdf() {
    if (!this.planillaData) return;
    
    // Filter to only checked participants
    const filteredAlumnos = this.planillaData.alumnos.filter((a: any) => this.selectedParticipantIds.has(a.id));
    if (filteredAlumnos.length === 0) {
      this.alertService.successOrError('Debes seleccionar al menos un participante para exportar');
      return;
    }

    const data = {
      ...this.planillaData,
      alumnos: filteredAlumnos
    };
    
    // Configuración A4 Horizontal (Landscape)
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Logo o detalles superiores
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(data.parroquia.toUpperCase(), 148, 14, { align: 'center' });
    
    doc.setFontSize(9);
    doc.text(`ETAPA: ${(data.movimiento || '').toUpperCase()} ${(data.grupo || '').toUpperCase()}`, 16, 24);
    doc.text(`CATEQUISTA: ${(data.catequistas || '').toUpperCase()}`, 16, 29);
    
    doc.text(`SALON Nº ${(data.salon || '').toUpperCase()}`, 280, 24, { align: 'right' });
    doc.text(`AÑO ${(data.anio || '').toUpperCase()}`, 280, 29, { align: 'right' });

    // Only include selected dates
    const fechasFiltradas = this.getFechasFiltradas();
    if (fechasFiltradas.length === 0) {
      this.alertService.successOrError('Debes seleccionar al menos una fecha para exportar');
      return;
    }

    // Cabecera de la tabla
    const head = [[
      'N°',
      'NOMBRE Y APELLIDO',
      ...fechasFiltradas.map((f: string) => dayjs(f).format('DD/MM'))
    ]];

    // Filas de alumnos
    const body = data.alumnos.map((a: any, index: number) => {
      const row = [
        (index + 1).toString(),
        `${a.nombre.toUpperCase()} ${a.apellido.toUpperCase()}`
      ];
      fechasFiltradas.forEach((f: string) => {
        const state = a.asistencias[f];
        const char = state === 'PRESENTE' ? 'P' : state === 'AUSENTE' ? 'A' : state === 'JUSTIFICADO' ? 'J' : '';
        row.push(char);
      });
      return row;
    });

    // Filas vacías adicionales
    const baseIndex = data.alumnos.length;
    this.filasVaciasData.forEach((fVacia: any, i: number) => {
      const nombreCompleto = (fVacia.nombre_completo || '').trim();
      const emptyRow = [
        (baseIndex + i + 1).toString(),
        nombreCompleto.toUpperCase()
      ];
      fechasFiltradas.forEach(() => {
        emptyRow.push('');
      });
      body.push(emptyRow);
    });

    // Ancho de columnas automático
    const columnStyles: any = {
      0: { cellWidth: 10, halign: 'center' }, // N°
      1: { cellWidth: 65 } // Nombre y Apellido
    };
    
    const totalWidthAvailable = 264 - 75;
    const dateColWidth = totalWidthAvailable / fechasFiltradas.length;
    fechasFiltradas.forEach((f: string, i: number) => {
      columnStyles[i + 2] = { cellWidth: dateColWidth, halign: 'center' };
    });

    autoTable(doc, {
      head,
      body,
      startY: 34,
      theme: 'grid',
      styles: { 
        fontSize: 7, 
        cellPadding: 1.2, 
        valign: 'middle',
        textColor: [50, 50, 50],
        lineColor: [180, 180, 180],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [245, 245, 245], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold', 
        fontSize: 7,
        halign: 'center'
      },
      columnStyles,
      margin: { top: 34, left: 16, right: 16, bottom: 12 }
    });

    doc.save(`Planilla_Asistencia_${(data.grupo || '').replace(/\s+/g, '_')}_${data.anio || ''}.pdf`);
  }

  descargarPlanillaExcel() {
    if (!this.planillaData) return;

    // Filter to only checked participants
    const filteredAlumnos = this.planillaData.alumnos.filter((a: any) => this.selectedParticipantIds.has(a.id));
    if (filteredAlumnos.length === 0) {
      this.alertService.successOrError('Debes seleccionar al menos un participante para exportar');
      return;
    }

    const data = {
      ...this.planillaData,
      alumnos: filteredAlumnos
    };

    // Fila 1: Título de la Parroquia
    const r1 = [data.parroquia.toUpperCase()];
    
    // Fila 2: Etapa y Grupo | Año
    const r2 = [`ETAPA: ${(data.movimiento || '').toUpperCase()} ${(data.grupo || '').toUpperCase()}`, '', '', `AÑO: ${(data.anio || '').toUpperCase()}`];
    
    // Fila 3: Catequistas | Salón
    const r3 = [`CATEQUISTA: ${(data.catequistas || '').toUpperCase()}`, '', '', `SALÓN Nº: ${(data.salon || '').toUpperCase()}`];
    
    // Fila 4: Fila vacía
    const r4: string[] = [];

    // Only include selected dates
    const fechasFiltradas = this.getFechasFiltradas();
    if (fechasFiltradas.length === 0) {
      this.alertService.successOrError('Debes seleccionar al menos una fecha para exportar');
      return;
    }

    // Fila 5: Cabeceras de la Tabla
    const header = [
      'N°',
      'Nombre y Apellido',
      ...fechasFiltradas.map((f: string) => dayjs(f).format('DD/MM'))
    ];

    const excelRows = [
      r1,
      r2,
      r3,
      r4,
      header
    ];

    // Alumnos
    data.alumnos.forEach((a: any, index: number) => {
      const row = [
        (index + 1).toString(),
        `${a.nombre.toUpperCase()} ${a.apellido.toUpperCase()}`
      ];
      fechasFiltradas.forEach((f: string) => {
        const state = a.asistencias[f];
        const char = state === 'PRESENTE' ? 'P' : state === 'AUSENTE' ? 'A' : state === 'JUSTIFICADO' ? 'J' : '';
        row.push(char);
      });
      excelRows.push(row);
    });

    // Filas vacías adicionales
    const baseIndex = data.alumnos.length;
    this.filasVaciasData.forEach((fVacia: any, i: number) => {
      const nombreCompleto = (fVacia.nombre_completo || '').trim();
      const emptyRow = [
        (baseIndex + i + 1).toString(),
        nombreCompleto.toUpperCase()
      ];
      fechasFiltradas.forEach(() => {
        emptyRow.push('');
      });
      excelRows.push(emptyRow);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelRows);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Planilla de Asistencia');
    XLSX.writeFile(wb, `Planilla_Asistencia_${(data.grupo || '').replace(/\s+/g, '_')}_${data.anio || ''}.xlsx`);
  }

  volver() {
    this.router.navigate(['/admin/asistencias']);
  }
}
