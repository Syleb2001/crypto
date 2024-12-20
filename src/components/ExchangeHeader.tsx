import React, { useState } from 'react';
import { ArrowRightLeft, Menu, X } from 'lucide-react';
import { PrivacyToggle } from './PrivacyToggle';
import { Link, useLocation } from 'react-router-dom';

export function ExchangeHeader() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-[#22262e] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <ArrowRightLeft className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold">CryptoSwap</span>
          </Link>

          {/* Desktop Navigation - Push to right */}
          <div className="hidden lg:flex items-center justify-end flex-1 gap-6">
            <nav className="flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm hover:text-blue-400 transition-colors ${
                  location.pathname === '/' ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                Home
              </Link>
              <Link
                to="/faq"
                className={`text-sm hover:text-blue-400 transition-colors ${
                  location.pathname === '/faq' ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                FAQ
              </Link>
              <Link
                to="/support"
                className={`text-sm hover:text-blue-400 transition-colors ${
                  location.pathname === '/support' ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                Support
              </Link>
            </nav>
            <PrivacyToggle />
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center justify-end flex-1 gap-2">
            <PrivacyToggle />
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-[#2c313c] transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } lg:hidden border-t border-gray-800 py-4`}
        >
          <nav className="flex flex-col space-y-4">
            <Link
              to="/"
              className={`text-sm hover:text-blue-400 transition-colors ${
                location.pathname === '/' ? 'text-blue-400' : 'text-gray-400'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/faq"
              className={`text-sm hover:text-blue-400 transition-colors ${
                location.pathname === '/faq' ? 'text-blue-400' : 'text-gray-400'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              to="/support"
              className={`text-sm hover:text-blue-400 transition-colors ${
                location.pathname === '/support' ? 'text-blue-400' : 'text-gray-400'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Support
            </Link>
          </nav>
        </div>
      </div>

      {/* Features banner */}
      <div className="bg-blue-500/10 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-6 min-w-max">
            <div className="flex items-center gap-3 text-sm whitespace-nowrap">
              <span>No registration required</span>
            </div>
            <div className="flex items-center gap-3 text-sm whitespace-nowrap">
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center gap-3 text-sm whitespace-nowrap">
              <span>Instant exchanges</span>
            </div>
            <div className="flex items-center gap-3 text-sm whitespace-nowrap">
              <span>Best rates guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}