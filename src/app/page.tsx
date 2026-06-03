"use client";

import * as React from "react";
import { BookmarkIcon, type BookmarkIconHandle } from "@/components/bookmark";
import { Button } from "@/components/button";

const REPO = "https://github.com/serafimcloud/flag-wave-bookmark";

export default function Home() {
  const [active, setActive] = React.useState(true);
  const [size, setSize] = React.useState(150);
  const [amp, setAmp] = React.useState(0.6);
  const [freq, setFreq] = React.useState(0.5);
  const [period, setPeriod] = React.useState(950);
  const [saved, setSaved] = React.useState(false);

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-16">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">
              flag-wave-bookmark
            </h1>
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              className="text-[13px] text-[color:var(--fg-muted)] underline-offset-4 hover:text-[color:var(--fg)] hover:underline"
            >
              GitHub ↗
            </a>
          </div>
          <p className="text-[15px] leading-relaxed text-[color:var(--fg-muted)]">
            A bookmark icon that ripples like a flag in the wind. The top edge
            stays pinned while the cloth below snakes on a traveling sine wave -
            eased into the wind on hover, settling back to rest on leave.
          </p>
        </header>

        {/* Hero */}
        <section className="flex flex-col gap-6">
          <div
            id="hero"
            className="flex min-h-[15rem] items-center justify-center rounded-xl border border-[color:var(--border)]"
          >
            <BookmarkIcon
              active={active}
              size={size}
              amp={amp}
              freq={freq}
              period={period}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              id="toggle"
              variant={active ? "default" : "secondary"}
              onClick={() => setActive((v) => !v)}
            >
              {active ? "Stop the wind" : "Start the wind"}
            </Button>
          </div>
        </section>

        {/* Knobs */}
        <section className="grid grid-cols-2 gap-6 rounded-xl border border-[color:var(--border)] p-5 sm:grid-cols-4">
          <Knob
            id="size"
            label="Size"
            unit="px"
            value={size}
            min={24}
            max={220}
            step={2}
            onChange={setSize}
          />
          <Knob
            id="amp"
            label="Amplitude"
            value={amp}
            min={0}
            max={1.2}
            step={0.05}
            onChange={setAmp}
            format={(v) => v.toFixed(2)}
          />
          <Knob
            id="freq"
            label="Frequency"
            value={freq}
            min={0.2}
            max={2}
            step={0.1}
            onChange={setFreq}
            format={(v) => v.toFixed(1)}
          />
          <Knob
            id="period"
            label="Period"
            unit="ms"
            value={period}
            min={300}
            max={2000}
            step={50}
            onChange={setPeriod}
          />
        </section>

        {/* In context */}
        <section className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <span className="text-sm text-[color:var(--fg-muted)]">
              Hover the button - it waves on hover, settles on leave
            </span>
            <SaveButton />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-sm text-[color:var(--fg-muted)]">
              Toggle saved - the icon waves continuously while saved
            </span>
            <Button
              id="saved"
              variant={saved ? "default" : "outline"}
              onClick={() => setSaved((v) => !v)}
              className="w-fit gap-2"
            >
              <BookmarkIcon size={16} active={saved} className="shrink-0" />
              {saved ? "Saved" : "Save"}
            </Button>
          </div>
        </section>

        <footer className="border-t border-[color:var(--border)] pt-6 text-[13px] text-[color:var(--fg-muted)]">
          Procedural SVG, zero runtime dependencies, MIT licensed.{" "}
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-[color:var(--fg)]"
          >
            Source
          </a>
          .
        </footer>
      </div>
    </main>
  );
}

function Knob({
  id,
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
  format,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="flex justify-between text-[color:var(--fg-muted)]">
        <span>{label}</span>
        <span className="tabular-nums">
          {format ? format(value) : value}
          {unit}
        </span>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-white"
      />
    </label>
  );
}

function SaveButton() {
  const ref = React.useRef<BookmarkIconHandle>(null);
  return (
    <button
      onMouseEnter={() => ref.current?.startAnimation()}
      onMouseLeave={() => ref.current?.stopAnimation()}
      className="inline-flex w-fit items-center gap-2 rounded-lg border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--fg)] transition-colors hover:bg-white/[0.06]"
    >
      <BookmarkIcon ref={ref} size={18} className="shrink-0" />
      Save to reading list
    </button>
  );
}
