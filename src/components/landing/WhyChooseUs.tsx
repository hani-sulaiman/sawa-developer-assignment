import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useSpring, useTransform } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const CountUp = ({ end, duration = 2 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      
      setCount(Math.floor(end * percentage));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return <span ref={nodeRef}>{count}</span>;
};

export const WhyChooseUs = ({ containerRef }: { containerRef?: React.RefObject<HTMLElement> }) => {
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

  const yLeft = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [200, 0, 0, -200]);
  const yRight = useTransform(smoothProgress, [0, 0.25, 0.8, 1], [250, 0, 0, -250]);
  
  const leftOpacity = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const rightOpacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  
  const leftX = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [-150, 0, 0, -150]);
  const rightX = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [150, 0, 0, 150]);
  
  const leftRotate = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [-12, 0, 0, 12]);
  const rightRotate = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [12, 0, 0, -12]);
  
  const leftScale = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [0.7, 1, 1, 0.7]);
  const rightScale = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [0.75, 1, 1, 0.75]);

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center py-24 bg-white overflow-hidden snap-start relative">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-indigo-100/70 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-100/70 blur-[120px]" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_15%_70%,rgba(148,163,184,0.2),transparent_50%)]" />
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Image Side */}
          <motion.div 
            style={{ 
              y: yLeft, 
              x: leftX, 
              opacity: leftOpacity, 
              rotate: leftRotate,
              scale: leftScale
            }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Medical Team" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-white/30" />
              
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                   <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                    ))}
                   </div>
                   <span className="font-semibold text-lg ml-2">Best Medical Team</span>
                </div>
                <p className="text-white/80 text-sm">Dedicated professionals ready to help you.</p>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white p-4 text-center shadow-xl border-4 border-white">
              <div>
                <span className="block text-2xl font-bold">24/7</span>
                <span className="text-xs uppercase tracking-wider">Support</span>
              </div>
            </div>
            <div className="absolute -top-8 left-6 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur">
              Trusted by 12k+ members
            </div>
          </motion.div>

          {/* Right Content Side */}
          <motion.div 
            style={{ 
              y: yRight, 
              x: rightX, 
              opacity: rightOpacity,
              rotate: rightRotate,
              scale: rightScale
            }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Why MedBook
            </div>
            <h2 className="mt-4 text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-display">
              A premium care experience
              <br />
              <span className="text-blue-600">built around you</span>
            </h2>
            
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Every visit is curated: priority specialists, discreet recovery suites, and a care team
              that manages everything from diagnostics to follow-up.
            </p>

            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="flex flex-col gap-1">
                <h3 className="text-4xl font-bold text-slate-900 flex items-baseline">
                  <CountUp end={10} />+
                </h3>
                <p className="text-slate-600 font-medium">Years of Experience</p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-4xl font-bold text-slate-900 flex items-baseline">
                  <CountUp end={95} />%
                </h3>
                <p className="text-slate-600 font-medium">Patient Satisfaction</p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-4xl font-bold text-slate-900 flex items-baseline">
                  <CountUp end={20} />+
                </h3>
                <p className="text-slate-600 font-medium">Qualified Doctors</p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-4xl font-bold text-slate-900 flex items-baseline">
                  <CountUp end={100} />%
                </h3>
                <p className="text-slate-600 font-medium">Digital Diagnostics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { title: 'Private Wellness Suite', desc: 'Luxury rooms designed for restorative care.' },
                { title: 'Specialist On-Call', desc: 'Immediate access to global medical leaders.' }
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm shadow-slate-200/70 backdrop-blur">
                  <p className="text-base font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>

            <ul className="space-y-4 mb-8">
              {['Modern Technology', 'Professional Doctors', 'Affordable Prices', 'Emergency Care'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="text-blue-600" size={20} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="rounded-full bg-blue-600 px-6 py-3 text-white font-semibold shadow-lg shadow-blue-200/70 hover:bg-blue-700 transition-colors"
              >
                Start your membership
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-slate-300/70 bg-white/70 px-6 py-3 text-slate-700 font-semibold hover:text-blue-700 hover:border-blue-200 transition-colors"
              >
                View patient stories
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
