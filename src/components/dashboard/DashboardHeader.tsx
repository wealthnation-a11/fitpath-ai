
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

interface DashboardHeaderProps {
  firstName: string;
  user: {
    name: string;
    email: string;
  };
  subscription: {
    active: boolean;
    plan?: { name: string };
    expiresAt?: string;
  };
}

export const DashboardHeader = ({ firstName, user, subscription }: DashboardHeaderProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hello {firstName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your fitness journey
        </p>
      </div>
      <div className="mt-4 md:mt-0 flex items-center gap-4">
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.email}</p>
          {subscription.active ? (
            <p className="text-xs text-muted-foreground">
              {subscription.plan?.name} (Expires: {subscription.expiresAt ? formatDate(subscription.expiresAt) : "N/A"})
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Free Plan</p>
          )}
        </div>
      </div>
    </div>
  );
};
