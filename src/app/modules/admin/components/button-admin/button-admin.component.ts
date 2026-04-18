import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button-admin',
  templateUrl: './button-admin.component.html',
  styleUrls: ['./button-admin.component.scss'],
})
export class ButtonAdminComponent {
  @Input() label: string = '';
  @Input() icon?: string; // opcional
  @Input() disabled: boolean = false;

  @Output() onClick = new EventEmitter<void>();

  handleClick() {
    if (!this.disabled) {
      this.onClick.emit();
    }
  }
}
