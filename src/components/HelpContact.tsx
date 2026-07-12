"use client";

import { useState } from "react";
import { Mascot } from "@/components/Mascot";

const EMAIL = "Slsabilhassan1@gmail.com";
// FormSubmit relays the form straight to the inbox — no backend, no account.
// (The very first submission triggers a one-time activation email.)
const ENDPOINT = `https://formsubmit.co/ajax/${EMAIL}`;

const TOPICS = [
  { id: "help", label: "I need help", emoji: "🆘" },
  { id: "feedback", label: "I have feedback", emoji: "💡" },
  { id: "bug", label: "I found a bug", emoji: "🐛" },
  { id: "hi", label: "Just saying hi", emoji: "👋" },
] as const;

type Status = "idle" | "sending" | "sent" | "error" | "activation";

// Sends help/feedback straight from the page. If the relay ever fails, the
// visitor still has the mail-app and copy-address fallbacks below.
export function HelpContact() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);

  const subject = `[Hacky Stacky] ${topic.label}`;
  const mailtoBody = [
    "Hi Slsabil,",
    "",
    message || "(write your message here)",
    "",
    `— ${name.trim() || "an anonymous learner"}`,
  ].join("\n");
  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailtoBody)}`;

  async function send() {
    if (!message.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          topic: topic.label,
          message: message.trim(),
          name: name.trim() || "Anonymous learner",
          ...(replyTo.trim() ? { _replyto: replyTo.trim() } : {}),
          _subject: subject,
          _template: "table",
          _captcha: "false",
          _honey: "",
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success !== "false") {
        setStatus("sent");
      } else if (/activat|confirm/i.test(data?.message ?? "")) {
        // One-time per domain: FormSubmit holds the first submission and
        // emails the owner an activation link instead of delivering it.
        setStatus("activation");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; the address is visible either way.
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-accent/40 bg-accent/5 p-8 text-center sm:p-10">
        <Mascot size={90} />
        <h3 className="mt-5 text-xl font-semibold text-fg">
          Delivered! 📬
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Sudo hopped your message straight to the inbox.
          {replyTo.trim()
            ? " If it needs an answer, it'll come back to the email you left."
            : " If you wanted a reply, send another with your email next time!"}
        </p>
        <button
          onClick={() => {
            setMessage("");
            setStatus("idle");
          }}
          className="mt-6 rounded-full border border-border px-5 py-2.5 text-sm text-fg transition-colors hover:border-accent hover:bg-white/5"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      {/* Topic chips */}
      <div className="text-xs font-semibold uppercase tracking-wider text-muted">
        What&apos;s it about?
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTopic(t)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              topic.id === t.id
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:border-white/25 hover:text-fg"
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Message */}
      <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-muted">
        Your message
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder={
            topic.id === "bug"
              ? "What happened, and on which page? The more detail, the faster the fix…"
              : topic.id === "hi"
                ? "Sudo reads these out loud. Allegedly."
                : "Tell us what's on your mind…"
          }
          className="mt-2 w-full resize-y rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm normal-case tracking-normal text-fg outline-none placeholder:text-muted/60 focus:border-accent"
        />
      </label>

      {/* Name + reply email (both optional) */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
          Your name <span className="font-normal normal-case">(optional)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous learner"
            className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm normal-case tracking-normal text-fg outline-none placeholder:text-muted/60 focus:border-accent"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
          Your email{" "}
          <span className="font-normal normal-case">(if you want a reply)</span>
          <input
            type="email"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm normal-case tracking-normal text-fg outline-none placeholder:text-muted/60 focus:border-accent"
          />
        </label>
      </div>

      {/* Send */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={send}
          disabled={!message.trim() || status === "sending"}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send it 🚀"}
        </button>
        <button
          onClick={copyAddress}
          className="rounded-full border border-border px-5 py-3 text-sm text-fg transition-colors hover:border-accent hover:bg-white/5"
        >
          {copied ? "Copied!" : "Copy the address"}
        </button>
      </div>

      {status === "activation" && (
        <p className="mt-4 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-fg/90">
          This form is brand new and waking up — your message didn&apos;t go
          out yet. Try again in a little while, or{" "}
          <a href={mailto} className="text-accent underline underline-offset-2">
            send it from your email app
          </a>{" "}
          right now.
        </p>
      )}

      {status === "error" && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Hmm, that didn&apos;t go through. Try again in a moment — or{" "}
          <a href={mailto} className="underline underline-offset-2">
            send it from your own email app
          </a>{" "}
          instead.
        </p>
      )}

      <p className="mt-3 text-xs text-muted">
        Sends right from this page — no email app needed. Prefer your own?{" "}
        <a href={mailto} className="text-link hover:text-fg">
          Compose it there
        </a>{" "}
        or write to {EMAIL} directly.
      </p>
    </div>
  );
}
