import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdminModule } from './modules/admin/admin.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { LoginComponent } from './modules/auth/pages/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [AppComponent, LoginComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    SweetAlert2Module.forRoot(),
    BrowserAnimationsModule,
    HttpClientModule,
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyAgK0h2g4T38oGdMcJvjDYdABh99zZHNsE',
        authDomain: 'tapiceria-e4976.firebaseapp.com',
        projectId: 'tapiceria-e4976',
        storageBucket: 'tapiceria-e4976.appspot.com',
        messagingSenderId: '839401029663',
        appId: '1:839401029663:web:19385461e47be2f403552a',
        measurementId: 'G-B22SSLQMPV',
      }),
    ),
    provideStorage(() => getStorage()),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
