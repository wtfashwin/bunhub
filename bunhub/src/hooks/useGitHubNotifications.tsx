import { useEffect, useRef, useState } from "react";

export interface Notification {
  type: string;
  message: string;
  [key: string]: any;
}

export function useGitHubNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001/ws/notifications");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data: Notification = JSON.parse(event.data);
        setNotifications((prev) => [data, ...prev]);
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    // Cleanup on unmount
    return () => {
      socket.close();
    };
  }, []);

  return notifications;
}
