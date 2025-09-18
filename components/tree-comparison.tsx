"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TreeVisualization } from "./tree-visualization"
import { TreeStatistics } from "./tree-statistics"
import { useTreeComparison, type TreeType } from "@/hooks/use-tree-comparison"
import { Plus, Minus, Search, RotateCcw, BarChart3 } from "lucide-react"

export function TreeComparison() {
  const [inputValue, setInputValue] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [searchResult, setSearchResult] = useState<string>("")
  const [activeTab, setActiveTab] = useState<TreeType>("red-black")

  const {
    activeTree,
    setActiveTree,
    insertValue,
    deleteValue,
    searchValue: searchInTree,
    insertMultipleValues,
    reset,
    resetAll,
    getCurrentTree,
    getSteps,
    getNodePositions,
    getTreeStats,
  } = useTreeComparison()

  const handleInsertNode = () => {
    const value = Number.parseInt(inputValue)
    if (!isNaN(value) && inputValue.trim() !== "") {
      insertValue(value, activeTab)
      setInputValue("")
    }
  }

  const handleDeleteNode = () => {
    const value = Number.parseInt(inputValue)
    if (!isNaN(value) && inputValue.trim() !== "") {
      const success = deleteValue(value, activeTab)
      if (success) {
        setInputValue("")
      } else {
        setSearchResult(`Valor ${value} não encontrado na árvore`)
        setTimeout(() => setSearchResult(""), 3000)
      }
    }
  }

  const handleSearchNode = () => {
    const value = Number.parseInt(searchValue)
    if (!isNaN(value) && searchValue.trim() !== "") {
      const found = searchInTree(value, activeTab)
      if (found) {
        setSearchResult(`Valor ${value} encontrado!`)
      } else {
        setSearchResult(`Valor ${value} não encontrado`)
      }
      setTimeout(() => setSearchResult(""), 3000)
    }
  }

  const handleReset = () => {
    reset(activeTab)
    setSearchResult("")
  }

  const handleResetAll = () => {
    resetAll()
    setSearchResult("")
  }

  const handleRandomGenerate = (values: number[]) => {
    insertMultipleValues(values, activeTab)
  }

  const currentTree = getCurrentTree(activeTab)
  const nodePositions = getNodePositions(activeTab)
  const treeStats = getTreeStats(activeTab)

  const treeTypes: { value: TreeType; label: string; description: string }[] = [
    {
      value: "red-black",
      label: "Rubro-Negra",
      description: "Árvore balanceada com propriedades de cor",
    },
    {
      value: "bst",
      label: "BST Simples",
      description: "Árvore binária de busca sem balanceamento",
    },
    {
      value: "avl",
      label: "AVL",
      description: "Árvore balanceada por altura",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Comparação de Estruturas de Árvores</h2>
        <p className="text-muted-foreground">
          Compare diferentes tipos de árvores e veja como elas se comportam com os mesmos dados
        </p>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Tree Type Selection */}
          <div className="flex flex-wrap gap-2">
            {treeTypes.map((treeType) => (
              <Button
                key={treeType.value}
                variant={activeTab === treeType.value ? "default" : "outline"}
                onClick={() => setActiveTab(treeType.value)}
                className="flex-1 min-w-[120px]"
              >
                {treeType.label}
              </Button>
            ))}
          </div>

          {/* Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Operações</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Digite um número..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleInsertNode()}
                  className="flex-1"
                />
                <Button onClick={handleInsertNode} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
                <Button variant="destructive" onClick={handleDeleteNode} size="sm">
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Busca</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Buscar valor..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchNode()}
                  className="flex-1"
                />
                <Button variant="outline" onClick={handleSearchNode} size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Reset Controls */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar {treeTypes.find(t => t.value === activeTab)?.label}
            </Button>
            <Button variant="outline" onClick={handleResetAll}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar Todas
            </Button>
          </div>

          {/* Search Result */}
          {searchResult && (
            <div className={`p-2 rounded-md text-sm ${
              searchResult.includes("encontrado!") 
                ? "bg-green-100 text-green-800 border border-green-200" 
                : "bg-red-100 text-red-800 border border-red-200"
            }`}>
              {searchResult}
            </div>
          )}
        </div>
      </Card>

      {/* Tree Visualization and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Tree Visualization */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {treeTypes.find(t => t.value === activeTab)?.label}
              </h3>
              <Badge variant="outline">
                {treeTypes.find(t => t.value === activeTab)?.description}
              </Badge>
            </div>
            
            <TreeVisualization
              tree={currentTree}
              nodePositions={nodePositions}
              affectedNodes={[]}
              currentStepType="initial"
            />
          </Card>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5" />
              <h3 className="font-semibold">Estatísticas</h3>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-muted rounded-lg">
                  <div className="text-lg font-bold">{treeStats.totalNodes}</div>
                  <div className="text-xs text-muted-foreground">Nós</div>
                </div>
                <div className="text-center p-2 bg-muted rounded-lg">
                  <div className="text-lg font-bold">{treeStats.height}</div>
                  <div className="text-xs text-muted-foreground">Altura</div>
                </div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <Badge variant={treeStats.isBalanced ? "default" : "destructive"}>
                  {treeStats.isBalanced ? "✓ Balanceada" : "✗ Desbalanceada"}
                </Badge>
              </div>
            </div>
          </Card>

          <TreeStatistics tree={currentTree} />
        </div>
      </div>

      {/* All Trees Comparison */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Comparação Visual</h3>
        <Tabs defaultValue="red-black" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {treeTypes.map((treeType) => (
              <TabsTrigger key={treeType.value} value={treeType.value}>
                {treeType.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {treeTypes.map((treeType) => (
            <TabsContent key={treeType.value} value={treeType.value} className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{treeType.label}</h4>
                  <Badge variant="outline">{getTreeStats(treeType.value).totalNodes} nós</Badge>
                </div>
                <TreeVisualization
                  tree={getCurrentTree(treeType.value)}
                  nodePositions={getNodePositions(treeType.value)}
                  affectedNodes={[]}
                  currentStepType="initial"
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  )
}
