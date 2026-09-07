import { useState } from "react";
import Tilt from "react-parallax-tilt";
import { timelineSteps, TimelineStep } from "../data/timelineData";

export function Timeline() {
  const [selectedStep, setSelectedStep] = useState<TimelineStep | null>(null);

  return (
    <section className="timeline-page">
      <h1 className="reveal-on-scroll timeline-title">La route</h1>

      <div className="route">
        {timelineSteps.map((step, index) => (
          <div 
            className="route-step reveal-on-scroll" 
            key={step.id}
            style={{ transitionDelay: `${index * 100}ms` }}
            onClick={() => setSelectedStep(step)}
          >
            <Tilt
              tiltMaxAngleX={4}
              tiltMaxAngleY={4}
              perspective={1200}
              transitionSpeed={1200}
              scale={1.01}
              glareEnable={false}
              className="route-card-tilt"
              data-cursor="Détails"
            >
              <div className="route-card">
                <h3>
                  {step.title}{" "}
                  <small>({step.date})</small>
                </h3>
                <p>{step.description}</p>
              </div>
            </Tilt>
          </div>
        ))}
      </div>

      {selectedStep && (
        <div className="timeline-modal-overlay" onClick={() => setSelectedStep(null)} onWheel={(e) => e.stopPropagation()}>
          <div className="timeline-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedStep(null)}>×</button>
            {selectedStep.image && <img src={selectedStep.image} alt={selectedStep.title} />}
            <h2>{selectedStep.title}</h2>
            <p className="date">{selectedStep.date}</p>
            <p className="content">{selectedStep.fullContent}</p>
          </div>
        </div>
      )}
    </section>
  );
}
