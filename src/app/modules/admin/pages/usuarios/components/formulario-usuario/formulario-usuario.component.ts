import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { IUsuario } from 'src/app/shared/interfaces/entities/usuario.entity';
import { IRol } from 'src/app/shared/interfaces/entities/rol.entity';
import { Movimiento } from 'src/app/shared/interfaces/entities/movimiento.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { RolesService } from 'src/app/shared/services/roles.service';
import { MovimientoService } from 'src/app/shared/services/movimiento.service';
import { ParroquiaService } from 'src/app/shared/services/parroquia.service';
import { GrupoService } from 'src/app/shared/services/grupo.service';

@Component({
  selector: 'app-formulario-usuario',
  templateUrl: './formulario-usuario.component.html',
  styleUrls: ['./formulario-usuario.component.scss']
})
export class FormularioUsuarioComponent implements OnInit {
  loading = false;
  usuario!: IUsuario;
  id = 0;
  form: FormGroup;
  disabled = false;
  sigla = 'usuarios';
  editMode = false;

  roles: IRol[] = [];
  movimientos: Movimiento[] = [];
  parroquias: any[] = [];
  grupos: any[] = [];
  activeMovimientoTabId: number | null = null;

  constructor(
    private service: UsuariosService,
    private rolesService: RolesService,
    private movimientoService: MovimientoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private alertService: AlertService,
    private parroquiaService: ParroquiaService,
    private grupoService: GrupoService
  ) {
    this.form = this.initForm();
  }

  ngOnInit() {
    this.loadRoles();
    this.loadMovimientos();
    this.loadParroquias();
    this.loadGrupos();

    this.activatedRoute.params.pipe(take(1)).subscribe((param) => {
      this.handleParams(param);
    });
  }

  handleParams(param: any) {
    this.id = Number(param['id']) || 0;
    this.editMode = this.id !== 0;

    this.disabled = param['mod'] === 'view';

    if (this.id > 0) {
      this.loadData();
    } else {
      // Si es creación, exigimos contraseña
      this.form.get('password_encrypted')?.setValidators([Validators.required]);
      this.form.get('password_encrypted')?.updateValueAndValidity();
    }

    if (this.disabled) {
      this.form.disable();
    }
  }

  private loadData() {
    this.service.getById(this.id).subscribe((res) => {
      if (res.ok) {
        // Mapear movimientos actuales del usuario
        const movimientoIds = (res.data.usuarioMovimientos || []).map(
          (um: any) => um.movimiento?.id
        ).filter(Boolean);

        const grupoIds = (res.data.grupos || []).map(
          (g: any) => g.id
        ).filter(Boolean);

        if (movimientoIds.length > 0) {
          this.activeMovimientoTabId = movimientoIds[0];
        }
 
        this.form.patchValue({
          ...res.data,
          rol_id: res.data.usuarioRoles?.[0]?.rol?.id,
          movimiento_ids: movimientoIds,
          grupo_ids: grupoIds,
        });
      } else {
        const errorMsg = res?.error?.message || res?.error?.code || 'Error inesperado';
        this.alertService.successOrError('Ocurrió un error', errorMsg, 'error');
      }
    });
  }

  initForm() {
    return this.fb.group({
      nombre_completo: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password_encrypted: [''],
      rol_id: [null, this.id === 0 ? [Validators.required] : []],
      movimiento_ids: [[]],
      grupo_ids: [[]],
      is_super_user: [false],
      parroquia_id: [null],
      estado: [true],
    });
  }

  loadRoles() {
    this.rolesService.getAll({ page: 1, per_page: 500 }).subscribe((res) => {
      if (res.ok) {
        this.roles = res.data;
      } else {
        const errorMsg = res?.error?.message || res?.error?.code || 'Error inesperado';
        this.alertService.successOrError('Ocurrió un error', errorMsg, 'error');
      }
    });
  }

  loadMovimientos() {
    this.movimientoService.getAll({ page: 1, per_page: 500 }).subscribe((res) => {
      if (res.ok) {
        this.movimientos = res.data;
      } else {
        const errorMsg = res?.error?.message || res?.error?.code || 'Error inesperado';
        this.alertService.successOrError('Ocurrió un error al cargar movimientos', errorMsg, 'error');
      }
    });
  }

  loadParroquias() {
    this.parroquiaService
      .getAll({ page: 1, per_page: 500 })
      .subscribe((res: any) => {
        if (res.ok) {
          this.parroquias = res.data;
        }
      });
  }

  isMovimientoSelected(movimientoId: number): boolean {
    const ids: number[] = this.form.get('movimiento_ids')?.value || [];
    return ids.includes(movimientoId);
  }

  toggleMovimiento(movimientoId: number) {
    if (this.disabled) return;
    const ids: number[] = [...(this.form.get('movimiento_ids')?.value || [])];
    const index = ids.indexOf(movimientoId);
    if (index === -1) {
      ids.push(movimientoId);
      if (!this.activeMovimientoTabId) {
        this.activeMovimientoTabId = movimientoId;
      }
    } else {
      ids.splice(index, 1);
      // Limpiar grupos de este movimiento si el usuario pierde acceso
      const actualGrupoIds = this.form.get('grupo_ids')?.value || [];
      const gruposDelMovimiento = this.grupos.filter(g => g.movimiento_id === movimientoId);
      const gruposDelMovimientoIds = gruposDelMovimiento.map(g => g.id);
      const nuevosGrupoIds = actualGrupoIds.filter((id: number) => !gruposDelMovimientoIds.includes(id));
      this.form.get('grupo_ids')?.setValue(nuevosGrupoIds);

      // Re-evaluar tab activa
      if (this.activeMovimientoTabId === movimientoId) {
        this.activeMovimientoTabId = ids.length > 0 ? ids[0] : null;
      }
    }
    this.form.get('movimiento_ids')?.setValue(ids);
  }

  get selectedMovimientos(): Movimiento[] {
    const ids: number[] = this.form.get('movimiento_ids')?.value || [];
    return this.movimientos.filter(m => ids.includes(m.id));
  }

  setActiveMovimientoTab(id: number) {
    this.activeMovimientoTabId = id;
  }

  loadGrupos() {
    this.grupoService.getAll({ page: 1, per_page: 500 }).subscribe((res) => {
      if (res.ok) {
        // Mostramos solo grupos reales (que tengan un padre, ej. no categorías raíces)
        this.grupos = res.data.filter((g: any) => g.parent_id !== null);
      }
    });
  }

  isGrupoSelected(grupoId: number): boolean {
    const ids: number[] = this.form.get('grupo_ids')?.value || [];
    return ids.includes(grupoId);
  }

  toggleGrupo(grupoId: number) {
    if (this.disabled) return;
    const ids: number[] = [...(this.form.get('grupo_ids')?.value || [])];
    const index = ids.indexOf(grupoId);
    if (index === -1) {
      ids.push(grupoId);
    } else {
      ids.splice(index, 1);
    }
    this.form.get('grupo_ids')?.setValue(ids);
  }

  goBack() {
    this.router.navigate([`admin/${this.sigla}`]);
  }

  private save(data: any) {
    const request$ =
      this.id === 0
        ? this.service.create(data)
        : this.service.update(this.id, data);

    request$.subscribe({
      next: (res: any) => {
        this.alertService.close();

        if (!res.ok) {
          this.alertService.successOrError(res.error.message, '', 'error');
          return;
        }

        this.alertService.successOrError('Registro guardado');
        this.router.navigate([`admin/${this.sigla}`]);
      },
      error: async () => {
        this.alertService.close();
        this.alertService.successOrError('Error inesperado', '', 'error');
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.alertService.loader();

    const dto = {
      ...this.form.value,
      rol_id: this.form.value.rol_id ? Number(this.form.value.rol_id) : undefined,
      movimiento_ids: (this.form.value.movimiento_ids || []).map(Number),
      grupo_ids: (this.form.value.grupo_ids || []).map(Number),
    };

    // Eliminar password vacío en edición
    if (this.editMode && !dto.password_encrypted) {
      delete dto.password_encrypted;
    }

    this.save(dto);
  }

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get nombreControl(): FormControl {
    return this.form.get('nombre_completo') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.form.get('password_encrypted') as FormControl;
  }
}
