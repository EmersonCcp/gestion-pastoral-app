import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AlertService } from './services/alert.service';
import { MatDialogModule } from '@angular/material/dialog';
import { HasPermissionDirective } from './directives/has-permission.directive';

@NgModule({
  declarations: [
    HasPermissionDirective,
  ],
  providers: [AlertService,

  ],
  exports: [
    CommonModule,
    HasPermissionDirective,
    MatDialogModule
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatDialogModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule { }
