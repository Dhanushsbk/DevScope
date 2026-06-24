// js/mockData.js
// Contains a rich set of mock data to simulate analysis of a professional developer.

window.DevScopeMockData = {
  profile: {
    login: "alexdev-99",
    name: "Alex Rivera",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    bio: "Senior Full Stack Engineer & Open Source Enthusiast. Building developer tooling, modern web architectures, and AI integrations. TypeScript / Go / Python.",
    company: "SaaSify Tech Corp",
    location: "San Francisco, CA",
    blog: "https://alexrivera.dev",
    email: "alex@rivera.dev",
    public_repos: 42,
    followers: 1240,
    following: 342,
    created_at: "2019-04-12T14:32:00Z"
  },
  repositories: [
    {
      name: "hyper-server",
      description: "A fast, lightweight, and extensible async web server written in Go with high-concurrency capability.",
      stargazers_count: 542,
      forks_count: 88,
      size: 4250,
      language: "Go",
      updated_at: "2026-06-18T10:15:30Z",
      created_at: "2023-02-10T08:00:00Z",
      has_readme: true,
      license: "MIT",
      homepage: "https://hyper-server.dev"
    },
    {
      name: "react-dynamic-grid",
      description: "Drag-and-drop grid system with fluid layout adjustments, virtualization support, and high performance rendering.",
      stargazers_count: 320,
      forks_count: 45,
      size: 890,
      language: "TypeScript",
      updated_at: "2026-06-22T21:40:00Z",
      created_at: "2022-11-05T12:00:00Z",
      has_readme: true,
      license: "MIT",
      homepage: ""
    },
    {
      name: "ai-prompt-compiler",
      description: "Compile, optimize, and evaluate prompts for large language models. Built-in versioning and testing framework.",
      stargazers_count: 245,
      forks_count: 32,
      size: 1540,
      language: "Python",
      updated_at: "2026-06-24T08:30:00Z",
      created_at: "2025-01-15T09:12:00Z",
      has_readme: true,
      license: "Apache-2.0",
      homepage: "https://prompt-compiler.dev"
    },
    {
      name: "postgres-sync-worker",
      description: "Service to sync Postgres WAL changes to Elasticsearch in near real-time.",
      stargazers_count: 98,
      forks_count: 14,
      size: 2100,
      language: "Go",
      updated_at: "2026-05-10T11:45:00Z",
      created_at: "2024-06-30T17:15:00Z",
      has_readme: true,
      license: "MIT",
      homepage: ""
    },
    {
      name: "devscope-core",
      description: "Analysis script to scan repository files and construct metrics (temporary placeholder repository for testing).",
      stargazers_count: 12,
      forks_count: 3,
      size: 120,
      language: "JavaScript",
      updated_at: "2026-06-23T18:00:00Z",
      created_at: "2026-06-20T08:00:00Z",
      has_readme: false, // missing README
      license: "", // missing license
      homepage: ""
    },
    {
      name: "vite-plugin-image-minify",
      description: "Optimizes image assets using modern compression formats (WebP, Avif) automatically in Vite builds.",
      stargazers_count: 180,
      forks_count: 24,
      size: 450,
      language: "TypeScript",
      updated_at: "2026-06-05T09:00:00Z",
      created_at: "2023-08-14T14:22:00Z",
      has_readme: true,
      license: "MIT",
      homepage: "https://npmjs.com/package/vite-plugin-image-minify"
    },
    {
      name: "utility-scripts",
      description: "", // missing description
      stargazers_count: 4,
      forks_count: 1,
      size: 50,
      language: "Shell",
      updated_at: "2025-12-01T04:00:00Z",
      created_at: "2021-02-18T10:00:00Z",
      has_readme: false, // missing README
      license: "", // missing license
      homepage: ""
    },
    {
      name: "portfolio-website",
      description: "My personal developer portfolio. Modern design featuring dark mode, project showcases, and blog integrations.",
      stargazers_count: 15,
      forks_count: 2,
      size: 12400,
      language: "CSS",
      updated_at: "2026-04-15T15:30:00Z",
      created_at: "2022-03-01T12:00:00Z",
      has_readme: true,
      license: "MIT",
      homepage: "https://alexrivera.dev"
    },
    {
      name: "dotfiles",
      description: "Personal configuration files for Zsh, Vim, tmux, and git.",
      stargazers_count: 28,
      forks_count: 4,
      size: 320,
      language: "Shell",
      updated_at: "2026-06-19T06:00:00Z",
      created_at: "2019-05-01T10:00:00Z",
      has_readme: true,
      license: "",
      homepage: ""
    },
    {
      name: "fast-search-cli",
      description: "Command-line tool to quickly search text in large directory structures using Rust's concurrency library.",
      stargazers_count: 145,
      forks_count: 18,
      size: 1840,
      language: "Rust",
      updated_at: "2026-06-20T14:00:00Z",
      created_at: "2024-09-12T16:00:00Z",
      has_readme: true,
      license: "MIT",
      homepage: ""
    }
  ],
  languages: {
    "TypeScript": 384000,
    "Go": 298000,
    "Python": 182000,
    "Rust": 96000,
    "CSS": 42000,
    "Shell": 24000,
    "JavaScript": 18000
  }
};
