// data/events.js のイベント一覧から「次回のイベント」と「開催報告」を組み立てます。

const PHOTO_DIR = "images/events/";
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function parseDate(dateString) {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${WEEKDAYS[date.getDay()]}）`;
}

function sampleBadge(event) {
  return event.sample ? `<span class="badge">サンプル</span>` : "";
}

function speakerLine(event) {
  if (!event.speaker) return "";
  return `<p class="speaker">講師：${escapeHtml(event.speaker)}<span>${escapeHtml(event.affiliation)}</span></p>`;
}

function upcomingCard(event) {
  const date = parseDate(event.date);
  const apply = event.apply
    ? `<a class="button" href="${escapeHtml(event.apply)}" target="_blank" rel="noopener">参加を申し込む</a>`
    : "";
  return `
    <article class="notice">
      <p class="notice-date">
        <span class="notice-md">${date.getMonth() + 1}<small>月</small>${date.getDate()}<small>日</small></span>
        <span class="notice-wd">${WEEKDAYS[date.getDay()]}曜日 ${escapeHtml(event.time)}</span>
      </p>
      ${sampleBadge(event)}
      <h3>${escapeHtml(event.title)}</h3>
      ${speakerLine(event)}
      <p class="notice-summary">${escapeHtml(event.summary)}</p>
      <p class="notice-place">会場：${escapeHtml(event.place)}</p>
      ${apply}
    </article>`;
}

function photoTag(event, photo) {
  const alt = event.poster ? `${event.title}の告知ポスター` : `${event.title}の様子`;
  return `<button type="button" class="photo${event.poster ? " photo-poster" : ""}" data-zoom="${PHOTO_DIR}${escapeHtml(photo)}">` +
    `<img src="${PHOTO_DIR}${escapeHtml(photo)}" alt="${escapeHtml(alt)}" loading="lazy"></button>`;
}

function linkTag(event) {
  if (!event.link) return "";
  return `<p><a href="${escapeHtml(event.link.url)}" target="_blank" rel="noopener">${escapeHtml(event.link.label)}</a></p>`;
}

function archiveCard(event) {
  const date = parseDate(event.date);
  const photos = event.photos || [];
  const gallery = photos.length
    ? `<div class="gallery${event.poster ? " gallery-poster" : ""}">${photos.map(p => photoTag(event, p)).join("")}</div>`
    : "";
  return `
    <article class="report">
      <div class="report-text">
        <p class="report-date">${escapeHtml(event.dateText || formatDate(date))}${sampleBadge(event)}</p>
        <h3>${escapeHtml(event.title)}</h3>
        ${speakerLine(event)}
        <p class="report-summary">${escapeHtml(event.summary)}</p>
        ${linkTag(event)}
      </div>
      ${gallery}
    </article>`;
}

function render() {
  if (!document.getElementById("upcoming-list")) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const events = (window.EVENTS || []).slice();

  const upcoming = events
    .filter(e => parseDate(e.date) >= today)
    .sort((a, b) => parseDate(a.date) - parseDate(b.date));
  const past = events
    .filter(e => parseDate(e.date) < today)
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));

  document.getElementById("upcoming-list").innerHTML = upcoming.length
    ? upcoming.map(upcomingCard).join("")
    : `<p class="empty">次回のイベントは準備中です。決まり次第、XとInstagramでもお知らせします。</p>`;

  // 最近の3件はそのまま表示し、それより前のものは「それより前の開催報告を見る」の中にしまう
  const RECENT_COUNT = 3;
  document.getElementById("archive-list").innerHTML = past.length
    ? past.slice(0, RECENT_COUNT).map(archiveCard).join("")
    : `<p class="empty">開催報告はまだありません。</p>`;
  const older = past.slice(RECENT_COUNT);
  if (older.length) {
    document.getElementById("archive-older").innerHTML = older.map(archiveCard).join("");
    document.getElementById("archive-older-wrap").hidden = false;
  }
}

// 年間スケジュールの各行事の詳細に、これまでの回の写真と報告を並べる
function renderSeriesHistory() {
  const events = (window.EVENTS || [])
    .filter(e => e.series)
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));
  document.querySelectorAll(".schedule-details details[id]").forEach(details => {
    const past = events.filter(e => e.series === details.id);
    if (!past.length) return;
    const items = past.map(event => {
      const photos = event.photos || [];
      const gallery = photos.length
        ? `<div class="history-photos">${photos.map(p => photoTag(event, p)).join("")}</div>`
        : "";
      return `
        <li>
          <p class="history-label">${escapeHtml(event.dateText || formatDate(parseDate(event.date)))}　${escapeHtml(event.title)}</p>
          ${gallery}
        </li>`;
    }).join("");
    details.querySelector(".detail-body").insertAdjacentHTML("beforeend",
      `<div class="history"><p class="history-title">これまでの様子</p><ul>${items}</ul></div>`);
  });
}

// メンバーページの運営メンバー一覧（data/members.js）
function renderMembers() {
  const list = document.getElementById("member-list");
  if (!list) return;
  list.innerHTML = (window.MEMBERS || []).map(m => {
    const photo = m.photo
      ? `<img class="member-photo" src="images/members/${escapeHtml(m.photo)}" alt="${escapeHtml(m.name)}">`
      : "";
    const meta = [m.grade, m.seminar].filter(Boolean).map(escapeHtml).join("・");
    return `
      <article class="member">
        <p class="member-role">${escapeHtml(m.role)}</p>
        <div class="member-body">
          ${photo}
          <h3>${escapeHtml(m.name)}</h3>
          ${meta ? `<p class="member-meta">${meta}</p>` : ""}
          ${m.comment ? `<p class="member-comment">${escapeHtml(m.comment)}</p>` : ""}
        </div>
      </article>`;
  }).join("");
}

// 年間スケジュールで今月のマスに印をつける
function markThisMonth() {
  const month = new Date().getMonth() + 1;
  const cell = document.querySelector(`.month-cell[data-month="${month}"]`);
  if (cell) {
    cell.classList.add("is-now");
    cell.querySelector(".month-num").insertAdjacentHTML("beforeend", `<span class="now-label">今月</span>`);
  }
}

// マス目のイベント名を押したら、下の詳細を開いてそこへ移動する
function openFromHash() {
  const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target && target.matches(".schedule-details details")) {
    target.open = true;
    target.scrollIntoView({ block: "start" });
  }
}

function setupLightbox() {
  const box = document.getElementById("lightbox");
  const img = box.querySelector("img");
  document.addEventListener("click", e => {
    const button = e.target.closest("[data-zoom]");
    if (button) {
      img.src = button.dataset.zoom;
      img.alt = button.querySelector("img").alt;
      box.showModal();
    }
  });
  box.addEventListener("click", () => box.close());
}

render();
renderSeriesHistory();
renderMembers();
markThisMonth();
setupLightbox();
window.addEventListener("hashchange", openFromHash);
openFromHash();
