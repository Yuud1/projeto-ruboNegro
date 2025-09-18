"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, SkipBack, SkipForward, Play, Pause, RotateCcw } from "lucide-react"
import { useState, useEffect } from "react"
import type { TreeStep } from "@/lib/red-black-tree"

interface StepNavigatorProps {
  currentStep: number
  totalSteps: number
  canGoNext: boolean
  canGoPrevious: boolean
  onNextStep: () => void
  onPreviousStep: () => void
  onGoToStep: (step: number) => void
  onReset: () => void
  currentStepData: TreeStep | null
}

export function StepNavigator({
  currentStep,
  totalSteps,
  canGoNext,
  canGoPrevious,
  onNextStep,
  onPreviousStep,
  onGoToStep,
  onReset,
  currentStepData,
}: StepNavigatorProps) {
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(1000)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      if (canGoNext) {
        onNextStep()
      } else {
        setIsAutoPlaying(false)
      }
    }, autoPlaySpeed)

    return () => clearInterval(interval)
  }, [isAutoPlaying, canGoNext, onNextStep, autoPlaySpeed])

  const handleSliderChange = (value: number[]) => {
    onGoToStep(value[0])
  }

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false)
    } else if (canGoNext) {
      setIsAutoPlaying(true)
    }
  }

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case "insert":
        return "bg-green-100 text-green-800 border-green-200"
      case "delete":
        return "bg-red-100 text-red-800 border-red-200"
      case "recolor":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "rotate-left":
      case "rotate-right":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStepTypeLabel = (type: string) => {
    switch (type) {
      case "insert":
        return "Inserção"
      case "delete":
        return "Remoção"
      case "recolor":
        return "Recoloração"
      case "rotate-left":
        return "Rotação ←"
      case "rotate-right":
        return "Rotação →"
      case "initial":
        return "Inicial"
      default:
        return type
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Navegação de Passos</h3>
        {currentStepData && (
          <Badge className={getStepTypeColor(currentStepData.type)}>{getStepTypeLabel(currentStepData.type)}</Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Passo {currentStep + 1}</span>
          <span>de {totalSteps}</span>
        </div>
        <Slider
          value={[currentStep]}
          onValueChange={handleSliderChange}
          max={totalSteps - 1}
          min={0}
          step={1}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={onReset} disabled={totalSteps <= 1} title="Resetar para o início">
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onGoToStep(0)}
          disabled={currentStep === 0}
          title="Ir para o primeiro passo"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={onPreviousStep} disabled={!canGoPrevious} title="Passo anterior">
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant={isAutoPlaying ? "default" : "outline"}
          size="sm"
          onClick={handleAutoPlay}
          disabled={!canGoNext && !isAutoPlaying}
          title={isAutoPlaying ? "Pausar reprodução automática" : "Reprodução automática"}
        >
          {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>

        <Button variant="outline" size="sm" onClick={onNextStep} disabled={!canGoNext} title="Próximo passo">
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onGoToStep(totalSteps - 1)}
          disabled={currentStep === totalSteps - 1}
          title="Ir para o último passo"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {isAutoPlaying && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span>Velocidade</span>
            <span>{autoPlaySpeed}ms</span>
          </div>
          <Slider
            value={[autoPlaySpeed]}
            onValueChange={(value) => setAutoPlaySpeed(value[0])}
            max={3000}
            min={500}
            step={250}
            className="w-full"
          />
        </div>
      )}

      {currentStepData && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium text-foreground">{currentStepData.description}</p>
        </div>
      )}
    </Card>
  )
}
