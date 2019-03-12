import {Component, Input, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal} from "ng2-semantic-ui";
import {ModalSize} from "ng2-semantic-ui/dist/modules/modal/classes/modal-config";

import {Book, BookContentPack} from '../models/book';
import {BookService} from '../services/book.service';
import {OpResult} from "../models/op-result";


declare class PackInfo {
  title: string;
  tip: string;
  role: string;
  pack: BookContentPack;
  allowBuild: boolean;
}

@Component({
  selector: 'book-info',
  templateUrl: './book-packs.component.html',
  styleUrls: ['./book-packs.component.css']
})
export class BookPacksComponent implements OnInit {
  @Input() book: Book;
  packInfos: PackInfo[];
  executingPack: PackInfo = null;

  constructor(private bookService: BookService,
              private modal: SuiModal<Book, string, string>) {
    this.book = modal.context;
    let packs = this.book.contentPacks || {};
    let R = Book.BookContentPackRoles;

    let notReleased = this.book.status !== 'R';

    this.packInfos = [
      {title: 'For 普通用户', tip: '（已上线免费章节）', role: R.Public, pack: packs[R.Public], allowBuild: notReleased},
      {title: 'For 本书读者', tip: '（已上线章节）', role: R.Reader, pack: packs[R.Reader], allowBuild: notReleased},
      {title: 'For 本书编辑', tip: '（全部章节）', role: R.Editor, pack: packs[R.Editor], allowBuild: false}
    ];
  }

  ngOnInit(): void {
  }

  close() {
    this.modal.approve('');
  }

  buildPack(packInfo: PackInfo) {
    if (!confirm('要创建内容包吗？')) {
      return;
    }
    this.executingPack = packInfo;
    let role = packInfo.role;

    this.bookService.buildContentPack(this.book._id, role)
      .subscribe(
        (opr: OpResult) => {
          this.executingPack = null;

          if (opr.ok === 0) {
            alert(opr.message || 'Fail');
            return;
          }
          let pack = opr.data;

          let packs = this.book.contentPacks;
          if (!packs) {
            packs = {};
            this.book.contentPacks = packs;
          }
          packs[role] = pack;
          packInfo.pack = pack;

          alert('内容包已创建');
        },
        error1 => {
          this.executingPack = null;
          alert('发生错误了');
        });
  }

  dropPack(packInfo: PackInfo) {
    if (!confirm('确定要删除吗？')) {
      return;
    }
    this.executingPack = packInfo;
    let role = packInfo.role;

    this.bookService.dropContentPack(this.book._id, role)
      .subscribe(
        (opr: OpResult) => {
          this.executingPack = null;

          if (opr.ok === 0) {
            alert(opr.message || 'Fail');
            return;
          }

          packInfo.pack = null;
          let packs = this.book.contentPacks;
          if (packs) {
            packs[role] = null;
          }
          alert('已删除');
        },
        error1 => {
          this.executingPack = null;
          alert('发生错误了');
        });
  }

}


export class BookPacksModal extends ComponentModalConfig<Book> {
  constructor(book: Book) {
    super(BookPacksComponent, book, false);
    this.size = ModalSize.Tiny;
    // this.isFullScreen = true;
    this.mustScroll = false;
    // this.isBasic = true;
  }
}
