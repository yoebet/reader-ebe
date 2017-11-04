export class SelectionAnnotator {

  charPattern = /[-a-zA-Z]/;

  inlineTagName = 'span';
  selectionBreakerSelector: string = null;
  // element or selector
  container: Element | string = null;
  // {
  //   name: {
  //     cssClass: 'subj',
  //     tagName: 'x-subj'
  //   }
  // };
  annotations = null;

  current: string;

  constructor(annotations, container) {
    this.annotations = annotations;
    this.container = container;
  }

  switchAnnotation(annotationName) {
    this.current = annotationName;
  }

  get annotateClass() {
    let annotation = this.annotations[this.current];
    if (annotation) {
      return annotation.cssClass;
    }
    return null;
  }

  get annotateTag() {
    let annotation = this.annotations[this.current];
    if (annotation) {
      let tagName = annotation.tagName;
      if (tagName) {
        return tagName.toUpperCase();
      }
    }
    return null;
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
    let wrapping;
    if (this.annotateTag) {
      wrapping = document.createElement(this.annotateTag);
    } else {
      wrapping = document.createElement(this.inlineTagName);
      wrapping.className = this.annotateClass;
    }
    return wrapping;
  }

  private lookupAnnotated(textNode) {
    let element = textNode.parentNode;
    while (element) {
      if (element.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }
      if (element.tagName === this.annotateTag) {
        return element;
      }
      if (this.container) {
        if (typeof this.container === 'string') {
          if (element.matches(this.container)) {
            return null;
          }
        } else if (this.container === element) { // instanceof Element
          return null;
        }
      }
      let classList = element.classList;
      if (classList.contains(this.annotateClass)) {
        return element;
      }
      element = element.parentNode;
    }
    return null;
  }

  private resetAnnotation(element, type) {
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
        let wrapping = document.createElement(this.inlineTagName);
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

    if (classList.length === 0 && tagName === this.inlineTagName.toUpperCase()) {
      removeTag = true;
    }

    if (removeTag) {
      let pp = element.parentNode;
      while (element.firstChild) {
        pp.insertBefore(element.firstChild, element);
      }
      pp.removeChild(element);

      pp.normalize();
    }
  }

  private removeAnnotations(element) {
    let selector = '.' + this.annotateClass;
    if (this.annotateTag) {
      selector = '' + this.annotateTag + ',' + selector;
    }
    let annotated = element.querySelectorAll(selector);
    annotated.forEach(ae => {
      this.resetAnnotation(ae, 'remove');
    });
  }

  private doInOneTextNode(textNode: Text, offset1, offset2) {

    let nodeText = textNode.textContent;
    if (offset1 > offset2) {
      [offset1, offset2] = [offset2, offset1];
    }

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
  }

  private doInSameParent(parent: Node, textNode1: Text, offset1, textNode2: Text, offset2) {

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
            return;
          }
          let lf = el.querySelector(sbs);
          if (lf) {
            return;
          }
        }
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
    endingNode.splitText(wordEnd2);

    let wrapping = this.createWrappingTag();
    parent.replaceChild(wrapping, beginingNode);
    wrapping.appendChild(beginingNode);

    for (let inode of interNodes) {
      wrapping.appendChild(inode);
    }
    wrapping.appendChild(endingNode);

    this.removeAnnotations(wrapping);
  }

  annotate(noopIfNoSelection = false) {
    if (!this.current) {
      return;
    }
    let selection = window.getSelection();
    this.doAnnotate(selection, noopIfNoSelection);
    selection.removeAllRanges();
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

  private doAnnotate(selection: Selection, returnIfNoSelection = false) {
    let node1 = selection.anchorNode;
    let node2 = selection.focusNode;
    let offset1 = selection.anchorOffset;
    let offset2 = selection.focusOffset;

    if (returnIfNoSelection) {
      if (node1 === node2 && offset1 === offset2) {
        return;
      }
    }

    if (node1.nodeType !== Node.TEXT_NODE
      || node2.nodeType !== Node.TEXT_NODE) {
      return;
    }

    if (node1.parentNode !== node2.parentNode) {
      return;
    }

    if (!this.inContainer(node1, node2)) {
      return;
    }

    let textNode1 = node1 as Text;
    let textNode2 = node2 as Text;

    if (textNode1 === textNode2) {
      this.doInOneTextNode(textNode1, offset1, offset2);
    } else {
      // textNode1 !== textNode2
      // textNode1.parentNode === textNode2.parentNode
      let parent = textNode1.parentNode;
      this.doInSameParent(parent, textNode1, offset1, textNode2, offset2);
    }
  }

}
