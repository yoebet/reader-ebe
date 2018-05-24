import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {Book} from '../models/book';
import {Chap} from '../models/chap';
import {ChapService} from '../services/chap.service';
import {OpResult} from '../models/op-result';

@Component({
  selector: 'book-chaps',
  templateUrl: './book-chaps.component.html',
  styleUrls: ['./book-chaps.component.css']
})
export class BookChapsComponent implements OnInit {
  @Input() book: Book;
  @Input() tuneOrder: boolean;
  @Input() operations: boolean;
  @Input() showZh: boolean;
  editingChap: Chap;
  editNew = false;

  constructor(private chapService: ChapService,
              private router: Router) {
  }

  ngOnInit(): void {
    if (!this.book.chaps) {
      this.book.chaps = [];
    }
  }

  add(name: string): void {
    name = name.trim();
    if (!name) {
      return;
    }
    let chap = new Chap();
    delete chap.paras;
    chap.name = name;
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

  protected move(chap: Chap, dir: string) {
    let chaps = this.book.chaps;
    let thisPos = chaps.indexOf(chap);
    if (thisPos === 0) {
      if (dir === 'moveUp' || dir === 'moveTop') {
        return;
      }
    }
    if (thisPos === chaps.length - 1) {
      if (dir === 'moveDown' || dir === 'moveBottom') {
        return;
      }
    }
    let targetPos = null;
    switch (dir) {
      case 'moveUp':
        targetPos = thisPos - 1;
        break;
      case 'moveDown':
        targetPos = thisPos + 1;
        break;
      case 'moveTop':
        targetPos = 0;
        break;
      case 'moveBottom':
        targetPos = chaps.length - 1;
        break;
    }
    this.chapService[dir](chap)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        if (dir === 'moveTop' || dir === 'moveBottom') {
          chaps.splice(thisPos, 1);
          if (dir === 'moveTop') {
            chaps.unshift(chap);
          } else {
            chaps.push(chap);
          }
        } else {
          chaps[thisPos] = chaps[targetPos];
          chaps[targetPos] = chap;
        }
      });
  }

  moveUp(chap: Chap) {
    this.move(chap, 'moveUp');
  }

  moveDown(chap: Chap) {
    this.move(chap, 'moveDown');
  }

  moveTop(chap: Chap) {
    this.move(chap, 'moveTop');
  }

  moveBottom(chap: Chap) {
    this.move(chap, 'moveBottom');
  }

  gotoDetail(chap: Chap): void {
    this.router.navigate(['/chaps', chap._id]);
  }

  chapTracker(index, chap) {
    return chap._id;
  }

}
