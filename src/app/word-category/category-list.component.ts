import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {WordCategory} from '../models/word-category';
import {WordCategoryService} from "../services/word-category.service";

@Component({
  selector: 'category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {

  categories: WordCategory[];

  constructor(private wordCategoryService: WordCategoryService,
              private router: Router) {
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


  gotoDetail(category: WordCategory): void {
    this.router.navigate(['/word-categories', category._id]);
  }

  categoryTracker(index, category) {
    return category._id;
  }

}
