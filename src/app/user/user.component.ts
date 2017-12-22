import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Location} from '@angular/common';
import 'rxjs/add/operator/switchMap';

import {User} from '../models/user';
import {Book} from '../models/book';
import {UserBook} from '../models/user_book';
import {UserService} from '../services/user.service';
import {BookService} from '../services/book.service';
import {UserBookService} from '../services/user_book.service';
import {OpResult} from '../models/op-result';

@Component({
  selector: 'user-detail',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  user: User;
  userBooks: UserBook[];
  allBooks: Book[];
  candidateBooks: Book[];
  newUserBook: UserBook;
  bookRoleOptions = UserBook.roles;

  constructor(private userService: UserService,
              private bookService: BookService,
              private userBookService: UserBookService,
              private route: ActivatedRoute,
              private location: Location) {
  }

  ngOnInit(): void {
    // this.route.paramMap.switchMap((params: ParamMap) => {
    this.route.paramMap.subscribe((params: ParamMap) => {
      let userId = params.get('id');
      let us = this.userService;
      us.getOne(userId).subscribe(user => {
        this.user = user;
      });
      us.userBooks(userId).subscribe(userBooks => {
        this.userBooks = userBooks;
        for (let ub of userBooks) {
          this.bookService.getOne(ub.bookId)
            .subscribe(book => ub.book = book);
        }
      });
    });
  }

  removeUser(): void {
    //check...
    if (!confirm('Are You Sure?')) {
      return;
    }
    this.userService
      .remove(this.user)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.goBack();
      });
  }

  selectBook() {
    let ecb = () => {
      this.candidateBooks = this.allBooks
        .filter(b =>
          this.userBooks.find(ub => ub.bookId === b._id) == null
        );
    };
    if (this.allBooks) {
      ecb();
      this.newUserBook = new UserBook();
      return;
    }
    this.bookService.list()
      .subscribe(books => {
        this.allBooks = books;
        ecb();
        this.newUserBook = new UserBook();
      });
  }

  addUserBook() {
    let nub = this.newUserBook;
    if (!nub.book) {
      return;
    }
    nub.userId = this.user._id;
    nub.bookId = nub.book._id;
    let book = nub.book;
    delete nub.book;
    this.userBookService.create(nub).subscribe(ub => {
      this.newUserBook = null;
      ub.book = book;
      this.userBooks.push(ub);
    });
  }

  removeUserBook(userBook: UserBook) {
    if (!confirm('Are You Sure?')) {
      return;
    }
    this.userBookService
      .remove(userBook)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.userBooks = this.userBooks.filter(ub => ub != userBook);
      });
  }

  cancelNewUserBook() {
    this.newUserBook = null;
  }

  goBack(): void {
    this.location.back();
  }
}
