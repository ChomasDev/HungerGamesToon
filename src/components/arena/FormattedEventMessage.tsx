import { NameSpan, type FormattedMessage } from '../../engine/types'

export interface FormattedEventMessageProps {
  message: FormattedMessage
  large?: boolean
  className?: string
}

export default function FormattedEventMessage({ message, large, className }: FormattedEventMessageProps) {
  return (
    <p
      className={`arena-event-text m-0 ${large ? 'arena-event-text-lg' : ''} ${className ?? ''}`.trim()}
    >
      {message.map((part, i) =>
        part instanceof NameSpan ? (
          <span key={i} className="tribute-name-highlight">
            {part.value}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  )
}
