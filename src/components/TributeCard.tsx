import { useRef } from 'react'
import { PronounSetting, type TributeCharacterSelectOptions } from '../engine/types'
import { it } from '../i18n/it'
import { getInitials } from '../utils/initials'

interface TributeCardProps {
  tribute: TributeCharacterSelectOptions
  index: number
  onUpdate: (id: string, updates: Partial<TributeCharacterSelectOptions>) => void
  onRemove: (id: string) => void
}

export default function TributeCard({ tribute, index, onUpdate, onRemove }: TributeCardProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onUpdate(tribute.id, { image_url: url })
    }
  }

  return (
    <div className="tribute-card" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="tribute-card-portrait" onClick={() => fileRef.current?.click()}>
        {tribute.image_url ? (
          <img src={tribute.image_url} alt={tribute.name} />
        ) : (
          <span className="placeholder">{getInitials(tribute.name || '?')}</span>
        )}
        <div className="portrait-overlay">{it.uploadImage}</div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>

      <div className="tribute-card-actions">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(tribute.id)
          }}
          title={it.removeTribute}
          aria-label={it.removeTribute}
        >
          &times;
        </button>
      </div>

      <div className="tribute-card-body">
        <input
          type="text"
          value={tribute.name}
          onChange={(e) => onUpdate(tribute.id, { name: e.target.value })}
          placeholder={it.tributeNamePh}
        />
        <div className="tribute-card-pronoun">
          <select
            value={tribute.pronoun_option}
            onChange={(e) =>
              onUpdate(tribute.id, { pronoun_option: e.target.value as PronounSetting })
            }
          >
            <option value={PronounSetting.Masculine}>{it.pronounHe}</option>
            <option value={PronounSetting.Feminine}>{it.pronounShe}</option>
            <option value={PronounSetting.Common}>{it.pronounThey}</option>
            <option value={PronounSetting.None}>{it.pronounNone}</option>
            <option value={PronounSetting.Custom}>{it.pronounCustom}</option>
          </select>
        </div>
        {tribute.pronoun_option === PronounSetting.Custom && (
          <input
            type="text"
            value={tribute.custom_pronouns ?? ''}
            onChange={(e) => onUpdate(tribute.id, { custom_pronouns: e.target.value })}
            placeholder={it.pronounCustomPh}
            style={{ marginTop: 4, fontSize: 12 }}
          />
        )}
      </div>
    </div>
  )
}
