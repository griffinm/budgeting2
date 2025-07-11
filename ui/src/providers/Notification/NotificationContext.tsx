import { createContext } from "react";
import { Notification } from "@/utils/types";

interface NotificationContextType {
  showNotification: (notification: Notification) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});
