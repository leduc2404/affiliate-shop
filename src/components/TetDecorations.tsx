'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// --- ASSETS (SVG COMPONENTS) ---

// 1. Đèn lồng SVG (Vẽ chi tiết, mềm mại)
const LanternSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dây treo */}
    <path d="M100 0V40" stroke="#B45309" strokeWidth="4" />
    
    {/* Nắp trên */}
    <rect x="70" y="40" width="60" height="15" rx="4" fill="#520505" />
    <rect x="70" y="40" width="60" height="15" rx="4" fill="url(#gold-gradient)" fillOpacity="0.8" />

    {/* Thân đèn (Bầu dục mềm mại) */}
    <ellipse cx="100" cy="130" rx="80" ry="75" fill="url(#red-glow)" />
    
    {/* Nan đèn (Trang trí) */}
    <path d="M100 55C100 55 140 90 140 130C140 170 100 205 100 205" stroke="#4a0404" strokeWidth="1" strokeOpacity="0.3" />
    <path d="M100 55C100 55 60 90 60 130C60 170 100 205 100 205" stroke="#4a0404" strokeWidth="1" strokeOpacity="0.3" />
    
    {/* Khung viền vàng quanh thân */}
    <path d="M100 55 C 160 55, 180 90, 180 130 C 180 170, 160 205, 100 205 C 40 205, 20 170, 20 130 C 20 90, 40 55, 100 55 Z" 
          stroke="url(#gold-gradient)" strokeWidth="2" fill="none" opacity="0.5"/>

    {/* Chữ Phúc (Phúc lộc) */}
    <circle cx="100" cy="130" r="35" fill="#520505" fillOpacity="0.9" stroke="#FBBF24" strokeWidth="2" />
    <text x="100" y="142" textAnchor="middle" fill="#FBBF24" fontSize="38" fontWeight="bold" style={{ fontFamily: 'CauDoi, serif' }}>福</text>

    {/* Đế dưới */}
    <rect x="75" y="205" width="50" height="12" rx="3" fill="#520505" />
    <rect x="75" y="205" width="50" height="12" rx="3" fill="url(#gold-gradient)" fillOpacity="0.8" />

    {/* Tua rua (Vẽ bằng SVG cho mượt) */}
    <g transform="translate(100, 217)">
      <path d="M0 0 V15" stroke="#B45309" strokeWidth="3" />
      {/* Nút thắt */}
      <circle cx="0" cy="20" r="6" fill="#DC2626" />
      {/* Các sợi tua */}
      <path d="M-4 25 Q -8 50 -6 80" stroke="#DC2626" strokeWidth="2" />
      <path d="M-2 25 Q -3 55 -2 85" stroke="#DC2626" strokeWidth="2" />
      <path d="M0 25 V 90" stroke="#DC2626" strokeWidth="2" />
      <path d="M2 25 Q 3 55 2 85" stroke="#DC2626" strokeWidth="2" />
      <path d="M4 25 Q 8 50 6 80" stroke="#DC2626" strokeWidth="2" />
    </g>

    {/* Gradients Definitions */}
    <defs>
      <radialGradient id="red-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 130) rotate(90) scale(75 80)">
        <stop stopColor="#EF4444" />
        <stop offset="0.8" stopColor="#991B1B" />
        <stop offset="1" stopColor="#7F1D1D" />
      </radialGradient>
      <linearGradient id="gold-gradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#B45309" />
        <stop offset="0.5" stopColor="#FCD34D" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
    </defs>
  </svg>
);

// 2. Hoa Mai/Đào SVG
const FlowerSVG = ({ color = "#FECDD3", className }: { color?: string, className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 50 L50 20 C50 20 60 35 75 35 C75 35 65 45 78 55 C78 55 60 60 50 80 C50 80 40 60 22 55 C22 55 35 45 25 35 C25 35 40 35 50 20 Z" 
      fill={color} stroke="none" />
    <circle cx="50" cy="50" r="6" fill="#FCD34D" />
  </svg>
);

// --- MAIN COMPONENTS ---

const Lantern = ({ delay = 0, scale = 1, xOffset = 0 }: { delay?: number; scale?: number, xOffset?: number }) => (
  <motion.div
    initial={{ rotate: -5 }}
    animate={{ rotate: 5 }}
    transition={{
      duration: 4 + Math.random(),
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay: delay
    }}
    className="fixed top-0 z-50 pointer-events-none drop-shadow-2xl"
    style={{ 
        left: xOffset > 0 ? `${xOffset}px` : undefined,
        right: xOffset < 0 ? `${Math.abs(xOffset)}px` : undefined,
        transformOrigin: 'top center',
        width: `${120 * scale}px` 
    }}
  >
    <LanternSVG className="w-full h-auto drop-shadow-lg" />
  </motion.div>
);

const Blossom = ({ index }: { index: number }) => {
  const [randoms] = useState(() => ({
    x: Math.random() * 100, // vw
    delay: Math.random() * 10,
    duration: 15 + Math.random() * 10,
    size: 15 + Math.random() * 20,
    type: Math.random() > 0.6 ? '#fbcfe8' : '#fda4af' // Pink-200 or Pink-300
  }));

  return (
    <motion.div
      initial={{ y: -50, x: `${randoms.x}vw`, opacity: 0, rotate: 0 }}
      animate={{ 
        y: '105vh', 
        opacity: [0, 0.8, 0.8, 0], 
        rotate: 720,
        x: [`${randoms.x}vw`, `${randoms.x + (index % 2 === 0 ? 5 : -5)}vw`] 
      }}
      transition={{ 
        duration: randoms.duration, 
        repeat: Infinity, 
        delay: randoms.delay, 
        ease: "linear" 
      }}
      className="fixed z-0 pointer-events-none"
      style={{ width: randoms.size, height: randoms.size }}
    >
      <FlowerSVG color={randoms.type} className="w-full h-full opacity-80" />
    </motion.div>
  );
};

const CoupletBanner = ({ side, text }: { side: 'left' | 'right'; text: string[] }) => {
    return (
        <div className={`fixed top-[12%] ${side === 'left' ? 'left-4' : 'right-4'} hidden 2xl:flex flex-col items-center z-40 pointer-events-none`}>
            {/* Dây treo */}
            <div className="w-[2px] h-8 bg-gradient-to-b from-yellow-600 to-yellow-700"></div>
            
            {/* Thanh treo trên - wider than body */}
            <div className="w-24 h-4 bg-gradient-to-b from-yellow-600 to-yellow-700 rounded-full shadow-lg z-10 border border-yellow-500 relative flex items-center justify-center">
                {/* Đinh tán vàng */}
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-300 shadow-sm"></div>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-300 shadow-sm"></div>
                {/* Center ornament */}
                <div className="w-3 h-3 bg-yellow-400 rotate-45 shadow-inner"></div>
            </div>

            {/* Thân câu đối */}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative -mt-2 rounded-b-xl overflow-visible"
                style={{
                    background: 'linear-gradient(180deg, #991b1b 0%, #b91c1c 50%, #7f1d1d 100%)',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.1)',
                    border: '3px solid #b45309',
                    borderTop: 'none',
                    padding: '20px 16px 24px 16px',
                    minWidth: '80px',
                }}
            >
                {/* Inner frame decoration */}
                <div className="absolute inset-2 border border-yellow-500/20 rounded-lg pointer-events-none"></div>
                
                {/* Corner ornaments */}
                <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-yellow-500/40 rounded-tl"></div>
                <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-yellow-500/40 rounded-tr"></div>
                <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-yellow-500/40 rounded-bl"></div>
                <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-yellow-500/40 rounded-br"></div>
                
                {/* Pattern nền chìm */}
                <div className="absolute inset-0 opacity-[0.07] bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
                
                {/* Nội dung chữ */}
                <div className="flex flex-col gap-4 relative z-10 items-center">
                    {text.map((char, i) => (
                        <div key={i} className="w-12 h-12 flex items-center justify-center">
                            <span 
                                className="text-4xl font-bold leading-none text-center"
                                style={{
                                    fontFamily: 'CauDoi, "Times New Roman", serif',
                                    background: 'linear-gradient(180deg, #FFD700 0%, #FBBF24 40%, #FEF3C7 60%, #F59E0B 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.8))',
                                    letterSpacing: '0.02em'
                                }}
                            >
                                {char}
                            </span>
                        </div>
                    ))}
                </div>
                
                {/* Bottom ornament line */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
            </motion.div>
            
            {/* Phần tua rua - separated from main body */}
            <div className="flex flex-col items-center mt-1">
                {/* Ngọc bội */}
                <div className="w-8 h-8 rounded-full border-2 border-yellow-500 bg-gradient-to-b from-red-700 to-red-900 flex items-center justify-center shadow-xl z-10">
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-yellow-300 to-yellow-500 rotate-45 shadow-inner"></div>
                </div>
                
                {/* Tua rua rủ xuống */}
                <motion.div 
                    animate={{ skewX: [-3, 3, -3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="-mt-3 pt-3 flex flex-col items-center"
                >
                    <div className="w-4 h-20 bg-gradient-to-b from-red-600 via-red-700 to-red-900 rounded-b-full shadow-lg relative overflow-hidden">
                        {/* Texture lines on tassel */}
                        <div className="absolute inset-0 flex justify-around opacity-30">
                            <div className="w-[1px] h-full bg-red-950"></div>
                            <div className="w-[1px] h-full bg-red-950"></div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default function TetDecorations() {
  const [mounted, setMounted] = useState(false);
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsWide(window.innerWidth >= 1400);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none">
      <style jsx global>{`
        @font-face {
          font-family: 'CauDoi';
          src: url('/fonts/FontCauDoi.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `}</style>

      {/* Hoa rơi (Background layer) */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {[...Array(15)].map((_, i) => (
          <Blossom key={i} index={i} />
        ))}
      </div>

      {/* Trang trí chỉ hiện trên màn hình lớn */}
      {isWide && (
        <>
            {/* Cụm đèn lồng trái */}
            <Lantern xOffset={40} scale={1.1} delay={0} />
            <Lantern xOffset={140} scale={0.65} delay={1.5} />

            {/* Cụm đèn lồng phải */}
            <Lantern xOffset={-40} scale={1.1} delay={0.5} />
            <Lantern xOffset={-140} scale={0.65} delay={2} />

            {/* Câu đối */}
            <CoupletBanner side="left" text={['Vạn', 'Sự', 'Như', 'Ý']} />
            <CoupletBanner side="right" text={['An', 'Khang', 'Thịnh', 'Vượng']} />
        </>
      )}
    </div>
  );
}