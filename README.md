# DevScope – AI GitHub Profile Analyzer & Portfolio Reviewer

DevScope is a professional, client-side web application designed to look like a premium developer SaaS tool. It scans public GitHub profiles and repository codebases to provide actionable insights, coding statistics, profile scorecards, and custom learning roadmaps.

🚀 **Try it locally in seconds with zero configuration or API key requirements!**

---

## 🌟 Key Features

1. **Stunning Hero Landing Page:** Sleek glassmorphism visual layout with stats, typing banners, and recruiter-focused credentials.
2. **Profile Score System:** Auto-grades public profiles out of 100 based on bio completeness, follower ratios, location metadata, and code engagement.
3. **Repository Quality Analytics:** Computes a custom metadata health score for individual code repositories. Includes instant filters by language, keyword search, and sorting controls.
4. **Coding Dashboard:** Renders interactive language distribution, repository accumulation, and top-stars charts using **Chart.js**, alongside a simulated green coding contribution graph calendar.
5. **Strengths & Weaknesses:** Generates scorecards highlighting technical achievements alongside warning logs containing professional optimization steps.
6. **Portfolio Radar Score:** Evaluates profiles across 6 key metrics: Completeness, Professionalism, Documentation, Uniqueness, Depth, and Recruiter Attractiveness.
7. **Career Alignments:** Computes matching compatibility percentages for major tech roles (Frontend, Backend, Full Stack, DevOps, AI, and Data Science).
8. **Actionable Roadmap:** Formulates time-phased milestones (Immediate, Short, Long-Term) to guide portfolio polish.
9. **Export & Sharing Center:** Integrates print-ready styling for high-contrast PDF downloads, JSON data extractions, and clipboard sharing snippets.
10. **Aesthetic Light/Dark Mode:** Features smooth custom animations and theme switches.

---

## 🛠️ Technology Stack

* **Structure:** Semantic HTML5 & Accessible ARIA roles
* **Styling:** CSS3 variables, glassmorphic layout properties, and CSS custom keyframe animations
* **Icons:** Remix Icon library (via CDN)
* **Visualization:** Chart.js library (via CDN)
* **API Fetching:** Native GitHub REST API integration with LocalStorage caching
* **Local Run Engine:** Node HTTP serving scripts

---

## 💻 Local Setup & Installation

### Prerequisites
You will need [Node.js](https://nodejs.org/) installed to run the local server script.

### Launch Instructions
1. Clone this repository or download the source folder.
2. Open your terminal inside the project directory.
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Open your web browser and go to:
   ```
   http://localhost:3000
   ```

*(Alternatively, because DevScope is built purely client-side, you can also run it by double-clicking the `index.html` file in your explorer).*

---

## 📦 File Architecture

```
├── index.html            # Main markup shell (Hero banner, dashboard, and print templates)
├── style.css             # Unified styling engine (CSS vars, grid layouts, skeletons, print styles)
├── package.json          # Package configuration containing dev scripts
├── .gitignore            # Git exclusion rules
└── js/
    ├── app.js            # Main orchestrator (tab switches, filters, inputs, and printable exports)
    ├── api.js            # REST API connector & LocalStorage cache layer (15 min expiration)
    ├── analyzer.js       # Scoring algorithms, strength checklists, career matches, and roadmaps
    ├── charts.js         # Chart.js initialization logic and contribution calendar renderer
    └── mockData.js       # Payload template for instantaneous "Try Demo Profile" simulations
```

---

## 🌐 Deploying to GitHub Pages

Since DevScope has no backend database, you can deploy it directly onto GitHub Pages for free:

1. Create a public repository on GitHub.
2. Push all the codebase files (including the `js/` folder) to your repository.
3. Navigate to **Settings** > **Pages** inside your GitHub repository settings.
4. Under **Build and deployment**, select **Deploy from a branch** and set the source branch to `main` (or `master`) and directory to `/ (root)`.
5. Click **Save**. Your site will be live at `https://<your-username>.github.io/<repo-name>/` in a few minutes!



GitHub Pages rebuild test
