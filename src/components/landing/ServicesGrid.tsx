import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const services = [
  {
    id: '01',
    title: 'General Practice',
    description: 'Comprehensive medical care for individuals and families, focusing on prevention and overall health.',
    highlight: false,
    price: '$180+',
    features: ['Dedicated care team', 'Annual wellness plan', 'Priority scheduling']
  },
  {
    id: '02',
    title: 'Advanced Diagnostics',
    description: 'State-of-the-art diagnostic equipment to accurately identify health issues at early stages.',
    highlight: true,
    price: '$420+',
    features: ['Same-day imaging', 'Specialist review', 'Luxury suite access']
  },
  {
    id: '03',
    title: 'Specialized Care',
    description: 'Expert care in various medical fields including cardiology, neurology, and orthopedics.',
    highlight: false,
    price: '$260+',
    features: ['Personalized treatment plan', 'Recovery concierge', 'Global referrals']
  }
];

export const ServicesGrid = ({ containerRef }: { containerRef?: React.RefObject<HTMLElement> }) => {
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

  const headerY = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [150, 0, 0, -150]);
  const headerOpacity = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  const card1Y = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [200, 0, 0, -200]);
  const card2Y = useTransform(smoothProgress, [0, 0.25, 0.8, 1], [250, 0, 0, -250]);
  const card3Y = useTransform(smoothProgress, [0, 0.3, 0.8, 1], [300, 0, 0, -300]);
  
  const cardOpacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const cardScale = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [0.75, 1, 1, 0.75]);
  const cardRotate = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [12, 0, 0, -12]);

  const cardYTransforms = [card1Y, card2Y, card3Y];

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center py-20 bg-slate-50 snap-start relative overflow-hidden" id="services">
      <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-blue-100/70 blur-[130px]" />
      <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-indigo-100/70 blur-[130px]" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_10%_10%,rgba(148,163,184,0.2),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(59,130,246,0.18),transparent_45%)]" />
      <div className="container mx-auto px-4 md:px-6 relative">
        <motion.div 
          className="mb-12 flex items-end justify-between"
          style={{ y: headerY, opacity: headerOpacity }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Signature services
            </div>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-display">Premium medical experiences</h2>
            <p className="text-slate-600 max-w-xl">
              Curated care pathways designed for comfort, discretion, and world-class clinical outcomes.
            </p>
          </div>
          <Link
            to="/doctors"
            className="hidden md:flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/70 px-5 py-3 text-slate-700 font-semibold hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
          >
            View all services <ArrowRight size={20} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className={`relative p-8 rounded-[2rem] flex flex-col justify-between min-h-[340px] transition-all duration-300 border ${
                service.highlight 
                  ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-300/40 border-blue-400/30' 
                  : 'bg-white/85 text-slate-900 shadow-xl shadow-slate-200/60 border-slate-200/70 backdrop-blur'
              }`}
              style={{ 
                y: cardYTransforms[index],
                opacity: cardOpacity,
                scale: cardScale,
                rotate: cardRotate
              }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xl font-bold ${
                    service.highlight ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    {service.id}
                  </span>
                  {service.highlight && (
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest">Signature</span>
                  )}
                </div>
                <h3 className="mt-6 text-2xl font-bold mb-4">{service.title}</h3>
                <p className={`leading-relaxed ${
                  service.highlight ? 'text-blue-100' : 'text-slate-600'
                }`}>
                  {service.description}
                </p>
                <div className="mt-6">
                  <p className={`text-sm font-semibold uppercase tracking-wider ${
                    service.highlight ? 'text-blue-100/80' : 'text-slate-500'
                  }`}>
                    Starting at
                  </p>
                  <p className={`text-2xl font-semibold ${
                    service.highlight ? 'text-white' : 'text-slate-900'
                  }`}>
                    {service.price}
                  </p>
                </div>
                <ul className="mt-6 space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className={`text-sm ${
                      service.highlight ? 'text-blue-100' : 'text-slate-600'
                    }`}>
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link to="/register" className="inline-flex items-center gap-2 font-semibold hover:gap-3 transition-all">
                  Make an appointment <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
           <Link
            to="/doctors"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/70 px-5 py-3 text-slate-700 font-semibold hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
          >
            View all services <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};
