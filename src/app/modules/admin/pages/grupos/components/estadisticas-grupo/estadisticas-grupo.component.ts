import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GrupoService } from 'src/app/shared/services/grupo.service';
import { Chart, registerables } from 'chart.js';
import { AlertService } from 'src/app/shared/services/alert.service';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas-grupo',
  templateUrl: './estadisticas-grupo.component.html',
  styleUrls: ['./estadisticas-grupo.component.scss']
})
export class EstadisticasGrupoComponent implements OnInit, OnDestroy {
  grupoId!: number;
  loading = true;
  data: any = null;

  private charts: Chart[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private grupoService: GrupoService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.grupoId = Number(idParam);
      this.loadEstadisticas();
    } else {
      this.alertService.successOrError('Error', 'Grupo ID no especificado', 'error');
      this.volver();
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadEstadisticas(): void {
    this.loading = true;
    this.grupoService.getEstadisticas(this.grupoId).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.ok) {
          this.data = res.data;
          // Inicializar los gráficos después de que Angular renderice la vista
          setTimeout(() => {
            this.initCharts();
          }, 0);
        } else {
          this.alertService.successOrError('Error', res.error?.message || 'Error al cargar estadísticas', 'error');
          this.volver();
        }
      },
      error: (err) => {
        this.loading = false;
        this.alertService.successOrError('Error', 'Error de conexión al servidor', 'error');
        this.volver();
      }
    });
  }

  initCharts(): void {
    this.destroyCharts();

    if (!this.data) return;

    // 1. Gráfico de Asistencia (Líneas)
    const asistenciaCtx = document.getElementById('asistenciaChart') as HTMLCanvasElement;
    if (asistenciaCtx) {
      const chart = new Chart(asistenciaCtx, {
        type: 'line',
        data: {
          labels: this.data.asistencias_grafico.map((a: any) => {
            const date = new Date(a.fecha);
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
          }),
          datasets: [{
            label: 'Asistencia (%)',
            data: this.data.asistencias_grafico.map((a: any) => a.porcentaje_asistencia),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#2563eb'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              min: 0,
              max: 100,
              ticks: { callback: (value) => `${value}%` }
            }
          }
        }
      });
      this.charts.push(chart);
    }

    // 2. Gráfico de Sacramentos (Barra Agrupada)
    const sacramentosCtx = document.getElementById('sacramentosChart') as HTMLCanvasElement;
    if (sacramentosCtx) {
      const chart = new Chart(sacramentosCtx, {
        type: 'bar',
        data: {
          labels: ['Bautismo', '1° Comunión', 'Confirmación'],
          datasets: [
            {
              label: 'Sí',
              data: [
                this.data.sacramentos_grafico.bautismo.si,
                this.data.sacramentos_grafico.primera_comunion.si,
                this.data.sacramentos_grafico.confirmacion.si
              ],
              backgroundColor: '#10b981',
              borderRadius: 6
            },
            {
              label: 'No',
              data: [
                this.data.sacramentos_grafico.bautismo.no,
                this.data.sacramentos_grafico.primera_comunion.no,
                this.data.sacramentos_grafico.confirmacion.no
              ],
              backgroundColor: '#ef4444',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }
      });
      this.charts.push(chart);
    }

    // 3. Gráfico de Género (Dona)
    const generoCtx = document.getElementById('generoChart') as HTMLCanvasElement;
    if (generoCtx) {
      const chart = new Chart(generoCtx, {
        type: 'doughnut',
        data: {
          labels: ['Masculino', 'Femenino'],
          datasets: [{
            data: [this.data.genero_grafico.masculino, this.data.genero_grafico.femenino],
            backgroundColor: ['#60a5fa', '#f472b6'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
      this.charts.push(chart);
    }
  }

  destroyCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  volver(): void {
    this.router.navigate(['/admin/grupos']);
  }
}
