import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthShell, GoogleButton, OrDivider } from '@/components/auth/AuthShell';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { credentialsSchema, emailOnlySchema, type Credentials } from '@/lib/validation';

export function Login() {
  const { signIn, signInWithGoogle, signInWithMagicLink } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();
  const [magicLoading, setMagicLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({ resolver: zodResolver(credentialsSchema) });

  const onSubmit = async (values: Credentials) => {
    try {
      await signIn(values.email, values.password);
      navigate('/', { replace: true });
    } catch (e) {
      error((e as Error).message || 'Could not sign in.');
    }
  };

  const magicLink = async () => {
    const email = getValues('email');
    if (!emailOnlySchema.safeParse({ email }).success) {
      error('Enter your email first, then tap the magic link.');
      return;
    }
    try {
      setMagicLoading(true);
      await signInWithMagicLink(email);
      success('Magic link sent — check your inbox.');
    } catch (e) {
      error((e as Error).message || 'Could not send magic link.');
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Audit your day. Keep the streak unbroken."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <Input type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot" className="text-xs text-ink-3 hover:text-ink">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Sign in
        </Button>
      </form>

      <OrDivider />

      <div className="space-y-3">
        <GoogleButton onClick={() => signInWithGoogle().catch((e) => error((e as Error).message))} />
        <Button variant="outline" className="w-full" loading={magicLoading} onClick={magicLink}>
          Email me a magic link
        </Button>
      </div>
    </AuthShell>
  );
}
