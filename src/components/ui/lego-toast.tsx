import { type ExternalToast, toast } from "sonner";
import LegoButton from "@/components/ui/lego-button";

export function LegoToast(props: ToastProps) {
  const { title, description, button, id } = props;

  return (
    <output
      className="relative z-[1] inline-flex  w-full items-center gap-4 border-0 px-4 py-3 text-base font-black tracking-[0.5px] no-underline transition-all duration-[0.7s] ease-[cubic-bezier(0,0.8,0.26,0.99)] select-none bg-[#f97316] text-white before:pointer-events-none before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:transition-[0.7s] before:duration-[cubic-bezier(0,0.8,0.26,0.99)] before:content-[''] before:bg-[#f97316] before:shadow-[0_-4px_rgb(180_52_3_/_50%)_inset,0_4px_rgb(255_220_180_/_99%)_inset,-4px_0_rgb(255_220_180_/_50%)_inset,4px_0_rgb(180_52_3_/_50%)_inset] after:pointer-events-none after:absolute after:top-0 after:left-0 after:block after:h-full after:w-full after:shadow-[0_4px_0_0_rgb(0_0_0_/_15%)] after:transition-[0.7s] after:duration-[cubic-bezier(0,0.8,0.26,0.99)] after:content-[''] hover:after:shadow-[0_4px_0_0_rgb(0_0_0_/_15%)] active:translate-y-1 active:after:shadow-[0_0px_0_0_rgb(0_0_0_/_15%)]"
      aria-live="polite"
    >
      <div className="items-center flex-1">
        <div>
          <p className="text-sm font-semibold text-white text-shadow-lego">
            {title}
          </p>
          {description ? (
            <p className="mt-1 text-xs text-white/80">{description}</p>
          ) : null}
        </div>
      </div>

      <div className="shrink-0">
        <LegoButton
          variant="secondary"
          className="px-3 py-1 text-sm"
          onClick={() => {
            button?.onClick();
            toast.dismiss(id);
          }}
          type="button"
        >
          {button?.label || "닫기"}
        </LegoButton>
      </div>
    </output>
  );
}

export function customToast(
  options: Omit<ToastProps, "id">,
  data?: ExternalToast,
) {
  return toast.custom(
    (id) => (
      <LegoToast
        id={id}
        title={options.title}
        description={options.description}
        button={
          options.button
            ? {
                label: options.button.label,
                onClick: options.button.onClick,
              }
            : undefined
        }
      />
    ),
    {
      duration: Infinity,
      dismissible: false,
      ...data,
    },
  );
}

interface ToastProps {
  id: string | number;
  title: string;
  description?: string;
  button?: {
    label: string;
    onClick: () => void;
  };
}
