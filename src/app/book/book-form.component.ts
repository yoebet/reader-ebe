import {Component, Input, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal} from "ng2-semantic-ui";
import {ModalSize} from "ng2-semantic-ui/dist/modules/modal/classes/modal-config";

import {Book} from '../models/book';
import {BookService} from '../services/book.service';
import {OpResult} from "../models/op-result";
import {PriceLabelPipe} from "../pipes/price-label.pipe";

@Component({
  selector: 'book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css']
})
export class BookFormComponent implements OnInit {
  @Input() book: Book;
  editing: Book;
  // langOptions = Book.LangTypes;
  statusOptions = Book.Statuses;
  categoryOptions = Book.Categories;

  constructor(private bookService: BookService,
              private priceLabelPipe: PriceLabelPipe,
              private modal: SuiModal<Book, string, string>) {
    this.book = modal.context;
  }

  ngOnInit(): void {
    this.edit();
  }

  save(): void {
    this.editing.name = this.editing.name.trim();
    if (!this.editing.name) {
      return;
    }
    this.bookService.update(this.editing)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        Object.assign(this.book, this.editing);
        this.editing = null;
        this.close();
      });
  }

  edit(): void {
    let editing = new Book();
    Object.assign(editing, this.book);
    delete editing.chaps;
    delete editing.updatedAt;
    /*if (editing.author == null) {
      editing.author = '';
    }
    if (editing.zhName == null) {
      editing.zhName = '';
    }
    if (editing.zhAuthor == null) {
      editing.zhAuthor = '';
    }*/
    this.editing = editing;
  }

  updatePriceLabel() {
    let book = this.editing;
    book.priceLabel = this.priceLabelPipe.transform(book);
  }

  close() {
    this.modal.approve('');
  }
}


export class BookFormModal extends ComponentModalConfig<Book> {
  constructor(book: Book) {
    super(BookFormComponent, book, false);
    this.size = ModalSize.Tiny;
    // this.isFullScreen = true;
    this.mustScroll = true;
  }
}
