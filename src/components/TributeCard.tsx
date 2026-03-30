import { useRef } from 'react'
import { PronounSetting, type TributeCharacterSelectOptions } from '../engine/types'

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

  function getInitials(name: string) {
    return name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <div className="tribute-card" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="tribute-card-actions">
        <button onClick={() => onRemove(tribute.id)} title="Remove">
          &times;
        </button>
      </div>

      <div className="tribute-card-portrait" onClick={() => fileRef.current?.click()}>
        {tribute.image_url ? (
          <img src={tribute.image_url} alt={tribute.name} />
        ) : (
          <span className="placeholder">{getInitials(tribute.name || '?')}</span>
        )}
        <div className="portrait-overlay">Upload Image</div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>

      <div className="tribute-card-body">
        <input
          type="text"
          value={tribute.name}
          onChange={(e) => onUpdate(tribute.id, { name: e.target.value })}
          placeholder="Tribute name"
        />
        <input
          className="subtitle-input"
          type="text"
          value={tribute.subtitle ?? ''}
          onChange={(e) => onUpdate(tribute.id, { subtitle: e.target.value })}
          placeholder="Tagline or team..."
        />
        <div className="tribute-card-pronoun">
          <select
            value={tribute.pronoun_option}
            onChange={(e) =>
              onUpdate(tribute.id, { pronoun_option: e.target.value as PronounSetting })
            }
          >
            <option value={PronounSetting.Masculine}>He/Him</option>
            <option value={PronounSetting.Feminine}>She/Her</option>
            <option value={PronounSetting.Common}>They/Them</option>
            <option value={PronounSetting.None}>No Pronouns</option>
            <option value={PronounSetting.Custom}>Custom</option>
          </select>
        </div>
        {tribute.pronoun_option === PronounSetting.Custom && (
          <input
            type="text"
            value={tribute.custom_pronouns ?? ''}
            onChange={(e) => onUpdate(tribute.id, { custom_pronouns: e.target.value })}
            placeholder="nom/acc/gen/reflx"
            style={{ marginTop: 4, fontSize: 12 }}
          />
        )}
      </div>
    </div>
  )
}
