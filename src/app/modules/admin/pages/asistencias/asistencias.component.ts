import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Asistencia } from 'src/app/shared/interfaces/entities/asistencia.entity';
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
  selector: 'app-asistencias',
  templateUrl: './asistencias.component.html',
  styleUrls: ['./asistencias.component.scss']
})
export class AsistenciasComponent implements OnInit {
  asistencias: Asistencia[] = [];
  periodos: Periodo[] = [];
  grupos: Grupo[] = [];
  loading = false;
  selectedPeriodoId: number | null = null;
  selectedGrupoId: number | null = null;
  total_items = 0;
  page = 1;
  per_page = 20;
  
  // Selection
  selectedIds = new Set<number>();
  exportLoading = false;

  // Planilla de Asistencia
  isPlanillaModalOpen = false;
  planillaLoading = false;
  planillaData: any = null;
  planillaDto = {
    periodo_id: null as number | null,
    grupo_id: null as number | null,
    fecha_inicio: '',
    fecha_fin: ''
  };

  constructor(
    private service: AsistenciaService,
    private periodoService: PeriodoService,
    private grupoService: GrupoService,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadData();
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

  loadData() {
    this.loading = true;
    const movId = this.authService.getSelectedMovimientoId();
    const filters: any = { per_page: this.per_page, page: this.page };
    if (movId) filters.movimiento_id = movId;
    if (this.selectedPeriodoId) filters.periodo_id = this.selectedPeriodoId;
    if (this.selectedGrupoId) filters.grupo_id = this.selectedGrupoId;

    this.service.getAll(filters).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.asistencias = res.data;
        this.total_items = res.meta?.paging?.total_items || 0;
      }
    });
  }

  onFilterChange() {
    this.page = 1;
    this.loadData();
  }

  nueva() {
    this.router.navigate(['/admin/asistencias/nueva/new']);
  }

  editar(a: Asistencia) {
    this.router.navigate([`/admin/asistencias/${a.id}/edit`]);
  }

  eliminar(a: Asistencia) {
    this.alertService.confirmDelete(() => {
      this.service.delete(a.id).subscribe((res: any) => {
        if (res.ok) {
          this.alertService.successOrError('Asistencia eliminada');
          this.loadData();
        }
      });
    });
  }

  // Selection Logic
  toggleItem(id: number) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleAll() {
    const allSelectedInView = this.asistencias.every(a => this.selectedIds.has(a.id));
    if (allSelectedInView) {
      this.asistencias.forEach(a => this.selectedIds.delete(a.id));
    } else {
      this.asistencias.forEach(a => this.selectedIds.add(a.id));
    }
  }

  isSelectedAll(): boolean {
    return this.asistencias.length > 0 && this.asistencias.every(a => this.selectedIds.has(a.id));
  }

  async exportToExcel() {
    if (this.selectedIds.size === 0) return;
    this.exportLoading = true;
    this.alertService.loader();

    this.service.getReport(Array.from(this.selectedIds)).subscribe({
      next: (res: any) => {
        this.exportLoading = false;
        this.alertService.close();
        if (res.ok) {
          this.generateExcel(res.data);
        }
      },
      error: () => {
        this.exportLoading = false;
        this.alertService.close();
        this.alertService.successOrError('Error al generar el reporte', '', 'error');
      }
    });
  }

  async exportToPdf() {
    if (this.selectedIds.size === 0) return;
    this.exportLoading = true;
    this.alertService.loader();

    this.service.getReport(Array.from(this.selectedIds)).subscribe({
      next: (res: any) => {
        this.exportLoading = false;
        this.alertService.close();
        if (res.ok) {
          this.generatePdf(res.data);
        }
      },
      error: () => {
        this.exportLoading = false;
        this.alertService.close();
        this.alertService.successOrError('Error al generar el reporte', '', 'error');
      }
    });
  }

  private generateExcel(data: Asistencia[]) {
    const { dates, rows } = this.processReportData(data);
    
    // Header: [Nro, Persona, ...Dates, Totals]
    const header = [
      '#',
      'Miembro / Fecha', 
      ...dates.map(d => dayjs(d).format('DD/MM/YYYY')),
      'Total P', 'Total A', 'Total J'
    ];
    const excelData = [header];

    rows.forEach((row, index) => {
      const line = [(index + 1).toString(), row.name];
      dates.forEach(date => {
        line.push(row.attendance[date] || '-');
      });
      line.push(row.totals.presente.toString());
      line.push(row.totals.ausente.toString());
      line.push(row.totals.justificado.toString());
      excelData.push(line);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');
    XLSX.writeFile(wb, `Reporte_Asistencia_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  }

  private generatePdf(data: Asistencia[]) {
    const doc = new jsPDF('l', 'mm', 'a4');
    const { dates, rows } = this.processReportData(data);

    doc.setFontSize(16);
    doc.text('Reporte de Asistencia Detallado', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generado el: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, 22);

    const head = [[
      '#',
      'Miembro', 
      ...dates.map(d => dayjs(d).format('DD/MM/YYYY')),
      'P', 'A', 'J'
    ]];
    const body = rows.map((row, index) => {
      return [
        (index + 1).toString(),
        row.name, 
        ...dates.map(date => row.attendance[date] || '-'),
        row.totals.presente.toString(),
        row.totals.ausente.toString(),
        row.totals.justificado.toString()
      ];
    });

    autoTable(doc, {
      head,
      body,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    doc.save(`Asistencia_${dayjs().format('YYYY-MM-DD')}.pdf`);
  }

  private processReportData(data: Asistencia[]) {
    // Unique dates (sorted)
    const dates = Array.from(new Set(data.map(a => a.fecha))).sort();
    
    // Map to store Person -> { name, attendance: record, totals }
    const personMap = new Map<number, { 
      name: string, 
      attendance: Record<string, string>,
      totals: { presente: number, ausente: number, justificado: number }
    }>();

    data.forEach(asig => {
      asig.personas?.forEach(ap => {
        if (!personMap.has(ap.persona_id)) {
          const name = ap.persona ? `${ap.persona.nombre} ${ap.persona.apellido}` : `S/N (${ap.persona_id})`;
          personMap.set(ap.persona_id, {
            name,
            attendance: {},
            totals: { presente: 0, ausente: 0, justificado: 0 }
          });
        }
        
        const person = personMap.get(ap.persona_id)!;
        const stateChar = ap.estado === 'PRESENTE' ? 'P' : ap.estado === 'AUSENTE' ? 'A' : 'J';
        person.attendance[asig.fecha] = stateChar;

        // Count totals
        if (ap.estado === 'PRESENTE') person.totals.presente++;
        else if (ap.estado === 'AUSENTE') person.totals.ausente++;
        else if (ap.estado === 'JUSTIFICADO') person.totals.justificado++;
      });
    });

    const rows = Array.from(personMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    return { dates, rows };
  }

  abrirPlanillaModal() {
    this.planillaDto = {
      periodo_id: this.selectedPeriodoId,
      grupo_id: this.selectedGrupoId,
      fecha_inicio: dayjs().startOf('year').format('YYYY-MM-DD'),
      fecha_fin: dayjs().endOf('year').format('YYYY-MM-DD')
    };
    this.planillaData = null;
    this.isPlanillaModalOpen = true;
  }

  cerrarPlanillaModal() {
    this.isPlanillaModalOpen = false;
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

  descargarPlanillaPdf() {
    if (!this.planillaData) return;
    const data = this.planillaData;
    
    // Configuración A4 Horizontal (Landscape)
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Logo o detalles superiores
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(data.parroquia.toUpperCase(), 148, 14, { align: 'center' });
    
    doc.setFontSize(9);
    doc.text(`ETAPA: ${data.movimiento.toUpperCase()} ${data.grupo.toUpperCase()}`, 16, 24);
    doc.text(`CATEQUISTA: ${data.catequistas.toUpperCase()}`, 16, 29);
    
    doc.text(`SALON Nº ${data.salon.toUpperCase()}`, 280, 24, { align: 'right' });
    doc.text(`AÑO ${data.anio.toUpperCase()}`, 280, 29, { align: 'right' });

    // Cabecera de la tabla
    const head = [[
      'N°',
      'NOMBRE Y APELLIDO',
      ...data.fechas.map((f: string) => dayjs(f).format('DD/MM'))
    ]];

    // Filas de alumnos
    const body = data.alumnos.map((a: any, index: number) => {
      const row = [
        (index + 1).toString(),
        `${a.nombre.toUpperCase()} ${a.apellido.toUpperCase()}`
      ];
      data.fechas.forEach((f: string) => {
        const state = a.asistencias[f];
        const char = state === 'PRESENTE' ? 'P' : state === 'AUSENTE' ? 'A' : state === 'JUSTIFICADO' ? 'J' : '';
        row.push(char);
      });
      return row;
    });

    // Ancho de columnas automático. N° pequeño, Nombre regular, fechas compactas e iguales
    const columnStyles: any = {
      0: { cellWidth: 10, halign: 'center' }, // N°
      1: { cellWidth: 65 } // Nombre y Apellido
    };
    
    // Ancho de las columnas de fecha (el resto del ancho se divide por el número de fechas)
    const totalWidthAvailable = 264 - 75; // 264 (margins left/right 16) - 75 (N° y Nombre)
    const dateColWidth = totalWidthAvailable / data.fechas.length;
    data.fechas.forEach((f: string, i: number) => {
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

    doc.save(`Planilla_Asistencia_${data.grupo.replace(/\s+/g, '_')}_${data.anio}.pdf`);
  }
}
