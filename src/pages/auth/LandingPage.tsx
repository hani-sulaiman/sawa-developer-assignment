import React, { useEffect, useRef } from 'react';
import { Navbar, Hero, MissionStatement, ServicesGrid, WhyChooseUs, Footer } from '@/components/landing';

export const LandingPage = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let isAnimating = false;
    let animationFrame: number | null = null;
    let scrollTimeout: number | null = null;
    const duration = 2000;
    const snapDelay = 140;

    const getSections = () => Array.from(container.querySelectorAll<HTMLElement>('.snap-start'));

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const smoothScrollTo = (targetTop: number) => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      const startTop = container.scrollTop;
      const distance = targetTop - startTop;
      if (Math.abs(distance) < 4) {
        isAnimating = false;
        return;
      }
      const startTime = performance.now();
      isAnimating = true;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(t);
        container.scrollTop = startTop + distance * eased;

        if (t < 1) {
          animationFrame = requestAnimationFrame(step);
        } else {
          isAnimating = false;
        }
      };

      animationFrame = requestAnimationFrame(step);
    };

    const snapToClosest = () => {
      const sections = getSections();
      if (!sections.length) return;

      const currentScroll = container.scrollTop;
      let closestIndex = 0;
      let closestDistance = Infinity;

      sections.forEach((section, index) => {
        const distance = Math.abs(section.offsetTop - currentScroll);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      smoothScrollTo(sections[closestIndex].offsetTop);
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 10) return;
      event.preventDefault();

      if (isAnimating) return;

      const sections = getSections();
      if (!sections.length) return;

      const currentScroll = container.scrollTop;
      let closestIndex = 0;
      let closestDistance = Infinity;

      sections.forEach((section, index) => {
        const distance = Math.abs(section.offsetTop - currentScroll);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.min(Math.max(closestIndex + direction, 0), sections.length - 1);
      smoothScrollTo(sections[nextIndex].offsetTop);
    };

    const handleScroll = () => {
      if (isAnimating) return;
      if (scrollTimeout) {
        window.clearTimeout(scrollTimeout);
      }

      scrollTimeout = window.setTimeout(() => {
        if (!isAnimating) {
          snapToClosest();
        }
      }, snapDelay);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('scroll', handleScroll);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (scrollTimeout) {
        window.clearTimeout(scrollTimeout);
      }
    };
  }, []);

  return (
    <div 
      ref={scrollRef}
      className="scroll-snap-container h-screen overflow-y-scroll bg-white font-sans text-slate-900 relative"
      style={{
        scrollBehavior: 'auto',
        scrollSnapType: 'none'
      }}
    >
      <Navbar containerRef={scrollRef} />
      <Hero containerRef={scrollRef} />
      <MissionStatement containerRef={scrollRef} />
      <ServicesGrid containerRef={scrollRef} />
      <WhyChooseUs containerRef={scrollRef} />
      <Footer containerRef={scrollRef} />
    </div>
  );
};
