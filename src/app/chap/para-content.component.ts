import {
  OnInit, AfterViewInit, OnChanges, SecurityContext,
  Input, SimpleChanges, ElementRef,
  Compiler, Component, Injector, NgModule,
  NgModuleRef, ViewChild, ViewContainerRef
} from '@angular/core';
import {DomSanitizer, BrowserModule} from '@angular/platform-browser';


import {FormsModule} from '@angular/forms';
import {SuiModule} from 'ng2-semantic-ui';

@Component({
  selector: 'para-content',
  templateUrl: './para-content.component.html'
})
export class ParaContentComponent implements /*OnInit, */OnChanges {
  @ViewChild('vc', {read: ViewContainerRef}) vc: ViewContainerRef;
  @Input() content: string;
  @Input() compile;

  constructor(private _compiler: Compiler,
              private _injector: Injector,
              private _m: NgModuleRef<any>,
              private domSanitizer: DomSanitizer) {
  }


  // ngOnInit(): void {
  //   console.log(this.content);
  // }

  onClick() {
    console.log('click');
  }

  onMouseup() {
    console.log('mouseup');
    let sel: Selection = window.getSelection();
    let selection = sel.toString();
    if (selection && selection.length > 0) {
      alert(selection);
    }
  }

  refresh() {
    let preWrapContent = `<div class="pre-wrap">${this.content}</div>`;

    if (!this.compile) {
      let html = preWrapContent;
      // let html = html.replace(/\n/g, '<br>')
      //   .replace(/  /g, '&nbsp;&nbsp;');
      // console.log(html);
      html = this.domSanitizer.sanitize(SecurityContext.HTML, html);
      this.vc.clear();
      this.vc.element.nativeElement.innerHTML = html;
      return;
    }

    @Component({
      template: preWrapContent
    })
    class PCComponent {

      lee() {
        console.log(123);
      }
    }

    @NgModule({
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
