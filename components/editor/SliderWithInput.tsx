"use client";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SliderWithInputProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function SliderWithInput({
  id,
  label,
  value,
  min,
  max,
  step,
  disabled = false,
  onChange,
}: SliderWithInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  // Simple numeric display for input
  const inputValue = step < 1 ? value.toFixed(2) : value.toString();

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-xs font-medium text-foreground/80">
          {label}
        </Label>
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          className="h-7 w-20 text-xs text-right tabular-nums px-2"
        />
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        disabled={disabled}
        className="cursor-pointer"
      />
    </div>
  );
}
