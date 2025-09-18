export enum NodeColor {
  RED = "red",
  BLACK = "black",
}

export interface TreeNode {
  value: number
  color: NodeColor
  left: TreeNode | null
  right: TreeNode | null
  parent: TreeNode | null
  id: string
}

export interface TreeStep {
  id: string
  description: string
  type: "insert" | "delete" | "recolor" | "rotate-left" | "rotate-right" | "initial"
  affectedNodes: string[]
  tree: TreeNode | null
}

export class RedBlackTree {
  private root: TreeNode | null = null
  private steps: TreeStep[] = []
  private nodeIdCounter = 0

  constructor() {
    this.addStep("initial", "Árvore inicializada vazia", [])
  }

  private createNode(value: number): TreeNode {
    return {
      value,
      color: NodeColor.RED,
      left: null,
      right: null,
      parent: null,
      id: `node-${++this.nodeIdCounter}`,
    }
  }

  private addStep(type: TreeStep["type"], description: string, affectedNodes: string[]): void {
    this.steps.push({
      id: `step-${this.steps.length}`,
      description,
      type,
      affectedNodes,
      tree: this.cloneTree(this.root),
    })
  }

  private cloneTree(node: TreeNode | null): TreeNode | null {
    if (!node) return null

    const cloned: TreeNode = {
      value: node.value,
      color: node.color,
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

  private rotateLeft(node: TreeNode): void {
    const rightChild = node.right!
    node.right = rightChild.left

    if (rightChild.left) {
      rightChild.left.parent = node
    }

    rightChild.parent = node.parent

    if (!node.parent) {
      this.root = rightChild
    } else if (node === node.parent.left) {
      node.parent.left = rightChild
    } else {
      node.parent.right = rightChild
    }

    rightChild.left = node
    node.parent = rightChild

    this.addStep("rotate-left", `Rotação à esquerda no nó ${node.value}`, [node.id, rightChild.id])
  }

  private rotateRight(node: TreeNode): void {
    const leftChild = node.left!
    node.left = leftChild.right

    if (leftChild.right) {
      leftChild.right.parent = node
    }

    leftChild.parent = node.parent

    if (!node.parent) {
      this.root = leftChild
    } else if (node === node.parent.right) {
      node.parent.right = leftChild
    } else {
      node.parent.left = leftChild
    }

    leftChild.right = node
    node.parent = leftChild

    this.addStep("rotate-right", `Rotação à direita no nó ${node.value}`, [node.id, leftChild.id])
  }

  private fixInsert(node: TreeNode): void {
    while (node.parent && node.parent.color === NodeColor.RED) {
      if (node.parent === node.parent.parent?.left) {
        const uncle = node.parent.parent.right

        if (uncle && uncle.color === NodeColor.RED) {
          // Case 1: Uncle is red
          node.parent.color = NodeColor.BLACK
          uncle.color = NodeColor.BLACK
          node.parent.parent.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: pai ${node.parent.value} e tio ${uncle.value} ficam pretos, avô ${node.parent.parent.value} fica vermelho`,
            [node.parent.id, uncle.id, node.parent.parent.id],
          )
          node = node.parent.parent
        } else {
          if (node === node.parent.right) {
            // Case 2: Node is right child
            node = node.parent
            this.rotateLeft(node)
          }
          // Case 3: Node is left child
          node.parent!.color = NodeColor.BLACK
          node.parent!.parent!.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: pai ${node.parent!.value} fica preto, avô ${node.parent!.parent!.value} fica vermelho`,
            [node.parent!.id, node.parent!.parent!.id],
          )
          this.rotateRight(node.parent!.parent!)
        }
      } else {
        const uncle = node.parent.parent?.left

        if (uncle && uncle.color === NodeColor.RED) {
          // Case 1: Uncle is red
          node.parent.color = NodeColor.BLACK
          uncle.color = NodeColor.BLACK
          node.parent.parent!.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: pai ${node.parent.value} e tio ${uncle.value} ficam pretos, avô ${node.parent.parent!.value} fica vermelho`,
            [node.parent.id, uncle.id, node.parent.parent!.id],
          )
          node = node.parent.parent!
        } else {
          if (node === node.parent.left) {
            // Case 2: Node is left child
            node = node.parent
            this.rotateRight(node)
          }
          // Case 3: Node is right child
          node.parent!.color = NodeColor.BLACK
          node.parent!.parent!.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: pai ${node.parent!.value} fica preto, avô ${node.parent!.parent!.value} fica vermelho`,
            [node.parent!.id, node.parent!.parent!.id],
          )
          this.rotateLeft(node.parent!.parent!)
        }
      }
    }

    if (this.root && this.root.color === NodeColor.RED) {
      this.root.color = NodeColor.BLACK
      this.addStep("recolor", "Raiz recolorida para preto", [this.root.id])
    }
  }

  insert(value: number): void {
    const newNode = this.createNode(value)

    if (!this.root) {
      this.root = newNode
      this.root.color = NodeColor.BLACK
      this.addStep("insert", `Inserido nó ${value} como raiz (preto)`, [newNode.id])
      return
    }

    let current = this.root
    let parent: TreeNode | null = null

    // Find insertion point
    while (current) {
      parent = current
      if (value < current.value) {
        current = current.left
      } else if (value > current.value) {
        current = current.right
      } else {
        // Value already exists
        return
      }
    }

    newNode.parent = parent
    if (value < parent!.value) {
      parent!.left = newNode
    } else {
      parent!.right = newNode
    }

    this.addStep("insert", `Inserido nó ${value} (vermelho) como filho de ${parent!.value}`, [newNode.id])

    // Fix Red-Black Tree properties
    this.fixInsert(newNode)
  }

  private findNode(value: number): TreeNode | null {
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

  private findMin(node: TreeNode): TreeNode {
    while (node.left) {
      node = node.left
    }
    return node
  }

  private fixDelete(node: TreeNode | null): void {
    while (node && node !== this.root && node.color === NodeColor.BLACK) {
      if (node === node.parent?.left) {
        let sibling = node.parent.right
        if (sibling && sibling.color === NodeColor.RED) {
          // Case 1: Sibling is red
          sibling.color = NodeColor.BLACK
          node.parent.color = NodeColor.RED
          this.addStep("recolor", `Recoloração: irmão ${sibling.value} fica preto, pai ${node.parent.value} fica vermelho`, [sibling.id, node.parent.id])
          this.rotateLeft(node.parent)
          sibling = node.parent.right
        }

        if (sibling && 
            (!sibling.left || sibling.left.color === NodeColor.BLACK) &&
            (!sibling.right || sibling.right.color === NodeColor.BLACK)) {
          // Case 2: Sibling and its children are black
          sibling.color = NodeColor.RED
          this.addStep("recolor", `Recoloração: irmão ${sibling.value} fica vermelho`, [sibling.id])
          node = node.parent
        } else {
          if (sibling && (!sibling.right || sibling.right.color === NodeColor.BLACK)) {
            // Case 3: Sibling's right child is black
            if (sibling.left) sibling.left.color = NodeColor.BLACK
            sibling.color = NodeColor.RED
            this.addStep("recolor", `Recoloração: sobrinho esquerdo fica preto, irmão ${sibling.value} fica vermelho`, [sibling.left?.id || '', sibling.id])
            this.rotateRight(sibling)
            sibling = node.parent?.right
          }
          
          if (sibling) {
            sibling.color = node.parent?.color || NodeColor.BLACK
            if (node.parent) node.parent.color = NodeColor.BLACK
            if (sibling.right) sibling.right.color = NodeColor.BLACK
            this.addStep("recolor", `Recoloração final: irmão ${sibling.value} herda cor do pai, pai fica preto, sobrinho direito fica preto`, [sibling.id, node.parent?.id || '', sibling.right?.id || ''])
            this.rotateLeft(node.parent!)
          }
          node = this.root
        }
      } else {
        let sibling = node.parent?.left
        if (sibling && sibling.color === NodeColor.RED) {
          // Case 1: Sibling is red
          sibling.color = NodeColor.BLACK
          if (node.parent) node.parent.color = NodeColor.RED
          this.addStep("recolor", `Recoloração: irmão ${sibling.value} fica preto, pai ${node.parent?.value} fica vermelho`, [sibling.id, node.parent?.id || ''])
          this.rotateRight(node.parent!)
          sibling = node.parent?.left
        }

        if (sibling && 
            (!sibling.left || sibling.left.color === NodeColor.BLACK) &&
            (!sibling.right || sibling.right.color === NodeColor.BLACK)) {
          // Case 2: Sibling and its children are black
          sibling.color = NodeColor.RED
          this.addStep("recolor", `Recoloração: irmão ${sibling.value} fica vermelho`, [sibling.id])
          node = node.parent
        } else {
          if (sibling && (!sibling.left || sibling.left.color === NodeColor.BLACK)) {
            // Case 3: Sibling's left child is black
            if (sibling.right) sibling.right.color = NodeColor.BLACK
            sibling.color = NodeColor.RED
            this.addStep("recolor", `Recoloração: sobrinho direito fica preto, irmão ${sibling.value} fica vermelho`, [sibling.right?.id || '', sibling.id])
            this.rotateLeft(sibling)
            sibling = node.parent?.left
          }
          
          if (sibling) {
            sibling.color = node.parent?.color || NodeColor.BLACK
            if (node.parent) node.parent.color = NodeColor.BLACK
            if (sibling.left) sibling.left.color = NodeColor.BLACK
            this.addStep("recolor", `Recoloração final: irmão ${sibling.value} herda cor do pai, pai fica preto, sobrinho esquerdo fica preto`, [sibling.id, node.parent?.id || '', sibling.left?.id || ''])
            this.rotateRight(node.parent!)
          }
          node = this.root
        }
      }
    }

    if (node) {
      node.color = NodeColor.BLACK
      this.addStep("recolor", `Nó ${node.value} recolorido para preto`, [node.id])
    }
  }

  delete(value: number): boolean {
    const nodeToDelete = this.findNode(value)
    if (!nodeToDelete) {
      return false
    }

    let nodeToFix: TreeNode | null = null
    let originalColor = nodeToDelete.color

    if (!nodeToDelete.left) {
      // Node has no left child
      nodeToFix = nodeToDelete.right
      this.transplant(nodeToDelete, nodeToDelete.right)
    } else if (!nodeToDelete.right) {
      // Node has no right child
      nodeToFix = nodeToDelete.left
      this.transplant(nodeToDelete, nodeToDelete.left)
    } else {
      // Node has both children
      const successor = this.findMin(nodeToDelete.right)
      originalColor = successor.color
      nodeToFix = successor.right

      if (successor.parent === nodeToDelete) {
        if (nodeToFix) nodeToFix.parent = successor
      } else {
        this.transplant(successor, successor.right)
        successor.right = nodeToDelete.right
        if (successor.right) successor.right.parent = successor
      }

      this.transplant(nodeToDelete, successor)
      successor.left = nodeToDelete.left
      if (successor.left) successor.left.parent = successor
      successor.color = nodeToDelete.color
    }

    this.addStep("delete", `Removido nó ${value}`, [nodeToDelete.id])

    if (originalColor === NodeColor.BLACK) {
      this.fixDelete(nodeToFix)
    }

    return true
  }

  private transplant(u: TreeNode, v: TreeNode | null): void {
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

  search(value: number): TreeNode | null {
    return this.findNode(value)
  }

  getSteps(): TreeStep[] {
    return this.steps
  }

  getRoot(): TreeNode | null {
    return this.root
  }

  reset(): void {
    this.root = null
    this.steps = []
    this.nodeIdCounter = 0
    this.addStep("initial", "Árvore resetada", [])
  }

  generateRandomValues(count = 5): number[] {
    const values: number[] = []
    const used = new Set<number>()

    while (values.length < count) {
      const value = Math.floor(Math.random() * 100) + 1
      if (!used.has(value)) {
        used.add(value)
        values.push(value)
      }
    }

    return values
  }

  // Helper method to get tree at specific step
  getTreeAtStep(stepIndex: number): TreeNode | null {
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      return null
    }
    return this.steps[stepIndex].tree
  }

  // Helper method to calculate node positions for visualization
  calculateNodePositions(node: TreeNode | null, x = 0, y = 0, spacing = 100): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>()

    if (!node) return positions

    const calculateSubtreeWidth = (n: TreeNode | null): number => {
      if (!n) return 0
      return 1 + calculateSubtreeWidth(n.left) + calculateSubtreeWidth(n.right)
    }

    const positionNodes = (n: TreeNode | null, currentX: number, currentY: number, levelSpacing: number): number => {
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
