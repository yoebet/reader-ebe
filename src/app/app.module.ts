import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import {StickyModule} from 'ng2-sticky-kit';

import {AppRoutingModule} from './app-routing.module';

import {BookService} from './services/book.service';
import {ChapService} from './services/chap.service';
import {ParaService} from './services/para.service';

import {AppComponent} from './app.component';
import {BooksComponent} from './book/books.component';
import {BookComponent} from './book/book.component';
import {BookChapsComponent} from './book/book-chaps.component';
import {ChapComponent} from './chap/chap.component';
import {ChapParasComponent} from './chap/chap-paras.component';

@NgModule({
  declarations: [
    AppComponent,
    BooksComponent,
    BookComponent,
    BookChapsComponent,
    ChapComponent,
    ChapParasComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    StickyModule
  ],
  providers: [BookService, ChapService, ParaService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
