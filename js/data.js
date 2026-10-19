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
    title: "Mandate",
    sketch: "vault",
    year: 2026,
    desc: "Solo entry to the International Track of the 2026 Shenzhen International FinTech Competition (FinTechathon), hosted by Tsinghua PBC School of Finance with WeBank, on the track's signature topic: the autonomous on-chain wallet. The idea: an AI agent should hold a mandate, not a key. The owner sets spending caps, a daily limit, an allowlist and a kill switch in a vault contract on Base Sepolia. Inside those limits the agent acts on its own, above them it needs the owner's signature, and outside them the chain reverts it, even if the agent, its prompt and its private key are fully compromised. A built-in security lab replays 14 real 2025 to 2026 attacks on AI wallets: the full product stops all 14, with real transaction hashes to show for it.",
    links: [
      { label: "repo", href: "https://github.com/JohnJohnW/mandate" },
      { label: "verified contract", href: "https://base-sepolia.blockscout.com/address/0xf0355Cf4f96142CAaA4cbE354762F3E10abBAd2A" },
    ],
    stack: ["Solidity", "Foundry", "TypeScript", "Base Sepolia", "EIP-712", "ERC-8004", "x402", "AI agents", "Agent security"],
  },
  {
    title: "UN Global AI Hackathon",
    sketch: "statute",
    year: 2026,
    desc: "Shortlisted to Round 1 of the UN Global Hackathon on Using AI for Digital Trade Regulatory Analysis, run by UN ESCAP and KMITL and judged by a panel from the UN, the WTO and the World Bank: one of 44 teams picked from 129 (417 people across 38 countries) on our concept video and technical memo. The brief: an open-source AI tool that takes over 80% of the research behind the UN's Regional Digital Trade Integration Index, tracking down a country's laws on hard-to-scrape government portals and scanned PDFs and mapping its rules on cross-border data flows and data protection to the index with article-level citations, leaving the last 20% to a human reviewer.",
    links: [{ label: "UN ESCAP page", href: "https://www.unescap.org/events/2026/global-hackathon-using-ai-digital-trade-regulatory-analysis" }],
    stack: ["AI", "Legal NLP", "RegTech", "Data protection", "Digital trade", "UN ESCAP"],
  },
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

// The toolkit again, in Chinese, for the wind chimes at the foot of the page,
// one entry per toolkit item and in the same order. Each is written the way a
// Chinese reader would know it: by its Chinese name where it has one, and
// otherwise by what it is, since most of these products only go by their
// English names.
export const chimes = [
  // Build
  "通用编程语言", // Python
  "静态类型脚本语言", // TypeScript
  "组件化界面库", // React
  "全栈网页框架", // Next.js
  "高性能接口框架", // FastAPI
  "敏捷网页开发框架", // Ruby on Rails
  "原子化样式框架", // Tailwind CSS
  "嵌入式数据库", // SQLite
  "开源后端即服务", // Supabase
  "对象关系映射", // Prisma
  "办公自动化宏", // VBA
  "工作流自动化", // n8n
  // AI
  "谷歌大模型", // Gemini
  "检索增强生成", // RAG
  "向量相似度检索", // FAISS
  "智能体", // AI agents
  "计算机视觉", // Computer vision
  "语音智能体", // ElevenLabs Agents
  // Law and compliance
  "反洗钱与反恐怖融资", // AML/CTF
  "电子证据开示", // eDiscovery
  "信息安全管理体系", // ISO 27001
  "美国网络安全框架", // NIST CSF
  "服务组织控制报告", // SOC 2
  "通用数据保护条例", // GDPR
  "支付卡行业数据安全标准", // PCI DSS
  "八项基本缓解策略", // ACSC Essential Eight
  "中小企业网络安全认证", // SMB1001
  "开源情报", // OSINT
  // Other
  "微软云基础认证", // Azure (AZ-900)
  "开放授权登录", // GitHub OAuth
  "网络图可视化", // Cytoscape.js
  "树莓派", // Raspberry Pi
  "战术态势感知", // ATAK
  "三维打印", // 3D printing
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
