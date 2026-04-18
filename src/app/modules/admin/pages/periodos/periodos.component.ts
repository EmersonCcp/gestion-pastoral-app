import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-periodos',
  templateUrl: './periodos.component.html',
  styleUrls: ['./periodos.component.scss']
})
export class PeriodosComponent {

  constructor(
    private router: Router
  ) {}

  crear() {
    this.router.navigate(['/admin/periodos/0/edit']);
  }

}
