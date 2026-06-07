import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * Notion-style page: a fixed header bar and a body that scrolls internally,
 * so the app shell itself never scrolls (spec: fixed shell, panels scroll).
 */
export function PageShell({
  title,
  subtitle,
  actions,
  children,
  bodyClassName = '',
  maxWidth = 'max-w-3xl',
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  maxWidth?: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3 sm:px-8 sm:py-4">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
          {subtitle && <p className="truncate text-xs text-ink-2 sm:text-[13px]">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div className={`scroll-area min-h-0 flex-1 ${bodyClassName}`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className={`mx-auto w-full ${maxWidth} px-5 py-5 sm:px-8 sm:py-7`}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
