import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PersonaService } from '../../../../../../shared/services/persona.service';
import { AlertService } from '../../../../../../shared/services/alert.service';
import { debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-formulario-relacion-modal',
  templateUrl: './formulario-relacion-modal.component.html',
})
export class FormularioRelacionModalComponent implements OnInit {
  form: FormGroup;
  searchControl = new FormControl('');
  personasFound: any[] = [];
  isSearching = false;
  loading = false;

  parentescoTypes = ['PADRE', 'MADRE', 'TUTOR', 'HERMANO', 'CONYUGE', 'HIJO', 'ABUELO', 'TIO', 'PRIMO', 'OTRO'];

  constructor(
    private fb: FormBuilder,
    private service: PersonaService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<FormularioRelacionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { personaId: number }
  ) {
    this.form = this.fb.group({
      persona_id: [data.personaId, Validators.required],
      pariente_id: [null, Validators.required],
      parentesco: ['OTRO', Validators.required],
      es_contacto_emergencia: [false],
      es_responsable_legal: [false]
    });
  }

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || value.length < 2) {
          this.personasFound = [];
          return of({ ok: true, data: [], total: 0 });
        }
        this.isSearching = true;
        // Search by name
        return this.service.getAll({ nombre: value }).pipe(
          finalize(() => this.isSearching = false)
        );
      })
    ).subscribe((res: any) => {
      if (res.ok) {
        // Filter out current persona
        this.personasFound = res.data.filter((p: any) => p.id !== this.data.personaId);
      }
    });

    // Also search by last name if no results found or combined search
    // (In a more complex app, the backend handles this with a single 'q' param)
  }

  selectPersona(p: any) {
    this.form.patchValue({ pariente_id: p.id });
    this.personasFound = [];
    this.searchControl.setValue(`${p.nombre} ${p.apellido}`, { emitEvent: false });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.service.addRelacion(this.form.value).subscribe((res: any) => {
      this.loading = false;
      if (res.ok) {
        this.alertService.successOrError('Vínculo creado con éxito');
        this.dialogRef.close(true);
      }
    });
  }
}
