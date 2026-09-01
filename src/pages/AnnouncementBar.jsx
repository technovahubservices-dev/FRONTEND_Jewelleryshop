import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { contentAPI } from '../services/api';

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await contentAPI.getHomepageSettings();
        if (response.data.success) {
          setAnnouncement(response.data.data);
        }
      } catch (err) {
        // Silent fallback to defaults
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const getMarqueeText = () => {
    // 1. Customized repeating texts structured with professional diamond dividers
    const baseText = "Welcome to JKR· 10% offer Rings ! 20 % offer Bangels ! ";
    
    if (loading || !announcement) {
      return baseText;
    }
    
    // Fallback overrides if admin panel configuration settings are present
    const text = announcement.announcementText || '10% offer Earings ! 20 % offer Necklace !';
    const ctaText = announcement.announcementCtaText || '';
    return ctaText ? `${text} · ${ctaText} · ` : `${text} · `;
  };

  const marqueeText = getMarqueeText();
  
  // Create a long continuous string row to ensure seamless looping without blank gaps
  const fullRepeatedRow = `${marqueeText}${marqueeText}${marqueeText}${marqueeText}`;

  return (
    <>
      {/* 2. Inline Keyframe Animations to guarantee infinite right-to-left scrolling tracking loops */}
      <style>{`
        @keyframes customMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: customMarquee 15s linear infinite;
        }
      `}</style>

      {/* 3. Positioning Layout: Sits explicitly above the logo text row */}
      <div className="w-full bg-deep-emerald text-surface-white py-3 overflow-hidden relative flex items-center h-12 z-50 select-none border-b border-white/5">
  <div className="flex whitespace-nowrap min-w-full animate-infinite-scroll">
    <div className="inline-block px-2 font-label-caps text-[10px] md:text-xs tracking-widest uppercase text-[#FDFBF7] font-lg">
      {fullRepeatedRow}
    </div>

    <div className="inline-block px-2 font-label-caps text-[10px] md:text-xs tracking-widest uppercase text-[#FDFBF7] font-lg">
      {fullRepeatedRow}
    </div>
  </div>
</div>
    </>
  );
}
