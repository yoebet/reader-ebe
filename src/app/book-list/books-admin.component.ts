import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SuiModalService} from 'ng2-semantic-ui';

import {Book} from '../models/book';
import {BookService} from '../services/book.service';
import {AnnoFamilyService} from '../services/anno-family.service';
import {OpResult} from '../models/op-result';
import {AppLink, AppLinkModal} from '../common/app-link.component';
import {SessionService} from '../services/session.service';
import {BookCategoryService} from '../services/book-category.service';
import {BookListComponent} from './book-list.component';
import {WordStatService} from '../services/word-stat.service';

@Component({
  selector: 'books-admin',
  templateUrl: './books-admin.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BooksAdminComponent extends BookListComponent implements OnInit {
  @ViewChild('newBookCode') newBookCodeEl: ElementRef;
  @ViewChild('newBookName') newBookNameEl: ElementRef;

  privilegeOperations = false;

  constructor(protected bookService: BookService,
              protected categoryService: BookCategoryService,
              protected sessionService: SessionService,
              protected annoFamilyService: AnnoFamilyService,
              protected wordStatService: WordStatService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected modalService: SuiModalService) {
    super(bookService, categoryService,
      sessionService, annoFamilyService,
      wordStatService,
      route, router, modalService);
  }

  filterVisib(visib) {
    if (this.visib === visib) {
      return;
    }
    this.visib = visib;
    this.allBooks = null;
    this.loadBooks(true);
  }

  filterStatus(status) {
    if (this.status === status) {
      return;
    }
    this.status = status;
    this.allBooks = null;
    this.loadBooks(true);
  }

  showListLink() {
    let path = 'books';
    let title = '图书列表';
    if (this.category) {
      path = `books/cat/${this.category}`;
      let catName = this.categoryNames[this.category];
      if (catName) {
        title = `图书列表（${catName}）`;
      }
    }
    let appLink = {path, title} as AppLink;
    this.modalService.open(new AppLinkModal(appLink));
  }

  showLink(book) {
    let code = book.code.toLowerCase().replace(' ', '-');
    let wxState = `rcwx${code}`;
    let appLink = {path: `books/${book._id}`, title: book.name, wxState} as AppLink;
    this.modalService.open(new AppLinkModal(appLink));
  }

  remove(book: Book): void {
    if (!confirm('Are You Sure?')) {
      return;
    }
    this.bookService
      .remove(book._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        if (this.allBooks) {
          this.allBooks = this.allBooks.filter(b => b !== book);
          this.loadBooks();
        }
      });
  }

  backup(book: Book): void {
    if (!confirm('... To Backup The Book?')) {
      return;
    }
    this.bookService.backup(book._id)
      .subscribe(clonedBook => {
        if (!clonedBook || !clonedBook.name) {
          alert('Fail To Backup.');
          return;
        }
        let index = this.books.indexOf(book);
        this.books.splice(index + 1, 0, clonedBook);
      });
  }

  createExpBook(book: Book) {
    if (!confirm('To Clone The Book?')) {
      return;
    }
    this.bookService.createExpBook(book._id)
      .subscribe(clonedBook => {
        if (!clonedBook || !clonedBook.name) {
          alert('Fail To Clone.');
          return;
        }
        let index = this.books.indexOf(book);
        this.books.splice(index + 1, 0, clonedBook);
      });
  }

  syncExpBook(book: Book) {
    if (!confirm('To Sync The Book?')) {
      return;
    }
    this.bookService.syncExpBook(book._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        alert('ok');
      });
  }

}
