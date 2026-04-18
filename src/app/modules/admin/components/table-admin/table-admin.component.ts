import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-table-admin',
  templateUrl: './table-admin.component.html',
  styleUrls: ['./table-admin.component.scss']
})
export class TableAdminComponent {
  @Input() loading = false;
  @Input() searchPlaceholder = 'Buscar...';
  @Input() showSearch = true;
  @Input() showPagination = true;
  @Input() itemsLength = 0;
  @Input() totalItems = 0;
  @Input() entityName = 'registros';
  
  @Output() search = new EventEmitter<Event>();
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  handleSearch(event: Event) {
    this.search.emit(event);
  }

  prevPage() {
    this.prev.emit();
  }

  nextPage() {
    this.next.emit();
  }
}
