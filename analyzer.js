// js/analyzer.js
// Evaluates GitHub data using browser-side heuristics to generate scores, strengths, weaknesses, career recommendations, and roadmaps.

window.DevScopeAnalyzer = {
  analyzeProfile(userData) {
    const { profile, repositories, languages } = userData;
    const totalRepos = repositories.length;

    // 1. Calculate General Profile Stats
    const totalStars = repositories.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, r) => sum + r.forks_count, 0);
    
    // 2. Profile Score Calculation (0-100)
    let profileScore = 0;
    if (profile.avatar_url) profileScore += 10;
    if (profile.bio) profileScore += 10;
    if (profile.location) profileScore += 10;
    if (profile.company) profileScore += 10;
    if (profile.blog) profileScore += 10;
    
    // Followers points
    if (profile.followers > 100) profileScore += 15;
    else if (profile.followers > 20) profileScore += 10;
    else if (profile.followers > 0) profileScore += 5;

    // Public repos points
    if (totalRepos >= 20) profileScore += 15;
    else if (totalRepos >= 5) profileScore += 10;
    else if (totalRepos > 0) profileScore += 5;

    // Stars & forks engagement points
    if (totalStars >= 100) profileScore += 20;
    else if (totalStars >= 20) profileScore += 15;
    else if (totalStars > 0) profileScore += 8;
    else if (totalForks > 0) profileScore += 4;

    // Cap profile score at 100
    profileScore = Math.min(100, Math.max(15, profileScore));

    // 3. Repository Health Score (average of all repos)
    let totalRepoHealth = 0;
    const repoDetails = repositories.map(repo => {
      let health = 0;
      if (repo.description) health += 30;
      if (repo.has_readme) health += 30;
      if (repo.license) health += 20;
      if (repo.homepage) health += 20;

      return {
        ...repo,
        health_score: health
      };
    });

    const averageRepoHealth = totalRepos > 0 
      ? Math.round(repoDetails.reduce((sum, r) => sum + r.health_score, 0) / totalRepos)
      : 0;

    // 4. Find key repositories
    let mostStarred = null;
    let mostForked = null;
    let largestRepo = null;
    let mostRecentlyUpdated = null;

    if (totalRepos > 0) {
      mostStarred = [...repositories].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
      mostForked = [...repositories].sort((a, b) => b.forks_count - a.forks_count)[0];
      largestRepo = [...repositories].sort((a, b) => b.size - a.size)[0];
      mostRecentlyUpdated = [...repositories].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
    }

    // 5. Strengths Identification
    const strengths = this.calculateStrengths(profile, repositories, languages, totalStars, totalRepos);

    // 6. Weaknesses Identification
    const weaknesses = this.calculateWeaknesses(profile, repositories, languages, totalStars, totalRepos);

    // 7. Portfolio Review Score Dimensions
    const portfolioDimensions = this.calculatePortfolioDimensions(profile, repositories, totalStars, averageRepoHealth);
    const portfolioScore = Math.round(
      Object.values(portfolioDimensions).reduce((sum, v) => sum + v, 0) / 6
    );

    // 8. Career Insights Dashboard
    const careerInsights = this.calculateCareerInsights(repositories, languages);

    // 9. Roadmap Generation
    const roadmap = this.generateRoadmap(profile, repositories, averageRepoHealth);

    return {
      profileScore,
      averageRepoHealth,
      stats: {
        totalRepos,
        totalStars,
        totalForks,
        mostStarred,
        mostForked,
        largestRepo,
        mostRecentlyUpdated
      },
      repoDetails,
      strengths,
      weaknesses,
      portfolioScore,
      portfolioDimensions,
      careerInsights,
      roadmap
    };
  },

  calculateStrengths(profile, repos, languages, totalStars, totalRepos) {
    const list = [];
    const recentDate = new Date();
    recentDate.setMonth(recentDate.getMonth() - 3);

    const activeRepos = repos.filter(r => new Date(r.updated_at) > recentDate).length;
    const readmePercent = repos.length > 0 ? (repos.filter(r => r.has_readme).length / repos.length) * 100 : 0;
    const numLanguages = Object.keys(languages).length;

    // Strength 1: Open Source Contributor
    let openSourceConf = Math.min(100, Math.round((profile.followers / 20) + (totalStars / 5)));
    if (openSourceConf > 30) {
      list.push({
        title: "Strong Open-Source Footprint",
        desc: "You have a solid follower base and community engagement indicators (stars/forks).",
        confidence: Math.max(35, openSourceConf),
        icon: "globe"
      });
    }

    // Strength 2: Consistent project creator
    let consistencyConf = Math.min(100, Math.round((totalRepos / 30) * 100));
    if (totalRepos >= 5) {
      list.push({
        title: "Consistent Project Creator",
        desc: "You have created multiple repositories, showing high coding productivity.",
        confidence: Math.max(40, consistencyConf),
        icon: "code"
      });
    }

    // Strength 3: Diverse technology exposure
    let techConf = Math.min(100, Math.round((numLanguages / 6) * 100));
    if (numLanguages >= 3) {
      list.push({
        title: "Diverse Technology Exposure",
        desc: "You build software across multiple languages and tech stacks.",
        confidence: Math.max(45, techConf),
        icon: "layers"
      });
    }

    // Strength 4: Active maintenance habits
    let activeConf = totalRepos > 0 ? Math.round((activeRepos / totalRepos) * 100) : 0;
    if (activeRepos > 0) {
      list.push({
        title: "Active Coding Rhythm",
        desc: `You updated ${activeRepos} repos in the last 90 days, indicating ongoing coding activity.`,
        confidence: Math.max(30, activeConf),
        icon: "activity"
      });
    }

    // Strength 5: Good repository documentation
    if (readmePercent > 60 && totalRepos > 2) {
      list.push({
        title: "Strong Documentation Quality",
        desc: `${Math.round(readmePercent)}% of your projects include README documentation, which helps searchability.`,
        confidence: Math.round(readmePercent),
        icon: "book-open"
      });
    }

    // Fallback if list is empty
    if (list.length === 0) {
      list.push({
        title: "Emerging Code Base",
        desc: "You have initiated your GitHub journey. Keep pushing projects to build portfolio weight.",
        confidence: 50,
        icon: "plus-circle"
      });
    }

    return list.sort((a, b) => b.confidence - a.confidence);
  },

  calculateWeaknesses(profile, repos, languages, totalStars, totalRepos) {
    const list = [];
    if (totalRepos === 0) {
      return [{
        title: "Empty Repository Hub",
        warning: "No public repositories were detected.",
        recommendation: "Create new repositories and push your local projects to GitHub immediately.",
        severity: "critical"
      }];
    }

    const missingReadmeCount = repos.filter(r => !r.has_readme).length;
    const missingDescCount = repos.filter(r => !r.description).length;
    const missingLicenseCount = repos.filter(r => !r.license).length;

    // Check inactive repos (> 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const inactiveCount = repos.filter(r => new Date(r.updated_at) < sixMonthsAgo).length;

    // 1. Missing READMEs
    if (missingReadmeCount > 0) {
      const pct = Math.round((missingReadmeCount / totalRepos) * 100);
      list.push({
        title: "Missing README Documentation",
        warning: `${missingReadmeCount} repositories (${pct}%) lack documentation files.`,
        recommendation: "Add detailed README.md files explaining the project stack, installation, and usage instructions.",
        severity: pct > 40 ? "high" : "medium"
      });
    }

    // 2. Missing Descriptions
    if (missingDescCount > 0) {
      const pct = Math.round((missingDescCount / totalRepos) * 100);
      list.push({
        title: "Missing Repository Descriptions",
        warning: `${missingDescCount} projects have no descriptions in GitHub settings.`,
        recommendation: "Write short, keyword-friendly descriptions for your repositories to improve visibility.",
        severity: pct > 50 ? "high" : "low"
      });
    }

    // 3. Inactive codebase
    if (inactiveCount > totalRepos * 0.7) {
      list.push({
        title: "Low Recent Activity Profile",
        warning: "Over 70% of your repositories have not been modified in the last 6 months.",
        recommendation: "Establish a consistent commit schedule, refactor older codebases, or start a new active project.",
        severity: "medium"
      });
    }

    // 4. Missing Licensing
    if (missingLicenseCount > 0) {
      const pct = Math.round((missingLicenseCount / totalRepos) * 100);
      list.push({
        title: "Undocumented Licenses",
        warning: `${missingLicenseCount} projects lack open-source license files.`,
        recommendation: "Add standard LICENSE files (e.g., MIT, Apache 2.0) to declare distribution rights.",
        severity: "low"
      });
    }

    // 5. Low stars engagement
    if (totalStars < 2 && totalRepos > 5) {
      list.push({
        title: "Low Repository Engagement",
        warning: "Your repositories have minimal community stargazers.",
        recommendation: "Promote your projects on social channels, Dev.to, or HackerNews to attract feedback and stars.",
        severity: "low"
      });
    }

    return list;
  },

  calculatePortfolioDimensions(profile, repos, totalStars, averageRepoHealth) {
    const totalRepos = repos.length;
    if (totalRepos === 0) {
      return { completeness: 20, professionalism: 20, documentation: 20, uniqueness: 20, depth: 20, recruiter: 20 };
    }

    // 1. Portfolio Completeness (Profile details filled + Pinned/Repositories count)
    let completeness = 30;
    if (profile.bio) completeness += 15;
    if (profile.location) completeness += 15;
    if (profile.company || profile.blog) completeness += 20;
    if (totalRepos >= 5) completeness += 20;

    // 2. GitHub Professionalism (Having licenses, profile bio, blog, avatar, and active code)
    let professionalism = 40;
    const licenseCount = repos.filter(r => r.license).length;
    const licensePct = licenseCount / totalRepos;
    professionalism += Math.round(licensePct * 40);
    if (profile.company) professionalism += 10;
    if (profile.blog) professionalism += 10;

    // 3. Documentation Quality (READMEs + Description files)
    const readmePct = repos.filter(r => r.has_readme).length / totalRepos;
    const descPct = repos.filter(r => r.description).length / totalRepos;
    const documentation = Math.round((readmePct * 50) + (descPct * 30) + (averageRepoHealth * 0.2));

    // 4. Project Uniqueness (Differentiated titles, homepage link presence, forks/stars presence)
    const hasHomepage = repos.filter(r => r.homepage).length;
    const homepagePct = hasHomepage / totalRepos;
    let uniqueness = 50;
    uniqueness += Math.round(homepagePct * 30);
    if (totalStars > 10) uniqueness += 20;

    // 5. Technical Depth (Repository sizes, complex language languages)
    const avgSize = repos.reduce((sum, r) => sum + r.size, 0) / totalRepos;
    let depth = 40;
    // Boost depth if average repo size is substantial (e.g. > 1MB)
    if (avgSize > 2000) depth += 25;
    else if (avgSize > 500) depth += 15;
    // Boost for complex systems languages
    const hasComplexLanguages = repos.some(r => ["Rust", "Go", "C++", "TypeScript", "Java"].includes(r.language));
    if (hasComplexLanguages) depth += 25;
    // Boost based on average health
    depth += Math.round(averageRepoHealth * 0.1);
    depth = Math.min(100, depth);

    // 6. Recruiter Attractiveness (Updated recently, stars, followers, bio, contact blog link)
    let recruiter = 30;
    if (totalStars > 50) recruiter += 30;
    else if (totalStars > 10) recruiter += 20;
    if (profile.followers > 20) recruiter += 20;
    if (profile.blog) recruiter += 10;
    // check if updated in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const updatedRecently = repos.some(r => new Date(r.updated_at) > thirtyDaysAgo);
    if (updatedRecently) recruiter += 10;

    return {
      completeness: Math.min(100, Math.max(25, completeness)),
      professionalism: Math.min(100, Math.max(25, professionalism)),
      documentation: Math.min(100, Math.max(25, documentation)),
      uniqueness: Math.min(100, Math.max(25, uniqueness)),
      depth: Math.min(100, Math.max(25, depth)),
      recruiter: Math.min(100, Math.max(25, recruiter))
    };
  },

  calculateCareerInsights(repos, languages) {
    const totalRepos = repos.length;
    if (totalRepos === 0) {
      return [
        { role: "Frontend Developer", compatibility: 20, color: "var(--accent-cyan)" },
        { role: "Backend Developer", compatibility: 20, color: "var(--accent-purple)" },
        { role: "Full Stack Developer", compatibility: 20, color: "var(--accent-blue)" }
      ];
    }

    // Initialize scores
    let frontend = 0;
    let backend = 0;
    let fullstack = 0;
    let datascience = 0;
    let ai = 0;
    let devops = 0;

    // Check language breakdown (values are sizes)
    const totalLanguageBytes = Object.values(languages).reduce((sum, v) => sum + v, 0);
    const getLangPct = (lang) => totalLanguageBytes > 0 ? (languages[lang] || 0) / totalLanguageBytes : 0;

    // 1. Language signals
    const fePct = getLangPct("TypeScript") + getLangPct("JavaScript") + getLangPct("CSS") + getLangPct("HTML") + getLangPct("Vue");
    const bePct = getLangPct("Go") + getLangPct("Rust") + getLangPct("Python") + getLangPct("Java") + getLangPct("Ruby") + getLangPct("C#") + getLangPct("C++");
    
    frontend += fePct * 70;
    backend += bePct * 70;

    // DevOps indicators (Shell, YAML, Dockerfile, Go)
    const devopsPct = getLangPct("Shell") + getLangPct("Dockerfile") + getLangPct("Go") * 0.3;
    devops += devopsPct * 60;

    // Data Science / AI indicators (Python, Jupyter Notebook)
    const dsPct = getLangPct("Python") * 0.7 + getLangPct("Jupyter Notebook");
    datascience += dsPct * 70;

    // 2. Search descriptions for keyword signals
    repos.forEach(repo => {
      const desc = (repo.description || "").toLowerCase();
      const name = (repo.name || "").toLowerCase();

      // DevOps keywords
      if (desc.includes("docker") || desc.includes("cicd") || desc.includes("k8s") || desc.includes("kubernetes") || desc.includes("workflow") || desc.includes("aws") || desc.includes("deploy") || desc.includes("sync")) {
        devops += 15;
      }
      // AI keywords
      if (desc.includes("ai") || desc.includes("llm") || desc.includes("prompt") || desc.includes("model") || desc.includes("neural") || desc.includes("nlp") || desc.includes("openai") || desc.includes("gpt")) {
        ai += 25;
      }
      // Frontend keywords
      if (desc.includes("ui") || desc.includes("ux") || desc.includes("react") || desc.includes("component") || desc.includes("css") || desc.includes("portfolio") || desc.includes("theme") || desc.includes("grid")) {
        frontend += 10;
      }
      // Backend keywords
      if (desc.includes("api") || desc.includes("database") || desc.includes("postgres") || desc.includes("redis") || desc.includes("server") || desc.includes("rest") || desc.includes("grpc") || desc.includes("microservice")) {
        backend += 10;
      }
      // Data science keywords
      if (desc.includes("data") || desc.includes("dataset") || desc.includes("panda") || desc.includes("analysis") || desc.includes("scikit") || desc.includes("visualize")) {
        datascience += 15;
      }
    });

    // 3. Full Stack calculation (based on balance of FE and BE)
    if (frontend > 20 && backend > 20) {
      fullstack = Math.round((frontend + backend) / 1.6);
    } else {
      fullstack = Math.round(Math.max(frontend, backend) * 0.6);
    }

    // Boost AI if Python & DS is high
    if (ai > 10 && datascience > 25) {
      ai += 20;
    }
    // Cap all at 98% unless they are absolutely customized
    const cleanScore = (val) => Math.min(98, Math.max(10, Math.round(val)));

    const roles = [
      { role: "Frontend Developer", compatibility: cleanScore(frontend + 15), color: "#38bdf8", desc: "Builds client-side user interfaces, manages layouts, and implements client interactions." },
      { role: "Backend Developer", compatibility: cleanScore(backend + 15), color: "#a855f7", desc: "Constructs server architectures, REST/GraphQL APIs, manages database nodes, and handles service logic." },
      { role: "Full Stack Developer", compatibility: cleanScore(fullstack + 20), color: "#3b82f6", desc: "Fuses client interfaces with server-side engines. Proficient in both frontend layouts and backend APIs." },
      { role: "DevOps Engineer", compatibility: cleanScore(devops + 15), color: "#10b981", desc: "Orchestrates continuous integration pipelines, configures server scaling, deployment scripts, and cloud networks." },
      { role: "AI Engineer", compatibility: cleanScore(ai + 10), color: "#ec4899", desc: "Integrates foundational large language models, constructs optimization prompts, and parses neural frameworks." },
      { role: "Data Scientist", compatibility: cleanScore(datascience + 10), color: "#f59e0b", desc: "Performs mathematical analysis, visualizes data patterns, structures pipelines, and trains statistical designs." }
    ];

    return roles.sort((a, b) => b.compatibility - a.compatibility);
  },

  generateRoadmap(profile, repos, averageRepoHealth) {
    const totalRepos = repos.length;
    const immediate = [];
    const shortTerm = [];
    const longTerm = [];

    const missingReadme = repos.filter(r => !r.has_readme);
    const missingDesc = repos.filter(r => !r.description);
    const missingLicense = repos.filter(r => !r.license);

    // --- IMMEDIATE IMPROVEMENTS (0-30 Days) ---
    if (missingReadme.length > 0) {
      immediate.push({
        title: `Add README to ${Math.min(3, missingReadme.length)} top repositories`,
        desc: `Ensure repositories like "${missingReadme[0].name}" have markdown guides. A good README is the first thing recruiters check.`
      });
    } else {
      immediate.push({
        title: "Audit and upgrade pinned repositories",
        desc: "Refactor your featured repositories to include visual screenshots or GIFs demonstrating the actual application UI."
      });
    }

    if (missingDesc.length > 0) {
      immediate.push({
        title: "Fill repository descriptions",
        desc: `Provide taglines for projects like "${missingDesc[0].name}" inside GitHub settings. These descriptions double as metadata in searches.`
      });
    }

    if (missingLicense.length > 0) {
      immediate.push({
        title: "Add open-source licenses",
        desc: `Introduce LICENSE files (MIT is recommended) to your projects to define clear permissions.`
      });
    }

    if (!profile.bio) {
      immediate.push({
        title: "Enhance Profile Bio",
        desc: "Write a high-impact profile bio summarizing your engineering focus, key languages, and contact information."
      });
    }

    // --- SHORT-TERM IMPROVEMENTS (1-3 Months) ---
    if (totalRepos < 6) {
      shortTerm.push({
        title: "Increase project portfolio count",
        desc: "Aim to build and upload 2-3 more robust applications showing diverse stack implementations."
      });
    }

    shortTerm.push({
      title: "Deploy live demo homepages",
      desc: "For your frontend or web repositories, activate GitHub Pages, Vercel, or Netlify, and add the live URL to the repository homepage field."
    });

    shortTerm.push({
      title: "Clean up configuration and lock files",
      desc: "Ensure lockfiles are committed properly and build directories/environment files are ignored using standard .gitignore rules."
    });

    // --- LONG-TERM IMPROVEMENTS (3-6 Months) ---
    longTerm.push({
      title: "Contribute to prominent Open Source projects",
      desc: "Fork popular projects in your primary languages, solve open issues, and submit Pull Requests to build true collaborative experience."
    });

    longTerm.push({
      title: "Author technical documentation or blogs",
      desc: "Link a tech blog (Dev.to, Medium, or hashnode) to your GitHub blog link. Explaining engineering topics boosts profile authority."
    });

    longTerm.push({
      title: "Specialize and expand your stack footprint",
      desc: "Learn a complementary tooling layer (e.g., if writing Frontend, learn Docker containerization, or if writing Backend, add automated integration testing)."
    });

    return {
      immediate,
      shortTerm,
      longTerm
    };
  }
};
