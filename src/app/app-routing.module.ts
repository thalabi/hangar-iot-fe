import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { Httpstatus404Component } from './httpstatus404/httpstatus404.component';
import { Page1Component } from './page1/page1.component';

const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'page1', component: Page1Component },
    { path: 'dashboard', component: DashboardComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', component: Httpstatus404Component }

];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
