import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image, Video, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
  id: string;
  file: File;
  url: string;
  type: 'image' | 'video';
}

interface MediaUploadProps {
  onMediaChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  initialMedia?: MediaFile[];
  className?: string;
}

export function MediaUpload({ 
  onMediaChange, 
  maxFiles = 10, 
  initialMedia = [], 
  className = "" 
}: MediaUploadProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(initialMedia);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const acceptedTypes = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'video/*': ['.mp4', '.webm', '.ogg', '.mov']
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (mediaFiles.length + files.length > maxFiles) {
      toast({
        title: "Limite excedido",
        description: `Você pode enviar no máximo ${maxFiles} arquivos`,
        variant: "destructive",
      });
      return;
    }

    const newMediaFiles: MediaFile[] = [];

    files.forEach((file) => {
      // Validar tipo de arquivo
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: `${file.name} não é um arquivo de imagem ou vídeo válido`,
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho (máximo 50MB para vídeos, 10MB para imagens)
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        const sizeLimitText = isVideo ? '50MB' : '10MB';
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de ${sizeLimitText}`,
          variant: "destructive",
        });
        return;
      }

      const mediaFile: MediaFile = {
        id: Date.now() + Math.random().toString(),
        file,
        url: URL.createObjectURL(file),
        type: isImage ? 'image' : 'video'
      };

      newMediaFiles.push(mediaFile);
    });

    const updatedFiles = [...mediaFiles, ...newMediaFiles];
    setMediaFiles(updatedFiles);
    onMediaChange(updatedFiles);

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = mediaFiles.filter(file => {
      if (file.id === id) {
        URL.revokeObjectURL(file.url);
        return false;
      }
      return true;
    });
    
    setMediaFiles(updatedFiles);
    onMediaChange(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Adicionar fotos e vídeos
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Clique aqui ou arraste arquivos para enviar
        </p>
        <p className="text-xs text-gray-400">
          Máximo {maxFiles} arquivos • Imagens até 10MB • Vídeos até 50MB
        </p>
        <Button 
          type="button" 
          variant="outline" 
          className="mt-4"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <Upload className="w-4 h-4 mr-2" />
          Escolher arquivos
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Media Preview Grid */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaFiles.map((media) => (
            <Card key={media.id} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <Video className="w-8 h-8 text-white" />
                      <video
                        src={media.url}
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                        muted
                      />
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(media.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>

                  {/* File type indicator */}
                  <div className="absolute bottom-1 left-1">
                    {media.type === 'image' ? (
                      <FileImage className="w-4 h-4 text-white drop-shadow" />
                    ) : (
                      <Video className="w-4 h-4 text-white drop-shadow" />
                    )}
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-xs text-gray-600 truncate">
                    {media.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(media.file.size)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* File count indicator */}
      <div className="text-sm text-gray-500 text-center">
        {mediaFiles.length} de {maxFiles} arquivos enviados
      </div>
    </div>
  );
}