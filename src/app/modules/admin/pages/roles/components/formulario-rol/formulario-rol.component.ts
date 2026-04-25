import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { IPermiso } from 'src/app/shared/interfaces/entities/permiso.entity';
import { IRol } from 'src/app/shared/interfaces/entities/rol.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { PermisoService } from 'src/app/shared/services/permiso.service';
import { RolesService } from 'src/app/shared/services/roles.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-formulario-rol',
  templateUrl: './formulario-rol.component.html',
  styleUrls: ['./formulario-rol.component.scss']
})
export class FormularioRolComponent {
  loading = false;
  rol!: IRol;
  id = 0;
  form: FormGroup;
  disabled = false;
  sigla = 'roles';
  editMode = false;

  selectedPermisos: number[] = [];
  permisos: IPermiso[] = [];
  groupedPermisos: Record<string, IPermiso[]> = {};
  openSubject: Record<string, boolean> = {};
  // openSubject: string | null = null;

  constructor(
    private service: RolesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private alertService: AlertService,
    private permisosService: PermisoService,
    private authService: AuthService
  ) {
    this.form = this.initForm();
  }

  ngOnInit() {
    this.loadPermisos();
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
    }

    if (this.disabled) {
      this.form.disable();
    }
  }

  private loadData() {
    this.service.getById(this.id).subscribe((res) => {
      if (res.ok) {

        this.form.patchValue(res.data);
        this.selectedPermisos =
          res.data.rolPermisos?.map((rp: any) => rp.permiso.id) ||
          [];


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

  initForm() {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(255)]],
      estado: [true],
    });
  }

  loadPermisos() {
    const query: any = {
      page: 1,
      per_page: 5000,
    };

    this.permisosService.getAll(query).subscribe((res) => {

      if (res.ok) {
        this.permisos = res.data;

        this.groupedPermisos = this.permisos.reduce((acc, perm) => {
          if (!acc[perm.sujeto]) acc[perm.sujeto] = [];
          acc[perm.sujeto].push(perm);
          return acc;
        }, {} as Record<string, IPermiso[]>);

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

  goBack() {
    this.router.navigate([`admin/${this.sigla}`]);
  }

  private save(rol: IRol) {
    const request$ =
      this.id === 0
        ? this.service.create(rol)
        : this.service.update(this.id, rol);

    request$.subscribe({
      next: (res: any) => {
        this.alertService.close();

        if (!res.ok) {

          this.alertService.successOrError(res.error.message, '', 'error');
          return;
        }

        this.alertService.successOrError('Registro guardado');
        
        // Refresh permissions instantly
        this.authService.refreshPermissions().subscribe();
        
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
      permisos: this.selectedPermisos,
    };


    this.save(dto);
  }

  togglePermisos(id: number) {
    const idx = this.selectedPermisos.indexOf(id);
    if (idx === -1) this.selectedPermisos.push(id);
    else this.selectedPermisos.splice(idx, 1);
  }

  toggleSubject(sujeto: string) {
    this.openSubject[sujeto] = !this.openSubject[sujeto];
  }

  get permisoGroups(): string[] {
    return Object.keys(this.groupedPermisos);
  }

  get descripcionControl(): FormControl {
    return this.form.get('descripcion') as FormControl;
  }

  get nombreControl(): FormControl {
    return this.form.get('nombre') as FormControl;
  }
}
