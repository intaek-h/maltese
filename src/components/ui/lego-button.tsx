/**
 * https://uiverse.io/cssbuttons-io/plastic-mule-29
 */

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2Icon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const legoButtonVariants = cva(
  'relative z-[1] inline-flex cursor-pointer items-center justify-center border-0 px-6 py-[0.8rem] text-lg font-black tracking-[1px] uppercase no-underline transition-all duration-[0.7s] ease-[cubic-bezier(0,0.8,0.26,0.99)] select-none text-shadow-lego before:pointer-events-none before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:transition-[0.7s] before:duration-[cubic-bezier(0,0.8,0.26,0.99)] before:content-[""] after:pointer-events-none after:absolute after:top-0 after:left-0 after:block after:h-full after:w-full after:shadow-[0_4px_0_0_rgb(0_0_0_/_15%)] after:transition-[0.7s] after:duration-[cubic-bezier(0,0.8,0.26,0.99)] after:content-[""] hover:after:shadow-[0_4px_0_0_rgb(0_0_0_/_15%)] active:translate-y-1 active:after:shadow-[0_0px_0_0_rgb(0_0_0_/_15%)] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none aria-disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          "bg-[#008542] text-white before:bg-[#008542] before:shadow-[0_-4px_rgb(21_108_0_/_50%)_inset,0_4px_rgb(100_253_31_/_99%)_inset,-4px_0_rgb(100_253_31_/_50%)_inset,4px_0_rgb(21_108_0_/_50%)_inset] hover:before:shadow-[0_-4px_rgb(0_0_0_/_50%)_inset,0_4px_rgb(255_255_255_/_20%)_inset,-4px_0_rgb(255_255_255_/_20%)_inset,4px_0_rgb(0_0_0_/_50%)_inset] disabled:bg-neutral-400 disabled:text-white/80 disabled:before:bg-neutral-400 disabled:before:shadow-[0_-4px_rgb(120_120_120_/_50%)_inset,0_4px_rgb(255_255_255_/_70%)_inset,-4px_0_rgb(200_200_200_/_50%)_inset,4px_0_rgb(120_120_120_/_50%)_inset] disabled:after:shadow-[0_4px_0_0_rgb(0_0_0_/_10%)] aria-disabled:bg-neutral-400 aria-disabled:text-white/80 aria-disabled:before:bg-neutral-400 aria-disabled:before:shadow-[0_-4px_rgb(120_120_120_/_50%)_inset,0_4px_rgb(255_255_255_/_70%)_inset,-4px_0_rgb(200_200_200_/_50%)_inset,4px_0_rgb(120_120_120_/_50%)_inset] aria-disabled:after:shadow-[0_4px_0_0_rgb(0_0_0_/_10%)]",
        secondary:
          "bg-white text-black before:bg-white before:shadow-[0_-4px_rgb(220_220_220_/_80%)_inset,0_4px_rgb(255_255_255_/_99%)_inset,-4px_0_rgb(255_255_255_/_80%)_inset,4px_0_rgb(220_220_220_/_80%)_inset] hover:before:shadow-[0_-4px_rgb(0_0_0_/_20%)_inset,0_4px_rgb(255_255_255_/_80%)_inset,-4px_0_rgb(255_255_255_/_80%)_inset,4px_0_rgb(0_0_0_/_20%)_inset] disabled:bg-neutral-200 disabled:text-neutral-500 disabled:before:bg-neutral-200 disabled:before:shadow-[0_-4px_rgb(180_180_180_/_60%)_inset,0_4px_rgb(255_255_255_/_80%)_inset,-4px_0_rgb(230_230_230_/_60%)_inset,4px_0_rgb(180_180_180_/_60%)_inset] disabled:after:shadow-[0_4px_0_0_rgb(0_0_0_/_8%)] aria-disabled:bg-neutral-200 aria-disabled:text-neutral-500 aria-disabled:before:bg-neutral-200 aria-disabled:before:shadow-[0_-4px_rgb(180_180_180_/_60%)_inset,0_4px_rgb(255_255_255_/_80%)_inset,-4px_0_rgb(230_230_230_/_60%)_inset,4px_0_rgb(180_180_180_/_60%)_inset] aria-disabled:after:shadow-[0_4px_0_0_rgb(0_0_0_/_8%)]",
        orange:
          "bg-[#f97316] text-white before:bg-[#f97316] before:shadow-[0_-4px_rgb(180_52_3_/_50%)_inset,0_4px_rgb(255_220_180_/_99%)_inset,-4px_0_rgb(255_220_180_/_50%)_inset,4px_0_rgb(180_52_3_/_50%)_inset] hover:before:shadow-[0_-4px_rgb(0_0_0_/_50%)_inset,0_4px_rgb(255_255_255_/_20%)_inset,-4px_0_rgb(255_255_255_/_20%)_inset,4px_0_rgb(0_0_0_/_50%)_inset] disabled:bg-neutral-400 disabled:text-white/80 disabled:before:bg-neutral-400 disabled:before:shadow-[0_-4px_rgb(120_120_120_/_50%)_inset,0_4px_rgb(255_255_255_/_70%)_inset,-4px_0_rgb(200_200_200_/_50%)_inset,4px_0_rgb(120_120_120_/_50%)_inset] disabled:after:shadow-[0_4px_0_0_rgb(0_0_0_/_10%)] aria-disabled:bg-neutral-400 aria-disabled:text-white/80 aria-disabled:before:bg-neutral-400 aria-disabled:before:shadow-[0_-4px_rgb(120_120_120_/_50%)_inset,0_4px_rgb(255_255_255_/_70%)_inset,-4px_0_rgb(200_200_200_/_50%)_inset,4px_0_rgb(120_120_120_/_50%)_inset] aria-disabled:after:shadow-[0_4px_0_0_rgb(0_0_0_/_10%)]",
      },
      shape: {
        default: "",
        circle:
          "rounded-full p-0 w-14 h-14 before:rounded-full after:rounded-full",
      },
      loading: {
        true: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "default",
    },
  },
);

export default function LegoButton({
  className,
  variant,
  shape,
  asChild = false,
  style,
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof legoButtonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(legoButtonVariants({ variant, className, loading, shape }))}
      disabled={disabled || loading}
      style={{ whiteSpace: "unset", ...(style ?? {}) }}
      {...props}
    >
      {loading && (
        <Loader2Icon
          className={
            "text-muted-foreground absolute animate-spin invert loading"
          }
        />
      )}
      {children}
    </Comp>
  );
}
