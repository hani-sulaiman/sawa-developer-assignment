import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Stethoscope } from 'lucide-react';

export const Footer = ({ containerRef }: { containerRef?: React.RefObject<HTMLElement> }) => {
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
  const scale = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [0.85, 1, 1, 0.85]);

  const col1Y = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [150, 0, 0, -150]);
  const col2Y = useTransform(smoothProgress, [0, 0.25, 0.8, 1], [180, 0, 0, -180]);
  const col3Y = useTransform(smoothProgress, [0, 0.3, 0.8, 1], [210, 0, 0, -210]);
  const col4Y = useTransform(smoothProgress, [0, 0.35, 0.8, 1], [240, 0, 0, -240]);

  const contactBarY = useTransform(smoothProgress, [0, 0.3, 0.8, 1], [120, 0, 0, -120]);
  const bottomBarY = useTransform(smoothProgress, [0, 0.35, 0.8, 1], [100, 0, 0, -100]);

  return (
    <footer ref={sectionRef} id="contact" className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white min-h-screen flex flex-col justify-center py-20 snap-start relative overflow-hidden">
      {/* Background Decorative Elements */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10"
        style={{ opacity }}
      >
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-500 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500 rounded-full blur-[100px]" />
      </motion.div>

      <motion.div 
        className="container mx-auto px-4 md:px-6 relative z-10"
        style={{ y, scale }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-12 rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-950/80 p-8 md:p-10 shadow-2xl shadow-blue-900/30 backdrop-blur">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Premium access</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-display text-white">Design your private care journey</h2>
              <p className="mt-3 text-slate-300 max-w-2xl">
                Get a concierge plan with priority specialists, curated diagnostics, and luxury recovery spaces tailored to you.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 hover:bg-blue-500 transition-colors"
              >
                Schedule concierge call
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:border-blue-300/60 hover:text-blue-100 transition-colors"
              >
                Download brochure
              </Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-300">
            {['Private suites', 'Global specialist network', 'Recovery concierge', 'Wellness memberships'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <motion.div className="space-y-6" style={{ y: col1Y, opacity }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <Stethoscope size={24} />
              </div>
              <span className="text-2xl font-bold">MedBook</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Transforming healthcare accessibility with innovative technology. We bridge the gap between patients and top-tier medical professionals.
            </p>
            <div className="flex gap-4 pt-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <Link
                  key={i}
                  to="/login"
                  className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-200 hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div style={{ y: col2Y, opacity }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}>
            <h3 className="text-lg font-bold mb-6 font-display">Company</h3>
            <ul className="space-y-4">
              {[
                { label: 'About Us', href: '#mission' },
                { label: 'Our Doctors', href: '/doctors' },
                { label: 'Services', href: '#services' },
                { label: 'Careers', href: '/register' },
                { label: 'Blog', href: '/login' },
                { label: 'Contact', href: '#contact' }
              ].map((item) => (
                <li key={item.label}>
                  {item.href.startsWith('#') ? (
                    <a href={item.href} className="text-slate-300 hover:text-blue-200 transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.label}
                    </a>
                  ) : (
                    <Link to={item.href} className="text-slate-300 hover:text-blue-200 transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div style={{ y: col3Y, opacity }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}>
            <h3 className="text-lg font-bold mb-6 font-display">Services</h3>
            <ul className="space-y-4">
              {['General Checkup', 'Pediatrics', 'Cardiology', 'Dermatology', 'Neurology', 'Dental Care'].map((item) => (
                <li key={item}>
                  <Link to="/doctors" className="text-slate-300 hover:text-blue-200 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div style={{ y: col4Y, opacity }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}>
            <h3 className="text-lg font-bold mb-6 font-display">Stay Updated</h3>
            <p className="text-slate-300 mb-6">
              Subscribe to our newsletter for the latest health tips and updates.
            </p>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-all"
                />
              </div>
              <Link to="/register" className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                Subscribe <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Contact Info Bar */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-slate-800 mb-8"
          style={{ y: contactBarY, opacity }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-4 text-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
              <Phone size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Phone</p>
              <p className="text-white font-medium">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-200">
             <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email</p>
              <p className="text-white font-medium">support@medbook.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-200">
             <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
              <MapPin size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Location</p>
              <p className="text-white font-medium">123 Healthcare Ave, NY</p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800 text-sm text-slate-300"
          style={{ y: bottomBarY, opacity }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        >
          <p>© {new Date().getFullYear()} MedBook. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/login" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/login" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/login" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};
