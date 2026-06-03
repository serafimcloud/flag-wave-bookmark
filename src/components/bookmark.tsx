"use client";

/**
 * <BookmarkIcon> - a bookmark that ripples like a flag in the wind.
 *
 * The bookmark's top edge is the pinned hoist; the cloth below it snakes on a
 * traveling sine wave. A point at height y is pushed sideways by an amount that
 * grows from 0 at the pinned top to `amp` at the free bottom edge - so the
 * SHAPE itself ripples, it doesn't just lean. Advancing the phase over time
 * makes the ripple travel down the flag.
 *
 * Three ways to drive it:
 *   <BookmarkIcon />                 // waves on hover, settles on leave
 *   <BookmarkIcon active />          // waves continuously (e.g. a saved button)
 *   const ref = useRef<BookmarkIconHandle>(null)
 *   <BookmarkIcon ref={ref} />       // ref.startAnimation() / ref.stopAnimation()
 *
 * The motion is a requestAnimationFrame loop with the amplitude eased toward
 * its target (no snap on enter/leave). It honors prefers-reduced-motion and
 * has zero runtime dependencies - a single self-contained file.
 *
 *   <BookmarkIcon size={28} amp={0.5} freq={0.5} period={1000} />
 */

import type { HTMLAttributes, MouseEvent } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface BookmarkIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface BookmarkIconProps extends HTMLAttributes<HTMLDivElement> {
  /** Pixel size of the (square) icon. */
  size?: number;
  /** Wave continuously while true (e.g. a saved/active button), not just on hover. */
  active?: boolean;
  /** Peak sideways sway at the free (bottom) edge, in viewBox units. `0` = off. */
  amp?: number;
  /** Ripples along the length (1 = a single S from top to bottom). */
  freq?: number;
  /** Milliseconds per wave cycle. Lower = faster flapping. */
  period?: number;
}

// The lucide "bookmark" outline at rest, in its 24x24 viewBox. The TOP edge
// (y=3) is the pinned hoist; the cloth below ripples in the wind.
const REST_PATH = "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z";
const Y_TOP = 3;
const Y_BOTTOM = 21;

export type FlagWaveOptions = {
  /** peak sideways sway at the free (bottom) edge, in viewBox units */
  amp?: number;
  /** ripples along the length (1 = a single S from top to bottom) */
  freq?: number;
};

// Rebuild the bookmark outline displaced by a traveling sine wave. A point at
// height y is pushed sideways by an amount that grows from 0 at the pinned top
// to `amp` at the bottom, so the shape itself snakes - it doesn't just lean.
// Advancing `phase` over time makes the ripple travel down the flag.
export function buildBookmarkFlagPath(
  phase: number,
  { amp = 0.5, freq = 0.5 }: FlagWaveOptions = {},
): string {
  if (amp <= 0.001) return REST_PATH;
  const r = (n: number) => Math.round(n * 100) / 100;
  const dx = (y: number) => {
    const u = (y - Y_TOP) / (Y_BOTTOM - Y_TOP); // 0 at the top, 1 at the bottom
    return amp * u * Math.sin(2 * Math.PI * freq * u + phase);
  };
  const P = (x: number, y: number) => `${r(x + dx(y))} ${r(y)}`;
  const STEPS = 16;

  let d = `M ${P(7, 3)} L ${P(17, 3)} `; // top edge (pinned, barely moves)
  d += `Q ${P(19, 3)} ${P(19, 5)} `; // top-right corner
  for (let i = 1; i <= STEPS; i++) d += `L ${P(19, 5 + (16 * i) / STEPS)} `; // right edge
  d += `L ${P(12, 17)} L ${P(5, 21)} `; // bottom V (the notch)
  for (let i = 1; i <= STEPS; i++) d += `L ${P(5, 21 - (16 * i) / STEPS)} `; // left edge
  d += `Q ${P(5, 3)} ${P(7, 3)} Z`; // top-left corner, close
  return d;
}

// Drive the ripple with a requestAnimationFrame loop. `amp` lerps toward its
// target so the flag eases into the wind on hover and settles back to rest on
// leave (instead of snapping). Honors prefers-reduced-motion.
export function useFlagWave(
  active: boolean,
  opts: FlagWaveOptions & { period?: number } = {},
): string {
  const { amp = 0.5, freq = 0.5, period = 1000 } = opts;
  const [d, setD] = useState(REST_PATH);

  const ampRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // `d` already initializes to REST_PATH and only changes inside the rAF loop
    // below, so when motion is reduced we just skip the loop - no setState needed.
    if (reduce) {
      return;
    }

    const tick = (now: number) => {
      if (startRef.current == null) startRef.current = now;
      const cycles = (now - startRef.current) / period;
      const target = active ? amp : 0;
      ampRef.current += (target - ampRef.current) * 0.12; // ease toward target
      setD(
        buildBookmarkFlagPath(-cycles * 2 * Math.PI, { amp: ampRef.current, freq }),
      );

      if (active || ampRef.current > 0.02) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ampRef.current = 0;
        setD(REST_PATH);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, amp, freq, period]);

  return d;
}

const BookmarkIcon = forwardRef<BookmarkIconHandle, BookmarkIconProps>(
  (
    {
      className,
      size = 28,
      active = false,
      amp,
      freq,
      period,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const [waving, setWaving] = useState(false);
    const isControlledRef = useRef(false);
    const d = useFlagWave(active || waving, { amp, freq, period });

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => setWaving(true),
        stopAnimation: () => setWaving(false),
      };
    });

    const handleMouseEnter = useCallback(
      (e: MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          setWaving(true);
        }
      },
      [onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          setWaving(false);
        }
      },
      [onMouseLeave],
    );

    return (
      <div
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={d} />
        </svg>
      </div>
    );
  },
);

BookmarkIcon.displayName = "BookmarkIcon";

export { BookmarkIcon };
export default BookmarkIcon;
