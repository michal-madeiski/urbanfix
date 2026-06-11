import { ImageIcon } from 'lucide-react'

export function PhotoPreview({
  className,
  fileName,
  size = 'large',
}: {
  className?: string
  fileName?: string | null
  size?: 'large' | 'small'
}) {
  const isSmall = size === 'small'

  return (
    <div
      className={`flex items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-slate-500 ${
        className ?? (isSmall ? 'h-24 w-28' : 'h-52 w-full')
      }`}
    >
      <div className="text-center">
        <ImageIcon className="mx-auto" size={isSmall ? 22 : 34} />
        <p className="mt-2 max-w-44 truncate text-xs">
          {fileName ?? 'Podgląd zdjęcia'}
        </p>
      </div>
    </div>
  )
}
