import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  OnInit,
  HostListener,
  ElementRef,
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
export class SearchSelectAdminComponent implements OnInit {
  @Input() items: any[] = [];
  @Input() labelKey: string = 'nombre';
  @Input() placeholder: string = 'Buscar...';
  @Input() showAdd: boolean = true;
  @Input() label = '';

  @Output() add = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Input() filterOnType: boolean = true;

  open = false;
  filteredItems: any[] = [];
  displayValue = '';
  private value: any;

  constructor(private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }

  ngOnInit() {
    if (!this.filterOnType) {
      this.filteredItems = this.items;
    }
  }

  onFocus() {
    if (!this.filterOnType || this.displayValue.length > 0) {
      this.open = true;
    }
  }

  // buscar
  onSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.displayValue = event.target.value;
    this.open = true;

    this.search.emit(term);

    if (this.filterOnType && !term) {
      this.filteredItems = [];
      return;
    }

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
