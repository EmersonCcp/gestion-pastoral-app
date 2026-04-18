import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  form:FormGroup

  constructor(private fb:FormBuilder,private router: Router, private authService: AuthService,private alertService:AlertService){
    this.form = this.initForm()
  }

  initForm(){
    return this.fb.group({
      email: ['',Validators.required],
      password: ['',[Validators.required, Validators.minLength(3)]],
    })
  }

    onSubmit() {
      
     this.alertService.loader();

    if (!this.form.valid) {
      return;
    }

    this.authService
      .login(this.form.value.email, this.form.value.password)
      .subscribe({
        next:  (res:any) => {
          
          this.router.navigate(['/admin/dashboard']);
          this.alertService.successOrError('Sesion iniciada!', `Bienvenido ${res.data.usuario.nombre}`);
        },
        error:  (err) => {
          
           this.alertService.close();
          this.alertService.successOrError('Credenciales inválidas','','error');
        },
      });
  }


}
