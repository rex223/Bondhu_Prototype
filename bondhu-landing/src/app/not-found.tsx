"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import animeGirlGif from "../gif/Anime Girl GIF.gif";

const vibeGuides = [
    {
        title: "Orbit of Stillness",
        details: "Breathe slowly, let the colors settle, and hop back to the landing to explore again.",
    },
    {
        title: "Aurora Pause",
        details: "Float through the calm gradients and gently glide toward the chat or entertainment hub.",
    },
    {
        title: "Cozy Orbit",
        details: "You’re close to home — return to the dashboard for the warm interactions you love.",
    },
    {
        title: "Radiant Drift",
        details: "The navigation stars are aligning — head to the entertainment or dashboard to reconnect.",
    },
];

const floatingOrbs = [
    { size: 260, top: "-15%", left: "5%", animation: "var(--animate-first)" },
    { size: 220, top: "30%", right: "-10%", animation: "var(--animate-second)" },
    { size: 160, bottom: "-8%", left: "20%", animation: "var(--animate-third)" },
    { size: 200, top: "10%", right: "15%", animation: "var(--animate-fourth)" },
];

const digits = ["4", "0", "4"];

export default function NotFoundPage() {
    const [calmLevel, setCalmLevel] = useState(68);
    const [visibleDigits, setVisibleDigits] = useState(0);
    const [sentencesVisible, setSentencesVisible] = useState(false);
    const danceDuration = useMemo(() => Math.max(0.6, 3 - calmLevel / 40), [calmLevel]);
    const danceGlow = useMemo(() => 0.28 + calmLevel / 240, [calmLevel]);
    const guide = useMemo(() => {
        const index = Math.min(
            vibeGuides.length - 1,
            Math.floor((calmLevel / 100) * (vibeGuides.length - 1))
        );
        return vibeGuides[index];
    }, [calmLevel]);

    useEffect(() => {
        setVisibleDigits(0);
        setSentencesVisible(false);
        const dropTimers: ReturnType<typeof setTimeout>[] = [];
        digits.forEach((_, index) => {
            dropTimers.push(
                setTimeout(() => {
                    setVisibleDigits(index + 1);
                }, index * 220)
            );
        });
        const finale = setTimeout(() => setSentencesVisible(true), digits.length * 220 + 180);
        return () => {
            dropTimers.forEach(clearTimeout);
            clearTimeout(finale);
        };
    }, []);

    const sliderTrackStyle = useMemo(
        () => ({
            background: `linear-gradient(90deg, rgba(34,197,94,0.9) ${calmLevel}%, rgba(148,163,184,0.2) ${calmLevel}%)`,
        }),
        [calmLevel]
    );

    const glowStyle = useMemo(
        () => ({
            boxShadow: `0 24px ${60 + calmLevel / 2}px rgba(59, 130, 246, ${0.25 + calmLevel / 200})`,
            borderColor: `rgba(255,255,255,${0.18 + calmLevel / 180})`,
        }),
        [calmLevel]
    );

    const orbFilter = useMemo(
        () => ({
            filter: `saturate(${0.7 + calmLevel / 160})`,
            opacity: 0.45 + calmLevel / 220,
        }),
        [calmLevel]
    );

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-12 text-white">
            <div className="pointer-events-none absolute inset-0">
                {floatingOrbs.map((orb, index) => (
                    <span
                        key={`orb-${index}`}
                        className="absolute rounded-full bg-gradient-to-br from-sky-400/40 to-purple-500/30 blur-3xl opacity-60"
                        style={{
                            width: orb.size,
                            height: orb.size,
                            top: orb.top,
                            right: orb.right,
                            left: orb.left,
                            bottom: orb.bottom,
                            animation: orb.animation,
                            animationDuration: "28s",
                            animationTimingFunction: "ease-in-out",
                            animationIterationCount: "infinite",
                            ...orbFilter,
                        }}
                    />
                ))}
            </div>

            <main
                className="relative z-10 mx-auto flex max-w-5xl flex-col gap-10 rounded-3xl bg-white/5 p-8 backdrop-blur-3xl"
                style={glowStyle}
            >
                <header className="space-y-3 text-center">
                    <div className="flex items-end justify-center gap-3 text-teal-300">
                        {digits.map((digit, index) => (
                            <span
                                key={`digit-${index}`}
                                className={`text-[clamp(4.5rem,10vw,7.75rem)] font-black leading-none tracking-tight transition-opacity duration-200 ${visibleDigits > index ? "opacity-100" : "opacity-0"
                                    }`}
                                style={{
                                    animation: visibleDigits > index ? `dropDigit 0.8s ease forwards ${index * 0.15}s` : undefined,
                                }}
                            >
                                {digit}
                            </span>
                        ))}
                    </div>
                    <p
                        className={`text-xs uppercase tracking-[0.6em] text-teal-200/80 transition-opacity duration-300 ${sentencesVisible ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        Calm navigations lost
                    </p>
                    <p
                        className={`mx-auto max-w-2xl text-base text-slate-200 transition-all duration-400 ${sentencesVisible ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        This serene pocket is intentional. Dial the calm slider to shift the energy and chart a new course.
                    </p>
                </header>

                <section className="grid gap-8 rounded-2xl bg-slate-950/60 p-6 shadow-xl ring-1 ring-white/10 md:grid-cols-[1.3fr_1fr]">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm uppercase tracking-[0.4em] text-slate-400">
                            <span>Stillness</span>
                            <span>{calmLevel}%</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={calmLevel}
                            onChange={(event) => setCalmLevel(Number(event.target.value))}
                            className="h-1 w-full appearance-none rounded-full bg-white/5 accent-teal-400"
                            style={sliderTrackStyle}
                        />
                        <p className="text-xs uppercase tracking-[0.5em] text-white/60">{calmLevel > 82 ? "Serenity flush" : calmLevel > 40 ? "Harmonic" : "Quiet hum"}</p>
                        <p className="text-lg font-semibold leading-relaxed text-white/90">{guide.title}</p>
                        <p className="text-sm text-slate-300">{guide.details}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                            <button
                                type="button"
                                onClick={() => setCalmLevel((prev) => (prev > 80 ? 52 : prev + 12))}
                                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 transition hover:border-white/40"
                            >
                                {calmLevel > 80 ? "Reset calm" : "Boost the vibe"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setCalmLevel(64)}
                                className="rounded-full border border-transparent bg-gradient-to-r from-teal-400/70 to-blue-500/70 px-4 py-2 font-semibold text-white shadow-lg shadow-cyan-500/40 transition hover:opacity-90"
                            >
                                Let it hover
                            </button>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div
                            className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/30 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.6)]"
                            style={{
                                animation: `glowPulse ${danceDuration}s ease-in-out infinite`,
                                boxShadow: `0 0 ${30 + calmLevel / 2}px rgba(14, 165, 233, ${danceGlow})`,
                            }}
                        >
                            <div className="mx-auto w-full max-w-[210px] rounded-2xl bg-white/5 p-3 md:max-w-[260px]">
                                <div className="relative h-[260px] w-full overflow-hidden rounded-[1.5rem] md:h-[300px]">
                                    <Image
                                        src={animeGirlGif}
                                        alt="Animated calm guide"
                                        className="h-full w-full object-cover"
                                        draggable={false}
                                        priority
                                    />
                                </div>
                            </div>
                            <p className="mt-3 text-center text-xs uppercase tracking-[0.4em] text-slate-300">
                                Groove level {calmLevel}%
                            </p>
                        </div>
                        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Navigation Constellations</p>
                            <ul className="space-y-3 text-sm text-slate-200">
                                <li>
                                    <Link className="underline-offset-4 hover:text-teal-300" href="/">
                                        Landing &ndash; Reconnect where it began
                                    </Link>
                                </li>
                                <li>
                                    <Link className="underline-offset-4 hover:text-teal-300" href="/dashboard">
                                        Dashboard &ndash; Check your conversation energy
                                    </Link>
                                </li>
                                <li>
                                    <Link className="underline-offset-4 hover:text-teal-300" href="/entertainment">
                                        Entertainment Hub &ndash; Rediscover playful pathways
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <footer className="flex flex-col items-center gap-4 text-center">
                    <p className="text-sm text-slate-400">
                        Orbit complete. Press the button below to return to somewhere familiar.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-teal-400 to-blue-500 px-6 py-2 text-sm font-semibold uppercase tracking-widest text-slate-900 shadow-[0_10px_40px_rgba(59,130,246,0.4)] transition hover:opacity-90"
                    >
                        Bring me home
                    </Link>
                </footer>
            </main>

            <style jsx>{`
        @keyframes dropDigit {
          0% {
            transform: translateY(-120%);
            opacity: 0;
          }
          65% {
            transform: translateY(10%);
            opacity: 1;
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes glowPulse {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.01);
          }
        }
        @keyframes fadePulse {
          0%,
          100% {
            opacity: 0.9;
          }
          50% {
            opacity: 1;
          }
        }
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: white;
          box-shadow: 0 0 12px rgba(14, 165, 233, 0.65);
          transition: transform 0.2s ease;
        }
        input[type='range']:active::-webkit-slider-thumb {
          transform: scale(1.2);
        }
        input[type='range']::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          border: none;
          background: white;
          box-shadow: 0 0 12px rgba(14, 165, 233, 0.65);
        }
      `}</style>
        </div>
    );
}