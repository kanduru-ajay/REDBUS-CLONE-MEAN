import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
import { I18nService } from '../../service/i18n.service';
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  fromoption: string = ''
  tooption: string = ''
  date: string = ''
  constructor(private router: Router, public dialog: MatDialog, private i18n: I18nService) { }
  fromEvent(option: string) {
    this.fromoption = option;
  }
  toEvent(option: string) {
    this.tooption = option;
  }
  matchDate(event: any) {
    if (event.value) {
      const date = new Date(event.value);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      this.date = `${year}-${month}-${day}`;
    } else {
      this.date = 'null';
    }
  }
  submit() {
    if (this.fromoption && this.tooption && this.date) {
      if (this.fromoption === 'Delhi' && this.tooption === 'Jaipur' || this.fromoption === 'Mumbai' && this.tooption === 'Goa' || this.fromoption === 'Bangalore' && this.tooption === 'Mysore' || this.fromoption === 'Kolkata' && this.tooption === 'Darjeeling' || this.fromoption === 'Chennai' && this.tooption === 'Pondicherry') {
        this.router.navigate(['/select-bus'],{
          queryParams:{
            departure:this.fromoption,
            arrival:this.tooption,
            date:this.date
          }
        });
      } else {
        const dialogRef = this.dialog.open(DialogComponent);

        dialogRef.afterClosed().subscribe();
      }
    } else {
      alert(this.i18n.translate('validationRequired'))
    }
  }
}
