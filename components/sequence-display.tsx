"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListOrdered } from "lucide-react";
import type { TreeStep } from "@/lib/red-black-tree";

type ValueStatus = "pending" | "inserted" | "deleted";

interface ValueWithStatus {
  value: number;
  status: ValueStatus;
  insertStepIndex: number;
}

interface SequenceDisplayProps {
  steps: TreeStep[];
  currentStep: number;
  className?: string;
  onGoToStep?: (step: number) => void;
}

export function SequenceDisplay({ steps, currentStep, className, onGoToStep }: SequenceDisplayProps) {
  const getSequenceWithStatus = (): ValueWithStatus[] => {
    const allInsertedValues = new Map<number, number>();
    
    steps.forEach((step, index) => {
      if (step.type === "insert") {
        const match = step.description.match(/Inserido nó (\d+)/);
        if (match) {
          const value = parseInt(match[1], 10);
          if (!isNaN(value) && !allInsertedValues.has(value)) {
            allInsertedValues.set(value, index);
          }
        }
      }
    });

    const sortedValues = Array.from(allInsertedValues.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([value]) => value);

    const result: ValueWithStatus[] = [];
    
    sortedValues.forEach((value) => {
      const insertStepIndex = allInsertedValues.get(value)!;
      let status: ValueStatus = "pending";
      
      const stepsToProcess = steps.slice(0, currentStep + 1);
      let wasInserted = false;
      let wasDeleted = false;
      
      stepsToProcess.forEach((step) => {
        if (step.type === "insert") {
          const match = step.description.match(/Inserido nó (\d+)/);
          if (match && parseInt(match[1], 10) === value) {
            wasInserted = true;
          }
        } else if (step.type === "delete") {
          const match = step.description.match(/Removido nó (\d+)/);
          if (match && parseInt(match[1], 10) === value) {
            wasDeleted = true;
          }
        }
      });
      
      if (wasDeleted) {
        status = "deleted";
      } else if (wasInserted) {
        status = "inserted";
      } else {
        status = "pending";
      }
      
      result.push({ value, status, insertStepIndex });
    });

    return result;
  };

  const sequenceWithStatus = getSequenceWithStatus();

  return (
    <Card className={`p-4 ${className || ""}`}>
      <div className="flex items-center gap-3">
        <ListOrdered className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
          <span className="text-sm font-semibold text-muted-foreground shrink-0">
            Sequência:
          </span>
          {sequenceWithStatus.length > 0 ? (
            <>
              {sequenceWithStatus.map((item, index) => {
                let badgeClassName = "font-mono";

                if (item.status === "pending") {
                  badgeClassName += " bg-gray-500/15 text-gray-700 border-gray-600/30";
                } else if (item.status === "deleted") {
                  badgeClassName += " bg-red-500/15 text-red-700 border-red-600/30";
                } else {
                  badgeClassName += " bg-green-500/15 text-green-700 border-green-600/30";
                }

                // Adicionar classes de interatividade se onGoToStep estiver disponível
                if (onGoToStep) {
                  badgeClassName += " cursor-pointer hover:opacity-80 transition-opacity";

                  // Destacar badge do step atual
                  if (item.insertStepIndex === currentStep) {
                    badgeClassName += " ring-2 ring-blue-500 ring-offset-1";
                  }
                }

                return (
                  <React.Fragment key={`${item.value}-${index}`}>
                    <Badge
                      variant="outline"
                      className={badgeClassName}
                      onClick={() => onGoToStep?.(item.insertStepIndex)}
                      title={onGoToStep ? `Ir para inserção do valor ${item.value}` : undefined}
                    >
                      {item.value}
                    </Badge>
                    {index < sequenceWithStatus.length - 1 && (
                      <span className="text-muted-foreground/50">→</span>
                    )}
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              Nenhum valor inserido
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

