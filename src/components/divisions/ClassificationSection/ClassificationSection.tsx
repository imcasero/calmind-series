import ClassificationTable from '@/components/divisions/ClassificationTable/ClassificationTable';
import type { DivisionPreview } from '@/lib/types/queries.types';

interface ClassificationSectionProps {
  rankings: DivisionPreview;
}

export default function ClassificationSection({
  rankings,
}: ClassificationSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xs:gap-8">
      <section>
        <h2 className="text-retro-gold-400 font-bold text-sm xs:text-base uppercase tracking-wide mb-3 xs:mb-4 text-center">
          Primera División
        </h2>
        <ClassificationTable rankings={rankings.primera} showPromotionZones />
      </section>

      <section>
        <h2 className="text-retro-cyan-300 font-bold text-sm xs:text-base uppercase tracking-wide mb-3 xs:mb-4 text-center">
          Segunda División
        </h2>
        <ClassificationTable rankings={rankings.segunda} showPromotionZones />
      </section>
    </div>
  );
}
