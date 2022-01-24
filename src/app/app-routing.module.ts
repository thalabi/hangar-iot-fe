import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeviceListComponent } from './device-list/device-list.component';
import { ExecuteCommandComponent } from './execute-command/execute-command.component';
import { Httpstatus404Component } from './httpstatus404/httpstatus404.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './security/auth.guard';
import { TimersComponent } from './timers/timers.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'deviceList', component: DeviceListComponent, canActivate: [AuthGuard] },
    { path: 'executeCommand', component: ExecuteCommandComponent, canActivate: [AuthGuard] },
    { path: 'timers', component: TimersComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', component: Httpstatus404Component },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
