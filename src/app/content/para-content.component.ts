import {
  OnChanges, OnInit,
  Input, SimpleChanges,
  Compiler, Component, Injector, NgModule, CUSTOM_ELEMENTS_SCHEMA,
  NgModuleRef, ViewChild, ViewContainerRef
} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';


import {FormsModule} from '@angular/forms';
import {SuiModule} from 'ng2-semantic-ui';
import {SelectionAnnotator} from './selection-annotator';
import {Annotations} from './annatations';


@Component({
  selector: 'para-content',
  templateUrl: './para-content.component.html'
})
export class ParaContentComponent implements OnInit, OnChanges {
  @ViewChild('vc', {read: ViewContainerRef}) vc: ViewContainerRef;
  @Input() content: string;
  @Input() compile;
  @Input() gotFocus;
  _annotator: SelectionAnnotator;
  @Input() annotation: string = null;

  constructor(private _compiler: Compiler,
              private _injector: Injector,
              private _m: NgModuleRef<any>) {
  }

  ngOnInit() {
  }

  get annotator() {
    if (!this._annotator) {
      let containerSelector = '.pre-wrap';
      this._annotator = new SelectionAnnotator(Annotations.forAnnotator, containerSelector);
      this._annotator.selectionBreakerSelector = '.line-break';
    }
    this._annotator.switchAnnotation(this.annotation);
    return this._annotator;
  }

  onMouseup() {
    if (!this.gotFocus) {
      return;
    }
    this.annotator.annotate();
  }

  refresh() {

    let html = this.content;
    html = html.replace(
      /\n/g,
      () =>
        ' <i class="caret up icon"></i><i class="caret down icon line-break"></i>\n'
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
      // lee() {
      //   console.log(123);
      // }
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.content || changes.compile) {
      this.refresh();
    } else if (changes.annotation) {
      this.annotator.annotate(true);
    }
  }
}
