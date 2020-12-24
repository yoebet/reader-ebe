import {Component, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal} from 'ng2-semantic-ui';
import {ModalSize} from 'ng2-semantic-ui/dist/modules/modal/classes/modal-config';

import {BookBasic} from '../models/book';
import {BookCategory} from '../models/book-category';
import {BookCategoryService} from '../services/book-category.service';

@Component({
  selector: 'category-books',
  templateUrl: './category-books.component.html',
  styleUrls: ['./category-books.component.css']
})
export class CategoryBooksComponent implements OnInit {

  category: BookCategory;
  books: BookBasic[];

  showZh = true;

  constructor(private bookCategoryService: BookCategoryService,
              private modal: SuiModal<BookCategory, string, string>) {
    this.category = modal.context;
  }

  ngOnInit(): void {
    this.bookCategoryService.findBooks(this.category.code)
      .subscribe(books => {
        this.books = books;
      });
  }

  close() {
    this.modal.approve('');
  }

}


export class CategoryBooksModal extends ComponentModalConfig<BookCategory> {
  constructor(context: BookCategory) {
    super(CategoryBooksComponent, context, true);
    this.size = ModalSize.Tiny;
    // this.isFullScreen = true;
    this.mustScroll = false;
    // this.isBasic = true;
  }
}
