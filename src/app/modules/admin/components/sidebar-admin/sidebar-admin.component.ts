import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { hasPermission } from 'src/app/shared/utils/auth.utils';

@Component({
  selector: 'app-sidebar-admin',
  templateUrl: './sidebar-admin.component.html',
  styleUrls: ['./sidebar-admin.component.scss']
})
export class SidebarAdminComponent implements OnInit {

  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: 'dashboard' },
    // { label: 'Categorías', icon: 'category', route: 'categorias', permissions: ['categorias.read'] },
    { label: 'Desarrollo de Clase', icon: 'history_edu', route: 'desarrollo-clase', permissions: ['desarrollo_clase.read'] },
    { label: 'Libros', icon: 'menu_book', route: 'libros', permissions: ['libros.read'] },
    { label: 'Inventario de Libros', icon: 'inventory_2', route: 'libros-inventario', permissions: ['libros.read'] },
    { label: 'Personas', icon: 'person', route: 'personas', permissions: ['personas.read'] },
    { label: 'Grupos', icon: 'account_tree', route: 'grupos', permissions: ['grupos.read'] },
    { label: 'Periodos', icon: 'date_range', route: 'periodos', permissions: ['periodos.read'] },
    { label: 'Asignaciones', icon: 'assignment_ind', route: 'asignaciones', permissions: ['asignaciones.read'] },
    { label: 'Asistencias', icon: 'event_available', route: 'asistencias', permissions: ['asistencias.read'] },
    { label: 'Aulas', icon: 'meeting_room', route: 'aulas', permissions: ['aulas.read'] },
    { label: 'Parroquias', icon: 'church', route: 'parroquias', permissions: ['parroquias.read'] },
    { label: 'Tipos de Personas', icon: 'diversity_3', route: 'tipos-personas', permissions: ['personas.read'] },
    { label: 'Movimientos', icon: 'groups', route: 'movimientos', permissions: ['movimientos.read'] },
    { label: 'Usuarios', icon: 'group', route: 'usuarios', permissions: ['usuarios.read'] },
    { label: 'Permisos', icon: 'lock', route: 'permisos', permissions: ['permisos.read'] },
    { label: 'Roles', icon: 'admin_panel_settings', route: 'roles', permissions: ['roles.read'] },
  ];

  filteredMenuItems = [...this.menuItems];

  constructor(private router: Router) { }

  ngOnInit() {
    this.filteredMenuItems = this.menuItems.filter(item =>
      !item.permissions || hasPermission(item.permissions)
    );
  }

  goTo(route: string) {
    this.router.navigate([`/admin/${route}`])
  }

  isActive(route: string): boolean {
    const currentRoute = this.router.url.split('/').pop();
    return currentRoute === route;
  }

}
