"use client"

import { useCallback } from "react"
import type { TreeNode } from "@/lib/red-black-tree"

export interface TreeExportData {
  nodes: Array<{
    value: number
    color: string
    id: string
    parentId?: string
    isLeftChild?: boolean
  }>
  metadata: {
    type: "red-black"
    timestamp: string
    version: string
  }
}

export function useTreeExport() {
  const exportTree = useCallback((tree: TreeNode | null): string => {
    if (!tree) {
      return JSON.stringify({
        nodes: [],
        metadata: {
          type: "red-black",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        },
      })
    }

    const nodes: TreeExportData["nodes"] = []
    const visited = new Set<string>()

    const traverse = (node: TreeNode, parentId?: string, isLeftChild?: boolean) => {
      if (visited.has(node.id)) return
      visited.add(node.id)

      nodes.push({
        value: node.value,
        color: node.color,
        id: node.id,
        parentId,
        isLeftChild,
      })

      if (node.left) {
        traverse(node.left, node.id, true)
      }
      if (node.right) {
        traverse(node.right, node.id, false)
      }
    }

    traverse(tree)

    const exportData: TreeExportData = {
      nodes,
      metadata: {
        type: "red-black",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
    }

    return JSON.stringify(exportData, null, 2)
  }, [])

  const importTree = useCallback((data: string): TreeExportData | null => {
    try {
      const parsed = JSON.parse(data)
      
      if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
        throw new Error("Formato de dados inválido")
      }

      if (!parsed.metadata || parsed.metadata.type !== "red-black") {
        throw new Error("Tipo de árvore não suportado")
      }

      return parsed as TreeExportData
    } catch (error) {
      console.error("Erro ao importar árvore:", error)
      return null
    }
  }, [])

  const downloadTree = useCallback((tree: TreeNode | null, filename?: string) => {
    const data = exportTree(tree)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement("a")
    link.href = url
    link.download = filename || `arvore-rubro-negra-${new Date().toISOString().split('T')[0]}.json`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }, [exportTree])

  const copyToClipboard = useCallback(async (tree: TreeNode | null): Promise<boolean> => {
    try {
      const data = exportTree(tree)
      await navigator.clipboard.writeText(data)
      return true
    } catch (error) {
      console.error("Erro ao copiar para clipboard:", error)
      return false
    }
  }, [exportTree])

  return {
    exportTree,
    importTree,
    downloadTree,
    copyToClipboard,
  }
}
