import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Httpstatus404Component } from './httpstatus404/httpstatus404.component';
import { LoginComponent } from './login/login.component';
import { Page1Component } from './page1/page1.component';
import { AuthGuard } from './security/auth.guard';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'devices', component: Page1Component, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', component: Httpstatus404Component },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
