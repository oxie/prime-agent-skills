import { useId, useRef, useState, type FormEvent } from "react"
import { Button } from "../components/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../components/field"
import { Input } from "../components/input"

export type ProfileValue = { name: string; email: string }
export type ProfileFormProps = {
  initialValue: ProfileValue
  onSave: (value: ProfileValue) => void | Promise<void>
}

// Field stack adapted from ReUI c-field-1; validation and async lifecycle are local.
export function ProfileForm({ initialValue, onSave }: ProfileFormProps) {
  const id = useId()
  const [value, setValue] = useState(() => ({ ...initialValue }))
  const [errors, setErrors] = useState<Partial<ProfileValue>>({})
  const [state, setState] = useState<"idle" | "pending" | "saved" | "failed">("idle")
  const submitting = useRef(false)
  const nameInput = useRef<HTMLInputElement>(null)
  const emailInput = useRef<HTMLInputElement>(null)
  const pending = state === "pending"

  function change(key: keyof ProfileValue, next: string) {
    setValue(current => ({ ...current, [key]: next }))
    setErrors(current => ({ ...current, [key]: undefined }))
    setState("idle")
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const next = { name: value.name.trim(), email: value.email.trim() }
    const nextErrors: Partial<ProfileValue> = {}
    if (!next.name) nextErrors.name = "Enter your full name."
    if (!next.email || emailInput.current?.validity.typeMismatch) {
      nextErrors.email = "Enter a valid email address."
    }
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.email) {
      setState("idle")
      ;(nextErrors.name ? nameInput : emailInput).current?.focus()
      return
    }
    submitting.current = true
    setState("pending")
    try {
      await onSave(next)
      setValue(next)
      setState("saved")
    } catch {
      setState("failed")
    } finally {
      submitting.current = false
    }
  }

  return (
    <form className="reui-profile-form" onSubmit={submit} noValidate aria-busy={pending}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor={`${id}-name`}>Full name</FieldLabel>
          <Input ref={nameInput} id={`${id}-name`} name="name" autoComplete="name"
            required value={value.name} disabled={pending}
            onChange={event => change("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={`${id}-name-help${errors.name ? ` ${id}-name-error` : ""}`} />
          <FieldDescription id={`${id}-name-help`}>Required. The name shown to your workspace.</FieldDescription>
          <FieldError id={`${id}-name-error`}>{errors.name}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
          <Input ref={emailInput} id={`${id}-email`} name="email" type="email" autoComplete="email"
            required value={value.email} disabled={pending}
            onChange={event => change("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={`${id}-email-help${errors.email ? ` ${id}-email-error` : ""}`} />
          <FieldDescription id={`${id}-email-help`}>Required. Use an address where you can be reached.</FieldDescription>
          <FieldError id={`${id}-email-error`}>{errors.email}</FieldError>
        </Field>
      </FieldGroup>
      <div className="reui-form-actions">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
        <p role="status" className="reui-save-status">{state === "saved" ? "Changes saved." : pending ? "Saving changes…" : ""}</p>
      </div>
      {state === "failed" && <p role="alert" className="cn-field-error">Could not save changes. Your edits are still here. Please try again.</p>}
    </form>
  )
}
