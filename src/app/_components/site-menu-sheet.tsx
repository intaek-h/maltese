import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { XIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteMenuSheet({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent side="left" className="gap-0">
        <div className="bg-[#f97316] h-full">
          <VisuallyHidden>
            <SheetHeader>
              <SheetTitle>자주 물었으면 하는 질문</SheetTitle>
              <SheetDescription></SheetDescription>
            </SheetHeader>
          </VisuallyHidden>

          <SheetClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
            <XIcon className="size-6" color={"white"} />
            <span className="sr-only">닫기</span>
          </SheetClose>

          <div>
            <Content />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Content() {
  return (
    <div className="p-4">
      <div className="h-20"></div>
      <p className="text-2xl font-bold underline underline-offset-2 text-background text-shadow-lego">
        자주 물었으면 하는 질문
      </p>

      <div className="mt-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="1">
            <AccordionTrigger className="">
              후원금이 필요하신가요?
            </AccordionTrigger>
            <AccordionContent>하하하. 말씀만으로 충분합니다.</AccordionContent>
          </AccordionItem>

          <AccordionItem value="2">
            <AccordionTrigger className="">
              왜 제출한 말장난이 바로 등록되지 않나요?
            </AccordionTrigger>
            <AccordionContent>
              아이들도 방문할 수 있으니 부적절한 표현이 노출되지 않도록 검수하고
              있습니다.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="3">
            <AccordionTrigger className="">
              제작자는 말티즈를 좋아하나요?
            </AccordionTrigger>
            <AccordionContent>
              아니요? 저는 진도개를 좋아합니다.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="4">
            <AccordionTrigger className="">
              붐업을 누르면 어떻게 되나요?
            </AccordionTrigger>
            <AccordionContent>
              말티즈의 체력이 높아집니다. 체력이 낮은 말티즈는 시간이 지나며
              사라지게 됩니다.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="5">
            <AccordionTrigger className="">
              이 사이트는 오픈소스인가요?
            </AccordionTrigger>
            <AccordionContent>
              네. 코드를 복사해서 나만의 사이트를 만들어보세요.
              <div>
                <a
                  className="underline underline-offset-2 text-blue-800"
                  href="https://github.com/intaek-h/maltese"
                  target="_blank"
                  rel="noopener"
                >
                  https://github.com/intaek-h/maltese
                </a>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
