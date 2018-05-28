import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';

import 'rxjs/add/operator/switchMap';
import {WordCategory} from '../models/word-category';
import {WordCategoryService} from "../services/word-category.service";
import {Location} from "@angular/common";

@Component({
  selector: 'category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

  category: WordCategory;
  sampleWords: string[];

  constructor(private wordCategoryService: WordCategoryService,
              private router: Router,
              private route: ActivatedRoute,
              private location: Location) {
  }

  ngOnInit() {
    this.route.paramMap.switchMap((params: ParamMap) =>
      this.wordCategoryService.getOne(params.get('id'))
    ).subscribe(category => {
      this.category = category;
    });
  }

  fetchSamples() {
    this.wordCategoryService.fetchSampleWords(this.category.code).subscribe(words => {
      this.sampleWords = words ? words : [];
    });
  }

  onClickAWord(word, $event) {

  }

  goBack(): void {
    this.location.back();
  }

}
