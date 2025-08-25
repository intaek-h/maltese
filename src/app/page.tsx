import MinecraftButton from '@/components/ui/minecraft-button'
import Canvas from '@/app/_components/canvas'
import NewPunDialog from '@/app/_components/new-pun-dialog'

export default function Home() {
  return (
    <div className="relative h-screen w-screen">
      <Canvas />

      <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
        <NewPunDialog>
          <MinecraftButton>나도 말장난 하기</MinecraftButton>
        </NewPunDialog>
      </div>
    </div>
  )
}
