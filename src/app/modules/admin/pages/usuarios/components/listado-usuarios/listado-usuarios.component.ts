import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IUsuario } from 'src/app/shared/interfaces/entities/usuario.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';

import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-listado-usuarios',
  templateUrl: './listado-usuarios.component.html',
  styleUrls: ['./listado-usuarios.component.scss'],
})
export class ListadoUsuariosComponent implements OnInit {
  usuarios: IUsuario[] = [];
  per_page = 10;
  page = 1;
  loading = true;
  search = '';
  sort_by: string = 'nombre_completo';
  sort_dir: 'asc' | 'desc' = 'desc';
  total_items = 0;
  total_pages = 0;

  isPasswordModalOpen = false;
  selectedUserForPassword: IUsuario | null = null;
  newPassword = '';

  constructor(
    private service: UsuariosService,
    private alertService: AlertService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const query = {
      page: this.page,
      per_page: this.per_page,
      nombre: this.search, // Might need to adjust depending on what the backend expects for search term
      sort_by: this.sort_by,
      sort_dir: this.sort_dir,
    };
    this.service.getAll(query).subscribe((res) => {
      if (res.ok) {
        this.usuarios = res.data;
        this.loading = false;
        this.total_items = res.meta.paging?.total_items || 0;
        this.total_pages = res.meta.paging?.total_pages || 0;
      } else {
        const errorMsg = res?.error.message || res?.error?.message || res?.error.code || 'Error inesperado';
        if (this.alertService) {
          this.alertService.successOrError('Ocurrió un error', errorMsg, 'error');
        } else {
          console.error('API Error:', errorMsg);
        }
      }
    });
  }

  nextPage() {
    if (this.page < this.total_pages) {
      this.page++;
      this.loadData();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadData();
    }
  }

  onSearchChange(event: any) {
    this.search = event.target.value;

    if (this.search.length === 0) {
      this.page = 1;
      this.loadData();
      return;
    }

    if (this.search.length < 3) {
      return;
    }

    setTimeout(() => {
      this.page = 1;
      this.loadData();
    }, 400);
  }

  editar(usuario: IUsuario) {
    this.router.navigate([`/admin/usuarios/${usuario.id}/edit`]);
  }

  removeCategoria(usuario: IUsuario) {
    this.alertService.confirmDelete(() => {
      this.alertService.loader();
      this.service.delete(usuario.id!).subscribe({
        next: (res) => {
          if (res.ok) {
            this.alertService.successOrError();
            this.usuarios = this.usuarios.filter((c) => c.id !== usuario.id);
          } else {
            this.alertService.successOrError(
              res.error.code,
              res.error.message,
              'error',
            );
          }
        },
        error: (res) => {
          this.alertService.successOrError(
            'Ocurrió un error',
            res.statusText,
            'error',
          );
        },
      });
    });
  }

  openPasswordModal(usuario: IUsuario) {
    this.selectedUserForPassword = usuario;
    this.newPassword = '';
    this.isPasswordModalOpen = true;
  }

  closePasswordModal() {
    this.isPasswordModalOpen = false;
    this.selectedUserForPassword = null;
    this.newPassword = '';
  }

  submitPassword() {
    if (!this.selectedUserForPassword || this.newPassword.length < 6) {
      this.alertService.successOrError('Atención', 'La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    this.alertService.loader();
    this.authService.changePassword({
      userId: this.selectedUserForPassword.id,
      newPassword: this.newPassword
    }).subscribe({
      next: (res) => {
        if (res.ok) {
          this.alertService.successOrError('Éxito', res.message, 'success');
          this.closePasswordModal();
        } else {
          this.alertService.successOrError('Error', res.message, 'error');
        }
      },
      error: () => {
        this.alertService.successOrError('Error', 'No se pudo cambiar la contraseña', 'error');
      }
    });
  }
}
