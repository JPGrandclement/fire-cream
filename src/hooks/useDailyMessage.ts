import { useState, useEffect } from "react";
import { dailyMessages } from "../data/dailyMessages";

export function useDailyMessage() {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    
    const index = dayOfYear % dailyMessages.length;
    const dailyMessage = dailyMessages[index];
    
    // Check cache
    const cached = localStorage.getItem("daily-message");
    if (cached) {
      const { date, text } = JSON.parse(cached);
      if (date === now.toDateString()) {
        setMessage(text);
        return;
      }
    }
    
    setMessage(dailyMessage);
    localStorage.setItem("daily-message", JSON.stringify({
      date: now.toDateString(),
      text: dailyMessage
    }));
  }, []);

  return message;
}
