import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Github, Linkedin, Mail, ArrowRight, Rocket, Sparkles, ChevronRight, Folder, Cpu, Wand2, Download, Phone, PlaySquare, Youtube } from "lucide-react";

/* Personal portfolio — GH Pages + Web3Forms */

const DATA = {
  name: "John Wynter",
  role: "Bachelor of Laws / IT (Honours) • Major: Information Systems",
  blurb:
    "QUT Bachelor of Laws/IT (Hons) student majoring in Information Systems. Building AI and automation solutions for legal workflows and SMBs, with experience across Python, n8n, OpenAI agents, and privacy‑focused compliance tooling.",
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
      title: "Contract Clause Library",
      tag: "2025 • React",
      desc: "Responsive online library of reusable contract clauses for quick reference and drafting by legal teams.",
      links: [
        { href: "https://johnjohnw.github.io/contract_clause_library/", label: "Live" },
        { href: "https://github.com/JohnJohnW/contract_clause_library", label: "Repo" },
      ],
      stack: ["React", "HTML", "CSS"],
    },
    {
      title: "Telcom Compliance",
      tag: "2025 • React",
      desc: "Static microsite with telecom compliance references. Lightweight demo resource and quick lookup tool.",
      links: [
        { href: "https://johnjohnw.github.io/telcom_compliance/", label: "Live" },
        { href: "https://github.com/JohnJohnW/telcom_compliance", label: "Repo" },
      ],
      stack: ["React"],
    },
    {
      title: "Cache to the Future",
      tag: "2025 • Hackathon Project",
      desc: "Team solution for QUT Code Network Winter Hackathon 2025: a digital time capsule that encrypts messages and provides time‑based decryption keys, plus an on‑site decryption tool for downloaded files.",
      links: [
        { href: "https://github.com/mrjwei/cache-to-the-future", label: "Repo" },
      ],
      stack: ["React", "JavaScript"],
    },
    {
      title: "Federal Court Judgement Analysis",
      tag: "2025 • n8n + Agents",
      desc: "Automated daily workflows involving analysis of the Federal Court judgements RSS feed using n8n and AI‑agent integrations.",
      links: [],
      stack: ["n8n", "OpenAI agents", "Python"],
    },
    {
      title: "QITC Contract Automation",
      tag: "2025 • Legal Ops",
      desc: "Automated the document generation process for QITC comprehensive contracts using VBA and Doxsera templates.",
      links: [],
      stack: ["VBA", "Word / Doxsera"],
    },
    {
      title: "MIT WIL Project Leadership (QUT)",
      tag: "2024 • Team Lead",
      desc: "Organised and managed a WIL project for Masters IT students (Dundas Lawyers × QUT) involving an automated ERD program for forensic legal investigations using Python.",
      links: [],
      stack: ["Python"],
    },
    {
      title: "Forensic Investigation Automation",
      tag: "2024 • Python",
      desc: "Developed a Python program to track availability/activity statuses of businesses during forensic legal investigations to inform legitimacy insights.",
      links: [],
      stack: ["Python"],
    },
  ],
};

// Layout ordering fix for hero section
// Ensure image is on the right on desktop, text on left
// Add these classes in your JSX where the hero grid columns are defined:
// <div className="md:order-1"> for the text column
// <div className="relative md:order-2"> for the image column
