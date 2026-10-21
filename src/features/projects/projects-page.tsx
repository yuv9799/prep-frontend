import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FolderGit2, Globe, Plus } from 'lucide-react'
import { useCreateProjectMutation, useProjectsQuery } from '../../hooks'
import { Button, EmptyState, ErrorState, FormField, LoadingSkeleton, useToast } from '../../components/ui'
import type { Project } from '../../types/model'

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  techStack: z.string().optional(),
  repositoryUrl: z.union([z.url('Enter a valid URL'), z.literal('')]).optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'archived']),
})

type ProjectValues = z.infer<typeof projectSchema>

const statusTone: Record<Project['status'], string> = {
  planned: 'bg-surface-sunken text-ink-soft',
  in_progress: 'bg-peach-soft text-rose-muted',
  completed: 'bg-rose-muted-soft text-positive',
  archived: 'bg-surface-sunken text-ink-faint',
}


export function ProjectsPage() {
  const projects = useProjectsQuery()
  const createProject = useCreateProjectMutation()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { title: '', description: '', techStack: '', repositoryUrl: '', status: 'planned' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createProject.mutateAsync({
        title: values.title,
        description: values.description,
        status: values.status,
        repositoryUrl: values.repositoryUrl || null,
        techStack: values.techStack
          ? values.techStack
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      })
      reset()
      setShowForm(false)
      toast.success('Project added', 'Track its progress from your project board.')
    } catch (error) {
      toast.error('Could not create project', error instanceof Error ? error.message : undefined)
    }
  })

  if (projects.isLoading) {
    return (
      <div className="space-y-5">
        <LoadingSkeleton className="h-8 w-48" variant="text" />
        <LoadingSkeleton variant="list" />
      </div>
    )
  }

  if (projects.isError) {
    return (
      <ErrorState
        error={projects.error}
        title="Could not load your projects"
        onRetry={() => void projects.refetch()}
      />
    )
  }

  const items = projects.data ?? []

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Projects</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Showcase work that backs up your claims on paper.
          </p>
        </div>
        <Button onClick={() => setShowForm((value) => !value)} leftIcon={<Plus className="h-4 w-4" />}>
          {showForm ? 'Cancel' : 'New project'}
        </Button>
      </header>


      {showForm && (
        <form onSubmit={onSubmit} noValidate className="pf-card space-y-4 p-5">
          <FormField label="Project title" error={errors.title?.message} required>
            {(props) => (
              <input
                {...props}
                {...register('title')}
                type="text"
                className="pf-input"
                placeholder="PrepForge — placement tracker"
              />
            )}
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            {(props) => (
              <textarea
                {...props}
                {...register('description')}
                rows={3}
                className="pf-input resize-y"
                placeholder="What does it do and why did you build it?"
              />
            )}
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Tech stack" hint="Comma separated" error={errors.techStack?.message}>
              {(props) => (
                <input
                  {...props}
                  {...register('techStack')}
                  type="text"
                  className="pf-input"
                  placeholder="React, TypeScript, PostgreSQL"
                />
              )}
            </FormField>

            <FormField label="Status" error={errors.status?.message}>
              {(props) => (
                <select {...props} {...register('status')} className="pf-input">
                  <option value="planned">Planned</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              )}
            </FormField>
          </div>

          <FormField label="Repository URL" error={errors.repositoryUrl?.message}>
            {(props) => (
              <input
                {...props}
                {...register('repositoryUrl')}
                type="url"
                className="pf-input"
                placeholder="https://github.com/you/project"
              />
            )}
          </FormField>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createProject.isPending}>
              Add project
            </Button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Add a project to give recruiters concrete proof of your skills."
          actionLabel="New project"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((project) => (
            <li key={project.id} className="pf-card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-ink">{project.title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusTone[project.status]}`}
                >
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              {project.description && (
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink-soft">{project.description}</p>
              )}

              {project.techStack && project.techStack.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full bg-purple-dusty-soft px-2 py-0.5 text-[11px] text-purple-dusty"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              )}

              {project.repositoryUrl && (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-rose-muted hover:underline"
                >
                  <FolderGit2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Repository
                </a>
              )}

              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-rose-muted hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                  Live demo
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
