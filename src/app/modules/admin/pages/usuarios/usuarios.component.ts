import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent {

  constructor(
    private router:Router
  ){}

  crear(){
    this.router.navigate(['/admin/usuarios/0/edit'])
  }

}
