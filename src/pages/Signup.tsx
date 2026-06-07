import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthShell, GoogleButton } from '@/components/auth/AuthShell';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { credentialsSchema, type Credentials } from '@/lib/validation';

export function Signup() {
  const { signUp, signInWithGoogle } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({ resolver: zodResolver(credentialsSchema) });

  const onSubmit = async (values: Credentials) => {
    try {
      await signUp(values.email, values.password);
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`, { replace: true });
    } catch (e) {
      error((e as Error).message || 'Could not create account.');
    }
  };

  return (
    <AuthShell
      title="Start your audit"
      subtitle="Track every day. Build an unbroken streak."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
        </Field>
        <Field
          label="Password"
          error={errors.password?.message}
          hint="At least 8 characters."
        >
          <Input type="password" autoComplete="new-password" placeholder="••••••••" {...register('password')} />
        </Field>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-paper/30">
        <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleButton onClick={() => signInWithGoogle().catch((e) => error((e as Error).message))} />

      <p className="mt-5 text-center text-[11px] leading-relaxed text-paper/35">
        By continuing you agree to our Terms and acknowledge our Privacy Policy.
      </p>
    </AuthShell>
  );
}
