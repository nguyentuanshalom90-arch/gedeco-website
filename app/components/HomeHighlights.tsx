import React from 'react';
import { Icon } from './home-page';

export type HighlightItem = readonly [title: string, description: string];

interface HomeHighlightsProps {
  highlights: readonly HighlightItem[];
}

export function HomeHighlights({ highlights }: HomeHighlightsProps) {
  const iconNames = ['globe', 'handshake', 'chart', 'people'] as const;

  return (
    <section className="home-highlights-section section-dark" aria-label="Đặc điểm nổi bật của GEDECO">
      <div className="container">
        <div className="hero-highlights">
          {highlights.map(([title, description], index) => (
            <div key={`${title}-${index}`}>
              <span className="highlight-icon">
                <Icon name={iconNames[index]} />
              </span>
              <div>
                <strong>{title}</strong>
                <small>{description}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
