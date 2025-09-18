"use client"

import { useState, useCallback } from "react"
import { RedBlackTree } from "@/lib/red-black-tree"
import { BinarySearchTree } from "@/lib/binary-search-tree"
import { AVLTree } from "@/lib/avl-tree"

export type TreeType = "red-black" | "bst" | "avl"

export function useTreeComparison() {
  const [redBlackTree] = useState(() => new RedBlackTree())
  const [bstTree] = useState(() => new BinarySearchTree())
  const [avlTree] = useState(() => new AVLTree())
  const [activeTree, setActiveTree] = useState<TreeType>("red-black")

  const insertValue = useCallback(
    (value: number, treeType: TreeType = activeTree) => {
      switch (treeType) {
        case "red-black":
          redBlackTree.insert(value)
          break
        case "bst":
          bstTree.insert(value)
          break
        case "avl":
          avlTree.insert(value)
          break
      }
    },
    [redBlackTree, bstTree, avlTree, activeTree],
  )

  const deleteValue = useCallback(
    (value: number, treeType: TreeType = activeTree) => {
      switch (treeType) {
        case "red-black":
          return redBlackTree.delete(value)
        case "bst":
          return bstTree.delete(value)
        case "avl":
          return avlTree.delete(value)
        default:
          return false
      }
    },
    [redBlackTree, bstTree, avlTree, activeTree],
  )

  const searchValue = useCallback(
    (value: number, treeType: TreeType = activeTree) => {
      switch (treeType) {
        case "red-black":
          return redBlackTree.search(value)
        case "bst":
          return bstTree.search(value)
        case "avl":
          return avlTree.search(value)
        default:
          return null
      }
    },
    [redBlackTree, bstTree, avlTree, activeTree],
  )

  const insertMultipleValues = useCallback(
    (values: number[], treeType: TreeType = activeTree) => {
      values.forEach((value) => insertValue(value, treeType))
    },
    [insertValue, activeTree],
  )

  const reset = useCallback(
    (treeType: TreeType = activeTree) => {
      switch (treeType) {
        case "red-black":
          redBlackTree.reset()
          break
        case "bst":
          bstTree.reset()
          break
        case "avl":
          avlTree.reset()
          break
      }
    },
    [redBlackTree, bstTree, avlTree, activeTree],
  )

  const resetAll = useCallback(() => {
    redBlackTree.reset()
    bstTree.reset()
    avlTree.reset()
  }, [redBlackTree, bstTree, avlTree])

  const getCurrentTree = useCallback(
    (treeType: TreeType = activeTree) => {
      switch (treeType) {
        case "red-black":
          return redBlackTree.getRoot()
        case "bst":
          return bstTree.getRoot()
        case "avl":
          return avlTree.getRoot()
        default:
          return null
      }
    },
    [redBlackTree, bstTree, avlTree, activeTree],
  )

  const getSteps = useCallback(
    (treeType: TreeType = activeTree) => {
      switch (treeType) {
        case "red-black":
          return redBlackTree.getSteps()
        case "bst":
          return bstTree.getSteps()
        case "avl":
          return avlTree.getSteps()
        default:
          return []
      }
    },
    [redBlackTree, bstTree, avlTree, activeTree],
  )

  const getNodePositions = useCallback(
    (treeType: TreeType = activeTree) => {
      const currentTree = getCurrentTree(treeType)
      switch (treeType) {
        case "red-black":
          return redBlackTree.calculateNodePositions(currentTree)
        case "bst":
          return bstTree.calculateNodePositions(currentTree)
        case "avl":
          return avlTree.calculateNodePositions(currentTree)
        default:
          return new Map()
      }
    },
    [redBlackTree, bstTree, avlTree, getCurrentTree, activeTree],
  )

  const getTreeStats = useCallback(
    (treeType: TreeType = activeTree) => {
      const tree = getCurrentTree(treeType)
      if (!tree) {
        return {
          totalNodes: 0,
          height: 0,
          isBalanced: true,
        }
      }

      let totalNodes = 0
      let maxHeight = 0
      let isBalanced = true

      const traverse = (node: any, depth: number) => {
        if (!node) return

        totalNodes++
        maxHeight = Math.max(maxHeight, depth)

        if (node.left) traverse(node.left, depth + 1)
        if (node.right) traverse(node.right, depth + 1)
      }

      traverse(tree, 0)

      // Simple balance check (not perfect but gives an idea)
      const checkBalance = (node: any): number => {
        if (!node) return 0

        const leftHeight = checkBalance(node.left)
        const rightHeight = checkBalance(node.right)

        if (Math.abs(leftHeight - rightHeight) > 1) {
          isBalanced = false
        }

        return Math.max(leftHeight, rightHeight) + 1
      }

      checkBalance(tree)

      return {
        totalNodes,
        height: maxHeight,
        isBalanced,
      }
    },
    [getCurrentTree, activeTree],
  )

  return {
    activeTree,
    setActiveTree,
    insertValue,
    deleteValue,
    searchValue,
    insertMultipleValues,
    reset,
    resetAll,
    getCurrentTree,
    getSteps,
    getNodePositions,
    getTreeStats,
  }
}
