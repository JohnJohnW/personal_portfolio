import React, { useEffect, useState } from 'react';

function Footer() {
  const [showScroll, setShowScroll] = useState(false);

  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, [showScroll]);

  return (
    <footer className="footer">
      <p>&copy; 2024 John Wynter. All rights reserved.</p>
      <button
        className={`scroll-to-top ${showScroll ? 'show-scroll' : ''}`}
        onClick={scrollTop}
      >
        Scroll to Top
      </button>
    </footer>
  );
}

export default Footer;
