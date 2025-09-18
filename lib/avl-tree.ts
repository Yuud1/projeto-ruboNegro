export interface AVLNode {
  value: number
  left: AVLNode | null
  right: AVLNode | null
  parent: AVLNode | null
  height: number
  id: string
}

export interface AVLStep {
  id: string
  description: string
  type: "insert" | "delete" | "search" | "rotate-left" | "rotate-right" | "initial"
  affectedNodes: string[]
  tree: AVLNode | null
}

export class AVLTree {
  private root: AVLNode | null = null
  private steps: AVLStep[] = []
  private nodeIdCounter = 0

  constructor() {
    this.addStep("initial", "AVL inicializada vazia", [])
  }

  private createNode(value: number): AVLNode {
    return {
      value,
      left: null,
      right: null,
      parent: null,
      height: 1,
      id: `avl-node-${++this.nodeIdCounter}`,
    }
  }

  private addStep(type: AVLStep["type"], description: string, affectedNodes: string[]): void {
    this.steps.push({
      id: `avl-step-${this.steps.length}`,
      description,
      type,
      affectedNodes,
      tree: this.cloneTree(this.root),
    })
  }

  private cloneTree(node: AVLNode | null): AVLNode | null {
    if (!node) return null

    const cloned: AVLNode = {
      value: node.value,
      left: null,
      right: null,
      parent: null,
      height: node.height,
      id: node.id,
    }

    cloned.left = this.cloneTree(node.left)
    cloned.right = this.cloneTree(node.right)

    if (cloned.left) cloned.left.parent = cloned
    if (cloned.right) cloned.right.parent = cloned

    return cloned
  }

  private getHeight(node: AVLNode | null): number {
    return node ? node.height : 0
  }

  private getBalance(node: AVLNode | null): number {
    if (!node) return 0
    return this.getHeight(node.left) - this.getHeight(node.right)
  }

  private updateHeight(node: AVLNode): void {
    node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1
  }

  private rotateRight(node: AVLNode): AVLNode {
    const leftChild = node.left!
    const rightSubtree = leftChild.right

    leftChild.right = node
    node.left = rightSubtree

    if (rightSubtree) {
      rightSubtree.parent = node
    }

    leftChild.parent = node.parent
    node.parent = leftChild

    if (leftChild.parent) {
      if (leftChild.parent.left === node) {
        leftChild.parent.left = leftChild
      } else {
        leftChild.parent.right = leftChild
      }
    } else {
      this.root = leftChild
    }

    this.updateHeight(node)
    this.updateHeight(leftChild)

    this.addStep("rotate-right", `Rotação à direita no nó ${node.value}`, [node.id, leftChild.id])
    return leftChild
  }

  private rotateLeft(node: AVLNode): AVLNode {
    const rightChild = node.right!
    const leftSubtree = rightChild.left

    rightChild.left = node
    node.right = leftSubtree

    if (leftSubtree) {
      leftSubtree.parent = node
    }

    rightChild.parent = node.parent
    node.parent = rightChild

    if (rightChild.parent) {
      if (rightChild.parent.left === node) {
        rightChild.parent.left = rightChild
      } else {
        rightChild.parent.right = rightChild
      }
    } else {
      this.root = rightChild
    }

    this.updateHeight(node)
    this.updateHeight(rightChild)

    this.addStep("rotate-left", `Rotação à esquerda no nó ${node.value}`, [node.id, rightChild.id])
    return rightChild
  }

  private balanceNode(node: AVLNode): AVLNode {
    this.updateHeight(node)
    const balance = this.getBalance(node)

    // Left Left Case
    if (balance > 1 && this.getBalance(node.left) >= 0) {
      return this.rotateRight(node)
    }

    // Left Right Case
    if (balance > 1 && this.getBalance(node.left) < 0) {
      if (node.left) {
        node.left = this.rotateLeft(node.left)
      }
      return this.rotateRight(node)
    }

    // Right Right Case
    if (balance < -1 && this.getBalance(node.right) <= 0) {
      return this.rotateLeft(node)
    }

    // Right Left Case
    if (balance < -1 && this.getBalance(node.right) > 0) {
      if (node.right) {
        node.right = this.rotateRight(node.right)
      }
      return this.rotateLeft(node)
    }

    return node
  }

  insert(value: number): void {
    this.root = this.insertNode(this.root, value)
  }

  private insertNode(node: AVLNode | null, value: number): AVLNode {
    if (!node) {
      const newNode = this.createNode(value)
      this.addStep("insert", `Inserido nó ${value}`, [newNode.id])
      return newNode
    }

    if (value < node.value) {
      node.left = this.insertNode(node.left, value)
      if (node.left) node.left.parent = node
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value)
      if (node.right) node.right.parent = node
    } else {
      return node // Value already exists
    }

    return this.balanceNode(node)
  }

  search(value: number): AVLNode | null {
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

    this.root = this.deleteNode(this.root, value)
    this.addStep("delete", `Removido nó ${value}`, [nodeToDelete.id])
    return true
  }

  private deleteNode(node: AVLNode | null, value: number): AVLNode | null {
    if (!node) return null

    if (value < node.value) {
      node.left = this.deleteNode(node.left, value)
      if (node.left) node.left.parent = node
    } else if (value > node.value) {
      node.right = this.deleteNode(node.right, value)
      if (node.right) node.right.parent = node
    } else {
      if (!node.left || !node.right) {
        const temp = node.left || node.right
        if (!temp) {
          return null
        }
        return temp
      }

      const successor = this.findMin(node.right)
      node.value = successor.value
      node.right = this.deleteNode(node.right, successor.value)
      if (node.right) node.right.parent = node
    }

    return this.balanceNode(node)
  }

  private findNode(value: number): AVLNode | null {
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

  private findMin(node: AVLNode): AVLNode {
    while (node.left) {
      node = node.left
    }
    return node
  }

  getSteps(): AVLStep[] {
    return this.steps
  }

  getRoot(): AVLNode | null {
    return this.root
  }

  reset(): void {
    this.root = null
    this.steps = []
    this.nodeIdCounter = 0
    this.addStep("initial", "AVL resetada", [])
  }

  calculateNodePositions(node: AVLNode | null, x = 0, y = 0, spacing = 100): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>()

    if (!node) return positions

    const calculateSubtreeWidth = (n: AVLNode | null): number => {
      if (!n) return 0
      return 1 + calculateSubtreeWidth(n.left) + calculateSubtreeWidth(n.right)
    }

    const positionNodes = (n: AVLNode | null, currentX: number, currentY: number, levelSpacing: number): number => {
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
