"use client"

import { useState, useCallback } from "react"
import { RedBlackTree, type TreeStep, type TreeNode } from "@/lib/red-black-tree"

export function useRedBlackTree() {
  const [tree] = useState(() => new RedBlackTree())
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<TreeStep[]>(tree.getSteps())

  const insertValue = useCallback(
    (value: number) => {
      tree.insert(value)
      const newSteps = tree.getSteps()
      setSteps(newSteps)
      setCurrentStep(newSteps.length - 1)
    },
    [tree],
  )

  const deleteValue = useCallback(
    (value: number) => {
      const success = tree.delete(value)
      if (success) {
        const newSteps = tree.getSteps()
        setSteps(newSteps)
        setCurrentStep(newSteps.length - 1)
      }
      return success
    },
    [tree],
  )

  const searchValue = useCallback(
    (value: number) => {
      return tree.search(value)
    },
    [tree],
  )

  const insertMultipleValues = useCallback(
    (values: number[]) => {
      values.forEach((value) => tree.insert(value))
      const newSteps = tree.getSteps()
      setSteps(newSteps)
      setCurrentStep(newSteps.length - 1)
    },
    [tree],
  )

  const reset = useCallback(() => {
    tree.reset()
    const newSteps = tree.getSteps()
    setSteps(newSteps)
    setCurrentStep(0)
  }, [tree])

  const generateRandomValues = useCallback(
    (count = 5) => {
      const values = tree.generateRandomValues(count)
      values.forEach((value) => tree.insert(value))
      const newSteps = tree.getSteps()
      setSteps(newSteps)
      setCurrentStep(newSteps.length - 1)
      return values
    },
    [tree],
  )

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        setCurrentStep(stepIndex)
      }
    },
    [steps.length],
  )

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, steps.length])

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const getCurrentTree = useCallback((): TreeNode | null => {
    return tree.getTreeAtStep(currentStep)
  }, [tree, currentStep])

  const getCurrentStep = useCallback((): TreeStep | null => {
    return steps[currentStep] || null
  }, [steps, currentStep])

  const getNodePositions = useCallback(() => {
    const currentTree = getCurrentTree()
    return tree.calculateNodePositions(currentTree)
  }, [tree, getCurrentTree])

  return {
    insertValue,
    deleteValue,
    searchValue,
    insertMultipleValues,
    reset,
    generateRandomValues,
    goToStep,
    nextStep,
    previousStep,
    getCurrentTree,
    getCurrentStep,
    getNodePositions,
    currentStep,
    totalSteps: steps.length,
    steps,
    canGoNext: currentStep < steps.length - 1,
    canGoPrevious: currentStep > 0,
  }
}
