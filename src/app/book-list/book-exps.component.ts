import {Component, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal} from 'ng2-semantic-ui';
import {ModalSize} from 'ng2-semantic-ui/dist/modules/modal/classes/modal-config';

import {Book} from '../models/book';
import {BookService} from '../services/book.service';
import {OpResult} from '../models/op-result';
import {StaticResource} from '../config';

@Component({
  selector: 'book-exps',
  templateUrl: './book-exps.component.html',
  styleUrls: ['./book-exps.component.css']
})
export class BookExpsComponent implements OnInit {

  books: Book[];
  showZh = true;

  onAddExpBook: (book: Book) => void;

  bookImagesBase = StaticResource.BookImagesBase;
  bookImageNotSet = StaticResource.BookImageNotSet;

  constructor(private bookService: BookService,
              private modal: SuiModal<(book: Book) => void, string, string>) {
    this.onAddExpBook = modal.context;
  }

  ngOnInit(): void {
    this.bookService.experimentBooks()
      .subscribe(books => {
        this.books = books;
      });
  }

  close() {
    this.modal.approve('');
  }

  toBeEditor(book) {
    this.bookService.addExpBook(book._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        book.editorRole = 'Editor';
        alert('已成为该书编辑');
        this.onAddExpBook(book);
      });
  }

  bookTracker(index, book) {
    return book._id;
  }
}


export class BookExpsModal extends ComponentModalConfig<(book: Book) => void> {
  constructor(onAddExpBook: (book: Book) => void) {
    super(BookExpsComponent, onAddExpBook, false);
    this.size = ModalSize.Tiny;
    // this.isFullScreen = true;
    this.mustScroll = false;
    // this.isBasic = true;
  }
}
