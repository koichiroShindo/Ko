// data/events.js のイベント一覧から「次回の講演会」と「開催報告」を組み立てます。

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
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}（${WEEKDAYS[date.getDay()]}）`;
}

function sampleBadge(event) {
  return event.sample ? `<span class="badge">サンプル</span>` : "";
}

function upcomingCard(event) {
  const date = parseDate(event.date);
  const apply = event.apply
    ? `<a class="button" href="${escapeHtml(event.apply)}" target="_blank" rel="noopener">参加を申し込む</a>`
    : "";
  return `
    <article class="next-event">
      <div class="next-date">
        <span class="next-month">${date.getFullYear()}.${date.getMonth() + 1}</span>
        <span class="next-day">${date.getDate()}</span>
        <span class="next-weekday">${WEEKDAYS[date.getDay()]}曜日</span>
      </div>
      <div class="next-body">
        ${sampleBadge(event)}
        <h3>${escapeHtml(event.title)}</h3>
        <p class="speaker"><strong>${escapeHtml(event.speaker)}</strong> 氏<span>${escapeHtml(event.affiliation)}</span></p>
        <p>${escapeHtml(event.summary)}</p>
        <dl class="meta">
          <div><dt>日時</dt><dd>${formatDate(date)} ${escapeHtml(event.time)}</dd></div>
          <div><dt>会場</dt><dd>${escapeHtml(event.place)}</dd></div>
        </dl>
        ${apply}
      </div>
    </article>`;
}

function archiveCard(event) {
  const date = parseDate(event.date);
  const photos = event.photos || [];
  const cover = photos.length
    ? `<img src="${PHOTO_DIR}${escapeHtml(photos[0])}" alt="${escapeHtml(event.title)}の様子" loading="lazy" data-zoom>`
    : `<div class="cover-empty">No Photo</div>`;
  const thumbs = photos.slice(1).map(photo =>
    `<img src="${PHOTO_DIR}${escapeHtml(photo)}" alt="${escapeHtml(event.title)}の様子" loading="lazy" data-zoom>`
  ).join("");
  return `
    <article class="report">
      <div class="report-cover">${cover}</div>
      <div class="report-body">
        <time>${formatDate(date)}</time>${sampleBadge(event)}
        <h3>${escapeHtml(event.title)}</h3>
        <p class="speaker"><strong>${escapeHtml(event.speaker)}</strong> 氏<span>${escapeHtml(event.affiliation)}</span></p>
        <p>${escapeHtml(event.summary)}</p>
        ${thumbs ? `<div class="thumbs">${thumbs}</div>` : ""}
      </div>
    </article>`;
}

function render() {
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
    : `<p class="empty">次回のイベントは準備中です。決まり次第お知らせします。</p>`;

  document.getElementById("archive-list").innerHTML = past.length
    ? past.map(archiveCard).join("")
    : `<p class="empty">開催報告はまだありません。</p>`;
}

function setupLightbox() {
  const box = document.getElementById("lightbox");
  const img = box.querySelector("img");
  document.addEventListener("click", e => {
    if (e.target.matches("[data-zoom]")) {
      img.src = e.target.src;
      img.alt = e.target.alt;
      box.showModal();
    }
  });
  box.addEventListener("click", () => box.close());
}

render();
setupLightbox();
