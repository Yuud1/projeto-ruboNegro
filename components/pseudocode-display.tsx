"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PseudocodeLine {
  number: number
  code: string
  isActive?: boolean
  isExecuted?: boolean
  condition?: boolean
  comment?: string
}

interface PseudocodeDisplayProps {
  algorithm: 'insert' | 'insert-fixup' | 'left-rotate' | 'right-rotate' | 'delete' | 'delete-fixup'
  activeLines?: number[]
  executedLines?: number[]
  conditions?: { [lineNumber: number]: boolean }
  comments?: { [lineNumber: number]: string }
  showRotationAlgorithms?: boolean
}

const algorithms = {
  insert: {
    title: "RB-INSERT(T, z)",
    lines: [
      { number: 1, code: "y = T.nil" },
      { number: 2, code: "x = T.root" },
      { number: 3, code: "while x != T.nil" },
      { number: 4, code: "  y = x" },
      { number: 5, code: "  if z.key < x.key" },
      { number: 6, code: "    x = x.left" },
      { number: 7, code: "  else x = x.right" },
      { number: 8, code: "z.p = y" },
      { number: 9, code: "if y == T.nil" },
      { number: 10, code: "  T.root = z" },
      { number: 11, code: "elseif z.key < y.key" },
      { number: 12, code: "  y.left = z" },
      { number: 13, code: "else y.right = z" },
      { number: 14, code: "z.left = T.nil" },
      { number: 15, code: "z.right = T.nil" },
      { number: 16, code: "z.color = RED" },
      { number: 17, code: "RB-INSERT-FIXUP(T, z)" }
    ]
  },
  'insert-fixup': {
    title: "RB-INSERT-FIXUP(T, z)",
    lines: [
      { number: 1, code: "while z.p.color == RED" },
      { number: 2, code: "  if z.p == z.p.p.left" },
      { number: 3, code: "    y = z.p.p.right" },
      { number: 4, code: "    if y.color == RED" },
      { number: 5, code: "      z.p.color = BLACK" },
      { number: 6, code: "      y.color = BLACK" },
      { number: 7, code: "      z.p.p.color = RED" },
      { number: 8, code: "      z = z.p.p" },
      { number: 9, code: "    else" },
      { number: 10, code: "      if z == z.p.right" },
      { number: 11, code: "        z = z.p" },
      { number: 12, code: "        LEFT-ROTATE(T, z)" },
      { number: 13, code: "      z.p.color = BLACK" },
      { number: 14, code: "      z.p.p.color = RED" },
      { number: 15, code: "      RIGHT-ROTATE(T, z.p.p)" },
      { number: 16, code: "  else" },
      { number: 17, code: "    y = z.p.p.left" },
      { number: 18, code: "    if y.color == RED" },
      { number: 19, code: "      z.p.color = BLACK" },
      { number: 20, code: "      y.color = BLACK" },
      { number: 21, code: "      z.p.p.color = RED" },
      { number: 22, code: "      z = z.p.p" },
      { number: 23, code: "    else" },
      { number: 24, code: "      if z == z.p.left" },
      { number: 25, code: "        z = z.p" },
      { number: 26, code: "        RIGHT-ROTATE(T, z)" },
      { number: 27, code: "      z.p.color = BLACK" },
      { number: 28, code: "      z.p.p.color = RED" },
      { number: 29, code: "      LEFT-ROTATE(T, z.p.p)" },
      { number: 30, code: "T.root.color = BLACK" }
    ]
  },
  'left-rotate': {
    title: "LEFT-ROTATE(T, x)",
    lines: [
      { number: 1, code: "y = x.right" },
      { number: 2, code: "x.right = y.left" },
      { number: 3, code: "if y.left != T.nil" },
      { number: 4, code: "  y.left.p = x" },
      { number: 5, code: "y.p = x.p" },
      { number: 6, code: "if x.p == T.nil" },
      { number: 7, code: "  T.root = y" },
      { number: 8, code: "elseif x == x.p.left" },
      { number: 9, code: "  x.p.left = y" },
      { number: 10, code: "else x.p.right = y" },
      { number: 11, code: "y.left = x" },
      { number: 12, code: "x.p = y" }
    ]
  },
  'right-rotate': {
    title: "RIGHT-ROTATE(T, y)",
    lines: [
      { number: 1, code: "x = y.left" },
      { number: 2, code: "y.left = x.right" },
      { number: 3, code: "if x.right != T.nil" },
      { number: 4, code: "  x.right.p = y" },
      { number: 5, code: "x.p = y.p" },
      { number: 6, code: "if y.p == T.nil" },
      { number: 7, code: "  T.root = x" },
      { number: 8, code: "elseif y == y.p.right" },
      { number: 9, code: "  y.p.right = x" },
      { number: 10, code: "else y.p.left = x" },
      { number: 11, code: "x.right = y" },
      { number: 12, code: "y.p = x" }
    ]
  },
  delete: {
    title: "RB-DELETE(T, z)",
    lines: [
      { number: 1, code: "y = z" },
      { number: 2, code: "y-original-color = y.color" },
      { number: 3, code: "if z.left == T.nil" },
      { number: 4, code: "  x = z.right" },
      { number: 5, code: "  RB-TRANSPLANT(T, z, z.right)" },
      { number: 6, code: "elseif z.right == T.nil" },
      { number: 7, code: "  x = z.left" },
      { number: 8, code: "  RB-TRANSPLANT(T, z, z.left)" },
      { number: 9, code: "else" },
      { number: 10, code: "  y = TREE-MINIMUM(z.right)" },
      { number: 11, code: "  y-original-color = y.color" },
      { number: 12, code: "  x = y.right" },
      { number: 13, code: "  if y.p == z" },
      { number: 14, code: "    x.p = y" },
      { number: 15, code: "  else" },
      { number: 16, code: "    RB-TRANSPLANT(T, y, y.right)" },
      { number: 17, code: "    y.right = z.right" },
      { number: 18, code: "    y.right.p = y" },
      { number: 19, code: "  RB-TRANSPLANT(T, z, y)" },
      { number: 20, code: "  y.left = z.left" },
      { number: 21, code: "  y.left.p = y" },
      { number: 22, code: "  y.color = z.color" },
      { number: 23, code: "if y-original-color == BLACK" },
      { number: 24, code: "  RB-DELETE-FIXUP(T, x)" }
    ]
  },
  'delete-fixup': {
    title: "RB-DELETE-FIXUP(T, x)",
    lines: [
      { number: 1, code: "while x != T.root and x.color == BLACK" },
      { number: 2, code: "  if x == x.p.left" },
      { number: 3, code: "    w = x.p.right" },
      { number: 4, code: "    if w.color == RED" },
      { number: 5, code: "      w.color = BLACK" },
      { number: 6, code: "      x.p.color = RED" },
      { number: 7, code: "      LEFT-ROTATE(T, x.p)" },
      { number: 8, code: "      w = x.p.right" },
      { number: 9, code: "    if w.left.color == BLACK and w.right.color == BLACK" },
      { number: 10, code: "      w.color = RED" },
      { number: 11, code: "      x = x.p" },
      { number: 12, code: "    else" },
      { number: 13, code: "      if w.right.color == BLACK" },
      { number: 14, code: "        w.left.color = BLACK" },
      { number: 15, code: "        w.color = RED" },
      { number: 16, code: "        RIGHT-ROTATE(T, w)" },
      { number: 17, code: "        w = x.p.right" },
      { number: 18, code: "      w.color = x.p.color" },
      { number: 19, code: "      x.p.color = BLACK" },
      { number: 20, code: "      w.right.color = BLACK" },
      { number: 21, code: "      LEFT-ROTATE(T, x.p)" },
      { number: 22, code: "      x = T.root" },
      { number: 23, code: "  else" },
      { number: 24, code: "    w = x.p.left" },
      { number: 25, code: "    if w.color == RED" },
      { number: 26, code: "      w.color = BLACK" },
      { number: 27, code: "      x.p.color = RED" },
      { number: 28, code: "      RIGHT-ROTATE(T, x.p)" },
      { number: 29, code: "      w = x.p.left" },
      { number: 30, code: "    if w.right.color == BLACK and w.left.color == BLACK" },
      { number: 31, code: "      w.color = RED" },
      { number: 32, code: "      x = x.p" },
      { number: 33, code: "    else" },
      { number: 34, code: "      if w.left.color == BLACK" },
      { number: 35, code: "        w.right.color = BLACK" },
      { number: 36, code: "        w.color = RED" },
      { number: 37, code: "        LEFT-ROTATE(T, w)" },
      { number: 38, code: "        w = x.p.left" },
      { number: 39, code: "      w.color = x.p.color" },
      { number: 40, code: "      x.p.color = BLACK" },
      { number: 41, code: "      w.left.color = BLACK" },
      { number: 42, code: "      RIGHT-ROTATE(T, x.p)" },
      { number: 43, code: "      x = T.root" },
      { number: 44, code: "x.color = BLACK" }
    ]
  }
}

export function PseudocodeDisplay({ 
  algorithm, 
  activeLines = [], 
  executedLines = [], 
  conditions = {},
  comments = {},
  showRotationAlgorithms = false
}: PseudocodeDisplayProps) {
  const algorithmData = algorithms[algorithm]
  
  const getLineStyle = (lineNumber: number) => {
    if (activeLines.includes(lineNumber)) {
      return "bg-green-100 border-l-4 border-green-500 text-green-900"
    }
    if (executedLines.includes(lineNumber)) {
      return "bg-blue-50 text-blue-800"
    }
    return "text-gray-700"
  }

  const getConditionBadge = (lineNumber: number) => {
    if (conditions[lineNumber] !== undefined) {
      return (
        <Badge 
          variant={conditions[lineNumber] ? "default" : "secondary"}
          className="ml-2 text-xs"
        >
          {conditions[lineNumber] ? "True" : "False"}
        </Badge>
      )
    }
    return null
  }

  const getComment = (lineNumber: number) => {
    if (comments[lineNumber]) {
      return (
        <div className="mt-1 text-xs text-gray-600 italic">
          {comments[lineNumber]}
        </div>
      )
    }
    return null
  }

  const renderAlgorithm = (alg: string, title: string, lines: any[]) => (
    <div className="space-y-0.5 font-mono text-xs">
      <h4 className="font-semibold text-sm mb-1">{title}</h4>
      {lines.map((line) => (
        <div key={line.number} className={`px-2 py-0.5 rounded ${getLineStyle(line.number)}`}>
          <div className="flex items-center">
            <span className="text-gray-500 w-6 text-right mr-2 text-xs">
              {line.number}
            </span>
            <span className="flex-1 text-xs">{line.code}</span>
            {getConditionBadge(line.number)}
          </div>
          {getComment(line.number)}
        </div>
      ))}
    </div>
  )

  return (
    <Card className="p-3 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h3 className="font-semibold text-base mb-2">{algorithmData.title}</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {renderAlgorithm(algorithm, algorithmData.title, algorithmData.lines)}
          
          {showRotationAlgorithms && (algorithm === 'insert-fixup') && (
            <div className="mt-3 space-y-2">
              <div className="border-t pt-2">
                {renderAlgorithm('left-rotate', 'LEFT-ROTATE(T, x)', algorithms['left-rotate'].lines)}
              </div>
              <div className="border-t pt-2">
                {renderAlgorithm('right-rotate', 'RIGHT-ROTATE(T, y)', algorithms['right-rotate'].lines)}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-shrink-0 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-100 border border-green-500 rounded"></div>
            <span className="text-xs">Ativa</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-50 border border-blue-300 rounded"></div>
            <span className="text-xs">Executada</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
