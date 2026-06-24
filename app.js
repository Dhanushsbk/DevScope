// js/app.js
// Orchestrates landing page events, tab transitions, dynamic UI updates, filtering/sorting, and data export.

document.addEventListener("DOMContentLoaded", () => {
  // --- UI Elements ---
  const themeToggleBtn = document.getElementById("theme-toggle");
  const landingPage = document.getElementById("landing-page");
  const dashboardLayout = document.getElementById("dashboard-layout");
  const loadingScreen = document.getElementById("loading-screen");
  const loadingSubtext = document.getElementById("loading-subtext");
  
  const searchForm = document.getElementById("search-form");
  const usernameInput = document.getElementById("username-input");
  const demoBtn = document.getElementById("demo-btn");
  const resetBtn = document.getElementById("reset-btn");
  
  const repoSearchInput = document.getElementById("repo-search");
  const repoFilterLang = document.getElementById("repo-filter-lang");
  const repoSortSelect = document.getElementById("repo-sort");
  
  const sidebarNavItems = document.querySelectorAll(".sidebar-nav-item");
  const dashboardSections = document.querySelectorAll(".dashboard-section");

  // Export Buttons
  const exportPdfBtn = document.getElementById("export-pdf-btn");
  const downloadJsonBtn = document.getElementById("download-json-btn");
  const shareBtn = document.getElementById("share-btn");

  // State
  let currentAnalysisData = null;
  let currentTheme = localStorage.getItem("devscope_theme") || "dark";

  // --- Initial Setup ---
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeToggleIcon();
  startTypewriterEffect();

  // --- Theme Toggle ---
  themeToggleBtn.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("devscope_theme", currentTheme);
    updateThemeToggleIcon();
    
    // Re-render charts if data is loaded to apply correct text/grid colors
    if (currentAnalysisData) {
      renderDashboardCharts(currentAnalysisData.data, currentTheme === "dark");
    }
  });

  function updateThemeToggleIcon() {
    const icon = themeToggleBtn.querySelector("i");
    if (currentTheme === "dark") {
      icon.className = "ri-sun-line";
      themeToggleBtn.setAttribute("aria-label", "Switch to Light Mode");
    } else {
      icon.className = "ri-moon-line";
      themeToggleBtn.setAttribute("aria-label", "Switch to Dark Mode");
    }
  }

  // --- Typewriter Effect ---
  function startTypewriterEffect() {
    const textElement = document.getElementById("typewriter-text");
    if (!textElement) return;

    const phrases = [
      "Like a Tech Recruiter.",
      "For Strength & Weakness.",
      "To Build Your Roadmap.",
      "To Find Your Career Path."
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let delay = 100;

    function tick() {
      const currentPhrase = phrases[phraseIdx];
      
      if (isDeleting) {
        textElement.textContent = currentPhrase.substring(0, charIdx - 1);
        charIdx--;
        delay = 40;
      } else {
        textElement.textContent = currentPhrase.substring(0, charIdx + 1);
        charIdx++;
        delay = 100;
      }

      if (!isDeleting && charIdx === currentPhrase.length) {
        isDeleting = true;
        delay = 1500; // Pause at end of phrase
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        delay = 500; // Pause before typing next phrase
      }

      setTimeout(tick, delay);
    }

    tick();
  }

  // --- Search & Analyze Handlers ---
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (username) {
      performAnalysis(username);
    }
  });

  demoBtn.addEventListener("click", () => {
    performAnalysis("demo");
  });

  resetBtn.addEventListener("click", () => {
    // Transition back to Landing Page
    dashboardLayout.style.display = "none";
    landingPage.style.display = "flex";
    currentAnalysisData = null;
    usernameInput.value = "";
    
    // Switch back to tab 1
    switchTab("overview");
  });

  // --- Perform Analysis Pipeline ---
  async function performAnalysis(username) {
    showLoading(true);
    
    try {
      updateLoadingStatus("Connecting to GitHub REST API...", 15);
      await sleep(500); // UI breathing room
      
      updateLoadingStatus("Fetching user profile & attributes...", 40);
      const res = await window.DevScopeAPI.fetchUserData(username);
      
      updateLoadingStatus("Processing repository metadata & contents...", 65);
      await sleep(400);

      updateLoadingStatus("Running AI heuristic portfolio scoring...", 85);
      const analysis = window.DevScopeAnalyzer.analyzeProfile(res.data);
      
      currentAnalysisData = {
        raw: res.data,
        analysis: analysis,
        isDemo: res.isDemo
      };
      
      updateLoadingStatus("Rendering dynamic visual interface...", 95);
      await sleep(300);

      // Populate elements
      populateDashboard(currentAnalysisData);
      
      // Hide loading & Transition screen
      showLoading(false);
      landingPage.style.display = "none";
      dashboardLayout.style.display = "grid";

      // Trigger charts rendering
      renderDashboardCharts(res.data, currentTheme === "dark");

      // Set rate limit display
      updateRateLimitUI();

    } catch (err) {
      showLoading(false);
      handleAnalysisError(err);
    }
  }

  function showLoading(isActive) {
    if (isActive) {
      loadingScreen.classList.add("active");
    } else {
      loadingScreen.classList.remove("active");
    }
  }

  function updateLoadingStatus(text, progress) {
    loadingSubtext.textContent = text;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function handleAnalysisError(err) {
    let msg = "An unexpected error occurred during analysis. Please check your network connection and try again.";
    
    if (err.message === "USER_NOT_FOUND") {
      msg = "The specified GitHub username was not found. Please verify the spelling and try again.";
    } else if (err.message === "RATE_LIMIT_EXCEEDED") {
      msg = "GitHub API rate limit exceeded for your IP address (60 requests/hour for unauthenticated accounts). You can still try the demo profile, configure a Personal Access Token in your settings, or try again later.";
    }
    
    alert(msg);
  }

  function updateRateLimitUI() {
    const limits = window.DevScopeAPI.rateLimit;
    const badge = document.getElementById("rate-limit-info");
    if (badge) {
      let resetText = "";
      if (limits.resetTime) {
        resetText = ` (resets ${limits.resetTime.toLocaleTimeString()})`;
      }
      badge.textContent = `GitHub API Quota Remaining: ${limits.remaining}/${limits.limit}${resetText}`;
    }
  }

  // --- Populate Dashboard Data ---
  function populateDashboard(wrapper) {
    const { raw, analysis, isDemo } = wrapper;
    const profile = raw.profile;
    
    // 1. Sidebar Short Profile
    document.getElementById("sidebar-avatar").src = profile.avatar_url;
    document.getElementById("sidebar-name").textContent = profile.name || profile.login;
    document.getElementById("sidebar-handle").textContent = `@${profile.login}`;
    
    // 2. Dash Header Bar Info
    document.getElementById("dash-header-avatar").src = profile.avatar_url;
    document.getElementById("dash-header-name").textContent = profile.name || profile.login;
    
    // Status Badge Demo
    const statusText = document.getElementById("dash-status-text");
    if (isDemo) {
      statusText.innerHTML = '<i class="ri-information-line"></i> Demo Mode';
      statusText.style.color = "var(--accent-amber)";
    } else {
      statusText.innerHTML = '<i class="ri-shield-check-line"></i> Real-time Sync';
      statusText.style.color = "var(--accent-emerald)";
    }

    // 3. TAB 1: Profile Overview
    document.getElementById("overview-avatar").src = profile.avatar_url;
    document.getElementById("overview-name").textContent = profile.name || profile.login;
    document.getElementById("overview-username").textContent = `@${profile.login}`;
    document.getElementById("overview-bio").textContent = profile.bio || "No professional biography provided.";
    
    // Meta fields
    const metaList = document.getElementById("overview-meta-list");
    metaList.innerHTML = "";
    
    const metaItems = [
      { key: "company", icon: "ri-briefcase-line", label: profile.company },
      { key: "location", icon: "ri-map-pin-line", label: profile.location },
      { key: "blog", icon: "ri-global-line", label: profile.blog, isLink: true },
      { key: "created", icon: "ri-calendar-line", label: profile.created_at ? `Joined ${new Date(profile.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long' })}` : "" }
    ];

    metaItems.forEach(item => {
      if (item.label) {
        const div = document.createElement("div");
        div.className = "profile-meta-item";
        if (item.isLink) {
          const cleanUrl = item.label.startsWith("http") ? item.label : `https://${item.label}`;
          div.innerHTML = `<i class="${item.icon}"></i><a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${item.label}</a>`;
        } else {
          div.innerHTML = `<i class="${item.icon}"></i><span>${item.label}</span>`;
        }
        metaList.appendChild(div);
      }
    });

    // Circular Score Fill
    const circleFill = document.getElementById("score-circle-fill");
    const numText = document.getElementById("score-num-text");
    const scoreRating = document.getElementById("score-rating");
    
    const pct = analysis.profileScore;
    numText.textContent = pct;
    
    // svg circle stroke circumference = 377
    const dashOffset = 377 - (377 * pct) / 100;
    circleFill.style.strokeDashoffset = dashOffset;
    
    if (pct >= 85) scoreRating.textContent = "Elite Profile";
    else if (pct >= 70) scoreRating.textContent = "Strong Profile";
    else if (pct >= 50) scoreRating.textContent = "Good Profile";
    else scoreRating.textContent = "Needs Polish";

    // Statistics numbers
    document.getElementById("stat-repos").textContent = analysis.stats.totalRepos;
    document.getElementById("stat-stars").textContent = analysis.stats.totalStars;
    document.getElementById("stat-forks").textContent = analysis.stats.totalForks;

    // 4. TAB 2: Repository Analysis Highlights
    const hs = analysis.stats;
    document.getElementById("hl-starred-name").textContent = hs.mostStarred ? hs.mostStarred.name : "N/A";
    document.getElementById("hl-starred-val").innerHTML = hs.mostStarred ? `<i class="ri-star-fill"></i> ${hs.mostStarred.stargazers_count}` : "0 stars";
    
    document.getElementById("hl-forked-name").textContent = hs.mostForked ? hs.mostForked.name : "N/A";
    document.getElementById("hl-forked-val").innerHTML = hs.mostForked ? `<i class="ri-git-branch-fill"></i> ${hs.mostForked.forks_count}` : "0 forks";

    document.getElementById("hl-updated-name").textContent = hs.mostRecentlyUpdated ? hs.mostRecentlyUpdated.name : "N/A";
    const updateDateStr = hs.mostRecentlyUpdated ? new Date(hs.mostRecentlyUpdated.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A";
    document.getElementById("hl-updated-val").innerHTML = `<i class="ri-time-line"></i> ${updateDateStr}`;

    document.getElementById("hl-size-name").textContent = hs.largestRepo ? hs.largestRepo.name : "N/A";
    const sizeMb = hs.largestRepo ? (hs.largestRepo.size / 1024).toFixed(1) : "0";
    document.getElementById("hl-size-val").innerHTML = `<i class="ri-hard-drive-line"></i> ${sizeMb} MB`;

    document.getElementById("repo-health-score").textContent = `${analysis.averageRepoHealth}%`;

    // Populate Languages Filter
    repoFilterLang.innerHTML = '<option value="all">All Languages</option>';
    const uniqueLangs = [...new Set(raw.repositories.map(r => r.language).filter(Boolean))];
    uniqueLangs.forEach(lang => {
      const opt = document.createElement("option");
      opt.value = lang.toLowerCase();
      opt.textContent = lang;
      repoFilterLang.appendChild(opt);
    });

    renderRepositoryCards(analysis.repoDetails);

    // 5. TAB 4: Strengths & Weaknesses
    const strengthsContainer = document.getElementById("strengths-list");
    strengthsContainer.innerHTML = "";
    
    analysis.strengths.forEach(s => {
      const sCard = document.createElement("div");
      sCard.className = "glass-card strength-card";
      
      let icon = "ri-medal-line";
      if (s.icon === "code") icon = "ri-code-box-line";
      else if (s.icon === "globe") icon = "ri-earth-line";
      else if (s.icon === "layers") icon = "ri-stack-line";
      else if (s.icon === "activity") icon = "ri-pulse-line";
      else if (s.icon === "book-open") icon = "ri-book-read-line";
      
      const gaugeOffset = 157 - (157 * s.confidence) / 100;
      
      sCard.innerHTML = `
        <div class="strength-info">
          <div class="strength-title"><i class="${icon}"></i> ${s.title}</div>
          <div class="strength-desc">${s.desc}</div>
        </div>
        <div class="strength-gauge" title="Confidence Match Level">
          <svg class="strength-gauge-svg">
            <circle class="strength-gauge-bg" cx="30" cy="30" r="25"></circle>
            <circle class="strength-gauge-fill" cx="30" cy="30" r="25" style="stroke-dasharray: 157; stroke-dashoffset: ${gaugeOffset};"></circle>
          </svg>
          <span class="strength-gauge-val">${s.confidence}%</span>
        </div>
      `;
      strengthsContainer.appendChild(sCard);
    });

    const weaknessesContainer = document.getElementById("weaknesses-list");
    weaknessesContainer.innerHTML = "";
    
    analysis.weaknesses.forEach(w => {
      const wCard = document.createElement("div");
      wCard.className = `glass-card weakness-card severity-${w.severity}`;
      
      let icon = "ri-alert-line";
      if (w.severity === "critical") icon = "ri-close-circle-line";
      
      wCard.innerHTML = `
        <div class="weakness-header">
          <div class="weakness-title"><i class="${icon}"></i> ${w.title}</div>
          <span class="weakness-badge badge-${w.severity}">${w.severity}</span>
        </div>
        <div class="weakness-warning">${w.warning}</div>
        <div class="weakness-rec"><strong>Recommendation:</strong> ${w.recommendation}</div>
      `;
      weaknessesContainer.appendChild(wCard);
    });

    // 6. TAB 5: Portfolio Review
    document.getElementById("radar-score-total").textContent = `${analysis.portfolioScore}/100`;
    
    // Draw Progress bars for Dimensions
    const dims = analysis.portfolioDimensions;
    renderPortfolioMetricBar("p-bar-completeness", dims.completeness);
    renderPortfolioMetricBar("p-bar-professionalism", dims.professionalism);
    renderPortfolioMetricBar("p-bar-documentation", dims.documentation);
    renderPortfolioMetricBar("p-bar-uniqueness", dims.uniqueness);
    renderPortfolioMetricBar("p-bar-depth", dims.depth);
    renderPortfolioMetricBar("p-bar-recruiter", dims.recruiter);

    // 7. TAB 6: Career Insights Dashboard
    const topRole = analysis.careerInsights[0];
    document.getElementById("career-best-role").textContent = topRole.role;
    document.getElementById("career-best-pct").textContent = `${topRole.compatibility}% Match`;
    
    const careerGrid = document.getElementById("career-cards-list");
    careerGrid.innerHTML = "";
    
    analysis.careerInsights.forEach(c => {
      const card = document.createElement("div");
      card.className = "glass-card career-card";
      
      card.innerHTML = `
        <div class="career-card-top">
          <div class="career-card-header">
            <span class="career-role-title">${c.role}</span>
            <span class="career-match-pct" style="color: ${c.color}">${c.compatibility}%</span>
          </div>
          <p class="career-role-desc">${c.desc}</p>
        </div>
        <div class="career-bar-outer">
          <div class="career-bar-inner" style="width: ${c.compatibility}%; background: ${c.color}"></div>
        </div>
      `;
      careerGrid.appendChild(card);
    });

    // 8. TAB 7: Roadmap
    const rMap = analysis.roadmap;
    
    // Clear lists
    populateRoadmapMilestoneStack("roadmap-immediate-stack", rMap.immediate);
    populateRoadmapMilestoneStack("roadmap-short-stack", rMap.shortTerm);
    populateRoadmapMilestoneStack("roadmap-long-stack", rMap.longTerm);

    // 9. Prep Printable report container
    populatePrintReport(wrapper);
  }

  function renderPortfolioMetricBar(id, val) {
    const bar = document.getElementById(id);
    if (bar) {
      // Delay slightly for transition triggers
      setTimeout(() => {
        bar.style.width = `${val}%`;
      }, 100);
      
      // Update label text value
      const label = bar.closest(".portfolio-metric-bar-wrapper").querySelector(".portfolio-metric-val");
      if (label) {
        label.textContent = `${val}%`;
      }
    }
  }

  function populateRoadmapMilestoneStack(elementId, items) {
    const stack = document.getElementById(elementId);
    if (!stack) return;
    stack.innerHTML = "";
    
    if (items.length === 0) {
      stack.innerHTML = `
        <div class="glass-card roadmap-item-card">
          <h4>Profile Complete</h4>
          <p>No critical recommendations in this timeframe. Your metrics are optimized!</p>
        </div>
      `;
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "glass-card roadmap-item-card";
      card.innerHTML = `
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      `;
      stack.appendChild(card);
    });
  }

  // --- Dynamic Repository Rendering (Search, filter, sort) ---
  function renderRepositoryCards(repos) {
    const container = document.getElementById("repo-cards-container");
    if (!container) return;
    container.innerHTML = "";

    if (repos.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
          <i class="ri-folder-open-line" style="font-size: 2.5rem; color: var(--text-muted); display: block; margin-bottom: 12px;"></i>
          No repositories match your active search or filters.
        </div>
      `;
      return;
    }

    repos.forEach(repo => {
      const card = document.createElement("div");
      card.className = "glass-card repo-card";
      
      // Health class
      let healthClass = "repo-health-high";
      let healthLabel = "Excellent";
      if (repo.health_score < 50) {
        healthClass = "repo-health-low";
        healthLabel = "Weak";
      } else if (repo.health_score < 80) {
        healthClass = "repo-health-medium";
        healthLabel = "Good";
      }

      // Format update date
      const uDate = new Date(repo.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      const languageText = repo.language || "Plain Text";
      const sizeText = (repo.size / 1024).toFixed(1) + " MB";

      card.innerHTML = `
        <div>
          <div class="repo-card-header">
            <span class="repo-card-title">${repo.name}</span>
            <span class="repo-card-health-badge ${healthClass}" title="Heuristic repository quality score: ${repo.health_score}%">${healthLabel}</span>
          </div>
          <p class="repo-card-desc">${repo.description || "No project description provided. Update details on GitHub to improve index score."}</p>
        </div>
        <div class="repo-card-footer">
          <div class="repo-card-left">
            <span class="repo-lang-indicator">
              <span class="repo-lang-dot" style="background-color: ${getLanguageColor(repo.language)}"></span>
              ${languageText}
            </span>
            <span>${sizeText}</span>
          </div>
          <div class="repo-card-stats">
            <span title="Stars"><i class="ri-star-line"></i> ${repo.stargazers_count}</span>
            <span title="Forks"><i class="ri-git-branch-line"></i> ${repo.forks_count}</span>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function getLanguageColor(lang) {
    const colors = {
      "typescript": "#3178c6",
      "javascript": "#f1e05a",
      "go": "#00add8",
      "python": "#3572a5",
      "rust": "#dea584",
      "css": "#563d7c",
      "html": "#e34c26",
      "shell": "#89e051",
      "c++": "#f34b7d",
      "ruby": "#701516",
      "java": "#b07219"
    };
    if (!lang) return "#475569";
    return colors[lang.toLowerCase()] || "#3b82f6";
  }

  // --- Filtering & Sorting Event Listeners ---
  function filterAndSortRepos() {
    if (!currentAnalysisData) return;
    
    let list = [...currentAnalysisData.analysis.repoDetails];
    
    // 1. Search Query
    const search = repoSearchInput.value.toLowerCase().trim();
    if (search) {
      list = list.filter(r => r.name.toLowerCase().includes(search) || r.description.toLowerCase().includes(search));
    }
    
    // 2. Language Filter
    const lang = repoFilterLang.value;
    if (lang !== "all") {
      list = list.filter(r => r.language && r.language.toLowerCase() === lang);
    }
    
    // 3. Sorting
    const sort = repoSortSelect.value;
    if (sort === "stars") {
      list.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else if (sort === "forks") {
      list.sort((a, b) => b.forks_count - a.forks_count);
    } else if (sort === "size") {
      list.sort((a, b) => b.size - a.size);
    } else if (sort === "updated") {
      list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    } else if (sort === "health") {
      list.sort((a, b) => b.health_score - a.health_score);
    }
    
    renderRepositoryCards(list);
  }

  repoSearchInput.addEventListener("input", filterAndSortRepos);
  repoFilterLang.addEventListener("change", filterAndSortRepos);
  repoSortSelect.addEventListener("change", filterAndSortRepos);

  // --- Tab Navigation Handlers ---
  sidebarNavItems.forEach(item => {
    item.addEventListener("click", () => {
      const tabId = item.dataset.tab;
      switchTab(tabId);
    });
  });

  function switchTab(tabId) {
    sidebarNavItems.forEach(i => {
      if (i.dataset.tab === tabId) {
        i.classList.add("active");
      } else {
        i.classList.remove("active");
      }
    });

    dashboardSections.forEach(sec => {
      if (sec.id === tabId) {
        sec.classList.add("active");
      } else {
        sec.classList.remove("active");
      }
    });
  }

  // --- Render Dashboard Charts (Drives charts.js) ---
  function renderDashboardCharts(data, isDark) {
    window.DevScopeCharts.destroyAll();
    
    // Language Doughnut
    window.DevScopeCharts.renderLanguageChart("chart-lang", data.languages, isDark);
    
    // Growth line
    window.DevScopeCharts.renderGrowthChart("chart-growth", data.repositories, isDark);
    
    // Stars comparison
    window.DevScopeCharts.renderStarsChart("chart-stars", data.repositories, isDark);
    
    // Forks comparison
    window.DevScopeCharts.renderForksChart("chart-forks", data.repositories, isDark);
    
    // Commit Activity Simulator
    window.DevScopeCharts.renderCommitActivity("commit-calendar-box", data.repositories, isDark);
    
    // Portfolio Radar
    if (currentAnalysisData && currentAnalysisData.analysis) {
      window.DevScopeCharts.renderRadarChart("chart-portfolio-radar", currentAnalysisData.analysis.portfolioDimensions, isDark);
    }
  }

  // --- Export and Sharing Center Calculations ---

  // Export to PDF (triggers standard print styling)
  exportPdfBtn.addEventListener("click", () => {
    if (!currentAnalysisData) return;
    window.print();
  });

  // Download raw analysis metrics as a JSON file
  downloadJsonBtn.addEventListener("click", () => {
    if (!currentAnalysisData) return;
    
    const analysisPayload = {
      meta: {
        tool: "DevScope GitHub Portfolio Reviewer",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      },
      analysis: currentAnalysisData.analysis,
      rawProfile: currentAnalysisData.raw.profile
    };
    
    const blob = new Blob([JSON.stringify(analysisPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devscope-report-${currentAnalysisData.raw.profile.login}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Share review details (copies snippet to clipboard)
  shareBtn.addEventListener("click", () => {
    if (!currentAnalysisData) return;
    
    const profile = currentAnalysisData.raw.profile;
    const score = currentAnalysisData.analysis.profileScore;
    const topCareer = currentAnalysisData.analysis.careerInsights[0].role;
    
    const shareText = `📊 DevScope Profile Review for @${profile.login}
⭐ Portfolio Index: ${score}/100
💼 Primary Career Track: ${topRoleCheck(score, topCareer)}
🚀 Ready to evaluate your developer profile? Try DevScope!`;
    
    navigator.clipboard.writeText(shareText)
      .then(() => {
        alert("Portfolio Analysis Summary copied to clipboard! Share it with recruiters or teams.");
      })
      .catch(err => {
        console.error("Clipboard copy failed: ", err);
      });
  });

  function topRoleCheck(score, role) {
    if (score > 80) return `${role} (Elite Tier)`;
    return role;
  }

  // Populates the hidden print template dynamically prior to triggering window.print()
  function populatePrintReport(wrapper) {
    const { raw, analysis } = wrapper;
    const profile = raw.profile;
    
    document.getElementById("print-avatar").src = profile.avatar_url;
    document.getElementById("print-name").textContent = profile.name || profile.login;
    document.getElementById("print-handle").textContent = `@${profile.login}`;
    document.getElementById("print-bio").textContent = profile.bio || "No professional biography provided.";
    
    document.getElementById("print-company").textContent = profile.company || "N/A";
    document.getElementById("print-location").textContent = profile.location || "N/A";
    document.getElementById("print-blog").textContent = profile.blog || "N/A";
    document.getElementById("print-joined").textContent = profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A";

    document.getElementById("print-score").textContent = `${analysis.profileScore}/100`;
    document.getElementById("print-repos-count").textContent = analysis.stats.totalRepos;
    document.getElementById("print-stars-count").textContent = analysis.stats.totalStars;
    document.getElementById("print-health").textContent = `${analysis.averageRepoHealth}%`;

    // Print Strengths
    const pStr = document.getElementById("print-strengths-list");
    pStr.innerHTML = "";
    analysis.strengths.forEach(s => {
      const li = document.createElement("li");
      li.className = "print-bullet-item";
      li.innerHTML = `<strong>${s.title} (${s.confidence}%):</strong> ${s.desc}`;
      pStr.appendChild(li);
    });

    // Print Weaknesses
    const pWeak = document.getElementById("print-weaknesses-list");
    pWeak.innerHTML = "";
    analysis.weaknesses.forEach(w => {
      const li = document.createElement("li");
      li.className = "print-bullet-item";
      li.innerHTML = `<strong>${w.title} [${w.severity.toUpperCase()}]:</strong> ${w.warning} - ${w.recommendation}`;
      pWeak.appendChild(li);
    });

    // Print Careers
    const pCareer = document.getElementById("print-careers-list");
    pCareer.innerHTML = "";
    analysis.careerInsights.slice(0, 3).forEach(c => {
      const li = document.createElement("li");
      li.className = "print-bullet-item";
      li.innerHTML = `<strong>${c.role}:</strong> ${c.compatibility}% compatibility. ${c.desc}`;
      pCareer.appendChild(li);
    });

    // Print Roadmap
    const pRoad = document.getElementById("print-roadmap-list");
    pRoad.innerHTML = "";
    
    // Combined roadmap points
    const combinedRoadmap = [
      ...analysis.roadmap.immediate.map(i => ({ title: `Immediate (0-30 days): ${i.title}`, desc: i.desc })),
      ...analysis.roadmap.shortTerm.map(i => ({ title: `Short Term (1-3 months): ${i.title}`, desc: i.desc })),
      ...analysis.roadmap.longTerm.map(i => ({ title: `Long Term (3-6 months): ${i.title}`, desc: i.desc }))
    ];

    combinedRoadmap.slice(0, 5).forEach(item => {
      const li = document.createElement("li");
      li.className = "print-bullet-item";
      li.innerHTML = `<strong>${item.title}:</strong> ${item.desc}`;
      pRoad.appendChild(li);
    });
  }
});
