"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TreeVisualization } from "./tree-visualization"
import { StepNavigator } from "./step-navigator"
import { TreeStatistics } from "./tree-statistics"
import { RandomGenerator } from "./random-generator"
import { PresentationMode } from "./presentation-mode"
import { OperationHistory } from "./operation-history"
import { SequenceManager } from "./sequence-manager"
import { useRedBlackTree } from "@/hooks/use-red-black-tree"
import { Plus, Minus, RotateCcw, Presentation, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"

export function RedBlackTreeVisualizer() {
  const [inputValue, setInputValue] = useState("")
  const [showPresentation, setShowPresentation] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
    loadSequence,
    currentStep,
    totalSteps,
    steps,
    canGoNext,
    canGoPrevious,
  } = useRedBlackTree()

  const handleInsertNode = () => {
    if (inputValue.trim() === "") return
    
    const values = inputValue
      .split(/[,\s]+/)
      .map(v => v.trim())
      .filter(v => v !== "")
      .map(v => Number.parseInt(v))
      .filter(v => !isNaN(v))
    
    if (values.length > 0) {
      insertMultipleValues(values)
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/icon-png.png" 
                alt="Ícone da Árvore Rubro-Negra" 
                className="w-14 h-14"
              />
            </div>
            
            <div className="hidden lg:flex flex-wrap gap-4 justify-center">
              <Button variant="outline" className="btn-professional btn-outline-professional cursor-pointer">
                Árvore AVL
              </Button>
              <Button variant="outline" className="btn-professional btn-outline-professional cursor-pointer">
                Busca Binária
              </Button>
            </div>

            <div className="lg:hidden">
              <div
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-10 w-10 flex items-center justify-center cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <X className="w-10 h-10" />
                ) : (
                  <Menu className="w-10 h-10" />
                )}
              </div>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-border">
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  className="btn-professional btn-outline-professional justify-start cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Árvore AVL
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-professional btn-outline-professional justify-start cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Busca Binária
                </Button>
              </div>
            </div>
          )}
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
          <div className="flex flex-col lg:flex-row gap-6">
            <div className={`flex-1 space-y-6 transition-all duration-300 ${isSidebarCollapsed ? 'lg:flex-1' : 'lg:flex-[3]'}`}>
              <div className="flex gap-4">
                <Card className="p-4 card-professional flex-1">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
                      {/* Linha 1 (sempre): input + inserir + remover */}
                      <div className="flex gap-2 flex-1">
                        <Input
                          type="text"
                          placeholder="Digite números (ex: 1, 2, 3 ou 1 2 3)..."
                          value={inputValue}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9,\s]/g, '')
                            setInputValue(value)
                          }}
                          onKeyPress={(e) => {
                            if (!/[0-9,\s]/.test(e.key) && e.key !== 'Enter') {
                              e.preventDefault()
                            } else if (e.key === "Enter") {
                              handleInsertNode()
                            }
                          }}
                          className="flex-1"
                        />
                        <Button onClick={handleInsertNode} className="shrink-0 btn-professional btn-primary-professional cursor-pointer">
                          <Plus className="w-4 h-4 mr-2" />
                          Inserir
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteNode} className="shrink-0 btn-professional btn-destructive-professional cursor-pointer">
                          <Minus className="w-4 h-4 mr-2" />
                          Remover
                        </Button>
                      </div>

                      {/* Linha 2 (somente mobile): Resetar + Apresentação ocupando 100% (50% cada) */}
                      <div className="grid grid-cols-2 gap-2 lg:hidden">
                        <Button 
                          variant="outline" 
                          onClick={handleReset} 
                          className="w-full btn-professional btn-outline-professional cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Resetar
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowPresentation(true)}
                          className="w-full btn-professional btn-outline-professional cursor-pointer"
                        >
                          <Presentation className="w-4 h-4 mr-2" />
                          Apresentação
                        </Button>
                      </div>

                      {/* Linha direita (desktop): Resetar + Apresentação */}
                      <div className="hidden lg:flex gap-2">
                        <Button variant="outline" onClick={handleReset} className="btn-professional btn-outline-professional cursor-pointer">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Resetar
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowPresentation(true)}
                          className="btn-professional btn-outline-professional cursor-pointer"
                        >
                          <Presentation className="w-4 h-4 mr-2" />
                          Apresentação
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="hidden lg:block p-4 card-professional cursor-pointer hover:bg-muted/50 transition-all duration-200"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  title={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                >
                  <div className="h-9 w-12 flex items-center justify-center">
                    <div className="relative">
                      <ChevronRight 
                        className={`size-4 text-foreground transition-all duration-300 ease-in-out ${
                          isSidebarCollapsed 
                            ? 'opacity-100 rotate-0 scale-100' 
                            : 'opacity-0 rotate-180 scale-75'
                        }`}
                      />
                      <ChevronLeft 
                        className={`size-4 text-foreground absolute inset-0 transition-all duration-300 ease-in-out ${
                          isSidebarCollapsed 
                            ? 'opacity-0 rotate-180 scale-75' 
                            : 'opacity-100 rotate-0 scale-100'
                        }`}
                      />
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6 card-professional">
                <TreeVisualization
                  tree={currentTree}
                  nodePositions={nodePositions}
                  affectedNodes={currentStepData?.affectedNodes || []}
                  currentStepType={currentStepData?.type}
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  canGoNext={canGoNext}
                  canGoPrevious={canGoPrevious}
                  onNextStep={nextStep}
                  onPreviousStep={previousStep}
                  onGoToStep={goToStep}
                  onReset={handleReset}
                  currentStepData={currentStepData}
                  onCenterView={() => {}}
                />
              </Card>
            </div>

            {!isSidebarCollapsed && (
              <div className="hidden lg:block w-80 flex-shrink-0 space-y-6">
                <RandomGenerator onGenerate={handleRandomGenerate} />
                <SequenceManager 
                  currentSteps={steps} 
                  onLoadSequence={loadSequence} 
                />
                <OperationHistory steps={steps} currentStep={currentStep} onGoToStep={goToStep} />
                <TreeStatistics tree={currentTree} />
              </div>
            )}

            <div className="lg:hidden space-y-6">
              <RandomGenerator onGenerate={handleRandomGenerate} />
              <SequenceManager 
                currentSteps={steps} 
                onLoadSequence={loadSequence} 
              />
              <OperationHistory steps={steps} currentStep={currentStep} onGoToStep={goToStep} />
              <TreeStatistics tree={currentTree} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
