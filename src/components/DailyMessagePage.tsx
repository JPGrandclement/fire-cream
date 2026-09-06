import { useDailyMessage } from "../hooks/useDailyMessage";

export function DailyMessagePage() {
  const message = useDailyMessage();

  return (
    <section className="daily-message-page">
      <h1 className="reveal-on-scroll">Message du jour</h1>
      <div className="message-card reveal-on-scroll">
        <p>{message}</p>
      </div>
    </section>
  );
}
