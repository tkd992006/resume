// v3 — v2 app shell wearing the root design. Panels switch in place (no page
// scroll); details open in sheets; the chronology is drawn from CHRONO_TRACKS.

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

// ---------------------------------------------------------------------------
// Dialogs: sheets (project / portfolio), case-study modals, lightbox
// ---------------------------------------------------------------------------
const dialogReturnFocus = new WeakMap();
const caseSteppers = new Map();

// backdrop 닫기: 모달 안 텍스트를 드래그하다 backdrop 위에서 놓아도 닫히지 않도록
// press와 release가 모두 backdrop에서 일어난 경우에만 닫는다.
const enableBackdropClose = (dialog) => {
  let pressedOnBackdrop = false;
  dialog.addEventListener("pointerdown", (event) => {
    pressedOnBackdrop = event.target === dialog;
  });
  dialog.addEventListener("click", (event) => {
    if (pressedOnBackdrop && event.target === dialog) dialog.close();
    pressedOnBackdrop = false;
  });
};

const openDialog = (dialog, trigger) => {
  if (!(dialog instanceof HTMLDialogElement) || dialog.open) return;
  dialogReturnFocus.set(dialog, trigger ?? document.activeElement);
  dialog.showModal();
  caseSteppers.get(dialog)?.();
  const scroller = dialog.querySelector(".sheet-body, .case-modal-content");
  if (scroller) scroller.scrollTop = 0;
};

$$("dialog").forEach((dialog) => {
  enableBackdropClose(dialog);
  dialog.addEventListener("close", () => {
    const returnTo = dialogReturnFocus.get(dialog);
    if (returnTo instanceof HTMLElement && returnTo.isConnected) returnTo.focus({ preventScroll: true });
    // 딥링크로 연 시트를 닫으면 주소는 패널로 되돌린다(새로고침 시 다시 열리지 않도록)
    if (dialog.classList.contains("sheet") && window.location.hash === `#${dialog.id}`) {
      window.history.replaceState(null, "", `#${dialog.dataset.panel ?? ""}`);
    }
  });
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const opener = event.target.closest("[data-sheet-open], [data-case-open]");
  if (opener) {
    const id = opener.getAttribute("data-sheet-open") ?? opener.getAttribute("data-case-open");
    openDialog(document.getElementById(id ?? ""), opener);
    return;
  }
  const closer = event.target.closest("[data-sheet-close], [data-case-close]");
  if (closer) closer.closest("dialog")?.close();
});

// Lightbox (image zoom) — works from inside sheets too (nested top-layer dialogs)
const lightbox = $(".lightbox");
const lightboxImage = lightbox?.querySelector("img");

$$("[data-lightbox]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!lightbox || !lightboxImage) return;
    const imagePath = button.getAttribute("data-lightbox");
    if (!imagePath) return;
    lightboxImage.src = imagePath;
    lightboxImage.alt = button.querySelector("img")?.alt || "포트폴리오 이미지";
    openDialog(lightbox, button);
  });
});

$(".lightbox-close")?.addEventListener("click", () => lightbox?.close());
lightbox?.addEventListener("close", () => lightboxImage?.removeAttribute("src"));

// ---------------------------------------------------------------------------
// AMA tabs + follow-up toggles
// ---------------------------------------------------------------------------
const amaQuestions = $$("[data-ama-target]");
const amaAnswers = $$(".ama-answer");

const closeFollowup = (followup) => {
  followup.classList.remove("is-open");
  followup.querySelector(".ama-followup-toggle")?.setAttribute("aria-expanded", "false");
};

const activateAmaQuestion = (question, shouldFocus = false) => {
  const targetId = question.getAttribute("data-ama-target");
  amaQuestions.forEach((item) => {
    const isSelected = item === question;
    item.classList.toggle("is-active", isSelected);
    item.setAttribute("aria-selected", String(isSelected));
    item.tabIndex = isSelected ? 0 : -1;
  });
  amaAnswers.forEach((answer) => {
    const isSelected = answer.id === targetId;
    answer.classList.toggle("is-active", isSelected);
    answer.hidden = !isSelected;
  });
  $$(".ama-followup.is-open").forEach(closeFollowup);
  if (shouldFocus) question.focus();
};

amaQuestions.forEach((question, index) => {
  question.addEventListener("click", () => activateAmaQuestion(question));
  question.addEventListener("keydown", (event) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (["ArrowDown", "ArrowRight"].includes(event.key)) next = (index + 1) % amaQuestions.length;
    if (["ArrowUp", "ArrowLeft"].includes(event.key)) next = (index - 1 + amaQuestions.length) % amaQuestions.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = amaQuestions.length - 1;
    activateAmaQuestion(amaQuestions[next], true);
  });
});

$$(".ama-followup-toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const followup = toggle.closest(".ama-followup");
    const group = toggle.closest(".ama-followups");
    if (!followup || !group) return;
    const shouldOpen = !followup.classList.contains("is-open");
    $$(".ama-followup.is-open", group).forEach(closeFollowup);
    followup.classList.toggle("is-open", shouldOpen);
    toggle.setAttribute("aria-expanded", String(shouldOpen));
  });
});

// ---------------------------------------------------------------------------
// 연표 — thin bars (period) and dots (year-only); names appear on hover/focus.
// start/end: "YYYY-MM" (end inclusive) or "now". year: 연 단위로만 아는 항목(점).
// approx: 연 단위 범위(빗금). featured: Selected Work.
// boundary: 그 해가 시작되는 경계선 위에 찍는 점(예: 2025 → 2024|2025 사이).
// ---------------------------------------------------------------------------
const CHRONO = {
  startYear: 2018,
  end: "2027-02", // 축의 마지막 달(포함). now 뒤에 약간의 여백
  omitFrom: 2019, // 사건이 없는 2019–2021은 축에서 생략하고 // 단절로 잇는다
  omitTo: 2021,
  gapColumn: "22px",
  firstYearScale: 0.55, // 2018은 폭을 조금 좁게
  now: "2026-09",
};

const CHRONO_TRACKS = [
  {
    label: "Education",
    items: [{ label: "KAIST 전산학부 · 수리과학 부전공", start: "2018-03", end: "2025-08", href: "#edu-kaist" }],
  },
  {
    label: "AI tools",
    items: [
      { label: "GitHub Copilot", start: "2022-11", end: "2023-02", href: "#ai-experience" },
      { label: "Cursor", start: "2023-03", end: "2025-10", href: "#ai-experience" },
      { label: "Antigravity → Claude Code", start: "2025-11", end: "2026-04", href: "#ai-experience" },
      { label: "Codex + Claude Code", start: "2026-05", end: "now", href: "#ai-experience" },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "TingtingPlanet · Founder", start: "2023-03", end: "now", href: "#work-tingtingplanet" },
      { label: "OnTheMarket · Co-founder / CTO", start: "2025-06", end: "2026-02", href: "#work-onthemarket" },
    ],
  },
  {
    label: "Projects",
    items: [
      { label: "OnTheMarket", start: "2025-06", end: "2026-02", href: "#project-onthemarket", featured: true },
      { label: "Gagageul", year: 2025, href: "#project-gagageul", featured: true },
      { label: "ChapterTwo", boundary: 2025, href: "#portfolio-chaptertwo" },
      { label: "SYRS AI Lab", year: 2024, href: "#project-syrs", featured: true },
      { label: "JoBonger", year: 2024, href: "#portfolio-jobonger" },
      { label: "Play AI SSO", year: 2024, href: "#portfolio-playai" },
      { label: "Akasys", year: 2023, href: "#project-akasys", featured: true },
      { label: "Local Jobs", year: 2023, href: "#project-local-jobs", featured: true },
      { label: "ClackClack Platform", year: 2023, href: "#portfolio-clackclack" },
      { label: "Watch Wise", year: 2023, href: "#portfolio-watchwise" },
      { label: "Mounting", year: 2023, href: "#portfolio-mounting" },
      { label: "SLOTHS ON THE RUN · ETH Denver", start: "2023-02", end: "2023-03", href: "#portfolio-sloths" },
      { label: "Hashmoss", year: 2022, href: "#portfolio-hashmoss" },
    ],
  },
];

// 그리드 열 인덱스: 2018년 12개월 → 단절 열 1개 → 2022년 1월부터 축 끝까지
const GAP_INDEX = (CHRONO.omitFrom - CHRONO.startYear) * 12;
const monthIndex = (ym) => {
  const [year, month] = (ym === "now" ? CHRONO.now : ym).split("-").map(Number);
  if (year < CHRONO.omitFrom) return (year - CHRONO.startYear) * 12 + (month - 1);
  if (year <= CHRONO.omitTo) return GAP_INDEX; // 생략 구간의 날짜는 단절 열에 붙는다
  return GAP_INDEX + 1 + (year - CHRONO.omitTo - 1) * 12 + (month - 1);
};
const totalMonths = () => monthIndex(CHRONO.end) + 1;

const periodText = (item) => {
  if (item.year) return String(item.year);
  if (item.boundary) return `${item.boundary - 1} – ${item.boundary}`;
  const [startYear, startMonth] = item.start.split("-");
  if (item.approx) {
    const endYear = item.end.split("-")[0];
    return startYear === endYear ? startYear : `${startYear} – ${endYear}`;
  }
  const endText = item.end === "now" ? "현재" : item.end.replace("-", ".");
  return `${startYear}.${startMonth} – ${endText}`;
};

// 한 트랙의 항목을 줄에 배치한다. 연 단위 항목은 그 해 안에 고르게 펼친 점으로,
// 기간이 겹치는 항목은 아래 줄로 내린다(first-fit).
const layoutTrack = (items) => {
  const byYear = new Map();
  items.filter((item) => item.year).forEach((item) => {
    if (!byYear.has(item.year)) byYear.set(item.year, []);
    byYear.get(item.year).push(item);
  });
  byYear.forEach((group) => group.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))));

  const placed = items.map((item) => {
    if (item.boundary) {
      // 경계선 양옆 두 달에 걸쳐 놓고 가운데 정렬하면 점이 연 경계선 위에 온다
      const start = monthIndex(`${item.boundary - 1}-12`);
      return { item, start, end: start + 2, dot: true };
    }
    if (item.year) {
      const group = byYear.get(item.year);
      const month = Math.round(((group.indexOf(item) + 1) * 12) / (group.length + 1)) - 1;
      const start = monthIndex(`${item.year}-${String(month + 1).padStart(2, "0")}`);
      return { item, start, end: start + 1, dot: true };
    }
    const start = monthIndex(item.start);
    const end = item.end === "now" ? totalMonths() : monthIndex(item.end) + 1;
    return { item, start, end, dot: false };
  });

  placed.sort((a, b) => a.start - b.start || Number(Boolean(b.item.featured)) - Number(Boolean(a.item.featured)));
  const rowEnds = [];
  placed.forEach((entry) => {
    let row = rowEnds.findIndex((rowEnd) => rowEnd <= entry.start);
    if (row === -1) row = rowEnds.push(0) - 1;
    rowEnds[row] = entry.end;
    entry.row = row;
  });
  return { placed, rowCount: rowEnds.length };
};

const renderChrono = (grid) => {
  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const column = (index) => index + 2; // 1열은 트랙 라벨
  const place = (node, columnValue, rowValue) => {
    node.style.gridColumn = columnValue;
    node.style.gridRow = rowValue;
    grid.append(node);
  };

  const total = totalMonths();
  const endYear = Number(CHRONO.end.split("-")[0]);
  grid.style.setProperty(
    "--chrono-months",
    `repeat(${GAP_INDEX}, minmax(0, ${CHRONO.firstYearScale}fr)) ${CHRONO.gapColumn} repeat(${total - GAP_INDEX - 1}, minmax(0, 1fr))`,
  );
  grid.replaceChildren();

  const years = [];
  for (let year = CHRONO.startYear; year <= endYear; year += 1) {
    if (year < CHRONO.omitFrom || year > CHRONO.omitTo) years.push(year);
  }
  years.forEach((year) => {
    const startIndex = monthIndex(`${year}-01`);
    const span = Math.min(12, total - startIndex);
    // 축 끝에 걸린 짧은 해는 눈금선만 남긴다
    place(create("div", "chrono-year", span >= 6 ? String(year) : ""), `${column(startIndex)} / span ${span}`, "1");
  });

  let row = 2;
  CHRONO_TRACKS.forEach((track) => {
    const { placed, rowCount } = layoutTrack(track.items);
    const rowSpan = `${row} / span ${rowCount}`;
    place(create("div", "chrono-lane"), "1 / -1", rowSpan);
    place(create("div", "chrono-track", track.label), "1", rowSpan);

    placed.forEach(({ item, start, end, dot, row: laneRow }) => {
      const classes = ["chrono-bar"];
      if (dot) classes.push("is-dot");
      if (item.featured) classes.push("is-featured");
      if (item.approx) classes.push("is-approx");
      if (item.end === "now") classes.push("is-ongoing");
      const bar = create("a", classes.join(" "));
      bar.href = item.href;
      bar.dataset.label = item.label;
      bar.dataset.period = periodText(item);
      bar.dataset.track = track.label;
      bar.setAttribute("aria-label", `${item.label}, ${periodText(item)}`);
      place(bar, `${column(start)} / ${column(end)}`, String(row + laneRow));
    });
    row += rowCount;
  });

  years.slice(1).forEach((year) => {
    place(create("div", "chrono-yearline"), String(column(monthIndex(`${year}-01`))), `2 / ${row}`);
  });
  const gap = create("div", "chrono-gap");
  gap.setAttribute("aria-label", `${CHRONO.omitFrom}–${CHRONO.omitTo} 생략`);
  place(gap, String(column(GAP_INDEX)), `1 / ${row}`);
  place(create("div", "chrono-now"), String(column(monthIndex("now"))), `1 / ${row}`);
};

const chronoGrid = $("[data-chrono]");
const chronoTip = $(".chrono-tip");

const showChronoTip = (bar) => {
  if (!chronoTip) return;
  chronoTip.replaceChildren();
  const name = document.createElement("strong");
  name.textContent = bar.dataset.label ?? "";
  const meta = document.createElement("span");
  meta.textContent = `${bar.dataset.period ?? ""} · ${bar.dataset.track ?? ""}`;
  chronoTip.append(name, meta);
  chronoTip.hidden = false;
  const rect = bar.getBoundingClientRect();
  const x = Math.min(Math.max(rect.left + rect.width / 2, 170), window.innerWidth - 170);
  chronoTip.style.left = `${x}px`;
  chronoTip.style.top = `${rect.top}px`;
  chronoGrid?.classList.add("is-hovering");
  bar.classList.add("is-hot");
};

const hideChronoTip = (bar) => {
  if (chronoTip) chronoTip.hidden = true;
  chronoGrid?.classList.remove("is-hovering");
  bar?.classList.remove("is-hot");
};

if (chronoGrid) {
  renderChrono(chronoGrid);

  chronoGrid.addEventListener("pointerover", (event) => {
    const bar = event.target instanceof Element ? event.target.closest(".chrono-bar") : null;
    if (bar) showChronoTip(bar);
  });
  chronoGrid.addEventListener("pointerout", (event) => {
    const bar = event.target instanceof Element ? event.target.closest(".chrono-bar") : null;
    if (bar && !(event.relatedTarget instanceof Node && bar.contains(event.relatedTarget))) hideChronoTip(bar);
  });
  chronoGrid.addEventListener("focusin", (event) => {
    const bar = event.target instanceof Element ? event.target.closest(".chrono-bar") : null;
    if (bar) showChronoTip(bar);
  });
  chronoGrid.addEventListener("focusout", (event) => {
    const bar = event.target instanceof Element ? event.target.closest(".chrono-bar") : null;
    if (bar) hideChronoTip(bar);
  });
  $(".chrono-scroller")?.addEventListener("scroll", () => hideChronoTip($(".chrono-bar.is-hot")));

  // 좁은 화면에서 가로 스크롤이 생기면 최근(now) 쪽부터 보여 준다
  const scroller = chronoGrid.closest(".chrono-scroller");
  if (scroller && scroller.scrollWidth > scroller.clientWidth) scroller.scrollLeft = scroller.scrollWidth;
}

// ---------------------------------------------------------------------------
// Case-study stepper: one section at a time, prev/next, step tabs, arrow keys
// ---------------------------------------------------------------------------
$$(".case-modal").forEach((modal) => {
  const shell = modal.querySelector(".case-modal-shell");
  const content = modal.querySelector(".case-modal-content");
  if (!shell || !content) return;
  const steps = $$(":scope > .case-section", content);
  const evidence = content.querySelector(":scope > .case-evidence");
  if (steps.length < 2) return;

  const nav = document.createElement("nav");
  nav.className = "case-steps";
  nav.setAttribute("aria-label", "문제 해결 단계");
  const list = document.createElement("ol");
  list.className = "case-steps-list";
  const labels = steps.map(
    (step, index) =>
      step.querySelector(".case-section-kicker")?.textContent?.trim() ||
      step.querySelector("h3")?.textContent?.trim() ||
      `Step ${index + 1}`,
  );
  const tabs = labels.map((label, index) => {
    const item = document.createElement("li");
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "case-step";
    tab.innerHTML = `<span class="case-step-index">${String(index + 1).padStart(2, "0")}</span><span class="case-step-label">${label}</span>`;
    tab.addEventListener("click", () => show(index));
    item.append(tab);
    list.append(item);
    return tab;
  });
  nav.append(list);
  content.before(nav);

  const controls = document.createElement("div");
  controls.className = "case-step-controls";
  controls.innerHTML = `
    <button class="case-step-btn" type="button" data-step-prev>← 이전 단계</button>
    <span class="case-step-count" aria-live="polite"></span>
    <button class="case-step-btn is-primary" type="button" data-step-next>다음 단계 →</button>`;
  content.after(controls);
  const prevButton = controls.querySelector("[data-step-prev]");
  const nextButton = controls.querySelector("[data-step-next]");
  const count = controls.querySelector(".case-step-count");
  const pad = (n) => String(n).padStart(2, "0");

  let current = 0;
  const show = (index) => {
    current = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach((step, i) => {
      step.hidden = i !== current;
      step.classList.toggle("is-entering", i === current);
    });
    if (evidence) evidence.hidden = current !== steps.length - 1;
    tabs.forEach((tab, i) => {
      tab.classList.toggle("is-active", i === current);
      tab.classList.toggle("is-done", i < current);
      if (i === current) tab.setAttribute("aria-current", "step");
      else tab.removeAttribute("aria-current");
    });
    prevButton.disabled = current === 0;
    const isLast = current === steps.length - 1;
    nextButton.textContent = isLast ? "닫기" : "다음 단계 →";
    nextButton.classList.toggle("is-primary", !isLast);
    count.textContent = `${pad(current + 1)} / ${pad(steps.length)}`;
    content.scrollTop = 0;
    tabs[current].scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  prevButton.addEventListener("click", () => show(current - 1));
  nextButton.addEventListener("click", () => {
    if (current === steps.length - 1) modal.close();
    else show(current + 1);
  });
  modal.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest("input, textarea, [contenteditable]")) return;
    if (event.key === "ArrowRight" && current < steps.length - 1) {
      event.preventDefault();
      show(current + 1);
    } else if (event.key === "ArrowLeft" && current > 0) {
      event.preventDefault();
      show(current - 1);
    }
  });

  caseSteppers.set(modal, () => show(0));
  show(0);
});

// ---------------------------------------------------------------------------
// Rail ↔ panels (hash routing). A hash may name a panel, an element inside a
// panel (highlighted), or a sheet (its panel is shown and the sheet opens).
// ---------------------------------------------------------------------------
const panels = $$(".panel");
const railItems = $$(".rail-item");
const stage = $("#stage");
const DEFAULT_PANEL_ID = "who-am-i";
const BASE_TITLE = "이상화 · Frontend / Product Engineer";
const HASH_ALIASES = { projects: "selected-work", top: DEFAULT_PANEL_ID, stage: DEFAULT_PANEL_ID };

let targetPulseTimer = 0;
const pulseTarget = (element) => {
  $$(".is-targeted").forEach((node) => node.classList.remove("is-targeted"));
  window.clearTimeout(targetPulseTimer);
  element.classList.add("is-targeted");
  targetPulseTimer = window.setTimeout(() => element.classList.remove("is-targeted"), 1700);
};

const setActivePanel = (panel) => {
  panels.forEach((item) => item.classList.toggle("is-active", item === panel));
  let activeTitle = "";
  railItems.forEach((item) => {
    const isActive = item.dataset.panel === panel.id;
    const link = item.querySelector(".rail-link");
    item.classList.toggle("is-active", isActive);
    if (isActive) {
      link?.setAttribute("aria-current", "page");
      activeTitle = item.querySelector(".rail-title")?.textContent?.trim() ?? "";
    } else {
      link?.removeAttribute("aria-current");
    }
  });
  document.title = panel.id === DEFAULT_PANEL_ID || !activeTitle ? BASE_TITLE : `${activeTitle} · ${BASE_TITLE}`;
};

const route = ({ initial = false } = {}) => {
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  const id = HASH_ALIASES[raw] ?? raw;
  const target = id ? document.getElementById(id) : null;
  const defaultPanel = document.getElementById(DEFAULT_PANEL_ID);

  if (target instanceof HTMLDialogElement) {
    const panel = document.getElementById(target.dataset.panel ?? "") ?? defaultPanel;
    if (panel) setActivePanel(panel);
    if (!target.open) openDialog(target, $(`[data-sheet-open="${target.id}"]`) ?? undefined);
    return;
  }

  const panel = target?.closest(".panel") ?? defaultPanel;
  if (!(panel instanceof HTMLElement)) return;
  const changed = !panel.classList.contains("is-active");
  setActivePanel(panel);
  if (changed && stage) stage.scrollTop = 0;

  if (target && target !== panel) {
    target.scrollIntoView({ block: "nearest", behavior: initial ? "instant" : "smooth" });
    pulseTarget(target);
  } else if (changed && !initial) {
    panel.focus({ preventScroll: true });
  }
};

// 페이지 안 앵커(레일·연표 막대·본문 링크)는 기본 해시 스크롤 대신 직접 처리한다
document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.classList.contains("skip-link")) return;
  const hash = link.getAttribute("href");
  if (!hash || hash === "#") return;
  event.preventDefault();
  hideChronoTip($(".chrono-bar.is-hot"));
  if (hash !== window.location.hash) window.history.pushState(null, "", hash);
  route();
});

window.addEventListener("popstate", () => route());
route({ initial: true });
