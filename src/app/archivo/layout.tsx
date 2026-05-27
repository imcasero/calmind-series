import type { ReactNode } from 'react';
import { PixelShell } from '@/components/shared/layout/hub/PixelShell';

export default function ArchivoLayout({ children }: { children: ReactNode }) {
  return <PixelShell>{children}</PixelShell>;
}
