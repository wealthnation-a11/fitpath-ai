
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { format } from "date-fns";

interface DailyQuoteCardProps {
  quote: string;
}

export const DailyQuoteCard = ({ quote }: DailyQuoteCardProps) => {
  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Quote className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary mb-2">Daily Motivation</h3>
            <p className="text-lg italic text-foreground leading-relaxed">
              "{quote}"
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
