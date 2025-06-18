import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trendColor?: string;
  isLoading?: boolean;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  iconColor = "text-gray-600",
  iconBg = "bg-gray-100",
  trendColor = "text-gray-600",
  isLoading = false,
  className
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className="card-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          {trend && (
            <div className="mt-4">
              <Skeleton className="h-4 w-20" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const isPositiveTrend = trend?.includes('+') || trend?.includes('improved');
  const isNegativeTrend = trend?.includes('-') && !trend?.includes('improved');

  return (
    <Card className={cn("card-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
          <div className={cn("p-3 rounded-full", iconBg)}>
            <Icon className={cn("text-xl", iconColor)} size={24} />
          </div>
        </div>
        {trend && (
          <div className="mt-4">
            <div className={cn("flex items-center text-sm", trendColor)}>
              {isPositiveTrend ? (
                <TrendingUp className="mr-1" size={16} />
              ) : isNegativeTrend ? (
                <TrendingDown className="mr-1" size={16} />
              ) : null}
              <span>{trend}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
