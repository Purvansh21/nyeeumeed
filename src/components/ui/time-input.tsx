
import React from "react";
import { Input } from "@/components/ui/input";

interface TimeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
}

export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, id, ...props }, ref) => {
    return (
      <Input
        type="time"
        id={id}
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);

TimeInput.displayName = "TimeInput";
