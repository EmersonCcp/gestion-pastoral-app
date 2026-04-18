import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { HeaderAdminComponent } from './components/header-admin/header-admin.component';
import { SidebarAdminComponent } from './components/sidebar-admin/sidebar-admin.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { SkeletonTableAdminComponent } from './components/skeletons/skeleton-table-admin/skeleton-table-admin.component';
import { ButtonAdminComponent } from './components/button-admin/button-admin.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListadoCategoriasComponent } from './pages/categorias/components/listado-categorias/listado-categorias.component';
import { FormularioCategoriaComponent } from './pages/categorias/components/formulario-categoria/formulario-categoria.component';
import { ListHeaderAdminComponent } from './components/list-header-admin/list-header-admin.component';
import { FormInputAdminComponent } from './components/form-input-admin/form-input-admin.component';
import { SkeletonFormModalAdminComponent } from './components/skeletons/skeleton-form-modal-admin/skeleton-form-modal-admin.component';
import { RolesComponent } from './pages/roles/roles.component';
import { PermisosComponent } from './pages/permisos/permisos.component';
import { ListadoPermisosComponent } from './pages/permisos/components/listado-permisos/listado-permisos.component';
import { FormularioPermisoComponent } from './pages/permisos/components/formulario-permiso/formulario-permiso.component';
import { JwtInterceptor } from 'src/app/shared/interceptors/jwt.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ListadoRolesComponent } from './pages/roles/components/listado-roles/listado-roles.component';
import { FormularioRolComponent } from './pages/roles/components/formulario-rol/formulario-rol.component';
import { A11yModule } from "@angular/cdk/a11y";
import { SearchSelectAdminComponent } from './components/search-select-admin/search-select-admin.component';
import { SkeletonHeaderAdminComponent } from './components/skeletons/skeleton-header-admin/skeleton-header-admin.component';
import { TableAdminComponent } from './components/table-admin/table-admin.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { ListadoUsuariosComponent } from './pages/usuarios/components/listado-usuarios/listado-usuarios.component';
import { FormularioUsuarioComponent } from './pages/usuarios/components/formulario-usuario/formulario-usuario.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ParroquiasComponent } from './pages/parroquias/parroquias.component';
import { ListadoParroquiasComponent } from './pages/parroquias/components/listado-parroquias/listado-parroquias.component';
import { FormularioParroquiaComponent } from './pages/parroquias/components/formulario-parroquia/formulario-parroquia.component';
import { MovimientosComponent } from './pages/movimientos/movimientos.component';
import { ListadoMovimientosComponent } from './pages/movimientos/components/listado-movimientos/listado-movimientos.component';
import { FormularioMovimientoComponent } from './pages/movimientos/components/formulario-movimiento/formulario-movimiento.component';
import { GruposComponent } from './pages/grupos/grupos.component';
import { ListadoGruposComponent } from './pages/grupos/components/listado-grupos/listado-grupos.component';
import { FormularioGrupoComponent } from './pages/grupos/components/formulario-grupo/formulario-grupo.component';
import { PeriodosComponent } from './pages/periodos/periodos.component';
import { ListadoPeriodosComponent } from './pages/periodos/components/listado-periodos/listado-periodos.component';
import { FormularioPeriodoComponent } from './pages/periodos/components/formulario-periodo/formulario-periodo.component';
import { TiposPersonasComponent } from './pages/tipos-personas/tipos-personas.component';
import { FormularioTipoPersonaComponent } from './pages/tipos-personas/components/formulario-tipo-persona/formulario-tipo-persona.component';
import { PersonasComponent } from './pages/personas/personas.component';
import { ListadoPersonasComponent } from './pages/personas/components/listado-personas/listado-personas.component';
import { FormularioPersonaComponent } from './pages/personas/components/formulario-persona/formulario-persona.component';
import { AulasComponent } from './pages/aulas/aulas.component';
import { FormularioAulaComponent } from './pages/aulas/components/formulario-aula/formulario-aula.component';
import { AsignacionesComponent } from './pages/asignaciones/asignaciones.component';
import { FormularioAsignacionComponent } from './pages/asignaciones/components/formulario-asignacion/formulario-asignacion.component';
import { AsistenciasComponent } from './pages/asistencias/asistencias.component';
import { FormularioAsistenciaComponent } from './pages/asistencias/components/formulario-asistencia/formulario-asistencia.component';
import { PersonaPerfilComponent } from './pages/personas/components/persona-perfil/persona-perfil.component';
import { SkeletonFormAdminComponent } from './components/skeletons/skeleton-form-admin/skeleton-form-admin.component';

@NgModule({
  declarations: [
    AdminComponent,
    HeaderAdminComponent,
    SidebarAdminComponent,
    CategoriasComponent,
    SkeletonTableAdminComponent,
    ButtonAdminComponent,
    ListadoCategoriasComponent,
    FormularioCategoriaComponent,
    ListHeaderAdminComponent,
    FormInputAdminComponent,
    SkeletonFormModalAdminComponent,
    RolesComponent,
    PermisosComponent,
    ListadoPermisosComponent,
    FormularioPermisoComponent,
    ListadoRolesComponent,
    FormularioRolComponent,
    SearchSelectAdminComponent,
    SkeletonHeaderAdminComponent,
    UsuariosComponent,
    ListadoUsuariosComponent,
    FormularioUsuarioComponent,
    TableAdminComponent,
    DashboardComponent,
    ParroquiasComponent,
    ListadoParroquiasComponent,
    FormularioParroquiaComponent,
    MovimientosComponent,
    ListadoMovimientosComponent,
    FormularioMovimientoComponent,
    GruposComponent,
    ListadoGruposComponent,
    FormularioGrupoComponent,
    PeriodosComponent,
    ListadoPeriodosComponent,
    FormularioPeriodoComponent,
    TiposPersonasComponent,
    FormularioTipoPersonaComponent,
    PersonasComponent,
    ListadoPersonasComponent,
    FormularioPersonaComponent,
    AulasComponent,
    FormularioAulaComponent,
    AsignacionesComponent,
    FormularioAsignacionComponent,
    AsistenciasComponent,
    FormularioAsistenciaComponent,
    PersonaPerfilComponent,
    SkeletonFormAdminComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminRoutingModule, HttpClientModule, SharedModule, A11yModule],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: JwtInterceptor,
    multi: true
  }]
})
export class AdminModule { }
