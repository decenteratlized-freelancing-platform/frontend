"use client"

import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';

export default function CurrencyToggle() {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <Button
      variant="outline"
      onClick={toggleCurrency}
      className="border-blue-500 text-white hover:bg-white/10 bg-transparent hover:text-white px-4 py-2 rounded-2xl backdrop-blur-sm"
    >
      {currency === 'INR' ? 'Show in ETH' : 'Show in INR'}
    </Button>
  );
}
