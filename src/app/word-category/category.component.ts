import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Location} from '@angular/common';

import {switchMap} from 'rxjs/operators';

import {WordCategory} from '../models/word-category';
import {WordCategoryService} from '../services/word-category.service';

@Component({
  selector: 'category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

  category: WordCategory;
  sampleWords: string[];
  operatorsMap: Map<string, string>;

  constructor(private wordCategoryService: WordCategoryService,
              private router: Router,
              private route: ActivatedRoute,
              private location: Location) {
    this.operatorsMap = new Map();
    for (let op of WordCategory.DictOperators) {
      this.operatorsMap.set(op.value, op.label);
    }
  }

  ngOnInit() {
    this.route.paramMap.pipe(switchMap((params: ParamMap) =>
      this.wordCategoryService.getOne(params.get('id'))
    )).subscribe(category => {
      this.category = category;
    });
  }

  filterStr(cat) {
    let opLabel = this.operatorsMap.get(cat.dictOperator);
    let opStr = cat.dictOperator ? opLabel : ':';
    return cat.dictKey + ' ' + opStr + ' ' + cat.dictValue;
  }

  fetchSamples() {
    this.wordCategoryService.fetchSampleWords(this.category.code)
      .subscribe(words => {
        this.sampleWords = words ? words : [];
      });
  }

  onClickAWord(word, $event) {

  }

  goBack(): void {
    this.location.back();
  }

}
