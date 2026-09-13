import { useState } from "react"
import { Button, Card, CardContent, CardDescription, CardHeader, DataState, Panel, ProfileForm, ResourceTable, type DataStateProps, type ProfileValue, type Resource } from "../src"

const resources: Resource[] = [
  { id: "design", name: "Design system", owner: "Morgan Lee", status: "active" },
  { id: "guide", name: "Getting started guide", owner: "Alex Rivera", status: "active" },
  { id: "research", name: "Research notes", owner: "Sam Chen", status: "paused" },
  { id: "roadmap", name: "Team roadmap", owner: "Alex Rivera", status: "active" },
]

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [profile, setProfile] = useState<ProfileValue>({ name: "Alex Rivera", email: "alex@example.com" })
  const [state, setState] = useState<DataStateProps["status"]>("empty")
  const [retryCount, setRetryCount] = useState(0)

  return (
    <div className="reui-kit reui-demo" data-theme={theme}>
      <a className="reui-skip-link" href="#main-content">Skip to workbench</a>
      <header className="demo-topbar">
        <a href="#main-content" className="demo-wordmark"><span className="demo-mark" aria-hidden="true">R</span> ReUI <span className="demo-wordmark-sub">/ starter</span></a>
        <Button variant="outline" type="button" onClick={() => setTheme(current => current === "light" ? "dark" : "light")}
          aria-pressed={theme === "dark"}>Dark theme</Button>
      </header>
      <main id="main-content" className="demo-main" tabIndex={-1}>
        <div className="demo-heading">
          <div><p className="demo-eyebrow">SOURCE-OWNED · REACT 19 / TAILWIND 4</p><h1>Workspace essentials</h1>
            <p className="demo-lead">A small, practical workbench. Edit a profile, find a resource, and explore honest interface states.</p></div>
          <span className="demo-version">01 / STARTER</span>
        </div>
        <p className="demo-disclaimer"><strong>Local-only demo.</strong> All data is fictional. Changes stay in this page's memory and reset on reload. Nothing is sent to a server.</p>
        <div className="demo-workspace">
          <div className="demo-stack">
            <Panel title="Profile settings" footer={<p>ProfileForm · Field · Input · Button</p>}>
              <p className="demo-section-intro">Keep the details your team sees up to date.</p>
              <ProfileForm initialValue={profile} onSave={next => setProfile(next)} />
            </Panel>
            <Card size="sm">
              <CardHeader><h2 className="cn-card-title">Current local profile</h2><CardDescription>This output reflects the last saved values.</CardDescription></CardHeader>
              <CardContent><dl className="demo-profile-output"><div><dt>Name</dt><dd>{profile.name}</dd></div><div><dt>Email</dt><dd>{profile.email}</dd></div></dl></CardContent>
            </Card>
          </div>
          <div className="demo-stack">
            <Panel title="Workspace resources" footer={<p>ResourceTable · Table · Input · Button</p>}>
              <p className="demo-section-intro">Search this local list by name or owner. Select Name to reverse its order.</p>
              <ResourceTable rows={resources} />
            </Panel>
            <Card>
              <CardHeader><h2 className="cn-card-title">State workbench</h2><CardDescription>Preview variants, not an active network request.</CardDescription></CardHeader>
              <CardContent>
                <div className="demo-state-picker" role="group" aria-label="Preview data state">
                  {(["empty", "loading", "error"] as const).map(item => <Button type="button" key={item} size="sm"
                    variant={state === item ? "secondary" : "ghost"} aria-pressed={state === item} onClick={() => setState(item)}>
                    {item === "empty" ? "Empty" : item === "loading" ? "Loading" : "Error"}
                  </Button>)}
                </div>
                <DataState status={state} onRetry={() => { setRetryCount(count => count + 1); setState("empty") }} />
                {retryCount > 0 && <p role="status" className="demo-retry-note">Local retry callback ran {retryCount} {retryCount === 1 ? "time" : "times"}. Preview returned to empty.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
        <footer className="demo-bottom"><span>Six primitive families. Four working compositions.</span><span>Adapted from free ReUI source · MIT</span></footer>
      </main>
    </div>
  )
}
