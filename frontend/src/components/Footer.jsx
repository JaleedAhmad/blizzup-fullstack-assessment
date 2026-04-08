import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Blizzup<span className="text-blue-500">Bikes</span></h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your destination for premium quality bikes and expert AI-driven comparisons.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-500" />
                <span className="text-sm">support@blizzup.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-500" />
                <span className="text-sm">+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Lahore, Pakistan</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:text-blue-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:text-blue-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm hover:text-blue-500 transition-colors">Shipping Information</a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <span className="text-xs text-gray-500 italic">Social links coming soon</span>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Blizzup Technologies Pvt Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
