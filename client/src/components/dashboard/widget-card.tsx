import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye,
  EyeOff,
  Move,
  X
} from "lucide-react";

interface WidgetData {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    percentage?: number;
  };
  chart?: {
    type: 'line' | 'bar' | 'doughnut';
    data: any[];
  };
  color?: string;
  icon?: React.ComponentType<any>;
}

interface WidgetCardProps {
  widget: WidgetData;
  onRemove?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export default function WidgetCard({ 
  widget, 
  onRemove, 
  onToggleVisibility,
  isDragging = false,
  dragHandleProps 
}: WidgetCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderChart = () => {
    if (!widget.chart) return null;

    const { type, data } = widget.chart;

    switch (type) {
      case 'line':
        return (
          <div className="h-16 flex items-end justify-between gap-1 mt-4">
            {data.map((point, index) => (
              <div
                key={index}
                className="bg-[#3C5BFA] opacity-70 w-2 rounded-t"
                style={{ height: `${(point.value / Math.max(...data.map(d => d.value))) * 100}%` }}
              />
            ))}
          </div>
        );
      case 'bar':
        return (
          <div className="h-16 flex items-end justify-between gap-1 mt-4">
            {data.slice(0, 8).map((bar, index) => (
              <div
                key={index}
                className="bg-gradient-to-t from-[#3C5BFA] to-[#6B7FFC] w-3 rounded-t"
                style={{ height: `${(bar.value / Math.max(...data.map(d => d.value))) * 100}%` }}
              />
            ))}
          </div>
        );
      case 'doughnut':
        return (
          <div className="flex justify-center mt-4">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3C5BFA"
                  strokeWidth="3"
                  strokeDasharray={`${data[0]?.percentage || 75}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-700">
                  {data[0]?.percentage || 75}%
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card 
      className={`relative transition-all duration-200 ${
        isDragging ? 'shadow-lg rotate-2 scale-105' : 'hover:shadow-md'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      {isHovered && (
        <div 
          {...dragHandleProps}
          className="absolute top-2 left-2 cursor-move opacity-60 hover:opacity-100"
        >
          <Move className="h-4 w-4 text-gray-400" />
        </div>
      )}

      {/* Widget Menu */}
      {isHovered && (
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleVisibility?.(widget.id)}>
                <EyeOff className="mr-2 h-4 w-4" />
                Ocultar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onRemove?.(widget.id)}
                className="text-red-600"
              >
                <X className="mr-2 h-4 w-4" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {widget.icon && (
            <div className={`p-2 rounded-lg ${widget.color || 'bg-blue-50'}`}>
              <widget.icon className={`h-4 w-4 ${widget.color?.includes('blue') ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-sm font-medium text-gray-700">
              {widget.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {typeof widget.value === 'number' 
              ? widget.value.toLocaleString('pt-BR') 
              : widget.value
            }
          </span>
          {widget.trend && (
            <div className="flex items-center gap-1">
              {getTrendIcon(widget.trend.direction)}
              <span className={`text-sm font-medium ${getTrendColor(widget.trend.direction)}`}>
                {widget.trend.value}
              </span>
            </div>
          )}
        </div>

        {widget.subtitle && (
          <p className="text-sm text-gray-500 mt-1">
            {widget.subtitle}
          </p>
        )}

        {renderChart()}
      </CardContent>
    </Card>
  );
}