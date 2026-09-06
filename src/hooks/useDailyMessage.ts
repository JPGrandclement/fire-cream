import { useEffect } from "react";
import { dailyMessages } from "../data/dailyMessages";
import { useLoveQuestStore } from "../store/useLoveQuestStore";

export function useDailyMessage() {
  const { dailyMessageCache, setDailyMessageCache } = useLoveQuestStore();
  const now = new Date();
  const today = now.toDateString();

  useEffect(() => {
    if (dailyMessageCache && dailyMessageCache.date === today) {
      return;
    }

    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    
    const index = dayOfYear % dailyMessages.length;
    const dailyMessage = dailyMessages[index];
    
    setDailyMessageCache({
      date: today,
      text: dailyMessage
    });
  }, [dailyMessageCache, today, now, setDailyMessageCache]);

  return dailyMessageCache?.text || "";
}
