import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Activity, Heart } from 'lucide-react';

export const MissionStatement = ({ containerRef }: { containerRef?: React.RefObject<HTMLElement> }) => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 35,
    damping: 20,
    mass: 1.2
  });

  const y = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [200, 0, 0, -200]);
  const opacity = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [0.7, 1, 1, 0.7]);
  const rotate = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [-8, 0, 0, 8]);

  const iconScale = useTransform(smoothProgress, [0, 0.2, 0.5, 0.8, 1], [0, 1, 1.15, 1, 0]);
  const textY = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [150, 0, 0, -150]);

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center py-24 bg-white relative overflow-hidden snap-start" id="mission">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-100/70 blur-[120px]" />
      <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-rose-100/70 blur-[120px]" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_90%_10%,rgba(248,113,113,0.18),transparent_40%)]" />
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="max-w-4xl mx-auto text-center md:text-left">
          <motion.div
            style={{ y, opacity, scale, rotate }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/70 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Our promise
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium text-slate-900 leading-tight">
              We combine 
              <motion.span 
                className="inline-flex items-center mx-3 align-middle"
                style={{ scale: iconScale }}
              >
                <span className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-1">
                  <Activity size={24} className="md:w-8 md:h-8" />
                </span>
                <span className="text-blue-600 font-bold"> innovative technologies</span>
              </motion.span>
              with a 
              <motion.span 
                className="inline-flex items-center mx-3 align-middle"
                style={{ scale: iconScale }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              >
                 <span className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mx-1">
                  <Heart size={24} className="md:w-8 md:h-8" />
                </span>
                <span className="text-rose-500 font-bold"> human approach</span>
              </motion.span>
              to make every patient feel confident and calm.
            </h2>
            
            <motion.p className="mt-6 text-lg text-slate-600 leading-relaxed">
              From proactive diagnostics to personalized recovery, we curate an experience that feels calm,
              modern, and exceptionally attentive.
            </motion.p>

            <motion.div 
              className="mt-10 flex flex-col md:flex-row gap-6 md:items-center"
              style={{ y: textY, opacity }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-lg text-slate-500 max-w-xl">
                Our mission is to provide the highest standard of medical care while treating each patient with dignity, respect, and kindness.
              </p>
              
              <Link
                to="/register"
                className="group flex items-center gap-2 text-blue-600 font-semibold text-lg hover:text-blue-700 transition-colors"
              >
                Learn more about us
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4"
              style={{ y: textY, opacity }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            >
              {[
                { title: 'Concierge Care', desc: 'Dedicated care team coordinating every step.' },
                { title: 'Precision Diagnostics', desc: 'Advanced imaging & specialist-led assessments.' },
                { title: 'Luxury Recovery', desc: 'Comfort-first spaces designed for deep recovery.' }
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/70 bg-white/70 p-5 text-left shadow-sm shadow-slate-200/80 backdrop-blur">
                  <p className="text-base font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
