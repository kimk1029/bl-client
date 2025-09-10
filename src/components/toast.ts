import { toast } from 'sonner';

type ToastKind = 'success' | 'error' | 'info' | 'warning';

type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastOptions = {
  description?: string;
  duration?: number;
  action?: ToastAction;
};

const withDefaults = (options?: ToastOptions) => ({
  duration: 2500,
  ...options,
});

export const showToast = (kind: ToastKind, message: string, options?: ToastOptions) => {
  const opts = withDefaults(options);
  switch (kind) {
    case 'success':
      return toast.success(message, opts);
    case 'error':
      return toast.error(message, opts);
    case 'info':
      return toast.info(message, opts);
    case 'warning':
      return toast.warning(message, opts);
  }
};

export const showSuccess = (message: string, options?: ToastOptions) => toast.success(message, withDefaults(options));
export const showError = (message: string, options?: ToastOptions) => toast.error(message, withDefaults(options));
export const showInfo = (message: string, options?: ToastOptions) => toast.info(message, withDefaults(options));
export const showWarning = (message: string, options?: ToastOptions) => toast.warning(message, withDefaults(options));


