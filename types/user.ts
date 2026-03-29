export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'ewallet' | 'bank_transfer';
  isActive: boolean;
}
