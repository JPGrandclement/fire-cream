import { useDailyMessage } from "../hooks/useDailyMessage";
import { SealReveal } from "./SealReveal";

export function DailyMessagePage() {
  const message = useDailyMessage();

  return (
    <section className="daily-message-page">
      <h1 className="reveal-on-scroll">Message du jour</h1>
      <SealReveal>
        <div className="message-card reveal-on-scroll">
          <p>{message}</p>
        </div>
      </SealReveal>
    </section>
  );
}
