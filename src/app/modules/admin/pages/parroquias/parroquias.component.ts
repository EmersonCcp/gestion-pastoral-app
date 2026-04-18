import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-parroquias',
  templateUrl: './parroquias.component.html',
  styleUrls: ['./parroquias.component.scss']
})
export class ParroquiasComponent {

  constructor(
    private router: Router
  ) {}

  crear() {
    this.router.navigate(['/admin/parroquias/0/edit']);
  }

}
