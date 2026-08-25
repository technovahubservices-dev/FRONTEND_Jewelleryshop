import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { contentAPI } from '../services/api';

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await contentAPI.getActive('promoBanners', { position: 'top' });
        if (response.data.success && response.data.count > 0) {
          setAnnouncement(response.data.data[0]);
        }
      } catch (err) {
        // Silent fallback to default
      }
    };
    fetchAnnouncement();
  }, []);

  const title = announcement?.title || 'Explore our new Heritage Collection.';
  const ctaText = announcement?.ctaText || '';
  const ctaLink = announcement?.ctaLink || '/shop';

  return (
    <div className="bg-deep-emerald text-surface-white text-center py-2.5 px-4 font-body-md text-xs md:text-sm tracking-wide">
      <span className="hidden md:inline">Complimentary shipping on orders above ₹5,000 ·</span>
      <span className="md:ml-2">{title}</span>
      {ctaText && (
        <>
          <span> · </span>
          <Link className="underline" to={ctaLink}>{ctaText}</Link>
        </>
      )}
    </div>
  );
}
