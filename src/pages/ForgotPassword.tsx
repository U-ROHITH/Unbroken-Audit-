import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell } from '@/components/auth/AuthShell';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { emailOnlySchema } from '@/lib/validation';

type Values = z.infer<typeof emailOnlySchema>;

export function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { success, error } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<Values>({ resolver: zodResolver(emailOnlySchema) });

  const onSubmit = async (values: Values) => {
    try {
      await resetPassword(values.email);
      success('If that email exists, a reset link is on its way.');
    } catch (e) {
      error((e as Error).message || 'Could not send reset email.');
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="We'll email you a link to set a new one."
      footer={
        <Link to="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      }
    >
      {isSubmitSuccessful ? (
        <p className="text-center text-sm text-paper/70">
          Check your inbox for the reset link. You can close this tab.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
          </Field>
          <Button type="submit" loading={isSubmitting} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
