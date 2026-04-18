import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme_preference';
  private isDarkSubject = new BehaviorSubject<boolean>(false);
  isDark$ = this.isDarkSubject.asObservable();

  constructor() {
    this.init();
  }

  private init() {
    const saved = localStorage.getItem(this.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : false; // Default: light mode
    this.apply(isDark);
  }

  get isDark(): boolean {
    return this.isDarkSubject.value;
  }

  toggle() {
    this.apply(!this.isDark);
  }

  private apply(dark: boolean) {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    }
    localStorage.setItem(this.THEME_KEY, dark ? 'dark' : 'light');
    this.isDarkSubject.next(dark);
  }
}
