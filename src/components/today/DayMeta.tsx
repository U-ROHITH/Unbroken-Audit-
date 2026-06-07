import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';

interface Props {
  title: string | null;
  summary: string | null;
  hashtag: string | null;
  onSave: (meta: { title: string; summary: string; hashtag: string }) => Promise<void>;
}

export function DayMeta({ title, summary, hashtag, onSave }: Props) {
  const [t, setT] = useState(title ?? '');
  const [s, setS] = useState(summary ?? '');
  const [h, setH] = useState(hashtag ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setT(title ?? '');
    setS(summary ?? '');
    setH(hashtag ?? '');
  }, [title, summary, hashtag]);

  const dirty = t !== (title ?? '') || s !== (summary ?? '') || h !== (hashtag ?? '');

  const save = async () => {
    setSaving(true);
    try {
      await onSave({ title: t.trim(), summary: s.trim(), hashtag: h.trim() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-surface space-y-3 p-4">
      <Field label="Title">
        <Input value={t} onChange={(e) => setT(e.target.value)} placeholder="e.g. Deep work Saturday" maxLength={120} />
      </Field>
      <Field label="One-line reflection" hint="Optional — shows on the card.">
        <Input value={s} onChange={(e) => setS(e.target.value)} placeholder="How did it go?" maxLength={280} />
      </Field>
      <Field label="Hashtags">
        <Input value={h} onChange={(e) => setH(e.target.value)} placeholder="buildinpublic 100daysofcode" maxLength={160} />
      </Field>
      <div className="flex justify-end">
        <Button size="sm" variant={dirty ? 'primary' : 'ghost'} loading={saving} disabled={!dirty} onClick={save}>
          <Save className="h-4 w-4" /> Save details
        </Button>
      </div>
    </div>
  );
}
