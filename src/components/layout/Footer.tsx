import { Link } from "react-router-dom";
import { useState } from "react";
import { SupportTicketModal } from "@/components/support/SupportTicketModal";
import { HelpCircle } from "lucide-react";

const footerLinks = {
  "For Customers": [
    { name: "Browse Vendors", path: "/search" },
    { name: "How it Works", path: "/#how-it-works" },
    { name: "Reviews", path: "/reviews" },
  ],
  Support: [
    { name: "Contact Us", path: "/contact" },
    { name: "FAQ", path: "/faq" },
    { name: "Terms of Service", path: "/terms" },
  ],
};



export function Footer() {
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  return (
    <>
      <SupportTicketModal
        open={supportModalOpen}
        onOpenChange={setSupportModalOpen}
        defaultCategory="general"
      />
      <footer className="bg-gradient-to-b from-[#FB5610] to-[#B90A8D]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div 
            className="md:col-span-2"
            data-aos="fade-up"
          >
            <Link to="/" className="flex items-center">
              <img
                src="/images/Logo.jpeg"
                alt="The Curry Fabulous Family"
                className="h-12 rounded-lg"
              />
            </Link>
            <p className="mt-4 text-sm text-white/90 leading-relaxed">
              The Curry Fabulous Family specializes in providing exceptional catering services for all kinds of events.
            </p>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <div 
              key={category}
              data-aos="fade-up"
              data-aos-delay={(index + 1) * 100}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-white/80 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                {category === "Support" && (
                  <li>
                    <button
                      onClick={() => setSupportModalOpen(true)}
                      className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Get Support
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-white/20 pt-8">
          <p className="text-center text-sm text-white/80">
            © {new Date().getFullYear()} The Curry Fabulous Family. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
    </>
  );
}
