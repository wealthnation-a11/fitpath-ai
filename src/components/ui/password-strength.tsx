
import * as React from "react";
import { cn } from "@/lib/utils";

export interface PasswordStrengthProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function PasswordStrength({ value, className, ...props }: PasswordStrengthProps) {
  const [strength, setStrength] = React.useState(0);
  const [feedback, setFeedback] = React.useState("");

  React.useEffect(() => {
    let calculatedStrength = 0;
    const criteria = [
      { regex: /.{8,}/, message: "At least 8 characters" },
      { regex: /[A-Z]/, message: "At least 1 uppercase letter" },
      { regex: /[0-9]/, message: "At least 1 number" },
      { regex: /[^A-Za-z0-9]/, message: "At least 1 special character" },
    ];

    let missingCriteria: string[] = [];

    criteria.forEach((criterion) => {
      if (criterion.regex.test(value)) {
        calculatedStrength += 1;
      } else {
        missingCriteria.push(criterion.message);
      }
    });

    setStrength(calculatedStrength);
    setFeedback(missingCriteria.length > 0 ? missingCriteria.join(", ") : "Strong password");
  }, [value]);

  const getStrengthLabel = () => {
    if (value.length === 0) return "";
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (value.length === 0) return "bg-gray-200";
    if (strength === 0) return "bg-red-500";
    if (strength === 1) return "bg-orange-500";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", getStrengthColor())}
          style={{ width: `${value.length ? (strength / 4) * 100 : 0}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <p className={cn("text-muted-foreground", value.length > 0 && "text-foreground")}>
          {getStrengthLabel()}
        </p>
        <p className="text-muted-foreground">{feedback}</p>
      </div>
    </div>
  );
}
