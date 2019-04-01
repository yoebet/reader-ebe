import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Location} from '@angular/common';
import 'rxjs/add/operator/switchMap';

import {User} from '../models/user';
import {Book} from '../models/book';
import {UserBook} from '../models/user-book';
import {UserService} from '../services/user.service';
import {BookService} from '../services/book.service';
import {UserBookService} from '../services/user-book.service';
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
  candidateBooks: any[];
  newUserBook: UserBook;
  bookRoleOptions = UserBook.Roles;
  editingUserBook: UserBook;
  statusNames = Book.StatusNames;

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


  editUserBook(ub) {
    this.editingUserBook = ub;
  }

  selectBook() {
    let ecb = () => {
      this.candidateBooks = this.allBooks
        .filter(b =>
          this.userBooks.find(ub => ub.bookId === b._id) == null
        ).map(b => {
          return {label: b.label, bookId: b._id, status: b.status, selected: false};
        });
    };
    if (this.allBooks) {
      ecb();
      this.newUserBook = new UserBook();
      this.newUserBook.isAllChaps = true;
      return;
    }
    this.bookService.list()
      .subscribe(books => {
        this.allBooks = books;
        for (let book of books) {
          book.label = `(${book.code}) ${book.name}`;
        }
        ecb();
        this.newUserBook = new UserBook();
        this.newUserBook.isAllChaps = true;
      });
  }

  addUserBook() {
    let nub = this.newUserBook;
    if (!nub.book) {
      return;
    }
    nub.userId = this.user._id;
    nub.bookId = nub.book._id;
    nub.chapsCount = 0;
    // nub.acquireMethod = UserBook.AcquireMethods.Bestow;
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


  addUserBooks() {
    let nub = this.newUserBook;
    let ubs = {isAllChaps: nub.isAllChaps, role: nub.role} as any;
    let bookIds = this.candidateBooks.filter(b => b.selected).map(b => b.bookId);
    if (bookIds.length === 0) {
      return;
    }
    ubs.bookIds = bookIds;
    this.userService.addBooks(this.user._id, ubs)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        for (let bookId of ubs.bookIds) {
          let ub = {isAllChaps: ubs.isAllChaps, role: ubs.role, bookId} as UserBook;
          ub.book = this.allBooks.find(b => b._id === bookId);
          this.userBooks.push(ub);
        }
        this.newUserBook = null;
      });
  }

  toggleAll() {
    let cbs = this.candidateBooks;
    if (!cbs || cbs.length === 0) {
      return;
    }
    let s = !cbs[0].selected;
    for (let b of cbs) {
      b.selected = s;
    }
  }

  toggleReleased() {
    let cbs = this.candidateBooks;
    if (!cbs || cbs.length === 0) {
      return;
    }
    let reach = false;
    let s = false;
    for (let b of cbs) {
      if (b.status !== 'R') {
        continue;
      }
      if (!reach) {
        reach = true;
        s = !b.selected;
      }
      b.selected = s;
    }
  }

  cancelNewUserBook() {
    this.newUserBook = null;
  }

  updateUserBook(userBook) {
    if (userBook && this.editingUserBook) {
      this.editingUserBook.role = userBook.role;
      this.editingUserBook.isAllChaps = userBook.isAllChaps;
      this.editingUserBook.chapsCount = userBook.chapsCount;
    }
    this.editingUserBook = null;
  }

  goBack(): void {
    if (this.editingUserBook) {
      this.editingUserBook = null;
      return;
    }
    this.location.back();
  }
}
