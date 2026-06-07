import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FullPageSpinner } from '@/components/ui/Spinner';

/**
 * Landing route for email-confirmation / magic-link / OAuth redirects.
 * The Supabase client parses the session from the URL (detectSessionInUrl),
 * then we forward the user into the app once a session exists.
 */
export function AuthCallback() {
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    navigate(user ? '/' : '/login', { replace: true });
  }, [loading, user, navigate]);

  return <FullPageSpinner />;
}
