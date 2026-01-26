'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

// Tab.Panel component
interface TabPanelProps {
  title: string;
  children: ReactNode;
}

export function TabPanel({ children }: TabPanelProps) {
  return <>{children}</>;
}

// Main Tabs component
interface TabsProps {
  children: ReactNode;
  defaultIndex?: number;
}

const pixel3dEffect = {
  base: 'shadow-[4px_4px_0px_0px_#1a1a1a,inset_2px_2px_0px_rgba(255,255,255,0.3),inset_-2px_-2px_0px_rgba(0,0,0,0.2)]',
  hover:
    'hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1a1a1a,inset_2px_2px_0px_rgba(255,255,255,0.3),inset_-2px_-2px_0px_rgba(0,0,0,0.2)]',
  active:
    'active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#1a1a1a,inset_2px_2px_0px_rgba(0,0,0,0.2),inset_-2px_-2px_0px_rgba(255,255,255,0.1)]',
  selected:
    'translate-x-1 translate-y-1 shadow-[0px_0px_0px_0px_#1a1a1a,inset_2px_2px_0px_rgba(0,0,0,0.2),inset_-2px_-2px_0px_rgba(255,255,255,0.1)]',
};

export default function Tabs({ children, defaultIndex = 0 }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [direction, setDirection] = useState(0);

  // Extract TabPanel children
  const panels = Children.toArray(children).filter(
    (child): child is ReactElement<TabPanelProps> =>
      isValidElement(child) && child.type === TabPanel,
  );

  const handleTabClick = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  return (
    <div className="w-full">
      {/* Tab buttons */}
      <div className="flex flex-wrap justify-center gap-3 xs:gap-4 mb-10 xs:mb-12">
        {panels.map((panel, index) => {
          const isActive = activeIndex === index;
          return (
            <motion.button
              key={panel.props.title}
              type="button"
              onClick={() => handleTabClick(index)}
              whileHover={!isActive ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'px-5 xs:px-6 sm:px-8 py-3 xs:py-4 font-pokemon font-black uppercase text-xs xs:text-sm sm:text-base tracking-[0.15em]',
                'border-3 xs:border-4 border-[#1a1a1a] cursor-pointer',
                'transition-all duration-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
                isActive
                  ? [
                      'bg-retro-gold-500 text-jacksons-purple-950',
                      pixel3dEffect.selected,
                    ]
                  : [
                      'bg-jacksons-purple-600 text-white',
                      pixel3dEffect.base,
                      pixel3dEffect.hover,
                      pixel3dEffect.active,
                    ],
              )}
            >
              {panel.props.title}
            </motion.button>
          );
        })}
      </div>

      {/* Active panel content with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="w-full"
        >
          {panels[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
