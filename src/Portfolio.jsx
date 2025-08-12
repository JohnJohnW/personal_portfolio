import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Github, Linkedin, Mail, ArrowRight, Rocket, Sparkles, ChevronRight, Folder, Cpu, Wand2, Download, Phone, PlaySquare, Youtube } from "lucide-react";

/* Personal portfolio — GH Pages + Web3Forms */

const DATA = {
  name: "John Wynter",
  role: "Information Systems · Legal Tech · Automation",
  blurb:
    "QUT IT (Hons) student building AI + automation for legal workflows and SMBs. Experience across Python, n8n, OpenAI agents, and privacy‑aware compliance tooling.",
  location: "Brisbane / Remote",
  avatar: "/personal_portfolio/headshot.png",
  resume: "/personal_portfolio/John_Wynter_Resume.pdf",
  socials: [
    { icon: Github, label: "GitHub", href: "https://github.com/JohnJohnW" },
    { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/john-wynter/" },
    { icon: Mail, label: "Email", href: "mailto:johnwynter55893@outlook.com" },
    { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@john_wynter" },
  ],
  projects: [
    {
      title: "Federal Court Judgement Analysis",
      tag: "2025 • n8n + Agents",
      desc: "Automated RSS ingestion and AI summaries of Federal Court judgements with routing to email and dashboards.",
      links: [{ href: "#", label: "Details" }],
      stack: ["n8n", "OpenAI agents", "Python"],
    },
    {
      title: "QITC Contract Automation",
      tag: "2025 • Legal Ops",
      desc: "End‑to‑end generation for QITC comprehensive contracts using VBA + Doxsera templates.",
      links: [{ href: "#", label: "Case notes" }],
      stack: ["VBA", "Word / Doxsera"],
    },
    {
      title: "MIT WIL Project Leadership (QUT)",
      tag: "2024 • Team Lead",
      desc: "Led Masters IT WIL project to auto‑generate ERDs for forensic legal investigations in Python.",
      links: [{ href: "#", label: "Write‑up" }],
      stack: ["Python", "Graph", "Automation"],
    },
    {
      title: "Forensic Investigation Automation",
      tag: "2024 • Python",
      desc: "Web‑scraping pipeline to track business activity/availability for legitimacy insights.",
      links: [{ href: "#", label: "Repo" }],
      stack: ["Python", "Requests", "BeautifulSoup"],
    },
  ],
};

// Helper: convert channelId UC... -> uploads playlist UU...
const uploadsPlaylist = (channelId) =>
  channelId && channelId.startsWith("UC") ? `UU${channelId.slice(2)}` : "";

function useTheme() {
  const [dark] = useState(true);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    return () => root.classList.remove("dark");
  }, []);
  return { dark };
}

function cn(...xs) { return xs.filter(Boolean).join(" "); }

function Spotlight() {
  useEffect(() => {
    const root = document.documentElement;
    const move = (e) => {
      const x = e.clientX; const y = e.clientY;
      root.style.setProperty("--spot-x", x + "px");
      root.style.setProperty("--spot-y", y + "px");
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return <div aria-hidden className="pointer-events-none fixed inset-0 z-0" style={{ background:
    "radial-gradient(600px at var(--spot-x, 50%) var(--spot-y, 50%), rgba(99,102,241,0.25), transparent 60%)"}}/>;
}

function LiquidBlobs() {
  return (
    <div className="fixed -z-10 inset-0 overflow-hidden">
      <div className="absolute -top-24 -left-16 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-fuchsia-500/40 via-indigo-500/30 to-blue-500/30 blur-3xl opacity-70 mix-blend-screen animate-pulse" />
      <div className="absolute -bottom-24 -right-16 h-[38rem] w-[38rem] rounded-full bg-gradient-to-tr from-cyan-400/30 via-sky-500/30 to-indigo-600/30 blur-3xl opacity-70 mix-blend-screen animate-[pulse_9s_ease-in-out_infinite]" />
    </div>
  );
}

function Dock({ items }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl px-3 py-2 flex gap-2">
        {items.map((it, i) => (
          <button key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} onClick={it.onClick}
            className="relative grid place-items-center aspect-square h-11 rounded-xl transition-all"
            style={{ transform: hovered === i ? "scale(1.15)" : "scale(1)" }} aria-label={it.label} title={it.label}>
            <it.icon className="h-5 w-5" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Tilt({ children }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [0, 1], [8, -8]);
  const rotateY = useTransform(x, [0, 1], [-8, 8]);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      x.set(px); y.set(py);
    };
    const onLeave = () => { x.set(0.5); y.set(0.5); };
    onLeave();
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => { el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); };
  }, [x, y]);
  return <motion.div ref={ref} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>{children}</motion.div>;
}

function Section({ id, title, icon: Icon, children, subtitle }) {
  return (
    <section id={id} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }}
        className="flex items-center gap-3 text-2xl sm:text-3xl font-semibold tracking-tight">
        {Icon && <Icon className="h-6 w-6" />} {title}
      </motion.h2>
      {subtitle && (
        <motion.p initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }}
          className="mt-2 text-sm/6 text-neutral-300">{subtitle}</motion.p>
      )}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function Portfolio() {
  useTheme();
  const [active, setActive] = useState("home");
  const [toast, setToast] = useState(null);

  const scrollTo = (id) => () => {
    document.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const payload = new URLSearchParams();
      payload.append("access_key", "e3f86196-c795-4d77-b6a4-b03183583b4d");
      payload.append("name", fd.get("name") || "");
      payload.append("email", fd.get("email") || "");
      payload.append("message", fd.get("message") || "");
      payload.append("budget", fd.get("budget") || "Undecided");
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString()
      });
      if (!res.ok) throw new Error("web3forms failed");
      setToast("Thanks! I’ll reply soon.");
    } catch (err) {
      setToast("Couldn’t send right now—try email?");
    } finally {
      setTimeout(() => setToast(null), 2600);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_800px_at_20%_-10%,rgba(59,130,246,.2),transparent),radial-gradient(1200px_800px_at_80%_110%,rgba(236,72,153,.15),transparent)] text-neutral-100 selection:bg-indigo-500/30">
      <LiquidBlobs />
      <Spotlight />

      <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4">
        <div className="backdrop-blur-xl bg-black/20 border border-white/10 shadow-lg rounded-2xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <img src="/apple-touch-icon.png" alt="Site icon" className="h-8 w-8 rounded-xl object-cover" />
              <span className="font-semibold tracking-tight">{DATA.name}</span>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              {[
                { id: "home", label: "Home" },
                { id: "projects", label: "Projects" },
                { id: "videos", label: "Videos" },
                { id: "experience", label: "Experience" },
                { id: "contact", label: "Contact" },
              ].map((t) => (
                <button key={t.id} onClick={scrollTo(t.id)}
                  className={cn("px-3 py-2 rounded-xl text-sm hover:bg-white/10 transition",
                    active === t.id && "bg-white/10")}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <a href="#contact" onClick={scrollTo("contact")} className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition">
                <Sparkles className="h-4 w-4" /> Work with me
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* rest of component unchanged */}
    </div>
  );
}
