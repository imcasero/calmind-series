import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';

/**
 * Legacy season overview — retired by the redesign (FR11). Seasons now live in the
 * time-machine archive.
 */
export default function LegacySeasonPage() {
  redirect(ROUTES.archive);
}
