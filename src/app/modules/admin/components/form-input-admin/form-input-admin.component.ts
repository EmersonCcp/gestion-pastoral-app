import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-input-admin',
  templateUrl: './form-input-admin.component.html',
  styleUrls: ['./form-input-admin.component.scss'],
})
export class FormInputAdminComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'checkbox' | 'date' | 'number' | 'time' | 'email' | 'tel' | 'password' = 'text';

  // FormControl externo
  @Input() @Input() control!: FormControl | any;

  constructor(){
    
  }
}
