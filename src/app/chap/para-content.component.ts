import {
  OnChanges, OnInit,
  Input, SimpleChanges,
  Compiler, Component, Injector, NgModule, CUSTOM_ELEMENTS_SCHEMA,
  NgModuleRef, ViewChild, ViewContainerRef
} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';


import {FormsModule} from '@angular/forms';
import {SuiModule} from 'ng2-semantic-ui';
import {ParaAnnotator} from './para-annotator';


@Component({
  selector: 'para-content',
  templateUrl: './para-content.component.html'
})
export class ParaContentComponent implements OnInit, OnChanges {
  @ViewChild('vc', {read: ViewContainerRef}) vc: ViewContainerRef;
  @Input() content: string;
  @Input() compile;
  @Input() gotFocus;
  annotator: ParaAnnotator;

  annotations = {
    spSub: {
      cssClass: 'sp-sub',
      tagName: 'sp-sub'
    },
    spObj: {
      cssClass: 'sp-obj',
      tagName: 'sp-obj'
    }
  };

  constructor(private _compiler: Compiler,
              private _injector: Injector,
              private _m: NgModuleRef<any>) {
  }

  ngOnInit() {
    let containerSelector = '.pre-wrap';
    this.annotator = new ParaAnnotator(this.annotations, containerSelector);
    this.annotator.switchAnnotation('spSub');
    this.annotator.selectionBreakerSelector = '.line-break';
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
    }
  }
}
