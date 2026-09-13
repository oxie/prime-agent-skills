import { Button } from "../components/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../components/empty"

export type DataStateProps = { status: "loading" | "empty" | "error"; onRetry?: () => void }

// Adapts ReUI c-empty-10 anatomy; states and actions are explicit caller contracts.
export function DataState({ status, onRetry }: DataStateProps) {
  const copy = {
    loading: { title: "Loading data…", description: "Please wait while the current request completes." },
    empty: { title: "No data yet", description: "There is nothing to display. Add data to get started." },
    error: { title: "Could not load data", description: "The request failed. Try again when you are ready." },
  }[status]
  return (
    <Empty className="reui-data-state" role={status === "error" ? "alert" : status === "loading" ? "status" : undefined}>
      <EmptyHeader>
        <EmptyMedia variant="icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {status === "error" ? <><path d="M12 8v5m0 3v.01" /><circle cx="12" cy="12" r="9" /></> :
              status === "loading" ? <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></> :
              <><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M4 12h5l2 3h2l2-3h5" /></>}
          </svg>
        </EmptyMedia>
        <EmptyTitle>{copy.title}</EmptyTitle>
        <EmptyDescription>{copy.description}</EmptyDescription>
      </EmptyHeader>
      {status === "error" && onRetry && <EmptyContent><Button type="button" variant="outline" onClick={onRetry}>Retry</Button></EmptyContent>}
    </Empty>
  )
}
