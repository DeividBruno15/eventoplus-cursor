import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, onChange, ...props }, ref) => {
    const formatCurrency = (inputValue: string) => {
      // Remove all non-numeric characters
      const numericValue = inputValue.replace(/\D/g, '');
      
      if (!numericValue) return '';
      
      // Convert to decimal (divide by 100 to get proper decimal places)
      const number = parseFloat(numericValue) / 100;
      
      // Format as Brazilian currency
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
      }).format(number);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCurrency(e.target.value);
      onValueChange?.(formatted);
      
      // Call original onChange if provided
      if (onChange) {
        const event = { ...e, target: { ...e.target, value: formatted } };
        onChange(event);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={value || ''}
        onChange={handleChange}
        placeholder="R$ 0,00"
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";