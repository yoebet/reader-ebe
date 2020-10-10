import {Model} from './model';

export class Order extends Model {
  orderNo: string;
  userId: string;
  bookId: string;
  isAllChaps: boolean;
  chapIds: string[];
  productDesc: string;
  totalFee: number;
  paid: boolean;
  executed: boolean;
  status: string; // Initial/Cancel/Paid/Completed/Refunding/Refunded

  userName: string;
  userNickName: string;
}
