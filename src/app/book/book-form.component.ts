import {Component, Input, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal} from 'ng2-semantic-ui';
import {ModalSize} from 'ng2-semantic-ui/dist/modules/modal/classes/modal-config';

import {Book} from '../models/book';
import {BookService} from '../services/book.service';
import {OpResult} from '../models/op-result';
import {PriceLabelPipe} from '../pipes/price-label.pipe';
import {AnnotationFamily} from '../models/annotation-family';
import {AnnoFamilyService} from '../services/anno-family.service';
import {User, UserIdName} from '../models/user';
import {SessionService} from '../services/session.service';
import {UserBook} from '../models/user-book';
import {BookCategory} from '../models/book-category';
import {BookCategoryService} from '../services/book-category.service';

@Component({
  selector: 'book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css']
})
export class BookFormComponent implements OnInit {
  @Input() book: Book;

  editing: Book;

  langOptions = Book.LangTypes;
  statusOptions = Book.Statuses;

  annOptions: AnnotationFamily[];
  categoryOptions: BookCategory[];
  settingChiefEditor = false;
  editors: UserBook[];

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  get admin(): boolean {
    let cu = this.sessionService.currentUser;
    if (!cu) {
      return false;
    }
    return cu.role === 'A' || cu.role === 'R';
  }

  constructor(private bookService: BookService,
              private categoryService: BookCategoryService,
              private sessionService: SessionService,
              private annoFamilyService: AnnoFamilyService,
              private priceLabelPipe: PriceLabelPipe,
              private modal: SuiModal<BookFormContext, string, string>) {
    let context = modal.context;
    this.book = context.book;
    this.annOptions = context.annOptions;
    this.categoryOptions = context.categoryOptions;
  }

  ngOnInit(): void {
    this.edit();
    if (!this.annOptions) {
      this.annoFamilyService.getCandidates()
        .subscribe(afs => this.annOptions = afs);
    }
    if (!this.categoryOptions) {
      this.categoryService.listOptions()
        .subscribe(cs => this.categoryOptions = cs);
    }
  }

  save(): void {
    let editing = this.editing;
    editing.name = editing.name.trim();
    if (!editing.name) {
      return;
    }
    if (editing.category !== this.book.category) {
      let cat = this.categoryOptions.find(c => c.code === editing.category);
      if (cat) {
        editing.categoryName = cat.name;
      }
    }
    this.bookService.update(editing)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        Object.assign(this.book, editing);
        this.editing = null;
        this.close();
      });
  }

  edit(): void {
    // {"zhName":"小王子","author":"Saint-Exupéry","zhAuthor":"","contentLang":"En","transLang":"Zh","status":"R","editExperiment":false,
    // "_id":"5d306bf6fd4cce366314ae3a","name":"The Little Prince","code":"TLP","isFree":true,"pricingMode":"B","version":7,
    // "createdAt":"2019-07-18T12:54:14.686Z","category":"Nov-Other","priceLabel":"免费",
    // "image":{"file":"40b90c73d0abbb0b96e0aa1b7d8bd2dd.jpg","type":"image/jpeg","size":8216,"uploadedAt":"2019-07-18T13:01:18.882Z"},
    // "chiefEditorId":"5d12e39a89c5215720151954","chiefEditorName":"小艾","chapsComplete":true,
    // "contentPacks":{"p":{"file":"b6e80af2d6fac4f48d62d24223a90e76.tgz","size":94367,"chaps":28,"builtAt":"2019-07-28T15:39:56.624Z"}},
    // "categoryName":"名著·其他"}
    let editing = new Book();
    Object.assign(editing, this.book);
    delete editing.chaps;
    delete editing.updatedAt;
    delete editing.createdAt;
    delete editing.image;
    delete editing.contentPacks;
    this.editing = editing;
  }

  alterChiefEditor() {
    this.settingChiefEditor = true;
    if (!this.editors) {
      this.bookService.getEditors(this.book._id)
        .subscribe((editors: UserBook[]) => {
          this.editors = editors;
        });
    }
  }

  private doSetChiefEditor(editorId, editorName) {
    this.bookService.setChiefEditor(this.book._id, editorId)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.book.chiefEditorId = editorId;
        this.book.chiefEditorName = editorName;
        this.settingChiefEditor = false;
      });
  }

  setChiefEditor(name) {
    name = name.trim();
    if (!name) {
      return;
    }
    this.bookService.checkCandidate(this.book._id, name)
      .subscribe((idName: UserIdName) => {
        if (!idName) {
          alert('用户不存在');
          return;
        }
        if (!confirm(`你要把 ${idName.nickName}（${idName.name}）设为主编辑吗？`)) {
          return;
        }
        this.doSetChiefEditor(idName._id, idName.nickName);
      });
  }

  selectChiefEditor(editor: UserBook) {
    this.doSetChiefEditor(editor.userId, editor.userNickName);
  }

  updatePriceLabel() {
    let book = this.editing;
    if (book.isFree) {
      book.priceLabel = '免费';
      return;
    }
    let pipe = this.priceLabelPipe;
    if (book.pricingMode === 'B') {
      book.priceLabel = pipe.transform({price: book.price});
    } else if (book.pricingMode === 'C') {
      let priceLabel = pipe.transform({price: book.pricePerChap});
      book.priceLabel = `${priceLabel}/章`;
    }
  }

  close() {
    this.modal.approve('');
  }
}

export class BookFormContext {
  book: Book;
  annOptions?: AnnotationFamily[];
  categoryOptions?: BookCategory[];
}

export class BookFormModal extends ComponentModalConfig<BookFormContext> {
  constructor(context: BookFormContext) {
    super(BookFormComponent, context, false);
    this.size = ModalSize.Tiny;
    // this.isFullScreen = true;
    this.mustScroll = true;
  }
}
