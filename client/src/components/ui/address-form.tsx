import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddressData {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
  number?: string;
}

interface AddressFormProps {
  value: AddressData;
  onChange: (address: AddressData) => void;
  disabled?: boolean;
}

export default function AddressForm({ value, onChange, disabled = false }: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleZipCodeChange = async (zipCode: string) => {
    const cleanZipCode = zipCode.replace(/\D/g, '');
    
    // Update zip code immediately
    onChange({ ...value, zipCode: cleanZipCode });

    // If zip code has 8 digits, fetch address
    if (cleanZipCode.length === 8) {
      setIsLoading(true);
      
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanZipCode}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          toast({
            title: "CEP não encontrado",
            description: "Verifique se o CEP está correto",
            variant: "destructive",
          });
          return;
        }

        onChange({
          ...value,
          zipCode: cleanZipCode,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        });

        toast({
          title: "Endereço encontrado",
          description: "Dados preenchidos automaticamente",
        });
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Verifique sua conexão e tente novamente",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatZipCode = (value: string) => {
    const clean = value.replace(/\D/g, '');
    return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="zipCode">CEP *</Label>
          <div className="relative">
            <Input
              id="zipCode"
              placeholder="00000-000"
              value={formatZipCode(value.zipCode)}
              onChange={(e) => handleZipCodeChange(e.target.value)}
              disabled={disabled || isLoading}
              maxLength={9}
              className="pr-10"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
            {!isLoading && value.zipCode.length === 8 && (
              <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="state">Estado *</Label>
          <Input
            id="state"
            placeholder="SP"
            value={value.state}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
            disabled={disabled}
            maxLength={2}
          />
        </div>
        
        <div>
          <Label htmlFor="city">Cidade *</Label>
          <Input
            id="city"
            placeholder="São Paulo"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="neighborhood">Bairro *</Label>
          <Input
            id="neighborhood"
            placeholder="Centro"
            value={value.neighborhood}
            onChange={(e) => onChange({ ...value, neighborhood: e.target.value })}
            disabled={disabled}
          />
        </div>
        
        <div>
          <Label htmlFor="street">Logradouro *</Label>
          <Input
            id="street"
            placeholder="Rua das Flores"
            value={value.street}
            onChange={(e) => onChange({ ...value, street: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="number">Número</Label>
          <Input
            id="number"
            placeholder="123"
            value={value.number || ''}
            onChange={(e) => onChange({ ...value, number: e.target.value })}
            disabled={disabled}
          />
        </div>
        
        <div>
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            placeholder="Apto 45, Bloco B"
            value={value.complement || ''}
            onChange={(e) => onChange({ ...value, complement: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}