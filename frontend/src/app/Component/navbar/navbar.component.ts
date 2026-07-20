import { Component, OnInit } from '@angular/core';
declare var google:any;
import { CustomerService } from '../../service/customer.service';
import { Router } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { ThemeService } from '../../service/theme.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
constructor(private router:Router,private customerservice:CustomerService, public i18n:I18nService, public themeService:ThemeService){}
isloggedIn:boolean=false
ngOnInit(): void {
  if(sessionStorage.getItem("Loggedinuser")){
    this.isloggedIn=true
  }else{
    this.isloggedIn=false
  }


  google.accounts.id.initialize({
    client_id:"219794022558-rm6cibeebapkp2dgnnbi266igo7i5nrq.apps.googleusercontent.com",
    callback:(response:any)=>{this.handlelogin(response);

    }
  })
}
ngAfterViewInit():void{
  this.rendergooglebutton();
}
private rendergooglebutton():void{
  const googlebtn=document.getElementById('google-btn');
  if(googlebtn){
    google.accounts.id.renderButton(googlebtn,{
      theme:'outline',
      size:'medium',
      shape:'pill',
      width:150,
    })
  }
}

private decodetoken(token:String){
  return JSON.parse(atob(token.split(".")[1]))
}
handlelogin(response:any){
  const payload=this.decodetoken(response.credential)
  this.customerservice.addcustomermongo(payload).subscribe({
    next:(response)=>{
      sessionStorage.setItem("Loggedinuser",JSON.stringify(response))
    },
    error:(error)=>{
      sessionStorage.setItem('tedbus-network-error', error?.error?.error || 'Sign-in failed. Please retry.')
    }
  })
}
handlelogout(){
  google.accounts.id.disableAutoSelect();
  sessionStorage.removeItem('Loggedinuser');
  window.location.reload()
}
navigate(route:string){
  this.router.navigate([route])
}
changeLanguage(language:string){
  this.i18n.setLanguage(language)
}
toggleTheme(){
  this.themeService.toggle()
}
}
