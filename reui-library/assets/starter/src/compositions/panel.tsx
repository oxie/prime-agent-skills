import { useId, type ReactNode } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "../components/card"

export type PanelProps = { title: string; children: ReactNode; footer?: ReactNode }

// ReUI drawer example's bounded body/footer anatomy, without modal semantics.
export function Panel({ title, children, footer }: PanelProps) {
  const id = useId()
  return (
    <section className="reui-panel" aria-labelledby={id}>
      <Card>
        <CardHeader><h2 id={id} className="cn-card-title">{title}</h2></CardHeader>
        <CardContent className="reui-panel-body" tabIndex={0}>{children}</CardContent>
        {footer != null && <CardFooter><footer className="reui-panel-footer">{footer}</footer></CardFooter>}
      </Card>
    </section>
  )
}
