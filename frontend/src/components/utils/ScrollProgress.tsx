import React, { useEffect, useState } from 'react';

const ScrollProgress: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = (currentScroll / totalScroll) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="scroll-progress-bar" 
      style={{ 
        width: `${scrollProgress}%`,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '4px',
        backgroundColor: 'var(--brand-primary)',
        zIndex: 'var(--z-progress)',
        transition: 'width 0.1s ease-out'
      }} 
    />
  );
};

export default ScrollProgress;
