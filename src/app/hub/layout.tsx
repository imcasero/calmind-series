import type { ReactNode } from 'react';
import { PixelShell } from '@/components/shared/layout/hub/PixelShell';

export default function HubLayout({ children }: { children: ReactNode }) {
  return <PixelShell>{children}</PixelShell>;
}
