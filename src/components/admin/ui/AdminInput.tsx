import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  if (!children) {
    return null;
  }
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block font-pixel text-[9px] uppercase tracking-wider text-px-ink-dim"
    >
      {children}
    </label>
  );
}

interface AdminInputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string;
}

export function AdminInput({ label, id, className, ...rest }: AdminInputProps) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input id={id} className={cn('pixel-input', className)} {...rest} />
    </div>
  );
}

interface AdminSelectProps extends ComponentPropsWithoutRef<'select'> {
  label?: string;
}

export function AdminSelect({
  label,
  id,
  className,
  children,
  ...rest
}: AdminSelectProps) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select id={id} className={cn('pixel-input', className)} {...rest}>
        {children}
      </select>
    </div>
  );
}

interface AdminTextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  label?: string;
}

export function AdminTextarea({
  label,
  id,
  className,
  ...rest
}: AdminTextareaProps) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <textarea id={id} className={cn('pixel-input', className)} {...rest} />
    </div>
  );
}
