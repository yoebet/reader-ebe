import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {combineLatest} from 'rxjs/';

import {SuiModalService} from 'ng2-semantic-ui';

import {StaticResource} from '../config';
import {Book} from '../models/book';
import {BookCategory} from '../models/book-category';
import {AnnotationFamily} from '../models/annotation-family';
import {BookService} from '../services/book.service';
import {AnnoFamilyService} from '../services/anno-family.service';
import {OpResult} from '../models/op-result';
import {BookInfoModal} from '../book/book-info.component';
import {BookFormModal} from '../book/book-form.component';
import {BookImageModal} from '../book/book-image.component';
import {BookPacksModal} from '../book/book-packs.component';
import {BookUsersModal} from '../book/book-users.component';
import {SortableListComponent} from '../common/sortable-list.component';
import {SessionService} from '../services/session.service';
import {User} from '../models/user';
import {BookExpsModal} from './book-exps.component';
import {BookCategoryService} from '../services/book-category.service';

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
  showZh = true;
  category: string;
  visib: string;
  status: string;

  page = 1; // 1 based
  pageSize = 10;
  paginatedBooks: Book[];

  langOptions = Book.LangTypes;
  statusNames = Book.StatusNames;
  categoryNames = BookCategory.CategoryNames;
  bookImagesBase = StaticResource.BookImagesBase;
  bookImageNotSet = StaticResource.BookImageNotSet;

  annOptions: AnnotationFamily[];
  categoryOptions: BookCategory[];

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  get modelList() {
    return this.books;
  }

  get sortableService() {
    return this.bookService;
  }

  constructor(protected bookService: BookService,
              protected categoryService: BookCategoryService,
              protected sessionService: SessionService,
              protected annoFamilyService: AnnoFamilyService,
              protected route: ActivatedRoute,
              protected modalService: SuiModalService) {
    super();
  }

  ngOnInit(): void {
    this.annoFamilyService.getCandidates()
      .subscribe(afs => this.annOptions = afs);

    this.categoryService.listOptions()
      .subscribe(cs => this.categoryOptions = cs);

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
    this.page = 1;
    this.category = cat;
    if (this.category) {
      if (this.allBooks) {
        this.books = this.allBooks.filter(b => b.category === this.category);
        this.resetPaginatedBooks();
        return;
      }
    } else {
      if (this.allBooks) {
        this.books = this.allBooks;
        this.resetPaginatedBooks();
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
        this.resetPaginatedBooks();
      });
  }

  protected onMoveDone() {
    this.resetPaginatedBooks();
  }

  resetPaginatedBooks() {
    if (!this.books) {
      this.paginatedBooks = [];
      return;
    }
    let booksCount = this.books.length;
    let from = (this.page - 1) * this.pageSize;
    let to = from + this.pageSize;
    if (from > booksCount) {
      from = booksCount;
    }
    if (to > booksCount) {
      to = booksCount;
    }
    this.paginatedBooks = this.books.slice(from, to);
  }

  gotoPage(page) {
    page = parseInt(page);
    if (isNaN(page)) {
      return;
    }
    this.page = page;
    this.resetPaginatedBooks();
  }

  nextPage() {
    if (!this.paginatedBooks) {
      return;
    }
    if (this.paginatedBooks.length < this.pageSize) {
      return;
    }
    this.page++;
    this.resetPaginatedBooks();
  }

  previousPage() {
    if (!this.paginatedBooks) {
      return;
    }
    if (this.page === 1) {
      return;
    }
    this.page--;
    this.resetPaginatedBooks();
  }

  showExpBooks() {
    this.modalService.open(new BookExpsModal(this.onAddExpBook.bind(this)));
  }

  showDetail(book: Book) {
    this.modalService.open(new BookInfoModal(book));
  }

  showImage(book: Book) {
    this.modalService.open(new BookImageModal(book));
  }

  showForm(book: Book) {
    let context = {book, annOptions: this.annOptions, categoryOptions: this.categoryOptions};
    this.modalService.open(new BookFormModal(context));
  }

  showPacks(book: Book) {
    this.modalService.open(new BookPacksModal(book));
  }

  showUsers(book: Book) {
    this.modalService.open(new BookUsersModal(book));
  }

  editNew() {
    let newBook = new Book();
    newBook.contentLang = Book.LangCodeEn;
    newBook.transLang = Book.LangCodeZh;
    if (this.annOptions && this.annOptions.length > 0) {
      newBook.annotationFamilyId = this.annOptions[0]._id;
    }
    this.newBook = newBook;
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
