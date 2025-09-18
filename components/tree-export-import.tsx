"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTreeExport } from "@/hooks/use-tree-export"
import type { TreeNode } from "@/lib/red-black-tree"
import { Download, Upload, Copy, Check, AlertCircle } from "lucide-react"

interface TreeExportImportProps {
  tree: TreeNode | null
  onImportTree: (data: string) => void
}

export function TreeExportImport({ tree, onImportTree }: TreeExportImportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [importError, setImportError] = useState<string>("")
  const [filename, setFilename] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { exportTree, importTree, downloadTree, copyToClipboard } = useTreeExport()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await downloadTree(tree, filename || undefined)
    } catch (error) {
      console.error("Erro ao exportar:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyToClipboard = async () => {
    const success = await copyToClipboard(tree)
    if (success) {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      handleImport(content)
    }
    reader.readAsText(file)
  }

  const handleImport = (data: string) => {
    setIsImporting(true)
    setImportError("")

    try {
      const importedData = importTree(data)
      if (importedData) {
        onImportTree(data)
        setImportError("")
      } else {
        setImportError("Erro ao processar o arquivo. Verifique se é um arquivo válido de árvore.")
      }
    } catch (error) {
      setImportError("Erro ao importar árvore. Verifique o formato do arquivo.")
    } finally {
      setIsImporting(false)
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      handleImport(text)
    } catch (error) {
      setImportError("Erro ao ler dados da área de transferência.")
    }
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Exportar/Importar Árvore</h3>
      
      <div className="space-y-4">
        {/* Export Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Exportar Árvore</Label>
          
          <div className="flex gap-2">
            <Input
              placeholder="Nome do arquivo (opcional)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exportando..." : "Baixar"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleCopyToClipboard}
              disabled={copySuccess}
              size="sm"
              className="flex-1"
            >
              {copySuccess ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar JSON
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Importar Árvore</Label>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              size="sm"
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? "Importando..." : "Selecionar Arquivo"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handlePasteFromClipboard}
              disabled={isImporting}
              size="sm"
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              Colar JSON
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Error Display */}
        {importError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground">
          <p>• Exporte sua árvore para salvar o progresso</p>
          <p>• Importe arquivos JSON válidos de árvores</p>
          <p>• Use "Copiar JSON" para compartilhar via texto</p>
        </div>
      </div>
    </Card>
  )
}
