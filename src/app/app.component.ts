import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

import {User} from './models/user';
import {AppService} from './services/app.service';
import {SessionService} from "./services/session.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  constructor(private appService: AppService,
              private sessionService: SessionService,
              private router: Router) {
  }

  ngOnInit() {
    this.sessionService.checkLogin();
  }

  logout() {
    this.sessionService.logout();
    this.router.navigate(['/']);
  }
}
