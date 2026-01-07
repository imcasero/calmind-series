import Image from 'next/image';
import Link from 'next/link';
import LinkButton from './LinkButton';
import CalmindLogo from '@/public/CalmindSeriesLogo.png';

export default function Navbar() {
  return (
    <nav className="flex flex-col md:flex-row items-center justify-between md:justify-around gap-4 p-6 md:p-8 max-w-7xl mx-auto bg-transparent w-full">
      <Link
        href="/"
        className="flex items-center justify-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <Image
          src={CalmindLogo}
          alt="Calmind Series Logo"
          className="h-22 w-22"
          width={88}
          height={88}
        />
        <h1 className="pokemon-title text-3xl font-bold text-yellow-500">
          Pokemon<br />
          Calmind<br />
          <span className="text-xl font-semibold text-retro-cyan-300">Series</span>
        </h1>
      </Link>

      <div className="flex items-center justify-center md:justify-end gap-2 flex-wrap">
        <LinkButton
          text="Primera"
          href="/primera-division"
          variant="primary"
          newTab={false}
        />
        <LinkButton
          text="Segunda"
          href="/segunda-division"
          variant="primary"
          newTab={false}
        />
        {/* Discord server invitation link */}
        <LinkButton
          text="Unete!"
          href="https://forms.gle/Ai7mZvu38nj85NiZ8"
          variant="yellow"
          newTab={true}
        />
      </div>
    </nav>
  );
}
