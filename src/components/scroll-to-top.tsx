"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed right-6 bottom-6 z-50 transition-all duration-300",
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToTop}
        className="border-border bg-card/80 text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground h-12 w-12 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Wróć na górę strony"
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
    </div>
  );
}
