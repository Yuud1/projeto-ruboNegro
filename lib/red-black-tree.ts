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
  meta?: any
}

export class RedBlackTree {
  private root: TreeNode | null = null
  private steps: TreeStep[] = []
  private nodeIdCounter = 0
  private currentRootOp: 'insert' | 'delete' | null = null

  constructor() {
    this.addStep("initial", "Árvore inicializada vazia", [], { rootOp: 'initial' })
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

  private addStep(type: TreeStep["type"], description: string, affectedNodes: string[], meta?: any): void {
    this.steps.push({
      id: `step-${this.steps.length}`,
      description,
      type,
      affectedNodes,
      tree: this.cloneTree(this.root),
      meta,
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

    this.addStep("rotate-left", `Rotação à esquerda no nó ${node.value}`, [node.id, rightChild.id], {
      rootOp: this.currentRootOp || 'insert',
      parentSide: rightChild.parent ? (rightChild.parent.left === rightChild ? 'left' : 'right') : null,
    })
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

    this.addStep("rotate-right", `Rotação à direita no nó ${node.value}`, [node.id, leftChild.id], {
      rootOp: this.currentRootOp || 'insert',
      parentSide: leftChild.parent ? (leftChild.parent.left === leftChild ? 'left' : 'right') : null,
    })
  }

  private fixInsert(node: TreeNode): void {
    while (node.parent && node.parent.color === NodeColor.RED) {
      if (node.parent === node.parent.parent?.left) {
        const uncle = node.parent.parent.right

        if (uncle && uncle.color === NodeColor.RED) {
          node.parent.color = NodeColor.BLACK
          uncle.color = NodeColor.BLACK
          node.parent.parent.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: pai ${node.parent.value} e tio ${uncle.value} ficam pretos, avô ${node.parent.parent.value} fica vermelho`,
            [node.parent.id, uncle.id, node.parent.parent.id],
            { rootOp: this.currentRootOp || 'insert', case: 'uncle-red', parentSide: 'left' }
          )
          node = node.parent.parent
        } else {
          if (node === node.parent.right) {
            node = node.parent
            this.addStep("recolor", `Preparando rotação esquerda (triângulo)`, [node.id], { rootOp: this.currentRootOp || 'insert', case: 'triangle', parentSide: 'left' })
            this.rotateLeft(node)
          }
          node.parent!.color = NodeColor.BLACK
          node.parent!.parent!.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: pai ${node.parent!.value} fica preto, avô ${node.parent!.parent!.value} fica vermelho`,
            [node.parent!.id, node.parent!.parent!.id],
            { rootOp: this.currentRootOp || 'insert', case: 'line', parentSide: 'left' }
          )
          this.rotateRight(node.parent!.parent!)
        }
      } else {
        const uncle = node.parent.parent?.left

        if (uncle && uncle.color === NodeColor.RED) {
          node.parent.color = NodeColor.BLACK
          uncle.color = NodeColor.BLACK
          node.parent.parent!.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: pai ${node.parent.value} e tio ${uncle.value} ficam pretos, avô ${node.parent.parent!.value} fica vermelho`,
            [node.parent.id, uncle.id, node.parent.parent!.id],
            { rootOp: this.currentRootOp || 'insert', case: 'uncle-red', parentSide: 'right' }
          )
          node = node.parent.parent!
        } else {
          if (node === node.parent.left) {
            node = node.parent
            this.addStep("recolor", `Preparando rotação direita (triângulo)`, [node.id], { rootOp: this.currentRootOp || 'insert', case: 'triangle', parentSide: 'right' })
            this.rotateRight(node)
          }
          // Case 3: Node is right child
          node.parent!.color = NodeColor.BLACK
          node.parent!.parent!.color = NodeColor.RED
          this.addStep(
            "recolor",
            `Recoloração: pai ${node.parent!.value} fica preto, avô ${node.parent!.parent!.value} fica vermelho`,
            [node.parent!.id, node.parent!.parent!.id],
            { rootOp: this.currentRootOp || 'insert', case: 'line', parentSide: 'right' }
          )
          this.rotateLeft(node.parent!.parent!)
        }
      }
    }

    if (this.root && this.root.color === NodeColor.RED) {
      this.root.color = NodeColor.BLACK
      this.addStep("recolor", "Raiz recolorida para preto", [this.root.id], { rootOp: this.currentRootOp || 'insert' })
    }
  }

  insert(value: number): void {
    this.currentRootOp = 'insert'
    const newNode = this.createNode(value)

    if (!this.root) {
      this.root = newNode
      this.root.color = NodeColor.BLACK
      this.addStep("insert", `Inserido nó ${value} como raiz (preto)`, [newNode.id], { rootOp: 'insert', isRoot: true })
      this.currentRootOp = null
      return
    }

    let current = this.root
    let parent: TreeNode | null = null

    while (current) {
      parent = current
      if (value < current.value) {
        current = current.left!
      } else if (value > current.value) {
        current = current.right!
      } else {
        return
      }
    }

    if (!parent) {
      this.root = newNode
    } else {
      newNode.parent = parent
      if (value < parent.value) {
        parent.left = newNode
      } else {
        parent.right = newNode
      }
    }

    this.addStep("insert", `Inserido nó ${value} (vermelho)${parent ? ` como filho de ${parent.value}` : ' como raiz'}`, [newNode.id], {
      rootOp: 'insert',
      direction: parent && value < parent.value ? 'left' : 'right',
      isRoot: false,
    })

    this.fixInsert(newNode)
    this.currentRootOp = null
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

  private fixDelete(node: TreeNode | null, parent: TreeNode | null, isLeftChild: boolean): void {
    while ((node !== this.root) && (node == null || node.color === NodeColor.BLACK)) {
      if (isLeftChild) {
        let sibling = parent ? parent.right : null
        if (sibling && sibling.color === NodeColor.RED) {
          sibling.color = NodeColor.BLACK
          if (parent) parent.color = NodeColor.RED
          this.addStep("recolor", `Recoloração: irmão ${sibling.value} fica preto, pai ${parent?.value} fica vermelho`, [sibling.id, parent?.id || ''], {
            rootOp: 'delete', isLeftChild: true, siblingColor: 'RED'
          })
          if (parent) this.rotateLeft(parent)
          sibling = parent ? parent.right : null
        }

        if (sibling && 
            (!sibling.left || sibling.left.color === NodeColor.BLACK) &&
            (!sibling.right || sibling.right.color === NodeColor.BLACK)) {
          sibling.color = NodeColor.RED
          this.addStep("recolor", `Recoloração: irmão ${sibling.value} fica vermelho`, [sibling.id], {
            rootOp: 'delete', isLeftChild: true, bothChildrenBlack: true
          })
          node = parent
          parent = node ? node.parent : null
          isLeftChild = parent ? (node === parent.left) : false
        } else {
          if (sibling && (!sibling.right || sibling.right.color === NodeColor.BLACK)) {
            if (sibling.left) sibling.left.color = NodeColor.BLACK
            sibling.color = NodeColor.RED
            this.addStep("recolor", `Recoloração: sobrinho esquerdo fica preto, irmão ${sibling.value} fica vermelho`, [sibling.left?.id || '', sibling.id], {
              rootOp: 'delete', isLeftChild: true, rightChildBlack: true
            })
            this.rotateRight(sibling)
            sibling = parent ? parent.right : null
          }
          
          if (sibling) {
            sibling.color = parent?.color || NodeColor.BLACK
            if (parent) parent.color = NodeColor.BLACK
            if (sibling.right) sibling.right.color = NodeColor.BLACK
            this.addStep("recolor", `Recoloração final: irmão ${sibling.value} herda cor do pai, pai fica preto, sobrinho direito fica preto`, [sibling.id, parent?.id || '', sibling.right?.id || ''], {
              rootOp: 'delete', isLeftChild: true
            })
            if (parent) this.rotateLeft(parent)
          }
          node = this.root
          parent = null
        }
      } else {
        let sibling = parent ? parent.left : null
        if (sibling && sibling.color === NodeColor.RED) {
          sibling.color = NodeColor.BLACK
          if (parent) parent.color = NodeColor.RED
          this.addStep("recolor", `Recoloração: irmão ${sibling.value} fica preto, pai ${parent?.value} fica vermelho`, [sibling.id, parent?.id || ''], {
            rootOp: 'delete', isLeftChild: false, siblingColor: 'RED'
          })
          if (parent) this.rotateRight(parent)
          sibling = parent ? parent.left : null
        }

        if (sibling && 
            (!sibling.left || sibling.left.color === NodeColor.BLACK) &&
            (!sibling.right || sibling.right.color === NodeColor.BLACK)) {
          sibling.color = NodeColor.RED
          this.addStep("recolor", `Recoloração: irmão ${sibling.value} fica vermelho`, [sibling.id], {
            rootOp: 'delete', isLeftChild: false, bothChildrenBlack: true
          })
          node = parent
          parent = node ? node.parent : null
          isLeftChild = parent ? (node === parent.left) : false
        } else {
          if (sibling && (!sibling.left || sibling.left.color === NodeColor.BLACK)) {
            if (sibling.right) sibling.right.color = NodeColor.BLACK
            sibling.color = NodeColor.RED
            this.addStep("recolor", `Recoloração: sobrinho direito fica preto, irmão ${sibling.value} fica vermelho`, [sibling.right?.id || '', sibling.id], {
              rootOp: 'delete', isLeftChild: false, leftChildBlack: true
            })
            this.rotateLeft(sibling)
            sibling = parent ? parent.left : null
          }
          
          if (sibling) {
            sibling.color = parent?.color || NodeColor.BLACK
            if (parent) parent.color = NodeColor.BLACK
            if (sibling.left) sibling.left.color = NodeColor.BLACK
            this.addStep("recolor", `Recoloração final: irmão ${sibling.value} herda cor do pai, pai fica preto, sobrinho esquerdo fica preto`, [sibling.id, parent?.id || '', sibling.left?.id || ''], {
              rootOp: 'delete', isLeftChild: false
            })
            if (parent) this.rotateRight(parent)
          }
          node = this.root
          parent = null
        }
      }
    }

    if (node) {
      node.color = NodeColor.BLACK
      this.addStep("recolor", `Nó ${node.value} recolorido para preto`, [node.id], { rootOp: 'delete' })
    }
  }

  delete(value: number): boolean {
    this.currentRootOp = 'delete'
    const nodeToDelete = this.findNode(value)
    if (!nodeToDelete) {
      return false
    }

    let nodeToFix: TreeNode | null = null
    let originalColor = nodeToDelete.color

    if (!nodeToDelete.left) {
      nodeToFix = nodeToDelete.right
      const parentAfter = nodeToDelete.parent
      const isLeftChild = parentAfter ? (nodeToDelete === parentAfter.left) : false
      this.transplant(nodeToDelete, nodeToDelete.right)
      this.addStep("delete", `Removido nó ${value}`, [nodeToDelete.id], {
        rootOp: 'delete',
        hasLeftChild: !!nodeToDelete.left,
        hasRightChild: !!nodeToDelete.right,
        originalColor: originalColor === NodeColor.BLACK ? 'BLACK' : 'RED'
      })
      if (originalColor === NodeColor.BLACK) {
        this.fixDelete(nodeToFix, parentAfter, isLeftChild)
      }
      this.currentRootOp = null
      return true
    } else if (!nodeToDelete.right) {
      nodeToFix = nodeToDelete.left
      const parentAfter = nodeToDelete.parent
      const isLeftChild = parentAfter ? (nodeToDelete === parentAfter.left) : false
      this.transplant(nodeToDelete, nodeToDelete.left)
      this.addStep("delete", `Removido nó ${value}`, [nodeToDelete.id], {
        rootOp: 'delete',
        hasLeftChild: !!nodeToDelete.left,
        hasRightChild: !!nodeToDelete.right,
        originalColor: originalColor === NodeColor.BLACK ? 'BLACK' : 'RED'
      })
      if (originalColor === NodeColor.BLACK) {
        this.fixDelete(nodeToFix, parentAfter, isLeftChild)
      }
      this.currentRootOp = null
      return true
    } else {
      const successor = this.findMin(nodeToDelete.right)
      originalColor = successor.color
      nodeToFix = successor.right

      const isSuccessorChild = successor.parent === nodeToDelete
      let parentForFix: TreeNode | null
      let isLeftChildFix = false
      if (isSuccessorChild) {
        parentForFix = successor
        isLeftChildFix = false
        if (nodeToFix) nodeToFix.parent = successor
      } else {
        parentForFix = successor.parent || null
        isLeftChildFix = false
        this.transplant(successor, successor.right)
        successor.right = nodeToDelete.right
        if (successor.right) successor.right.parent = successor
      }

      this.transplant(nodeToDelete, successor)
      successor.left = nodeToDelete.left
      if (successor.left) successor.left.parent = successor
      successor.color = nodeToDelete.color
      this.addStep("delete", `Removido nó ${value}`, [nodeToDelete.id], {
        rootOp: 'delete',
        hasLeftChild: !!nodeToDelete.left,
        hasRightChild: !!nodeToDelete.right,
        isSuccessorChild,
        originalColor: originalColor === NodeColor.BLACK ? 'BLACK' : 'RED'
      })
      if (originalColor === NodeColor.BLACK) {
        this.fixDelete(nodeToFix, parentForFix, isLeftChildFix)
      }
      this.currentRootOp = null
      return true
    }
    // unreachable
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

  getTreeAtStep(stepIndex: number): TreeNode | null {
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      return null
    }
    return this.steps[stepIndex].tree
  }

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
