import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DesarrolloClase } from 'src/app/shared/interfaces/entities/desarrollo-clase.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { DesarrolloClaseService } from 'src/app/shared/services/desarrollo-clase.service';

@Component({
  selector: 'app-desarrollo-clase',
  templateUrl: './desarrollo-clase.component.html'
})
export class DesarrolloClaseComponent implements OnInit {
  sesiones: DesarrolloClase[] = [];
  loading = false;
  total_items = 0;
  page = 1;
  per_page = 20;

  constructor(
    private service: DesarrolloClaseService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getAll({ page: this.page, per_page: this.per_page }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.sesiones = res.data;
        this.total_items = res.meta?.paging?.total_items || 0;
      }
    });
  }

  nueva() {
    this.router.navigate(['/admin/desarrollo-clase/0/new']);
  }

  editar(s: DesarrolloClase) {
    this.router.navigate([`/admin/desarrollo-clase/${s.id}/edit`]);
  }

  eliminar(s: DesarrolloClase) {
    this.alertService.confirmDelete(() => {
      this.alertService.loader()
      this.service.delete(s.id).subscribe((res: any) => {
        console.log(res);
        
        this.alertService.close()
        if (res.ok) {
          this.alertService.successOrError('Sesión eliminada');
          this.loadData();
        }
      });
    });
  }
}
