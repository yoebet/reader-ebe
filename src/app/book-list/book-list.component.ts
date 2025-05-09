import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

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
import {WordStatService} from '../services/word-stat.service';
import {WordStatModal} from '../book/word-stat.component';

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
              protected wordStatService: WordStatService,
              protected route: ActivatedRoute,
              protected router: Router,
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

          let changed = false;
          if (cat && this.category !== cat) {
            this.category = cat;
            changed = true;
          }
          if (visib) {
            this.visib = visib;
            this.allBooks = null;
            if (this.visib !== visib) {
              changed = true;
            }
          } else if (isAdmin) {
            this.visib = 'pub';
          }
          if (status && this.status !== status) {
            this.status = status;
            changed = true;
          }

          let page = (params.get('page') && parseInt(params.get('page'))) || 1;
          if (changed) {
            this.page = page;
            this.loadBooks();
            return;
          }

          if (this.page !== page) {
            this.page = page;
            if (this.books && this.books.length > 0) {
              this.resetPaginatedBooks();
              return;
            }
          }

          this.loadBooks();
        }
      );
  }

  loadBooks(resetPage = false) {
    if (this.category) {
      if (this.allBooks) {
        this.books = this.allBooks.filter(b => b.category === this.category);
        if (resetPage && this.page !== 1) {
          this.resetPage(1);
          return;
        }
        this.resetPaginatedBooks();
        return;
      }
    } else {
      if (this.allBooks) {
        this.books = this.allBooks;
        if (resetPage && this.page !== 1) {
          this.resetPage(1);
          return;
        }
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
        if (resetPage && this.page !== 1) {
          this.resetPage(1);
          return;
        }
        this.resetPaginatedBooks();
      });
  }


  filterCat(cat = null) {
    this.category = cat;
    this.loadBooks(true);
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

  resetPage(page) {
    if (page === 1) {
      let ppage = this.route.snapshot.queryParamMap.get('page');
      if (ppage) {
        page = null;
      }
    }
    this.router.navigate([], {queryParams: {page}})
      .then(value => {
      });
  }

  gotoPage(page) {
    page = parseInt(page);
    if (isNaN(page)) {
      return;
    }
    if (page < 1) {
      page = 1;
    }
    // this.page = page;
    // this.resetPaginatedBooks();
    this.resetPage(page);
  }

  nextPage() {
    if (!this.paginatedBooks) {
      return;
    }
    if (this.paginatedBooks.length < this.pageSize) {
      return;
    }
    // this.page++;
    // this.resetPaginatedBooks();
    this.resetPage(this.page + 1);
  }

  previousPage() {
    if (!this.paginatedBooks) {
      return;
    }
    if (this.page === 1) {
      return;
    }
    // this.page--;
    // this.resetPaginatedBooks();
    this.resetPage(this.page - 1);
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
    // book.isFree = false;
    // book.pricingMode = 'B';
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
      this.loadBooks();
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
          this.loadBooks();
        }
      });
  }

  async showBookStat(book: Book) {
    let stat = book.stat;
    if (!stat) {
      stat = await this.wordStatService.getBookStat(book._id).toPromise();
    }
    if (stat) {
      this.modalService.open(new WordStatModal({ stat, title: book.name }));
    }
  }

  bookTracker(index, book) {
    return book._id;
  }

}
