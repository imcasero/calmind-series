import ClassificationTable from '@/components/divisions/ClassificationTable/ClassificationTable';
import type { DivisionPreview } from '@/lib/types/queries.types';

interface ClassificationSectionProps {
  rankings: DivisionPreview;
}

export default function ClassificationSection({
  rankings,
}: ClassificationSectionProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xs:gap-10 lg:gap-12">
      {/* Primera División */}
      <section>
        <div className="flex items-center gap-4 mb-6 xs:mb-8">
          {/* Pokéball Icon Left */}
          <div className="w-5 h-5 rounded-full border-2 border-retro-gold-500 bg-gradient-to-b from-white to-gray-300 relative overflow-hidden shadow-lg">
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-retro-gold-500" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-jacksons-purple-900 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-white border border-jacksons-purple-900 -translate-x-1/2 -translate-y-1/2" />
          </div>

          <h2 className="text-retro-gold-400 font-pokemon font-black text-lg xs:text-xl sm:text-2xl uppercase tracking-[0.2em] drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
            Primera División
          </h2>

          {/* Pokéball Icon Right */}
          <div className="w-5 h-5 rounded-full border-2 border-retro-gold-500 bg-gradient-to-b from-white to-gray-300 relative overflow-hidden shadow-lg">
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-retro-gold-500" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-jacksons-purple-900 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-white border border-jacksons-purple-900 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <ClassificationTable rankings={rankings.primera} tierColor="gold" />
      </section>

      {/* Segunda División */}
      <section>
        <div className="flex items-center gap-4 mb-6 xs:mb-8">
          {/* Pokéball Icon Left */}
          <div className="w-5 h-5 rounded-full border-2 border-retro-cyan-500 bg-gradient-to-b from-white to-gray-300 relative overflow-hidden shadow-lg">
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-jacksons-purple-500" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-jacksons-purple-900 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-white border border-jacksons-purple-900 -translate-x-1/2 -translate-y-1/2" />
          </div>

          <h2 className="text-retro-cyan-300 font-pokemon font-black text-lg xs:text-xl sm:text-2xl uppercase tracking-[0.2em] drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
            Segunda División
          </h2>

          {/* Pokéball Icon Right */}
          <div className="w-5 h-5 rounded-full border-2 border-retro-cyan-500 bg-gradient-to-b from-white to-gray-300 relative overflow-hidden shadow-lg">
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-jacksons-purple-500" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-jacksons-purple-900 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-white border border-jacksons-purple-900 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <ClassificationTable rankings={rankings.segunda} tierColor="cyan" />
      </section>
    </div>
  );
}
