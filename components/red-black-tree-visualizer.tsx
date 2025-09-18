"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TreeVisualization } from "./tree-visualization"
import { StepNavigator } from "./step-navigator"
import { TreeIntroduction } from "./tree-introduction"
import { TreeStatistics } from "./tree-statistics"
import { RandomGenerator } from "./random-generator"
import { PresentationMode } from "./presentation-mode"
import { OperationHistory } from "./operation-history"
import { useRedBlackTree } from "@/hooks/use-red-black-tree"
import { Plus, Minus, RotateCcw, Presentation } from "lucide-react"

export function RedBlackTreeVisualizer() {
  const [inputValue, setInputValue] = useState("")
  const [showPresentation, setShowPresentation] = useState(false)
  const {
    insertValue,
    deleteValue,
    insertMultipleValues,
    reset,
    nextStep,
    previousStep,
    goToStep,
    getCurrentTree,
    getCurrentStep,
    getNodePositions,
    currentStep,
    totalSteps,
    steps,
    canGoNext,
    canGoPrevious,
  } = useRedBlackTree()

  const handleInsertNode = () => {
    const value = Number.parseInt(inputValue)
    if (!isNaN(value) && inputValue.trim() !== "") {
      insertValue(value)
      setInputValue("")
    }
  }

  const handleDeleteNode = () => {
    const value = Number.parseInt(inputValue)
    if (!isNaN(value) && inputValue.trim() !== "") {
      const success = deleteValue(value)
      if (success) {
        setInputValue("")
      }
    }
  }


  const handleReset = () => {
    reset()
  }

  const handleRandomGenerate = (values: number[]) => {
    insertMultipleValues(values)
  }


  const currentTree = getCurrentTree()
  const currentStepData = getCurrentStep()
  const nodePositions = getNodePositions()


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 lg:px-8 xl:px-12">
          <h1 className="text-3xl font-bold text-foreground text-balance">Visualizador de Árvore Rubro-Negra</h1>
          <p className="text-muted-foreground mt-2 text-pretty">
            Ferramenta educativa interativa para aprender sobre estruturas de dados
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 lg:px-8 xl:px-12">
        {showPresentation ? (
          <PresentationMode 
            onExit={() => setShowPresentation(false)}
            tree={currentTree}
            nodePositions={nodePositions}
            currentStep={currentStep}
            totalSteps={totalSteps}
            steps={steps}
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
            nextStep={nextStep}
            previousStep={previousStep}
            goToStep={goToStep}
            reset={handleReset}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
            <Card className="p-4 card-professional">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-2 flex-1">
                    <Input
                      type="number"
                      placeholder="Digite um número..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleInsertNode()}
                      className="flex-1"
                    />
                    <Button onClick={handleInsertNode} className="shrink-0 btn-professional btn-primary-professional">
                      <Plus className="w-4 h-4 mr-2" />
                      Inserir
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteNode} className="shrink-0 btn-professional btn-destructive-professional">
                      <Minus className="w-4 h-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                  <Button variant="outline" onClick={handleReset} className="btn-professional btn-outline-professional">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetar
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => setShowPresentation(true)}
                    className="btn-professional btn-outline-professional"
                  >
                    <Presentation className="w-4 h-4 mr-2" />
                    Apresentação
                  </Button>
                </div>

              </div>
            </Card>

            <StepNavigator
              currentStep={currentStep}
              totalSteps={totalSteps}
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              onNextStep={nextStep}
              onPreviousStep={previousStep}
              onGoToStep={goToStep}
              onReset={handleReset}
              currentStepData={currentStepData}
            />

            <Card className="p-6 min-h-[500px] card-professional">
              <TreeVisualization
                tree={currentTree}
                nodePositions={nodePositions}
                affectedNodes={currentStepData?.affectedNodes || []}
                currentStepType={currentStepData?.type}
              />
            </Card>

          </div>

          <div className="lg:col-span-1 space-y-6">
            <TreeIntroduction />

            <RandomGenerator onGenerate={handleRandomGenerate} />

            <TreeStatistics tree={currentTree} />

            <OperationHistory steps={steps} currentStep={currentStep} onGoToStep={goToStep} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
