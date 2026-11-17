// Folding@home, Unit — a full-panel card for a 600x800 greyscale reader.
//
// Layout, top to bottom: brand on the left with server / donor / team stacked
// on the right, donor numbers, the simulation still, what the project is, and
// the progress bar for that unit. No description and no PPD: at 167 ppi there is
// room for one idea per line.

const CSS = `
:host { display: block; height: 100%; font-family: inherit; }

.w {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 3.2cqw;
  padding: 4.6cqw;
  background: var(--bg);
  color: var(--text-primary);
}

/* ---- header ------------------------------------------------------- */
.head { display: flex; align-items: stretch; justify-content: space-between; gap: 3cqw; }
.left {
  display: flex;
  flex-direction: column;
  gap: 2.6cqw;
  min-width: 0;
}
.who {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  min-width: 0;
}
/* name and team sit on the baseline of the stat labels, with the server name
   left at the top of the header */
.who-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .7cqw;
}
.brand {
  font-size: clamp(15px, 4.4cqw, 64px);
  font-weight: var(--fw-black, 900);
  letter-spacing: .02em;
  line-height: 1;
}
.machine {
  /* same size as the brand, still the muted colour */
  font-size: clamp(15px, 4.4cqw, 64px);
  font-weight: var(--fw-semi, 700);
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--text-muted);
  line-height: 1;
  white-space: nowrap;
}

/* ---- server / name / team, then the donor numbers -------------------- */
.name {
  /* a touch larger than the team line: lowercase has a shorter x-height than
     the uppercase labels, so equal font-size reads smaller */
  font-size: clamp(8px, 2.15cqw, 30px);
  font-weight: var(--fw-black, 900);
  line-height: 1.15;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.team {
  /* identical to the stat labels */
  font-size: clamp(7px, 1.7cqw, 24px);
  letter-spacing: .12em;
  text-transform: var(--label-transform, uppercase);
  color: var(--text-muted);
  line-height: 1.15;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats { display: flex; gap: 4.5cqw; }
.stat { display: flex; flex-direction: column; gap: .2cqw; min-width: 0; }
.stat b {
  font-size: clamp(15px, 4.2cqw, 60px);
  font-weight: var(--fw-black, 900);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.stat span {
  font-size: clamp(7px, 1.7cqw, 24px);
  letter-spacing: .12em;
  text-transform: var(--label-transform, uppercase);
  color: var(--text-muted);
}

/* ---- the still ------------------------------------------------------ */
.figure {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.figure img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* the render is ink on white paper: a matte keeps it legible on dark themes
     too, where a multiply blend would erase it */
  background: #fff;
  padding: 2.2cqw;
  border-radius: var(--radius-1, 2px);
  box-sizing: border-box;
}

/* ---- what it is ----------------------------------------------------- */
.caption { display: flex; flex-direction: column; gap: .6cqw; }
.project {
  font-size: clamp(12px, 3.2cqw, 46px);
  font-weight: var(--fw-bold, 800);
  line-height: 1.1;
}
.project .num { color: var(--text-muted); font-weight: var(--fw-regular, 500); }
.topic {
  font-size: clamp(9px, 2.2cqw, 32px);
  color: var(--text-secondary);
  line-height: 1.2;
}

/* ---- progress ------------------------------------------------------- */
.progress { display: flex; flex-direction: column; gap: 1.2cqw; }
.track {
  width: 100%;
  height: clamp(9px, 3.2cqw, 48px);
  background: var(--surface-sunken);
  border-radius: var(--radius-1, 2px);
  overflow: hidden;
}
.fill {
  height: 100%;
  background: var(--text-primary);
  border-radius: var(--radius-1, 2px);
}
.meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: clamp(9px, 2.2cqw, 32px);
  font-variant-numeric: tabular-nums;
}
.meta .pct { font-weight: var(--fw-black, 900); }
.meta .eta { color: var(--text-secondary); }

/* ---- compact sizes --------------------------------------------------- */
.size-sm .stats, .size-xs .stats { display: none; }
.size-sm .name, .size-xs .name { font-size: clamp(9px, 2.8cqw, 13px); }
.size-sm .team, .size-xs .team { font-size: clamp(7px, 2.2cqw, 11px); }
.size-sm .w, .size-xs .w { gap: 4cqw; padding: 5cqw; }
.size-sm .topic { display: none; }

/* ---- error ----------------------------------------------------------- */
.err {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3cqw;
  padding: 6cqw;
  text-align: center;
  background: var(--bg);
  color: var(--text-primary);
}
.err i { font-size: clamp(28px, 12cqw, 96px); color: var(--text-muted); }
.err p { font-size: clamp(10px, 2.6cqw, 20px); font-weight: var(--fw-semi, 700); margin: 0; }
`;

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

function fmtScore(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return "—";
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(v >= 1e8 ? 0 : 2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}k`;
  return String(Math.round(v));
}

function fmtCount(n) {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? v.toLocaleString("en-US") : "—";
}

export default async function render(shadow, ctx) {
  const data = ctx.data || {};
  const size = ctx.cell?.size || "lg";

  const link = `<link rel="stylesheet" href="/static/style/spectra-widgets.css">
    <link rel="stylesheet" href="/static/icons/phosphor/bold/style.css">`;

  if (data.error) {
    shadow.innerHTML = `${link}<style>${CSS}</style>
      <div class="err">
        <i class="ph-bold ph-warning-circle" aria-hidden="true"></i>
        <p>${esc(data.error)}</p>
      </div>`;
    return;
  }

  const donor = data.donor || {};
  const team = data.team || {};
  const pct = Math.round(Math.min(1, Math.max(0, Number(data.progress) || 0)) * 100);
  const showStats = ctx.cell?.options?.show_stats !== false && donor.position;

  const projectName = data.project_name ? ` · ${esc(data.project_name)}` : "";
  const teamLine = team.name
    ? `${esc(team.name)}${team.rank ? ` (#${esc(team.rank)})` : ""}`
    : "";

  const img = data.protein
    ? `<div class="figure"><img src="data:image/png;base64,${data.protein}" alt=""></div>`
    : `<div class="figure"></div>`;

  shadow.innerHTML = `${link}<style>${CSS}</style>
    <div class="w size-${esc(size)}" data-widget="fah_unit">
      <div class="head">
        <div class="left">
          <div class="brand">FOLDING@HOME</div>
          ${showStats ? `
          <div class="stats">
            <div class="stat"><b>#${esc(donor.position)}</b><span>${esc(ctx.t("on_team", "on team"))}</span></div>
            <div class="stat"><b>${fmtScore(donor.score)}</b><span>${esc(ctx.t("points", "points"))}</span></div>
            <div class="stat"><b>${fmtCount(donor.wus)}</b><span>${esc(ctx.t("wu", "WU"))}</span></div>
          </div>` : ""}
        </div>
        <div class="who">
          <div class="machine">${esc(data.machine || "")}</div>
          <div class="who-bottom">
            <div class="name">${esc(donor.name || data.user || "")}</div>
            <div class="team">${teamLine}</div>
          </div>
        </div>
      </div>

      ${img}

      <div class="caption">
        <div class="project">
          <span class="num">p${esc(data.project)}</span>${projectName}
        </div>
        ${data.topic ? `<div class="topic">${esc(data.topic)}</div>` : ""}
      </div>

      <div class="progress">
        <div class="track"><div class="fill" style="width:${pct}%"></div></div>
        <div class="meta">
          <span class="pct">${pct}%</span>
          <span class="eta">${data.eta ? `${esc(ctx.t("eta", "ETA"))} ${esc(data.eta)}` : ""}</span>
        </div>
      </div>
    </div>`;
}
