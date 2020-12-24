import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {OpResult} from '../models/op-result';
import {SortableListComponent} from '../common/sortable-list.component';
import {BookCategoryService} from '../services/book-category.service';
import {BookCategory} from '../models/book-category';
import {CategoryBooksModal} from './category-books.component';
import {SuiModalService} from 'ng2-semantic-ui';

@Component({
  selector: 'book-categories',
  templateUrl: './book-categories.component.html',
  styleUrls: ['./book-categories.component.css']
})
export class BookCategoriesComponent extends SortableListComponent implements OnInit {

  categories: BookCategory[];
  noCategory: BookCategory;

  newCategory: BookCategory;
  editingCat: BookCategory;

  removeOperation = false;

  constructor(private bookCategoryService: BookCategoryService,
              private modalService: SuiModalService) {
    super();
  }

  get modelList() {
    return this.categories;
  }

  get sortableService() {
    return this.bookCategoryService;
  }

  getCategories() {
    this.bookCategoryService.list()
      .subscribe(categories => {
        if (categories.length > 0) {
          if (!categories[categories.length - 1].code) {
            this.noCategory = categories.pop();
          }
        }
        this.categories = categories;
      });
  }

  ngOnInit() {
    this.getCategories();
  }

  // gotoDetail(category: WordCategory): void {
  //   this.router.navigate(['/book-categories', category._id]);
  // }

  editNew() {
    this.newCategory = new BookCategory();
  }

  cancelEditNew() {
    this.newCategory = null;
  }

  add() {
    let newCategory = this.newCategory;
    this.bookCategoryService.create(newCategory)
      .subscribe(nc => {
        this.categories.push(nc);
        this.newCategory = null;
      });
  }

  remove(cat) {
    if (!confirm('Are You Sure?')) {
      return;
    }
    this.bookCategoryService
      .remove(cat._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.categories = this.categories.filter(c => c !== cat);
      });
  }

  edit(cat) {
    this.editingCat = Object.assign(new BookCategory(), cat);
  }

  editing(cat) {
    return this.editingCat && this.editingCat._id === cat._id;
  }

  save() {
    let editingCat = this.editingCat;
    this.bookCategoryService.update(editingCat)
      .subscribe(opr => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        let category = this.categories.find(u => u._id === editingCat._id);
        Object.assign(category, editingCat);
        this.editingCat = null;
      });
  }

  showBooks(cat) {
    this.modalService.open(new CategoryBooksModal(cat));
  }


  tracker(index, category) {
    return category._id;
  }

}
