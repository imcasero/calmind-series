import { Navbar } from '@/components/shared';

export default function Loading() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-8 py-10 xs:py-16">
        <div className="text-center mb-16 xs:mb-24">
          <div className="h-8 w-48 bg-white/5 rounded mx-auto mb-8 animate-pulse" />
          <div className="h-16 w-96 bg-white/10 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-64 bg-white/5 rounded mx-auto animate-pulse" />
        </div>

        <div className="space-y-12">
          <div className="h-96 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-96 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </div>
    </>
  );
}
