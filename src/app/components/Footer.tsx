import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-section-gap bg-surface-container-lowest border-t border-outline-variant/30">
      <div className="flex flex-col items-center justify-center gap-element-gap px-margin-desktop max-w-container-max mx-auto text-center">
        <div className="font-headline-md text-headline-md text-primary tracking-tight mb-4">أثر | ATHAR</div>
        <div className="flex flex-col items-center gap-8 mb-8">
          <div className="flex gap-6">
            <a
              className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant hover:bg-brand-burgundy hover:border-brand-burgundy hover:text-white transition-all duration-300"
              href="#"
              aria-label="Brand Awareness"
            >
              <span className="material-symbols-outlined text-sm !scale-x-100">brand_awareness</span>
            </a>
            <a
              className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant hover:bg-brand-burgundy hover:border-brand-burgundy hover:text-white transition-all duration-300"
              href="#"
              aria-label="Facebook"
            >
              <span className="material-symbols-outlined text-sm !scale-x-100">facebook</span>
            </a>
          </div>
          <button className="bg-brand-burgundy text-white px-8 py-3 rounded-full font-label-md uppercase tracking-widest hover:bg-brand-gold transition-colors duration-300 flex items-center gap-2">
            <span className="material-symbols-outlined">call</span>اتصل بنا
          </button>
        </div>
      </div>
    </footer>
  );
};
