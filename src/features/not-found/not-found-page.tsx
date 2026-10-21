import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '../../components/ui'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-sunken px-5 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-soft text-coral"
        aria-hidden="true"
      >
        <Compass className="h-7 w-7" />
      </span>
      <div>
        <h1 className="text-2xl font-semibold text-ink">Page not found</h1>
        <p className="mt-1 text-sm text-ink-soft">
          The page you are looking for does not exist or has moved.
        </p>
      </div>
      <Link to="/app">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  )
}
