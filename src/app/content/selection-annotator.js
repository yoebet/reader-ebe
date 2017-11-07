"use strict";
exports.__esModule = true;
var SelectionAnnotator = /** @class */ (function () {
    function SelectionAnnotator(annotations, container) {
        this.charPattern = /[-a-zA-Z]/;
        this.inlineTagName = 'span';
        this.wordAtCursorIfNoSelection = true;
        this.selectionBreakerSelector = null;
        // element or selector
        this.container = null;
        // {
        //   name: {
        //     cssClass: 'subj',
        //     tagName: 'x-subj'
        //   }
        // };
        this.annotations = null;
        this.annotations = annotations;
        this.container = container;
    }
    SelectionAnnotator.prototype.switchAnnotation = function (annotationName) {
        this.current = annotationName;
    };
    Object.defineProperty(SelectionAnnotator.prototype, "annotateClass", {
        get: function () {
            var annotation = this.annotations[this.current];
            if (annotation) {
                return annotation.cssClass;
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionAnnotator.prototype, "annotateTag", {
        get: function () {
            var annotation = this.annotations[this.current];
            if (annotation) {
                var tagName = annotation.tagName;
                if (tagName) {
                    return tagName.toUpperCase();
                }
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    SelectionAnnotator.prototype.extendWholeWord = function (text, wordStart, wordEnd) {
        var trimLeft = false, trimRight = false;
        var cp = this.charPattern;
        if (wordStart < wordEnd) {
            if (!cp.test(text.charAt(wordStart))) {
                wordStart++;
                while (wordStart < text.length) {
                    var c = text.charAt(wordStart);
                    if (!cp.test(c)) {
                        wordStart++;
                    }
                    else {
                        break;
                    }
                }
                trimLeft = true;
            }
            if (!cp.test(text.charAt(wordEnd - 1))) {
                wordEnd--;
                while (wordEnd > 0) {
                    var c = text.charAt(wordEnd - 1);
                    if (!cp.test(c)) {
                        wordEnd--;
                    }
                    else {
                        break;
                    }
                }
                trimRight = true;
            }
        }
        if (!trimLeft) {
            while (wordStart > 0) {
                var c = text.charAt(wordStart - 1);
                if (cp.test(c)) {
                    wordStart--;
                }
                else {
                    break;
                }
            }
        }
        if (!trimRight) {
            while (wordEnd < text.length) {
                var c = text.charAt(wordEnd);
                if (cp.test(c)) {
                    wordEnd++;
                }
                else {
                    break;
                }
            }
        }
        if (wordStart > wordEnd) {
            wordStart = wordEnd;
        }
        return [wordStart, wordEnd];
    };
    SelectionAnnotator.prototype.createWrappingTag = function () {
        var wrapping;
        if (this.annotateTag) {
            wrapping = document.createElement(this.annotateTag);
        }
        else {
            wrapping = document.createElement(this.inlineTagName);
            wrapping.className = this.annotateClass;
        }
        return wrapping;
    };
    SelectionAnnotator.prototype.lookupAnnotated = function (textNode) {
        var element = textNode.parentNode;
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
                }
                else if (this.container === element) {
                    return null;
                }
            }
            var classList = element.classList;
            if (classList.contains(this.annotateClass)) {
                return element;
            }
            element = element.parentNode;
        }
        return null;
    };
    SelectionAnnotator.prototype.resetAnnotation = function (element, type) {
        //type: add, remove, toggle
        if (element.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        var classList = element.classList;
        var tagName = element.tagName;
        var removeTag = false;
        if (tagName === this.annotateTag) {
            if (type === 'add') {
                return;
            }
            if (classList.length > 0) {
                //replace with span
                var wrapping = document.createElement(this.inlineTagName);
                wrapping.className = element.className;
                //for (let item of element.childNodes)
                while (element.firstChild) {
                    wrapping.appendChild(element.firstChild);
                }
                var pp = element.parentNode;
                pp.replaceChild(wrapping, element);
                return;
            }
            removeTag = true;
        }
        else {
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
            var pp = element.parentNode;
            while (element.firstChild) {
                pp.insertBefore(element.firstChild, element);
            }
            pp.removeChild(element);
            pp.normalize();
        }
    };
    SelectionAnnotator.prototype.removeAnnotations = function (element) {
        var _this = this;
        var selector = '.' + this.annotateClass;
        if (this.annotateTag) {
            selector = this.annotateTag + ',' + selector;
        }
        var annotated = element.querySelectorAll(selector);
        annotated.forEach(function (ae) {
            _this.resetAnnotation(ae, 'remove');
        });
    };
    SelectionAnnotator.prototype.doInOneTextNode = function (textNode, offset1, offset2) {
        var nodeText = textNode.textContent;
        if (offset1 > offset2) {
            _a = [offset2, offset1], offset1 = _a[0], offset2 = _a[1];
        }
        var annotatedNode = this.lookupAnnotated(textNode);
        if (annotatedNode) {
            this.resetAnnotation(annotatedNode, 'remove');
            return true;
        }
        var _b = this.extendWholeWord(nodeText, offset1, offset2), wordStart = _b[0], wordEnd = _b[1];
        if (wordStart === wordEnd) {
            return false;
        }
        var selectedText = nodeText.substring(wordStart, wordEnd);
        if (selectedText === nodeText) {
            if (textNode.previousSibling === null && textNode.nextSibling === null) {
                // the only one TextNode
                var exactNode = textNode.parentNode;
                this.resetAnnotation(exactNode, 'toggle');
                return true;
            }
        }
        var wordsNode = textNode;
        if (wordStart > 0) {
            wordsNode = wordsNode.splitText(wordStart);
        }
        if (wordEnd < nodeText.length) {
            wordsNode.splitText(selectedText.length);
        }
        var parent = textNode.parentNode;
        var wrapping = this.createWrappingTag();
        parent.replaceChild(wrapping, wordsNode);
        wrapping.appendChild(wordsNode);
        return true;
        var _a;
    };
    SelectionAnnotator.prototype.doInSameParent = function (parent, textNode1, offset1, textNode2, offset2) {
        var cns = Array.from(parent.childNodes);
        var nodeIndex1 = cns.indexOf(textNode1);
        var nodeIndex2 = cns.indexOf(textNode2);
        if (nodeIndex1 > nodeIndex2) {
            _a = [textNode2, textNode1], textNode1 = _a[0], textNode2 = _a[1];
            _b = [offset2, offset1], offset1 = _b[0], offset2 = _b[1];
        }
        var interNodes = [];
        var inter = false;
        for (var _i = 0, cns_1 = cns; _i < cns_1.length; _i++) {
            var item = cns_1[_i];
            if (item === textNode2) {
                break;
            }
            if (inter) {
                var sbs = this.selectionBreakerSelector;
                if (sbs && item instanceof Element) {
                    var el = item;
                    if (el.matches(sbs)) {
                        return false;
                    }
                    var lf = el.querySelector(sbs);
                    if (lf) {
                        return false;
                    }
                }
                interNodes.push(item);
            }
            if (item === textNode1) {
                inter = true;
            }
        }
        var text1 = textNode1.textContent, text2 = textNode2.textContent;
        var _c = this.extendWholeWord(text1, offset1, text1.length), wordStart1 = _c[0], _wordEnd1 = _c[1];
        var _d = this.extendWholeWord(text2, 0, offset2), _wordStart2 = _d[0], wordEnd2 = _d[1];
        var beginingNode = textNode1;
        if (wordStart1 > 0) {
            beginingNode = beginingNode.splitText(wordStart1);
        }
        var endingNode = textNode2;
        endingNode.splitText(wordEnd2);
        var wrapping = this.createWrappingTag();
        parent.replaceChild(wrapping, beginingNode);
        wrapping.appendChild(beginingNode);
        for (var _e = 0, interNodes_1 = interNodes; _e < interNodes_1.length; _e++) {
            var inode = interNodes_1[_e];
            wrapping.appendChild(inode);
        }
        wrapping.appendChild(endingNode);
        this.removeAnnotations(wrapping);
        return true;
        var _a, _b;
    };
    SelectionAnnotator.prototype.annotate = function (wordAtCursorIfNoSelection) {
        if (wordAtCursorIfNoSelection === void 0) { wordAtCursorIfNoSelection = undefined; }
        if (!this.current) {
            return false;
        }
        var selection = window.getSelection();
        var savedWacins = this.wordAtCursorIfNoSelection;
        if (typeof wordAtCursorIfNoSelection === 'boolean') {
            this.wordAtCursorIfNoSelection = wordAtCursorIfNoSelection;
        }
        try {
            var changed = this.doAnnotate(selection);
            selection.removeAllRanges();
            return changed;
        }
        finally {
            this.wordAtCursorIfNoSelection = savedWacins;
        }
    };
    SelectionAnnotator.prototype.doAnnotate = function (selection) {
        var node1 = selection.anchorNode;
        var node2 = selection.focusNode;
        var offset1 = selection.anchorOffset;
        var offset2 = selection.focusOffset;
        if (!this.wordAtCursorIfNoSelection) {
            if (node1 === node2 && offset1 === offset2) {
                return false;
            }
        }
        if (node1.nodeType !== Node.TEXT_NODE
            || node2.nodeType !== Node.TEXT_NODE) {
            return false;
        }
        if (node1.parentNode !== node2.parentNode) {
            return false;
        }
        if (!this.inContainer(node1, node2)) {
            return false;
        }
        var textNode1 = node1;
        var textNode2 = node2;
        if (textNode1 === textNode2) {
            return this.doInOneTextNode(textNode1, offset1, offset2);
        }
        // textNode1 !== textNode2
        // textNode1.parentNode === textNode2.parentNode
        var parent = textNode1.parentNode;
        return this.doInSameParent(parent, textNode1, offset1, textNode2, offset2);
    };
    SelectionAnnotator.prototype.closest = function (node, selector) {
        do {
            if (node instanceof Element) {
                var el = node;
                if (el.matches(selector)) {
                    return el;
                }
            }
            node = node.parentNode;
        } while (node);
        return null;
    };
    SelectionAnnotator.prototype.inContainer = function (node1, node2) {
        if (!this.container) {
            return true;
        }
        if (typeof this.container === 'string') {
            var container1 = this.closest(node1, this.container);
            if (!container1) {
                return false;
            }
            if (node1 !== node2) {
                var container2 = this.closest(node2, this.container);
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
            var ct = this.container;
            if (!ct.contains(node1)) {
                return false;
            }
            if (!ct.contains(node2)) {
                return false;
            }
        }
        return true;
    };
    return SelectionAnnotator;
}());
exports.SelectionAnnotator = SelectionAnnotator;
