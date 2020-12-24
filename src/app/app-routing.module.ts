import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {BookListComponent} from './book-list/book-list.component';
import {BookComponent} from './book/book.component';
import {ChapComponent} from './chap/chap.component';
import {DictComponent} from './dict/dict.component';
import {DictZhComponent} from './dict-zh/dict-zh.component';
import {UserListComponent} from './user/user-list.component';
import {UsersComponent} from './user/users.component';
import {FeedbackListComponent} from './user-feedback/feedback-list.component';
import {IssueListComponent} from './para-issue/issue-list.component';
import {CommentListComponent} from './para-comment/comment-list.component';
import {UserComponent} from './user/user.component';
import {CategoryListComponent} from './word-category/category-list.component';
import {CategoryComponent} from './word-category/category.component';
import {AnnoFamilyListComponent} from './annotation/anno-family-list.component';
import {AnnoFamilyComponent} from './annotation/anno-family.component';
import {LoginComponent} from './account/login.component';
import {MyMessagesComponent} from './account/my-messages.component';
import {ReleaseListComponent} from './release/release-list.component';
import {OrderListComponent} from './order/order-list.component';
import {UserStatComponent} from './user/user-stat.component';
import {HomeComponent} from './home.component';
import {BookCategoriesComponent} from './book-category/book-categories.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', component: HomeComponent},
  {path: 'books', component: BookListComponent},
  {path: 'book-categories', component: BookCategoriesComponent},
  {path: 'books/cat/:cat', component: BookListComponent},
  {path: 'books/vis/:vis', component: BookListComponent},
  {path: 'books/:id', component: BookComponent},
  {path: 'chaps/:id', component: ChapComponent},
  {path: 'dict', component: DictComponent},
  {path: 'dict-c', component: DictComponent, data: {editSimple: false}},
  {path: 'dict-zh', component: DictZhComponent},
  {path: 'users', component: UsersComponent},
  {path: 'users-admin', component: UserListComponent},
  {path: 'users/:id', component: UserComponent},
  {path: 'feedbacks', component: FeedbackListComponent},
  {path: 'issues', component: IssueListComponent},
  {path: 'comments', component: CommentListComponent},
  {path: 'word-categories', component: CategoryListComponent},
  {path: 'word-categories/:id', component: CategoryComponent},
  {path: 'annotations', component: AnnoFamilyListComponent},
  {path: 'annotations/:id', component: AnnoFamilyComponent},
  {path: 'login', component: LoginComponent},
  {path: 'my-messages', component: MyMessagesComponent},
  {path: 'releases', component: ReleaseListComponent},
  {path: 'orders', component: OrderListComponent},
  {path: 'stat', component: UserStatComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // enableTracing: true,
    // useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
