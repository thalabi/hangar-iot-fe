import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Httpstatus404Component } from './httpstatus404/httpstatus404.component';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InjectableRxStompConfig, RxStompService, rxStompServiceFactory } from '@stomp/ng2-stompjs';
import { StatusComponent } from './status/status.component';
import { LoginComponent } from './login/login.component';
import { PasswordModule } from 'primeng/password';
import { JwtInterceptorService } from './service/jwt-interceptor.service';
import { MenuComponent } from './menu/menu.component';
import { MenubarModule } from 'primeng/menubar';
import { RxStompConfig } from './rx-stomp.config';
import { SessionService } from './service/session.service';
import { HttpErrorInterceptorService } from './service/http-error-interceptor.service';
import { MessageService } from 'primeng/api';
import { DeviceListComponent } from './device-list/device-list.component';
import { OverlayPanelModule } from 'primeng/overlaypanel'
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { BooleanPipe } from './boolean.pipe';
import { ExecuteCommandComponent } from './execute-command/execute-command.component';
import { FieldsetModule } from 'primeng/fieldset';
import { TimersComponent } from './timers/timers.component';
import { MultiSelectModule } from 'primeng/multiselect';

@NgModule({
    declarations: [
        AppComponent,
        DashboardComponent,
        Httpstatus404Component,
        StatusComponent,
        LoginComponent,
        MenuComponent,
        DeviceListComponent,
        BooleanPipe,
        ExecuteCommandComponent,
        TimersComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        InputTextModule, SelectButtonModule, MessageModule, MessagesModule, ButtonModule, DropdownModule, BrowserAnimationsModule, PasswordModule,
        MenubarModule, OverlayPanelModule, TableModule, FieldsetModule, MultiSelectModule
    ],
    providers: [
        MessageService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorService, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptorService, multi: true },
        //{ provide: InjectableRxStompConfig, useValue: myRxStompConfig },
        { provide: InjectableRxStompConfig, useClass: RxStompConfig, deps: [SessionService] },
        { provide: RxStompService, useFactory: rxStompServiceFactory, deps: [InjectableRxStompConfig] }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
