'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import useEmblaCarousel from 'embla-carousel-react'
import type { EmblaCarouselType, EmblaEventType, EmblaOptionsType } from 'embla-carousel'

import bulldog from '@/animals/bulldog-1.svg'
import clown from '@/animals/clown-1.svg'
import crocodile from '@/animals/crocodile-1.svg'
import frog from '@/animals/frog-1.svg'
import lion from '@/animals/lion-1.svg'
import ostrich from '@/animals/ostrich-1.svg'
import rabbit from '@/animals/rabbit-1.svg'
import husky from '@/animals/siberian-husky-1.svg'
import LegoButton from '@/components/ui/lego-button'
import NewPunForm from './new-pun-form'

type Animal = { key: string; name: string; src: string }

function resolveSvgSrc(input: unknown): string {
  if (!input) return ''
  if (typeof input === 'string') return input
  // @ts-expect-error: runtime guard for Next static asset objects
  if (typeof input.src === 'string') return input.src
  // @ts-expect-error: runtime guard for possible default export string
  if (typeof input.default === 'string') return input.default
  return ''
}

const ANIMALS: Animal[] = [
  { key: 'bulldog', name: 'Bulldog', src: resolveSvgSrc(bulldog) },
  { key: 'clown', name: 'Clown', src: resolveSvgSrc(clown) },
  { key: 'crocodile', name: 'Crocodile', src: resolveSvgSrc(crocodile) },
  { key: 'frog', name: 'Frog', src: resolveSvgSrc(frog) },
  { key: 'lion', name: 'Lion', src: resolveSvgSrc(lion) },
  { key: 'ostrich', name: 'Ostrich', src: resolveSvgSrc(ostrich) },
  { key: 'rabbit', name: 'Rabbit', src: resolveSvgSrc(rabbit) },
  { key: 'husky', name: 'Siberian Husky', src: resolveSvgSrc(husky) },
]
const TWEEN_FACTOR_BASE = 0.52

export default function NewPunDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <LegoButton onClick={() => setIsOpen(true)} style={{ opacity: isOpen ? 0 : 1 }}>
          나도 말장난 하기
        </LegoButton>
      </DialogTrigger>

      <DialogContent
        className="h-screen rounded-none border-0 bg-transparent p-0 sm:w-screen sm:max-w-none"
        showCloseButton={false}
      >
        <div className="flex h-full w-full max-w-[calc(100vw-2rem)] flex-col">
          <DialogHeader className="items-center py-16">
            <DialogTitle className="text-secondary text-2xl font-bold">
              먼저 마음에 드는 동물을 고릅니다
            </DialogTitle>
            <DialogDescription className="text-secondary text-base">
              좌우로 스와이프 해보세요
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-[50vh] overflow-hidden">
            <div className="flex h-full w-full items-center justify-center">
              <AnimalCarousel animals={ANIMALS} />
            </div>
          </div>

          <div className="flex justify-center bg-transparent pb-24">
            <div className="flex gap-4">
              <LegoButton variant="secondary" onClick={() => setIsOpen(false)}>
                취소
              </LegoButton>
              <LegoButton>고르기</LegoButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AnimalCarousel({ animals }: { animals: Animal[] }) {
  const options = useMemo<EmblaOptionsType>(
    () => ({
      align: 'center',
      dragFree: false,
      loop: true,
      skipSnaps: false,
      containScroll: 'trimSnaps',
    }),
    []
  )
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  const numberWithinRange = (number: number, min: number, max: number) =>
    Math.min(Math.max(number, min), max)

  const tweenFactor = useRef(0)
  const tweenNodes = useRef<HTMLElement[]>([])

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
  }, [])

  const tweenScale = useCallback((emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
    const engine = emblaApi.internalEngine()
    const scrollProgress = emblaApi.scrollProgress()
    const slidesInView = emblaApi.slidesInView()
    const isScrollEvent = eventName === 'scroll'

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress
      const slidesInSnap = engine.slideRegistry[snapIndex]

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target()

            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target)

              if (sign === -1) {
                diffToTarget = scrollSnap - (1 + scrollProgress)
              }
              if (sign === 1) {
                diffToTarget = scrollSnap + (1 - scrollProgress)
              }
            }
          })
        }

        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current)
        const scale = numberWithinRange(tweenValue, 0, 1).toString()
        const tweenNode = tweenNodes.current[slideIndex]
        tweenNode.style.transform = `scale(${scale})`
      })
    })
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    setTweenFactor(emblaApi)
    tweenScale(emblaApi)

    emblaApi
      .on('reInit', setTweenFactor)
      .on('reInit', tweenScale)
      .on('scroll', tweenScale)
      .on('slideFocus', tweenScale)
  }, [emblaApi, tweenScale])

  return (
    <div className="h-full w-full">
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="-ml-4 flex h-full touch-pan-y select-none">
          {animals.map((animal, index) => {
            return (
              <div
                key={animal.key}
                className="h-full flex-[0_0_75%] pl-4 sm:flex-[0_0_60%] md:flex-[0_0_50%]"
              >
                <div
                  className={
                    'mx-auto flex h-[80%] w-full items-center justify-center rounded-lg bg-transparent transition-transform duration-300 ease-out'
                  }
                  ref={(el) => {
                    if (el) tweenNodes.current[index] = el
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={animal.src}
                    alt={animal.name}
                    className={'h-full w-auto scale-100 transition-transform'}
                  />
                </div>
                <div className="bg-secondary mx-auto mt-4 w-fit rounded-full px-2 py-1">
                  <p className="text-shadow-lego text-center text-base font-semibold">
                    {animal.name}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
