import {
  Input, Component, ComponentFactoryResolver, HostListener, OnInit
} from '@angular/core';
import {PopStateEvent} from '@angular/common/src/location/location';
import {SuiModalService} from 'ng2-semantic-ui';

import {Book} from '../models/book';
import {ContentContext} from '../content-types/content-context';

import {ChapService} from "../services/chap.service";
import {ParaService} from '../services/para.service';
import {AnnoFamilyService} from '../services/anno-family.service';
import {DictZhService} from '../services/dict-zh.service';
import {ParaAnnotateComponent} from "./para-annotate.component";


@Component({
  selector: 'chap-paras',
  templateUrl: './chap-paras.component.html',
  styleUrls: ['./chap-paras.component.css']
})
export class ChapParasComponent extends ParaAnnotateComponent implements OnInit {
  @Input() set book(book: Book) {
    this._book = book;
    if (!book) {
      return;
    }
    if (!this.contentContext) {
      this.contentContext = new ContentContext();
    }
    this.contentContext.contentLang = book.contentLang;
    this.contentContext.transLang = book.transLang;
    this.dictZhService.getPhrases()
      .subscribe(ph => this.contentContext.zhPhrases = ph);
    this.loadAnnotations();
  }

  showTrans = true;
  leftRight = true;
  annotateOnly = false;
  // editInplace = false;
  highlightSentence = true;

  constructor(protected resolver: ComponentFactoryResolver,
              protected chapService: ChapService,
              protected paraService: ParaService,
              protected dictZhService: DictZhService,
              protected annoService: AnnoFamilyService,
              public modalService: SuiModalService) {
    super(resolver, chapService, paraService, annoService, modalService);
  }

  ngOnInit(): void {
    let chap = this.chap;
    if (chap) {
      if (!chap.paras) {
        chap.paras = [];
      }
      if (chap.paras.length === 0) {
        this.insertPos = 0;
      }
      this.checkCommentsCount();
    }

    this.paraSaver = {
      save: this.save.bind(this),
      saveSplit: this.saveSplitPara.bind(this),
      updateTrans: this.doUpdateParasTrans.bind(this),
      cancelEdit: this.cancelEdit.bind(this)
    };
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent($event: KeyboardEvent) {
    // alert(`${$event.key} ${$event.code}`);
    if ($event.key === 'Escape') {
      if (this.dictRequest) {
        this.onDictItemSelect(null);
        $event.stopPropagation();
        return;
      }
      if (this.currentAnnotation) {
        this.currentAnnotation = null;
        $event.stopPropagation();
      }
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState($event: PopStateEvent) {
    if (this.dictRequest) {
      this.closeDictPopup();
    }
    if (this.noteRequest) {
      this.closeNotePopup();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadEvent($event) {
    if (this.editingPara || this.insertPos != null || this.noteRequest || this.aligningSentence) {
      // $event.stopPropagation();
      $event.preventDefault();
      // Chrome requires returnValue to be set
      $event.returnValue = '';
      return;
    }
  }

}
