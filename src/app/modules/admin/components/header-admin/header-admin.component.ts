import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-header-admin',
  templateUrl: './header-admin.component.html',
  styleUrls: ['./header-admin.component.scss'],
})
export class HeaderAdminComponent implements OnInit {
  user: any;
  loading = true;
  movimientos: any[] = [];
  selectedMovimientoId: number | null = null;
  constructor(
    private alertService: AlertService,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const user = this.authService.desencriptarUsuario();

    if (user) {
      this.user = user;
      this.movimientos = this.authService.getUserMovimientos();
      this.selectedMovimientoId = this.authService.getSelectedMovimientoId();

      // Only set or reset if currently null or not in the list
      const exists = this.movimientos.some(
        (m) => m.id === this.selectedMovimientoId,
      );
      if (
        (this.selectedMovimientoId === null || !exists) &&
        this.movimientos.length > 0
      ) {
        this.selectedMovimientoId = this.movimientos[0].id;
        this.authService.setSelectedMovimientoId(this.selectedMovimientoId!);
      }

      this.loading = false;
    }
  }

  onMovimientoChange() {
    if (this.selectedMovimientoId) {
      this.authService.setSelectedMovimientoId(this.selectedMovimientoId);
      // Reload the page to refresh all data contextually
      window.location.reload();
    }
  }

  cerrarSesion() {
    this.alertService.loader();

    setTimeout(() => {
      this.authService.logout().subscribe((res) => {
        this.alertService.successOrError(res?.message || 'Sesión cerrada');
      });
    }, 1000);
  }
}
