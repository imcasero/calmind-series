'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import pokeballImg from '@/assets/pokeball.png';
import LinkButton from '@/components/shared/ui/Button/LinkButton';
import { EXTERNAL_ROUTES } from '@/lib/constants/routes';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const titleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const pokeballVariants = {
  hidden: { opacity: 0, rotate: -180, scale: 0 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      delay: 0.3,
    },
  },
};

export const Hero = () => {
  return (
    <section id="home" className="relative w-full overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-5xl px-1 xs:px-2 sm:px-4 pt-8 pb-8 xs:pt-10 xs:pb-10 sm:pt-16 sm:pb-12 md:pt-24 md:pb-16 text-center relative z-10"
      >
        {/* Main Title with embedded Pokeballs */}
        <motion.div variants={titleVariants} className="relative inline-block">
          {/* Embedded Pokeballs - solid, part of the title */}
          <motion.div
            variants={pokeballVariants}
            className="absolute -left-12 sm:-left-14 top-1 hidden sm:block"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            >
              <Image
                src={pokeballImg}
                alt=""
                width={44}
                height={44}
                className="-rotate-20 drop-shadow-lg"
              />
            </motion.div>
          </motion.div>
          <motion.div
            variants={pokeballVariants}
            className="absolute -right-10 sm:-right-12 top-12 hidden sm:block"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            >
              <Image
                src={pokeballImg}
                alt=""
                width={36}
                height={36}
                className="rotate-15 drop-shadow-lg"
              />
            </motion.div>
          </motion.div>
          <h1 className="pokemon-title text-retro-gold-400 drop-shadow-md font-black tracking-wide text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            POKEMON
          </h1>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="pokemon-title text-retro-cyan-300 drop-shadow font-extrabold text-base xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl mt-1"
          >
            CALMIND SERIES
          </motion.h2>
        </motion.div>

        {/* Tagline Badge */}
        <motion.div
          variants={itemVariants}
          className="mt-4 xs:mt-6 sm:mt-8 flex justify-center px-1"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="retro-border bg-jacksons-purple-800/90 border-2 sm:border-3 border-retro-cyan-500 px-2 xs:px-3 sm:px-6 py-1.5 xs:py-2 sm:py-3"
          >
            <span className="text-retro-gold-300 font-bold uppercase tracking-wider sm:tracking-widest text-[10px] xs:text-xs sm:text-sm">
              Competición Amateur de Pokemon VGC
            </span>
          </motion.div>
        </motion.div>

        {/* Feature Pills - Unified styling */}
        <motion.div
          variants={itemVariants}
          className="mt-4 xs:mt-5 sm:mt-6 flex flex-wrap justify-center gap-1.5 xs:gap-2 sm:gap-3"
        >
          {[
            { text: 'Combates Bo3', color: 'cyan' },
            { text: 'Sistema de Ligas', color: 'gold' },
            { text: 'Ascensos y Descensos', color: 'cyan' },
          ].map((pill, index) => (
            <motion.span
              key={pill.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className={`retro-border bg-jacksons-purple-700 border-2 ${
                pill.color === 'cyan'
                  ? 'border-retro-cyan-500 text-retro-cyan-300'
                  : 'border-retro-gold-500 text-retro-gold-300'
              } px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-bold uppercase tracking-wide cursor-default`}
            >
              {pill.text}
            </motion.span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-6 xs:mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-2 xs:gap-3 sm:gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <LinkButton
              text="Inscribirme"
              href={EXTERNAL_ROUTES.INSCRIPTION_FORM}
              variant="yellow"
              newTab={true}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <LinkButton
              text="Ver Normativa"
              href={EXTERNAL_ROUTES.NORMATIVA_PDF}
              variant="primary"
              newTab={true}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};
