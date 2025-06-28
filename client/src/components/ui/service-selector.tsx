import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from './form';

const SERVICE_CATEGORIES = {
  "entretenimento": [
    "DJ", "Banda", "Cantor", "Animação", "Karaokê", "Show", "Dança"
  ],
  "alimentacao": [
    "Buffet", "Chef", "Bartender", "Confeitaria", "Catering", "Food Truck"
  ],
  "organizacao": [
    "Cerimonial", "Wedding Planner", "Coordenação", "Assessoria"
  ],
  "producao": [
    "Foto/Vídeo", "Som/Luz", "Decoração", "Floricultura", "Cenografia", "Iluminação"
  ],
  "limpeza": [
    "Limpeza pré-evento", "Limpeza pós-evento", "Organização", "Manutenção"
  ]
};

const MUSICAL_GENRES = [
  "Sertanejo", "Funk", "Rock", "Pop", "MPB", "Forró", "Pagode", "Samba", 
  "Axé", "Reggae", "Eletrônica", "Hip Hop", "Jazz", "Blues", "Gospel", 
  "Clássica", "Bossa Nova", "Indie", "Country", "Reggaeton"
];

interface ServiceSelectorProps {
  control?: any;
  category?: string;
  subcategory?: string;
  musicalGenre?: string;
  onCategoryChange?: (category: string) => void;
  onSubcategoryChange?: (subcategory: string) => void;
  onMusicalGenreChange?: (genre: string) => void;
  useFormField?: boolean;
  className?: string;
}

export function ServiceSelector({
  control,
  category = "",
  subcategory = "",
  musicalGenre = "",
  onCategoryChange,
  onSubcategoryChange,
  onMusicalGenreChange,
  useFormField = false,
  className = ""
}: ServiceSelectorProps) {
  
  // Render com FormField (para uso em formulários com react-hook-form)
  if (useFormField && control) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria *</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={(value) => {
                    field.onChange(value);
                    onCategoryChange?.(value);
                    // Reset subcategory e musical genre quando categoria muda
                    control.setValue?.("subcategory", "");
                    control.setValue?.("musicalGenre", "");
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(SERVICE_CATEGORIES).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {category && (
            <FormField
              control={control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategoria</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={(value) => {
                      field.onChange(value);
                      onSubcategoryChange?.(value);
                      // Reset musical genre quando subcategoria muda
                      control.setValue?.("musicalGenre", "");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma subcategoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SERVICE_CATEGORIES[category as keyof typeof SERVICE_CATEGORIES]?.map((subcat) => (
                        <SelectItem key={subcat} value={subcat}>
                          {subcat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {category === 'entretenimento' && subcategory === 'Cantor' && (
          <FormField
            control={control}
            name="musicalGenre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gênero Musical</FormLabel>
                <Select value={field.value} onValueChange={(value) => {
                  field.onChange(value);
                  onMusicalGenreChange?.(value);
                }}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um gênero musical" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MUSICAL_GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    );
  }

  // Render sem FormField (para uso independente)
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoria *</Label>
          <Select 
            value={category} 
            onValueChange={(value) => {
              onCategoryChange?.(value);
              onSubcategoryChange?.(""); // Reset subcategory
              onMusicalGenreChange?.(""); // Reset musical genre
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(SERVICE_CATEGORIES).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {category && (
          <div className="space-y-2">
            <Label>Subcategoria</Label>
            <Select 
              value={subcategory} 
              onValueChange={(value) => {
                onSubcategoryChange?.(value);
                onMusicalGenreChange?.(""); // Reset musical genre
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma subcategoria" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES[category as keyof typeof SERVICE_CATEGORIES]?.map((subcat) => (
                  <SelectItem key={subcat} value={subcat}>
                    {subcat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {category === 'entretenimento' && subcategory === 'Cantor' && (
        <div className="space-y-2">
          <Label>Gênero Musical</Label>
          <Select value={musicalGenre} onValueChange={onMusicalGenreChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um gênero musical" />
            </SelectTrigger>
            <SelectContent>
              {MUSICAL_GENRES.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export { SERVICE_CATEGORIES, MUSICAL_GENRES }; 