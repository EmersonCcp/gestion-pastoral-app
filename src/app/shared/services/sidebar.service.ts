import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private collapsedSubject = new BehaviorSubject<boolean>(false);
  collapsed$ = this.collapsedSubject.asObservable();

  private openMobileSubject = new BehaviorSubject<boolean>(false);
  openMobile$ = this.openMobileSubject.asObservable();

  toggleCollapsed() {
    this.collapsedSubject.next(!this.collapsedSubject.value);
  }

  setCollapsed(val: boolean) {
    this.collapsedSubject.next(val);
  }

  toggleMobile() {
    this.openMobileSubject.next(!this.openMobileSubject.value);
  }

  setMobileOpen(val: boolean) {
    this.openMobileSubject.next(val);
  }

  getCollapsed(): boolean {
    return this.collapsedSubject.value;
  }

  getMobileOpen(): boolean {
    return this.openMobileSubject.value;
  }
}
