import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {SuiModalService} from "ng2-semantic-ui";

import {Book} from '../models/book';
import {AnnotationFamily} from "../models/annotation-family";
import {BookService} from '../services/book.service';
import {AnnoFamilyService} from '../services/anno-family.service';
import {OpResult} from '../models/op-result';
import {BookInfoModal} from "./book-info.component";
import {BookFormModal} from "./book-form.component";

@Component({
  selector: 'book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  newBook: Book = null;
  langOptions = Book.LangTypes;
  operations: boolean;
  showZh: boolean;

  annOptions: AnnotationFamily[];

  constructor(private bookService: BookService,
              private annotationFamilyService: AnnoFamilyService,
              private router: Router,
              public modalService: SuiModalService) {
  }

  ngOnInit(): void {
    this.bookService
      .list()
      .subscribe(books => this.books = books);
    this.annotationFamilyService
      .getCandidates()
      .subscribe(afs => this.annOptions = afs);
  }


  showDetail(book: Book) {
    this.modalService.open(new BookInfoModal(book))
    // .onDeny((d) => {})
    // .onApprove((r) => {})
    ;
  }

  showForm(book: Book) {
    this.modalService.open(new BookFormModal(book))
    // .onDeny((d) => {})
    // .onApprove((r) => {})
    ;
  }

  editNew() {
    this.newBook = new Book();
  }

  cancelEdit() {
    this.newBook = null;
  }

  add(): void {
    let book = this.newBook;
    book.name = book.name.trim();
    if (!book.name) {
      return;
    }
    book.author = book.author.trim();
    book.zhName = book.zhName.trim();
    book.zhAuthor = book.zhAuthor.trim();
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

  gotoDetail(book: Book): void {
    this.router.navigate(['/books', book._id]);
  }

  bookTracker(index, book) {
    return book._id;
  }

}
