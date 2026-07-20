import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './Component/landing-page/landing-page.component';
import { SelectbusPageComponent } from './Component/selectbus-page/selectbus-page.component';
import { PaymentPageComponent } from './Component/payment-page/payment-page.component';
import { ProfilePageComponent } from './Component/profile-page/profile-page.component';
import { CommunityPageComponent } from './Component/community-page/community-page.component';
import { NotificationsPageComponent } from './Component/notifications-page/notifications-page.component';
import { RoutePlannerPageComponent } from './Component/route-planner-page/route-planner-page.component';
import { ReviewsPageComponent } from './Component/reviews-page/reviews-page.component';
const routes: Routes = [
  {path: '',component:LandingPageComponent},
  {path: 'select-bus',component:SelectbusPageComponent},
  {path:'payment',component:PaymentPageComponent},
  {path:'profile',component:ProfilePageComponent},
  {path:'community',component:CommunityPageComponent},
  {path:'notifications',component:NotificationsPageComponent},
  {path:'route-planner',component:RoutePlannerPageComponent},
  {path:'reviews',component:ReviewsPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
