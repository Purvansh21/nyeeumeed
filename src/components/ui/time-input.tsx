
import React from "react";
import { Input } from "./input";

export interface TimeInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
}

export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, id, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        id={id}
        type="time"
        className={className}
        {...props}
      />
    );
  }
);

TimeInput.displayName = "TimeInput";
