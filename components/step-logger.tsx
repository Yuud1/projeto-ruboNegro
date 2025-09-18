"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { TreeStep } from "@/lib/red-black-tree"
import { ChevronRight } from "lucide-react"

interface StepLoggerProps {
  steps: TreeStep[]
  currentStep: number
  onGoToStep?: (step: number) => void
}

export function StepLogger({ steps, currentStep, onGoToStep }: StepLoggerProps) {
  const getStepTypeColor = (type: string) => {
    switch (type) {
      case "insert":
        return "bg-green-100 text-green-800 border-green-200"
      case "recolor":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "rotate-left":
      case "rotate-right":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case "insert":
        return "+"
      case "recolor":
        return "🎨"
      case "rotate-left":
        return "↺"
      case "rotate-right":
        return "↻"
      default:
        return "•"
    }
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Histórico de Operações</h3>
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`group relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                index === currentStep
                  ? "bg-primary text-primary-foreground border-primary"
                  : index < currentStep
                    ? "bg-muted/50 text-muted-foreground border-muted"
                    : "bg-background text-foreground border-border hover:bg-muted/30"
              }`}
              onClick={() => onGoToStep?.(index)}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-mono text-xs bg-background/20 px-1.5 py-0.5 rounded">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs">{getStepTypeIcon(step.type)}</span>
                  <span className="text-sm flex-1 min-w-0">{step.description}</span>
                </div>
                {onGoToStep && (
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
              </div>

              {step.affectedNodes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {step.affectedNodes.slice(0, 3).map((nodeId) => (
                    <Badge key={nodeId} variant="outline" className="text-xs">
                      {nodeId.replace("node-", "")}
                    </Badge>
                  ))}
                  {step.affectedNodes.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{step.affectedNodes.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
