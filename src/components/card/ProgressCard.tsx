import { forwardRef } from 'react';
import { Flame, Zap, Check } from 'lucide-react';
import type { Breakdown } from '@/lib/breakdown';
import { CATEGORY_META } from '@/lib/categories';

export interface ProductiveItem {
  name: string;
  minutes: number;
}

export interface CardData {
  dayNumber: number;
  currentStreak: number;
  dateLabel: string;
  title: string;
  productiveItems: ProductiveItem[];
  summary?: string | null;
  hashtag?: string | null;
  breakdown: Breakdown;
}

export const CARD_SIZE = 1080;

const INK = '#f4f3f1';
const SUB = 'rgba(244,243,241,0.56)';
const FAINT = 'rgba(244,243,241,0.34)';
const LINE = 'rgba(244,243,241,0.10)';
const TRACK = 'rgba(244,243,241,0.08)';
const ACCENT = '#e8503a';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const SANS = 'Inter, system-ui, sans-serif';

function dur(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Premium 1080×1080 export. Inline styles only, so html-to-image reproduces it
 * pixel-for-pixel regardless of app CSS. Lucide icons render as inline SVG.
 */
export const ProgressCard = forwardRef<HTMLDivElement, { data: CardData }>(
  function ProgressCard({ data }, ref) {
    const { breakdown: b } = data;
    const items = data.productiveItems.slice(0, 5);
    const overflow = data.productiveItems.length - items.length;
    const segs = [
      { color: CATEGORY_META.productive.color, pct: b.productivePct },
      { color: CATEGORY_META.sleep.color, pct: b.sleepPct },
      { color: CATEGORY_META.other.color, pct: b.otherPct },
      { color: TRACK, pct: b.unaccountedPct },
    ];

    return (
      <div
        ref={ref}
        style={{
          width: CARD_SIZE,
          height: CARD_SIZE,
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(180deg, #141416 0%, #0b0b0d 46%, #08080a 100%)',
          color: INK,
          fontFamily: SANS,
          padding: 88,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* hairline top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: ACCENT }} />

        {/* brand row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 40,
                height: 40,
                borderRadius: 10,
                background: INK,
              }}
            >
              <Check size={22} strokeWidth={3.2} color="#0b0b0d" />
            </span>
            <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: 4, color: SUB }}>
              UNBROKEN AUDIT
            </span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 22, color: FAINT, letterSpacing: 1 }}>
            {data.dateLabel}
          </span>
        </div>

        <div style={{ height: 1, background: LINE, marginTop: 28 }} />

        {/* hero */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 44 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22 }}>
            <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: 3, color: FAINT, paddingBottom: 26 }}>
              DAY
            </span>
            <span style={{ fontSize: 168, fontWeight: 700, lineHeight: 0.82, letterSpacing: -4 }}>
              {data.dayNumber}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(232,80,58,0.12)',
              border: `1px solid rgba(232,80,58,0.4)`,
              borderRadius: 999,
              padding: '14px 24px',
              marginBottom: 12,
            }}
          >
            <Flame size={28} color={ACCENT} />
            <span style={{ fontSize: 30, fontWeight: 700 }}>{data.currentStreak}</span>
            <span style={{ fontSize: 22, color: SUB, fontWeight: 500 }}>day streak</span>
          </div>
        </div>

        {/* title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 600,
            letterSpacing: -1,
            lineHeight: 1.04,
            marginTop: 30,
            maxHeight: 124,
            overflow: 'hidden',
          }}
        >
          {data.title || 'Daily Audit'}
        </div>

        {/* focus list */}
        <div style={{ marginTop: 38, flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Zap size={20} color={ACCENT} fill={ACCENT} />
            <span style={{ fontSize: 20, letterSpacing: 3, fontWeight: 600, color: SUB }}>FOCUS</span>
          </div>
          {items.length === 0 ? (
            <div style={{ fontSize: 26, color: FAINT }}>No focus blocks logged.</div>
          ) : (
            <div>
              {items.map((it, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 22,
                    padding: '16px 0',
                    borderTop: i === 0 ? 'none' : `1px solid ${LINE}`,
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: 24, color: ACCENT, width: 36, fontWeight: 600 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 32,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {it.name}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 24, color: SUB }}>{dur(it.minutes)}</span>
                </div>
              ))}
              {overflow > 0 && (
                <div style={{ fontSize: 22, color: FAINT, paddingTop: 14 }}>+{overflow} more</div>
              )}
            </div>
          )}
        </div>

        {/* summary */}
        {data.summary?.trim() && (
          <div
            style={{
              fontSize: 26,
              color: SUB,
              borderLeft: `2px solid ${ACCENT}`,
              paddingLeft: 20,
              marginBottom: 28,
              maxHeight: 80,
              overflow: 'hidden',
            }}
          >
            {data.summary}
          </div>
        )}

        {/* breakdown tiles */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
          <Tile meta={CATEGORY_META.productive} pct={b.productivePct} minutes={b.productiveMinutes} />
          <Tile meta={CATEGORY_META.sleep} pct={b.sleepPct} minutes={b.sleepMinutes} />
          <Tile meta={CATEGORY_META.other} pct={b.otherPct} minutes={b.otherMinutes} />
        </div>

        {/* segmented bar */}
        <div style={{ display: 'flex', height: 12, width: '100%', borderRadius: 999, overflow: 'hidden', background: TRACK }}>
          {segs.map((s, i) => (
            <div key={i} style={{ width: `${s.pct}%`, background: s.color, height: '100%' }} />
          ))}
        </div>

        {/* footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 26 }}>
          <span style={{ fontSize: 22, color: CATEGORY_META.sleep.color, fontWeight: 500 }}>
            {data.hashtag ? normalizeTags(data.hashtag) : ''}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 20, color: FAINT, letterSpacing: 1 }}>
            unbrokenaudit.app
          </span>
        </div>
      </div>
    );
  },
);

function Tile({ meta, pct, minutes }: { meta: { Icon: typeof Zap; color: string; label: string }; pct: number; minutes: number }) {
  const Icon = meta.Icon;
  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${LINE}`,
        borderRadius: 16,
        padding: '18px 20px',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <Icon size={18} color={meta.color} />
        <span style={{ fontSize: 19, color: SUB, fontWeight: 500 }}>{meta.label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: meta.color, letterSpacing: -1 }}>
          {Math.round(pct)}%
        </span>
        <span style={{ fontFamily: MONO, fontSize: 20, color: FAINT }}>{dur(minutes)}</span>
      </div>
    </div>
  );
}

function normalizeTags(raw: string): string {
  return raw
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((t) => (t.startsWith('#') ? t : `#${t}`))
    .join(' ');
}
