import React from 'react';
import { Link } from 'react-router-dom';
const logoUrl = new URL('../../../Athar Logo.jpeg', import.meta.url).href;

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-section-gap bg-white border-t border-[#D4AF37]/20 text-[#4A0E17]">
      <div className="mx-auto flex items-center justify-center px-margin-desktop">
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/0 px-6 py-8 shadow-sm">
          <div className="flex h-[220px] w-[220px] items-center justify-center overflow-hidden rounded-full bg-white shadow-lg">
            <img src={logoUrl} alt="ATHAR logo" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col items-center gap-3 md:flex-row">
            <button className="bg-[#4A0E17] text-white px-8 py-3 rounded-full font-label-md uppercase tracking-widest hover:bg-[#3d0b15] transition-colors duration-300 flex items-center gap-2">
              <span className="material-symbols-outlined">call</span>اتصل بنا
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
