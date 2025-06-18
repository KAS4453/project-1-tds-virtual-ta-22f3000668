import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "active" | "inactive" | "warning" | "error" | "healthy" | "pending";
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}

export default function StatusIndicator({ 
  status, 
  size = "sm", 
  className,
  animate = true 
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  const statusClasses = {
    active: "bg-green-500",
    healthy: "bg-blue-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    inactive: "bg-gray-400",
    pending: "bg-orange-500"
  };

  const shouldAnimate = animate && (status === "active" || status === "pending");

  return (
    <div 
      className={cn(
        "rounded-full",
        sizeClasses[size],
        statusClasses[status],
        shouldAnimate && "animate-pulse",
        className
      )}
    />
  );
}
