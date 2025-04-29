import { Component } from '@angular/core';
import { ComponentModalConfig, SuiModal } from 'ng2-semantic-ui';
import { ModalSize } from 'ng2-semantic-ui/dist/modules/modal/classes/modal-config';
import { WordStat } from '../models/word-stat';

interface WordStatContext {
  stat: WordStat;
  title: string;
}

@Component({
  selector: 'word-stat',
  templateUrl: './word-stat.component.html',
  styleUrls: ['./word-stat.component.css']
})
export class WordStatComponent {
  stat: WordStat;
  title: string;
  cats = ['cet4', 'cet6', 'ielts', 'gre', 'pro', /*'beyond'*/];
  showCat: string;
  words: string[];
  catNames = {
    cet4: 'CET4',
    cet6: 'CET6',
    ielts: '雅思',
    gre: 'GRE',
    pro: '英专',
    beyond: '(Beyond)',
  };

  constructor(private modal: SuiModal<WordStatContext, string, string>) {
    this.stat = modal.context.stat;
    this.title = modal.context.title;
  }

}

export class WordStatModal extends ComponentModalConfig<WordStatContext> {
  constructor(context: WordStatContext) {
    super(WordStatComponent, context, true);
    this.size = ModalSize.Mini;
    this.mustScroll = true;
  }
}
