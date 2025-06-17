import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface CPFCNPJInputProps {
  value: string;
  onChange: (value: string) => void;
  type: "cpf" | "cnpj";
  label: string;
  placeholder?: string;
  error?: string;
}

export function CPFCNPJInput({ value, onChange, type, label, placeholder, error }: CPFCNPJInputProps) {
  const [maskedValue, setMaskedValue] = useState("");

  const applyCPFMask = (val: string) => {
    return val
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const applyCNPJMask = (val: string) => {
    return val
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, "");
    if (numbers.length !== 11) return false;
    
    // Check for known invalid patterns
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[9])) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(numbers[10]);
  };

  const validateCNPJ = (cnpj: string) => {
    const numbers = cnpj.replace(/\D/g, "");
    if (numbers.length !== 14) return false;
    
    // Check for known invalid patterns
    if (/^(\d)\1{13}$/.test(numbers)) return false;
    
    // Validate first check digit
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(numbers[12])) return false;
    
    // Validate second check digit
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    return digit2 === parseInt(numbers[13]);
  };

  useEffect(() => {
    const masked = type === "cpf" ? applyCPFMask(value) : applyCNPJMask(value);
    setMaskedValue(masked);
  }, [value, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleanValue = inputValue.replace(/\D/g, "");
    const masked = type === "cpf" ? applyCPFMask(inputValue) : applyCNPJMask(inputValue);
    
    setMaskedValue(masked);
    onChange(cleanValue);
  };

  const isValid = type === "cpf" ? validateCPF(value) : validateCNPJ(value);
  const hasContent = value.length > 0;

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            value={maskedValue}
            onChange={handleChange}
            placeholder={placeholder || (type === "cpf" ? "000.000.000-00" : "00.000.000/0000-00")}
            className={hasContent && !isValid ? "border-red-500" : ""}
          />
          {hasContent && (
            <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full ${
              isValid ? "bg-green-500" : "bg-red-500"
            }`} />
          )}
        </div>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
      {hasContent && !isValid && (
        <p className="text-sm text-red-500 mt-1">
          {type === "cpf" ? "CPF inválido" : "CNPJ inválido"}
        </p>
      )}
    </FormItem>
  );
}