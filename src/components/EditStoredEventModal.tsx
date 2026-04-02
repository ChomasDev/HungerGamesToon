import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { previewStoredEventNarrative } from '../engine/game'
import { makeStoredEvent, type StoredEvent } from '../engine/types'
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

function parseSlotIndexList(s: string): number[] {
  if (!s.trim()) return []
  return s
    .split(/[,;\s]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((n) => Number.isInteger(n) && n >= 0)
}

function formatIndexList(arr: number[]): string {
  return arr.join(', ')
}

const NAME_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const PRON_GRAMMAR_SLOTS = [0, 1, 2, 3, 4, 5]

interface EditStoredEventModalProps {
  isOpen: boolean
  initial: StoredEvent | null
  onClose: () => void
  onSave: (event: StoredEvent) => void
}

export default function EditStoredEventModal({ isOpen, initial, onClose, onSave }: EditStoredEventModalProps) {
  const [draftMsg, setDraftMsg] = useState('')
  const [draftFatal, setDraftFatal] = useState('')
  const [draftKill, setDraftKill] = useState('')
  const [draftEnabled, setDraftEnabled] = useState(true)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && initial) {
      setDraftMsg(initial.message)
      setDraftFatal(formatIndexList(initial.fatalities))
      setDraftKill(formatIndexList(initial.killers))
      setDraftEnabled(initial.enabled)
    }
  }, [isOpen, initial])

  const draftStored = useMemo((): StoredEvent | null => {
    if (!initial) return null
    return {
      ...initial,
      message: draftMsg,
      fatalities: parseSlotIndexList(draftFatal),
      killers: parseSlotIndexList(draftKill),
      enabled: draftEnabled,
    }
  }, [initial, draftMsg, draftFatal, draftKill, draftEnabled])

  const preview = useMemo(() => {
    if (!draftStored || !draftMsg.trim()) return null
    return previewStoredEventNarrative(draftStored)
  }, [draftStored, draftMsg])

  const handleSave = useCallback(() => {
    if (!draftStored || !preview) return
    onSave(draftStored)
    onClose()
  }, [draftStored, preview, onSave, onClose])

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

  if (!isOpen || !initial) return null

  return (
    <>
      <div className="scene-edit-overlay" onClick={onClose} aria-hidden />
      <div
        className="scene-edit-modal scene-edit-modal--wide"
        role="dialog"
        aria-labelledby="stored-event-edit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scene-edit-modal-header">
          <h2 id="stored-event-edit-title">{it.eventPoolEditModalTitle}</h2>
          <button type="button" className="btn btn-ghost scene-edit-close" onClick={onClose} aria-label={it.close}>
            ×
          </button>
        </div>

        <p className="scene-edit-hint">{it.editSceneHint}</p>

        <div className="scene-edit-chips">
          <span className="scene-edit-chips-label">{it.editSceneInsertNames}</span>
          <div className="scene-edit-chip-row scene-edit-chip-wrap">
            {NAME_SLOTS.map((i) => (
              <button
                key={`n-${i}`}
                type="button"
                className="scene-edit-chip"
                onClick={() => taRef.current && insertAtCursor(taRef.current, `%${i}`, setDraftMsg)}
              >
                %{i}
              </button>
            ))}
          </div>
        </div>

        <div className="scene-edit-chips">
          <span className="scene-edit-chips-label">{it.editSceneInsertPronouns}</span>
          <div className="scene-edit-chip-grid scene-edit-chip-wrap">
            {PRON_GRAMMAR_SLOTS.map((i) =>
              (['N', 'A', 'G', 'R'] as const).map((kind) => (
                <button
                  key={`${kind}-${i}`}
                  type="button"
                  className="scene-edit-chip scene-edit-chip-sm"
                  onClick={() =>
                    taRef.current && insertAtCursor(taRef.current, `%${kind}${i}`, setDraftMsg)
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
            {PRON_GRAMMAR_SLOTS.map((i) =>
              (['s', 'e', 'y', 'i', 'h', '!', 'w'] as const).map((g) => (
                <button
                  key={`${g}-${i}`}
                  type="button"
                  className="scene-edit-chip scene-edit-chip-sm"
                  onClick={() =>
                    taRef.current && insertAtCursor(taRef.current, `%${g}${i}`, setDraftMsg)
                  }
                >
                  {`%${g}${i}`}
                </button>
              )),
            )}
          </div>
        </div>

        <label className="event-pool-field-label">{it.eventPoolFieldMessage}</label>
        <textarea
          ref={taRef}
          className="scene-edit-textarea"
          value={draftMsg}
          onChange={(e) => setDraftMsg(e.target.value)}
          spellCheck={false}
          rows={5}
        />

        <div className="event-pool-meta-grid">
          <div>
            <label className="event-pool-field-label" htmlFor="evt-fatal">
              {it.eventPoolFieldFatalities}
            </label>
            <input
              id="evt-fatal"
              className="event-pool-meta-input"
              value={draftFatal}
              onChange={(e) => setDraftFatal(e.target.value)}
              placeholder="1 oppure 0, 1"
            />
          </div>
          <div>
            <label className="event-pool-field-label" htmlFor="evt-kill">
              {it.eventPoolFieldKillers}
            </label>
            <input
              id="evt-kill"
              className="event-pool-meta-input"
              value={draftKill}
              onChange={(e) => setDraftKill(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <label className="event-pool-check">
          <input type="checkbox" checked={draftEnabled} onChange={(e) => setDraftEnabled(e.target.checked)} />
          {it.eventPoolFieldEnabled}
        </label>

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

export function createBlankStoredEvent(): StoredEvent {
  return makeStoredEvent('%0 does something.', [], [], 'CUSTOM')
}
