import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, Sparkles, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { resumeApi } from '../../api'
import { Button, EmptyState, FormField, LoadingSkeleton, useToast } from '../../components/ui'
import type { ResumeProposal } from '../../types/model'

const proposalSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  proposedValue: z.string().min(3, 'Write at least a few words'),
  rationale: z.string().optional(),
})

type ProposalValues = z.infer<typeof proposalSchema>

/**
 * Suggestions are always derived from what the user already wrote, and are
 * surfaced as proposals the user must accept before they change the draft.
 * Nothing is written into the resume without explicit approval.
 */
function buildSuggestions(draft: {
  summary?: string | null
  headline?: string | null
  skills?: { category: string; skills: string[] }[]
}) {
  const suggestions: { field: string; value: string; rationale: string }[] = []

  if (draft.headline && !draft.summary) {
    suggestions.push({
      field: 'summary',
      value: `${draft.headline}. Add a two-line summary of the work you have done and the role you are targeting.`,
      rationale:
        'Your headline is set but there is no summary. A short summary helps recruiters scan your resume.',
    })
  }

  const skillCount = (draft.skills ?? []).reduce((total, group) => total + group.skills.length, 0)
  if (skillCount > 0 && skillCount <= 4) {
    suggestions.push({
      field: 'skills',
      value: 'List the languages, frameworks and tools you have actually used in projects or internships.',
      rationale: `Only ${skillCount} skill(s) are listed, which is thin for a technical resume.`,
    })
  }

  return suggestions
}

export function ResumePage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [showProposalForm, setShowProposalForm] = useState(false)

  const draft = useQuery({
    queryKey: ['resume'],
    queryFn: () => resumeApi.getDraft(),
  })

  const proposals = useQuery({
    queryKey: ['resume', 'proposals'],
    queryFn: () => resumeApi.listProposals(),
  })

  const createProposal = useMutation({
    mutationFn: (payload: { field: string; proposedValue: string; rationale?: string }) =>
      resumeApi.createProposal(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['resume', 'proposals'] })
    },
  })

  const decide = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      accept ? resumeApi.acceptProposal(id) : resumeApi.rejectProposal(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['resume', 'proposals'] })
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProposalValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: { field: 'summary', proposedValue: '', rationale: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createProposal.mutateAsync(values)
      reset()
      setShowProposalForm(false)
      toast.success('Proposal created', 'Review it before it is applied to your resume.')
    } catch (error) {
      toast.error('Could not create proposal', error instanceof Error ? error.message : undefined)
    }
  })

  const handleDecision = async (proposal: ResumeProposal, accept: boolean) => {
    try {
      await decide.mutateAsync({ id: proposal.id, accept })
      toast.success(accept ? 'Proposal accepted' : 'Proposal dismissed')
    } catch (error) {
      toast.error('Could not update proposal', error instanceof Error ? error.message : undefined)
    }
  }

  if (draft.isLoading) {
    return (
      <div className="space-y-5">
        <LoadingSkeleton className="h-8 w-48" variant="text" />
        <LoadingSkeleton variant="card" />
      </div>
    )
  }

  const data = draft.data
  const suggestions = buildSuggestions(data ?? {})
  const pending = (proposals.data ?? []).filter((item) => item.status === 'pending')



  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Resume</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Your resume stays accurate — every change is a proposal you review first.
        </p>
      </header>

      <section className="pf-card p-5">
        <h2 className="text-base font-semibold text-ink">Current draft</h2>
        {data?.headline ? <p className="mt-1 text-sm text-ink-soft">{data.headline}</p> : null}
        {data?.summary ? (
          <p className="mt-3 text-sm text-ink-soft">{data.summary}</p>
        ) : (
          <p className="mt-3 text-sm text-ink-faint">
            No summary yet. Add one from the proposals panel below.
          </p>
        )}
      </section>

      <section className="pf-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">Suggestions</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowProposalForm((value) => !value)}
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
          >
            {showProposalForm ? 'Cancel' : 'Write a proposal'}
          </Button>
        </div>

        {showProposalForm && (
          <form onSubmit={onSubmit} noValidate className="mt-4 space-y-4">
            <FormField label="Field" error={errors.field?.message} required>
              {(props) => (
                <select {...props} {...register('field')} className="pf-input">
                  <option value="summary">Summary</option>
                  <option value="headline">Headline</option>
                  <option value="experience">Experience bullet</option>
                  <option value="skills">Skills</option>
                </select>
              )}
            </FormField>

            <FormField
              label="Proposed text"
              hint="Write the exact text you want to use"
              error={errors.proposedValue?.message}
              required
            >
              {(props) => (
                <textarea
                  {...props}
                  {...register('proposedValue')}
                  rows={4}
                  className="pf-input resize-y"
                  placeholder="Final-year Computer Science student targeting SDE-1 roles, with hands-on experience building React and Node.js applications."
                />
              )}
            </FormField>

            <FormField label="Why this helps" error={errors.rationale?.message}>
              {(props) => (
                <input
                  {...props}
                  {...register('rationale')}
                  type="text"
                  className="pf-input"
                  placeholder="Keeps the summary to two lines"
                />
              )}
            </FormField>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowProposalForm(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting || createProposal.isPending}>
                Save proposal
              </Button>
            </div>
          </form>
        )}

        {suggestions.length > 0 && (
          <ul className="mt-4 space-y-2">
            {suggestions.map((suggestion) => (
              <li key={suggestion.field} className="rounded-[var(--radius-control)] bg-surface-sunken p-3">
                <p className="text-sm font-medium text-ink">Improve your {suggestion.field}</p>
                <p className="mt-1 text-xs text-ink-soft">{suggestion.rationale}</p>
                <Button
                  className="mt-2"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    reset({
                      field: suggestion.field,
                      proposedValue: suggestion.value,
                      rationale: suggestion.rationale,
                    })
                    setShowProposalForm(true)
                  }}
                >
                  Turn into a proposal
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>


      <section className="pf-card p-5">
        <h2 className="mb-4 text-base font-semibold text-ink">Pending proposals</h2>

        {proposals.isLoading ? (
          <LoadingSkeleton variant="list" />
        ) : pending.length === 0 ? (
          <EmptyState
            title="Nothing to review"
            description="Proposals you create will appear here for approval before they change your resume."
          />
        ) : (
          <ul className="space-y-3">
            {pending.map((proposal) => (
              <li key={proposal.id} className="rounded-[var(--radius-control)] border border-line p-4">
                <p className="text-xs font-medium tracking-wide text-ink-faint uppercase">
                  {proposal.field}
                </p>
                <p className="mt-1.5 text-sm text-ink">{proposal.proposedValue}</p>
                {proposal.rationale && (
                  <p className="mt-1.5 text-xs text-ink-soft">{proposal.rationale}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => void handleDecision(proposal, true)}
                    isLoading={decide.isPending}
                    leftIcon={<Check className="h-3.5 w-3.5" />}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void handleDecision(proposal, false)}
                    isLoading={decide.isPending}
                    leftIcon={<X className="h-3.5 w-3.5" />}
                  >
                    Dismiss
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
