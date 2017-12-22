import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {BooksComponent} from './book/books.component';
import {BookComponent} from './book/book.component';
import {ChapComponent} from './chap/chap.component';
import {DictComponent} from './dict/dict.component';
import {UsersComponent} from './user/users.component';
import {UserComponent} from './user/user.component';

const routes: Routes = [
  // {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  {path: 'books', component: BooksComponent},
  {path: 'books/:id', component: BookComponent},
  {path: 'chaps/:id', component: ChapComponent},
  {path: 'dict', component: DictComponent},
  {path: 'users', component: UsersComponent},
  {path: 'users/:id', component: UserComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
