import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Directful — Campaign Builder" },
      {
        name: "description",
        content:
          "A world-class email and SMS campaign builder for AI-native hospitality teams.",
      },
      { property: "og:title", content: "Directful — Campaign Builder" },
      {
        property: "og:description",
        content:
          "Two authoring experiences: an interactive live canvas and a structured builder with live preview.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-dvh bg-[#f6f6f4] text-zinc-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-zinc-900">
            <div className="size-2.5 rotate-45 bg-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Directful</span>
          <span className="ml-2 rounded-full border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Studio
          </span>
        </div>
        <nav className="hidden gap-6 text-sm text-zinc-500 md:flex">
          <a className="hover:text-zinc-900" href="#">Campaigns</a>
          <a className="hover:text-zinc-900" href="#">Audiences</a>
          <a className="hover:text-zinc-900" href="#">Analytics</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/ota"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-[13px] font-semibold text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
          >
            OTA Buster
          </Link>
          <Link
            to="/campaign"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            New campaign
          </Link>
        </div>

      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            New campaign · Choose an authoring experience
          </p>
          <h1 className="mt-4 text-balance font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
            Two ways to compose the perfect guest email.
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-zinc-500">
            Pick the surface that fits how you think. Both share the same
            versioning, personalization, AI, and delivery pipeline underneath.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <ChoiceCard
            to="/canvas"
            eyebrow="Direction A"
            title="Interactive Live Canvas"
            body="Direct-manipulation editor. Every element on the email is selectable — floating toolbars, inline typography, contextual inspector."
            badge="Recommended"
            preview={<CanvasPreview />}
          />
          <ChoiceCard
            to="/structured"
            eyebrow="Direction B"
            title="Structured Builder + Live Preview"
            body="Property-first editor. Read-only email on the left, organized form groups on the right. Predictable and scalable for complex campaigns."
            preview={<StructuredPreview />}
          />
        </div>
      </main>
    </div>
  );
}

function ChoiceCard({
  to,
  eyebrow,
  title,
  body,
  badge,
  preview,
}: {
  to: string;
  eyebrow: string;
  title: string;
  body: string;
  badge?: string;
  preview: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/60"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-zinc-100 bg-zinc-50">
        {preview}
        {badge ? (
          <span className="absolute right-3 top-3 rounded-full bg-zinc-900 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          {eyebrow}
        </span>
        <h2 className="mt-2 text-xl font-medium tracking-tight">{title}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-zinc-500">{body}</p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
          Open editor
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function CanvasPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="grid h-full w-full grid-cols-[80px_1fr_100px]">
        <div className="border-r border-zinc-100 bg-white p-2">
          <div className="mb-2 h-2 w-10 rounded bg-zinc-200" />
          <div className="space-y-1.5">
            <div className="h-3 rounded bg-zinc-100" />
            <div className="h-3 rounded bg-zinc-100" />
            <div className="h-3 rounded bg-blue-100" />
            <div className="h-3 rounded bg-zinc-100" />
          </div>
        </div>
        <div className="flex items-center justify-center p-3">
          <div className="w-full max-w-[180px] overflow-hidden rounded-sm bg-white shadow-md shadow-zinc-300/50 ring-2 ring-blue-500">
            <div className="aspect-[3/2] bg-gradient-to-br from-amber-200 via-orange-200 to-sky-200" />
            <div className="space-y-1.5 p-2.5">
              <div className="h-2 w-3/4 rounded bg-zinc-800" />
              <div className="h-1.5 rounded bg-zinc-200" />
              <div className="h-1.5 w-2/3 rounded bg-zinc-200" />
              <div className="mt-1 h-3 w-14 rounded-sm bg-zinc-900" />
            </div>
          </div>
        </div>
        <div className="border-l border-zinc-100 bg-white p-2">
          <div className="mb-2 h-2 w-8 rounded bg-zinc-200" />
          <div className="space-y-1">
            <div className="h-4 rounded border border-zinc-200" />
            <div className="h-4 rounded border border-zinc-200" />
            <div className="h-4 rounded border border-zinc-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StructuredPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="grid h-full w-full grid-cols-[70px_1fr_120px]">
        <div className="border-r border-zinc-100 bg-white p-2">
          <div className="mb-2 h-2 w-8 rounded bg-zinc-200" />
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full bg-zinc-400" />
              <div className="h-2 flex-1 rounded bg-zinc-100" />
            </div>
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full bg-zinc-400" />
              <div className="h-2 flex-1 rounded bg-zinc-100" />
            </div>
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full bg-emerald-500" />
              <div className="h-2 flex-1 rounded bg-zinc-800" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center bg-zinc-100/60 p-3">
          <div className="w-full max-w-[160px] overflow-hidden rounded-sm bg-white shadow-md shadow-zinc-300/50">
            <div className="aspect-[4/3] bg-gradient-to-br from-stone-200 via-amber-100 to-orange-200" />
            <div className="space-y-1.5 p-2.5">
              <div className="h-2 w-2/3 rounded bg-zinc-800" />
              <div className="h-1.5 rounded bg-zinc-200" />
              <div className="mt-1 h-3 w-16 rounded-sm bg-[#926b4d]" />
            </div>
          </div>
        </div>
        <div className="border-l border-zinc-100 bg-white p-2">
          <div className="mb-1.5 h-1.5 w-10 rounded bg-zinc-300" />
          <div className="space-y-1.5">
            <div className="h-5 rounded border border-zinc-200 bg-zinc-50" />
            <div className="h-5 rounded border border-zinc-200 bg-zinc-50" />
            <div className="grid grid-cols-2 gap-1">
              <div className="h-5 rounded border border-zinc-200 bg-zinc-50" />
              <div className="h-5 rounded border border-zinc-200 bg-zinc-50" />
            </div>
            <div className="h-1.5 w-8 rounded bg-zinc-300" />
            <div className="h-5 rounded border border-zinc-200 bg-zinc-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
