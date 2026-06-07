import { forwardRef } from 'react';
import type { Breakdown } from '@/lib/breakdown';
import { CATEGORY_META } from '@/lib/categories';

// The card is a dark export artifact, so unlogged time uses a translucent light track
// rather than the app's light-gray UNACCOUNTED_COLOR.
const CARD_TRACK = 'rgba(255,255,255,0.12)';

export interface CardData {
  dayNumber: number;
  currentStreak: number;
  dateLabel: string;
  title: string;
  productiveItems: string[];
  summary?: string | null;
  hashtag?: string | null;
  breakdown: Breakdown;
}

export const CARD_SIZE = 1080;

/**
 * The shareable card. Rendered at an exact 1080×1080 px box with inline styles so
 * html-to-image reproduces it pixel-for-pixel regardless of the app's CSS context.
 */
export const ProgressCard = forwardRef<HTMLDivElement, { data: CardData }>(
  function ProgressCard({ data }, ref) {
    const { breakdown: b } = data;
    const segs = [
      { color: CATEGORY_META.productive.color, pct: b.productivePct },
      { color: CATEGORY_META.sleep.color, pct: b.sleepPct },
      { color: CATEGORY_META.other.color, pct: b.otherPct },
      { color: CARD_TRACK, pct: b.unaccountedPct },
    ];
    const items = data.productiveItems.slice(0, 7);

    return (
      <div
        ref={ref}
        style={{
          width: CARD_SIZE,
          height: CARD_SIZE,
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(900px 700px at 100% -10%, rgba(232,80,58,0.18), transparent 55%),' +
            'radial-gradient(800px 700px at -10% 110%, rgba(91,108,255,0.16), transparent 55%),' +
            'linear-gradient(160deg,#101116 0%,#0a0b0e 100%)',
          color: '#f6f5f1',
          fontFamily: '"Space Grotesk", Inter, system-ui, sans-serif',
          padding: 84,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 26, letterSpacing: 6, color: 'rgba(246,245,241,0.45)', fontWeight: 600 }}>
              DAY
            </div>
            <div style={{ fontSize: 132, fontWeight: 700, lineHeight: 0.92, marginTop: 4 }}>
              {String(data.dayNumber).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 28, color: 'rgba(246,245,241,0.5)', marginTop: 14 }}>
              {data.dateLabel}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(232,80,58,0.14)',
              border: '1px solid rgba(232,80,58,0.35)',
              borderRadius: 999,
              padding: '16px 26px',
            }}
          >
            <span style={{ fontSize: 40 }}>🔥</span>
            <span style={{ fontSize: 52, fontWeight: 700 }}>{data.currentStreak}</span>
          </div>
        </div>

        {/* title */}
        <div style={{ marginTop: 40 }}>
          <div
            style={{
              fontSize: 60,
              fontWeight: 600,
              lineHeight: 1.05,
              maxHeight: 130,
              overflow: 'hidden',
            }}
          >
            {data.title || 'Daily Audit'}
          </div>
        </div>

        {/* productive list */}
        <div style={{ marginTop: 36, flex: 1, minHeight: 0 }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: CATEGORY_META.productive.color,
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            ⚡ Productive
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {items.length === 0 ? (
              <div style={{ fontSize: 30, color: 'rgba(246,245,241,0.4)' }}>—</div>
            ) : (
              items.map((name, i) => (
                <div key={i} style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
                  <span
                    style={{
                      fontSize: 30,
                      fontWeight: 700,
                      color: CATEGORY_META.productive.color,
                      minWidth: 44,
                    }}
                  >
                    {i + 1}.
                  </span>
                  <span
                    style={{
                      fontSize: 34,
                      lineHeight: 1.25,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 800,
                    }}
                  >
                    {name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* summary */}
        {data.summary?.trim() && (
          <div
            style={{
              fontSize: 28,
              fontStyle: 'italic',
              color: 'rgba(246,245,241,0.6)',
              borderLeft: '3px solid rgba(246,245,241,0.2)',
              paddingLeft: 22,
              marginBottom: 30,
              maxHeight: 90,
              overflow: 'hidden',
            }}
          >
            {data.summary}
          </div>
        )}

        {/* breakdown */}
        <div>
          <div style={{ display: 'flex', gap: 30, marginBottom: 16, fontSize: 28 }}>
            <Stat emoji="⚡" pct={b.productivePct} color={CATEGORY_META.productive.color} />
            <Stat emoji="😴" pct={b.sleepPct} color={CATEGORY_META.sleep.color} />
            <Stat emoji="🌀" pct={b.otherPct} color={CATEGORY_META.other.color} />
          </div>
          <div
            style={{
              display: 'flex',
              height: 16,
              width: '100%',
              borderRadius: 999,
              overflow: 'hidden',
              background: CARD_TRACK,
            }}
          >
            {segs.map((s, i) => (
              <div key={i} style={{ width: `${s.pct}%`, background: s.color, height: '100%' }} />
            ))}
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            marginTop: 32,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 24,
          }}
        >
          <span style={{ color: CATEGORY_META.sleep.color, fontWeight: 500 }}>
            {data.hashtag ? normalizeTags(data.hashtag) : ''}
          </span>
          <span style={{ color: 'rgba(246,245,241,0.4)', fontWeight: 600, letterSpacing: 1 }}>
            UnbrokenAudit
          </span>
        </div>
      </div>
    );
  },
);

function Stat({ emoji, pct, color }: { emoji: string; pct: number; color: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span>{emoji}</span>
      <span style={{ fontWeight: 700, color }}>{Math.round(pct)}%</span>
    </span>
  );
}

function normalizeTags(raw: string): string {
  return raw
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((t) => (t.startsWith('#') ? t : `#${t}`))
    .join(' ');
}
