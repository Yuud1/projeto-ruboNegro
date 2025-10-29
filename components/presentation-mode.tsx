"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useRedBlackTree } from "@/hooks/use-red-black-tree"
import { TreeVisualization } from "./tree-visualization"
import { TreeStatistics } from "./tree-statistics"
import { PseudocodeDisplay } from "./pseudocode-display"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  Volume2,
  VolumeX,
  X
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

  const getAlgorithmForStep = (stepType: string) => {
    switch (stepType) {
      case "insert":
        return "insert"
      case "recolor":
      case "rotate-left":
      case "rotate-right":
        return "insert-fixup"
      case "delete":
        return "delete"
      case "delete-fixup":
        return "delete-fixup"
      default:
        return "insert"
    }
  }

  const getActiveLinesForStep = (stepType: string, stepData: any) => {
    switch (stepType) {
      case "insert":
        return [14, 15, 16, 17]
      case "recolor":
        return [4, 5, 6, 7, 8]
      case "rotate-left":
        return [10, 11, 12]
      case "rotate-right":
        return [13, 14, 15]
      case "delete":
        if (stepData?.hasLeftChild === false && stepData?.hasRightChild === false) {
          return [3, 4, 5]
        } else if (stepData?.hasLeftChild === false || stepData?.hasRightChild === false) {
          return [6, 7, 8]
        } else {
          return [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
        }
      case "delete-fixup":
        return [1, 2, 3, 4, 5, 6, 7, 8]
      default:
        return []
    }
  }

  const getExecutedLinesForStep = (stepType: string, stepData: any) => {
    switch (stepType) {
      case "insert":
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
      case "recolor":
        return [1, 2, 3]
      case "rotate-left":
        return [1, 2, 3, 9]
      case "rotate-right":
        return [1, 2, 3, 9, 10, 11, 12]
      case "delete":
        return [1, 2]
      case "delete-fixup":
        return []
      default:
        return []
    }
  }

  const getConditionsForStep = (stepType: string, stepData: any) => {
    const conditions: { [key: number]: boolean } = {}
    
    switch (stepType) {
      case "insert":
        conditions[3] = true
        conditions[5] = stepData?.direction === "left"
        conditions[9] = stepData?.isRoot || false
        conditions[11] = stepData?.direction === "left"
        break
      case "recolor":
        conditions[1] = true
        conditions[2] = stepData?.parentSide === "left"
        conditions[4] = true
        break
      case "rotate-left":
        conditions[1] = true
        conditions[2] = stepData?.parentSide === "left"
        conditions[4] = false
        conditions[10] = true
        break
      case "rotate-right":
        conditions[1] = true
        conditions[2] = stepData?.parentSide === "left"
        conditions[4] = false
        conditions[10] = false
        break
      case "delete":
        conditions[3] = stepData?.hasLeftChild === false
        conditions[6] = stepData?.hasRightChild === false
        conditions[13] = stepData?.isSuccessorChild || false
        conditions[23] = stepData?.originalColor === "BLACK"
        break
      case "delete-fixup":
        conditions[1] = true
        conditions[2] = stepData?.isLeftChild || false
        conditions[4] = stepData?.siblingColor === "RED"
        conditions[9] = stepData?.bothChildrenBlack || false
        break
    }
    
    return conditions
  }

  const getCommentsForStep = (stepType: string, stepData: any) => {
    return {}
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
    <div className={`fixed inset-0 z-50 bg-background ${isFullscreen ? 'p-4' : 'p-4'}`}>
      <div className="flex h-[calc(100vh-140px)] gap-4">
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

        {showStats && (
          <div className="w-96 space-y-4">
            {currentStepData ? (
              <PseudocodeDisplay
                algorithm={getAlgorithmForStep(currentStepData.type) as any}
                activeLines={getActiveLinesForStep(currentStepData.type, currentStepData)}
                executedLines={getExecutedLinesForStep(currentStepData.type, currentStepData)}
                conditions={getConditionsForStep(currentStepData.type, currentStepData)}
                comments={getCommentsForStep(currentStepData.type, currentStepData)}
                showRotationAlgorithms={currentStepData.type === 'rotate-left' || currentStepData.type === 'rotate-right'}
              />
            ) : (
              <PseudocodeDisplay
                algorithm="insert"
                activeLines={[]}
                executedLines={[]}
                conditions={{}}
                comments={{}}
                showRotationAlgorithms={false}
              />
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-4xl">
        <Card className="p-4 shadow-lg">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleGoToStart} disabled={currentStep === 0} className="cursor-pointer">
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={previousStep} disabled={!canGoPrevious} className="cursor-pointer">
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button 
                variant={isPlaying ? "default" : "outline"} 
                size="sm" 
                onClick={handlePlayPause}
                disabled={!canGoNext && !isPlaying}
                className="cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button variant="outline" size="sm" onClick={nextStep} disabled={!canGoNext} className="cursor-pointer">
                <SkipForward className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleGoToEnd} disabled={currentStep === totalSteps - 1} className="cursor-pointer">
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 min-w-[300px]">
              <span className="text-sm text-muted-foreground">Velocidade:</span>
              <Slider
                value={[playbackSpeed]}
                onValueChange={handleSpeedChange}
                max={3000}
                min={200}
                step={200}
                className="flex-1 cursor-pointer"
              />
              <span className="text-sm text-muted-foreground w-12">
                {playbackSpeed}ms
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset} className="cursor-pointer">
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)} className="cursor-pointer">
                {showStats ? "Ocultar Stats" : "Mostrar Stats"}
              </Button>
              
              <Button variant="outline" size="sm" onClick={toggleFullscreen} className="cursor-pointer">
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              
              <Button variant="outline" size="sm" onClick={onExit} className="cursor-pointer">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
