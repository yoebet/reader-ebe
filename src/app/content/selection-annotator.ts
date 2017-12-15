import {Annotation} from '../view-common/annotation';

export class SelectionAnnotator {
  static annotationTagName = 'y-o';

  charPattern = /[-a-zA-Z]/;
  wordAtCursorIfNoSelection = true;
  selectionBreakerSelector: string = null;
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
      wrapping = document.createElement(SelectionAnnotator.annotationTagName);
      wrapping.className = ann.cssClass;
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

  private lookupAnnotated(textNode) {
    let selector = this.annotationSelector();
    let element = textNode.parentNode;
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

  private removeDataAttribute(element) {
    let ann = this.current;
    if (ann.dataName) {
      delete element.dataset[ann.dataName];
    }
  }

  private annotationSelector() {
    let ann = this.current;
    let selector = '.' + ann.cssClass;
    if (ann.dataName) {
      selector += `[data-${ann.dataName}]`;
    }
    if (ann.tagName) {
      let tagSelector = ann.tagName.toLowerCase();
      if (ann.dataName) {
        tagSelector += `[data-${ann.dataName}]`;
      }
      selector = `${tagSelector}, ${selector}`;
    }
    return selector;
  }

  private resetAnnotation(element, type) {
    //type: add, remove, toggle
    if (element.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    let ann = this.current;
    let selector = this.annotationSelector();
    let match = element.matches(selector);
    if (match) {
      if (type === 'add') {
        this.setDataAttribute(element);
        return;
      }
      if (type === 'remove' || type === 'toggle') {
        this.removeDataAttribute(element);
        element.classList.remove(ann.cssClass);
        let hasAttributes = element.hasAttributes();
        if (element.tagName === ann.tagName && hasAttributes) {
          let wrapping = document.createElement(SelectionAnnotator.annotationTagName);
          wrapping.className = element.className;

          //for (let item of element.childNodes)
          while (element.firstChild) {
            wrapping.appendChild(element.firstChild);
          }
          let pp = element.parentNode;
          pp.replaceChild(wrapping, element);
          return;
        }
        if (!hasAttributes) {
          //remove tag
          let pp = element.parentNode;
          while (element.firstChild) {
            pp.insertBefore(element.firstChild, element);
          }
          pp.removeChild(element);
          pp.normalize();
        }
      }
    } else {
      if (type === 'add') {
        this.setDataAttribute(element);
        if (element.tagName !== ann.tagName) {
          element.classList.add(ann.cssClass);
        }
        return;
      }
    }
  }

  private removeInnerAnnotations(element) {
    let selector = this.annotationSelector();
    let annotated = element.querySelectorAll(selector);
    annotated.forEach(ae => {
      this.resetAnnotation(ae, 'remove');
    });
  }

  private doInOneTextNode(textNode: Text, offset1, offset2): Element {

    let nodeText = textNode.textContent;
    if (offset1 > offset2) {
      [offset1, offset2] = [offset2, offset1];
    }

    let annotatedNode = this.lookupAnnotated(textNode);
    if (annotatedNode) {
      this.resetAnnotation(annotatedNode, 'remove');
      return annotatedNode;
    }

    let [wordStart, wordEnd] = [offset1, offset2];
    if (this.isExtendWholeWord) {
      [wordStart, wordEnd] = this.extendWholeWord(nodeText, wordStart, wordEnd);
    }
    if (wordStart === wordEnd) {
      return null;
    }

    let selectedText = nodeText.substring(wordStart, wordEnd);

    if (selectedText === nodeText) {
      if (textNode.previousSibling === null && textNode.nextSibling === null) {
        // the only one TextNode
        let exactNode = textNode.parentNode as Element;
        this.resetAnnotation(exactNode, 'toggle');
        return exactNode;
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

    return wrapping;
  }

  private doInSameParent(parent: Node, textNode1: Text, offset1, textNode2: Text, offset2): Element {

    let cns = Array.from(parent.childNodes);
    let nodeIndex1 = cns.indexOf(textNode1);
    let nodeIndex2 = cns.indexOf(textNode2);
    if (nodeIndex1 > nodeIndex2) {
      [textNode1, textNode2] = [textNode2, textNode1];
      [offset1, offset2] = [offset2, offset1];
    }

    let interNodes = [];
    let inter = false;
    for (let item of cns) {
      if (item === textNode2) {
        break;
      }
      if (inter) {
        let sbs = this.selectionBreakerSelector;
        if (sbs && item instanceof Element) {
          let el = item as Element;
          if (el.matches(sbs)) {
            return null;
          }
          let lf = el.querySelector(sbs);
          if (lf) {
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

    return wrapping;
  }

  annotate(wordAtCursorIfNoSelection: boolean = undefined): Element {
    if (!this.current) {
      return null;
    }
    let selection = window.getSelection();
    let savedWacins = this.wordAtCursorIfNoSelection;
    if (typeof wordAtCursorIfNoSelection === 'boolean') {
      this.wordAtCursorIfNoSelection = wordAtCursorIfNoSelection;
    }
    try {
      let el = this.doAnnotate(selection);
      selection.removeAllRanges();
      return el;
    } finally {
      this.wordAtCursorIfNoSelection = savedWacins;
    }
  }

  private doAnnotate(selection: Selection): Element {
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
    let parent = textNode1.parentNode;
    return this.doInSameParent(parent, textNode1, offset1, textNode2, offset2);
  }

  private closest(node, selector) {
    do {
      if (node instanceof Element) {
        let el = node as Element;
        if (el.matches(selector)) {
          return el;
        }
      }
      node = node.parentNode;
    } while (node);
    return null;
  }

  private inContainer(node1, node2): boolean {

    if (!this.container) {
      return true;
    }

    if (typeof this.container === 'string') {
      let container1 = this.closest(node1, this.container);
      if (!container1) {
        return false;
      }
      if (node1 !== node2) {
        let container2 = this.closest(node2, this.container);
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
      if (!ct.contains(node2)) {
        return false;
      }
    }

    return true;
  }

  // return {element,created}
  getOrCreateWordTag(maxWords = 3, minLength = 3) {
    let selection = window.getSelection();

    let node1 = selection.anchorNode;
    let node2 = selection.focusNode;

    if (!node1 || !node2) {
      return null;
    }

    let offset1 = selection.anchorOffset;
    let offset2 = selection.focusOffset;

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

    if (textNode1 !== textNode2) {
      return null;
    }

    let nodeText = textNode1.textContent;
    if (offset1 > offset2) {
      [offset1, offset2] = [offset2, offset1];
    }

    let [wordStart, wordEnd] = [offset1, offset2];
    if (this.isExtendWholeWord) {
      [wordStart, wordEnd] = this.extendWholeWord(nodeText, wordStart, wordEnd);
    }
    if (wordStart === wordEnd) {
      return null;
    }

    let selectedText = nodeText.substring(wordStart, wordEnd);
    if (selectedText.length < minLength) {
      return null;
    }
    if (selectedText.split(/ +/).length > maxWords) {
      return null;
    }

    if (selectedText === nodeText) {
      if (textNode1.previousSibling === null && textNode1.nextSibling === null) {
        // the only one TextNode
        let exactNode = textNode1.parentNode as HTMLElement;
        return {element: exactNode, word: selectedText, created: false};
      }
    }

    let wordsNode = textNode1;
    if (wordStart > 0) {
      wordsNode = wordsNode.splitText(wordStart);
    }
    if (wordEnd < nodeText.length) {
      wordsNode.splitText(selectedText.length);
    }

    let parent = textNode1.parentNode;

    let wrapping = document.createElement(SelectionAnnotator.annotationTagName) as HTMLElement;
    parent.replaceChild(wrapping, wordsNode);
    wrapping.appendChild(wordsNode);

    return {element: wrapping, word: selectedText, created: true};
  }

}
