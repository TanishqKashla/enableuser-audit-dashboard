"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: React.ReactNode;
}

interface FaqGroup {
  title: string;
  description?: string;
  items: FaqItem[];
}

const GROUPS: FaqGroup[] = [
  {
    title: "Why accessibility matters",
    description:
      "Why this report exists and what's at stake when accessibility issues go unaddressed.",
    items: [
      {
        q: "Why should our organization care about digital accessibility?",
        a: (
          <>
            <p>
              Roughly one in six people lives with a disability that affects how
              they use digital products — vision, hearing, motor, or cognitive.
              An inaccessible website silently turns away a significant share of
              your customers, employees, and partners.
            </p>
            <p className="mt-3">
              Beyond reach, accessibility improves usability for everyone:
              clearer structure, better keyboard support, and predictable
              behavior benefit users on slow networks, older devices, mobile
              touchscreens, and high-stress contexts (driving, parenting,
              multitasking).
            </p>
          </>
        ),
      },
      {
        q: "Are there legal risks to ignoring these issues?",
        a: (
          <>
            <p>
              Yes. Most major jurisdictions now have enforceable digital
              accessibility laws — including the Americans with Disabilities
              Act (ADA) in the United States, the European Accessibility Act
              (EAA) effective June 2025 across the EU, the Accessibility for
              Ontarians with Disabilities Act (AODA) in Canada, and Section 508
              for U.S. federal contractors. Lawsuits and demand letters around
              digital accessibility have been rising year over year.
            </p>
            <p className="mt-3">
              Most of these laws reference the WCAG standard (typically Level
              AA) as the conformance benchmark — which is exactly what this
              report measures against.
            </p>
          </>
        ),
      },
      {
        q: "What's the business impact beyond compliance?",
        a: (
          <p>
            Accessible products convert better, rank higher in search, reduce
            support burden, and retain users longer. SEO crawlers rely on the
            same semantic structure that screen readers do, so fixing
            accessibility usually improves discoverability. Procurement teams
            increasingly require a VPAT or accessibility statement before
            signing — fixing issues now shortens future sales cycles.
          </p>
        ),
      },
    ],
  },
  {
    title: "Understanding this report",
    description:
      "What was tested, how the data is organized, and what the columns mean.",
    items: [
      {
        q: "What does this audit cover?",
        a: (
          <>
            <p>
              The audit evaluates the listed pages against the{" "}
              <strong>Web Content Accessibility Guidelines (WCAG) 2.1 at
              Level AA</strong> — the global benchmark referenced by most
              accessibility laws. Coverage includes:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Perceivable: text alternatives, color contrast, captions, structure</li>
              <li>Operable: keyboard access, focus management, motion, timing</li>
              <li>Understandable: readable language, predictable behavior, input help</li>
              <li>Robust: valid markup, name/role/value for assistive tech</li>
            </ul>
            <p className="mt-3">
              Each finding maps to one or more WCAG success criteria so you can
              trace it back to the underlying standard.
            </p>
          </>
        ),
      },
      {
        q: "Is this fully automated, or did humans review it?",
        a: (
          <p>
            Automated tools can reliably catch about 30–40% of accessibility
            barriers — things like missing alt text, low color contrast, and
            invalid markup. The rest require human judgement: is the alt text
            meaningful, does the page make sense in a screen reader, can a
            keyboard-only user complete the task? Our audits combine automated
            scanning with manual expert review and assistive-technology testing
            to surface issues no scanner can see on its own.
          </p>
        ),
      },
      {
        q: "Why does the same issue appear on multiple pages?",
        a: (
          <p>
            Each row in &ldquo;All issues&rdquo; is an{" "}
            <em>instance</em> — one occurrence on one page. A single underlying
            problem (say, a button without a label) often appears wherever that
            component is used. Grouping by &ldquo;Issue type&rdquo; collapses
            instances into the underlying defect; grouping by &ldquo;WCAG&rdquo;
            collapses them by the standard violated. Fixing the shared
            component usually resolves every instance in one change.
          </p>
        ),
      },
      {
        q: "What's the difference between an “affected page” and an “affected component”?",
        a: (
          <p>
            An <strong>affected page</strong> is a URL where at least one issue
            was found. An <strong>affected component</strong> is a reusable UI
            element — a navigation bar, modal, form field — that contains an
            issue. Components usually appear on many pages, which is why fixing
            one component often clears many page-level findings at once.
          </p>
        ),
      },
      {
        q: "What is the “CSS selector” for?",
        a: (
          <p>
            It's a precise pointer to the exact element in the page's HTML so
            your engineers can locate the issue immediately in the codebase or
            browser developer tools — no guesswork required.
          </p>
        ),
      },
    ],
  },
  {
    title: "Severity, scoring, and conformance",
    description:
      "How findings are prioritized and what the score and conformance grid actually represent.",
    items: [
      {
        q: "What do the severity levels mean?",
        a: (
          <>
            <ul className="space-y-2">
              <li>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-severity-critical" />
                  <strong>Critical</strong>
                </span>{" "}
                — completely blocks users with disabilities from a core task
                (e.g. an unlabeled checkout button, a keyboard trap). Fix
                immediately.
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-severity-serious" />
                  <strong>Serious</strong>
                </span>{" "}
                — major barrier; users can sometimes work around it but the
                experience is significantly degraded. Fix in the current cycle.
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-severity-moderate" />
                  <strong>Moderate</strong>
                </span>{" "}
                — friction or confusion for some users; should be fixed but
                rarely blocks completion of a task.
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-severity-minor" />
                  <strong>Minor</strong>
                </span>{" "}
                — small inconsistency or polish item. Address as part of normal
                hygiene.
              </li>
            </ul>
          </>
        ),
      },
      {
        q: "How is the accessibility score calculated?",
        a: (
          <p>
            The score is a weighted measure that penalizes severe issues more
            heavily and accounts for how many of the audited pages are affected.
            A page riddled with critical blockers will score far lower than one
            with many minor polish items. It's a directional health indicator,
            not a pass/fail certificate — the success-criterion conformance
            grid is the formal compliance view.
          </p>
        ),
      },
      {
        q: "What does the conformance grid show?",
        a: (
          <p>
            It maps each WCAG 2.1 Level A and AA success criterion to a status
            for this audit — whether issues were found against it, whether it
            was checked but clean, or whether it isn't applicable to the pages
            tested. This is the view to reference when answering compliance
            questions or completing a VPAT/ACR.
          </p>
        ),
      },
      {
        q: "What does “Needs review” mean?",
        a: (
          <p>
            Some checks can't be fully decided by a tool alone — for example,
            whether an image's alt text is genuinely descriptive, or whether a
            link's purpose is clear from context. Items flagged{" "}
            <em>Needs review</em> are real findings that require a human (your
            team or ours) to confirm the right resolution rather than apply a
            mechanical fix.
          </p>
        ),
      },
      {
        q: "What does “Best practice” mean?",
        a: (
          <p>
            A best-practice item isn't strictly required by WCAG but reflects
            an established convention that improves the experience for users
            of assistive technology. Treat these as recommended improvements,
            not blockers — but accumulating them tends to indicate
            architectural drift worth addressing.
          </p>
        ),
      },
      {
        q: "Why does one issue map to multiple WCAG criteria?",
        a: (
          <p>
            Real-world barriers often violate more than one principle at once.
            A button with no accessible name fails &ldquo;Name, Role, Value&rdquo;
            (4.1.2), but if it's also a link target it may fail &ldquo;Link
            Purpose&rdquo; (2.4.4). Mapping to every applicable criterion makes
            the report more useful when you're working from a compliance
            checklist.
          </p>
        ),
      },
    ],
  },
  {
    title: "Acting on the findings",
    description:
      "How to plan remediation, prioritize work, and keep accessibility healthy over time.",
    items: [
      {
        q: "Where should we start fixing?",
        a: (
          <>
            <p>
              A practical order of operations:
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Resolve every <strong>critical</strong> finding first — these block real users today.</li>
              <li>Address <strong>serious</strong> issues that appear on the highest-traffic pages.</li>
              <li>Fix shared components — one change usually clears many instances.</li>
              <li>Sweep <strong>moderate</strong> and <strong>minor</strong> items as part of regular sprint hygiene.</li>
              <li>Add accessibility checks to your CI / design review so regressions don't pile back up.</li>
            </ol>
          </>
        ),
      },
      {
        q: "Do we need to re-audit, and how often?",
        a: (
          <p>
            Accessibility isn't a one-off project — every release can introduce
            new barriers. Most organizations re-audit major user flows quarterly
            and run a full audit annually, with continuous automated checks in
            CI between. After a remediation push, a verification audit is
            recommended to confirm fixes actually landed correctly.
          </p>
        ),
      },
      {
        q: "Will fixing these issues break anything for other users?",
        a: (
          <p>
            Almost never. Accessibility fixes are usually additive — a label,
            an ARIA attribute, a focus style, a contrast tweak. They don't
            change visual layout or business logic for sighted mouse users.
            Where a fix does change behavior (for example, returning focus
            after closing a modal), the new behavior is what every user
            implicitly expects — it just becomes correct rather than
            accidentally working.
          </p>
        ),
      },
      {
        q: "Can Enableuser help us implement the fixes?",
        a: (
          <p>
            Yes. Beyond auditing, our team provides hands-on remediation,
            engineering pairing, design-system accessibility reviews, training,
            and ongoing monitoring. Reach out to your account contact and
            we'll scope the right level of support for your team.
          </p>
        ),
      },
      {
        q: "What if we disagree with a finding?",
        a: (
          <p>
            Reach out — we'd rather discuss than leave a finding contested.
            Some issues depend on context (intended audience, surrounding
            content, assistive-tech behavior) and a short conversation usually
            resolves whether the finding stands, should be reclassified, or is
            a documentation gap on our side.
          </p>
        ),
      },
    ],
  },
];

export default function FaqTab() {
  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-white p-5 sm:p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
          Frequently asked questions
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">
          Make sense of your accessibility report
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          A quick reference for the terms, severity levels, and decisions
          you&apos;ll encounter while reviewing this report. If something
          isn&apos;t covered here, your Enableuser contact is happy to walk
          through it.
        </p>
      </header>

      {GROUPS.map((group) => (
        <FaqGroupSection key={group.title} group={group} />
      ))}

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-slate-900">
          Still have questions?
        </h3>
        <p className="mt-1.5 text-sm text-slate-600">
          Accessibility is a long-running practice, not a single audit. If any
          finding, term, or recommendation in this report needs more context,
          reach out to your Enableuser account contact — we&apos;ll happily
          walk your team through it.
        </p>
      </div>
    </div>
  );
}

function FaqGroupSection({ group }: { group: FaqGroup }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
          {group.title}
        </h3>
        {group.description && (
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            {group.description}
          </p>
        )}
      </div>
      <ul className="divide-y divide-slate-100">
        {group.items.map((item, idx) => (
          <FaqRow key={idx} item={item} />
        ))}
      </ul>
    </section>
  );
}

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-slate-50 sm:px-6"
      >
        <span className="mt-0.5 shrink-0 text-slate-400">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className={`transition-transform ${open ? "rotate-90" : ""}`}
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="flex-1 text-sm font-medium text-slate-900">
          {item.q}
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 pl-12 text-sm leading-relaxed text-slate-700 sm:px-6 sm:pl-14">
          {item.a}
        </div>
      )}
    </li>
  );
}
