import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  private navSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Refrescar al inicio
    this.refresh();

    // 2. Refrescar en cada navegación interna
    this.navSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.refresh();
    });
  }

  private refresh() {
    this.authService.refreshPermissions().subscribe({
      next: () => console.log('✅ Permisos sincronizados'),
      error: () => console.warn('⚠️ No se pudieron sincronizar los permisos')
    });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }
}
