import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  onStrengthChange?: (isValid: boolean) => void;
}

export function PasswordStrength({ password, onStrengthChange }: PasswordStrengthProps) {
  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    number: false
  });

  useEffect(() => {
    const newChecks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password)
    };
    
    setChecks(newChecks);
    
    const isValid = Object.values(newChecks).every(check => check);
    onStrengthChange?.(isValid);
  }, [password, onStrengthChange]);

  const getStrengthColor = () => {
    const validChecks = Object.values(checks).filter(Boolean).length;
    if (validChecks === 0) return "bg-gray-200";
    if (validChecks === 1) return "bg-red-500";
    if (validChecks === 2) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthWidth = () => {
    const validChecks = Object.values(checks).filter(Boolean).length;
    return `${(validChecks / 3) * 100}%`;
  };

  return (
    <div className="space-y-3">
      {/* Password strength bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: getStrengthWidth() }}
        />
      </div>
      
      {/* Requirements list */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600 mb-2">Must contain at least:</p>
        
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              checks.length ? "bg-green-500" : "bg-gray-300"
            }`}>
              {checks.length && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-sm ${
              checks.length ? "text-green-600" : "text-gray-500"
            }`}>
              At least 8 character
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              checks.uppercase ? "bg-green-500" : "bg-gray-300"
            }`}>
              {checks.uppercase && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-sm ${
              checks.uppercase ? "text-green-600" : "text-gray-500"
            }`}>
              At least 1 uppercase
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              checks.number ? "bg-green-500" : "bg-gray-300"
            }`}>
              {checks.number && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-sm ${
              checks.number ? "text-green-600" : "text-gray-500"
            }`}>
              At least 1 number
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}