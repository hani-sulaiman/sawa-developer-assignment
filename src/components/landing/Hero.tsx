import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { UserRound, ShieldCheck, Star } from 'lucide-react';

export const Hero = ({ containerRef }: { containerRef?: React.RefObject<HTMLElement> }) => {
  const sectionRef = React.useRef(null);
  const { scrollYProgress } = useScroll({ 
    target: sectionRef,
    container: containerRef,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 35,
    damping: 20,
    mass: 1.2
  });
  
  const y1 = useTransform(smoothProgress, [0, 1], [0, 200]);
  const y2 = useTransform(smoothProgress, [0, 1], [0, -200]);
  const opacity = useTransform(smoothProgress, [0, 0.6, 1], [1, 1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.6, 1], [1, 1, 0.8]);
  
  const titleY = useTransform(smoothProgress, [0, 0.6], [0, -80]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.4, 0.7], [1, 1, 0]);
  
  const imageScale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.08, 0.85]);
  const imageRotate = useTransform(smoothProgress, [0, 1], [0, -8]);

  return (
    <section ref={sectionRef} className="relative min-h-screen pt-24 pb-12 overflow-hidden bg-gradient-to-b from-slate-50 to-white flex items-center snap-start">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_55%),radial-gradient(circle_at_70%_20%,rgba(14,165,233,0.2),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(148,163,184,0.22),transparent_60%)]" />
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Left Content */}
          <motion.div 
            className="flex-1 w-full max-w-2xl lg:text-left text-center"
            style={{ opacity, scale }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-blue-200/60 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/70 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Premium medical concierge
              <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-xs font-medium text-blue-700">Awarded 2025</span>
            </div>
            <motion.h1 
              className="mt-6 text-5xl md:text-7xl font-bold text-slate-900 leading-[1.05] mb-6 tracking-tight font-display"
              style={{ y: titleY, opacity: titleOpacity }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            >
              Precision healthcare,
              <br />
              <span className="text-blue-600 inline-block relative">
                curated for you
                <motion.span 
                  className="absolute -right-6 top-0 w-4 h-4 bg-blue-400 rounded-full blur-[2px]"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </span>
            </motion.h1>

            <motion.p 
              className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              style={{ y: titleY, opacity: titleOpacity }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            >
              Personalized care plans, instant access to world-class specialists, and a
              curated wellness experience designed to feel effortless and human.
            </motion.p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
              {[
                'White-glove coordination',
                'Same-day specialist access',
                'Luxury recovery lounges'
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-200/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {item}
                </span>
              ))}
            </div>

            <motion.div 
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              style={{ opacity: titleOpacity }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative group">
                <Link
                  to="/register"
                  className="inline-flex items-center bg-blue-600 text-white pl-6 pr-14 py-4 rounded-full text-lg font-semibold shadow-xl shadow-blue-200/70 hover:bg-blue-700 transition-all hover:shadow-blue-300 active:scale-95"
                >
                  Book a private consult
                </Link>
                <div className="absolute right-2 top-2 h-10 w-10 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <UserRound size={20} />
                </div>
              </div>
              <Link
                to="/login"
                className="rounded-full border border-slate-300/70 bg-white/70 px-6 py-4 text-lg font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700 transition-colors"
              >
                Explore membership
              </Link>
            </motion.div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              {[
                { label: 'Patient concierge', value: '24/7' },
                { label: 'Specialist network', value: '120+' },
                { label: 'Avg. response time', value: '9 min' },
                { label: 'Client satisfaction', value: '98%' }
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-xl font-semibold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Image & Floating Elements */}
          <div className="flex-1 w-full relative h-[500px] md:h-[600px] flex items-center justify-center">
            
            {/* Main Image Container */}
            <motion.div 
              className="relative z-10 h-full w-full max-w-[520px]"
              style={{ scale: imageScale, rotate: imageRotate }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            >
              <img 
                src="/docs.png" 
                alt="Professional Doctor" 
                className="w-full h-full object-cover object-top rounded-b-[220px] rounded-t-[220px] shadow-2xl"
              />
              <div className="absolute inset-0 rounded-b-[220px] rounded-t-[220px] ring-1 ring-black/5" />
              <div className="absolute inset-0 rounded-b-[220px] rounded-t-[220px] bg-gradient-to-t from-slate-900/25 via-transparent to-transparent" />
            </motion.div>

            {/* Floating Card: Reliability */}
            <motion.div 
              className="absolute left-0 md:-left-12 top-1/4 z-20"
              style={{ y: y1, opacity }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="bg-white/85 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/60 flex items-center gap-3"
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Reliability</p>
                  <p className="font-bold text-slate-800">100% Secure</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Card: Experience */}
            <motion.div 
              className="absolute right-0 md:-right-4 top-1/3 z-20"
              style={{ y: y2, opacity }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="bg-white/85 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/60 flex items-center gap-3"
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                  <Star size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Experience</p>
                  <p className="font-bold text-slate-800">Top Rated</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Card: Professional */}
            <motion.div 
              className="absolute right-8 bottom-24 z-20"
              style={{ opacity }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-200/70"
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <p className="font-medium text-sm">Professional Team</p>
                <div className="flex -space-x-2 mt-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-400 flex items-center justify-center text-xs">
                      Dr
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-white text-blue-600 flex items-center justify-center text-xs font-bold">
                    +
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
