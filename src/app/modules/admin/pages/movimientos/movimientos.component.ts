import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.scss']
})
export class MovimientosComponent {

  constructor(
    private router: Router
  ) {}

  crear() {
    this.router.navigate(['/admin/movimientos/0/edit']);
  }

}
