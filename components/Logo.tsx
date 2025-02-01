import { Scissors } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <Scissors className="h-8 w-8 text-pink-600" />
      <span className="text-2xl font-bold text-pink-600">Katy Silva</span>
      <span className="text-lg font-semibold text-gray-600">Nail Designer</span>
    </div>
  )
}

