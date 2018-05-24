import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';

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
  newChaps: any[];
  bookRoleOptions = UserBook.Roles;

  constructor(private bookService: BookService,
              private ubService: UserBookService) {
  }

  ngOnInit(): void {
    let obsBook = this.bookService.getDetail(this.userBook.bookId);
    let obsUserBook = this.ubService.getOne(this.userBook._id);
    Observable.combineLatest(obsBook, obsUserBook)
      .subscribe(([book, ub]) => {
        this.book = book;
        this.allChaps = book.chaps || [];
        this.allChapsMap = new Map();
        for (let chap of this.allChaps) {
          this.allChapsMap.set(chap._id, chap);
        }
        if (!ub.chaps) {
          ub.chaps = [];
        }
        this.savedUserBook = JSON.parse(JSON.stringify(ub));
        this.userBook = ub;
      });
  }

  getChap(chapId) {
    return this.allChapsMap.get(chapId) || {};
  }

  reset() {
    this.userBook = JSON.parse(JSON.stringify(this.savedUserBook));
    this.edited = false;
    this.editing = false;
    this.newChaps = null;
  }

  edit() {
    this.editing = true;
    this.edited = true;
  }

  addChaps() {
    let candidates = this.allChaps.filter(chap =>
      this.userBook.chaps.find(c => c.chapId === chap._id) == null
    );
    this.newChaps = candidates.map(chap => {
      return {chapId: chap._id, chapName: chap.name, role: '', selected: false};
    });
    this.edited = true;
  }

  removeChap(cp) {
    if (!confirm('Are You Sure?')) {
      return;
    }
    let ub = this.userBook;
    ub.chaps = ub.chaps.filter(c => c != cp);
    ub.chapsCount = ub.chaps.length;
    this.edited = true;
  }

  save(complete = false) {
    let ub = this.userBook;
    if (!ub.chaps) {
      ub.chaps = [];
    }
    if (this.newChaps) {
      let selectedChaps = this.newChaps.filter(c => c.selected);
      for (let c of selectedChaps) {
        ub.chaps.push({chapId: c.chapId, role: c.role});
      }
      ub.chaps.sort((c1, c2) => {
        let chap1 = this.allChapsMap.get(c1.chapId);
        let chap2 = this.allChapsMap.get(c2.chapId);
        if (!chap1 || !chap2) {
          return -1;
        }
        return (chap1.no || 0) - (chap2.no || 0);
      });
    }
    ub.chapsCount = ub.chaps.length;
    this.ubService.update(ub).subscribe(opr => {
      if (opr.ok === 0) {
        alert(opr.message || 'Fail');
        return;
      }
      this.newChaps = null;
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
