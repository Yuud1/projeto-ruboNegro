# Tasks do Cliente - Projeto Red-Black Tree Visualizer

![alt text](<WhatsApp Image 2025-12-04 at 18.42.32.jpeg>)

## Lista de Tasks Solicitadas

### 5. **Quebrou no compartilhar (deixar input preenchido)** ⚠️
**Bug crítico**: Ao consumir query parameters, a àrvore não deve ser inicializada, apenas a sequência preenchendo o input principal.

**Arquivo relacionado**: `components/red-black-tree-visualizer.tsx` (função de compartilhamento)

---

### 6. **Manter a sequência do input na apresentação** ⚠️
No modo apresentação fullscreen (`PresentationMode`), a sequência de valores inseridos no input principal deve permanecer visível ou acessível. Atualmente, ao entrar na apresentação, essa informação se perde ou não é exibida.

**Componente relacionado**: `components/presentation-mode.tsx`

---

### 7. **Controle da animação por números** ⚠️
Implementar navegação numérica para os passos da animação. Atualmente existe um slider e botões, mas falta a possibilidade de digitar diretamente um número de passo (ex: "ir para passo 15 de 30"). Isso facilitaria a navegação em sequências longas.

**Componente relacionado**: `components/step-navigator.tsx`

---

### 8. **Importar deve preencher o input** ⚠️
Quando o usuário importa uma sequência salva através do `SequenceManager`, o input principal de valores não está sendo preenchido automaticamente com os valores da sequência importada. O comportamento esperado é que, ao carregar uma sequência, o input mostre os valores (ex: "1, 2, 3, 5, 8") para referência visual.

**Arquivos relacionados**:
- `components/sequence-manager.tsx`
- `components/red-black-tree-visualizer.tsx` (integração com input principal)

---

## Resumo de Prioridades

### Bugs Críticos (⚠️)
- Item 5: Quebrou no compartilhar
- Item 6: Manter sequência na apresentação
- Item 7: Controle numérico da animação
- Item 8: Importar deve preencher input

### Melhorias UX
- Item 1: Exibir sequência na apresentação
- Item 4: Concluir animações pendentes

---

## Contexto do Projeto

**Stack**: Next.js 14 + React 18 + TypeScript + Tailwind CSS 4
**Propósito**: Visualizador educativo interativo de Árvores Rubro-Negras para alunos da UFT

### Componentes Principais
- `red-black-tree-visualizer.tsx` - Componente orquestrador principal
- `tree-visualization.tsx` - Canvas SVG com renderização da árvore
- `presentation-mode.tsx` - Modo fullscreen com pseudocódigo
- `step-navigator.tsx` - Timeline com controles de navegação
- `sequence-manager.tsx` - CRUD de sequências (localStorage)
