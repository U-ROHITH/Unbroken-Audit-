import { useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut, Save, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { PageShell } from '@/components/ui/PageShell';
import { useToast } from '@/components/ui/Toast';
import { profileSchema, type ProfileValues } from '@/lib/validation';

function timezoneList(current: string): string[] {
  try {
    // @ts-expect-error supportedValuesOf is widely available in modern engines
    const all: string[] = Intl.supportedValuesOf('timeZone');
    return all.includes(current) ? all : [current, ...all];
  } catch {
    return Array.from(new Set([current, 'UTC', 'Asia/Kolkata', 'America/New_York', 'Europe/London']));
  }
}

function Section({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="panel p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {desc && <p className="mt-0.5 text-xs text-ink-2">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

export function Account() {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const { signOut, user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');

  const tzs = useMemo(() => timezoneList(profile?.timezone ?? 'UTC'), [profile?.timezone]);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          display_name: profile.display_name ?? '',
          username: profile.username ?? '',
          timezone: profile.timezone,
          default_window_start: profile.default_window_start,
          default_window_minutes: profile.default_window_minutes,
        }
      : undefined,
  });

  const onSubmit = async (values: ProfileValues) => {
    try {
      await update.mutateAsync({
        display_name: values.display_name || null,
        username: values.username || null,
        timezone: values.timezone,
        default_window_start: values.default_window_start,
        default_window_minutes: Number(values.default_window_minutes),
      });
      success('Saved.');
    } catch (e) {
      error((e as Error).message || 'Could not save.');
    }
  };

  const deleteAccount = async () => {
    if (confirmDelete !== 'DELETE') return;
    try {
      setDeleting(true);
      const { error: rpcErr } = await supabase.rpc('delete_current_user');
      if (rpcErr) throw rpcErr;
      await signOut().catch(() => undefined);
      navigate('/login', { replace: true });
    } catch (e) {
      error((e as Error).message || 'Could not delete account.');
      setDeleting(false);
    }
  };

  return (
    <PageShell title="Account" subtitle={user?.email ?? undefined}>
      {isLoading || !profile ? (
        <Spinner label="Loading account…" />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Section title="Profile">
            <div className="space-y-4">
              <Field label="Display name" error={errors.display_name?.message}>
                <Input {...register('display_name')} placeholder="Your name" />
              </Field>
              <Field label="Username" error={errors.username?.message} hint="3–24 letters, numbers or _">
                <Input {...register('username')} placeholder="username" />
              </Field>
            </div>
          </Section>

          <Section title="Day preferences" desc="Used for streaks and your default day window. You can still change the start time on any individual day.">
            <div className="space-y-4">
              <Field label="Timezone" error={errors.timezone?.message}>
                <Select {...register('timezone')}>
                  {tzs.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Default start" error={errors.default_window_start?.message}>
                  <Input type="time" {...register('default_window_start')} />
                </Field>
                <Field label="Window length" error={errors.default_window_minutes?.message}>
                  <Select {...register('default_window_minutes', { valueAsNumber: true })}>
                    {[480, 600, 720, 960, 1080, 1200, 1440, 1500].map((m) => (
                      <option key={m} value={m}>{m / 60}h</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>
          </Section>

          <div className="flex justify-end">
            <Button type="submit" loading={update.isPending} disabled={!isDirty}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </div>

          <Section title="Session">
            <Button type="button" variant="outline" onClick={() => signOut().then(() => navigate('/login'))}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </Section>

          <section className="rounded-xl2 border border-red-200 bg-red-50/50 p-5">
            <div className="mb-1 flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Danger zone</h2>
            </div>
            <p className="text-xs text-ink-2">
              Deleting your account permanently removes your profile and every day and entry. This cannot be undone.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="sm:max-w-xs"
              />
              <Button
                type="button"
                variant="danger"
                disabled={confirmDelete !== 'DELETE'}
                loading={deleting}
                onClick={deleteAccount}
              >
                Delete my account
              </Button>
            </div>
          </section>
        </form>
      )}
    </PageShell>
  );
}
