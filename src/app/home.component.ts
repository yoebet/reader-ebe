import {Component, OnInit, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {DOCUMENT} from "@angular/common";

import {SuiModalService} from 'ng2-semantic-ui';

import {User} from './models/user';
import {SessionService} from './services/session.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  constructor(private sessionService: SessionService,
              private router: Router,
              private route: ActivatedRoute,
              public modalService: SuiModalService,
              @Inject(DOCUMENT) private document) {
  }

  ngOnInit() {
  }

}
