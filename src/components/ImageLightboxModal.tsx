import React, { useState, useEffect, useRef } from 'react';
import {
  IconX,
  IconZoomIn,
  IconZoomOut,
  IconRotateCw,
  IconMaximize2,
  IconDownload,
  IconChevronLeft,
  IconChevronRight,
} from './Icons.tsx';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  images?: string[];
  initialIndex?: number;
  title?: string;
  subtitle?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  images,
  initialIndex = 0,
  title = '원본 사진 뷰어',
  subtitle,
}) => {
  // Normalize image list
  const allImages = images && images.length > 0 ? images : imageUrl ? [imageUrl] : [];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null);

  // Sync index and reset transforms when opening or initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, allImages.length - 1)));
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen, initialIndex, allImages.length]);

  // Reset zoom & rotation when active photo index changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [currentIndex]);

  const currentImage = allImages[currentIndex] || imageUrl || null;
  const hasMultiple = allImages.length > 1;

  const handlePrev = () => {
    if (hasMultiple) {
      setCurrentIndex(prev => (prev > 0 ? prev - 1 : allImages.length - 1));
    }
  };

  const handleNext = () => {
    if (hasMultiple) {
      setCurrentIndex(prev => (prev < allImages.length - 1 ? prev + 1 : 0));
    }
  };

  // Keyboard navigation: ESC, Left Arrow, Right Arrow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasMultiple, allImages.length]);

  if (!isOpen || !currentImage) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = currentImage;
    const fileSuffix = hasMultiple ? `_${currentIndex + 1}` : '';
    a.download = `${(title || 'document_image').replace(/\s+/g, '_')}${fileSuffix}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-white z-10 shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <IconMaximize2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight truncate max-w-xs sm:max-w-md">
                {title}
              </h3>
              {hasMultiple && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/30 text-blue-300 border border-blue-400/40">
                  {currentIndex + 1} / {allImages.length}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30"
            title="축소 (Zoom Out)"
          >
            <IconZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-mono font-bold px-2 py-1 bg-slate-800/80 rounded-md text-slate-300 min-w-[3.5rem] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30"
            title="확대 (Zoom In)"
          >
            <IconZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="100% 원본 비율로 리셋"
          >
            1:1
          </button>

          <button
            type="button"
            onClick={handleRotate}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="90도 회전"
          >
            <IconRotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="사진 다운로드"
          >
            <IconDownload className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="닫기 (ESC)"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Image Stage with Left/Right Navigation */}
      <div
        className="relative flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center cursor-grab active:cursor-grabbing"
        onClick={e => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Image Chevron Button */}
        {hasMultiple && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white flex items-center justify-center shadow-xl border border-slate-700/80 hover:border-blue-400 transition-all hover:scale-110 active:scale-95"
            title="이전 사진 (←)"
          >
            <IconChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}

        {/* Center Image Display */}
        <div
          className="transition-transform duration-150 ease-out inline-block max-w-full"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
          onClick={e => e.stopPropagation()}
        >
          <img
            src={currentImage}
            alt={`${title} - ${currentIndex + 1}`}
            className="max-h-[72vh] sm:max-h-[78vh] max-w-[85vw] object-contain rounded-xl shadow-2xl border border-slate-700/50 bg-white"
          />
        </div>

        {/* Next Image Chevron Button */}
        {hasMultiple && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white flex items-center justify-center shadow-xl border border-slate-700/80 hover:border-blue-400 transition-all hover:scale-110 active:scale-95"
            title="다음 사진 (→)"
          >
            <IconChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip & Information */}
      <div
        className="w-full bg-slate-900/90 border-t border-slate-800/90 px-4 py-2.5 z-10 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2"
        onClick={e => e.stopPropagation()}
      >
        {/* Multiple Images Thumbnail Navigation */}
        {hasMultiple ? (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
            <span className="text-[11px] text-slate-400 shrink-0 font-medium mr-1">
              사진 목록 ({allImages.length}장):
            </span>
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  currentIndex === idx
                    ? 'border-blue-500 ring-2 ring-blue-400/40 scale-105'
                    : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500'
                }`}
                title={`${idx + 1}번째 사진 보기`}
              >
                <img src={img} alt={`미리보기 ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 px-1 text-[9px] font-bold bg-slate-900/80 text-white rounded-tl">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400">
            💡 마우스 휠 또는 상단 확대(+)·축소(-) 버튼으로 상세 글자를 크게 볼 수 있습니다.
          </span>
        )}

        <div className="flex items-center gap-3 shrink-0">
          {hasMultiple && (
            <span className="text-xs text-slate-400 hidden sm:inline">
              좌우 화살표(←, →) 또는 스와이프로 넘겨보기
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-blue-400 hover:text-blue-300 font-bold text-xs underline"
          >
            뷰어 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
