"use client"

import { useEffect, useCallback } from "react"

interface KeyboardShortcutsProps {
  onNextStep?: () => void
  onPreviousStep?: () => void
  onReset?: () => void
  onTogglePlay?: () => void
  onGoToStart?: () => void
  onGoToEnd?: () => void
  onToggleFullscreen?: () => void
  onToggleStats?: () => void
  onToggleComparison?: () => void
  onTogglePresentation?: () => void
  canGoNext?: boolean
  canGoPrevious?: boolean
  isPlaying?: boolean
  isFullscreen?: boolean
  showStats?: boolean
  showComparison?: boolean
  showPresentation?: boolean
}

export function useKeyboardShortcuts({
  onNextStep,
  onPreviousStep,
  onReset,
  onTogglePlay,
  onGoToStart,
  onGoToEnd,
  onToggleFullscreen,
  onToggleStats,
  onToggleComparison,
  onTogglePresentation,
  canGoNext = true,
  canGoPrevious = true,
  isPlaying = false,
  isFullscreen = false,
  showStats = true,
  showComparison = false,
  showPresentation = false,
}: KeyboardShortcutsProps) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      const { key, ctrlKey, altKey, shiftKey } = event

      // Prevent default for our shortcuts
      const preventDefault = () => event.preventDefault()

      switch (key) {
        case "ArrowRight":
        case " ":
          if (canGoNext && onNextStep) {
            preventDefault()
            onNextStep()
          }
          break

        case "ArrowLeft":
          if (canGoPrevious && onPreviousStep) {
            preventDefault()
            onPreviousStep()
          }
          break

        case "Home":
          if (onGoToStart) {
            preventDefault()
            onGoToStart()
          }
          break

        case "End":
          if (onGoToEnd) {
            preventDefault()
            onGoToEnd()
          }
          break

        case "r":
        case "R":
          if (ctrlKey && onReset) {
            preventDefault()
            onReset()
          }
          break

        case "p":
        case "P":
          if (onTogglePlay) {
            preventDefault()
            onTogglePlay()
          }
          break

        case "f":
        case "F":
          if (onToggleFullscreen) {
            preventDefault()
            onToggleFullscreen()
          }
          break

        case "s":
        case "S":
          if (onToggleStats) {
            preventDefault()
            onToggleStats()
          }
          break

        case "c":
        case "C":
          if (onToggleComparison) {
            preventDefault()
            onToggleComparison()
          }
          break

        case "t":
        case "T":
          if (onTogglePresentation) {
            preventDefault()
            onTogglePresentation()
          }
          break

        case "Escape":
          if (isFullscreen && onToggleFullscreen) {
            preventDefault()
            onToggleFullscreen()
          } else if (showComparison && onToggleComparison) {
            preventDefault()
            onToggleComparison()
          } else if (showPresentation && onTogglePresentation) {
            preventDefault()
            onTogglePresentation()
          }
          break
      }
    },
    [
      onNextStep,
      onPreviousStep,
      onReset,
      onTogglePlay,
      onGoToStart,
      onGoToEnd,
      onToggleFullscreen,
      onToggleStats,
      onToggleComparison,
      onTogglePresentation,
      canGoNext,
      canGoPrevious,
      isFullscreen,
      showComparison,
      showPresentation,
    ],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])
}
