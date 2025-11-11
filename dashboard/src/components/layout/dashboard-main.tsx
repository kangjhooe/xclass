"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function DashboardMain({ children }: { children: ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
    >
      {children}
    </motion.main>
  );
}

