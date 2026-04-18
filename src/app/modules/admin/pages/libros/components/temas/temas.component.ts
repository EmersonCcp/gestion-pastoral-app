import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tema } from 'src/app/shared/interfaces/entities/tema.entity';
import { AlertService } from 'src/app/shared/services/alert.service';
import { TemaService } from 'src/app/shared/services/tema.service';

@Component({
  selector: 'app-temas',
  templateUrl: './temas.component.html'
})
export class TemasComponent implements OnInit {
  @Input() libroId!: number;
  temas: Tema[] = [];
  loading = false;
  showForm = false;
  form: FormGroup;
  editingId: number | null = null;

  constructor(
    private service: TemaService,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      titulo: ['', [Validators.required]],
      descripcion: [''],
      numero_tema: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    if (this.libroId) this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getAll({ libro_id: this.libroId, per_page: 100 }).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.temas = res.data.sort((a: Tema, b: Tema) => a.numero_tema - b.numero_tema);
      }
    });
  }

  nuevo() {
    this.editingId = null;
    this.form.reset({ numero_tema: this.temas.length + 1 });
    this.showForm = true;
  }

  editar(t: Tema) {
    this.editingId = t.id;
    this.form.patchValue(t);
    this.showForm = true;
  }

  guardar() {
    if (this.form.invalid) return;
    const data = { ...this.form.value, libro_id: this.libroId };
    const request$ = this.editingId ? this.service.update(this.editingId, data) : this.service.create(data);

    this.loading = true;
    request$.subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.alertService.successOrError('Tema guardado');
        this.showForm = false;
        this.loadData();
      }
    });
  }

  eliminar(t: Tema) {
    this.alertService.confirmDelete(() => {
      this.service.delete(t.id).subscribe((res: any) => {
        if (res.ok) {
          this.alertService.successOrError('Tema eliminado');
          this.loadData();
        }
      });
    });
  }
}
