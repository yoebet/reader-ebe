import {Component, OnInit} from '@angular/core';

import {SuiModalService} from 'ng2-semantic-ui';

import {Order} from '../models/order';
import {OrderService} from '../services/order.service';
import {PageableListComponent} from '../common/pageable-list.component';

@Component({
  selector: 'order-list',
  templateUrl: './order-list.component.html'
})
export class OrderListComponent extends PageableListComponent implements OnInit {
  orders: Order[];
  searchOrderNo: string;


  constructor(private orderService: OrderService,
              public modalService: SuiModalService) {
    super();
  }

  doList(options: any) {
    if (this.searchOrderNo) {
      options.searchOrderNo = this.searchOrderNo;
    }
    this.orderService
      .list(options)
      .subscribe(orders => this.orders = orders);
  }

  ngOnInit() {
    this.list();
  }

  search() {
    this.page = 1;
    this.list();
  }

  searchReset() {
    this.page = 1;
    this.searchOrderNo = null;
    this.list();
  }


  orderTracker(index, order) {
    return order._id;
  }
}
