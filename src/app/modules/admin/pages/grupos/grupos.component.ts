import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.scss']
})
export class GruposComponent {

  constructor(
    private router: Router
  ) {}

  crear() {
    this.router.navigate(['/admin/grupos/0/edit']);
  }

}
