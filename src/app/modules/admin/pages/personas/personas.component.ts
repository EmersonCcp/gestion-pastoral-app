import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-personas',
  templateUrl: './personas.component.html',
  styleUrls: ['./personas.component.scss']
})
export class PersonasComponent {

  constructor(
    private router: Router
  ) {}

  crear() {
    this.router.navigate(['/admin/personas/0/edit']);
  }

}
