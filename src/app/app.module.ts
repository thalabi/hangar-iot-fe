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
import { myRxStompConfig } from './my-rx-stomp.config';
import { HomeComponent } from './home/home.component';
import { Page1Component } from './page1/page1.component';


@NgModule({
    declarations: [
        AppComponent,
        DashboardComponent,
        Httpstatus404Component,
        StatusComponent,
        HomeComponent,
        Page1Component,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        SelectButtonModule, MessagesModule, MessageModule, ButtonModule, DropdownModule, BrowserAnimationsModule
    ],
    providers: [
        { provide: InjectableRxStompConfig, useValue: myRxStompConfig },
        { provide: RxStompService, useFactory: rxStompServiceFactory, deps: [InjectableRxStompConfig] }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
