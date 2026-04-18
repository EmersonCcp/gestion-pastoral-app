import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ICategoria } from 'src/app/shared/interfaces/entities/categoria.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CategoriaService } from 'src/app/shared/services/categoria.service';
import { FormularioCategoriaComponent } from '../formulario-categoria/formulario-categoria.component';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-listado-categorias',
  templateUrl: './listado-categorias.component.html',
  styleUrls: ['./listado-categorias.component.scss'],
})
export class ListadoCategoriasComponent implements OnInit, OnChanges {
  categorias: ICategoria[] = [];
  per_page = 10;
  page = 1;
  loading = false;
  search = '';
  sort_by: string = 'nombre';
  sort_dir: 'asc' | 'desc' = 'desc';
  total_items = 0;
  total_pages = 0;
  @Input() refreshTrigger!: number;
  mostrarFormulario = false;
  categoria!: ICategoria;

  constructor(
    private categoriaService: CategoriaService,
    private router: Router,
    private alertService: AlertService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTrigger']) {
      this.loadData();
    }
  }

  loadData() {
    const query = {
      page: this.page,
      per_page: this.per_page,
      search: this.search,
      nombre: this.search,
      sort_by: this.sort_by,
      sort_dir: this.sort_dir,
    };
    this.categoriaService.getAll(query).subscribe((res) => {
      if (res.ok) {
        this.categorias = res.data;
        this.loading = true;
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

  refresh() {
    this.mostrarFormulario = false;
    this.loadData();
  }

  cerrarModal() {
    this.mostrarFormulario = false;
  }

  editCategoria(categoria: ICategoria) {
    const ref = this.dialog.open(FormularioCategoriaComponent, {
      width: '400px',
      data: categoria,
    });

    ref.afterClosed().subscribe((result: ICategoria) => {
      if (result) {
        this.loadData();
      }
    });
  }

  removeCategoria(categoria: ICategoria) {
    this.alertService.confirmDelete(() => {
      this.alertService.loader();
      this.categoriaService.delete(categoria.id).subscribe({
        next: (res) => {
          if (res.ok) {
            this.alertService.successOrError();
            this.categorias = this.categorias.filter(
              (c) => c.id !== categoria.id,
            );
          } else {
            const errorMsg = res?.error.message || res?.error?.message || res?.error.code || 'Error inesperado';
            if (this.alertService) {
              this.alertService.successOrError('Ocurrió un error', errorMsg, 'error');
            } else {
              console.error('API Error:', errorMsg);
            }
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
}
