/**
 * Midtrans Payment Gateway Integration
 * 
 * Handles payment initiation and transaction management
 * Uses Snap API for hosted payment page
 */

import crypto from 'crypto';
import { Snap, CoreApi } from 'midtrans-client';

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

let snapClient: Snap | null = null;
let coreApiClient: CoreApi | null = null;

/**
 * Whether Midtrans credentials are available.
 */
export function isMidtransConfigured(): boolean {
  return Boolean(
    process.env.MIDTRANS_SERVER_KEY && process.env.MIDTRANS_CLIENT_KEY
  );
}

/**
 * Snap client for creating payment tokens (created lazily).
 */
export function getSnap(): Snap {
  if (!isMidtransConfigured()) {
    throw new Error('Midtrans is not configured');
  }

  if (!snapClient) {
    snapClient = new Snap({
      isProduction,
      serverKey: process.env.MIDTRANS_SERVER_KEY as string,
      clientKey: process.env.MIDTRANS_CLIENT_KEY as string,
    });
  }

  return snapClient;
}

/**
 * Core API client for transaction management (created lazily).
 */
export function getCoreApi(): CoreApi {
  if (!isMidtransConfigured()) {
    throw new Error('Midtrans is not configured');
  }

  if (!coreApiClient) {
    coreApiClient = new CoreApi({
      isProduction,
      serverKey: process.env.MIDTRANS_SERVER_KEY as string,
      clientKey: process.env.MIDTRANS_CLIENT_KEY as string,
    });
  }

  return coreApiClient;
}

/**
 * Payment item interface
 */
export interface PaymentItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

/**
 * Customer details interface
 */
export interface CustomerDetails {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
}

/**
 * Payment parameters interface
 */
export interface PaymentParams {
  orderId: string;
  grossAmount: number;
  items: PaymentItem[];
  customerDetails: CustomerDetails;
  callbackUrl?: string;
}

/**
 * Create payment transaction and get Snap token
 * 
 * @param params Payment parameters
 * @returns Snap token and redirect URL
 */
export async function createPaymentTransaction(params: PaymentParams) {
  try {
    const parameter = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      item_details: params.items,
      customer_details: params.customerDetails,
      callbacks: {
        finish: params.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        error: params.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
        pending: params.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
      },
    };

    const transaction = await getSnap().createTransaction(parameter);
    
    return {
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  } catch (error) {
    console.error('Midtrans payment creation error:', error);
    throw new Error('Failed to create payment transaction');
  }
}

/**
 * Get transaction status from Midtrans
 * 
 * @param orderId Order ID / Transaction ID
 * @returns Transaction status
 */
export async function getTransactionStatus(orderId: string) {
  try {
    const status = await getCoreApi().transaction.status(orderId);
    return status;
  } catch (error) {
    console.error('Midtrans status check error:', error);
    throw new Error('Failed to get transaction status');
  }
}

/**
 * Verify notification signature from Midtrans webhook
 * 
 * @param notification Notification data from webhook
 * @returns True if signature is valid
 */
export function verifySignature(notification: any): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    return false;
  }

  const orderId = notification.order_id;
  const statusCode = notification.status_code;
  const grossAmount = notification.gross_amount;
  const signatureKey = notification.signature_key;

  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');

  return hash === signatureKey;
}

/**
 * Parse transaction status from Midtrans notification
 * 
 * @param transactionStatus Transaction status from Midtrans
 * @param fraudStatus Fraud status from Midtrans
 * @returns Normalized payment status
 */
export function parsePaymentStatus(
  transactionStatus: string,
  fraudStatus?: string
): 'pending' | 'completed' | 'failed' | 'refunded' | 'expired' {
  // Settlement means payment is complete
  if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
    if (fraudStatus === 'accept') {
      return 'completed';
    } else if (fraudStatus === 'challenge') {
      return 'pending'; // Need manual review
    }
    return 'completed';
  }

  // Pending payment
  if (transactionStatus === 'pending') {
    return 'pending';
  }

  // Denied, expired, or cancelled
  if (
    transactionStatus === 'deny' ||
    transactionStatus === 'expire' ||
    transactionStatus === 'cancel'
  ) {
    return 'failed';
  }

  // Refund
  if (transactionStatus === 'refund') {
    return 'refunded';
  }

  // Default to failed for unknown status
  return 'failed';
}

/**
 * Cancel transaction
 * 
 * @param orderId Order ID to cancel
 */
export async function cancelTransaction(orderId: string) {
  try {
    const result = await getCoreApi().transaction.cancel(orderId);
    return result;
  } catch (error) {
    console.error('Midtrans cancel error:', error);
    throw new Error('Failed to cancel transaction');
  }
}

/**
 * Refund transaction
 * 
 * @param orderId Order ID to refund
 * @param amount Amount to refund (optional, full refund if not specified)
 * @param reason Refund reason
 */
export async function refundTransaction(
  orderId: string,
  amount?: number,
  reason?: string
) {
  try {
    const params: any = {};
    if (amount) params.refund_amount = amount;
    if (reason) params.reason = reason;

    const result = await getCoreApi().transaction.refund(orderId, params);
    return result;
  } catch (error) {
    console.error('Midtrans refund error:', error);
    throw new Error('Failed to refund transaction');
  }
}

export default {
  isMidtransConfigured,
  getSnap,
  getCoreApi,
  createPaymentTransaction,
  getTransactionStatus,
  verifySignature,
  parsePaymentStatus,
  cancelTransaction,
  refundTransaction,
};
