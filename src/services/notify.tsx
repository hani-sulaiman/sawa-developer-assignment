import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';

type NotifyVariant = 'success' | 'error' | 'info' | 'warning';

const variantConfig: Record<
  NotifyVariant,
  { title: string; color: string; icon: JSX.Element }
> = {
  success: {
    title: 'Success',
    color: 'teal',
    icon: <IconCheck size={18} />,
  },
  error: {
    title: 'Something went wrong',
    color: 'red',
    icon: <IconX size={18} />,
  },
  info: {
    title: 'Info',
    color: 'blue',
    icon: <IconInfoCircle size={18} />,
  },
  warning: {
    title: 'Notice',
    color: 'yellow',
    icon: <IconAlertTriangle size={18} />,
  },
};

export function notify(
  variant: NotifyVariant,
  message: string,
  opts?: { title?: string; autoClose?: number }
) {
  const cfg = variantConfig[variant];
  notifications.show({
    title: opts?.title ?? cfg.title,
    message,
    color: cfg.color,
    icon: cfg.icon,
    autoClose: opts?.autoClose ?? 4000,
    withCloseButton: true,
    radius: 'lg',
    styles: {
      root: { borderRadius: 16 },
      title: { fontWeight: 700 },
      description: { color: '#374151' },
    },
  });
}

export const notifySuccess = (message: string, title?: string) =>
  notify('success', message, { title });

export const notifyError = (message: string, title?: string) =>
  notify('error', message, { title });

export const notifyInfo = (message: string, title?: string) =>
  notify('info', message, { title });

export const notifyWarning = (message: string, title?: string) =>
  notify('warning', message, { title });

