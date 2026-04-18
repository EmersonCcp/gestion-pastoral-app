import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-search-select-admin',
  templateUrl: './search-select-admin.component.html',
  styleUrls: ['./search-select-admin.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchSelectAdminComponent),
      multi: true,
    },
  ],
})
export class SearchSelectAdminComponent {
  @Input() items: any[] = [];
  @Input() labelKey: string = 'nombre';
  @Input() placeholder: string = 'Buscar...';
  @Input() showAdd: boolean = true;
  @Input() label = '';

  @Output() add = new EventEmitter<void>();

  open = false;
  filteredItems: any[] = [];
  displayValue = '';

  private value: any;

  ngOnInit() {
    setTimeout(() => {
      this.filteredItems = this.items;
    },1000)
    
  }

  // buscar
  onSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.displayValue = event.target.value;

    this.filteredItems = this.items.filter((item) =>
      item[this.labelKey].toLowerCase().includes(term),
    );
  }

  // seleccionar
  select(item: any) {
    this.value = item.id;
    this.displayValue = item[this.labelKey];
    this.open = false;

    this.onChange(this.value);
    this.onTouched();
  }

  // ControlValueAccessor
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;

    const found = this.items.find((i) => i.id === value);
    if (found) {
      this.displayValue = found[this.labelKey];
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  
}
