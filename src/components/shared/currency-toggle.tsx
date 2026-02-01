"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { Button } from "@/components/ui/button";

const CurrencyToggle = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex space-x-2">
      <Button
        variant={currency === 'ETH' ? 'secondary' : 'ghost'}
        onClick={() => setCurrency('ETH')}
      >
        ETH
      </Button>
      <Button
        variant={currency === 'USD' ? 'secondary' : 'ghost'}
        onClick={() => setCurrency('USD')}
      >
        USD
      </Button>
    </div>
  );
};

export default CurrencyToggle;
