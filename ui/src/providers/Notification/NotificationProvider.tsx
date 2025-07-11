import { Notification } from "@/utils/types";
import { useState } from "react";
import { notifications } from '@mantine/notifications';
import { NotificationContext } from "./NotificationContext";

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);

  const showNotification = (notification: Notification) => {
    console.log('showNotification called with:', notification);
    // Add to internal state
    setNotificationsList([...notificationsList, notification]);
    // Show Mantine notification for 5 seconds
    notifications.show({
      id: `notification-${Date.now()}`,
      title: notification.title,
      message: notification.message,
      color: notification.type === 'error' ? 'red' : notification.type === 'success' ? 'green' : 'blue',
      autoClose: 5000, // 5 seconds
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
