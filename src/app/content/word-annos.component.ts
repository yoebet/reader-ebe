import {Component, Input, OnInit} from '@angular/core';

import {DictEntry} from '../models/dict-entry';
import {DictService} from '../services/dict.service';
import {AnnotationSet} from "../anno/annotation-set";

@Component({
  selector: 'word-annos',
  templateUrl: './word-annos.component.html',
  styleUrls: ['./word-annos.component.css']
})
export class WordAnnosComponent implements OnInit {
  @Input() _wordEl: Element;
  @Input() paraTextEl: Element;
  @Input() enabled: boolean;
  @Input() annotationSet: AnnotationSet;
  word: string;
  head: string;
  items: any[];
  note: string;
  meaning: any;
  private initialized = false;

  constructor(private dictService: DictService) {
  }

  ngOnInit() {
    this.initialized = true;
  }

  set wordEl(_wordEl: Element) {
    this._wordEl = _wordEl;
    if (this.initialized && this.enabled) {
      this.parseAnnotations();
    }
  }

  get wordEl(): Element {
    return this._wordEl;
  }

  private parseAnnotations() {
    this.items = [];
    this.note = null;
    this.meaning = null;
    if (!this._wordEl) {
      this.word = null;
      this.head = null;
      return;
    }
    this.word = this._wordEl.textContent;
    this.head = this.word;
    let phraseGroup = null;

    let attributes = Array.from(this._wordEl.attributes);
    for (let {name, value} of attributes) {
      if (!name.startsWith('data-')) {
        continue;
      }
      name = name.substr(5);
      if (name === 'mid') {
        let mid = parseInt(value);
        if (isNaN(mid)) {
          continue;
        }
        let forWord = this._wordEl.getAttribute('data-word');
        if (!forWord) {
          forWord = this.word;
        }
        this.meaning = {mid, word: forWord, text: ''};

        let theWordEl = this._wordEl;
        this.dictService.getEntry(forWord, {noref: true})
          .subscribe((entry: DictEntry) => {
              if (!entry) {
                return;
              }
              if (this._wordEl !== theWordEl) {
                return;
              }
              if (!entry.complete) {
                return;
              }
              for (let posMeaning of entry.complete) {
                let items = posMeaning.items;
                for (let item of items) {
                  if (item.id === mid) {
                    let meaningText = `${posMeaning.pos}${item.exp}`;
                    this.meaning = {mid, word: forWord, text: meaningText};
                  }
                }
              }
            }
          );
        continue;
      }
      if (name === 'note') {
        this.note = value;
        continue;
      }
      if (name === 'phra' && /^g\d$/.test(value)) {
        phraseGroup = value;
        continue;
      }
      let text = this.annotationSet.annotationOutput(name, value);
      if (!text) {
        continue;
      }
      let item = {dataName: name, dataValue: value, text};
      this.items.push(item);
    }

    if (phraseGroup && this.items.length === 0 && !this.note && !this.meaning) {
      let stEl = this.findSentence(this.wordEl);
      if (!stEl) {
        stEl = this.paraTextEl;
      }
      let groupSelector = `[data-phra=${phraseGroup}]`;
      let groupEls = stEl.querySelectorAll(groupSelector);
      let els = Array.from(groupEls);
      this.head = els.map((el: Element) => el.textContent).join(' ');
    }
    if (this.head.length > 20) {
      this.head = this.head.substring(0, 20) + '...';
    }
  }

  private findSentence(node): any {
    do {
      if (node instanceof Element) {
        let el = node as Element;
        if (el === this.paraTextEl) {
          return null;
        }
        if (el.matches('s-st')) {
          return el;
        }
      }
      node = node.parentNode;
    } while (node);
    return null;
  }

}
