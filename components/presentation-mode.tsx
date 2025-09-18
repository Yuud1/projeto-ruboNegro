"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useRedBlackTree } from "@/hooks/use-red-black-tree"
import { TreeVisualization } from "./tree-visualization"
import { TreeStatistics } from "./tree-statistics"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  Volume2,
  VolumeX
} from "lucide-react"

interface PresentationModeProps {
  onExit: () => void
  tree: any
  nodePositions: any
  currentStep: number
  totalSteps: number
  steps: any[]
  canGoNext: boolean
  canGoPrevious: boolean
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: number) => void
  reset: () => void
}

export function PresentationMode({ 
  onExit,
  tree,
  nodePositions,
  currentStep,
  totalSteps,
  steps,
  canGoNext,
  canGoPrevious,
  nextStep,
  previousStep,
  goToStep,
  reset
}: PresentationModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000)
  const [showStats, setShowStats] = useState(true)
  const [isMuted, setIsMuted] = useState(false)

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      if (canGoNext) {
        nextStep()
      } else {
        setIsPlaying(false)
      }
    }, playbackSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, canGoNext, nextStep, playbackSpeed])

  // Fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else if (canGoNext) {
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    reset()
    setIsPlaying(false)
  }

  const handleGoToStart = () => {
    goToStep(0)
    setIsPlaying(false)
  }

  const handleGoToEnd = () => {
    goToStep(totalSteps - 1)
    setIsPlaying(false)
  }

  const handleSpeedChange = (value: number[]) => {
    setPlaybackSpeed(value[0])
  }

  const currentStepData = steps[currentStep] || null

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
    <div className={`fixed inset-0 z-50 bg-background ${isFullscreen ? 'p-0' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-4 bg-card border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Modo Apresentação</h1>
          <Badge variant="outline">
            Passo {currentStep + 1} de {totalSteps}
          </Badge>
          {currentStepData && (
            <Badge className={getStepTypeColor(currentStepData.type)}>
              {getStepTypeLabel(currentStepData.type)}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
            {showStats ? "Ocultar Stats" : "Mostrar Stats"}
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={onExit}>
            Sair
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)] gap-4">
        {/* Main Visualization */}
        <div className="flex-1">
          <Card className="h-full p-6">
            <TreeVisualization
              tree={tree}
              nodePositions={nodePositions}
              affectedNodes={currentStepData?.affectedNodes || []}
              currentStepType={currentStepData?.type}
            />
          </Card>
        </div>

        {/* Sidebar */}
        {showStats && (
          <div className="w-80 space-y-4">
            {/* Statistics */}
            <TreeStatistics tree={tree} />

            {/* Step Description */}
            {currentStepData && (
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Descrição do Passo</h3>
                <p className="text-sm text-muted-foreground">
                  {currentStepData.description}
                </p>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <Card className="p-4 shadow-lg">
          <div className="flex items-center gap-4">
            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleGoToStart} disabled={currentStep === 0}>
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={previousStep} disabled={!canGoPrevious}>
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button 
                variant={isPlaying ? "default" : "outline"} 
                size="sm" 
                onClick={handlePlayPause}
                disabled={!canGoNext && !isPlaying}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button variant="outline" size="sm" onClick={nextStep} disabled={!canGoNext}>
                <SkipForward className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleGoToEnd} disabled={currentStep === totalSteps - 1}>
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-2 min-w-[200px]">
              <span className="text-sm text-muted-foreground">Velocidade:</span>
              <Slider
                value={[playbackSpeed]}
                onValueChange={handleSpeedChange}
                max={3000}
                min={200}
                step={200}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">
                {playbackSpeed}ms
              </span>
            </div>

            {/* Reset */}
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
