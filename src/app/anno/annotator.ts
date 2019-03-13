import {Annotation} from '../models/annotation';
import {AnnotateResult} from './annotate-result';
import {UIConstants} from '../config';

export class Annotator {
  static annotationTagName = UIConstants.annotationTagName;

  charPattern = /[-a-zA-Z']/;
  wordAtCursorIfNoSelection = true;
  isExtendWholeWord = true;
  // element or selector,
  container: Element | string = null;

  current: Annotation;

  constructor(container) {
    this.container = container;
  }

  switchAnnotation(annotation: Annotation) {
    this.current = annotation;
  }

  private extendWholeWord(text, wordStart, wordEnd) {
    let trimLeft = false, trimRight = false;
    let cp = this.charPattern;
    if (wordStart < wordEnd) {
      if (!cp.test(text.charAt(wordStart))) {
        wordStart++;
        while (wordStart < text.length) {
          let c = text.charAt(wordStart);
          if (!cp.test(c)) {
            wordStart++;
          } else {
            break;
          }
        }
        trimLeft = true;
      }
      if (!cp.test(text.charAt(wordEnd - 1))) {
        wordEnd--;
        while (wordEnd > 0) {
          let c = text.charAt(wordEnd - 1);
          if (!cp.test(c)) {
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
        if (cp.test(c)) {
          wordStart--;
        } else {
          break;
        }
      }
    }
    if (!trimRight) {
      while (wordEnd < text.length) {
        let c = text.charAt(wordEnd);
        if (cp.test(c)) {
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

  private createWrappingTag() {
    let ann = this.current;
    let wrapping;
    if (ann.tagName) {
      wrapping = document.createElement(ann.tagName);
    } else {
      wrapping = document.createElement(Annotator.annotationTagName);
      if (ann.cssClass) {
        wrapping.className = ann.cssClass;
      }
    }
    this.setDataAttribute(wrapping);
    return wrapping;
  }

  private checkIsContainer(element: Element): boolean {
    if (!this.container) {
      return false;
    }
    if (typeof this.container === 'string') {
      if (element.matches(this.container as string)) {
        return true;
      }
    } else if (this.container === element) {
      return true;
    }
    return false;
  }

  private lookupElement(element, selector) {
    if (!selector) {
      return null;
    }
    while (element) {
      if (element.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }
      if (this.checkIsContainer(element)) {
        return null;
      }
      if (element.matches(selector)) {
        return element;
      }
      element = element.parentNode;
    }
    return null;
  }

  private setDataAttribute(element) {
    let ann = this.current;
    if (ann.dataName && ann.dataValue) {
      element.dataset[ann.dataName] = ann.dataValue;
    }
  }

  private annotationSelector() {
    let ann = this.current;
    let selector = '';
    if (ann.cssClass) {
      selector = '.' + ann.cssClass;
    }
    let dataAttr = null;
    if (ann.dataName) {
      if (ann.dataValue) {
        dataAttr = `[data-${ann.dataName}=${ann.dataValue}]`;
      } else {
        dataAttr = `[data-${ann.dataName}]`;
      }
      selector += dataAttr;
    }
    if (ann.tagName) {
      let tagSelector = ann.tagName.toLowerCase();
      if (dataAttr) {
        tagSelector += dataAttr;
      }
      selector = `${tagSelector}, ${selector}`;
    }
    return selector;
  }

  private removeTagIfDummy(element) {
    if (element.tagName !== Annotator.annotationTagName.toUpperCase()) {
      return false;
    }
    if (element.classList.length === 0) {
      element.removeAttribute('class');
    }
    if (!element.hasAttributes()) {
      //remove tag
      let pp = element.parentNode;
      while (element.firstChild) {
        pp.insertBefore(element.firstChild, element);
      }
      pp.removeChild(element);
      pp.normalize();
    }
  }

  private resetAnnotation(element, type, match?) {
    //type: add, remove, toggle
    if (element.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    let ann = this.current;
    if (typeof match === 'undefined') {
      match = element.matches(this.annotationSelector());
    }
    if (match) {
      if (type === 'add') {
        this.setDataAttribute(element);
        return;
      }
      // remove,toggle
      if (ann.dataName) {
        delete element.dataset[ann.dataName];
      }
      element.classList.remove(ann.cssClass);
      if (element.tagName === ann.tagName && element.hasAttributes()) {
        let wrapping = document.createElement(Annotator.annotationTagName);
        wrapping.className = element.className;

        //for (let item of element.childNodes)
        while (element.firstChild) {
          wrapping.appendChild(element.firstChild);
        }
        let pp = element.parentNode;
        pp.replaceChild(wrapping, element);
        return;
      }
      this.removeTagIfDummy(element);
    } else {
      if (type === 'add' || type === 'toggle') {
        this.setDataAttribute(element);
        if (element.tagName !== ann.tagName && ann.cssClass) {
          element.classList.add(ann.cssClass);
        }
        return;
      }
      // remove
      if (ann.dataName) {
        delete element.dataset[ann.dataName];
      }
      element.classList.remove(ann.cssClass);
      this.removeTagIfDummy(element);
    }
  }

  private removeInnerAnnotations(element) {
    let selector = this.annotationSelector();
    let annotated = element.querySelectorAll(selector);
    annotated.forEach(ae => {
      this.resetAnnotation(ae, 'remove', true);
    });
  }

  private lookupAndProcess(element) {
    let selector = this.annotationSelector();
    let annotatedNode = this.lookupElement(element, selector);
    if (!annotatedNode) {
      return null;
    }
    let ar = new AnnotateResult();
    ar.wordEl = annotatedNode;
    let ann = this.current;
    let editAttrOutside = ann.dataName && typeof ann.dataValue === 'undefined';
    if (editAttrOutside) {
      return ar;
    } else {
      this.resetAnnotation(annotatedNode, 'remove', true);
      ar.operation = 'remove';
      return ar;
    }
  }

  private doInOneTextNode(textNode: Text, offset1, offset2): AnnotateResult {

    let nodeText = textNode.textContent;
    if (offset1 > offset2) {
      [offset1, offset2] = [offset2, offset1];
    }

    let ar0 = this.lookupAndProcess(textNode.parentNode);
    if (ar0) {
      return ar0;
    }

    let [wordStart, wordEnd] = [offset1, offset2];
    if (this.isExtendWholeWord) {
      [wordStart, wordEnd] = this.extendWholeWord(nodeText, wordStart, wordEnd);
    }
    if (wordStart === wordEnd) {
      return null;
    }

    let ar = new AnnotateResult();
    ar.operation = 'add';
    let selectedText = nodeText.substring(wordStart, wordEnd);

    if (selectedText === nodeText) {
      // if (textNode.previousSibling === null && textNode.nextSibling === null) {
      // the only one TextNode
      let exactNode = textNode.parentNode as Element;
      this.resetAnnotation(exactNode, 'add', true);
      ar.wordEl = exactNode;
      return ar;
      // }
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

    ar.wordEl = wrapping;
    ar.elCreated = true;
    return ar;
  }

  private doInSameParent(parent: Element, textNode1: Text, offset1, textNode2: Text, offset2): AnnotateResult {

    let cns = Array.from(parent.childNodes);
    let nodeIndex1 = cns.indexOf(textNode1);
    let nodeIndex2 = cns.indexOf(textNode2);
    if (nodeIndex1 > nodeIndex2) {
      [textNode1, textNode2] = [textNode2, textNode1];
      [offset1, offset2] = [offset2, offset1];
    }

    let ar0 = this.lookupAndProcess(parent);
    if (ar0) {
      return ar0;
    }

    let interNodes = [];
    let inter = false;
    let ann = this.current;
    let editAttrOutside = ann.dataName && typeof ann.dataValue === 'undefined';
    for (let item of cns) {
      if (item === textNode2) {
        break;
      }
      if (inter) {
        if (item.nodeType === Node.ELEMENT_NODE && editAttrOutside) {
          let selector = this.annotationSelector();
          let itemEl = item as Element;
          if (itemEl.matches(selector)) {
            return null;
          }
          let nested = itemEl.querySelector(selector);
          if (nested) {
            return null;
          }
        }
        interNodes.push(item);
      }
      if (item === textNode1) {
        inter = true;
      }
    }

    let [wordStart1, wordEnd2] = [offset1, offset2];
    let text1 = textNode1.textContent, text2 = textNode2.textContent;

    if (this.isExtendWholeWord) {
      [wordStart1,] = this.extendWholeWord(text1, wordStart1, text1.length);
      [, wordEnd2] = this.extendWholeWord(text2, 0, wordEnd2);
    }

    let beginingNode = textNode1;
    if (wordStart1 > 0) {
      beginingNode = beginingNode.splitText(wordStart1);
    }

    let endingNode = textNode2;
    endingNode.splitText(wordEnd2);

    let wrapping = this.createWrappingTag();
    parent.replaceChild(wrapping, beginingNode);
    wrapping.appendChild(beginingNode);
    for (let inode of interNodes) {
      wrapping.appendChild(inode);
    }
    wrapping.appendChild(endingNode);
    this.removeInnerAnnotations(wrapping);

    let ar = new AnnotateResult();
    ar.operation = 'add';
    ar.wordEl = wrapping;
    ar.elCreated = true;
    return ar;
  }

  annotate(): AnnotateResult {
    if (!this.current) {
      return null;
    }
    let selection = window.getSelection();
    let ar = this.doAnnotate(selection);
    selection.removeAllRanges();
    return ar;
  }

  private doAnnotate(selection: Selection): AnnotateResult {
    let node1 = selection.anchorNode;
    let node2 = selection.focusNode;

    if (!node1 || !node2) {
      return null;
    }

    let offset1 = selection.anchorOffset;
    let offset2 = selection.focusOffset;

    if (!this.wordAtCursorIfNoSelection) {
      if (node1 === node2 && offset1 === offset2) {
        return null;
      }
    }

    if (node1.nodeType !== Node.TEXT_NODE
      || node2.nodeType !== Node.TEXT_NODE) {
      return null;
    }

    if (node1.parentNode !== node2.parentNode) {
      return null;
    }

    if (!this.inContainer(node1, node2)) {
      return null;
    }

    let textNode1 = node1 as Text;
    let textNode2 = node2 as Text;

    if (textNode1 === textNode2) {
      return this.doInOneTextNode(textNode1, offset1, offset2);
    }

    // textNode1 !== textNode2
    // textNode1.parentNode === textNode2.parentNode
    let parent = textNode1.parentNode as Element;
    return this.doInSameParent(parent, textNode1, offset1, textNode2, offset2);
  }

  private inContainer(node1, node2): boolean {

    if (!this.container) {
      return true;
    }

    if (typeof this.container === 'string') {
      let lookupContainer = (node) => {
        do {
          if (node instanceof Element) {
            let el = node as Element;
            if (el.matches(this.container as string)) {
              return el;
            }
          }
          node = node.parentNode;
        } while (node);
        return null;
      };

      let container1 = lookupContainer(node1);
      if (!container1) {
        return false;
      }
      if (node1 !== node2) {
        let container2 = lookupContainer(node2);
        if (!container2) {
          return false;
        }
        if (container1 !== container2) {
          return false;
        }
      }
      return true;
    }

    if (this.container instanceof Element) {
      let ct = this.container as Element;
      if (!ct.contains(node1)) {
        return false;
      }
      if (node1 !== node2 && !ct.contains(node2)) {
        return false;
      }
    }

    return true;
  }

}
