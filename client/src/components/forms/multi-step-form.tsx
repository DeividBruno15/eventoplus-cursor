import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Save,
  AlertCircle
} from "lucide-react";

interface FormStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  validation?: (data: any) => string[] | true;
  optional?: boolean;
}

interface MultiStepFormProps {
  steps: FormStep[];
  onComplete: (data: any) => void;
  onSave?: (data: any) => void;
  initialData?: any;
  autoSave?: boolean;
  className?: string;
}

export default function MultiStepForm({
  steps,
  onComplete,
  onSave,
  initialData = {},
  autoSave = true,
  className = ""
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [stepValidation, setStepValidation] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save a cada 30 segundos
  useEffect(() => {
    if (!autoSave || !onSave) return;

    const interval = setInterval(() => {
      onSave(formData);
      setLastSaved(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, autoSave, onSave]);

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('multiStepForm_data');
    if (saved && Object.keys(initialData).length === 0) {
      try {
        const parsedData = JSON.parse(saved);
        setFormData(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem('multiStepForm_data', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const validateStep = (stepIndex: number): string[] => {
    const step = steps[stepIndex];
    if (!step.validation) return [];
    
    const result = step.validation(formData);
    return result === true ? [] : result;
  };

  const validateCurrentStep = (): boolean => {
    const errors = validateStep(currentStep);
    setStepValidation(prev => ({
      ...prev,
      [steps[currentStep].id]: errors
    }));
    return errors.length === 0;
  };

  const canProceed = (): boolean => {
    const step = steps[currentStep];
    if (step.optional) return true;
    return validateCurrentStep();
  };

  const nextStep = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSubmit = async () => {
    // Validar todos os steps obrigatórios
    const allErrors: Record<string, string[]> = {};
    let hasErrors = false;

    steps.forEach((step, index) => {
      if (!step.optional) {
        const errors = validateStep(index);
        if (errors.length > 0) {
          allErrors[step.id] = errors;
          hasErrors = true;
        }
      }
    });

    setStepValidation(allErrors);

    if (hasErrors) {
      // Ir para o primeiro step com erro
      const firstErrorStep = steps.findIndex(step => allErrors[step.id]?.length > 0);
      if (firstErrorStep !== -1) {
        setCurrentStep(firstErrorStep);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(formData);
      // Limpar dados salvos após sucesso
      localStorage.removeItem('multiStepForm_data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' | 'error' => {
    if (stepIndex < currentStep) {
      const errors = stepValidation[steps[stepIndex].id];
      return errors && errors.length > 0 ? 'error' : 'completed';
    }
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const CurrentStepComponent = currentStepData.component;
  const currentErrors = stepValidation[currentStepData.id] || [];

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header com progresso */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl">
                {currentStepData.title}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {currentStepData.description}
              </p>
            </div>
            
            <div className="text-right">
              <Badge variant="outline" className="mb-2">
                Passo {currentStep + 1} de {steps.length}
              </Badge>
              {lastSaved && autoSave && (
                <p className="text-xs text-gray-500">
                  Salvo automaticamente às{' '}
                  {lastSaved.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              )}
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      {/* Steps Navigator */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              return (
                <div
                  key={step.id}
                  className="flex items-center"
                >
                  <button
                    onClick={() => goToStep(index)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : status === 'current'
                        ? 'bg-[#3C5BFA] text-white'
                        : status === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {status === 'completed' ? (
                      <Check className="h-4 w-4" />
                    ) : status === 'error' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </button>
                  
                  <div className="ml-2 text-left hidden sm:block">
                    <p className={`text-sm font-medium ${
                      status === 'current' ? 'text-[#3C5BFA]' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </p>
                    {step.optional && (
                      <Badge variant="outline" className="text-xs">
                        Opcional
                      </Badge>
                    )}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Erros do step atual */}
      {currentErrors.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 mb-2">
                  Corrija os seguintes erros para continuar:
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {currentErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conteúdo do step atual */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <CurrentStepComponent
            data={formData}
            onChange={updateFormData}
            errors={currentErrors}
          />
        </CardContent>
      </Card>

      {/* Navegação */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              {onSave && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onSave(formData);
                    setLastSaved(new Date());
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Rascunho
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceed()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting ? 'Finalizando...' : 'Finalizar'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}