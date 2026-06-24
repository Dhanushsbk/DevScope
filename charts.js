// js/charts.js
// Orchestrates the creation, updating, and destruction of Chart.js elements.

window.DevScopeCharts = {
  instances: {},

  destroyAll() {
    Object.keys(this.instances).forEach(key => {
      if (this.instances[key]) {
        this.instances[key].destroy();
        this.instances[key] = null;
      }
    });
  },

  getThemeColors(isDark) {
    return {
      textColor: isDark ? "#cbd5e1" : "#334155", // slate-300 vs slate-700
      gridColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
      borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
      accentColor: "#3b82f6", // blue-500
      accentGlow: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.05)"
    };
  },

  renderLanguageChart(canvasId, languages, isDark) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const colors = this.getThemeColors(isDark);

    // Sort languages by size
    const sorted = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7); // Top 7 languages

    const labels = sorted.map(item => item[0]);
    const data = sorted.map(item => item[1]);

    // Beautiful SaaS palette
    const bgColors = [
      "#38bdf8", // Sky blue
      "#a855f7", // Purple
      "#10b981", // Emerald
      "#ec4899", // Pink
      "#f59e0b", // Amber
      "#3b82f6", // Royal blue
      "#ef4444"  // Red
    ];

    this.instances[canvasId] = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: bgColors.slice(0, labels.length),
          borderWidth: isDark ? 2 : 1,
          borderColor: isDark ? "#0f172a" : "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: colors.textColor,
              font: { family: "Outfit, Inter, sans-serif", size: 12 },
              padding: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            titleColor: isDark ? "#ffffff" : "#0f172a",
            bodyColor: colors.textColor,
            borderColor: colors.borderColor,
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const val = context.raw;
                const pct = Math.round((val / total) * 100);
                return ` ${context.label}: ${pct}% (${Math.round(val / 1024)} KB)`;
              }
            }
          }
        },
        cutout: "70%"
      }
    });
  },

  renderGrowthChart(canvasId, repos, isDark) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const colors = this.getThemeColors(isDark);

    // Calculate repository accumulation over time
    const sortedByDate = [...repos]
      .filter(r => r.created_at)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const dataPoints = [];
    const labels = [];
    let cumulative = 0;

    sortedByDate.forEach(repo => {
      const date = new Date(repo.created_at);
      const label = date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
      
      cumulative++;
      // If same month already exists, update cumulative rather than pushing duplicates
      if (labels.length > 0 && labels[labels.length - 1] === label) {
        dataPoints[dataPoints.length - 1] = cumulative;
      } else {
        labels.push(label);
        dataPoints.push(cumulative);
      }
    });

    // Make sure we have at least some labels
    if (labels.length === 0) {
      labels.push("Start");
      dataPoints.push(0);
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");

    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Repositories Created",
          data: dataPoints,
          borderColor: "#3b82f6",
          borderWidth: 2,
          backgroundColor: gradient,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#3b82f6",
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.textColor, font: { family: "Outfit, Inter" } }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: { 
              color: colors.textColor, 
              font: { family: "Outfit, Inter" },
              precision: 0
            }
          }
        }
      }
    });
  },

  renderStarsChart(canvasId, repos, isDark) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const colors = this.getThemeColors(isDark);

    const topStarred = [...repos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .filter(r => r.stargazers_count > 0);

    const labels = topStarred.map(r => r.name);
    const data = topStarred.map(r => r.stargazers_count);

    if (data.length === 0) {
      // Fallback empty view placeholder in chart
      labels.push("No Starred Repos");
      data.push(0);
    }

    this.instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Stars",
          data: data,
          backgroundColor: "rgba(245, 158, 11, 0.8)", // amber-500
          borderColor: "#f59e0b",
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: colors.gridColor },
            ticks: { color: colors.textColor, font: { family: "Outfit, Inter" }, precision: 0 }
          },
          y: {
            grid: { display: false },
            ticks: { color: colors.textColor, font: { family: "Outfit, Inter" } }
          }
        }
      }
    });
  },

  renderForksChart(canvasId, repos, isDark) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const colors = this.getThemeColors(isDark);

    const topForked = [...repos]
      .sort((a, b) => b.forks_count - a.forks_count)
      .slice(0, 5)
      .filter(r => r.forks_count > 0);

    const labels = topForked.map(r => r.name);
    const data = topForked.map(r => r.forks_count);

    if (data.length === 0) {
      labels.push("No Forked Repos");
      data.push(0);
    }

    this.instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Forks",
          data: data,
          backgroundColor: "rgba(168, 85, 247, 0.8)", // purple-500
          borderColor: "#a855f7",
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: colors.gridColor },
            ticks: { color: colors.textColor, font: { family: "Outfit, Inter" }, precision: 0 }
          },
          y: {
            grid: { display: false },
            ticks: { color: colors.textColor, font: { family: "Outfit, Inter" } }
          }
        }
      }
    });
  },

  renderRadarChart(canvasId, dimensions, isDark) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const colors = this.getThemeColors(isDark);

    const labels = [
      "Completeness",
      "Professionalism",
      "Documentation",
      "Uniqueness",
      "Depth",
      "Recruiter Appeal"
    ];

    const data = [
      dimensions.completeness,
      dimensions.professionalism,
      dimensions.documentation,
      dimensions.uniqueness,
      dimensions.depth,
      dimensions.recruiter
    ];

    this.instances[canvasId] = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [{
          label: "Portfolio Score",
          data: data,
          backgroundColor: isDark ? "rgba(168, 85, 247, 0.25)" : "rgba(168, 85, 247, 0.15)",
          borderColor: "#a855f7",
          borderWidth: 2,
          pointBackgroundColor: "#a855f7",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#a855f7"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          r: {
            angleLines: { color: colors.gridColor },
            grid: { color: colors.gridColor },
            pointLabels: {
              color: colors.textColor,
              font: { family: "Outfit, Inter, sans-serif", size: 11, weight: "600" }
            },
            ticks: {
              backdropColor: "transparent",
              color: colors.textColor,
              font: { size: 9 },
              stepSize: 20
            },
            min: 0,
            max: 100
          }
        }
      }
    });
  },

  renderCommitActivity(containerId, repos, isDark) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    // Generate a beautiful simulated contribution calendar (53 columns representing weeks, 7 rows representing days)
    // To make it reflect repository updates, we'll light up calendar cells randomly but centered around
    // repos' updated dates.
    const columnsCount = 50; // columns to fit viewport
    const calendarGrid = document.createElement("div");
    calendarGrid.className = "contrib-calendar-grid";
    calendarGrid.style.display = "grid";
    calendarGrid.style.gridAutoFlow = "column";
    calendarGrid.style.gridTemplateRows = "repeat(7, 1fr)";
    calendarGrid.style.gridTemplateColumns = `repeat(${columnsCount}, 1fr)`;
    calendarGrid.style.gap = "3px";

    // Build lists of update dates to seed activity level
    const updateTimestamps = repos.map(r => new Date(r.updated_at).getTime());
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // We will generate cells for 7 days * columnsCount weeks (total 350 cells)
    // representing past 350 days
    const totalCells = columnsCount * 7;
    
    for (let i = 0; i < totalCells; i++) {
      const cellDateMs = now - (totalCells - i) * oneDay;
      const cellDate = new Date(cellDateMs);
      
      // Determine contribution level (0 to 4)
      let level = 0;

      // Base random seeding to make calendar look natural and full
      const rand = Math.random();
      if (rand > 0.95) level = 1;
      else if (rand > 0.98) level = 2;

      // Seed around repository updates (if repo was updated near this date, increase activity level)
      updateTimestamps.forEach(ts => {
        const diffDays = Math.abs(ts - cellDateMs) / oneDay;
        if (diffDays < 1) {
          level = Math.max(level, 4);
        } else if (diffDays < 4) {
          level = Math.max(level, Math.floor(Math.random() * 2) + 2); // level 2 or 3
        } else if (diffDays < 10) {
          level = Math.max(level, Math.floor(Math.random() * 2) + 1); // level 1 or 2
        }
      });

      const cell = document.createElement("div");
      cell.className = "contrib-cell";
      cell.dataset.level = level;
      cell.style.width = "10px";
      cell.style.height = "10px";
      cell.style.borderRadius = "2px";
      
      // Color coding levels (modern github-like)
      let bgColor = isDark ? "rgba(255, 255, 255, 0.05)" : "#ebedf0";
      if (level === 1) bgColor = isDark ? "#0e4429" : "#9be9a8";
      else if (level === 2) bgColor = isDark ? "#006d32" : "#40c463";
      else if (level === 3) bgColor = isDark ? "#26a641" : "#30a14e";
      else if (level === 4) bgColor = isDark ? "#39d353" : "#216e39";

      cell.style.backgroundColor = bgColor;

      // Tooltip date description
      const dateStr = cellDate.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
      const contribs = level === 0 ? "No contributions" : `${level * 2 + Math.floor(Math.random() * 3)} contributions`;
      cell.title = `${contribs} on ${dateStr}`;

      calendarGrid.appendChild(cell);
    }

    container.appendChild(calendarGrid);
  }
};
