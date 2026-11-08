/**
 * TypeScript declarations for midtrans-client package
 */

declare module 'midtrans-client' {
  export interface MidtransConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  export interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface ItemDetails {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }

  export interface CustomerDetails {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
  }

  export interface SnapParameter {
    transaction_details: TransactionDetails;
    item_details?: ItemDetails[];
    customer_details?: CustomerDetails;
    callbacks?: {
      finish?: string;
      error?: string;
      pending?: string;
    };
  }

  export interface SnapTransaction {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(config: MidtransConfig);
    createTransaction(parameter: SnapParameter): Promise<SnapTransaction>;
  }

  export class CoreApi {
    constructor(config: MidtransConfig);
    transaction: {
      status(orderId: string): Promise<any>;
      cancel(orderId: string): Promise<any>;
      refund(orderId: string, params?: any): Promise<any>;
    };
  }
}
