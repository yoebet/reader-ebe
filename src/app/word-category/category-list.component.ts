import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {WordCategory} from '../models/word-category';
import {WordCategoryService} from "../services/word-category.service";
import {OpResult} from "../models/op-result";
import {SortableListComponent} from "../common/sortable-list.component";

@Component({
  selector: 'category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent extends SortableListComponent implements OnInit {

  categories: WordCategory[];
  newCategory: WordCategory;
  editingCat: WordCategory;

  dictOperators = WordCategory.DictOperators;
  operatorsMap: Map<string, string>;

  recountOperation = false;
  removeOperation = false;
  tuneOrder = false;

  constructor(private wordCategoryService: WordCategoryService,
              private router: Router) {
    super();
    this.operatorsMap = new Map();
    for (let op of this.dictOperators) {
      this.operatorsMap.set(op.value, op.label);
    }
  }

  get modelList() {
    return this.categories;
  }

  get sortableService() {
    return this.wordCategoryService;
  }

  getCategories() {
    this.wordCategoryService.list()
      .subscribe(categories => {
        let catsMap = new Map();
        for (let cat of categories) {
          catsMap.set(cat.code, cat);
        }
        for (let cat of categories) {
          if (cat.extendTo) {
            cat.extend = catsMap.get(cat.extendTo);
          }
        }
        this.categories = categories;
      });
  }

  ngOnInit() {
    this.getCategories();
  }

  filterStr(cat) {
    let opLabel = this.operatorsMap.get(cat.dictOperator);
    let opStr = cat.dictOperator ? opLabel : ':';
    return cat.dictKey + ' ' + opStr + ' ' + cat.dictValue
  }

  gotoDetail(category: WordCategory): void {
    this.router.navigate(['/word-categories', category._id]);
  }

  editNew() {
    this.newCategory = new WordCategory();
  }

  cancelEditNew() {
    this.newCategory = null;
  }

  add() {
    let newCategory = this.newCategory;
    /*if (newCategory.dictValue && typeof newCategory.dictValue !== 'number') {
      newCategory.dictValue = +newCategory.dictValue;
    }*/
    this.wordCategoryService.create(newCategory)
      .subscribe(nc => {
        this.categories.push(nc);
        this.newCategory = null;
      });
  }

  remove(cat) {
    if (!confirm('Are You Sure?')) {
      return;
    }
    this.wordCategoryService
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
    this.editingCat = Object.assign(new WordCategory(), cat);
  }

  editing(cat) {
    return this.editingCat && this.editingCat._id === cat._id;
  }

  save() {
    let editingCat = this.editingCat;
    /*if (editingCat.dictValue && typeof editingCat.dictValue !== 'number') {
      editingCat.dictValue = +editingCat.dictValue;
    }*/
    this.wordCategoryService.update(editingCat)
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

  recount(cat) {

  }

  tracker(index, category) {
    return category._id;
  }

}
