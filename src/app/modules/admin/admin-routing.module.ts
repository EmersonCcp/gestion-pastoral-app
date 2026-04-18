import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { permissionGuard } from 'src/app/shared/guards/permission.guard';
import { AdminComponent } from './admin.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { PermisosComponent } from './pages/permisos/permisos.component';
import { RolesComponent } from './pages/roles/roles.component';
import { FormularioRolComponent } from './pages/roles/components/formulario-rol/formulario-rol.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { FormularioUsuarioComponent } from './pages/usuarios/components/formulario-usuario/formulario-usuario.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ParroquiasComponent } from './pages/parroquias/parroquias.component';
import { FormularioParroquiaComponent } from './pages/parroquias/components/formulario-parroquia/formulario-parroquia.component';
import { MovimientosComponent } from './pages/movimientos/movimientos.component';
import { FormularioMovimientoComponent } from './pages/movimientos/components/formulario-movimiento/formulario-movimiento.component';
import { GruposComponent } from './pages/grupos/grupos.component';
import { FormularioGrupoComponent } from './pages/grupos/components/formulario-grupo/formulario-grupo.component';
import { PeriodosComponent } from './pages/periodos/periodos.component';
import { FormularioPeriodoComponent } from './pages/periodos/components/formulario-periodo/formulario-periodo.component';
import { TiposPersonasComponent } from './pages/tipos-personas/tipos-personas.component';
import { PersonasComponent } from './pages/personas/personas.component';
import { FormularioPersonaComponent } from './pages/personas/components/formulario-persona/formulario-persona.component';
import { AulasComponent } from './pages/aulas/aulas.component';
import { AsignacionesComponent } from './pages/asignaciones/asignaciones.component';
import { FormularioAsignacionComponent } from './pages/asignaciones/components/formulario-asignacion/formulario-asignacion.component';
import { AsistenciasComponent } from './pages/asistencias/asistencias.component';
import { FormularioAsistenciaComponent } from './pages/asistencias/components/formulario-asistencia/formulario-asistencia.component';
import { PersonaPerfilComponent } from './pages/personas/components/persona-perfil/persona-perfil.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [permissionGuard],
        data: {}
      },
      {
        path: 'categorias',
        component: CategoriasComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['categorias.read'] }
      },
      {
        path: 'permisos',
        component: PermisosComponent,
      },
      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['roles.read'] }
      },
      {
        path: 'roles/:id/:mode',
        component: FormularioRolComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['roles.read'] }
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['usuarios.read'] }
      },
      {
        path: 'usuarios/:id/:mode',
        component: FormularioUsuarioComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['usuarios.read'] }
      },
      {
        path: 'parroquias',
        component: ParroquiasComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['parroquias.read'] }
      },
      {
        path: 'parroquias/:id/:mode',
        component: FormularioParroquiaComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['parroquias.read'] }
      },
      {
        path: 'movimientos',
        component: MovimientosComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['movimientos.read'] }
      },
      {
        path: 'movimientos/:id/:mode',
        component: FormularioMovimientoComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['movimientos.read'] }
      },
      {
        path: 'grupos',
        component: GruposComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['grupos.read'] }
      },
      {
        path: 'grupos/:id/:mode',
        component: FormularioGrupoComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['grupos.read'] }
      },
      {
        path: 'periodos',
        component: PeriodosComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['periodos.read'] }
      },
      {
        path: 'periodos/:id/:mode',
        component: FormularioPeriodoComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['periodos.read'] }
      },
      {
        path: 'tipos-personas',
        component: TiposPersonasComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['personas.read'] }
      },
      {
        path: 'personas',
        component: PersonasComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['personas.read'] }
      },
      {
        path: 'personas/:id/perfil',
        component: PersonaPerfilComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['personas.read'] }
      },
      {
        path: 'personas/:id/:mode',
        component: FormularioPersonaComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['personas.read'] }
      },
      {
        path: 'aulas',
        component: AulasComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['aulas.read'] }
      },
      {
        path: 'asistencias',
        component: AsistenciasComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['asistencias.read'] }
      },
      {
        path: 'asistencias/:id/:mode',
        component: FormularioAsistenciaComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['asistencias.read'] }
      },
      {
        path: 'asignaciones',
        component: AsignacionesComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['asignaciones.read'] }
      },
      {
        path: 'asignaciones/:id/:mode',
        component: FormularioAsignacionComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['asignaciones.read'] }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
