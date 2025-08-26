export default function NewPunForm() {
  return (
    <div className="border-primary flex w-[90vw] flex-col rounded-lg border-2 shadow-[4px_4px_0_0_#000] sm:w-[50vw] [&_input]:focus-visible:outline-none">
      <input
        type="text"
        className="text-card-foreground bg-secondary rounded-t-md px-2 py-1 text-3xl font-bold transition-[font-size] duration-300 focus-within:text-5xl"
        placeholder="첫 번째 행"
      />
      <hr className="border-primary border-t-2" />
      <input
        type="text"
        className="text-card-foreground bg-secondary rounded-b-md px-2 py-1 text-3xl font-bold transition-[font-size] duration-300 focus-within:text-5xl"
        placeholder="두 번째 행"
      />
    </div>
  )
}
