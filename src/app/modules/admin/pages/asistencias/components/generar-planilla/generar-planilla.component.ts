import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Grupo } from 'src/app/shared/interfaces/entities/grupo.entity';
import { Periodo } from 'src/app/shared/interfaces/entities/periodo.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AsistenciaService } from 'src/app/shared/services/asistencia.service';
import { GrupoService } from 'src/app/shared/services/grupo.service';
import { PeriodoService } from 'src/app/shared/services/periodo.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
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
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.planillaDto.fecha_inicio = dayjs().startOf('year').format('YYYY-MM-DD');
    this.planillaDto.fecha_fin = dayjs().endOf('year').format('YYYY-MM-DD');
    this.loadCatalogs();

    this.route.queryParams.subscribe((params: any) => {
      if (params.grupo_id) this.planillaDto.grupo_id = Number(params.grupo_id);
      if (params.periodo_id) this.planillaDto.periodo_id = Number(params.periodo_id);
      if (params.fecha_inicio) this.planillaDto.fecha_inicio = params.fecha_inicio;
      if (params.fecha_fin) this.planillaDto.fecha_fin = params.fecha_fin;

      if (params.grupo_id && params.periodo_id) {
        setTimeout(() => this.generarPlanilla(), 500);
      }
    });
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
    
    doc.text(`${(data.salon || '').toUpperCase()}`, 280, 24, { align: 'right' });
    doc.text(`${(data.anio || '').toUpperCase()}`, 280, 29, { align: 'right' });

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

  async descargarPlanillaExcel() {
    if (!this.planillaData) return;

    const filteredAlumnos = this.planillaData.alumnos.filter((a: any) => this.selectedParticipantIds.has(a.id));
    if (filteredAlumnos.length === 0) {
      this.alertService.successOrError('Debes seleccionar al menos un participante para exportar');
      return;
    }

    const data = { ...this.planillaData, alumnos: filteredAlumnos };
    const fechasFiltradas = this.getFechasFiltradas();
    if (fechasFiltradas.length === 0) {
      this.alertService.successOrError('Debes seleccionar al menos una fecha para exportar');
      return;
    }

    const totalCols = 2 + fechasFiltradas.length; // N° + Nombre + fechas

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Gestión Pastoral';
    wb.created = new Date();
    const ws = wb.addWorksheet('Planilla de Asistencia');

    // Page setup for printing
    ws.pageSetup.orientation = 'landscape';
    ws.pageSetup.fitToPage = true;
    ws.pageSetup.fitToWidth = 1;
    ws.pageSetup.fitToHeight = 0;
    ws.pageSetup.margins = {
      left: 0.5, right: 0.5, top: 0.6, bottom: 0.6,
      header: 0.3, footer: 0.3,
    };
    ws.pageSetup.paperSize = 9; // A4
    ws.pageSetup.printTitlesRow = '6:6'; // repeat header row on each page

    // Column widths
    ws.getColumn(1).width = 4;   // N°
    ws.getColumn(2).width = 35;  // Nombre
    for (let i = 0; i < fechasFiltradas.length; i++) {
      ws.getColumn(3 + i).width = 6;
    }

    // Styles
    const titleFont: Partial<ExcelJS.Font> = { bold: true, size: 14, name: 'Arial' };
    const infoFont: Partial<ExcelJS.Font> = { bold: true, size: 10, name: 'Arial' };
    const infoFontNormal: Partial<ExcelJS.Font> = { size: 10, name: 'Arial' };
    const headerFont: Partial<ExcelJS.Font> = { bold: true, size: 9, name: 'Arial' };
    const bodyFont: Partial<ExcelJS.Font> = { size: 9, name: 'Arial' };
    const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' as const, color: { argb: 'FF999999' } },
      left: { style: 'thin' as const, color: { argb: 'FF999999' } },
      bottom: { style: 'thin' as const, color: { argb: 'FF999999' } },
      right: { style: 'thin' as const, color: { argb: 'FF999999' } },
    };
    const centerAlign: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle' };

    // Row 1: Parroquia (merged)
    ws.mergeCells(1, 1, 1, totalCols);
    const r1 = ws.getCell(1, 1);
    r1.value = data.parroquia.toUpperCase();
    r1.font = titleFont;
    r1.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 30;

    const lastMergeCol = Math.max(totalCols - 3, 2); // leave 3 cols for year/salon
    
    // Row 2: Etapa + Grupo (left) / Año (right)
    ws.mergeCells(2, 1, 2, lastMergeCol);
    const r2g = ws.getCell(2, 1);
    r2g.value = `ETAPA: ${(data.movimiento || '').toUpperCase()} - ${(data.grupo || '').toUpperCase()}`;
    r2g.font = infoFont;
    r2g.alignment = { vertical: 'middle' };
    if (lastMergeCol < totalCols) {
      ws.mergeCells(2, lastMergeCol + 1, 2, totalCols);
      const r2a = ws.getCell(2, lastMergeCol + 1);
      r2a.value = `${(data.anio || '').toUpperCase()}`;
      r2a.font = infoFont;
      r2a.alignment = { horizontal: 'right', vertical: 'middle' };
    }
    ws.getRow(2).height = 20;

    // Row 3: Catequistas (left) / Salón (right)
    ws.mergeCells(3, 1, 3, lastMergeCol);
    const r3g = ws.getCell(3, 1);
    r3g.value = `CATEQUISTA: ${(data.catequistas || '').toUpperCase()}`;
    r3g.font = infoFontNormal;
    r3g.alignment = { vertical: 'middle' };
    if (lastMergeCol < totalCols) {
      ws.mergeCells(3, lastMergeCol + 1, 3, totalCols);
      const r3a = ws.getCell(3, lastMergeCol + 1);
      r3a.value = `${(data.salon || '').toUpperCase()}`;
      r3a.font = infoFontNormal;
      r3a.alignment = { horizontal: 'right', vertical: 'middle' };
    }
    ws.getRow(3).height = 18;

    // Row 4: empty spacer
    ws.getRow(4).height = 6;

    // Row 5: Separator line (blank)
    ws.getRow(5).height = 2;

    // Row 6: Table header
    const headerRow = ws.getRow(6);
    headerRow.height = 22;
    const headerValues = ['N°', 'NOMBRE Y APELLIDO', ...fechasFiltradas.map((f: string) => dayjs(f).format('DD/MM'))];
    headerValues.forEach((val, colIdx) => {
      const cell = headerRow.getCell(colIdx + 1);
      cell.value = val;
      cell.font = headerFont;
      cell.fill = headerFill;
      cell.border = thinBorder;
      cell.alignment = { ...centerAlign, wrapText: true };
    });

    // Data rows
    let rowIdx = 7;
    const applyRow = (values: string[], isBold: boolean) => {
      const row = ws.getRow(rowIdx);
      row.height = 18;
      values.forEach((val, colIdx) => {
        const cell = row.getCell(colIdx + 1);
        cell.value = val;
        cell.font = { ...bodyFont, bold: isBold };
        cell.border = thinBorder;
        cell.alignment = colIdx === 1 ? { vertical: 'middle' } : centerAlign;
      });
      rowIdx++;
    };

    data.alumnos.forEach((a: any, index: number) => {
      const row = [
        (index + 1).toString(),
        `${a.nombre.toUpperCase()} ${a.apellido.toUpperCase()}`,
        ...fechasFiltradas.map((f: string) => {
          const state = a.asistencias[f];
          return state === 'PRESENTE' ? 'P' : state === 'AUSENTE' ? 'A' : state === 'JUSTIFICADO' ? 'J' : '';
        }),
      ];
      applyRow(row, true);
    });

    // Empty rows for manual completion
    const baseIndex = data.alumnos.length;
    this.filasVaciasData.forEach((fVacia: any, i: number) => {
      const nombreCompleto = (fVacia.nombre_completo || '').trim();
      const row = [
        (baseIndex + i + 1).toString(),
        nombreCompleto.toUpperCase(),
        ...fechasFiltradas.map(() => ''),
      ];
      applyRow(row, false);
    });

    // Generate buffer and download
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Planilla_Asistencia_${(data.grupo || '').replace(/\s+/g, '_')}_${data.anio || ''}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  volver() {
    this.router.navigate(['/admin/asistencias']);
  }
}
