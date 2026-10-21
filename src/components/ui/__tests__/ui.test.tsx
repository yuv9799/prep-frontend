import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProgressBar } from '../progress-bar'
import { StatCard } from '../stat-card'
import { EmptyState } from '../empty-state'
import { ErrorState, getErrorMessage } from '../error-state'
import { ConfirmDialog } from '../confirm-dialog'
import { Button } from '../button'
import { renderWithProviders } from '../../../test/utils'

describe('ProgressBar', () => {
  it('exposes accessible progress values', () => {
    renderWithProviders(<ProgressBar value={25} label="Coverage" showValue />)

    const bar = screen.getByRole('progressbar', { name: 'Coverage' })
    expect(bar).toHaveAttribute('aria-valuenow', '25')
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('clamps values above the maximum', () => {
    renderWithProviders(<ProgressBar value={200} max={100} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })
})

describe('StatCard', () => {
  it('renders the label, value and hint', () => {
    renderWithProviders(<StatCard label="Accuracy" value="80%" hint="today" />)
    expect(screen.getByText('Accuracy')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('today')).toBeInTheDocument()
  })
})

describe('EmptyState', () => {
  it('renders a title, description and optional action', async () => {
    const onAction = vi.fn()
    renderWithProviders(
      <EmptyState title="Nothing here" description="Add something" actionLabel="Add" onAction={onAction} />,
    )

    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(onAction).toHaveBeenCalled()
  })
})

describe('ErrorState', () => {
  it('renders the error message and a retry button', async () => {
    const onRetry = vi.fn()
    renderWithProviders(
      <ErrorState error={new Error('Service unavailable')} onRetry={onRetry} />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(/service unavailable/i)
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})

describe('getErrorMessage', () => {
  it('prefers an Error message', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom')
  })

  it('falls back to the provided default', () => {
    expect(getErrorMessage(undefined, 'fallback')).toBe('fallback')
  })
})

describe('ConfirmDialog', () => {
  it('does not render when closed', () => {
    renderWithProviders(
      <ConfirmDialog open={false} title="Delete?" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('calls onConfirm when the confirm button is pressed', async () => {
    const onConfirm = vi.fn()
    renderWithProviders(
      <ConfirmDialog open title="Delete?" confirmLabel="Delete" onConfirm={onConfirm} onCancel={vi.fn()} />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('calls onCancel when the cancel button is pressed', async () => {
    const onCancel = vi.fn()
    renderWithProviders(
      <ConfirmDialog open title="Delete?" onConfirm={vi.fn()} onCancel={onCancel} />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })
})

describe('Button', () => {
  it('disables itself while loading', () => {
    renderWithProviders(<Button isLoading>Saving</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('forwards clicks', async () => {
    const onClick = vi.fn()
    renderWithProviders(<Button onClick={onClick}>Go</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalled()
  })
})
