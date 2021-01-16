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
import {ParaCommentService} from './services/para-comment.service';
import {WordCategoryService} from './services/word-category.service';
import {AnnoFamilyService} from './services/anno-family.service';
import {AnnoGroupService} from './services/anno-group.service';
import {ReleaseService} from './services/release.service';
import {OrderService} from './services/order.service';

import {CreatedDatePipe} from './pipes/created-date.pipe';
import {CreatedDateStringPipe} from './pipes/created-date-string.pipe';
import {ClientInfoPipe} from './pipes/client-info.pipe';
import {PriceLabelPipe} from './pipes/price-label.pipe';
import {FileSizePipe} from './pipes/file-size.pipe';
import {SecondsToHmsPipe} from './pipes/seconds-to-hms.pipe';

import {AppComponent} from './app.component';
import {BookListComponent} from './book-list/book-list.component';
import {BookComponent} from './book/book.component';
import {BookInfoComponent} from './book/book-info.component';
import {BookFormComponent} from './book/book-form.component';
import {BookPacksComponent} from './book/book-packs.component';
import {BookUsersComponent} from './book/book-users.component';
import {BookImageComponent} from './book/book-image.component';
import {BookChapsComponent} from './book-chaps/book-chaps.component';
import {ChapComponent} from './chap/chap.component';
import {ChapParasComponent} from './chap/chap-paras.component';
import {ParaFormComponent} from './chap/para-form.component';
import {ParaSplitComponent} from './chap/para-split.component';
import {TransFillingComponent} from './chap/trans-filling.component';
import {SentenceAlignComponent} from './content/sentence-align.component';
import {ParaContentComponent} from './content/para-content.component';
import {ParaCommentsComponent} from './content/para-comments.component';
import {QuotedTextComponent} from './para-text/quoted-text.component';
import {WordAnnosComponent} from './content/word-annos.component';
import {DictComponent} from './dict/dict.component';
import {DictEntryComponent} from './dict/dict-entry.component';
import {DictSimpleComponent} from './dict/dict-simple.component';
import {DictSimpleSmiComponent} from './dict/dict-simple-smi.component';
import {DictEntrySmiComponent} from './dict/dict-entry-smi.component';
import {DictPhoneticsComponent} from './dict/dict-phonetics.component';
import {DictZhComponent} from './dict-zh/dict-zh.component';
import {DictZhEntryComponent} from './dict-zh/dict-zh-entry.component';
import {DictZhEntrySmiComponent} from './dict-zh/dict-zh-entry-smi.component';
import {FeedbackListComponent} from './user-feedback/feedback-list.component';
import {IssueListComponent} from './para-issue/issue-list.component';
import {CommentListComponent} from './para-comment/comment-list.component';
import {UsersAdminComponent} from './user/users-admin.component';
import {UserListComponent} from './user/user-list.component';
import {UserComponent} from './user/user.component';
import {UserInfoComponent} from './user/user-info.component';
import {UserBookComponent} from './user/user-book.component';
import {CategoryListComponent} from './word-category/category-list.component';
import {CategoryComponent} from './word-category/category.component';
import {AnnoFamilyListComponent} from './annotation/anno-family-list.component';
import {AnnoFamilyComponent} from './annotation/anno-family.component';
import {LoginComponent} from './account/login.component';
import {LoginPopupComponent} from './account/login-popup.component';
import {MyMessagesComponent} from './message/my-messages.component';
import {AdminMessagesPopupComponent} from './message/admin-messages-popup.component';
import {ReleaseListComponent} from './release/release-list.component';
import {OrderListComponent} from './order/order-list.component';
import {AppLinkComponent} from './common/app-link.component';
import {UserStatComponent} from './user/user-stat.component';
import {UserStatService} from './services/user-stat.service';
import {BookExpsComponent} from './book-list/book-exps.component';
import {HomeComponent} from './home.component';
import {BookCategoryService} from './services/book-category.service';
import {BookCategoriesComponent} from './book-category/book-categories.component';
import {CategoryBooksComponent} from './book-category/category-books.component';
import {BooksAdminComponent} from './book-list/books-admin.component';
import {BookImportComponent} from './book-chaps/book-import.component';
import {ChapTextEditComponent} from './book-chaps/chap-text-edit.component';
import {ChapTextSplitComponent} from './book-chaps/chap-text-split.component';
import {UserMessagesPopupComponent} from './message/user-messages-popup.component';


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
    HomeComponent,
    BookListComponent,
    BooksAdminComponent,
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
    TransFillingComponent,
    SentenceAlignComponent,
    ParaContentComponent,
    ParaCommentsComponent,
    QuotedTextComponent,
    WordAnnosComponent,
    DictComponent,
    DictEntryComponent,
    DictEntrySmiComponent,
    DictPhoneticsComponent,
    DictSimpleComponent,
    DictSimpleSmiComponent,
    DictZhComponent,
    DictZhEntryComponent,
    DictZhEntrySmiComponent,
    FeedbackListComponent,
    IssueListComponent,
    CommentListComponent,
    UsersAdminComponent,
    UserListComponent,
    UserComponent,
    UserInfoComponent,
    UserBookComponent,
    CreatedDatePipe,
    CreatedDateStringPipe,
    ClientInfoPipe,
    PriceLabelPipe,
    FileSizePipe,
    SecondsToHmsPipe,
    CategoryListComponent,
    CategoryComponent,
    AnnoFamilyListComponent,
    AnnoFamilyComponent,
    LoginComponent,
    LoginPopupComponent,
    MyMessagesComponent,
    AdminMessagesPopupComponent,
    ReleaseListComponent,
    OrderListComponent,
    AppLinkComponent,
    UserStatComponent,
    BookExpsComponent,
    BookCategoriesComponent,
    CategoryBooksComponent,
    BookImportComponent,
    ChapTextEditComponent,
    ChapTextSplitComponent,
    UserMessagesPopupComponent
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
    ParaCommentService,
    WordCategoryService,
    AnnoFamilyService,
    AnnoGroupService,
    ReleaseService,
    PriceLabelPipe,
    OrderService,
    UserStatService,
    BookCategoryService
  ],
  entryComponents: [
    LoginPopupComponent,
    UserInfoComponent,
    BookInfoComponent,
    BookFormComponent,
    BookPacksComponent,
    BookUsersComponent,
    BookImageComponent,
    ParaSplitComponent,
    TransFillingComponent,
    ParaCommentsComponent,
    SentenceAlignComponent,
    WordAnnosComponent,
    DictSimpleSmiComponent,
    AdminMessagesPopupComponent,
    AppLinkComponent,
    BookExpsComponent,
    CategoryBooksComponent,
    BookImportComponent,
    ChapTextEditComponent,
    ChapTextSplitComponent,
    UserMessagesPopupComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
