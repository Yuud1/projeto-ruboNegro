"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Shuffle, Settings } from "lucide-react"

interface RandomGeneratorProps {
  onGenerate: (values: number[]) => void
}

export function RandomGenerator({ onGenerate }: RandomGeneratorProps) {
  const [count, setCount] = useState(5)
  const [minValue, setMinValue] = useState(1)
  const [maxValue, setMaxValue] = useState(100)
  const [showSettings, setShowSettings] = useState(false)

  const handleGenerate = () => {
    const values: number[] = []
    const used = new Set<number>()

    while (values.length < count && used.size < maxValue - minValue + 1) {
      const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
      if (!used.has(value)) {
        used.add(value)
        values.push(value)
      }
    }

    onGenerate(values)
  }

  const presets = [
    { name: "Pequena", count: 3, min: 1, max: 20 },
    { name: "Média", count: 5, min: 1, max: 50 },
    { name: "Grande", count: 8, min: 1, max: 100 },
    { name: "Desafio", count: 10, min: 1, max: 200 },
  ]

  const applyPreset = (preset: (typeof presets)[0]) => {
    setCount(preset.count)
    setMinValue(preset.min)
    setMaxValue(preset.max)
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Gerador Aleatório</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {showSettings && (
        <div className="space-y-4 mb-4 p-3 bg-muted rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="count">Quantidade de valores: {count}</Label>
            <Slider value={[count]} onValueChange={(value) => setCount(value[0])} max={15} min={1} step={1} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="min">Mínimo</Label>
              <Input
                id="min"
                type="number"
                value={minValue}
                onChange={(e) => setMinValue(Number(e.target.value))}
                className="h-8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Máximo</Label>
              <Input
                id="max"
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(Number(e.target.value))}
                className="h-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Presets:</Label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button key={preset.name} variant="outline" size="sm" onClick={() => applyPreset(preset)}>
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Button onClick={handleGenerate} className="w-full">
        <Shuffle className="w-4 h-4 mr-2" />
        Gerar {count} Valores
      </Button>
    </Card>
  )
}
