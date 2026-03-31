import { it } from '../../i18n/it'
import { type FormattedMessage } from '../../engine/types'
import FormattedEventMessage from './FormattedEventMessage'

export interface EventNarrativeProps {
  message: FormattedMessage
  large?: boolean
}

export default function EventNarrative({ message, large }: EventNarrativeProps) {
  return (
    <div
      className={`arena-event-body ccg-event-narrative mx-3 mb-2 mt-1 -rotate-[0.35deg] before:hidden after:hidden [box-shadow:8px_8px_0_rgba(10,10,15,0.3),inset_0_2px_0_rgba(255,255,255,0.65)]`}
    >
      <div className="ccg-power-ribbon mb-2 inline-block -rotate-2 rounded-md border-[3px] border-comic-ink bg-gradient-to-b from-accent-secondary to-[#ffb703] px-2.5 py-0.5 font-display text-[11px] uppercase tracking-[0.22em] text-comic-ink shadow-[3px_3px_0_var(--comic-ink)]">
        {it.ccgPower}
      </div>
      <FormattedEventMessage
        message={message}
        large={large}
        className="!px-1 !text-[clamp(0.94rem,2vw,1.1rem)] !leading-snug !tracking-wide !text-[#14141c] !font-bold !italic [font-family:var(--font-body)] ![text-transform:none] [&_.tribute-name-highlight]:font-display [&_.tribute-name-highlight]:not-italic [&_.tribute-name-highlight]:uppercase [&_.tribute-name-highlight]:tracking-wide"
      />
    </div>
  )
}
