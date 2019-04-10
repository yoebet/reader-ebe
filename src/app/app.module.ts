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
import {DictZhService} from './services/dict-zh.service';
import {UserService} from './services/user.service';
import {SessionService} from './services/session.service';
import {UserBookService} from './services/user-book.service';
import {UserMessageService} from './services/user-message.service';
import {FeedbackService} from './services/feedback.service';
import {ParaIssueService} from './services/para-issue.service';
import {WordCategoryService} from './services/word-category.service';
import {AnnoFamilyService} from './services/anno-family.service';
import {AnnoGroupService} from './services/anno-group.service';
import {ReleaseService} from './services/release.service';

import {CreatedDatePipe} from './pipes/created-date.pipe';
import {CreatedDateStringPipe} from './pipes/created-date-string.pipe';
import {ClientInfoPipe} from './pipes/client-info.pipe';
import {PriceLabelPipe} from './pipes/price-label.pipe';
import {FileSizePipe} from './pipes/file-size.pipe';

import {AppComponent} from './app.component';
import {BookListComponent} from './book/book-list.component';
import {BookComponent} from './book/book.component';
import {BookInfoComponent} from './book/book-info.component';
import {BookFormComponent} from './book/book-form.component';
import {BookPacksComponent} from './book/book-packs.component';
import {BookUsersComponent} from './book/book-users.component';
import {BookImageComponent} from './book/book-image.component';
import {BookChapsComponent} from './book/book-chaps.component';
import {ChapComponent} from './chap/chap.component';
import {ChapParasComponent} from './chap/chap-paras.component';
import {ParaFormComponent} from './chap/para-form.component';
import {ParaSplitComponent} from './chap/para-split.component';
import {SentenceAlignComponent} from './content/sentence-align.component';
import {ParaContentComponent} from './content/para-content.component';
import {QuotedTextComponent} from './para-text/quoted-text.component';
import {WordAnnosComponent} from './content/word-annos.component';
import {DictComponent} from './dict/dict.component';
import {DictEntryComponent} from './dict/dict-entry.component';
import {DictSimpleComponent} from './dict/dict-simple.component';
import {DictEntrySmiComponent} from './dict/dict-entry-smi.component';
import {DictZhComponent} from './dict-zh/dict-zh.component';
import {DictZhEntryComponent} from './dict-zh/dict-zh-entry.component';
import {UserListComponent} from './user/user-list.component';
import {FeedbackListComponent} from './user-feedback/feedback-list.component';
import {IssueListComponent} from './para-issue/issue-list.component';
import {UserComponent} from './user/user.component';
import {UserBookComponent} from './user/user-book.component';
import {CategoryListComponent} from './word-category/category-list.component';
import {CategoryComponent} from './word-category/category.component';
import {AnnoFamilyListComponent} from './annotation/anno-family-list.component';
import {AnnoFamilyComponent} from './annotation/anno-family.component';
import {LoginComponent} from './account/login.component';
import {LoginPopupComponent} from './account/login-popup.component';
import {MyMessagesComponent} from './account/my-messages.component';
import {MessagesPopupComponent} from './message/messages-popup.component';
import {ReleaseListComponent} from './release/release-list.component';

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
    BookInfoComponent,
    BookFormComponent,
    BookPacksComponent,
    BookUsersComponent,
    BookImageComponent,
    BookChapsComponent,
    ChapComponent,
    ChapParasComponent,
    ParaFormComponent,
    ParaSplitComponent,
    SentenceAlignComponent,
    ParaContentComponent,
    QuotedTextComponent,
    WordAnnosComponent,
    DictComponent,
    DictEntryComponent,
    DictEntrySmiComponent,
    DictSimpleComponent,
    DictZhComponent,
    DictZhEntryComponent,
    UserListComponent,
    FeedbackListComponent,
    IssueListComponent,
    UserComponent,
    UserBookComponent,
    CreatedDatePipe,
    CreatedDateStringPipe,
    ClientInfoPipe,
    PriceLabelPipe,
    FileSizePipe,
    CategoryListComponent,
    CategoryComponent,
    AnnoFamilyListComponent,
    AnnoFamilyComponent,
    LoginComponent,
    LoginPopupComponent,
    MyMessagesComponent,
    MessagesPopupComponent,
    ReleaseListComponent
  ],
  providers: [
    AppService,
    BookService,
    ChapService,
    ParaService,
    DictService,
    DictZhService,
    UserService,
    SessionService,
    UserBookService,
    UserMessageService,
    FeedbackService,
    ParaIssueService,
    WordCategoryService,
    AnnoFamilyService,
    AnnoGroupService,
    ReleaseService,
    PriceLabelPipe
  ],
  entryComponents: [
    LoginPopupComponent,
    BookInfoComponent,
    BookFormComponent,
    BookPacksComponent,
    BookUsersComponent,
    BookImageComponent,
    ParaSplitComponent,
    SentenceAlignComponent,
    WordAnnosComponent,
    MessagesPopupComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
