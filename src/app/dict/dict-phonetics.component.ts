import {Component, Input} from '@angular/core';

@Component({
  selector: 'dict-phonetics',
  templateUrl: './dict-phonetics.component.html'
})
export class DictPhoneticsComponent {
  @Input() phonetics: any;
}
