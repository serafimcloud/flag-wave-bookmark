"use client";

import * as React from "react";
import { BookmarkIcon, type BookmarkIconHandle } from "./bookmark";

export default function BookmarkDemo() {
  const [saved, setSaved] = React.useState(false);
  const hoverRef = React.useRef<BookmarkIconHandle>(null);

  return (
    <div className="flex min-h-[340px] w-full flex-col items-center justify-center gap-10 rounded-xl bg-neutral-950 p-10 text-neutral-100">
      {/* Always waving hero */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-neutral-500">A bookmark in the wind</span>
        <BookmarkIcon active size={96} amp={0.6} period={950} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Hover to wave */}
        <button
          onMouseEnter={() => hoverRef.current?.startAnimation()}
          onMouseLeave={() => hoverRef.current?.stopAnimation()}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-200 transition-colors hover:bg-neutral-800"
        >
          <BookmarkIcon ref={hoverRef} size={18} />
          Hover me
        </button>

        {/* Toggle saved */}
        <button
          onClick={() => setSaved((v) => !v)}
          className={
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors " +
            (saved
              ? "bg-white text-black"
              : "border border-neutral-700 text-neutral-200 hover:bg-neutral-800")
          }
        >
          <BookmarkIcon size={18} active={saved} />
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
