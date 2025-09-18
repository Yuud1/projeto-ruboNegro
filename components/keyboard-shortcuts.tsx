"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Keyboard, ChevronDown, Info } from "lucide-react"

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  const shortcuts = [
    {
      category: "Navegação",
      items: [
        { key: "→", description: "Próximo passo" },
        { key: "←", description: "Passo anterior" },
        { key: "Home", description: "Primeiro passo" },
        { key: "End", description: "Último passo" },
        { key: "Espaço", description: "Próximo passo" },
      ],
    },
    {
      category: "Controles",
      items: [
        { key: "P", description: "Play/Pause" },
        { key: "Ctrl + R", description: "Resetar árvore" },
        { key: "F", description: "Tela cheia" },
        { key: "S", description: "Mostrar/ocultar estatísticas" },
      ],
    },
    {
      category: "Modos",
      items: [
        { key: "C", description: "Alternar comparação" },
        { key: "T", description: "Modo apresentação" },
        { key: "Esc", description: "Sair do modo atual" },
      ],
    },
  ]

  return (
    <Card className="p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-primary" />
            <span className="font-semibold">Atalhos de Teclado</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-3">
          <div className="space-y-4">
            {shortcuts.map((category) => (
              <div key={category.category}>
                <h4 className="font-medium text-sm mb-2">{category.category}</h4>
                <div className="space-y-1">
                  {category.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.description}</span>
                      <Badge variant="outline" className="font-mono">
                        {item.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="pt-2 border-t">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                <p>
                  Os atalhos funcionam quando você não está digitando em campos de entrada.
                  Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> para sair de modos especiais.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
