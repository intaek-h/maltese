/**
 * https://uiverse.io/cssbuttons-io/plastic-mule-29
 */
export default function MinecraftButton({ children, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className={`relative z-[1] inline-flex cursor-pointer items-center justify-center border-0 bg-[#008542] px-6 py-[0.8rem] text-lg font-black tracking-[1px] text-white uppercase no-underline transition-all duration-[0.7s] ease-[cubic-bezier(0,0.8,0.26,0.99)] select-none text-shadow-[0_2px_0_rgb(0_0_0_/_25%)] before:pointer-events-none before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-[#008542] before:shadow-[0_-4px_rgb(21_108_0_/_50%)_inset,0_4px_rgb(100_253_31_/_99%)_inset,-4px_0_rgb(100_253_31_/_50%)_inset,4px_0_rgb(21_108_0_/_50%)_inset] before:transition-[0.7s] before:duration-[cubic-bezier(0,0.8,0.26,0.99)] before:content-[""] after:pointer-events-none after:absolute after:top-0 after:left-0 after:block after:h-full after:w-full after:shadow-[0_4px_0_0_rgb(0_0_0_/_15%)] after:transition-[0.7s] after:duration-[cubic-bezier(0,0.8,0.26,0.99)] after:content-[""] hover:before:shadow-[0_-4px_rgb(0_0_0_/_50%)_inset,0_4px_rgb(255_255_255_/_20%)_inset,-4px_0_rgb(255_255_255_/_20%)_inset,4px_0_rgb(0_0_0_/_50%)_inset] hover:after:shadow-[0_4px_0_0_rgb(0_0_0_/_15%)] active:translate-y-1 active:after:shadow-[0_0px_0_0_rgb(0_0_0_/_15%)]`}
      style={{
        whiteSpace: 'unset',
      }}
      {...props}
    >
      {children}
    </button>
  )
}
