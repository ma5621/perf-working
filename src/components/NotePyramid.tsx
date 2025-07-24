import React, { useEffect, useRef } from 'react';

interface Accord {
  name: string;
  color: string;
  textColor?: string;
  width?: string; // e.g., '100%'
}

interface NotePyramidProps {
  accords: Accord[];
  t?: (key: string) => string;
  language?: string;
}

function getContrastColor(bg: string, fallback: string = '#222') {
  if (!bg) return fallback;
  const hex = bg.startsWith('#') ? bg.slice(1) : bg;
  if (hex.length === 3) return fallback;
  const r = parseInt(hex.substring(0,2), 16);
  const g = parseInt(hex.substring(2,4), 16);
  const b = parseInt(hex.substring(4,6), 16);
  const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
  return luminance > 0.6 ? '#222' : '#fff';
}

const NotePyramid: React.FC<NotePyramidProps> = ({ accords, t, language }) => {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    barRefs.current.forEach((bar, idx) => {
      if (bar) {
        bar.style.width = '0%';
        bar.style.opacity = '0';
        setTimeout(() => {
          bar.style.transition = 'width 1s cubic-bezier(0.4,0,0.2,1), opacity 0.8s';
          bar.style.width = accords[idx].width || '100%';
          bar.style.opacity = '1';
        }, 120 + idx * 90); // slightly faster delay per note
      }
    });
    hasAnimated.current = true;
  }, [accords]);

  return (
    <div
      className="bg-white/95 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl p-3 mt-0 mb-2 w-full max-w-xs mx-auto"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <h3 className="text-center font-extrabold mb-2 md:mb-3 text-xs md:text-base tracking-wide text-indigo-700 dark:text-indigo-300 drop-shadow">
        {t ? t('product.mainAccords') : 'Main Accords'}
      </h3>
      <div className="space-y-1.5 md:space-y-2">
        {accords.map((accord, idx) => {
          let mainColor = accord.color.match(/#([0-9a-fA-F]{6})/);
          let textColor = accord.textColor || (mainColor ? getContrastColor(mainColor[1]) : '#fff');
          const accordLabel = t ? t(`accords.${accord.name}`) : accord.name;
          return (
            <div
              key={accord.name + idx}
              ref={el => { barRefs.current[idx] = el; }}
              aria-label={accordLabel}
              role="button"
              tabIndex={0}
              className={`flex items-center overflow-visible rounded-full shadow group transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${language === 'ar' ? 'justify-end text-right flex-row-reverse' : ''}`}
              style={{
                background: language === 'ar'
                  ? `linear-gradient(270deg, ${accord.color} 80%, transparent 100%)`
                  : `linear-gradient(90deg, ${accord.color} 80%, transparent 100%)`,
                color: textColor,
                minHeight: 18,
                fontWeight: 600,
                fontSize: '0.75rem',
                width: '0%', // animated
                opacity: 0,
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                padding: '0 8px 0 6px',
                transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.7s',
                cursor: 'pointer',
                marginLeft: 0,
                marginRight: 0,
                outline: 'none',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1.08) drop-shadow(0 2px 8px #0002)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px) scale(1.01)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.filter = '';
                (e.currentTarget as HTMLDivElement).style.transform = '';
              }}
            >
              <span className="font-serif tracking-wide whitespace-nowrap" style={{textShadow: '0 1px 2px #0001'}}>{accordLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotePyramid; 