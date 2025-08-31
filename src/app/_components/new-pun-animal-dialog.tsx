"use client";

import type { FunctionReturnType } from "convex/server";
import type {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType,
} from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { useAtom } from "jotai";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LegoButton from "@/components/ui/lego-button";
import { animalId } from "@/store/pun";
import type { api } from "../../../convex/_generated/api";

const TWEEN_FACTOR_BASE = 0.52;

export default function NewPunAnimalDialog({
  isOpen,
  setIsOpen,
  openForm,
  children,
  animals,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openForm: () => void;
  children: React.ReactNode;
  animals: FunctionReturnType<typeof api.animals.getAllAnimals>;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className="h-screen rounded-none border-0 bg-transparent p-0 sm:w-screen sm:max-w-none"
        showCloseButton={false}
      >
        <div className="flex h-full w-full max-w-[calc(100vw-2rem)] flex-col sm:max-w-[100vw]">
          <DialogHeader className="animate-jump items-center py-16">
            <DialogTitle className="text-secondary text-3xl font-bold break-keep">
              마음에 드는 동물을 골라보세요
            </DialogTitle>
            <DialogDescription className="text-secondary text-base">
              <span className="hidden sm:block">
                좌우로 드래그 하면 다른 동물을 고를 수 있어요.
              </span>
              <span className="block sm:hidden">
                좌우로 스와이프 하면 다른 동물을 고를 수 있어요.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-[50vh] overflow-hidden">
            <div className="flex h-full w-full items-center justify-center">
              <AnimalCarousel animals={animals || []} />
            </div>
          </div>

          <div className="flex flex-1 justify-center bg-transparent">
            <div className="m-auto flex h-fit gap-4">
              <LegoButton variant="secondary" onClick={() => setIsOpen(false)}>
                닫기
              </LegoButton>
              <LegoButton onClick={openForm}>고르기</LegoButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AnimalCarousel({
  animals,
}: {
  animals: FunctionReturnType<typeof api.animals.getAllAnimals>;
}) {
  const options = useMemo<EmblaOptionsType>(
    () => ({
      align: "center",
      dragFree: false,
      loop: true,
      skipSnaps: false,
      containScroll: "trimSnaps",
    }),
    [],
  );
  const [selectedAnimalId, setSelectedAnimalId] = useAtom(animalId);

  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);

  const numberWithinRange = (number: number, min: number, max: number) =>
    Math.min(Math.max(number, min), max);

  const onSelect = useCallback(
    (emblaApi: EmblaCarouselType) => {
      const selectedIndex = emblaApi.selectedScrollSnap();
      const animal = animals[selectedIndex];
      if (animal) {
        setSelectedAnimalId(animal.id);
      }
    },
    [animals, setSelectedAnimalId],
  );

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: doesn't need to be re-run
  const tweenScale = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === "scroll";

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            });
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          const scale = numberWithinRange(tweenValue, 0, 1).toString();
          const tweenNode = tweenNodes.current[slideIndex];
          tweenNode.style.transform = `scale(${scale})`;
        });
      });
    },
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: doesn't need to be re-run
  useEffect(() => {
    if (!emblaApi) return;

    setTweenFactor(emblaApi);
    tweenScale(emblaApi);

    emblaApi
      .on("init", (api) => {
        if (!selectedAnimalId) {
          setSelectedAnimalId(animals[0].id);
          return;
        }
        const selectedAnimal = animals.findIndex(
          (a) => a.id === selectedAnimalId,
        );
        api.scrollTo(selectedAnimal, false); // true 로 트랜지션 없애고 싶은데 가운데 이미지가 사라지는 버그가 있음.
      })
      .on("reInit", setTweenFactor)
      .on("reInit", tweenScale)
      .on("scroll", tweenScale)
      .on("slideFocus", tweenScale)
      .on("select", onSelect);
  }, [emblaApi, tweenScale]);

  return (
    <div className="h-full w-full">
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="-ml-4 flex h-full touch-pan-y select-none">
          {animals.map((animal, index) => {
            return (
              <div
                key={animal.imageUrl}
                className="h-full flex-[0_0_75%] pl-4 sm:flex-[0_0_60%] md:flex-[0_0_50%]"
              >
                <div
                  className={
                    "mx-auto flex h-[80%] w-full items-center justify-center rounded-lg bg-transparent transition-transform duration-300 ease-out"
                  }
                  ref={(el) => {
                    if (el) tweenNodes.current[index] = el;
                  }}
                >
                  <Image
                    src={animal.imageUrl}
                    alt={animal.name}
                    width={500}
                    height={500}
                    className={"h-full w-auto scale-100 transition-transform"}
                  />
                </div>
                <div className="bg-secondary mx-auto mt-4 w-fit rounded-full px-2 py-1">
                  <p className="text-shadow-lego text-center text-base font-semibold">
                    {animal.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
