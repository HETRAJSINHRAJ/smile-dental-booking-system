import React, { useEffect } from 'react';
import { CustomAlert } from './CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { setGlobalAlertHandler } from '../utils/alert';

interface AlertProviderProps {
  children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const { alertConfig, visible, showAlert, hideAlert } = useCustomAlert();

  useEffect(() => {
    // Set the global alert handler
    setGlobalAlertHandler(showAlert);

    return () => {
      setGlobalAlertHandler(() => {});
    };
  }, [showAlert]);

  return (
    <>
      {children}
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          icon={alertConfig.icon}
          iconColor={alertConfig.iconColor}
          onDismiss={hideAlert}
        />
      )}
    </>
  );
};
