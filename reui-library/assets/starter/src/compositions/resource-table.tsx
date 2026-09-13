import { useId, useState } from "react"
import { Button } from "../components/button"
import { Input } from "../components/input"
import { FieldLabel } from "../components/field"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../components/table"

export type Resource = { id: string; name: string; owner: string; status: "active" | "paused" }
export type ResourceTableProps = { rows: Resource[] }

// Local client-side table, deliberately not the ReUI advanced data grid.
export function ResourceTable({ rows }: ResourceTableProps) {
  const id = useId()
  const [query, setQuery] = useState("")
  const [direction, setDirection] = useState<"ascending" | "descending">("ascending")
  const search = query.trim().toLocaleLowerCase()
  const visible = rows.map((row, index) => ({ row, index }))
    .filter(({ row }) => `${row.name} ${row.owner}`.toLocaleLowerCase().includes(search))
    .sort((a, b) => {
      const byName = a.row.name.localeCompare(b.row.name, undefined, { sensitivity: "base" })
      return (direction === "ascending" ? byName : -byName) || a.index - b.index
    })

  return (
    <div className="reui-resource-table">
      <div className="reui-table-tools">
        <div className="reui-search-field">
          <FieldLabel htmlFor={`${id}-search`}>Search resources</FieldLabel>
          <Input id={`${id}-search`} type="search" value={query} placeholder="Filter by name or owner"
            onChange={event => setQuery(event.target.value)} />
        </div>
        <p className="reui-table-count" role="status">Showing {visible.length} of {rows.length}</p>
      </div>
      <Table>
        <TableCaption>Resources</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col" aria-sort={direction}>
              <Button type="button" variant="ghost" size="sm" aria-label="Sort by Name"
                onClick={() => setDirection(current => current === "ascending" ? "descending" : "ascending")}>
                Name <span aria-hidden="true">{direction === "ascending" ? "↑" : "↓"}</span>
              </Button>
            </TableHead>
            <TableHead scope="col">Owner</TableHead>
            <TableHead scope="col">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map(({ row }) => (
            <TableRow key={row.id} data-resource-id={row.id}>
              <TableCell className="reui-resource-name">{row.name}</TableCell>
              <TableCell>{row.owner}</TableCell>
              <TableCell><span className="reui-badge" data-status={row.status}>{row.status === "active" ? "Active" : "Paused"}</span></TableCell>
            </TableRow>
          ))}
          {visible.length === 0 && <TableRow><TableCell colSpan={3} className="reui-table-empty">
            {rows.length === 0 ? "No resources yet. Add your first resource to get started." : "No matching resources. Try a different name or owner."}
          </TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  )
}
