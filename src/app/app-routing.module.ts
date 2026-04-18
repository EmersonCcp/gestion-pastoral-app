import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/pages/login/login.component';
import { redirectIfAuthenticated } from './shared/guards/redirect-if-auth.guard';
import { authGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [redirectIfAuthenticated],
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then((m) => m.AdminModule),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
