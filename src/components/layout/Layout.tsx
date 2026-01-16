import { ReactNode } from 'react';
import { Header } from './Header';
import { Link } from 'react-router-dom';
import { IconStethoscope, IconBrandTwitter, IconBrandLinkedin, IconBrandFacebook } from '@tabler/icons-react';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="container-main py-8 lg:py-12">
          {children}
        </div>
      </main>
      
      {showFooter && (
        <footer className="bg-gray-900 text-white">
          <div className="container-main py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {/* Brand */}
              <div className="lg:col-span-1">
                <Link to="/" className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                    <IconStethoscope className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">MedBook</span>
                </Link>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Your trusted platform for booking appointments with qualified healthcare professionals.
                </p>
                <div className="flex items-center gap-3">
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                    <IconBrandTwitter size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                    <IconBrandLinkedin size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                    <IconBrandFacebook size={18} />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-white mb-6">Quick Links</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Find Doctors</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Specialties</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">How It Works</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-semibold text-white mb-6">Support</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">FAQs</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold text-white mb-6">Contact</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li>support@medbook.com</li>
                  <li>+1 (555) 123-4567</li>
                  <li>123 Medical Center Drive<br />Healthcare City, HC 12345</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} MedBook. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
