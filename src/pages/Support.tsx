import React from 'react';
import { Mail, MessageCircle, Shield, AlertCircle } from 'lucide-react';

export function Support() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Support Center</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-[#22262e] rounded-lg border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold">Live Chat</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Get instant help from our support team. Available 24/7.
          </p>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Start Chat
          </button>
        </div>

        <div className="bg-[#22262e] rounded-lg border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold">Email Support</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Send us a detailed message and we'll respond within 24 hours.
          </p>
          <a
            href="mailto:support@cryptoswap.com"
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
          >
            Email Us
          </a>
        </div>

        <div className="bg-[#22262e] rounded-lg border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold">Security</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Report security issues or suspicious activity.
          </p>
          <a
            href="mailto:security@cryptoswap.com"
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
          >
            Contact Security Team
          </a>
        </div>

        <div className="bg-[#22262e] rounded-lg border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold">Issue with Order</h2>
          </div>
          <p className="text-gray-400 mb-4">
            Having problems with your exchange? Get priority support.
          </p>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Report Issue
          </button>
        </div>
      </div>

      <div className="mt-12 bg-[#22262e] rounded-lg border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-4">Alternative Contact Methods</h2>
        <div className="space-y-4 text-gray-400">
          <p>
            For enhanced privacy, you can also reach us through:
          </p>
          <ul className="space-y-2">
            <li>• Telegram: @cryptoswap_support</li>
            <li>• Signal: +1234567890</li>
            <li>• Session ID: 05af1...</li>
          </ul>
          <p className="text-sm">
            Note: For sensitive communications, please use our PGP key available on our GitHub.
          </p>
        </div>
      </div>
    </div>
  );
}