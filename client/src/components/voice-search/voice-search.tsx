import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Search,
  X,
  Settings,
  Languages,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface VoiceSearchProps {
  onSearchResult: (query: string, confidence: number) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  className?: string;
}

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
  };
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onspeechstart: () => void;
  onspeechend: () => void;
  onnomaych: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceSearch({
  onSearchResult,
  onError,
  placeholder = "Diga algo como 'Buscar fotógrafos em São Paulo'",
  className = ""
}: VoiceSearchProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Configurações
  const [language, setLanguage] = useState("pt-BR");
  const [continuous, setContinuous] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [enableFeedback, setEnableFeedback] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();

  // Verificar suporte do navegador
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      setupRecognition();
    } else {
      setIsSupported(false);
    }

    return () => {
      cleanup();
    };
  }, []);

  const setupRecognition = () => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      startAudioMonitoring();
      if (enableFeedback) {
        toast({
          title: "Escutando...",
          description: "Fale agora para buscar",
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setAudioLevel(0);
      stopAudioMonitoring();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < Object.keys(event.results).length; i++) {
        const result = event.results[i];
        const resultTranscript = result[0].transcript;
        const resultConfidence = result[0].confidence;

        if (result.isFinal) {
          finalTranscript += resultTranscript;
          setConfidence(resultConfidence);
          
          if (autoSubmit && finalTranscript.trim()) {
            handleSearch(finalTranscript.trim(), resultConfidence);
          }
        } else {
          interimTranscript += resultTranscript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setAudioLevel(0);
      stopAudioMonitoring();
      
      const errorMessage = getErrorMessage(event.error);
      if (onError) {
        onError(errorMessage);
      }
      toast({
        title: "Erro na busca por voz",
        description: errorMessage,
        variant: "destructive",
      });
    };

    recognition.onspeechstart = () => {
      if (enableFeedback) {
        // Feedback visual de que está detectando fala
      }
    };

    recognition.onspeechend = () => {
      if (!continuous) {
        recognition.stop();
      }
    };
  };

  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (!isListening) return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(average);
        
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
    }
  };

  const stopAudioMonitoring = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    stopAudioMonitoring();
  };

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'no-speech':
        return 'Nenhuma fala detectada. Tente falar mais próximo ao microfone.';
      case 'audio-capture':
        return 'Erro ao capturar áudio. Verifique se o microfone está conectado.';
      case 'not-allowed':
        return 'Permissão negada para usar o microfone. Verifique as configurações do navegador.';
      case 'network':
        return 'Erro de conexão. Verifique sua conexão com a internet.';
      case 'language-not-supported':
        return 'Idioma não suportado. Tente alterar o idioma nas configurações.';
      default:
        return 'Erro desconhecido na busca por voz.';
    }
  };

  const handleSearch = (query: string, confidenceLevel: number) => {
    if (query.trim()) {
      onSearchResult(query.trim(), confidenceLevel);
      setTranscript("");
      
      if (enableFeedback) {
        toast({
          title: "Busca realizada",
          description: `Buscando por: "${query}"`,
        });
      }
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current || !isSupported) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Atualizar configurações antes de iniciar
      const recognition = recognitionRef.current;
      recognition.continuous = continuous;
      recognition.lang = language;
      
      setTranscript("");
      setConfidence(0);
      recognition.start();
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setConfidence(0);
  };

  const manualSearch = () => {
    if (transcript.trim()) {
      handleSearch(transcript, confidence);
    }
  };

  // Atualizar reconhecimento quando configurações mudarem
  useEffect(() => {
    setupRecognition();
  }, [language, continuous, autoSubmit, enableFeedback]);

  if (!isSupported) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Busca por voz não é suportada neste navegador. 
          Tente usar Chrome, Edge ou Safari mais recentes.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Interface Principal */}
      <Card className="border-2 border-dashed border-gray-200 hover:border-[#3C5BFA] transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleListening}
                size="lg"
                className={`relative ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-[#3C5BFA] hover:bg-[#3C5BFA]/90'
                }`}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
                {isListening && (
                  <div className="absolute inset-0 rounded-md bg-red-500 animate-ping opacity-20"></div>
                )}
              </Button>
              
              <div>
                <h3 className="font-medium">
                  {isListening ? 'Escutando...' : 'Busca por Voz'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isListening ? 'Fale agora' : 'Clique no microfone e fale'}
                </p>
              </div>
            </div>

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurações de Voz</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                        <SelectItem value="fr-FR">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="continuous">Escuta contínua</Label>
                    <Switch
                      id="continuous"
                      checked={continuous}
                      onCheckedChange={setContinuous}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-submit">Busca automática</Label>
                    <Switch
                      id="auto-submit"
                      checked={autoSubmit}
                      onCheckedChange={setAutoSubmit}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="feedback">Feedback visual</Label>
                    <Switch
                      id="feedback"
                      checked={enableFeedback}
                      onCheckedChange={setEnableFeedback}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Visualizador de Áudio */}
          {isListening && (
            <div className="mb-4 flex items-center justify-center">
              <div className="flex items-end gap-1 h-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#3C5BFA] rounded-sm transition-all duration-100"
                    style={{
                      width: '3px',
                      height: `${Math.max(2, (audioLevel / 255) * 32 + Math.random() * 8)}px`,
                      opacity: Math.max(0.3, audioLevel / 255)
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Resultado do Reconhecimento */}
          {transcript && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={confidence > 0.8 ? "default" : confidence > 0.5 ? "secondary" : "destructive"}>
                    {confidence > 0.8 ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Alta confiança
                      </>
                    ) : confidence > 0.5 ? (
                      'Média confiança'
                    ) : (
                      'Baixa confiança'
                    )}
                  </Badge>
                  {confidence > 0 && (
                    <span className="text-xs text-gray-500">
                      {Math.round(confidence * 100)}%
                    </span>
                  )}
                </div>
                
                <Button variant="ghost" size="sm" onClick={clearTranscript}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">
                  "{transcript}"
                </p>
              </div>
              
              {!autoSubmit && transcript.trim() && (
                <Button onClick={manualSearch} size="sm" className="w-full">
                  <Search className="h-3 w-3 mr-2" />
                  Buscar
                </Button>
              )}
            </div>
          )}

          {/* Placeholder quando não está ouvindo */}
          {!isListening && !transcript && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">{placeholder}</p>
              <div className="mt-2 flex justify-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Languages className="h-3 w-3 mr-1" />
                  {language === 'pt-BR' ? 'Português' : 
                   language === 'en-US' ? 'English' : 
                   language === 'es-ES' ? 'Español' : 'Français'}
                </Badge>
                {continuous && (
                  <Badge variant="outline" className="text-xs">
                    Contínuo
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dicas de Uso */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">Dicas para melhor resultado:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Fale de forma clara e pausada</li>
            <li>• Use comandos como "Buscar", "Encontrar", "Mostrar"</li>
            <li>• Exemplo: "Buscar fotógrafos de casamento em São Paulo"</li>
            <li>• Mantenha o ambiente silencioso</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}