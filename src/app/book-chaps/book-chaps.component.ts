import {Component, Input, OnInit} from '@angular/core';

import {SuiModalService} from 'ng2-semantic-ui';

import {StaticResource} from '../config';
import {Book} from '../models/book';
import {Chap} from '../models/chap';
import {BookService} from '../services/book.service';
import {ChapService} from '../services/chap.service';
import {OpResult} from '../models/op-result';
import {SortableListComponent} from '../common/sortable-list.component';
import {AppLink, AppLinkModal} from '../common/app-link.component';
import {SessionService} from '../services/session.service';
import {User} from '../models/user';
import {BookImportModal} from './book-import.component';
import {WordStatService} from '../services/word-stat.service';
import {WordStatModal} from '../book/word-stat.component';
import {MessageDialogModal} from '../common/message-dialog.component';

@Component({
  selector: 'book-chaps',
  templateUrl: './book-chaps.component.html',
  styleUrls: ['./book-chaps.component.css']
})
export class BookChapsComponent extends SortableListComponent implements OnInit {
  @Input() book: Book;
  contentPack = false;
  showRemove = false;
  showWordStat = false;
  wxLink = false;
  showZh = true;
  editingChap: Chap;
  editChapStatus = false;
  // editingChapFree;
  editNew = false;
  statusNames = Book.StatusNames;
  statusOptions = Book.Statuses;

  bookChapsBase = StaticResource.BookChapsBase;

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  constructor(private bookService: BookService,
              private chapService: ChapService,
              private wordStatService: WordStatService,
              private sessionService: SessionService,
              private modalService: SuiModalService) {
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
    // this.editingChapFree = this.editingChap.isFree;
    this.editChapStatus = false;
  }

  editStatus(chap: Chap): void {
    this.editingChap = chap;
    // this.editingChapFree = this.editingChap.isFree;
    this.editChapStatus = true;
  }

  saveChap(chap: Chap, name: string, zhName: string): void {
    name = name.trim();
    if (!name) {
      return;
    }
    zhName = zhName.trim();
    let chapAltered = {name, zhName} as Chap;
    chapAltered._id = chap._id;
    this.chapService.update(chapAltered).subscribe((opr: OpResult) => {
      if (opr.ok === 0) {
        alert(opr.message || 'Fail');
        return;
      }
      chap.name = name;
      chap.zhName = zhName;
      this.editingChap = null;
    });
  }

  saveChapStatus(chap: Chap, status: string): void {
    // let isFree = this.editingChapFree;
    // console.log(isFree);
    let chapAltered = {status} as Chap;
    chapAltered._id = chap._id;
    this.chapService.update(chapAltered).subscribe((opr: OpResult) => {
      if (opr.ok === 0) {
        alert(opr.message || 'Fail');
        return;
      }
      chap.status = status;
      // chap.isFree = isFree;
      this.editingChap = null;
    });
  }

  setAllStatus(status: string, label: string) {
    if (!confirm('要把全部章节都设置为 [' + label + '] 吗?')) {
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

  buildPacks(scope = null) {
    let confirmMsg = '要生成全部章节的内容包吗?';
    if (scope === 'R') {
      confirmMsg = '要生成已上线章节的内容包吗?';
    }
    if (!confirm(confirmMsg)) {
      return;
    }
    this.bookService.buildChapPacks(this.book._id, scope)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        let packInfos = opr.data;
        if (!packInfos) {
          return;
        }
        let packInfoMap = new Map();
        for (let packInfo of packInfos) {
          packInfoMap.set(packInfo.chapId, packInfo);
        }
        for (let chap of this.book.chaps) {
          let packInfo = packInfoMap.get(chap._id);
          if (packInfo) {
            delete packInfo.chapId;
          }
          chap.contentPack = packInfo;
        }
        alert(`已生成${packInfos.length}个章节`);
      });
  }

  dropAllPacks() {
    if (!confirm('要删除全部章节的内容包吗?')) {
      return;
    }
    this.bookService.dropChapPacks(this.book._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        for (let chap of this.book.chaps) {
          chap.contentPack = null;
        }
      });
  }


  buildPack(chap: Chap) {
    if (!confirm('要生成内容包吗?')) {
      return;
    }
    this.chapService.buildContentPack(chap._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        let packInfo = opr.data;
        if (!packInfo) {
          return;
        }
        chap.contentPack = packInfo;
      });
  }

  dropPack(chap: Chap) {
    if (!confirm('要删除内容包吗?')) {
      return;
    }
    this.chapService.dropContentPack(chap._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        chap.contentPack = null;
      });
  }

  showLink(chap: Chap) {
    let chapId = chap._id;
    let appLink = {path: `chaps/${chapId}`, title: chap.name, context: {chapId}} as AppLink;
    this.modalService.open(new AppLinkModal(appLink));
  }

  showBookImport() {
    let context = {book: this.book};
    this.modalService.open(new BookImportModal(context));
  }

  async showChapStat(chap: Chap) {
    let stat = chap.stat;
    if (!stat) {
      stat = await this.wordStatService.getChapStat(chap._id).toPromise();
    }
    if (stat) {
      this.modalService.open(new WordStatModal({stat, title: chap.name}));
    }
  }

  async buildChapStat(chap: Chap) {
    // const dr = this.modalService.open(new MessageDialogModal(
    //   {
    //     title: '统计',
    //     msg: '已开始，请稍候 ...'
    //   }
    // ));
    await this.wordStatService.buildChapStat(chap._id).pipe().subscribe(stat1 => {
      // dr.approve('');
      if (stat1) {
        chap.stat = stat1;
        this.modalService.open(new WordStatModal({stat: stat1, title: chap.name}));
      }
    });
  }

  chapTracker(index, chap) {
    return chap._id;
  }

}
