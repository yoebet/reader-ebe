import {
  OnChanges, SecurityContext,
  Input, SimpleChanges,
  Compiler, Component, Injector, NgModule, CUSTOM_ELEMENTS_SCHEMA,
  NgModuleRef, ViewChild, ViewContainerRef
} from '@angular/core';
import {DomSanitizer, BrowserModule} from '@angular/platform-browser';


import {FormsModule} from '@angular/forms';
import {SuiModule} from 'ng2-semantic-ui';


const WORD_CHAR = /[-a-zA-Z]/;

const containerClass = 'pre-wrap';
const dummyTagName = 'span';
const class2Tag = {
  wsx: 'x-wsx'.toUpperCase()
};

@Component({
  selector: 'para-content',
  templateUrl: './para-content.component.html'
})
export class ParaContentComponent implements /*OnInit, */OnChanges {
  @ViewChild('vc', {read: ViewContainerRef}) vc: ViewContainerRef;
  @Input() content: string;
  @Input() compile;
  @Input() gotFocus;

  annotateClass = 'wsx';

  constructor(private _compiler: Compiler,
              private _injector: Injector,
              private _m: NgModuleRef<any>,
              private domSanitizer: DomSanitizer) {
  }

  get annotateTag() {
    return class2Tag[this.annotateClass];
  }


  extendWholeWord(text, wordStart, wordEnd) {
    let trimLeft = false, trimRight = false;
    if (wordStart < wordEnd) {
      if (!WORD_CHAR.test(text.charAt(wordStart))) {
        wordStart++;
        while (wordStart < text.length) {
          let c = text.charAt(wordStart);
          if (!WORD_CHAR.test(c)) {
            wordStart++;
          } else {
            break;
          }
        }
        trimLeft = true;
      }
      if (!WORD_CHAR.test(text.charAt(wordEnd))) {
        while (wordEnd > 0) {
          let c = text.charAt(wordEnd - 1);
          if (!WORD_CHAR.test(c)) {
            wordEnd--;
          } else {
            break;
          }
        }
        trimRight = true;
      }
    }
    if (!trimLeft) {
      while (wordStart > 0) {
        let c = text.charAt(wordStart - 1);
        if (WORD_CHAR.test(c)) {
          wordStart--;
        } else {
          break;
        }
      }
    }
    if (!trimRight) {
      while (wordEnd < text.length) {
        let c = text.charAt(wordEnd);
        if (WORD_CHAR.test(c)) {
          wordEnd++;
        } else {
          break;
        }
      }
    }
    if (wordStart > wordEnd) {
      wordStart = wordEnd;
    }
    return [wordStart, wordEnd];
  }

  createWrappingTag() {
    let wrapping;
    if (this.annotateTag) {
      wrapping = document.createElement(this.annotateTag);
    } else {
      wrapping = document.createElement(dummyTagName);
      wrapping.className = this.annotateClass;
    }
    return wrapping;
  }

  lookupAnnotated(textNode) {
    let parent = textNode.parentNode;
    while (parent) {
      if (parent.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }
      if (parent.tagName === this.annotateTag) {
        return parent;
      }
      let classList = parent.classList;
      if (classList.contains(containerClass)) {
        return null;
      }
      if (classList.contains(this.annotateClass)) {
        return parent;
      }
      parent = parent.parentNode;
    }
    return null;
  }

  resetAnnotation(element, type) {
    //type: add, remove, toggle
    if (element.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    let classList = element.classList;
    let tagName = element.tagName;
    let removeTag = false;

    if (tagName === this.annotateTag) {
      if (type === 'add') {
        return;
      }
      if (classList.length > 0) {
        //replace with span
        let wrapping = document.createElement(dummyTagName);
        wrapping.className = element.className;

        //for (let item of element.childNodes)
        while (element.firstChild) {
          wrapping.appendChild(element.firstChild);
        }

        let pp = element.parentNode;
        pp.replaceChild(wrapping, element);

        return;
      }
      removeTag = true;
    } else {
      if (type === 'add') {
        classList.add(this.annotateClass);
        return;
      }
      if (type === 'remove') {
        classList.remove(this.annotateClass);
      }
      if (type === 'toggle') {
        classList.toggle(this.annotateClass);
      }
    }

    if (classList.length === 0 && tagName === dummyTagName.toUpperCase()) {
      removeTag = true;
    }

    if (removeTag) {
      let pp = element.parentNode;

      while (element.firstChild) {
        console.log(element.firstChild);
        pp.insertBefore(element.firstChild, element);
      }
      pp.removeChild(element);

      pp.normalize();
    }
  }

  removeAnnotations(element) {
    let selector = '.' + this.annotateClass;
    if (this.annotateTag) {
      selector = '' + this.annotateTag + ',' + selector;
    }
    let annotated = element.querySelectorAll(selector);
    annotated.forEach(ae => {
      this.resetAnnotation(ae, 'remove');
    });
  }

  annotate() {
    let selection = window.getSelection();
    let node1 = selection.anchorNode;
    let node2 = selection.focusNode;

    if (node1.nodeType !== Node.TEXT_NODE || node2.nodeType !== Node.TEXT_NODE) {
      return;
    }

    let textNode1: Text = node1 as Text;
    let textNode2: Text = node2 as Text;

    let offset1 = selection.anchorOffset;
    let offset2 = selection.focusOffset;

    if (textNode1 === textNode2) {
      let textNode = textNode1;
      let nodeText = textNode.textContent;

      let annotatedNode = this.lookupAnnotated(textNode);
      if (annotatedNode) {
        this.resetAnnotation(annotatedNode, 'remove');
        return;
      }

      let [wordStart, wordEnd] = this.extendWholeWord(nodeText, offset1, offset2);
      if (wordStart === wordEnd) {
        return;
      }

      let selectedText = nodeText.substring(wordStart, wordEnd);

      if (selectedText === nodeText) {
        if (textNode.previousSibling === null && textNode.nextSibling === null) {
          // the only one TextNode
          let exactNode = textNode.parentNode;
          this.resetAnnotation(exactNode, 'toggle');
          return;
        }
      }

      let wordsNode = textNode;
      if (wordStart > 0) {
        wordsNode = wordsNode.splitText(wordStart);
      }
      if (wordEnd < nodeText.length) {
        wordsNode.splitText(selectedText.length);
      }

      let parent = textNode.parentNode;
      let wrapping = this.createWrappingTag();
      parent.replaceChild(wrapping, wordsNode);
      wrapping.appendChild(wordsNode);

    } else {
      // textNode1 !== textNode2

      if (textNode1.parentNode !== textNode2.parentNode) {
        return;
      }

      let parent = textNode1.parentNode;

      let interNodes = [];
      let inter = false;
      let cns = Array.from(parent.childNodes);
      for (let item of cns) {
        if (item === textNode2) {
          break;
        }
        if (inter) {
          interNodes.push(item);
        }
        if (item === textNode1) {
          inter = true;
        }
      }

      let text1 = textNode1.textContent, text2 = textNode2.textContent;
      let [wordStart1, _wordEnd1] = this.extendWholeWord(text1, offset1, text1.length);
      let [_wordStart2, wordEnd2] = this.extendWholeWord(text2, 0, offset2);

      let beginingNode = textNode1;
      if (wordStart1 > 0) {
        beginingNode = beginingNode.splitText(wordStart1);
      }

      let endingNode = textNode2;
      if (wordEnd2 > 0) {
        endingNode.splitText(wordEnd2);
      }

      let wrapping = this.createWrappingTag();
      parent.replaceChild(wrapping, beginingNode);
      wrapping.appendChild(beginingNode);

      for (let inode of interNodes) {
        wrapping.appendChild(inode);
      }

      wrapping.appendChild(endingNode);

      this.removeAnnotations(wrapping);
    }

  }

  onMouseup() {
    if(!this.gotFocus){
      return;
    }
    this.annotate();
  }

  refresh() {

    let html = this.content;
    html = html.replace(
      /\n/g,
      () =>
        ' <i class="caret up icon"></i><i class="caret down icon"></i>\n'
    );
    html = `<div class="pre-wrap">${html}</div>`;

    if (!this.compile) {
      // let html = html.replace(/\n/g, '<br>')
      //   .replace(/  /g, '&nbsp;&nbsp;');
      // console.log(html);
      //html = this.domSanitizer.sanitize(SecurityContext.HTML, html);
      this.vc.clear();
      this.vc.element.nativeElement.innerHTML = html;
      return;
    }

    @Component({
      template: html
    })
    class PCComponent {

      lee() {
        console.log(123);
      }
    }

    @NgModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        BrowserModule,
        FormsModule,
        SuiModule
      ],
      declarations: [
        PCComponent
      ]
    })
    class PCModule {
    }

    this._compiler.compileModuleAndAllComponentsAsync(PCModule)
      .then((factories) => {
        const factory = factories.componentFactories.find((f) =>
          f.componentType === PCComponent
        );
        const cmpRef = factory.create(
          this._injector,
          [],
          null,
          this._m);

        this.vc.element.nativeElement.innerHTML = '';
        this.vc.clear();
        this.vc.insert(cmpRef.hostView);
      });
  }

  // ngAfterViewInit() {
  //   this.compile();
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.content || changes.compile) {
      this.refresh();
    }
  }
}
