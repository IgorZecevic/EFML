(async () => {
  const REMOTE_DATA_URL =
    "https://raw.githubusercontent.com/IgorZecevic/EFML/refs/heads/main/pesica-players.json";

  console.log(
    "Pesica Squad Helper (MOBILE): script injected on",
    window.location.href
  );

  async function loadPlayersMap() {
    try {
      const res = await fetch(REMOTE_DATA_URL, { cache: "no-cache" });
      if (!res.ok) {
        console.warn(
          "Pesica mobile (PESDB): failed to load remote JSON",
          res.status
        );
        return {};
      }
      const map = await res.json();
      console.log(
        "Pesica mobile (PESDB): remote JSON players map size:",
        Object.keys(map).length
      );
      return map;
    } catch (e) {
      console.error("Pesica mobile (PESDB): error loading remote JSON", e);
      return {};
    }
  }

  function extractPlayerIdFromHref(href) {
    if (!href) return null;

    try {
      const url = new URL(href, window.location.origin);
      const id = url.searchParams.get("id");
      if (id) return id;
    } catch (e) {
      // ignore, fallback to regex
    }

    const match = href.match(/id=(\d+)/);
    return match ? match[1] : null;
  }

  function addPesicaHeaderColumn(table) {
    const firstRow = table.querySelector("tbody tr");
    if (!firstRow) return;

    const headerCells = firstRow.querySelectorAll("th");
    if (!headerCells.length) return;

    if (
      [...headerCells].some((th) => th.textContent.trim() === "Pesica Team")
    ) {
      return;
    }

    const th = document.createElement("th");
    th.textContent = "Pesica Team";
    firstRow.appendChild(th);
  }

  function highlightTable(table, playersMap) {
    const rows = table.querySelectorAll("tbody tr");

    if (!rows.length) {
      console.log("Pesica mobile (PESDB): no rows in players table");
      return;
    }

    rows.forEach((row) => {
      // header row?
      if (row.querySelector("th")) return;

      // already processed?
      if (row.querySelector("td.pesica-team-cell")) return;

      const nameCell = row.querySelector("td:nth-child(2) a[href*='id=']");
      if (!nameCell) return;

      const playerId = extractPlayerIdFromHref(nameCell.getAttribute("href"));
      if (!playerId) return;

      const rawValue = playersMap[playerId] || ""; // "Team - Manager"
      let teamLabel = "";

      if (rawValue) {
        teamLabel = rawValue.split(" - ")[0].trim();
      }

      const td = document.createElement("td");
      td.className = "pesica-team-cell";

      if (teamLabel) {
        td.textContent = teamLabel;
        td.style.fontWeight = "bold";
        td.style.color = "#0a7b23";
      } else {
        td.textContent = "-";
        td.style.color = "#999";
      }

      row.appendChild(td);
    });
  }

  async function initPesicaOnPesdb() {
    const table = document.querySelector("table.players");
    if (!table) {
      console.log(
        "Pesica mobile (PESDB): players table not found on this page"
      );
      return;
    }

    const playersMap = await loadPlayersMap();
    addPesicaHeaderColumn(table);
    highlightTable(table, playersMap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPesicaOnPesdb);
  } else {
    initPesicaOnPesdb();
  }
})();
