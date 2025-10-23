"use client"

import { useState, useCallback, useEffect } from "react"
import type { TreeStep } from "@/lib/red-black-tree"

export interface SavedSequence {
  id: string
  name: string
  description?: string
  operations: Array<{
    type: 'insert' | 'delete'
    value: number
    description: string
  }>
  createdAt: Date
  updatedAt: Date
}

const STORAGE_KEY = "red-black-tree-sequences"

export function useSequenceStorage() {
  const [savedSequences, setSavedSequences] = useState<SavedSequence[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Carregar sequências do localStorage
  const loadSequences = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const sequences = JSON.parse(stored).map((seq: any) => ({
          ...seq,
          createdAt: new Date(seq.createdAt),
          updatedAt: new Date(seq.updatedAt)
        }))
        setSavedSequences(sequences)
      }
    } catch (error) {
      console.error("Erro ao carregar sequências:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Salvar sequências no localStorage
  const saveSequences = useCallback((sequences: SavedSequence[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sequences))
      setSavedSequences(sequences)
    } catch (error) {
      console.error("Erro ao salvar sequências:", error)
    }
  }, [])

  // Salvar uma nova sequência
  const saveSequence = useCallback((
    name: string, 
    steps: TreeStep[], 
    description?: string
  ): string => {
    // Extrair apenas as operações de inserção e remoção
    const operations = steps
      .filter(step => step.type === 'insert' || step.type === 'delete')
      .map(step => {
        const valueMatch = step.description.match(/(?:Inserido|Removido) nó (\d+)/)
        const value = valueMatch ? parseInt(valueMatch[1]) : 0
        
        return {
          type: step.type as 'insert' | 'delete',
          value,
          description: step.description
        }
      })

    const newSequence: SavedSequence = {
      id: `seq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      operations,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const updatedSequences = [...savedSequences, newSequence]
    saveSequences(updatedSequences)
    return newSequence.id
  }, [savedSequences, saveSequences])

  // Atualizar uma sequência existente
  const updateSequence = useCallback((
    id: string, 
    updates: Partial<Pick<SavedSequence, 'name' | 'description' | 'operations'>>
  ): boolean => {
    const sequenceIndex = savedSequences.findIndex(seq => seq.id === id)
    if (sequenceIndex === -1) return false

    const updatedSequences = [...savedSequences]
    updatedSequences[sequenceIndex] = {
      ...updatedSequences[sequenceIndex],
      ...updates,
      updatedAt: new Date()
    }

    saveSequences(updatedSequences)
    return true
  }, [savedSequences, saveSequences])

  // Deletar uma sequência
  const deleteSequence = useCallback((id: string): boolean => {
    const updatedSequences = savedSequences.filter(seq => seq.id !== id)
    if (updatedSequences.length === savedSequences.length) return false

    saveSequences(updatedSequences)
    return true
  }, [savedSequences, saveSequences])

  // Carregar uma sequência específica
  const loadSequence = useCallback((id: string): SavedSequence | null => {
    return savedSequences.find(seq => seq.id === id) || null
  }, [savedSequences])

  // Duplicar uma sequência
  const duplicateSequence = useCallback((id: string, newName?: string): string | null => {
    const originalSequence = loadSequence(id)
    if (!originalSequence) return null

    const duplicatedSequence: SavedSequence = {
      ...originalSequence,
      id: `seq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newName || `${originalSequence.name} (Cópia)`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const updatedSequences = [...savedSequences, duplicatedSequence]
    saveSequences(updatedSequences)
    return duplicatedSequence.id
  }, [savedSequences, loadSequence, saveSequences])

  // Exportar sequências
  const exportSequences = useCallback(() => {
    const dataStr = JSON.stringify(savedSequences, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `red-black-tree-sequences-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [savedSequences])

  // Importar sequências
  const importSequences = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          if (Array.isArray(imported)) {
            const validSequences = imported.filter(seq => 
              seq.id && seq.name && Array.isArray(seq.steps)
            )
            
            if (validSequences.length > 0) {
              const updatedSequences = [...savedSequences, ...validSequences]
              saveSequences(updatedSequences)
              resolve(true)
            } else {
              resolve(false)
            }
          } else {
            resolve(false)
          }
        } catch (error) {
          console.error("Erro ao importar sequências:", error)
          resolve(false)
        }
      }
      reader.readAsText(file)
    })
  }, [savedSequences, saveSequences])

  // Limpar todas as sequências
  const clearAllSequences = useCallback(() => {
    saveSequences([])
  }, [saveSequences])

  // Carregar sequências na inicialização
  useEffect(() => {
    loadSequences()
  }, [loadSequences])

  return {
    savedSequences,
    isLoading,
    saveSequence,
    updateSequence,
    deleteSequence,
    loadSequence,
    duplicateSequence,
    exportSequences,
    importSequences,
    clearAllSequences,
    refreshSequences: loadSequences
  }
}
