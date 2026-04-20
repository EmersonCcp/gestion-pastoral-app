import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-table-admin',
  templateUrl: './skeleton-table-admin.component.html',
  styleUrls: ['./skeleton-table-admin.component.scss']
})
export class SkeletonTableAdminComponent {
  @Input() rowsOnly = false;
}
