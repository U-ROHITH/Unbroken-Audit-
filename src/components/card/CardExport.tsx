import { useEffect, useRef, useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ProgressCard, CARD_SIZE, type CardData } from './ProgressCard';
import { cardFilename } from '@/lib/format';

interface Props {
  data: CardData;
  caption: string;
}

export function CardExport({ data, caption }: Props) {
  const exportRef = useRef<HTMLDivElement>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { success, error } = useToast();

  // Fit the full-size card into the available preview width.
  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / CARD_SIZE));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const download = async () => {
    if (!exportRef.current) return;
    try {
      setDownloading(true);
      // Heavy lib — load it only when the user actually exports.
      const { toPng } = await import('html-to-image');
      // Ensure fonts are ready so text renders correctly in the snapshot.
      if (document.fonts?.ready) await document.fonts.ready;
      const url = await toPng(exportRef.current, {
        width: CARD_SIZE,
        height: CARD_SIZE,
        pixelRatio: 2,
        cacheBust: true,
      });
      const a = document.createElement('a');
      a.href = url;
      a.download = cardFilename(data.dayNumber);
      a.click();
      success('Card downloaded — open Instagram and upload it.');
    } catch (e) {
      error('Could not export the card. Try again.');
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      success('Caption copied.');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      error('Clipboard blocked. Long-press the caption to copy.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Visible, scaled-down preview */}
      <div
        ref={previewWrapRef}
        className="mx-auto w-full overflow-hidden rounded-xl2 border border-white/10 shadow-2xl"
        style={{ height: CARD_SIZE * scale }}
      >
        <div style={{ width: CARD_SIZE, height: CARD_SIZE, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <ProgressCard data={data} />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={download} loading={downloading} className="flex-1">
          <Download className="h-4 w-4" /> Download 1:1 PNG
        </Button>
        <Button variant="outline" onClick={copyCaption} className="flex-1">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy caption'}
        </Button>
      </div>

      {/* Off-screen full-size node used for the export (unscaled, pixel-exact). */}
      <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden>
        <ProgressCard ref={exportRef} data={data} />
      </div>
    </div>
  );
}
