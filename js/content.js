/**
 * Portfolio content — edit this file to update your site.
 * Drop media into the assets/ folders and reference paths here.
 */
const PORTFOLIO = {
  profile: {
    name: "Shadman Shakib",
    tagline: "Building ideas worth funding.",
    bio:
      "I'm a multidisciplinary creator working at the intersection of technology, research, and the arts. This portfolio is designed for grant reviewers and collaborators who want to see the full arc of my work — including experiments, prototypes, and projects still in motion.",
    seeking:
      "Grant funding for research-driven creative technology, mentorship, and opportunities to present work-in-progress to thoughtful audiences.",
    highlights: [
      "Comfortable sharing unfinished work and early prototypes",
      "Experience across web development, scripting, and digital media",
      "Interested in projects with social impact and creative expression",
    ],
    focus: [
      "Creative Technology",
      "Research & Prototyping",
      "Web Development",
      "Digital Media",
      "Music & Sound",
      "Cloud & Infrastructure",
    ],
    contact: [
      { label: "Email", value: "your.email@example.com", href: "mailto:your.email@example.com", icon: "✉" },
      { label: "GitHub", value: "github.com/yourhandle", href: "https://github.com/yourhandle", icon: "⌘" },
      { label: "LinkedIn", value: "linkedin.com/in/yourprofile", href: "https://linkedin.com/in/yourprofile", icon: "in" },
    ],
  },

  projects: [
    {
      id: "technovate",
      title: "Technovate",
      status: "in-progress",
      progress: 65,
      year: "2025–2026",
      description:
        "A platform exploring how emerging technology can support community innovation. Currently building core features and documenting early user research.",
      tags: ["Web App", "Research", "Community"],
      image: "assets/thumbnails/technovate.svg",
      link: "#",
      featured: true,
    },
    {
      id: "cloud-research",
      title: "Cloud Infrastructure Study",
      status: "in-progress",
      progress: 40,
      year: "2025",
      description:
        "Documenting cloud architecture patterns and cost optimization experiments. Includes scripts, diagrams, and a working prototype deployment.",
      tags: ["AWS", "DevOps", "Documentation"],
      image: "assets/thumbnails/cloud.svg",
      link: "#",
    },
    {
      id: "ghost-edo",
      title: "Ghost Edo Duel",
      status: "prototype",
      progress: 30,
      year: "2025",
      description:
        "An interactive game concept blending narrative design with rapid prototyping. Early builds focus on core mechanics and visual direction.",
      tags: ["Game Dev", "Creative Coding", "Prototype"],
      image: "assets/thumbnails/ghost-edo.svg",
      link: "#",
    },
    {
      id: "grant-portfolio",
      title: "Grant Portfolio Site",
      status: "in-progress",
      progress: 85,
      year: "2026",
      description:
        "This very site — a beautiful, reviewer-friendly home for all my work. Designed to make in-progress projects easy to discover and understand.",
      tags: ["Portfolio", "Web Design", "Static Site"],
      image: "assets/thumbnails/portfolio.svg",
      link: "#",
      featured: false,
    },
    {
      id: "school-research",
      title: "Academic Research Project",
      status: "complete",
      progress: 100,
      year: "2024",
      description:
        "A completed school research initiative with written findings, presentation materials, and supporting code artifacts.",
      tags: ["Research", "Academic", "Writing"],
      image: "assets/thumbnails/research.svg",
      link: "#",
    },
  ],

  showcase: [
    // PDFs
    {
      type: "pdf",
      title: "Research Proposal Draft",
      description: "Early-stage grant proposal outlining project goals, timeline, and budget.",
      file: "assets/pdfs/research-proposal.pdf",
      thumbnail: "assets/thumbnails/pdf-research.jpg",
      year: "2026",
      tags: ["Grant", "Writing"],
    },
    {
      type: "pdf",
      title: "Project Documentation",
      description: "Technical documentation and architecture notes for a cloud deployment.",
      file: "assets/pdfs/project-docs.pdf",
      thumbnail: "assets/thumbnails/pdf-docs.jpg",
      year: "2025",
      tags: ["Documentation"],
    },

    // Photos
    {
      type: "photo",
      title: "Studio Session",
      description: "Behind-the-scenes from a creative work session.",
      file: "assets/images/studio.jpg",
      thumbnail: "assets/images/studio.jpg",
      year: "2025",
      tags: ["Photography"],
    },
    {
      type: "photo",
      title: "Installation Preview",
      description: "Early look at a physical-digital installation concept.",
      file: "assets/images/installation.jpg",
      thumbnail: "assets/images/installation.jpg",
      year: "2025",
      tags: ["Installation", "Art"],
    },

    // Scripts
    {
      type: "script",
      title: "AWS Deployment Helper",
      description: "Shell script automating repeatable cloud deployment steps.",
      file: "assets/scripts/deploy.sh",
      language: "Bash",
      year: "2025",
      tags: ["AWS", "Automation"],
      preview: `#!/bin/bash\n# Deploy helper — customize for your stack\necho "Deploying..."\n# aws s3 sync ./dist s3://your-bucket`,
    },
    {
      type: "script",
      title: "Data Processing Pipeline",
      description: "Python script for cleaning and transforming research datasets.",
      file: "assets/scripts/process.py",
      language: "Python",
      year: "2024",
      tags: ["Data", "Research"],
      preview: `# Data processing pipeline\nimport pandas as pd\n\ndef clean_data(path):\n    df = pd.read_csv(path)\n    return df.dropna()`,
    },

    // Websites
    {
      type: "website",
      title: "My App",
      description: "A web application built with modern frontend tooling.",
      url: "https://example.com",
      thumbnail: "assets/thumbnails/my-app.jpg",
      year: "2024",
      tags: ["React", "Web App"],
    },
    {
      type: "website",
      title: "Cloud Project Demo",
      description: "Live demo site for a cloud infrastructure learning project.",
      url: "https://example.com",
      thumbnail: "assets/thumbnails/cloud-demo.jpg",
      year: "2024",
      tags: ["Cloud", "Demo"],
    },

    // Songs
    {
      type: "song",
      title: "Midnight Draft",
      description: "An instrumental sketch — work in progress.",
      file: "assets/audio/midnight-draft.mp3",
      cover: "assets/thumbnails/song-1.jpg",
      year: "2025",
      duration: "2:14",
      tags: ["Instrumental", "WIP"],
    },
    {
      type: "song",
      title: "Signal Loop",
      description: "Experimental electronic piece exploring texture and rhythm.",
      file: "assets/audio/signal-loop.mp3",
      cover: "assets/thumbnails/song-2.jpg",
      year: "2024",
      duration: "3:42",
      tags: ["Electronic"],
    },
  ],
};
