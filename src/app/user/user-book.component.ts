import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

import {combineLatest} from 'rxjs/';

import {Chap} from '../models/chap';
import {Book} from '../models/book';
import {UserBook} from '../models/user-book';
import {BookService} from '../services/book.service';
import {UserBookService} from '../services/user-book.service';

@Component({
  selector: 'user-book',
  templateUrl: './user-book.component.html',
  styleUrls: ['./user-book.component.css']
})
export class UserBookComponent implements OnInit {
  @Input() userBook: UserBook;
  @Output() onComplete = new EventEmitter<UserBook>();
  savedUserBook: UserBook;
  book: Book;
  allChaps: Chap[];
  allChapsMap: Map<string, Chap>;
  edited = false;
  editing = false;
  bookRoleOptions = UserBook.Roles;

  constructor(private bookService: BookService,
              private ubService: UserBookService) {
  }

  ngOnInit(): void {
    let obsBook = this.bookService.getDetail(this.userBook.bookId);
    let obsUserBook = this.ubService.getOne(this.userBook._id);
    combineLatest(obsBook, obsUserBook)
      .subscribe(([book, ub]) => {
        if (!book) {
          return;
        }
        this.book = book;
        this.allChaps = book.chaps || [];
        this.allChapsMap = new Map();
        for (let chap of this.allChaps) {
          this.allChapsMap.set(chap._id, chap);
        }
        this.savedUserBook = JSON.parse(JSON.stringify(ub));
        this.userBook = ub;
        this.edit();
      });
  }

  getChap(chapId) {
    return this.allChapsMap.get(chapId) || {};
  }

  reset() {
    this.userBook = JSON.parse(JSON.stringify(this.savedUserBook));
    this.edited = false;
    this.editing = false;
  }

  edit() {
    this.editing = true;
    this.edited = true;
  }

  save(complete = false) {
    let ub = this.userBook;
    ub.acquireMethod = UserBook.AcquireMethods.Bestow;
    this.ubService.update(ub).subscribe(opr => {
      if (opr.ok === 0) {
        alert(opr.message || 'Fail');
        return;
      }
      this.edited = false;
      this.editing = false;
      this.savedUserBook = JSON.parse(JSON.stringify(ub));
      if (complete) {
        this.onComplete.emit(ub);
      }
    });
  }

  complete() {
    this.save(true);
  }

  cancel() {
    this.onComplete.emit(null);
  }

}
