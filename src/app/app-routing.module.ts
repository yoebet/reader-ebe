import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {BookListComponent} from './book/book-list.component';
import {BookComponent} from './book/book.component';
import {ChapComponent} from './chap/chap.component';
import {DictComponent} from './dict/dict.component';
import {UserListComponent} from './user/user-list.component';
import {FeedbackListComponent} from './user-feedback/feedback-list.component';
import {IssueListComponent} from './para-issue/issue-list.component';
import {UserComponent} from './user/user.component';
import {CategoryListComponent} from './word-category/category-list.component';
import {CategoryComponent} from './word-category/category.component';
import {AnnotationFamilyListComponent} from './annotation/annotation-family-list.component';
import {AnnotationFamilyComponent} from './annotation/annotation-family.component';
import {LoginComponent} from './account/login.component';
import {MyMessagesComponent} from './account/my-messages.component';

const routes: Routes = [
  {path: 'books', component: BookListComponent},
  {path: 'books/:id', component: BookComponent},
  {path: 'chaps/:id', component: ChapComponent},
  {path: 'dict', component: DictComponent},
  {path: 'dict-c', component: DictComponent, data: {editSimple: false}},
  {path: 'users', component: UserListComponent},
  {path: 'users/:id', component: UserComponent},
  {path: 'feedbacks', component: FeedbackListComponent},
  {path: 'issues', component: IssueListComponent},
  {path: 'word-categories', component: CategoryListComponent},
  {path: 'word-categories/:id', component: CategoryComponent},
  {path: 'annotations', component: AnnotationFamilyListComponent},
  {path: 'annotations/:id', component: AnnotationFamilyComponent},
  {path: 'login', component: LoginComponent},
  {path: 'my-messages', component: MyMessagesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // enableTracing: true,
    useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
