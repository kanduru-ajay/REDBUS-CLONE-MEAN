import { Component, OnInit } from '@angular/core';
import { BusService } from '../../service/bus.service';
import { CustomerService } from '../../service/customer.service';
import { Booking } from '../../model/booking.model';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {

  selecteditem:string = 'trips';
  currentcustomer:any = {};
  currentname:string = '';
  currentemail:string = '';
  profilepicture:string = '';

  mytrip:Booking[] = [];

  constructor(
    private busbooking: BusService,
    private customerservice: CustomerService
  ) {}

  handlelistitemclick(selected:string):void {
    this.selecteditem = selected;
  }


  ngOnInit(): void {

    const user = JSON.parse(
      sessionStorage.getItem('Loggedinuser')!
    );

    console.log("Logged user:", user);


    // Get customer details from MongoDB
    this.customerservice.getCustomer(user.email)
    .subscribe((response:any)=>{

      console.log("Customer from backend:", response);

      this.currentcustomer = response;

      this.currentname = response.name;
      this.currentemail = response.email;
      this.profilepicture = response.profilepicture;

    });


    // Get bookings
    this.busbooking.getbusmongo(user._id)
    .subscribe((response:any)=>{
      this.mytrip = response;
    });

  }
}