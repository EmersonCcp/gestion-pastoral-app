import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent {

  constructor(
    private router:Router
  ){}

  crear(){
    this.router.navigate(['/admin/roles/0/edit'])
  }

}
