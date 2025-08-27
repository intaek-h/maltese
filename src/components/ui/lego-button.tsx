/**
 * https://uiverse.io/cssbuttons-io/plastic-mule-29
 */

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const legoButtonVariants = cva(
  'relative z-[1] inline-flex cursor-pointer items-center justify-center border-0 px-6 py-[0.8rem] text-lg font-black tracking-[1px] uppercase no-underline transition-all duration-[0.7s] ease-[cubic-bezier(0,0.8,0.26,0.99)] select-none text-shadow-lego before:pointer-events-none before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:transition-[0.7s] before:duration-[cubic-bezier(0,0.8,0.26,0.99)] before:content-[""] after:pointer-events-none after:absolute after:top-0 after:left-0 after:block after:h-full after:w-full after:shadow-[0_4px_0_0_rgb(0_0_0_/_15%)] after:transition-[0.7s] after:duration-[cubic-bezier(0,0.8,0.26,0.99)] after:content-[""] hover:after:shadow-[0_4px_0_0_rgb(0_0_0_/_15%)] active:translate-y-1 active:after:shadow-[0_0px_0_0_rgb(0_0_0_/_15%)]',
  {
    variants: {
      variant: {
        primary:
          "bg-[#008542] text-white before:bg-[#008542] before:shadow-[0_-4px_rgb(21_108_0_/_50%)_inset,0_4px_rgb(100_253_31_/_99%)_inset,-4px_0_rgb(100_253_31_/_50%)_inset,4px_0_rgb(21_108_0_/_50%)_inset] hover:before:shadow-[0_-4px_rgb(0_0_0_/_50%)_inset,0_4px_rgb(255_255_255_/_20%)_inset,-4px_0_rgb(255_255_255_/_20%)_inset,4px_0_rgb(0_0_0_/_50%)_inset]",
        secondary:
          "bg-white text-black before:bg-white before:shadow-[0_-4px_rgb(220_220_220_/_80%)_inset,0_4px_rgb(255_255_255_/_99%)_inset,-4px_0_rgb(255_255_255_/_80%)_inset,4px_0_rgb(220_220_220_/_80%)_inset] hover:before:shadow-[0_-4px_rgb(0_0_0_/_20%)_inset,0_4px_rgb(255_255_255_/_80%)_inset,-4px_0_rgb(255_255_255_/_80%)_inset,4px_0_rgb(0_0_0_/_20%)_inset]",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export default function LegoButton({
  className,
  variant,
  asChild = false,
  style,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof legoButtonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(legoButtonVariants({ variant, className }))}
      style={{ whiteSpace: "unset", ...(style ?? {}) }}
      {...props}
    >
      {children}
    </Comp>
  );
}
