import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';

import {combineLatest} from 'rxjs/';

import {SuiModalService} from 'ng2-semantic-ui';

import {StaticResource} from '../config';
import {Book} from '../models/book';
import {AnnotationFamily} from '../models/annotation-family';
import {BookService} from '../services/book.service';
import {AnnoFamilyService} from '../services/anno-family.service';
import {OpResult} from '../models/op-result';
import {BookInfoModal} from './book-info.component';
import {BookFormModal} from './book-form.component';
import {BookImageModal} from './book-image.component';
import {BookPacksModal} from './book-packs.component';
import {BookUsersModal} from './book-users.component';
import {SortableListComponent} from '../common/sortable-list.component';
import {AppLinkModal, AppLink} from '../common/app-link.component';
import {SessionService} from '../services/session.service';
import {User} from '../models/user';
import {BookExpsModal} from './book-exps.component';

@Component({
  selector: 'book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent extends SortableListComponent implements OnInit {
  @ViewChild('newBookCode') newBookCodeEl: ElementRef;
  @ViewChild('newBookName') newBookNameEl: ElementRef;
  books: Book[] = [];
  allBooks: Book[] = null;
  newBook: Book = null;
  privilegeOperations = false;
  showZh = true;
  category: string;
  visib: string;
  status: string;

  langOptions = Book.LangTypes;
  statusNames = Book.StatusNames;
  categoryNames = Book.CategoryNames;
  bookImagesBase = StaticResource.BookImagesBase;
  bookImageNotSet = StaticResource.BookImageNotSet;

  annOptions: AnnotationFamily[];

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  get modelList() {
    return this.books;
  }

  get sortableService() {
    return this.bookService;
  }

  constructor(private bookService: BookService,
              private sessionService: SessionService,
              private annoFamilyService: AnnoFamilyService,
              private route: ActivatedRoute,
              private modalService: SuiModalService) {
    super();
  }

  ngOnInit(): void {
    this.annoFamilyService
      .getCandidates()
      .subscribe(afs => this.annOptions = afs);

    combineLatest(this.route.paramMap, this.route.queryParamMap)
      .subscribe(([pathParams, params]) => {

          let cu = this.currentUser;
          let isAdmin = cu && (cu.role === 'A' || cu.role === 'R');

          let cat = pathParams.get('cat') || params.get('cat') || this.category;
          let visib = pathParams.get('vis') || params.get('vis') || this.visib;
          let status = params.get('status');
          if (cat) {
            this.category = cat;
          }
          if (visib) {
            this.visib = visib;
            this.allBooks = null;
          } else if (isAdmin) {
            this.visib = 'pub';
          }
          if (status) {
            this.status = status;
          }

          this.loadBooks(this.category);
        }
      );
  }

  loadBooks(cat = null) {
    this.category = cat;
    if (this.category) {
      if (this.allBooks) {
        this.books = this.allBooks.filter(b => b.category === this.category);
        return;
      }
    } else {
      if (this.allBooks) {
        this.books = this.allBooks;
        return;
      }
    }
    let listOptions = {cat: this.category, visib: this.visib, status: this.status};
    this.bookService.list(listOptions)
      .subscribe(books => {
        this.books = books;
        if (!this.category) {
          this.allBooks = books;
        }
      });
  }

  filterVisib(visib) {
    if (this.visib === visib) {
      return;
    }
    this.visib = visib;
    this.allBooks = null;
    this.loadBooks();
  }

  filterStatus(status) {
    if (this.status === status) {
      return;
    }
    this.status = status;
    this.allBooks = null;
    this.loadBooks();
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

  showExpBooks() {
    this.modalService.open(new BookExpsModal(this.onAddExpBook.bind(this)));
  }

  showLink(book) {
    let code = book.code.toLowerCase().replace(' ', '-');
    let wxState = `rcwx${code}`;
    let appLink = {path: `books/${book._id}`, title: book.name, wxState} as AppLink;
    this.modalService.open(new AppLinkModal(appLink));
  }

  showDetail(book: Book) {
    this.modalService.open(new BookInfoModal(book));
  }

  showImage(book: Book) {
    this.modalService.open(new BookImageModal(book));
  }

  showForm(book: Book) {
    let context = {book, annOptions: this.annOptions};
    this.modalService.open(new BookFormModal(context));
  }

  showPacks(book: Book) {
    this.modalService.open(new BookPacksModal(book));
  }

  showUsers(book: Book) {
    this.modalService.open(new BookUsersModal(book));
  }

  editNew() {
    this.newBook = new Book();
    if (this.annOptions && this.annOptions.length > 0) {
      this.newBook.annotationFamilyId = this.annOptions[0]._id;
    }
  }

  cancelEdit() {
    this.newBook = null;
  }

  add(): void {
    let book = this.newBook;
    if (book.code) {
      book.code = book.code.trim();
    }
    if (!book.code) {
      this.newBookCodeEl.nativeElement.focus();
      return;
    }
    if (book.name) {
      book.name = book.name.trim();
    }
    if (!book.name) {
      this.newBookNameEl.nativeElement.focus();
      return;
    }
    book.author = book.author.trim();
    book.zhName = book.zhName.trim();
    book.zhAuthor = book.zhAuthor.trim();
    book.isFree = false;
    book.pricingMode = 'B';
    this.bookService.create(book)
      .subscribe(newBook => {
        this.books.push(newBook);
        this.newBook = null;
      });
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
          this.loadBooks(this.category);
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

  onAddExpBook(book: Book): void {
    if (!this.allBooks) {
      return;
    }
    let eb = this.allBooks.find(b => b._id === book._id);
    if (!eb) {
      this.allBooks.push(book);
      this.loadBooks(this.category);
    }
  }

  removeExpBook(book) {
    if (!confirm('要移除该书吗？')) {
      return;
    }
    this.bookService.removeExpBook(book._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        if (this.allBooks) {
          this.allBooks = this.allBooks.filter(b => b !== book);
          this.loadBooks(this.category);
        }
      });
  }

  bookTracker(index, book) {
    return book._id;
  }

}
