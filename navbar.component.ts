import { Component, OnInit, AfterViewInit } from '@angular/core';
declare var google:any;
import { CustomerService } from '../../service/customer.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../service/language.service';
import { ThemeService } from '../../service/theme.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, AfterViewInit {
  isloggedIn = false;
  currentLanguage = 'en';
  isDarkMode = false;
  private currentUserId?: string;

  constructor(
    private router: Router,
    private customerservice: CustomerService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const savedLang = this.languageService.getStoredLanguage();
    this.currentLanguage = savedLang;
    this.languageService.getLanguage().subscribe((lang) => {
      this.currentLanguage = lang;
      this.translate.use(lang);
    });

    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';

    const storedUser = sessionStorage.getItem('Loggedinuser');
    if (storedUser) {
      this.isloggedIn = true;
      try {
        const user = JSON.parse(storedUser);
        this.currentUserId = user?._id;
      } catch {
        this.currentUserId = undefined;
      }
    } else {
      this.isloggedIn = false;
    }

    google.accounts.id.initialize({
      client_id:
        '219794022558-rm6cibeebapkp2dgnnbi266igo7i5nrq.apps.googleusercontent.com',
      callback: (response: any) => {
        this.handlelogin(response);
      }
    });
  }

  ngAfterViewInit(): void {
    this.rendergooglebutton();
  }

  changeLanguage(language: string): void {
    this.languageService.setLanguage(language);
    this.translate.use(language);

    if (this.currentUserId) {
      this.languageService.persistLanguageForUser(this.currentUserId, language);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
  }

  private rendergooglebutton(): void {
    const googlebtn = document.getElementById('google-btn');
    if (googlebtn) {
      google.accounts.id.renderButton(googlebtn, {
        theme: 'outline',
        size: 'medium',
        shape: 'pill',
        width: 150
      });
    }
  }

  private decodetoken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }

  handlelogin(response: any) {
    const payload = this.decodetoken(response.credential);
    this.customerservice.addcustomermongo(payload).subscribe({
      next: (response) => {
        console.log('POST success', response);
        sessionStorage.setItem('Loggedinuser', JSON.stringify(response));
      },
      error: (error) => {
        console.error('Post request failed', error);
      }
    });
  }

  handlelogout() {
    google.accounts.id.disableAutoSelect();
    sessionStorage.removeItem('Loggedinuser');
    window.location.reload();
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }
}
