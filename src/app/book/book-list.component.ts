import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {StaticResource} from '../config';
import {SuiModalService} from 'ng2-semantic-ui';

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
import {SortableListComponent} from "../common/sortable-list.component";
import {AppLinkModal, AppLink} from '../common/app-link.component';
import {SessionService} from '../services/session.service';
import {User} from '../models/user';
import {ActivatedRoute, ParamMap} from "@angular/router";

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

    this.route.queryParamMap.subscribe((params: ParamMap) => {
        let cu = this.currentUser;
        let isAdmin = cu && (cu.role === "A" || cu.role === "R");
        let cat = params.get('cat');
        let visib = params.get('visib');
        let status = params.get('status');
        if (cat) {
          this.category = cat;
        }
        if (visib) {
          this.visib = visib;
        } else if (isAdmin) {
          this.visib = 'pub';
        }
        if (status) {
          this.status = status;
        }

        this.loadBooks();
      }
    );
  }

  loadBooks(cat = null) {
    this.category = cat;
    let listOptions = {cat: this.category, visib: this.visib, status: this.status};
    if (this.category) {
      if (this.allBooks) {
        this.books = this.allBooks.filter(b => b.category == this.category);
        return;
      }
    } else {
      if (this.allBooks) {
        this.books = this.allBooks;
        return;
      }
    }
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
        this.books = this.books.filter(b => b !== book);
      });
  }

  backup(book: Book): void {
    if (!confirm('... To Backup The Book?')) {
      return;
    }
    this.bookService.backup(book._id).subscribe(clonedBook => {
      if (!clonedBook) {
        alert('Fail To Backup.');
        return;
      }
      let index = this.books.indexOf(book);
      this.books.splice(index + 1, 0, clonedBook);
    });
  }

  bookTracker(index, book) {
    return book._id;
  }

}
