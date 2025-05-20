import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { TOAST_DURATION } from '../constants';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Generate a unique ID for each notification
  const generateId = (): string => {
    return `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  // Add a new notification
  const addNotification = useCallback(
    (type: NotificationType, message: string, duration: number = TOAST_DURATION) => {
      const id = generateId();
      const newNotification: Notification = {
        id,
        type,
        message,
        duration,
      };

      setNotifications((prevNotifications) => [...prevNotifications, newNotification]);

      // Auto-remove the notification after the specified duration
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    []
  );

  // Remove a notification by ID
  const removeNotification = useCallback((id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  return context;
}; 