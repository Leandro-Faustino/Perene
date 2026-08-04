"use client";

import { ThemeProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ProvedorDeTema({
  children,
  ...props
}: ComponentProps<typeof ThemeProvider>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </ThemeProvider>
  );
}
