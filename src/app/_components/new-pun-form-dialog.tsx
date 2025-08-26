'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import LegoButton from '@/components/ui/lego-button'
import NewPunForm from './new-pun-form'

export default function NewPunFormDialog({
  isOpen,
  setIsOpen,
  children,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children?: React.ReactNode
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogPortal>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="h-screen rounded-none border-0 bg-transparent p-0 data-[state=open]:animate-none sm:w-screen sm:max-w-none"
          showCloseButton={false}
        >
          <div className="flex h-full w-full max-w-[calc(100vw-2rem)] flex-col">
            <DialogHeader className="items-center py-16">
              <DialogTitle className="text-secondary text-3xl font-bold">
                두 줄로 말장난을 만들어요
              </DialogTitle>
              <DialogDescription className="text-secondary text-base">
                <span className="">한 줄만 써도 괜찮아요</span>
              </DialogDescription>
            </DialogHeader>

            <div className="relative h-[50vh] overflow-hidden">
              <div className="flex h-full w-full items-center justify-center">
                <NewPunForm />
              </div>
            </div>

            <div className="flex flex-1 justify-center bg-transparent">
              <div className="m-auto flex h-fit gap-4">
                <LegoButton variant="secondary" onClick={() => setIsOpen(false)}>
                  뒤로
                </LegoButton>
                <LegoButton>저장하기</LegoButton>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
