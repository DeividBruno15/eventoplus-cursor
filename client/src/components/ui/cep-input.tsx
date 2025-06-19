import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CEPInputProps {
  onAddressFound: (address: {
    cep: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
    number?: string;
  }) => void;
  initialValue?: string;
  className?: string;
  placeholder?: string;
}

export function CEPInput({ onAddressFound, initialValue = "", className = "", placeholder = "00000-000" }: CEPInputProps) {
  const [cep, setCep] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatCEP = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XXXXX-XXX
    if (numbers.length <= 5) {
      return numbers;
    } else {
      return numbers.slice(0, 5) + '-' + numbers.slice(5, 8);
    }
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setCep(formatted);
  };

  const searchCEP = async () => {
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      toast({
        title: "CEP Inválido",
        description: "Digite um CEP válido com 8 números",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP e tente novamente",
          variant: "destructive",
        });
        return;
      }

      onAddressFound({
        cep: data.cep,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      });

      toast({
        title: "Endereço encontrado!",
        description: `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: "Verifique sua conexão e tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchCEP();
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={cep}
        onChange={handleCEPChange}
        onKeyPress={handleKeyPress}
        maxLength={9}
        className="flex-1"
      />
      <Button
        type="button"
        onClick={searchCEP}
        disabled={loading || cep.length < 9}
        variant="outline"
        size="icon"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}