import { TransactionItem } from './transaction';

export interface Receipt {
  id: string;
  date: string;
  items: TransactionItem[];
  total: number;
  paymentAmount: number;
  changeAmount: number;
}
