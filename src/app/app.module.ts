import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import {SuiModule} from 'ng2-semantic-ui';

import {AppRoutingModule} from './app-routing.module';

import {AppService} from './services/app.service';
import {BookService} from './services/book.service';
import {ChapService} from './services/chap.service';
import {ParaService} from './services/para.service';
import {DictService} from './services/dict.service';
import {UserService} from './services/user.service';
import {SessionService} from './services/session.service';
import {UserBookService} from './services/user-book.service';
import {WordCategoryService} from './services/word-category.service';
import {AnnoFamilyService} from './services/anno-family.service';
import {AnnoGroupService} from './services/anno-group.service';

import {CreatedDatePipe} from './pipes/created-date.pipe';
import {CreatedDateStringPipe} from './pipes/created-date-string.pipe';

import {AppComponent} from './app.component';
import {BookListComponent} from './book/book-list.component';
import {BookComponent} from './book/book.component';
import {BookChapsComponent} from './book/book-chaps.component';
import {ChapComponent} from './chap/chap.component';
import {ChapParasComponent} from './chap/chap-paras.component';
import {ParaFormComponent} from './chap/para-form.component';
import {ParaSplitComponent} from './chap/para-split.component';
import {SentenceAlignComponent} from './content/sentence-align.component';
import {ParaContentComponent} from './content/para-content.component';
import {WordAnnosComponent} from './content/word-annos.component';
import {DictComponent} from './dict/dict.component';
import {DictEntryComponent} from './dict/dict-entry.component';
import {DictSimpleComponent} from './dict/dict-simple.component';
import {DictEntrySmiComponent} from './dict/dict-entry-smi.component';
import {UserListComponent} from './user/user-list.component';
import {UserComponent} from './user/user.component';
import {UserBookComponent} from './user/user-book.component';
import {CategoryListComponent} from './word-category/category-list.component';
import {CategoryComponent} from './word-category/category.component';
import {AnnotationFamilyListComponent} from './annotation/annotation-family-list.component';
import {AnnotationFamilyComponent} from './annotation/annotation-family.component';
import {LoginComponent} from './account/login.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    SuiModule
  ],
  declarations: [
    AppComponent,
    BookListComponent,
    BookComponent,
    BookChapsComponent,
    ChapComponent,
    ChapParasComponent,
    ParaFormComponent,
    ParaSplitComponent,
    SentenceAlignComponent,
    ParaContentComponent,
    WordAnnosComponent,
    DictComponent,
    DictEntryComponent,
    DictEntrySmiComponent,
    DictSimpleComponent,
    UserListComponent,
    UserComponent,
    UserBookComponent,
    CreatedDatePipe,
    CreatedDateStringPipe,
    CategoryListComponent,
    CategoryComponent,
    AnnotationFamilyListComponent,
    AnnotationFamilyComponent,
    LoginComponent
  ],
  providers: [
    AppService,
    BookService,
    ChapService,
    ParaService,
    DictService,
    UserService,
    SessionService,
    UserBookService,
    WordCategoryService,
    AnnoFamilyService,
    AnnoGroupService
  ],
  entryComponents: [
    ParaSplitComponent,
    SentenceAlignComponent,
    WordAnnosComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
