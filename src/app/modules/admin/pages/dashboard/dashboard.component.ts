import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DashboardService } from 'src/app/shared/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  birthdays: any[] = [];
  selectedMonth: number = new Date().getMonth() + 1;
  loadingStats = false;
  loadingBirthdays = false;

  // Pagination state
  totalItems = 0;
  pageSize = 8;
  pageIndex = 0;

  months = [
    { id: 1, name: 'Enero' },
    { id: 2, name: 'Febrero' },
    { id: 3, name: 'Marzo' },
    { id: 4, name: 'Abril' },
    { id: 5, name: 'Mayo' },
    { id: 6, name: 'Junio' },
    { id: 7, name: 'Julio' },
    { id: 8, name: 'Agosto' },
    { id: 9, name: 'Septiembre' },
    { id: 10, name: 'Octubre' },
    { id: 11, name: 'Noviembre' },
    { id: 12, name: 'Diciembre' },
  ];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadBirthdays();
  }

  loadStats() {
    const movimiento_id = this.authService.getSelectedMovimientoId();
    this.loadingStats = true;
    this.dashboardService.getStats(movimiento_id!).subscribe((res: any) => {
      this.loadingStats = false;
      if (res.ok) {
        this.stats = res.data;
      }
    });
  }

  loadBirthdays() {
    this.loadingBirthdays = true;
    const movimiento_id: any = this.authService.getSelectedMovimientoId();

    this.dashboardService
      .getBirthdays(this.selectedMonth, movimiento_id, this.pageIndex + 1, this.pageSize)
      .subscribe((res: any) => {
        this.loadingBirthdays = false;
        if (res.ok) {
          this.birthdays = res.data;
          this.totalItems = res.meta?.paging?.total_items || 0;
        }
      });
  }

  onMonthChange() {
    this.pageIndex = 0;
    this.loadBirthdays();
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBirthdays();
  }
}
