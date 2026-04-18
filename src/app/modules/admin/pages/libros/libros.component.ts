import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-libros',
  templateUrl: './libros.component.html'
})
export class LibrosComponent {
  constructor(private router: Router) {}

  crear() {
    this.router.navigate(['/admin/libros/0/new']);
  }
}
