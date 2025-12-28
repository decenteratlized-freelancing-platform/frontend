"use client"

import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';

export default function CurrencyToggle() {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <Button
      variant="outline"
      onClick={toggleCurrency}
      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
    >
      {currency === 'INR' ? 'Show in ETH' : 'Show in INR'}
    </Button>
  );
}
