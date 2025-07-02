
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlanDurationSelectorProps {
  selectedDuration: "30" | "180" | "365";
  onChange: (duration: "30" | "180" | "365") => void;
}

export const PlanDurationSelector = ({ 
  selectedDuration, 
  onChange 
}: PlanDurationSelectorProps) => {
  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case "30":
        return "Month";
      case "180":
        return "6 Months";
      case "365":
        return "Year";
      default:
        return "Month";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Duration</CardTitle>
        <CardDescription>
          Select how long you want your fitness plan to cover
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["30", "180", "365"].map((duration) => (
            <div key={duration}>
              <Label
                htmlFor={`duration-${duration}`}
                className="cursor-pointer"
              >
                <div
                  className={`p-4 border rounded-lg text-center hover:border-primary transition-colors ${
                    selectedDuration === duration
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                >
                  <span className="block text-2xl font-bold mb-1">
                    {getDurationLabel(duration)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {duration === "30" ? "30 Days" : duration === "180" ? "6 Months" : "1 Year"}
                  </span>
                </div>
              </Label>
              <input
                type="radio"
                id={`duration-${duration}`}
                value={duration}
                checked={selectedDuration === duration}
                onChange={(e) =>
                  onChange(e.target.value as "30" | "180" | "365")
                }
                className="sr-only"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
