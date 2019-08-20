import {Component, Input, OnInit} from '@angular/core';

import {AnnotationSet} from '../anno/annotation-set';
import {DataAttrNames, DataAttrValues} from '../config';
import {AnnotatorHelper} from '../anno/annotator-helper';

@Component({
  selector: 'word-annos',
  templateUrl: './word-annos.component.html',
  styleUrls: ['./word-annos.component.css']
})
export class WordAnnosComponent implements OnInit {
  @Input() _wordEl: HTMLElement;
  @Input() paraTextEl: HTMLElement;
  @Input() enabled: boolean;
  @Input() annotationSet: AnnotationSet;
  @Input() onTagRemoved: (el: HTMLElement) => void;
  @Input() onEditNote: (el: HTMLElement) => void;
  @Input() onEditMeaning: (el: HTMLElement, forPhrase: { group: string, words: string } = null) => void;
  @Input() notifyChange: () => void;
  word: string;
  head: string;
  items: { dataName, dataValue, text }[];
  phrase: { group, words, phraseWord, meaning, meaningEl };
  note: string;
  meaning: { pos, mean, word, text };
  private initialized = false;


  ngOnInit() {
    this.initialized = true;
  }

  set wordEl(_wordEl: HTMLElement) {
    this._wordEl = _wordEl;
    if (this.initialized && this.enabled) {
      this.parseAnnotations();
    }
  }

  get wordEl(): HTMLElement {
    return this._wordEl;
  }

  private parseAnnotations() {
    this.items = [];
    this.note = null;
    this.meaning = null;
    this.phrase = null;
    let wordEl = this._wordEl;
    if (!wordEl) {
      this.word = null;
      this.head = null;
      return;
    }
    this.word = wordEl.textContent;
    this.head = this.word;

    let dataset = wordEl.dataset;
    for (let name in dataset) {
      let value = dataset[name];
      if (name === DataAttrNames.mean && !dataset[DataAttrNames.forPhraseGroup]) {
        let mean = value;
        let forWord = dataset[DataAttrNames.word];
        if (!forWord) {
          forWord = this.word;
        }
        let pos = dataset[DataAttrNames.pos] || '';
        let text = mean;
        if (pos) {
          text = `${pos} ${mean}`;
        }
        this.meaning = {pos, mean, word: forWord, text};
        continue;
      }
      if (name === DataAttrNames.note) {
        this.note = value;
        continue;
      }

      if (name === DataAttrNames.assoc && DataAttrValues.phraPattern.test(value)) {
        let group = value;

        console.log(group);

        let stEl = AnnotatorHelper.findSentence(this.wordEl, this.paraTextEl);
        if (!stEl) {
          stEl = this.paraTextEl;
        }
        let groupSelector = `[data-${DataAttrNames.assoc}=${group}]`;
        let groupEls = stEl.querySelectorAll(groupSelector);
        let els = Array.from(groupEls);
        let words = els.map((el: Element) => el.textContent).join(' ');
        if (words.indexOf(' ') == -1) {
          continue;
        }

        let meaningEl = null;
        let meaning = null;
        let phraseWord = words;

        for (let el0 of els) {
          let el = el0 as HTMLElement;
          let ds = el.dataset;
          let mean = ds[DataAttrNames.mean];
          if (!mean) {
            meaningEl = el;
            continue;
          }
          let phraseGroup = ds[DataAttrNames.forPhraseGroup];
          let forWord = ds[DataAttrNames.word];
          if (forWord !== words && phraseGroup !== group) {
            continue;
          }
          if (forWord) {
            phraseWord = forWord;
          }
          meaning = mean;
          meaningEl = el;
          break;
        }

        if (!meaningEl) {
          meaningEl = wordEl;
        }

        this.phrase = {group, words, phraseWord, meaning, meaningEl};
        continue;
      }

      let text = this.annotationSet.annotationOutput(name, value);
      if (!text) {
        continue;
      }
      let item = {dataName: name, dataValue: value, text};
      this.items.push(item);
    }

    if (this.head.length > 20) {
      this.head = this.head.substring(0, 20) + '...';
    }
  }

  editMeaning() {
    this.onEditMeaning(this._wordEl);
  }

  editPhraseMeaning(phrase) {
    this.onEditMeaning(phrase.meaningEl, {words: phrase.words, group: phrase.group});
  }

  editNote() {
    this.onEditNote(this._wordEl);
  }

  dropAnno(item) {
    let element = this._wordEl;
    let dataset = element.dataset;
    if (item === 'phraseMeaning' || item === 'meaning') {
      if (item === 'phraseMeaning') {
        element = this.phrase.meaningEl;
        dataset = element.dataset;
        this.phrase = null;
      } else if (item === 'meaning') {
        this.meaning = null;
      }
      delete dataset[DataAttrNames.pos];
      delete dataset[DataAttrNames.word];
      delete dataset[DataAttrNames.mean];
      delete dataset[DataAttrNames.forPhraseGroup];
    } else if (item === 'note') {
      delete dataset[DataAttrNames.note];
      this.note = null;
    } else {
      let dataName = item.dataName;
      if (!dataName) {
        return;
      }
      delete dataset[dataName];
      element.classList.remove(dataName);
      this.items = this.items.filter(it => it !== item);
    }

    this.notifyChange();

    if (!this.note && !this.meaning && (!this.items || this.items.length == 0)) {
      let {removed} = AnnotatorHelper.removeDropTagIfDummy(element);
      if (removed) {
        this.onTagRemoved(element);
      }
    }
  }

}
