import {DataAttrNames, DataAttrValues, UIConstants} from "../config";

export class AnnotatorHelper {

  static extendWholeWord(text: string, wordPattern: RegExp, wordStart: number, wordEnd: number) {
    let trimLeft = false, trimRight = false;
    let cp = wordPattern;
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


  static removeTagIfDummy(element) {
    if (element.tagName !== UIConstants.annotationTagName.toUpperCase()) {
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

  static findSentence(node, textEl): any {
    let sentenceSelector = UIConstants.sentenceTagName;
    do {
      if (node instanceof Element) {
        let el = node as Element;
        if (el === textEl) {
          return null;
        }
        if (el.matches(sentenceSelector)) {
          return el;
        }
      }
      node = node.parentNode;
    } while (node);
    return null;
  }

  static currentPhrase(wordEl, textEl) {
    let stEl = this.findSentence(wordEl, textEl);
    if (!stEl) {
      stEl = textEl;
    }
    let ds = wordEl.dataset;
    let group = ds[DataAttrNames.assoc];
    if (!group) {
      return null;
    }
    if (!DataAttrValues.phraPattern.test(group)) {
      return null;
    }
    let groupSelector = `[data-${DataAttrNames.assoc}=${group}]`;
    let groupEls = stEl.querySelectorAll(groupSelector);
    let els = Array.from(groupEls);
    return els.map((el: Element) => el.textContent).join(' ');
  }


  static checkIsContainer(element: Element, container): boolean {
    if (!container) {
      return false;
    }
    if (typeof container === 'string') {
      if (element.matches(container as string)) {
        return true;
      }
    } else if (container === element) {
      return true;
    }
    return false;
  }

  static lookupElement(element, selector, container) {
    if (!selector) {
      return null;
    }
    while (element) {
      if (element.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }
      if (this.checkIsContainer(element, container)) {
        return null;
      }
      if (element.matches(selector)) {
        return element;
      }
      element = element.parentNode;
    }
    return null;
  }

  static checkSelectionContainer(selection: Selection, ...containers) {
    let node1 = selection.anchorNode;
    let node2 = selection.focusNode;

    if (!node1 || !node2) {
      return null;
    }

    let offset1 = selection.anchorOffset;
    let offset2 = selection.focusOffset;

    if (node1 === node2 && offset1 === offset2) {
      return null;
    }

    if (node1.nodeType !== Node.TEXT_NODE
      || node2.nodeType !== Node.TEXT_NODE) {
      return null;
    }

    if (node1.parentNode !== node2.parentNode) {
      return null;
    }

    for (let container of containers) {
      if (this.inContainer(node1, node2, container)) {
        return container;
      }
    }

    return null;
  }

  static inContainer(node1, node2, container): boolean {

    if (!container) {
      return true;
    }

    if (typeof container === 'string') {
      let lookupContainer = (node) => {
        do {
          if (node instanceof Element) {
            let el = node as Element;
            if (el.matches(container as string)) {
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

    if (container instanceof Element) {
      let ct = container as Element;
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
