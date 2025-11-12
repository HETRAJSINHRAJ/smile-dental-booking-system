import { AlertButton } from '../components/CustomAlert';

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  icon?: string;
  iconColor?: string;
}

// Global alert handler
let globalAlertHandler: ((config: AlertConfig) => void) | null = null;

export const setGlobalAlertHandler = (handler: (config: AlertConfig) => void) => {
  globalAlertHandler = handler;
};

export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  icon?: string,
  iconColor?: string
) => {
  if (globalAlertHandler) {
    globalAlertHandler({
      title,
      message,
      buttons,
      icon,
      iconColor,
    });
  } else {
    console.warn('Global alert handler not set. Make sure AlertProvider is mounted.');
  }
};

// Convenience methods for common alert types
export const Alert = {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => {
    showAlert(title, message, buttons);
  },

  success: (title: string, message?: string, buttons?: AlertButton[]) => {
    showAlert(title, message, buttons, 'checkmark-circle');
  },

  error: (title: string, message?: string, buttons?: AlertButton[]) => {
    showAlert(title, message, buttons, 'alert-circle');
  },

  warning: (title: string, message?: string, buttons?: AlertButton[]) => {
    showAlert(title, message, buttons, 'warning');
  },

  info: (title: string, message?: string, buttons?: AlertButton[]) => {
    showAlert(title, message, buttons, 'information-circle');
  },

  confirm: (
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    showAlert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        { text: 'Confirm', style: 'default', onPress: onConfirm },
      ],
      'help-circle'
    );
  },
};
