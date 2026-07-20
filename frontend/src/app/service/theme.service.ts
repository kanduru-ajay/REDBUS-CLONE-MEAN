import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<'light' | 'dark'>((localStorage.getItem('tedbus-theme') as 'light' | 'dark') || 'light');
  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  get theme(): 'light' | 'dark' {
    return this.themeSubject.value;
  }

  toggle(): void {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem('tedbus-theme', theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    document.body.classList.toggle('dark-theme', theme === 'dark');
  }
}
