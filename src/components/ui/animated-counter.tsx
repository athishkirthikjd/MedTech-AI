import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) =>
    `${prefix}${current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${suffix}`
  );

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      spring.set(value);
    }
  }, [spring, value, isVisible]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}

// Simple number counter for stats
interface StatCounterProps {
  end: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function StatCounter({ end, label, prefix, suffix, decimals = 0 }: StatCounterProps) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-foreground">
        <AnimatedCounter value={end} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
