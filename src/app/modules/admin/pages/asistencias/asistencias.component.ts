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
}
