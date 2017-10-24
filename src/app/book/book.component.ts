import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, ParamMap} from '@angular/router';
import {Location} from '@angular/common';
// import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
// import 'rxjs/add/observable/fromPromise';

import {Book} from '../models/book';
import {BookService} from '../services/book.service';
import {OpResult} from '../models/op-result';

@Component({
  selector: 'book-detail',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {
  book: Book;
  editing = false;
  chapsTuneOrder = false;
  chapOperations = false;

  constructor(private bookService: BookService,
              private route: ActivatedRoute,
              private location: Location) {
  }

  ngOnInit(): void {
    this.route.paramMap.switchMap((params: ParamMap) =>
      this.bookService.getDetail(params.get('id'))
    ).subscribe(book => this.book = book);
  }

  save(name, author): void {
    name = name.trim();
    if (!name) {
      this.editing = false;
      return;
    }
    author = author.trim();
    this.book.author = author;
    this.book.name = name;
    this.bookService.update(this.book)
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
