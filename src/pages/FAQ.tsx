import React from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How does CryptoSwap work?',
    answer: 'CryptoSwap is a non-custodial exchange service that allows you to swap cryptocurrencies without registration. We use smart routing to find the best rates across multiple liquidity sources.',
  },
  {
    question: 'What are the fees?',
    answer: 'We offer two rate types: Fixed (1.5%) and Dynamic (1%). Fixed rates guarantee the exchange rate for the duration of the transaction, while Dynamic rates may fluctuate but offer lower fees.',
  },
  {
    question: 'How long do exchanges take?',
    answer: 'Most exchanges are completed within 10-30 minutes. The exact time depends on network confirmations of the cryptocurrencies involved.',
  },
  {
    question: 'Is there a minimum exchange amount?',
    answer: 'Yes, minimum amounts vary by cryptocurrency to ensure the exchange amount covers network fees. You\'ll see the minimum amount when selecting currencies.',
  },
  {
    question: 'What happens if I send the wrong amount?',
    answer: 'If you send less than the specified amount, the excess will be refunded minus network fees. If you send more, the excess will be automatically refunded.',
  },
  {
    question: 'Are my funds safe?',
    answer: 'Yes, we are a non-custodial service. We never hold your funds - they are directly exchanged between blockchains. We don\'t require registration or store any personal data.',
  },
  {
    question: 'Which cryptocurrencies do you support?',
    answer: 'We currently support BTC (Bitcoin), XMR (Monero), and LTC (Litecoin). We regularly evaluate adding new cryptocurrencies based on security and demand.',
  },
  {
    question: 'What is No-JS Mode?',
    answer: 'No-JS Mode is our privacy-focused interface that works without JavaScript. It provides a basic but secure way to interact with our service using alternative communication methods.',
  },
];

export function FAQ() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group bg-[#22262e] rounded-lg border border-gray-800"
          >
            <summary className="flex items-center justify-between p-6 cursor-pointer">
              <h3 className="text-lg font-medium pr-4">{faq.question}</h3>
              <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-6 text-gray-400">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}