export const me = {
  email: "johnwynter55893@outlook.com",
  socials: [
    { label: "Email", text: "johnwynter55893@outlook.com", href: "mailto:johnwynter55893@outlook.com" },
    { label: "GitHub", text: "JohnJohnW", href: "https://github.com/JohnJohnW" },
    { label: "LinkedIn", text: "john-wynter", href: "https://www.linkedin.com/in/john-wynter/" },
    { label: "YouTube", text: "@john_wynter", href: "https://www.youtube.com/@john_wynter" },
    { label: "WeChat", text: "john_wynter" },
  ],
};

export const projects = [
  {
    title: "UQ JATL Alt+Law Website",
    sketch: "pathways",
    year: 2026,
    desc: "Paid commission for the UQ Justice and the Law Society (JATL): a student-led careers guide showcasing the breadth of legal practice beyond commercial clerkships, featuring practitioner interviews, alternative legal pathways, and mentorship resources. Sponsored by the College of Law and hosted at altlawuqjatl.com.",
    links: [{ label: "live", href: "https://altlawuqjatl.com/" }],
    stack: ["Next.js", "React", "Tailwind CSS"],
  },
  {
    title: "STRATUM",
    sketch: "graph",
    year: 2026,
    desc: "AML/CTF Tranche 2 compliance tool that cross-references ASIC extracts, company constitutions, and shareholder registers to detect undisclosed beneficial ownership. Uploads and parses corporate documents with Gemini, flags contradictions across them (e.g. nominee shareholders, unauthorised share classes, governance inconsistencies), and renders a live ownership graph with matched AUSTRAC/FATF typologies.",
    links: [
      { label: "live", href: "https://johnjohnw.github.io/stratum/" },
      { label: "repo", href: "https://github.com/JohnJohnW/stratum" },
    ],
    stack: ["Python", "FastAPI", "Gemini AI", "FAISS", "React", "Cytoscape.js", "SQLite", "AML/CTF"],
  },
  {
    title: "Audit Trail",
    sketch: "audit",
    year: 2026,
    desc: "SaaS compliance automation platform that maps GitHub repository activity to audit-ready evidence across 8 major frameworks including ISO 27001, SOC 2, GDPR, NIST CSF, and PCI DSS. Connects via GitHub OAuth (read-only metadata only), scores 63 controls automatically, and provides a live gap analysis dashboard, continuous monitoring alerts, and a shareable auditor portal with PDF/CSV export.",
    links: [
      { label: "live", href: "https://audittrail-dev.vercel.app/" },
      { label: "repo", href: "https://github.com/JohnJohnW/audittrail-dev" },
    ],
    stack: ["Next.js", "TypeScript", "Supabase", "Prisma", "Tailwind CSS", "GitHub OAuth", "Compliance"],
  },
  {
    title: "QUT LITS Website",
    sketch: "browser",
    year: 2025,
    desc: "Built and maintain the official website for the QUT Law, Innovation, Technology and Society club as VP of IT. Custom domain at qutlitsociety.com with animated backgrounds, interactive slideshow, and responsive design.",
    links: [
      { label: "live", href: "https://qutlitsociety.com" },
      { label: "repo", href: "https://github.com/litsociety/qut-lits-website" },
    ],
    stack: ["React", "Vite", "Tailwind CSS", "Framer Motion"],
  },
  {
    title: "Evidencia",
    sketch: "timeline",
    year: 2025,
    desc: "Desktop eDiscovery software for managing litigation claims and their related documents. Features automatic date extraction from PDF, DOCX, EML, and MSG files, email chain separation with attachment processing, relationship tracking between documents and claims, and native file preservation with metadata intact.",
    links: [],
    stack: ["Python", "SQLite", "eDiscovery", "LegalTech"],
  },
  {
    title: "PawOrNaw",
    sketch: "paw",
    year: 2025,
    desc: "Tanda GenAI Hackathon project: Tinder-style dog matching app for breeding. Features swipe-based matching, real-time chat, and AI-powered profile creation to help dog owners find compatible breeding partners.",
    links: [
      { label: "live", href: "https://paw-or-naw.vercel.app" },
      { label: "repo", href: "https://github.com/mrjwei/paw-or-naw" },
    ],
    stack: ["Next.js", "TypeScript", "ElevenLabs Agents", "ByteDance Seedream 4"],
  },
  {
    title: "LegalEase",
    sketch: "layers",
    year: 2025,
    desc: "GovHack prototype (Brisbane, QLD): Legal-tech/GovTech tool that simplifies navigating regulations with citation provenance and layered jurisdictions to keep context and source traceability front-and-centre.",
    links: [
      { label: "live", href: "https://johnjohnw.github.io/LegalEase/" },
      { label: "repo", href: "https://github.com/JohnJohnW/LegalEase" },
      { label: "govhack", href: "https://hackerspace.govhack.org/projects/legalease_3023" },
    ],
    stack: ["React", "GovTech", "LegalTech", "Citations", "Jurisdiction Layering"],
  },
  {
    title: "The Sixth Man",
    sketch: "scope",
    year: 2025,
    desc: "TAK Hack 2025 project: ATAK plugin using Raspberry Pi with camera and 3D printed casing for helmet/firearm attachment. Captures snapshots every 5 seconds, processes with local AI to identify people, hazards, and automatically places markers on ATAK map with HQ notifications.",
    links: [],
    stack: ["Python", "Raspberry Pi", "Computer Vision", "AI", "3D Printing", "ATAK", "Military Tech"],
  },
  {
    title: "ecoSure",
    sketch: "habitat",
    year: 2025,
    desc: "Solo hackathon project for University of Queensland Sustainable Innovators Hackathon 2025: AI-powered environmental compliance tool for biodiversity and conservation projects. Cross-references project details against Queensland legislation and TERN datasets using RAG to flag compliance risks and biodiversity concerns.",
    links: [
      { label: "demo", href: "https://lnkd.in/g2yZh_Xv" },
      { label: "repo", href: "https://lnkd.in/gzXZ6GGr" },
      { label: "video", href: "https://lnkd.in/gTkHcPJZ" },
    ],
    stack: ["AI", "RAG", "Python", "Environmental Law", "Compliance"],
  },
  {
    title: "Cache to the Future",
    sketch: "capsule",
    year: 2025,
    desc: "Team solution for QUT Code Network Winter Hackathon 2025: a digital time capsule that encrypts messages and provides time-based decryption keys, plus an on-site decryption tool for downloaded files.",
    links: [{ label: "repo", href: "https://github.com/mrjwei/cache-to-the-future" }],
    stack: ["React"],
  },
  {
    title: "Federal Court Judgement Analysis",
    sketch: "feed",
    year: 2025,
    desc: "Automated daily workflows involving analysis of the Federal Court judgements RSS feed using n8n and AI-agent integrations.",
    links: [],
    stack: ["n8n", "AI agents"],
  },
  {
    title: "QITC Contract Automation",
    sketch: "template",
    year: 2025,
    desc: "Automated the document generation process for QITC comprehensive contracts using VBA and Doxsera templates.",
    links: [],
    stack: ["VBA", "Word / Doxsera"],
  },
  {
    title: "Telcom Compliance",
    sketch: "tower",
    year: 2025,
    desc: "Static microsite with telecom compliance references. Lightweight demo resource and quick lookup tool.",
    links: [
      { label: "live", href: "https://johnjohnw.github.io/telcom_compliance/" },
      { label: "repo", href: "https://github.com/JohnJohnW/telcom_compliance" },
    ],
    stack: ["React"],
  },
  {
    title: "Contract Clause Library",
    sketch: "shelf",
    year: 2025,
    desc: "Responsive online library of reusable contract clauses for quick reference and drafting by legal teams.",
    links: [
      { label: "live", href: "https://johnjohnw.github.io/contract_clause_library/" },
      { label: "repo", href: "https://github.com/JohnJohnW/contract_clause_library" },
    ],
    stack: ["React"],
  },
  {
    title: "MIT WIL Project Leadership (QUT)",
    sketch: "erd",
    year: 2024,
    desc: "Organised and managed a WIL project for Masters IT students (Dundas Lawyers x QUT) involving an automated ERD program for forensic legal investigations using Python.",
    links: [],
    stack: [],
  },
  {
    title: "Forensic Investigation Automation",
    sketch: "pulse",
    year: 2024,
    desc: "Developed a Python program to track availability/activity statuses of businesses during forensic legal investigations to inform legitimacy insights.",
    links: [],
    stack: ["Python"],
  },
];

export const experience = [
  {
    role: "Information Security (Governance, Risk and Compliance) Associate",
    org: "Queensland University of Technology",
    when: "Mar 2026 - Jun 2026",
    points: [
      "Managed security risk assessments.",
      "Developed software requirements specification documentation for GRC consultation automation, including business process model notation.",
      "Updated organisation-wide standards for asset management and data backup from ISO 27001:2013 to ISO 27001:2022, with NIST influence.",
      "Developed data-driven and authority-driven risk buy down calculations and charts for a 3-year information security program.",
      "Reviewed and updated self-assessed capabilities for NIST controls.",
      "Led information security consultations with project teams.",
    ],
  },
  {
    org: "QUT Law, Innovation and Technology Society",
    when: "Jul 2025 - Jun 2026",
    roles: [
      {
        role: "Vice President",
        when: "Feb 2026 - Jun 2026",
        note: "Continued development of qutlitsociety.com and sponsorship outreach, worked on strategy and executive decisions, and hosted a workshop series: Intro to Tech Law, Intro to Legal Tech, and Technology in Legal Investigations.",
      },
      {
        role: "Secretary",
        when: "Oct 2025 - Feb 2026",
        note: "Developed the qutlitsociety.com website and conducted sponsor outreach.",
      },
      {
        role: "Industry Coordinator",
        when: "Jul 2025 - Oct 2025",
        note: "Worked collaboratively on the prospectus for sponsors.",
      },
    ],
  },
  {
    role: "General Executive",
    org: "QUT Cyber Security Club",
    when: "Oct 2025 - May 2026",
    note: "Managed the club's social media presence, creating and scheduling content to engage members and grow its online community.",
  },
  {
    role: "Legal Administrative Assistant",
    org: "Dundas Lawyers",
    when: "Mar 2024 - Mar 2026",
    note: "Streamlined legal workflows through automation, developed AI-assisted tools for judgment analysis and forensic investigations, implemented cybersecurity policies and procedures aligned with SMB1001 and the ACSC Essential Eight, conducted OSINT-based legal investigations, and co-led a Work Integrated Learning project delivering a forensic visualisation tool.",
  },
  {
    role: "Software Engineer Intern",
    org: "Tanda",
    when: "Dec 2025 - Jan 2026",
    note: "Contributed to internal application development, including migrating features from React to Ruby on Rails and developing a rostering timetable feature.",
  },
  {
    role: "Marketing Officer",
    org: "QUT AI & ML Society",
    when: "Aug 2025 - Oct 2025",
    note: "Managed the society's social media presence, creating and scheduling content to promote AI and machine learning events across the QUT community.",
  },
];

export const education = [
  {
    degree: "Bachelor of Information Technology (Information Systems)",
    org: "Queensland University of Technology",
    when: "Finishing Dec 2026",
  },
  {
    degree: "Bachelor of Laws (Honours)",
    org: "Queensland University of Technology",
    when: "Expected 2028",
  },
];

export const certs = [
  {
    name: "Microsoft Certified: Azure Fundamentals",
    code: "AZ-900",
    org: "Microsoft",
    when: "Apr 2026",
    href: "https://learn.microsoft.com/en-us/users/johnwynter-0915/credentials/3623d3d4d2b7f422",
  },
  {
    name: "Advent of Cyber",
    code: "THM-RJHIUHYWQZ",
    org: "TryHackMe",
    when: "Dec 2025",
  },
  {
    name: "Cybersecurity Foundations",
    org: "LinkedIn",
    when: "Sep 2024",
  },
];

export const toolkit = [
  {
    group: "Build",
    items: ["Python", "TypeScript", "React", "Next.js", "FastAPI", "Ruby on Rails", "Tailwind CSS", "SQLite", "Supabase", "Prisma", "VBA", "n8n"],
  },
  {
    group: "AI",
    items: ["Gemini", "RAG", "FAISS", "AI agents", "Computer vision", "ElevenLabs Agents"],
  },
  {
    group: "Law and compliance",
    items: ["AML/CTF", "eDiscovery", "ISO 27001", "NIST CSF", "SOC 2", "GDPR", "PCI DSS", "ACSC Essential Eight", "SMB1001", "OSINT"],
  },
  {
    group: "Other",
    items: ["Azure (AZ-900)", "GitHub OAuth", "Cytoscape.js", "Raspberry Pi", "ATAK", "3D printing"],
  },
];
