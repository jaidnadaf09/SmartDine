import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import '@styles/components/ImageCropModal.css';

interface ImageCropModalProps {
  image: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: string) => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  image,
  isOpen,
  onClose,
  onCropComplete
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!image || !croppedAreaPixels) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = image;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const MAX_SIZE = 512;
      const scale = Math.min(
        MAX_SIZE / croppedAreaPixels.width,
        MAX_SIZE / croppedAreaPixels.height,
        1
      );

      canvas.width = croppedAreaPixels.width * scale;
      canvas.height = croppedAreaPixels.height * scale;

      if (ctx) {
        ctx.drawImage(
          img,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      onCropComplete(base64Image);
      onClose();
    } catch (e) {
      console.error('Failed to crop image:', e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && image && (
        <>
          <motion.div
            className="image-crop-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="image-crop-modal-wrapper" onClick={onClose}>
            <motion.div
              className="image-crop-modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cropper-container">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={onCropChange}
                  onZoomChange={onZoomChange}
                  onCropComplete={onCropCompleteInternal}
                />
              </div>

              <div className="zoom-slider-container">
                <span className="zoom-label">Adjust Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => onZoomChange(Number(e.target.value))}
                  className="zoom-slider"
                />
              </div>

              <div className="image-crop-actions">
                <button 
                  type="button" 
                  className="image-crop-btn secondary" 
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="image-crop-btn primary" 
                  onClick={handleCrop}
                >
                  Done & Use Photo
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ImageCropModal;
