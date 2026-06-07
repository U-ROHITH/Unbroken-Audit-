import { Link, useSearchParams } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';

export function VerifyEmail() {
  const [params] = useSearchParams();
  const email = params.get('email');

  return (
    <AuthShell
      title="Verify your email"
      footer={
        <Link to="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent/12 text-accent">
          <MailCheck className="h-7 w-7" />
        </div>
        <p className="text-sm text-ink-2">
          We sent a confirmation link{email ? ' to ' : ''}
          {email && <span className="font-medium text-ink">{email}</span>}. Click it to
          activate your account, then sign in.
        </p>
        <p className="mt-4 text-xs text-ink-3">
          Email verification is required before your first save.
        </p>
      </div>
    </AuthShell>
  );
}
