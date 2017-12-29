import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Location} from '@angular/common';
import 'rxjs/add/operator/switchMap';

import {Book} from '../models/book';
import {Chap} from '../models/chap';
import {BookService} from '../services/book.service';
import {ChapService} from '../services/chap.service';
import {OpResult} from '../models/op-result';

@Component({
  selector: 'chap-detail',
  templateUrl: './chap.component.html',
  styleUrls: ['./chap.component.css']
})
export class ChapComponent implements OnInit {
  book: Book;
  chap: Chap;
  editing = false;

  constructor(private bookService: BookService,
              private chapService: ChapService,
              private route: ActivatedRoute,
              private location: Location) {
  }

  ngOnInit(): void {
    this.route.paramMap.switchMap((params: ParamMap) =>
      this.chapService.getDetail(params.get('id'))
    ).subscribe(chap => {
      if (chap.zhName == null) {
        chap.zhName = '';
      }
      this.chap = chap;
      this.bookService.getOne(chap.bookId)
        .subscribe((book) => this.book = book);
    });
  }

  save(name, zhName): void {
    name = name.trim();
    if (!name) {
      return;
    }
    zhName = zhName.trim();
    if (this.chap.name === name && this.chap.zhName === zhName) {
      this.editing = false;
      return;
    }
    this.chap.name = name;
    this.chap.zhName = zhName;
    this.chapService.update(this.chap)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.editing = false;
      });
  }

  edit(): void {
    this.editing = true;
  }

  goBack(): void {
    this.location.back();
  }

}
