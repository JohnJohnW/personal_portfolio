import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

/* Personal portfolio - GH Pages + Web3Forms */

const DATA = {
  name: "John Wynter",
  role: "Law | IT",
  blurb: "",
  location: "Brisbane | Qld | Aus",
  avatar: "/personal_portfolio/headshot.png",
  socials: [
    { label: "GitHub",   href: "https://github.com/JohnJohnW" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/john-wynter/" },
    { label: "Email",    href: "mailto:johnwynter55893@outlook.com" },
    { label: "YouTube",  href: "https://www.youtube.com/@john_wynter" },
  ],
  projects: [
    {
      title: "STRATUM",
      tag: "2026",
      desc: "AML/CTF Tranche 2 compliance tool that cross-references ASIC extracts, company constitutions, and shareholder registers to detect undisclosed beneficial ownership. Uploads and parses corporate documents with Gemini, flags contradictions across them (e.g. nominee shareholders, unauthorised share classes, governance inconsistencies), and renders a live ownership graph with matched AUSTRAC/FATF typologies.",
      links: [
        { href: "https://johnjohnw.github.io/stratum/", label: "Live" },
        { href: "https://github.com/JohnJohnW/stratum", label: "Repo" },
      ],
      stack: ["Python", "FastAPI", "Gemini AI", "FAISS", "React", "Cytoscape.js", "SQLite", "AML/CTF"],
    },
    {
      title: "QUT LITS Website",
      tag: "2025",
      desc: "Built and maintain the official website for the QUT Law, Innovation, Technology and Society club as VP of IT. Custom domain at qutlitsociety.com with animated backgrounds, interactive slideshow, and responsive design.",
      links: [
        { href: "https://qutlitsociety.com", label: "Live" },
        { href: "https://github.com/litsociety/qut-lits-website", label: "Repo" },
      ],
      stack: ["React", "Vite", "Tailwind CSS", "Framer Motion"],
    },
    {
      title: "Audit Trail",
      tag: "2026",
      desc: "SaaS compliance automation platform that maps GitHub repository activity to audit-ready evidence across 8 major frameworks including ISO 27001, SOC 2, GDPR, NIST CSF, and PCI DSS. Connects via GitHub OAuth (read-only metadata only), scores 63 controls automatically, and provides a live gap analysis dashboard, continuous monitoring alerts, and a shareable auditor portal with PDF/CSV export.",
      links: [
        { href: "https://audittrail-dev.vercel.app/", label: "Live" },
        { href: "https://github.com/JohnJohnW/audittrail-dev", label: "Repo" },
      ],
      stack: [],
    },
    {
      title: "Evidencia",
      tag: "2025",
      desc: "Desktop eDiscovery software for managing litigation claims and their related documents. Features automatic date extraction from PDF, DOCX, EML, and MSG files, email chain separation with attachment processing, relationship tracking between documents and claims, and native file preservation with metadata intact.",
      links: [],
      stack: ["Python", "SQLite", "eDiscovery", "LegalTech"],
    },
    {
      title: "PawOrNaw",
      tag: "2025",
      desc: "Tanda GenAI Hackathon project: Tinder-style dog matching app for breeding. Features swipe-based matching, real-time chat, and AI-powered profile creation to help dog owners find compatible breeding partners.",
      links: [
        { href: "https://paw-or-naw.vercel.app", label: "Live" },
        { href: "https://github.com/mrjwei/paw-or-naw", label: "Repo" },
      ],
      stack: ["Next.js", "TypeScript", "ElevenLabs Agents", "ByteDance Seedream 4"],
    },
    {
      title: "LegalEase",
      tag: "2025",
      desc: "GovHack prototype (Brisbane, QLD): Legal-tech/GovTech tool that simplifies navigating regulations with citation provenance and layered jurisdictions to keep context and source traceability front-and-centre.",
      links: [
        { href: "https://johnjohnw.github.io/LegalEase/", label: "Live" },
        { href: "https://github.com/JohnJohnW/LegalEase", label: "Repo" },
        { href: "https://hackerspace.govhack.org/projects/legalease_3023", label: "GovHack" },
      ],
      stack: ["React", "GovTech", "LegalTech", "Citations", "Jurisdiction Layering"],
    },
    {
      title: "The Sixth Man",
      tag: "2025",
      desc: "TAK Hack 2025 project: ATAK plugin using Raspberry Pi with camera and 3D printed casing for helmet/firearm attachment. Captures snapshots every 5 seconds, processes with local AI to identify people, hazards, and automatically places markers on ATAK map with HQ notifications.",
      links: [],
      stack: ["Python", "Raspberry Pi", "Computer Vision", "AI", "3D Printing", "ATAK", "Military Tech"],
    },
    {
      title: "ecoSure",
      tag: "2025",
      desc: "Solo hackathon project for University of Queensland Sustainable Innovators Hackathon 2025: AI-powered environmental compliance tool for biodiversity and conservation projects. Cross-references project details against Queensland legislation and TERN datasets using RAG to flag compliance risks and biodiversity concerns.",
      links: [
        { href: "https://lnkd.in/g2yZh_Xv", label: "Demo" },
        { href: "https://lnkd.in/gzXZ6GGr", label: "Repo" },
        { href: "https://lnkd.in/gTkHcPJZ", label: "Video" },
      ],
      stack: ["AI", "RAG", "Python", "Environmental Law", "Compliance"],
    },
    {
      title: "Cache to the Future",
      tag: "2025",
      desc: "Team solution for QUT Code Network Winter Hackathon 2025: a digital time capsule that encrypts messages and provides time-based decryption keys, plus an on-site decryption tool for downloaded files.",
      links: [
        { href: "https://github.com/mrjwei/cache-to-the-future", label: "Repo" },
      ],
      stack: ["React"],
    },
    {
      title: "Federal Court Judgement Analysis",
      tag: "2025",
      desc: "Automated daily workflows involving analysis of the Federal Court judgements RSS feed using n8n and AI-agent integrations.",
      links: [],
      stack: ["n8n", "AI agents"],
    },
    {
      title: "QITC Contract Automation",
      tag: "2025",
      desc: "Automated the document generation process for QITC comprehensive contracts using VBA and Doxsera templates.",
      links: [],
      stack: ["VBA", "Word / Doxsera"],
    },
    {
      title: "MIT WIL Project Leadership (QUT)",
      tag: "2024",
      desc: "Organised and managed a WIL project for Masters IT students (Dundas Lawyers × QUT) involving an automated ERD program for forensic legal investigations using Python.",
      links: [],
      stack: [],
    },
    {
      title: "Forensic Investigation Automation",
      tag: "2024",
      desc: "Developed a Python program to track availability/activity statuses of businesses during forensic legal investigations to inform legitimacy insights.",
      links: [],
      stack: ["Python"],
    },
    {
      title: "Telcom Compliance",
      tag: "2025",
      desc: "Static microsite with telecom compliance references. Lightweight demo resource and quick lookup tool.",
      links: [
        { href: "https://johnjohnw.github.io/telcom_compliance/", label: "Live" },
        { href: "https://github.com/JohnJohnW/telcom_compliance", label: "Repo" },
      ],
      stack: ["React"],
    },
    {
      title: "Contract Clause Library",
      tag: "2025",
      desc: "Responsive online library of reusable contract clauses for quick reference and drafting by legal teams.",
      links: [
        { href: "https://johnjohnw.github.io/contract_clause_library/", label: "Live" },
        { href: "https://github.com/JohnJohnW/contract_clause_library", label: "Repo" },
      ],
      stack: ["React"],
    },
  ].sort((a, b) => {
    const yearA = parseInt(a.tag);
    const yearB = parseInt(b.tag);
    return yearB - yearA;
  }),
};

// Cross-bundler base path (works with Vite, CRA, GH Pages)
const BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL)
    ? import.meta.env.BASE_URL
    : (typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL ? process.env.PUBLIC_URL + '/' : '/');

function useTheme() {
  // Force dark theme always
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light");
    root.classList.remove("auto");
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const classes = root.classList;
          if (classes.contains('light') || !classes.contains('dark')) {
            root.classList.remove('light');
            root.classList.add('dark');
          }
        }
      });
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => {
      observer.disconnect();
      root.classList.remove("dark");
    };
  }, []);
  return { dark: true };
}

function cn(...xs) { return xs.filter(Boolean).join(" "); }

function getTimeColors() {
  const hour = new Date().getHours()

  // Dawn (5-7am): rose and gold, sunrise warmth
  if (hour >= 5 && hour < 7) {
    return {
      blobA: "from-rose-800/30 via-orange-700/25 to-amber-900/20",
      blobB: "from-amber-700/25 via-rose-800/20 to-orange-900/20",
      spot: "rgba(244,63,94,0.2)",
      accent: { light: "#fda4af", mid: "#fb7185", deep: "#f43f5e", dark: "#e11d48", ring: "#f43f5e", badge: "#9f1239", badgeBorder: "#fb7185" },
    }
  }

  // Morning (7am-12pm): clear sky blue
  if (hour >= 7 && hour < 12) {
    return {
      blobA: "from-sky-800/35 via-blue-700/25 to-sky-900/25",
      blobB: "from-blue-600/25 via-sky-700/25 to-blue-900/25",
      spot: "rgba(14,165,233,0.2)",
      accent: { light: "#7dd3fc", mid: "#38bdf8", deep: "#0ea5e9", dark: "#0284c7", ring: "#0ea5e9", badge: "#075985", badgeBorder: "#0ea5e9" },
    }
  }

  // Afternoon (12-5pm): deeper blue, slightly warmer
  if (hour >= 12 && hour < 17) {
    return {
      blobA: "from-blue-800/35 via-indigo-700/25 to-blue-900/25",
      blobB: "from-indigo-600/25 via-blue-700/25 to-indigo-900/25",
      spot: "rgba(29,78,216,0.2)",
      accent: { light: "#93c5fd", mid: "#60a5fa", deep: "#3b82f6", dark: "#2563eb", ring: "#3b82f6", badge: "#1e40af", badgeBorder: "#3b82f6" },
    }
  }

  // Golden hour (5-7pm): warm amber and orange, sunset glow
  if (hour >= 17 && hour < 19) {
    return {
      blobA: "from-orange-800/30 via-amber-700/25 to-rose-900/20",
      blobB: "from-amber-700/25 via-orange-800/20 to-amber-900/20",
      spot: "rgba(245,158,11,0.2)",
      accent: { light: "#fcd34d", mid: "#fbbf24", deep: "#f59e0b", dark: "#d97706", ring: "#f59e0b", badge: "#92400e", badgeBorder: "#f59e0b" },
    }
  }

  // Twilight (7-9pm): violet and purple, post-sunset sky
  if (hour >= 19 && hour < 21) {
    return {
      blobA: "from-violet-800/35 via-purple-700/25 to-violet-900/25",
      blobB: "from-purple-600/25 via-violet-800/25 to-purple-900/25",
      spot: "rgba(139,92,246,0.2)",
      accent: { light: "#c4b5fd", mid: "#a78bfa", deep: "#8b5cf6", dark: "#7c3aed", ring: "#8b5cf6", badge: "#5b21b6", badgeBorder: "#8b5cf6" },
    }
  }

  // Night (9pm-5am): deep navy and indigo, cool darkness
  return {
    blobA: "from-indigo-900/30 via-slate-800/20 to-indigo-950/20",
    blobB: "from-slate-800/20 via-indigo-900/20 to-slate-900/20",
    spot: "rgba(99,102,241,0.15)",
    accent: { light: "#a5b4fc", mid: "#818cf8", deep: "#6366f1", dark: "#4f46e5", ring: "#6366f1", badge: "#312e81", badgeBorder: "#6366f1" },
  }
}

function useAccentColors() {
  const colors = getTimeColors()
  useEffect(() => {
    const root = document.documentElement
    Object.entries(colors.accent).forEach(([key, val]) => {
      root.style.setProperty(`--accent-${key}`, val)
    })
  }, [])
  return colors
}

function Spotlight() {
  const { spot } = getTimeColors()
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
    `radial-gradient(600px at var(--spot-x, 50%) var(--spot-y, 50%), ${spot}, transparent 60%)`}}/>;
}

function LiquidBlobs() {
  const { blobA, blobB } = getTimeColors()
  return (
    <div className="fixed -z-10 inset-0 overflow-hidden">
      <div className={`absolute -top-24 -left-16 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br ${blobA} blur-3xl opacity-50 mix-blend-screen animate-pulse`} />
      <div className={`absolute -bottom-24 -right-16 h-[38rem] w-[38rem] rounded-full bg-gradient-to-tr ${blobB} blur-3xl opacity-50 mix-blend-screen animate-pulse`} />
    </div>
  )
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

function Section({ id, title, icon: Icon, children, subtitle, className = "" }) {
  return (
    <section id={id} className={`relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 ${className}`}>
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
  const timeColors = useAccentColors();
  const [active, setActive] = useState("home");
  const [toast, setToast] = useState(null);

  const scrollTo = (id) => () => {
    document.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  // Web3Forms submit
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
      setToast("Thanks! I'll reply soon.");
    } catch (err) {
      setToast("Couldn't send right now-try email?");
    } finally {
      setTimeout(() => setToast(null), 2600);
    }
  };

  return (
    <div className="min-h-screen text-neutral-100 selection:bg-blue-700/30" style={{ background: `radial-gradient(1400px 1000px at 20% -10%, color-mix(in srgb, var(--accent-dark) 15%, transparent), transparent), radial-gradient(1400px 1000px at 80% 110%, color-mix(in srgb, var(--accent-deep) 10%, transparent), transparent)` }}>
      <LiquidBlobs />
      <Spotlight />

      <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4">
        <div className="backdrop-blur-xl bg-black/20 border border-white/10 shadow-lg rounded-2xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight">{DATA.name}</span>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              {[
                { id: "home",       label: "Home"       },
                { id: "projects",   label: "Projects"   },
                { id: "experience", label: "Experience" },
                { id: "education",  label: "Education"  },
              ].map((t) => (
                <button key={t.id} onClick={scrollTo(t.id)}
                  className={cn("px-3 py-2 rounded-xl text-sm hover:bg-white/10 transition",
                    active === t.id && "bg-white/10")}>
                  {t.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <a href="#contact" onClick={scrollTo("contact")} className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition">
                Contact
              </a>
            </div>
          </div>
        </div>
      </header>

      <section id="home" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="md:order-1">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
              {DATA.name}
              <br />
              <span style={{ background: `linear-gradient(to right, var(--accent-light), var(--accent-mid), var(--accent-deep))`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{DATA.role}</span>
            </motion.h1>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#projects" onClick={scrollTo("projects")} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl hover:bg-white/10 transition">
                Explore projects
              </a>
              <a href="#contact" onClick={scrollTo("contact")} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white shadow-lg hover:opacity-90 transition" style={{ background: `linear-gradient(to top right, var(--accent-deep), var(--accent-mid), var(--accent-light))` }}>
                Contact
              </a>
            </div>
          </div>
          <div className="relative md:order-2">
            <Tilt>
              <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                className="relative rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl p-6 shadow-2xl"
                style={{ transformStyle: "preserve-3d" }}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl overflow-hidden" style={{ background: `linear-gradient(to bottom right, var(--accent-dark), var(--accent-deep), var(--accent-mid))` }}>
                    <img src={DATA.avatar} alt="John Wynter headshot" className="h-full w-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Hi, I'm</p>
                    <p className="text-xl font-semibold">{DATA.name}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="text-sm text-neutral-400">{DATA.location}</div>
                  <a href="#contact" onClick={scrollTo("contact")} className="inline-flex items-center gap-2 text-sm">
                    Get in touch
                  </a>
                </div>
              </motion.div>
            </Tilt>
          </div>
        </div>
      </section>

      <Section id="projects" title="Projects" className="!pt-4 !pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DATA.projects.map((p, i) => (
            <motion.article key={p.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: i * 0.03 }}
              className="relative group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 hover:border-white/20 hover:shadow-xl transition">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{p.title}</h3>
                <span className="text-xs text-neutral-400">{p.tag}</span>
              </div>
              <p className="mt-2 text-sm/6 text-neutral-200/90">{p.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <span key={s} className="text-xs rounded-lg border border-white/10 bg-white/5 px-2 py-1">{s}</span>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                {p.links.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm inline-flex items-center gap-1 hover:underline">
                    {l.label}
                  </a>
                ))}
              </div>
              <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition" style={{ background: "conic-gradient(from 180deg at 50% 50%, rgba(29,78,216,.3), rgba(30,58,138,.3), rgba(59,130,246,.25), rgba(29,78,216,.3))" }} />
            </motion.article>
          ))}
        </div>
      </Section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 backdrop-blur-xl p-6" style={{ background: `linear-gradient(to top right, color-mix(in srgb, var(--accent-dark) 40%, transparent), color-mix(in srgb, var(--accent-dark) 20%, transparent), color-mix(in srgb, var(--accent-dark) 40%, transparent))` }}>
          <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60"
               style={{ background: "url('data:image/svg+xml;utf8, %3Csvg width=\\\"60\\\" height=\\\"60\\\" viewBox=\\\"0 0 60 60\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\"%3E%3Cg fill=\\\"none\\\" stroke=\\\"white\\\" stroke-opacity=\\\"0.06\\\"%3E%3Cpath d=\\\"M0 30h60M30 0v60\\\"/%3E%3C/g%3E%3C/svg%3E')"}} />
          <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-xl font-semibold">Let's build something great.</h3>
            </div>
            <div className="flex md:justify-end gap-3">
              <a href="#contact" onClick={scrollTo("contact")} className="inline-flex items-center gap-2 rounded-xl bg-white/90 text-neutral-900 px-4 py-2 hover:bg-white">
                Contact me
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <Section id="experience" title="Experience" className="!pt-4">
        <div className="relative pl-8 overflow-visible">
          {/* Gradient timeline line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ originY: 0, background: `linear-gradient(to bottom, color-mix(in srgb, var(--accent-mid) 80%, transparent), color-mix(in srgb, var(--accent-dark) 50%, transparent), color-mix(in srgb, var(--accent-dark) 20%, transparent))` }}
            className="absolute left-[6.75px] top-2 bottom-2 w-[3px] rounded-full"
          />
          <ul className="space-y-4">

            {/* QUT GRC - active */}
            <li className="relative pl-0 group">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: 0 }}
                whileHover={{ scale: 1.2 }}
                className="absolute left-[-31.5px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full z-10 transition-transform duration-200" style={{ background: `linear-gradient(to bottom right, var(--accent-light), var(--accent-mid), var(--accent-dark))` }}
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-5 transition-transform duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:border-white/[0.15]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent rounded-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white/95">Information Security (Governance, Risk and Compliance) Associate</p>
                    <p className="text-sm text-white/50">Queensland University of Technology</p>
                  </div>
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full w-fit" style={{ color: "var(--accent-light)", backgroundColor: "color-mix(in srgb, var(--accent-badge) 20%, transparent)", borderWidth: "1px", borderStyle: "solid", borderColor: "color-mix(in srgb, var(--accent-badgeBorder) 30%, transparent)" }}>Mar 2026 - Present</span>
                </div>
              </div>
            </li>

            {/* QUT Cyber - active */}
            <li className="relative pl-0 group">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                whileHover={{ scale: 1.2 }}
                className="absolute left-[-31.5px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full z-10 transition-transform duration-200" style={{ background: `linear-gradient(to bottom right, var(--accent-light), var(--accent-mid), var(--accent-dark))` }}
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-5 transition-transform duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:border-white/[0.15]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent rounded-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white/95">General Executive</p>
                    <p className="text-sm text-white/50">QUT Cyber Security Club</p>
                  </div>
                  <span className="text-xs font-medium px-3 py-1.5 rounded-full w-fit" style={{ color: "var(--accent-light)", backgroundColor: "color-mix(in srgb, var(--accent-badge) 20%, transparent)", borderWidth: "1px", borderStyle: "solid", borderColor: "color-mix(in srgb, var(--accent-badgeBorder) 30%, transparent)" }}>Oct 2025 - Present</span>
                </div>
              </div>
            </li>

            {/* QUT LITS - grouped */}
            <li className="relative pl-0 group">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ scale: 1.2 }}
                className="absolute left-[-31.5px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full z-10 transition-transform duration-200" style={{ background: `linear-gradient(to bottom right, var(--accent-light), var(--accent-mid), var(--accent-dark))` }}
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-5 transition-transform duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:border-white/[0.15]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent rounded-3xl pointer-events-none" />
                <p className="relative font-semibold text-white/95 mb-4">QUT Law, Innovation & Technology Society</p>
                <div className="relative ml-2 pl-5 space-y-3">
                  {/* Inner timeline */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    style={{ originY: 0, background: `linear-gradient(to bottom, color-mix(in srgb, var(--accent-mid) 70%, transparent), color-mix(in srgb, var(--accent-mid) 10%, transparent))` }}
                    className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
                  />
                  {/* Vice President - active */}
                  <div className="relative group">
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      whileHover={{ scale: 1.3 }}
                      className="absolute -left-[0.35rem] top-1.5 h-3 w-3 rounded-full transition-transform duration-200" style={{ background: `linear-gradient(to bottom right, var(--accent-light), var(--accent-dark))` }}
                    />
                    <div className="pl-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="text-sm font-medium text-white/90">Vice President</p>
                        <span className="text-xs px-2.5 py-1 rounded-full w-fit" style={{ color: "var(--accent-light)", backgroundColor: "color-mix(in srgb, var(--accent-badge) 20%, transparent)", borderWidth: "1px", borderStyle: "solid", borderColor: "color-mix(in srgb, var(--accent-badgeBorder) 30%, transparent)" }}>Feb 2026 - Present</span>
                      </div>
                    </div>
                  </div>
                  {/* Secretary - past */}
                  <div className="relative group">
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.3, delay: 0.25 }}
                      whileHover={{ scale: 1.3 }}
                      className="absolute -left-[0.35rem] top-1.5 h-3 w-3 rounded-full bg-gradient-to-br from-neutral-500 to-neutral-600 transition-transform duration-200"
                    />
                    <div className="pl-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="text-sm font-medium text-white/50">Secretary</p>
                        <span className="text-xs text-white/40 bg-white/[0.06] px-2.5 py-1 rounded-full w-fit border border-white/10">Oct 2025 - Feb 2026</span>
                      </div>
                    </div>
                  </div>
                  {/* Industry Coordinator - past */}
                  <div className="relative group">
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      whileHover={{ scale: 1.3 }}
                      className="absolute -left-[0.35rem] top-1.5 h-3 w-3 rounded-full bg-gradient-to-br from-neutral-500 to-neutral-600 transition-transform duration-200"
                    />
                    <div className="pl-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="text-sm font-medium text-white/50">Industry Coordinator</p>
                        <span className="text-xs text-white/40 bg-white/[0.06] px-2.5 py-1 rounded-full w-fit border border-white/10">Jul 2025 - Oct 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            {/* Tanda - past */}
            <li className="relative pl-0 group">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                whileHover={{ scale: 1.2 }}
                className="absolute left-[-31.5px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-gradient-to-br from-neutral-500 to-neutral-600 z-10 transition-transform duration-200"
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-xl p-5 transition-transform duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:border-white/[0.1]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent rounded-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white/70">Software Engineer Intern</p>
                    <p className="text-sm text-white/40">Tanda</p>
                  </div>
                  <span className="text-xs font-medium text-white/40 bg-white/[0.06] px-3 py-1.5 rounded-full w-fit border border-white/10">Dec 2025 - Jan 2026</span>
                </div>
              </div>
            </li>

            {/* Dundas Lawyers - past */}
            <li className="relative pl-0 group">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileHover={{ scale: 1.2 }}
                className="absolute left-[-31.5px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-gradient-to-br from-neutral-500 to-neutral-600 z-10 transition-transform duration-200"
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-xl p-5 transition-transform duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:border-white/[0.1]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent rounded-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white/70">Legal Administrative Assistant</p>
                    <p className="text-sm text-white/40">Dundas Lawyers</p>
                  </div>
                  <span className="text-xs font-medium text-white/40 bg-white/[0.06] px-3 py-1.5 rounded-full w-fit border border-white/10">Mar 2024 - Mar 2026</span>
                </div>
              </div>
            </li>

            {/* Marketing Officer - past */}
            <li className="relative pl-0 group">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                whileHover={{ scale: 1.2 }}
                className="absolute left-[-31.5px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-gradient-to-br from-neutral-500 to-neutral-600 z-10 transition-transform duration-200"
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-xl p-5 transition-transform duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:border-white/[0.1]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent rounded-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white/70">Marketing Officer</p>
                    <p className="text-sm text-white/40">QUT AI & ML Society</p>
                  </div>
                  <span className="text-xs font-medium text-white/40 bg-white/[0.06] px-3 py-1.5 rounded-full w-fit border border-white/10">Aug 2025 - Oct 2025</span>
                </div>
              </div>
            </li>

          </ul>
        </div>
      </Section>

      <Section id="education" title="Education" className="!pt-4">
        <div className="relative pl-8 overflow-visible">
          {/* Gradient timeline line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ originY: 0, background: `linear-gradient(to bottom, color-mix(in srgb, var(--accent-mid) 80%, transparent), color-mix(in srgb, var(--accent-dark) 50%, transparent), color-mix(in srgb, var(--accent-dark) 20%, transparent))` }}
            className="absolute left-[6.75px] top-2 bottom-2 w-[3px] rounded-full"
          />
          <ul className="space-y-4">
            {[
              {
                degree: "Bachelor of Information Technology (Information Systems)",
                uni: "Queensland University of Technology",
                when: "Expected 2026",
              },
              {
                degree: "Bachelor of Laws (Honours)",
                uni: "Queensland University of Technology",
                when: "Expected 2028",
              },
            ].map((e, i) => (
              <li key={i} className="relative pl-0 group">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  whileHover={{ scale: 1.2 }}
                  className="absolute left-[-31.5px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full z-10 transition-transform duration-200" style={{ background: `linear-gradient(to bottom right, var(--accent-light), var(--accent-mid), var(--accent-dark))` }}
                />
                <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-5 transition-transform duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:border-white/[0.15]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent rounded-3xl pointer-events-none" />
                  <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white/95">{e.degree}</p>
                      <p className="text-sm text-white/50 mt-1">{e.uni}</p>
                    </div>
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full w-fit whitespace-nowrap" style={{ color: "var(--accent-light)", backgroundColor: "color-mix(in srgb, var(--accent-badge) 20%, transparent)", borderWidth: "1px", borderStyle: "solid", borderColor: "color-mix(in srgb, var(--accent-badgeBorder) 30%, transparent)" }}>{e.when}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="contact" title="Contact" className="!pt-4">
        <motion.form initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }}
          onSubmit={onSubmit}
          className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <label className="text-sm font-medium">Name
                <input name="name" required className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:ring-2 transition-all" style={{ "--tw-ring-color": "var(--accent-ring)" }} />
              </label>
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-medium">Email
                <input name="email" type="email" required className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:ring-2 transition-all" style={{ "--tw-ring-color": "var(--accent-ring)" }} />
              </label>
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-medium">Message
                <textarea name="message" rows={6} className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:ring-2 transition-all resize-none" style={{ "--tw-ring-color": "var(--accent-ring)" }} placeholder="Your message..." />
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <button className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-white shadow-lg hover:opacity-90 transition-all" style={{ background: `linear-gradient(to top right, var(--accent-deep), var(--accent-mid), var(--accent-light))` }}>
                Send Message
              </button>
            </div>
          </div>
        </motion.form>
      </Section>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl px-4 py-2 shadow-xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-sm text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} {DATA.name}. All rights reserved.</span>
          <div className="flex items-center gap-4">
            {DATA.socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-xs uppercase tracking-wide">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
