// Adapted from keenthemes/reui at 8a2c701eaf95729f238274d5ce2555a5a8bd23e7.
// MIT; see the starter THIRD_PARTY.md and source-selection.json.
import * as React from "react"

import { cn } from "./utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-reui-foreground placeholder:text-reui-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
