import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatNarrativePreview } from '../engine/game'
import type { GameEventData } from '../engine/types'
import { it } from '../i18n/it'
import FormattedEventMessage from './arena/FormattedEventMessage'

function insertAtCursor(textarea: HTMLTextAreaElement, fragment: string, setDraft: (s: string) => void) {
  const value = textarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = value.slice(0, start)
  const after = value.slice(end)
  const next = before + fragment + after
  setDraft(next)
  const caret = start + fragment.length
  requestAnimationFrame(() => {
    textarea.focus()
    textarea.setSelectionRange(caret, caret)
  })
}

interface EditSceneActionModalProps {
  isOpen: boolean
  gameEvent: GameEventData | null
  onClose: () => void
  onSave: (message: string) => void
}

export default function EditSceneActionModal({ isOpen, gameEvent, onClose, onSave }: EditSceneActionModalProps) {
  const [draft, setDraft] = useState('')
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && gameEvent) setDraft(gameEvent.event.message)
  }, [isOpen, gameEvent])

  const preview = useMemo(() => {
    if (!gameEvent || !draft.trim()) return null
    return formatNarrativePreview(gameEvent, draft)
  }, [gameEvent, draft])

  const handleSave = useCallback(() => {
    if (!gameEvent) return
    if (!formatNarrativePreview(gameEvent, draft)) return
    onSave(draft)
    onClose()
  }, [gameEvent, draft, onSave, onClose])

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen || !gameEvent) return null

  const n = gameEvent.players_involved.length
  const slots = Array.from({ length: n }, (_, i) => i)

  return (
    <>
      <div className="scene-edit-overlay" onClick={onClose} aria-hidden />
      <div
        className="scene-edit-modal"
        role="dialog"
        aria-labelledby="scene-edit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scene-edit-modal-header">
          <h2 id="scene-edit-title">{it.editSceneTitle}</h2>
          <button type="button" className="btn btn-ghost scene-edit-close" onClick={onClose} aria-label={it.close}>
            ×
          </button>
        </div>

        <p className="scene-edit-hint">{it.editSceneHint}</p>

        <div className="scene-edit-chips">
          <span className="scene-edit-chips-label">{it.editSceneInsertNames}</span>
          <div className="scene-edit-chip-row">
            {slots.map((i) => (
              <button
                key={`n-${i}`}
                type="button"
                className="scene-edit-chip"
                title={gameEvent.players_involved[i]!.raw_name}
                onClick={() => taRef.current && insertAtCursor(taRef.current, `%${i}`, setDraft)}
              >
                %{i}
              </button>
            ))}
          </div>
        </div>

        <div className="scene-edit-chips">
          <span className="scene-edit-chips-label">{it.editSceneInsertPronouns}</span>
          <div className="scene-edit-chip-grid">
            {slots.map((i) =>
              (['N', 'A', 'G', 'R'] as const).map((kind) => (
                <button
                  key={`${kind}-${i}`}
                  type="button"
                  className="scene-edit-chip scene-edit-chip-sm"
                  title={gameEvent.players_involved[i]!.raw_name}
                  onClick={() =>
                    taRef.current && insertAtCursor(taRef.current, `%${kind}${i}`, setDraft)
                  }
                >
                  {`%${kind}${i}`}
                </button>
              )),
            )}
          </div>
        </div>

        <div className="scene-edit-chips">
          <span className="scene-edit-chips-label">{it.editSceneInsertGrammar}</span>
          <div className="scene-edit-chip-row scene-edit-chip-wrap">
            {slots.map((i) =>
              (['s', 'e', 'y', 'i', 'h', '!', 'w'] as const).map((g) => (
                <button
                  key={`${g}-${i}`}
                  type="button"
                  className="scene-edit-chip scene-edit-chip-sm"
                  onClick={() =>
                    taRef.current && insertAtCursor(taRef.current, `%${g}${i}`, setDraft)
                  }
                >
                  {`%${g}${i}`}
                </button>
              )),
            )}
          </div>
        </div>

        <textarea
          ref={taRef}
          className="scene-edit-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          rows={5}
        />

        <div className="scene-edit-preview">
          <span className="scene-edit-chips-label">{it.editScenePreview}</span>
          {preview ? (
            <div className="scene-edit-preview-box">
              <FormattedEventMessage message={preview} large={false} />
            </div>
          ) : (
            <p className="scene-edit-preview-error">{it.editScenePreviewError}</p>
          )}
        </div>

        <div className="scene-edit-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {it.editSceneCancel}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={!preview}>
            {it.editSceneSave}
          </button>
        </div>
      </div>
    </>
  )
}
