import React, { useEffect } from 'react';

interface ImageLightboxModalProps {
  imageUrl: string | null;
  volunteerName?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  imageUrl,
  volunteerName,
  onClose
}) => {
  useEffect(() => {
    if (!imageUrl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div 
      className="lightbox-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={volunteerName ? `${volunteerName}'s Profile Picture` : 'Profile Picture'}
    >
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="lightbox-close-btn"
          onClick={onClose}
          aria-label="Close image preview"
          title="Close (Esc)"
        >
          ✕
        </button>
        <img
          src={imageUrl}
          alt={volunteerName ? `${volunteerName}'s photo` : 'Volunteer profile'}
          className="lightbox-image"
        />
        {volunteerName && (
          <div className="lightbox-caption">
            {volunteerName}
          </div>
        )}
      </div>
    </div>
  );
};
