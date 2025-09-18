export interface BSTNode {
  value: number
  left: BSTNode | null
  right: BSTNode | null
  parent: BSTNode | null
  id: string
}

export interface BSTStep {
  id: string
  description: string
  type: "insert" | "delete" | "search" | "initial"
  affectedNodes: string[]
  tree: BSTNode | null
}

export class BinarySearchTree {
  private root: BSTNode | null = null
  private steps: BSTStep[] = []
  private nodeIdCounter = 0

  constructor() {
    this.addStep("initial", "BST inicializada vazia", [])
  }

  private createNode(value: number): BSTNode {
    return {
      value,
      left: null,
      right: null,
      parent: null,
      id: `bst-node-${++this.nodeIdCounter}`,
    }
  }

  private addStep(type: BSTStep["type"], description: string, affectedNodes: string[]): void {
    this.steps.push({
      id: `bst-step-${this.steps.length}`,
      description,
      type,
      affectedNodes,
      tree: this.cloneTree(this.root),
    })
  }

  private cloneTree(node: BSTNode | null): BSTNode | null {
    if (!node) return null

    const cloned: BSTNode = {
      value: node.value,
      left: null,
      right: null,
      parent: null,
      id: node.id,
    }

    cloned.left = this.cloneTree(node.left)
    cloned.right = this.cloneTree(node.right)

    if (cloned.left) cloned.left.parent = cloned
    if (cloned.right) cloned.right.parent = cloned

    return cloned
  }

  insert(value: number): void {
    const newNode = this.createNode(value)

    if (!this.root) {
      this.root = newNode
      this.addStep("insert", `Inserido nó ${value} como raiz`, [newNode.id])
      return
    }

    let current = this.root
    let parent: BSTNode | null = null

    while (current) {
      parent = current
      if (value < current.value) {
        current = current.left
      } else if (value > current.value) {
        current = current.right
      } else {
        return // Value already exists
      }
    }

    newNode.parent = parent
    if (value < parent!.value) {
      parent!.left = newNode
    } else {
      parent!.right = newNode
    }

    this.addStep("insert", `Inserido nó ${value} como filho de ${parent!.value}`, [newNode.id])
  }

  search(value: number): BSTNode | null {
    let current = this.root
    while (current) {
      if (value === current.value) {
        this.addStep("search", `Valor ${value} encontrado`, [current.id])
        return current
      } else if (value < current.value) {
        current = current.left
      } else {
        current = current.right
      }
    }
    this.addStep("search", `Valor ${value} não encontrado`, [])
    return null
  }

  delete(value: number): boolean {
    const nodeToDelete = this.findNode(value)
    if (!nodeToDelete) {
      return false
    }

    if (!nodeToDelete.left) {
      this.transplant(nodeToDelete, nodeToDelete.right)
    } else if (!nodeToDelete.right) {
      this.transplant(nodeToDelete, nodeToDelete.left)
    } else {
      const successor = this.findMin(nodeToDelete.right)
      if (successor.parent !== nodeToDelete) {
        this.transplant(successor, successor.right)
        successor.right = nodeToDelete.right
        if (successor.right) successor.right.parent = successor
      }
      this.transplant(nodeToDelete, successor)
      successor.left = nodeToDelete.left
      if (successor.left) successor.left.parent = successor
    }

    this.addStep("delete", `Removido nó ${value}`, [nodeToDelete.id])
    return true
  }

  private findNode(value: number): BSTNode | null {
    let current = this.root
    while (current) {
      if (value === current.value) {
        return current
      } else if (value < current.value) {
        current = current.left
      } else {
        current = current.right
      }
    }
    return null
  }

  private findMin(node: BSTNode): BSTNode {
    while (node.left) {
      node = node.left
    }
    return node
  }

  private transplant(u: BSTNode, v: BSTNode | null): void {
    if (!u.parent) {
      this.root = v
    } else if (u === u.parent.left) {
      u.parent.left = v
    } else {
      u.parent.right = v
    }
    if (v) {
      v.parent = u.parent
    }
  }

  getSteps(): BSTStep[] {
    return this.steps
  }

  getRoot(): BSTNode | null {
    return this.root
  }

  reset(): void {
    this.root = null
    this.steps = []
    this.nodeIdCounter = 0
    this.addStep("initial", "BST resetada", [])
  }

  calculateNodePositions(node: BSTNode | null, x = 0, y = 0, spacing = 100): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>()

    if (!node) return positions

    const calculateSubtreeWidth = (n: BSTNode | null): number => {
      if (!n) return 0
      return 1 + calculateSubtreeWidth(n.left) + calculateSubtreeWidth(n.right)
    }

    const positionNodes = (n: BSTNode | null, currentX: number, currentY: number, levelSpacing: number): number => {
      if (!n) return currentX

      const leftWidth = calculateSubtreeWidth(n.left)
      const nodeX = currentX + leftWidth * levelSpacing

      positions.set(n.id, { x: nodeX, y: currentY })

      let nextX = currentX
      nextX = positionNodes(n.left, nextX, currentY + 80, levelSpacing * 0.7)
      nextX = positionNodes(n.right, nodeX + levelSpacing, currentY + 80, levelSpacing * 0.7)

      return nextX
    }

    positionNodes(node, x, y, spacing)
    return positions
  }
}
