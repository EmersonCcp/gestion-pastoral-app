import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-list-header-admin',
  templateUrl: './list-header-admin.component.html',
  styleUrls: ['./list-header-admin.component.scss'],
})
export class ListHeaderAdminComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;

  // Botón opcional
  @Input() buttonLabel?: string;
  @Input() buttonIcon?: string;

  @Output() buttonClick = new EventEmitter<void>();

  handleClick() {
    this.buttonClick.emit();
  }
}
