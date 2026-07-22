import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-white">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <img
          alt="Athar Watermark"
          className="w-[64%] h-auto object-contain opacity-100"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPBx3FDnKHyIAGYg1cexhp1PiFI02DmHpX3kdsTszxTop1WWGAdMPDVfBKTOb_aa7xk06N8XvYYefXsI3-dMLc7XbYqa9DttdPrUGxbCoSJ5Y8aDVWya0NgwZViar8liSTX3QZ-9z1W7xgANzRk7NJFrX21QgsPgR1BMddxM4v1calcXDa-almOUotlKv-ajkyorPWN_4KkxW4PgANJ4TY1y4sJ5zqhT6oBkeEDoFXVratG4uD5VYnDyVIKVFWQcr9vVBrkd5SJi8e"
          style={{ width: '80%', maxWidth: '600px', opacity: 1 }}
        />
      </div>

      <div className="relative w-full h-full z-10 flex flex-col justify-center items-center px-margin-desktop gap-12">
        <div className="w-full max-w-container-max flex flex-col md:flex-row-reverse justify-between items-center gap-8 scale-90">
          <div className="text-center md:text-right max-w-xs scale-110">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] leading-tight text-[4.8rem]">أهلاً وسهلاً</h1>
            <h1 className="text-4xl md:text-5xl font-bold text-[#5D0F22] leading-tight text-[4.8rem]">في أثر</h1>
            <span className="block text-sm font-semibold tracking-widest text-[#5D0F22] mt-4 uppercase">أناقة لها غاية</span>
          </div>
          <div className="text-center md:text-left max-w-sm bg-white/50 backdrop-blur-sm p-6 rounded-lg scale-110">
            <p className="text-base md:text-lg text-gray-600 leading-relaxed font-arabic text-[1.35rem]">
              وجهتك الأولى للأناقة المتكاملة. نهتم بأدق التفاصيل لنقدم لك أزياءً رجالية ونسائية تجمع بين الجودة الفائقة والتصاميم التي تليق بك.
            </p>
          </div>
        </div>

        <div className="flex flex-row flex-wrap items-center justify-center gap-4" style={{ marginTop: '280px' }}>
          <Link
            className="px-8 py-3 rounded-full bg-[#5D0F22] text-white font-semibold transition-all duration-300 hover:bg-[#4A0C1B] transform hover:scale-105 active:scale-95 shadow-lg shadow-[#5D0F22]/20 whitespace-nowrap"
            to="/men"
          >
            رجالي
          </Link>
          <Link
            className="px-8 py-3 rounded-full bg-[#5D0F22] text-white font-semibold transition-all duration-300 hover:bg-[#4A0C1B] transform hover:scale-105 active:scale-95 shadow-lg shadow-[#5D0F22]/20 whitespace-nowrap"
            to="/women"
          >
            حريمي
          </Link>
          <Link
            className="px-8 py-3 rounded-full bg-[#5D0F22] text-white font-semibold transition-all duration-300 hover:bg-[#4A0C1B] transform hover:scale-105 active:scale-95 shadow-lg shadow-[#5D0F22]/20 whitespace-nowrap"
            to="/islamic"
          >
            إسلامي
          </Link>
        </div>
      </div>

      <footer className="bg-transparent text-on-tertiary-container py-4 border-t border-outline/10 w-full z-20 absolute bottom-4" dir="rtl">
        <div className="px-margin-desktop max-w-container-max mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <img
              alt="Athar Logo"
              className="h-6 w-auto opacity-80"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPBx3FDnKHyIAGYg1cexhp1PiFI02DmHpX3kdsTszxTop1WWGAdMPDVfBKTOb_aa7xk06N8XvYYefXsI3-dMLc7XbYqa9DttdPrUGxbCoSJ5Y8aDVWya0NgwZViar8liSTX3QZ-9z1W7xgANzRk7NJFrX21QgsPgR1BMddxM4v1calcXDa-almOUotlKv-ajkyorPWN_4KkxW4PgANJ4TY1y4sJ5zqhT6oBkeEDoFXVratG4uD5VYnDyVIKVFWQcr9vVBrkd5SJi8e"
            />
            <span className="opacity-60">© 2024 أثر للتراث والفخامة</span>
          </div>
          <div className="flex gap-6 opacity-60">
            <a className="hover:text-brand-gold transition-all" href="#">
              إنستغرام
            </a>
            <a className="hover:text-brand-gold transition-all" href="#">
              بينتريست
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
};
