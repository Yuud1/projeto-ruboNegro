"use client"

import { useMemo, useEffect, useState, useRef } from "react"
import { TreeNode as TreeNodeComponent } from "./tree-node"
import { TreeEdge } from "./tree-edge"
import type { TreeNode } from "@/lib/red-black-tree"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react"

interface TreeVisualizationProps {
  tree: TreeNode | null
  nodePositions: Map<string, { x: number; y: number }>
  affectedNodes?: string[]
  currentStepType?: string
}

export function TreeVisualization({
  tree,
  nodePositions,
  affectedNodes = [],
  currentStepType,
}: TreeVisualizationProps) {
  const [animatingNodes, setAnimatingNodes] = useState<Set<string>>(new Set())
  const [previousTree, setPreviousTree] = useState<TreeNode | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (affectedNodes.length > 0 && currentStepType) {
      setAnimatingNodes(new Set(affectedNodes))
      const timer = setTimeout(() => setAnimatingNodes(new Set()), 600)
      return () => clearTimeout(timer)
    }
  }, [affectedNodes, currentStepType])

  useEffect(() => {
    setPreviousTree(tree)
  }, [tree])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1))
  }

  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+Left
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)))
  }

  const { nodes, edges, newNodes } = useMemo(() => {
    const nodeList: TreeNode[] = []
    const edgeList: Array<{ from: TreeNode; to: TreeNode; isNew?: boolean }> = []
    const newNodeSet = new Set<string>()

    const previousNodeIds = new Set<string>()
    const traversePrevious = (node: TreeNode | null) => {
      if (!node) return
      previousNodeIds.add(node.id)
      traversePrevious(node.left)
      traversePrevious(node.right)
    }
    traversePrevious(previousTree)

    const traverse = (node: TreeNode | null) => {
      if (!node) return

      nodeList.push(node)

      // Mark as new if not in previous tree
      if (!previousNodeIds.has(node.id)) {
        newNodeSet.add(node.id)
      }

      if (node.left) {
        edgeList.push({
          from: node,
          to: node.left,
          isNew: !previousNodeIds.has(node.left.id),
        })
        traverse(node.left)
      }

      if (node.right) {
        edgeList.push({
          from: node,
          to: node.right,
          isNew: !previousNodeIds.has(node.right.id),
        })
        traverse(node.right)
      }
    }

    traverse(tree)

    return { nodes: nodeList, edges: edgeList, newNodes: newNodeSet }
  }, [tree, previousTree])

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-96 border-2 border-dashed border-border rounded-lg bg-gradient-to-br from-background to-muted/20">
        <div className="text-center text-muted-foreground">
          <div className="text-6xl mb-4 animate-bounce">🌳</div>
          <p className="text-lg font-medium">Visualização da Árvore</p>
          <p className="text-sm">A árvore aparecerá aqui quando você inserir valores</p>
        </div>
      </div>
    )
  }

  // Calculate SVG dimensions based on node positions
  const bounds = Array.from(nodePositions.values()).reduce(
    (acc, pos) => ({
      minX: Math.min(acc.minX, pos.x),
      maxX: Math.max(acc.maxX, pos.x),
      minY: Math.min(acc.minY, pos.y),
      maxY: Math.max(acc.maxY, pos.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  )

  const padding = 80
  const svgWidth = Math.max(500, bounds.maxX - bounds.minX + padding * 2)
  const svgHeight = Math.max(400, bounds.maxY - bounds.minY + padding * 2)
  const offsetX = -bounds.minX + padding
  const offsetY = -bounds.minY + padding

  const getAnimationType = (nodeId: string) => {
    if (newNodes.has(nodeId)) return "insert"
    if (animatingNodes.has(nodeId)) {
      switch (currentStepType) {
        case "delete":
          return "delete"
        case "recolor":
          return "recolor"
        case "rotate-left":
        case "rotate-right":
          return "move"
        default:
          return null
      }
    }
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-96 p-4">
      <div className="relative overflow-hidden max-w-full max-h-[500px] border border-border rounded-lg bg-gradient-to-br from-card to-muted/10 shadow-lg">
        {/* Zoom Controls */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
          <Button size="sm" variant="outline" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleResetView}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Pan indicator */}
        {isPanning && (
          <div className="absolute top-2 left-2 z-10">
            <div className="flex items-center gap-2 px-2 py-1 bg-primary text-primary-foreground rounded text-sm">
              <Move className="w-4 h-4" />
              Arrastando
            </div>
          </div>
        )}

        <svg 
          ref={svgRef}
          width={svgWidth} 
          height={svgHeight} 
          className="block cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(107 114 128)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(156 163 175)" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render edges first (behind nodes) */}
          {edges.map((edge, index) => {
            const fromPos = nodePositions.get(edge.from.id)
            const toPos = nodePositions.get(edge.to.id)

            if (!fromPos || !toPos) {
              console.log(`Missing position for edge: ${edge.from.id} -> ${edge.to.id}`)
              return null
            }

            return (
              <TreeEdge
                key={`edge-${edge.from.id}-${edge.to.id}`}
                from={{
                  x: fromPos.x + offsetX,
                  y: fromPos.y + offsetY,
                }}
                to={{
                  x: toPos.x + offsetX,
                  y: toPos.y + offsetY,
                }}
                isAnimated={edge.isNew}
              />
            )
          })}

          {/* Render nodes on top of edges */}
          {nodes.map((node) => {
            const position = nodePositions.get(node.id)
            if (!position) return null

            return (
              <TreeNodeComponent
                key={node.id}
                node={node}
                x={position.x + offsetX}
                y={position.y + offsetY}
                isHighlighted={affectedNodes.includes(node.id)}
                animationType={getAnimationType(node.id)}
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}
