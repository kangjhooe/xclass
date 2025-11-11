"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FormCardProps = {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function FormCard({ title, description, children, footer }: FormCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="border-border/60 shadow-lg shadow-black/5">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="space-y-6">
          {children}
          {footer ? <div className="text-sm text-muted-foreground">{footer}</div> : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

