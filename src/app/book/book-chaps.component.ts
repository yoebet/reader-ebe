import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {Book} from '../models/book';
import {Chap} from '../models/chap';
import {ChapService} from '../services/chap.service';
import {OpResult} from '../models/op-result';
import {SortableListComponent} from "../common/sortable-list.component";
import {BookService} from "../services/book.service";

@Component({
  selector: 'book-chaps',
  templateUrl: './book-chaps.component.html',
  styleUrls: ['./book-chaps.component.css']
})
export class BookChapsComponent extends SortableListComponent implements OnInit {
  @Input() book: Book;
  tuneOrder = false;
  showRemove = false;
  showZh = false;
  editingChap: Chap;
  editNew = false;
  statusNames = Book.StatusNames;
  statusOptions = Book.Statuses;

  constructor(private bookService: BookService,
              private chapService: ChapService,
              private router: Router) {
    super();
  }

  get modelList() {
    return this.book.chaps;
  }

  get sortableService() {
    return this.chapService;
  }

  ngOnInit(): void {
    if (!this.book.chaps) {
      this.book.chaps = [];
    }
  }

  add(name: string, zhName: string): void {
    name = name.trim();
    if (!name) {
      return;
    }
    let chap = new Chap();
    delete chap.paras;
    chap.name = name;
    chap.zhName = zhName.trim();
    chap.bookId = this.book._id;
    this.chapService.create(chap)
      .subscribe(newChap => {
        this.book.chaps.push(newChap);
        this.editNew = false;
      });
  }

  remove(chap: Chap): void {
    if (!confirm('Are You Sure?')) {
      return;
    }
    this.chapService
      .remove(chap._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.book.chaps = this.book.chaps.filter(c => c !== chap);
      });
  }

  edit(chap: Chap): void {
    this.editingChap = chap;
  }

  saveChap(chap: Chap, name: string, zhName: string): void {
    name = name.trim();
    if (!name) {
      return;
    }
    chap.name = name;
    chap.zhName = zhName.trim();
    this.chapService.update(chap).subscribe((opr: OpResult) => {
      if (opr.ok === 0) {
        alert(opr.message || 'Fail');
        return;
      }
      this.editingChap = null;
    });
  }

  setAllStatus(status: string, label: string) {
    if (!confirm('要把所有章节的状态都设置为 [' + label + '] 吗?')) {
      return;
    }
    this.bookService.setALLChapsStatus(this.book._id, status)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        for (let chap of this.book.chaps) {
          chap.status = status;
        }
      });
  }

  gotoDetail(chap: Chap): void {
    this.router.navigate(['/chaps', chap._id]);
  }

  chapTracker(index, chap) {
    return chap._id;
  }

}
