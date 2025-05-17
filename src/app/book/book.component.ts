import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Location} from '@angular/common';

import {switchMap} from 'rxjs/operators';
import {SuiModalService} from 'ng2-semantic-ui';

import {Book} from '../models/book';
import {BookService} from '../services/book.service';
import {BookFormModal} from './book-form.component';
import {BookInfoModal} from './book-info.component';
import {BookPacksModal} from './book-packs.component';
import {BookUsersModal} from './book-users.component';
import {AppLink, AppLinkModal} from '../common/app-link.component';
import {SessionService} from '../services/session.service';
import {User} from '../models/user';
import {StaticResource} from '../config';
import {BookImageModal} from './book-image.component';
import {OpResult} from '../models/op-result';
import {WordStatService} from '../services/word-stat.service';
import {WordStatModal} from './word-stat.component';
import {MessageDialogModal} from '../common/message-dialog.component';
import {BookCategoryService} from '../services/book-category.service';

@Component({
  selector: 'book-detail',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {
  book: Book;
  statusNames = Book.StatusNames;
  categoryNames: Record<string, string> = {};
  bookImagesBase = StaticResource.BookImagesBase;
  bookImageNotSet = StaticResource.BookImageNotSet;

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  constructor(private bookService: BookService,
              private sessionService: SessionService,
              private wordStatService: WordStatService,
              private categoryService: BookCategoryService,
              private route: ActivatedRoute,
              private location: Location,
              public modalService: SuiModalService) {
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(switchMap((params: ParamMap) =>
      this.bookService.getDetail(params.get('id'))
    )).subscribe(book => {
      this.book = book;
    });
    this.categoryService.getCategoryNames()
      .subscribe(cns => {
        this.categoryNames = cns;
      });
  }

  showDetail() {
    this.modalService.open(new BookInfoModal(this.book));
  }

  showImage(book: Book) {
    this.modalService.open(new BookImageModal(book));
  }

  showForm() {
    let context = {book: this.book};
    this.modalService.open(new BookFormModal(context));
  }

  showPacks() {
    this.modalService.open(new BookPacksModal(this.book));
  }

  showUsers() {
    this.modalService.open(new BookUsersModal(this.book));
  }

  showLink() {
    let bookId = this.book._id;
    let appLink = {path: `books/${bookId}`, title: this.book.name, context: {bookId: bookId}} as AppLink;
    this.modalService.open(new AppLinkModal(appLink));
  }

  createExpBook() {
    if (!confirm('To Clone The Book?')) {
      return;
    }
    this.bookService.createExpBook(this.book._id)
      .subscribe((book: Book) => {
        if (book && book.name) {
          alert('OK. ' + book.name);
          return;
        }
      });
  }

  syncExpBook() {
    if (!confirm('To Sync The Book?')) {
      return;
    }
    this.bookService.syncExpBook(this.book._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        alert('ok');
      });
  }

  async showBookStat(book: Book) {
    let stat = book.stat;
    if (!stat) {
      stat = await this.wordStatService.getBookStat(book._id).toPromise();
    }
    if (stat) {
      this.modalService.open(new WordStatModal({stat, title: book.name}));
    }
  }

  async buildBookStat(book: Book) {
    let stat = book.stat;
    if (stat) {
      if (!confirm('要重新统计吗？')) {
        return;
      }
    }
    const dr = this.modalService.open(new MessageDialogModal(
      {
        title: '全书统计',
        msg: '已开始，请稍候 ...'
      }
    ));
    await this.wordStatService.buildBookStat(book._id).subscribe(stat1 => {
      dr.approve('');
      if (stat1) {
        book.stat = stat1;
        this.modalService.open(new WordStatModal({stat: stat1, title: book.name}));
        this.bookService.getDetail(book._id).subscribe(detail => {
          Object.assign(this.book, detail);
        });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
