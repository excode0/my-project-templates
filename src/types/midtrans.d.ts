/**
 * TypeScript declarations for Midtrans Snap
 */

interface SnapPaymentCallbacks {
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}

interface Window {
  snap: {
    pay: (token: string, callbacks?: SnapPaymentCallbacks) => void;
    hide: () => void;
    show: () => void;
  };
}
