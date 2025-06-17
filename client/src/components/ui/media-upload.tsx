import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image, Video, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
  uploaded?: boolean;
}

interface MediaUploadProps {
  maxFiles?: number;
  acceptedTypes?: string[];
  onFilesChange?: (files: MediaFile[]) => void;
  value?: MediaFile[];
  disabled?: boolean;
}

export default function MediaUpload({ 
  maxFiles = 10, 
  acceptedTypes = ['image/*', 'video/*'],
  onFilesChange,
  value = [],
  disabled = false 
}: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>(value);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: MediaFile[] = [];
    const currentCount = files.length;

    for (let i = 0; i < selectedFiles.length && (currentCount + newFiles.length) < maxFiles; i++) {
      const file = selectedFiles[i];
      
      // Validate file type
      if (!acceptedTypes.some(type => file.type.match(type.replace('*', '.*')))) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: `${file.name} não é um tipo de arquivo válido`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de 50MB`,
          variant: "destructive",
        });
        continue;
      }

      const mediaFile: MediaFile = {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
      };

      newFiles.push(mediaFile);
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);

      toast({
        title: "Arquivos adicionados",
        description: `${newFiles.length} arquivo(s) adicionado(s) com sucesso`,
      });
    }

    if (currentCount + newFiles.length >= maxFiles) {
      toast({
        title: "Limite atingido",
        description: `Máximo de ${maxFiles} arquivos permitidos`,
        variant: "destructive",
      });
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);

    // Revoke object URL to free memory
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging 
            ? 'border-[#3C5BFA] bg-[#3C5BFA]/5' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Adicionar Mídias
          </h3>
          <p className="text-gray-500 mb-4">
            Arraste e solte arquivos aqui ou clique para selecionar
          </p>
          <div className="text-sm text-gray-400 space-y-1">
            <p>Máximo {maxFiles} arquivos • Até 50MB cada</p>
            <p>Formatos: JPG, PNG, MP4, MOV</p>
            <p>{files.length}/{maxFiles} arquivos carregados</p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Arquivos Selecionados</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="relative overflow-hidden">
                <CardContent className="p-0">
                  {file.type === 'image' ? (
                    <div className="aspect-video bg-gray-100 relative">
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
                      <Video className="h-12 w-12 text-white" />
                      <video
                        src={file.preview}
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                        muted
                      />
                    </div>
                  )}
                  
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getFileIcon(file.file.type)}
                          <span className="text-sm font-medium truncate">
                            {file.file.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {file.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(file.file.size)}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={disabled}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}