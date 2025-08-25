import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function NewPunDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>

      <DialogContent>
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>새로운 말장난 만들기</DialogTitle>
            <DialogDescription>말장난을 만들어 주세요.</DialogDescription>
          </DialogHeader>

          <Content />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Content() {
  return <div>hello</div>
}
