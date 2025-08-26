import Canvas from '@/app/_components/canvas'
import NewPunContainer from '@/app/_components/new-pun-container'

export default function Home() {
  return (
    <div className="relative h-screen w-screen">
      <Canvas />

      <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
        <NewPunContainer />
      </div>
    </div>
  )
}
