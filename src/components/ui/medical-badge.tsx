import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        destructive: "bg-destructive/10 text-destructive",
        info: "bg-info/10 text-info",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-foreground",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface MedicalBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

export function MedicalBadge({
  className,
  variant,
  size,
  pulse = false,
  children,
  ...props
}: MedicalBadgeProps) {
  return (
    <span
      className={cn(
        badgeVariants({ variant, size }),
        pulse && "animate-pulse",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Status-specific badges
export function StatusBadge({ status }: { status: "upcoming" | "completed" | "cancelled" | "pending" | "in-progress" }) {
  const config = {
    upcoming: { variant: "info" as const, label: "Upcoming" },
    completed: { variant: "success" as const, label: "Completed" },
    cancelled: { variant: "destructive" as const, label: "Cancelled" },
    pending: { variant: "warning" as const, label: "Pending" },
    "in-progress": { variant: "default" as const, label: "In Progress" },
  };

  const { variant, label } = config[status];

  return <MedicalBadge variant={variant}>{label}</MedicalBadge>;
}

// Lab result badges
export function LabResultBadge({ status }: { status: "normal" | "high" | "low" | "critical" }) {
  const config = {
    normal: { variant: "success" as const, label: "Normal" },
    high: { variant: "warning" as const, label: "High" },
    low: { variant: "warning" as const, label: "Low" },
    critical: { variant: "destructive" as const, label: "Critical", pulse: true },
  };

  const { variant, label, pulse } = config[status] as { variant: "success" | "warning" | "destructive"; label: string; pulse?: boolean };

  return <MedicalBadge variant={variant} pulse={pulse}>{label}</MedicalBadge>;
}
