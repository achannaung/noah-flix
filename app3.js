function openModalRefresh(it){
  var g = genreNames(it);
  $("modalGenres").innerHTML = g.map(function(n){ return '<span class="chip">' + esc(n) + '</span>'; }).join("");
  var ov = overviewOf(it);
  if (ov) $("modalOverview").textContent = ov;
  if (enrichedFor === keyOf(it)) return;
  enrichedFor = keyOf(it);
  var facts = $("modalFacts").innerHTML;
  var extra = "";
  if (it.runtime) extra += "<div><b>" + t("factRuntime") + ":</b> <span>" + it.runtime + t("minSuffix") + "</span></div>";
  if (it.number_of_seasons) extra += "<div><b>" + t("factSeasons") + ":</b> <span>" + it.number_of_seasons + "</span></div>";
  if (it.status) extra += "<div><b>" + t("factStatus") + ":</b> <span>" + esc(it.status) + "</span></div>";
  if (extra) $("modalFacts").innerHTML = facts + extra;
}
function startPlayer(it){
  var media = $("modalMedia");
  stopPlayer();
  var f = document.createElement("iframe");
  f.id = "playerFrame";
  f.src = embedUrl(it);
  f.title = "Player — " + titleOf(it);
  f.setAttribute("allowfullscreen", "true");
  f.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; encrypted-media");
  f.setAttribute("referrerpolicy", "origin");
  media.appendChild(f);
  $("modalBackdrop").style.display = "none";
  $("modalFade").style.display = "none";
  $("modalTitlebar").style.display = "none";
  recordHistory(it);
}
function stopPlayer(){
  var f = $("playerFrame");
  if (f) f.remove();
  var tf = $("trailerFrame");
  if (tf) tf.remove();
  var back = $("trailerBack"); if (back) back.classList.remove("show");
}

/* ---------------- Season dropdown + episode list (TV only) ----------------
   Seasons come from the TMDB show record (/tv/{id} -> seasons[]), and the
   episode list from /tv/{id}/season/{n}. Picking an episode updates the
   shared epSeason/epEpisode state, so every source's embed URL and the
   "open player in a new tab" link follow the selection. When TMDB is
   unreachable (offline snapshot mode), the picker falls back to a
   Season 1..N dropdown and numbered episodes without titles. */
var seasonData = [];   /* [{season_number, name, episode_count}] */
var epListCount = 0;   /* episodes in the currently rendered list (for prev/next bounds) */
var pendingLastEp = false; /* prev-season jump: select the last episode once its list loads */
function initEpisodePicker(it){
  var wrap = $("epWrap");
  if (typeOf(it) !== "tv") { wrap.style.display = "none"; return; }
  wrap.style.display = "block";
  seasonData = [];
  var sel = $("seasonSel");
  sel.innerHTML = '<option value="1">' + t("seasonN", 1) + '</option>';
  sel.value = "1";
  $("epList").innerHTML = '<span class="ep-note">' + t("loadingEpisodes") + '</span>';
  $("epCount").textContent = "";
  function useSeasons(list){
    if (!currentItem || currentItem.id !== it.id) return;
    seasonData = (list || []).filter(function(s){ return s && s.season_number != null; });
    if (!seasonData.length) seasonData = [{ season_number: 1, name: t("seasonN", 1), episode_count: null }];
    sel.innerHTML = "";
    seasonData.forEach(function(s){
      var o = document.createElement("option");
      o.value = String(s.season_number);
      o.textContent = s.name || t("seasonN", s.season_number);
      sel.appendChild(o);
    });
    var first = seasonData.filter(function(s){ return s.season_number >= 1; })[0] || seasonData[0];
    epSeason = first.season_number; epEpisode = 1;
    /* Resuming from Continue Watching: jump back to the saved
       season/episode instead of S1E1, and reload a player that is
       already open so it lands on the right episode. */
    if (pendingResume && pendingResume.id === it.id) {
      var want = seasonData.filter(function(s){ return s.season_number === pendingResume.season; })[0];
      if (want) epSeason = want.season_number;
      epEpisode = pendingResume.episode || 1;
      pendingResume = null;
    }
    sel.value = String(epSeason);
    updateSourceUI(it);
    var pf = $("playerFrame");
    if (pf) { pf.src = embedUrl(it); recordHistory(it); }
    loadEpisodes(it, epSeason);
  }
  if (it.seasons && it.seasons.length) { useSeasons(it.seasons); return; }
  fetchJSON("/tv/" + it.id).then(function(d){
    useSeasons(d && d.seasons);
  }).catch(function(){
    var n = Math.max(1, it.number_of_seasons || 1), list = [];
    for (var i = 1; i <= n; i++) list.push({ season_number: i, name: t("seasonN", i), episode_count: null });
    useSeasons(list);
  });
}
function seasonMeta(n){
  for (var i = 0; i < seasonData.length; i++) if (seasonData[i].season_number === n) return seasonData[i];
  return null;
}
function loadEpisodes(it, seasonNumber){
  var list = $("epList"); if (!list) return;
  list.innerHTML = '<span class="ep-note">' + t("loadingEpisodes") + '</span>';
  $("epCount").textContent = "";
  fetchJSON("/tv/" + it.id + "/season/" + seasonNumber).then(function(d){
    if (!currentItem || currentItem.id !== it.id) return;
    var eps = (d && d.episodes) || [];
    if (!eps.length) throw new Error("no episodes");
    renderEpisodes(eps.map(function(ep){
      return { n: ep.episode_number, title: ep.name || "", still: ep.still_path || "", overview: ep.overview || "", runtime: ep.runtime || null, air_date: ep.air_date || "" };
    }), true);
  }).catch(function(){
    if (!currentItem || currentItem.id !== it.id) return;
    var meta = seasonMeta(seasonNumber);
    var count = (meta && meta.episode_count) || 10;
    var eps = [];
    for (var i = 1; i <= count; i++) eps.push({ n: i, title: "" });
    renderEpisodes(eps, false);
  });
}
function renderEpisodes(eps, live){
  var list = $("epList"); if (!list) return;
  list.innerHTML = "";
  var rich = live && eps.some(function(ep){ return ep.still || ep.overview; });
  list.classList.toggle("rich", !!rich);
  eps.forEach(function(ep){
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("data-ep", ep.n);
    b.title = t("play") + " S" + epSeason + " E" + ep.n + (ep.title ? " — " + ep.title : "");
    b.onclick = function(){ selectEpisode(ep.n); };
    if (rich) {
      b.className = "ep-rich" + (ep.n === epEpisode ? " on" : "");
      var thumb = ep.still ? '<img loading="lazy" src="' + imgSrc(IMG + "w300" + ep.still) + '" alt="" onerror="this.style.display=\'none\'">' : "";
      var meta = [ep.air_date || "", ep.runtime ? ep.runtime + t("minSuffix") : ""].filter(Boolean).join(" · ");
      b.innerHTML = '<span class="ep-num">' + ep.n + '</span>' +
        '<span class="ep-thumb">' + thumb + '<span class="ep-play"><span class="circ" style="width:38px;height:38px;border-radius:999px;border:2px solid #fff;display:grid;place-items:center;background:rgba(0,0,0,.5)"><i data-lucide="play" style="width:16px;height:16px"></i></span></span></span>' +
        '<span class="ep-info"><span class="ep-name">' + esc(ep.title || t("episodeN", ep.n)) + '</span>' +
        (ep.overview ? '<span class="ep-ov">' + esc(ep.overview) + '</span>' : '') +
        (meta ? '<span class="ep-meta">' + esc(meta) + '</span>' : '') + '</span>';
    } else {
      b.className = "ep-btn" + (ep.n === epEpisode ? " on" : "");
      b.innerHTML = '<span class="n">E' + ep.n + '</span>' +
        '<span class="t">' + esc(ep.title || t("episodeN", ep.n)) + '</span>';
    }
    list.appendChild(b);
  });
  icons();
  $("epCount").textContent = epCountText(eps.length) + (live ? "" : t("epOfflineSuffix"));
  epListCount = eps.length;
  if (pendingLastEp && eps.length) { pendingLastEp = false; selectEpisode(eps[eps.length - 1].n); }
  updateEpNav();
}
function selectEpisode(n){
  epEpisode = n;
  document.querySelectorAll("#epList [data-ep]").forEach(function(b){
    b.classList.toggle("on", Number(b.getAttribute("data-ep")) === n);
  });
  if (currentItem) {
    updateSourceUI(currentItem);
    var f = $("playerFrame");
    if (f) { f.src = embedUrl(currentItem); recordHistory(currentItem); }
  }
  updateEpNav();
}
/* ---------------- Fullscreen + episode prev/next navigation ----------------
   The Fullscreen button fullscreens the player wrapper (#modalMedia)
   itself rather than relying on the embed's own fullscreen control,
   which some providers disable — the iframe already carries
   allowfullscreen + allow="… fullscreen …", so the wrapper can go
   fullscreen and the iframe fills it. Prev/Next step through episodes
   and cross season boundaries; every step funnels through
   selectEpisode()/setSeason(), so the player reload, the episode-list
   highlight, the new-tab link and the Continue Watching entry all
   update together. */
function toggleFullscreen(){
  var wrap = $("modalMedia"); if (!wrap) return;
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    return;
  }
  try {
    if (wrap.requestFullscreen) { var p = wrap.requestFullscreen(); if (p && p.catch) p.catch(function(){}); }
    else if (wrap.webkitRequestFullscreen) wrap.webkitRequestFullscreen();
    else if (wrap.webkitRequestFullScreen) wrap.webkitRequestFullScreen();
  } catch (e) {}
}
function seasonOrder(){
  return seasonData.map(function(s){ return s.season_number; });
}
function currentSeasonCount(){
  return epListCount || (seasonMeta(epSeason) || {}).episode_count || 0;
}
function setSeason(n, ep){
  epSeason = n; epEpisode = ep || 1;
  epListCount = 0;
  var sel = $("seasonSel"); if (sel) sel.value = String(n);
  if (currentItem) {
    updateSourceUI(currentItem);
    loadEpisodes(currentItem, n);
    var f = $("playerFrame");
    if (f) { f.src = embedUrl(currentItem); recordHistory(currentItem); }
  }
  updateEpNav();
}
function goEpisode(delta){
  if (!currentItem || typeOf(currentItem) !== "tv") return;
  var order = seasonOrder();
  var idx = order.indexOf(epSeason);
  if (delta > 0) {
    if (epEpisode < currentSeasonCount()) { selectEpisode(epEpisode + 1); return; }
    if (idx !== -1 && idx < order.length - 1) setSeason(order[idx + 1], 1);
  } else if (delta < 0) {
    if (epEpisode > 1) { selectEpisode(epEpisode - 1); return; }
    if (idx > 0) {
      var prev = order[idx - 1];
      var meta = seasonMeta(prev);
      if (meta && meta.episode_count) setSeason(prev, meta.episode_count);
      else { pendingLastEp = true; setSeason(prev, 1); }
    }
  }
  updateEpNav();
}
function updateEpNav(){
  var prev = $("epPrev"), next = $("epNext");
  if (!prev || !next) return;
  var order = seasonOrder();
  var idx = order.indexOf(epSeason);
  var count = currentSeasonCount();
  prev.disabled = epEpisode <= 1 && idx <= 0;
  next.disabled = (!count || epEpisode >= count) && (idx === -1 || idx >= order.length - 1);
}
/* Best-effort auto-advance: a few embed providers postMessage an
   "ended" / playback-finished event when an episode finishes; when
   one arrives, step to the next episode. Most providers never send
   it, so the Next Episode button above is the reliable path — this
   listener only fires when an event actually shows up. */
var lastAutoAdvance = 0;
window.addEventListener("message", function(ev){
  if (!currentItem || typeOf(currentItem) !== "tv" || !$("playerFrame")) return;
  var d = ev.data, ended = false;
  try {
    if (typeof d === "string") {
      try { d = JSON.parse(d); } catch (e) { if (d === "ended") ended = true; }
    }
    if (d && typeof d === "object") {
      if (d.ended === true) ended = true;
      var raw = d.event || d.type || d.name || (d.data && (d.data.event || d.data.type)) || "";
      var norm = String(raw).toLowerCase().replace(/[^a-z]/g, "");
      if (["ended", "playbackended", "playbackfinished", "videocomplete", "complete", "finished"].indexOf(norm) !== -1) ended = true;
    }
  } catch (e) {}
  if (!ended) return;
  var now = Date.now();
  if (now - lastAutoAdvance < 5000) return;
  lastAutoAdvance = now;
  goEpisode(1);
});
function closeModal(){
  stopPlayer();
  $("overlay").classList.remove("open");
  document.body.style.overflow = "";
  currentItem = null;
  pendingResume = null;
}

/* ---------------- Alt view (search / filters / My List) ---------------- */
var altKind = "";   /* "mylist" while the alt view shows My List (title text is localized, so track it) */
function showAlt(title, list, emptyHTML){
  altKind = "";
  $("altPerson").style.display = "none";
  setAltPeople(null);
  $("browse").style.display = "none";
  $("filterbar").style.display = "none";
  $("hero").style.display = "none";
  $("statusbar").style.display = "none";
  $("topnav").classList.add("scrolled");
  $("altView").style.display = "block";
  $("altTitle").textContent = title;
  register(list);
  var grid = $("altGrid");
  grid.innerHTML = (list||[]).filter(function(it){ return it && it.poster_path; }).map(cardHTML).join("");
  var e = $("altEmpty");
  if (!list || !list.length) { e.style.display = "block"; e.innerHTML = emptyHTML || t("nothingFound"); }
  else e.style.display = "none";
  icons();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function showBrowse(){
  $("altView").style.display = "none";
  $("statusbar").style.display = "flex";
  $("filterbar").style.display = "";
  $("browse").style.display = "block";
  if (filtersActive()) { syncFilterVisibility(); setActiveNav("home"); return; }
  $("filterView").style.display = "none";
  $("rowsWrap").style.display = "";
  $("hero").style.display = "flex";
  document.querySelectorAll("[data-row]").forEach(function(s){ s.style.display = ""; });
  setActiveNav("home");
  applyProfileLayout();
}
function showMyList(){
  var list = Object.keys(myList).map(function(k){ return myList[k]; });
  showAlt(t("navMyList"), list, t("myListEmpty"));
  altKind = "mylist";
  setActiveNav("mylist");
}
function setActiveNav(name){
  document.querySelectorAll(".nav-links button").forEach(function(b){
    b.classList.toggle("active", b.getAttribute("data-nav") === name);
  });
}

/* ---------------- TMDB fetching ----------------
   fetchJSON walks the connection routes in order (the cached route
   first, then direct, then the CORS proxies). A network error or
   timeout moves on to the next route; the first route that answers
   is cached via setRoute. A 4xx response means the route reached
   TMDB and TMDB itself refused, so it is not retried elsewhere.
   Only when every route fails does the promise reject — and callers
   then render the built-in snapshot. */
function fetchJSON(path, params){
  var url = API + path + "?api_key=" + TMDB_API_KEY + "&language=" + tmdbLang() + (params || "");
  var order = routeOrder();
  var lastErr = null;
  function attempt(i){
    if (i >= order.length) return Promise.reject(lastErr || new Error("TMDB unreachable"));
    var id = order[i];
    return fetchWithTimeout(routeWrap(id, url), 12000).then(function(resp){
      if (resp.ok) { setRoute(id); return resp.json(); }
      if (resp.status >= 400 && resp.status < 500) { setRoute(id); throw new Error("TMDB " + resp.status); }
      lastErr = new Error("TMDB " + resp.status);
      return attempt(i + 1);
    }, function(err){
      lastErr = err;
      return attempt(i + 1);
    });
  }
  return attempt(0);
}
/* "Retry live": forget the cached route and re-test the connection
   from scratch, reloading the live rows, stars and history posters
   (which pick up whatever route wins, proxy images included). */
function retryLive(){
  setRoute("");
  setStatus(false, "statusConnecting");
  loadHome();
  loadPeople();
  renderHistory();
  if (filtersActive()) applyFilters();
}
function setStatus(live, key){
  lastStatus = { live: live, key: key };
  renderStatus();
}
/* Home rows: each row pulls the first ROW_PAGES pages of its TMDB
   endpoint up front (3 pages = 60 titles), deduped by TMDB id, and a
   "Load more" tile at the end of the scroller fetches the next page
   on demand until the endpoint runs out. Per-row guard: one failed
   endpoint must not drop the whole page into snapshot mode — that row
   alone falls back to the built-in snapshot. */
var ROW_PAGES = 3;
var ROW_DEFS = [
  { key:"trending", el:"row-trending", path:"/trending/all/week", type:null },
  { key:"movies",   el:"row-movies",   path:"/movie/popular",     type:"movie" },
  { key:"tv",       el:"row-tv",       path:"/tv/popular",        type:"tv" },
  { key:"top",      el:"row-top",      path:"/movie/top_rated",   type:"movie" },
  { key:"now",      el:"row-now",      path:"/movie/now_playing", type:"movie" }
];
var rowState = {};   /* row key -> {seen, page, totalPages, live, busy} */
function fetchRowPage(def, page){
  return fetchJSON(def.path, "&page=" + page).then(function(d){
    var list = (d.results || []).map(function(x){
      if (def.type && !x.media_type) x.media_type = def.type;
      return x;
    });
    return { list: list, totalPages: d.total_pages || page };
  });
}
function freshRowItems(def, list){
  var st = rowState[def.key], out = [];
  (list || []).forEach(function(it){
    if (!it || !it.poster_path) return;
    if (isKids() && !isKidsSafe(it)) return;
    var k = keyOf(it);
    if (st.seen[k]) return;
    st.seen[k] = 1; out.push(it);
  });
  return out;
}
function syncMoreTile(def){
  var st = rowState[def.key], el = $(def.el);
  if (!el) return;
  var old = el.querySelector(".more-tile");
  if (old) old.remove();
  if (!st.live || st.busy || st.page >= st.totalPages) return;
  var b = document.createElement("button");
  b.type = "button";
  b.className = "card more-tile";
  b.setAttribute("aria-label", t("loadMore"));
  b.innerHTML = '<span class="poster"><span class="more-circ"><i data-lucide="chevron-down" style="width:26px;height:26px"></i></span></span>' +
    '<span class="t">' + t("loadMore") + '</span>' +
    '<span class="s"><span>' + t("rowMoreSub") + '</span></span>';
  b.addEventListener("click", function(e){ e.stopPropagation(); loadMoreRow(def.key); });
  el.appendChild(b);
  icons();
}
function loadMoreRow(key){
  var def = null;
  ROW_DEFS.forEach(function(d){ if (d.key === key) def = d; });
  var st = def && rowState[key];
  if (!def || !st || !st.live || st.busy || st.page >= st.totalPages) return;
  st.busy = true; syncMoreTile(def);
  fetchRowPage(def, st.page + 1).then(function(r){
    st.busy = false;
    st.page += 1;
    st.totalPages = r.totalPages || st.totalPages;
    var fresh = freshRowItems(def, r.list);
    register(fresh);
    var el = $(def.el);
    if (el && fresh.length) el.insertAdjacentHTML("beforeend", fresh.map(cardHTML).join(""));
    syncMoreTile(def);
    icons();
  }).catch(function(){ st.busy = false; syncMoreTile(def); });
}
function loadHome(){
  homeKidsRendered = isKids();
  loadKidsRows();
  loadTop10();
  ROW_DEFS.forEach(function(def){
    rowState[def.key] = { seen:{}, page:0, totalPages:1, live:false, busy:false };
    skeletons(def.el, 8);
  });
  var liveCount = 0;
  var jobs = ROW_DEFS.map(function(def){
    var st = rowState[def.key];
    var reqs = [];
    for (var p = 1; p <= ROW_PAGES; p++) reqs.push(fetchRowPage(def, p));
    return Promise.all(reqs.map(function(r){
      return r.then(function(v){ return { ok:true, v:v }; }, function(){ return { ok:false, v:null }; });
    })).then(function(res){
      var ok = res.filter(function(r){ return r.ok; });
      var el = $(def.el);
      if (!ok.length) {
        var fb = freshRowItems(def, FALLBACK[def.key]);
        register(fb);
        el.innerHTML = fb.map(cardHTML).join("");
        icons();
        return FALLBACK[def.key];
      }
      liveCount++;
      st.live = true;
      var all = [];
      ok.forEach(function(r, i){
        st.page = Math.max(st.page, i + 1);
        st.totalPages = Math.max(st.totalPages, r.v.totalPages || 1);
        all = all.concat(r.v.list);
      });
      var fresh = freshRowItems(def, all);
      register(fresh);
      el.innerHTML = fresh.map(cardHTML).join("");
      syncMoreTile(def);
      icons();
      return all;
    });
  });
  Promise.all(jobs).then(function(res){
    var trendPool = kidsFilter(res[0]);
    heroItems = trendPool.filter(function(it){ return it.backdrop_path && it.overview; }).slice(0, 5);
    if (!heroItems.length) heroItems = trendPool.filter(function(it){ return it.backdrop_path; }).slice(0, 5);
    heroIdx = 0;
    if (heroItems.length) { setHero(heroItems[0]); restartHeroTimer(); }
    var viaProxy = route && route !== "direct";
    if (liveCount === ROW_DEFS.length) setStatus(true, viaProxy ? "statusProxy" : "statusLive");
    else if (liveCount > 0) setStatus(true, viaProxy ? "statusProxyPartial" : "statusLivePartial");
    else setStatus(false, "statusOffline");
  });
}
function doSearch(q){
  q = (q || "").trim();
  if (!q) { showBrowse(); return; }
  showAlt(t("resultsFor", q), [], "<strong>" + t("searchingTMDB") + "</strong>");
  fetchJSON("/search/multi", "&query=" + encodeURIComponent(q) + "&include_adult=false")
    .then(function(d){
      var people = (d.results || []).filter(function(x){ return x.media_type === "person"; });
      var list = kidsFilter((d.results || []).filter(function(x){
        return (x.media_type === "movie" || x.media_type === "tv") && x.poster_path;
      }));
      showAlt(t("resultsFor", q), list, t("noMatchHTML", esc(q)));
      setAltPeople(isKids() ? null : people);
    })
    .catch(function(){
      var ql = q.toLowerCase();
      var local = kidsFilter(Object.keys(store).map(function(k){ return store[k]; })
        .filter(function(it){ return titleOf(it).toLowerCase().indexOf(ql) !== -1; }));
      showAlt(t("resultsFor", q) + t("resultsOfflineSuffix"), local, t("noMatchOffline"));
      setAltPeople(isKids() ? null : FALLBACK_PEOPLE.filter(function(p){
        return p.name.toLowerCase().indexOf(ql) !== -1;
      }));
    });
}

/* ---------------- Surprise Me ----------------
   Picks a random title from the current catalog pool — everything
   already in the store (live rows, search results, My List, history)
   plus the built-in snapshot — preferring titles rated 6.5 or above
   when any are available. On a Kids profile the pool is filtered to
   kids-safe titles first (Animation / Family), same as every other
   surface. The pick opens straight in the detail modal, and the
   modal's own Surprise button re-rolls, excluding the title that is
   currently open so a re-roll lands on something different. */
function catalogPool(){
  var seen = {}, pool = [];
  function add(it){
    if (!it || !it.id) return;
    var k = keyOf(it);
    if (seen[k]) return;
    seen[k] = 1; pool.push(it);
  }
  snapshotPool().forEach(add);
  Object.keys(store).forEach(function(k){ add(store[k]); });
  return pool;
}
function surprisePool(excludeKey){
  var pool = kidsFilter(catalogPool()).filter(function(it){
    return it && it.poster_path && keyOf(it) !== excludeKey;
  });
  var rated = pool.filter(function(it){ return (it.vote_average || 0) >= 6.5; });
  return rated.length ? rated : pool;
}
function pickSurprise(excludeKey){
  var pool = surprisePool(excludeKey);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
function openSurprise(){
  var exclude = currentItem ? keyOf(currentItem) : null;
  var it = pickSurprise(exclude) || pickSurprise(null);
  if (!it) return;
  hideSuggest();
  if (typeof hideHoverPreview === "function") hideHoverPreview(true);
  openModal(it, false);
  var ov = $("overlay"); if (ov) ov.scrollTop = 0;
}

/* ---------------- Search suggestions ----------------
   Typing in the header search box (debounced ~300ms) opens a
   dropdown of up to 8 matches: poster thumbnail, title, year,
   Movie/TV badge and rating. Live mode queries TMDB /search/multi
   through fetchJSON, so the existing direct -> CORS-proxy route
   fallback applies unchanged; when TMDB is unreachable the same
   query is filtered over the local catalog (store + snapshot).
   Kids profiles only ever see kids-safe suggestions. Clicking a
   suggestion (or arrowing to it and pressing Enter) opens that
   title's detail modal; pressing Enter with no suggestion
   highlighted keeps the original behaviour — the full search
   results page via the form submit. Esc closes the dropdown. */
var suggestItems = [], suggestIndex = -1, suggestSeq = 0, suggestTimer = null;
function hideSuggest(){
  var dd = $("searchSuggest"); if (dd) dd.hidden = true;
  suggestItems = []; suggestIndex = -1;
  var inp = $("searchInput"); if (inp) inp.setAttribute("aria-expanded", "false");
}
function localSuggest(q){
  var ql = q.toLowerCase();
  return kidsFilter(catalogPool()).filter(function(it){
    return it && it.poster_path && titleOf(it).toLowerCase().indexOf(ql) !== -1;
  }).sort(function(a, b){
    return (b.vote_average || 0) - (a.vote_average || 0) || (b.popularity || 0) - (a.popularity || 0);
  });
}
function renderSuggest(list){
  var dd = $("searchSuggest"); if (!dd) return;
  suggestItems = (list || []).slice(0, 8);
  suggestIndex = -1;
  if (!suggestItems.length) {
    dd.innerHTML = '<div class="suggest-empty">' + esc(t("suggestNoMatch")) + '</div>';
  } else {
    dd.innerHTML = suggestItems.map(function(it, i){
      var poster = it.poster_path ? imgSrc(IMG + "w185" + it.poster_path) : "";
      var img = poster ? '<img loading="lazy" src="' + poster + '" alt="" onerror="this.style.display=\'none\'">' : "";
      var isTV = typeOf(it) === "tv";
      return '<button type="button" class="suggest-item" role="option" id="suggest-' + i + '" data-suggest="' + i + '" aria-selected="false">' +
        '<span class="suggest-poster">' + img + '</span>' +
        '<span class="suggest-main"><span class="suggest-title">' + esc(titleOf(it)) + '</span>' +
        '<span class="suggest-meta">' + (yearOf(it) ? '<span>' + yearOf(it) + '</span>' : "") +
        '<span class="suggest-badge' + (isTV ? " tv" : "") + '">' + (isTV ? t("seriesBadge") : t("filmBadge")) + '</span>' +
        (it.vote_average ? '<span class="suggest-rate"><i data-lucide="star"></i>' + Number(it.vote_average).toFixed(1) + '</span>' : "") +
        '</span></span></button>';
    }).join("");
    dd.querySelectorAll("[data-suggest]").forEach(function(b){
      b.addEventListener("mousedown", function(e){ e.preventDefault(); });
      b.addEventListener("click", function(){
        var it = suggestItems[Number(b.getAttribute("data-suggest"))];
        if (it) { hideSuggest(); openModal(it, false); }
      });
      b.addEventListener("mouseenter", function(){ setSuggestIndex(Number(b.getAttribute("data-suggest"))); });
    });
  }
  dd.hidden = false;
  var inp = $("searchInput"); if (inp) inp.setAttribute("aria-expanded", "true");
  icons();
}
function setSuggestIndex(i){
  suggestIndex = i;
  var dd = $("searchSuggest"); if (!dd) return;
  dd.querySelectorAll("[data-suggest]").forEach(function(b){
    var on = Number(b.getAttribute("data-suggest")) === i;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", on ? "true" : "false");
    if (on) b.scrollIntoView({ block: "nearest" });
  });
  var inp = $("searchInput");
  if (inp) {
    if (i >= 0) inp.setAttribute("aria-activedescendant", "suggest-" + i);
    else inp.removeAttribute("aria-activedescendant");
  }
}
function fetchSuggest(q){
  var seq = ++suggestSeq;
  fetchJSON("/search/multi", "&query=" + encodeURIComponent(q) + "&include_adult=false")
    .then(function(d){
      if (seq !== suggestSeq) return;
      var list = kidsFilter((d.results || []).filter(function(x){
        return (x.media_type === "movie" || x.media_type === "tv") && x.poster_path;
      }));
      renderSuggest(list.length ? list : localSuggest(q));
    })
    .catch(function(){
      if (seq !== suggestSeq) return;
      renderSuggest(localSuggest(q));
    });
}
function scheduleSuggest(){
  var inp = $("searchInput"); if (!inp) return;
  var q = inp.value.trim();
  if (suggestTimer) clearTimeout(suggestTimer);
  if (q.length < 2) { suggestSeq++; hideSuggest(); return; }
  suggestTimer = setTimeout(function(){ fetchSuggest(q); }, 300);
}
(function initSuggest(){
  var inp = $("searchInput"); if (!inp) return;
  inp.addEventListener("input", scheduleSuggest);
  inp.addEventListener("focus", function(){
    if (inp.value.trim().length >= 2 && !suggestItems.length) scheduleSuggest();
  });
  inp.addEventListener("keydown", function(e){
    var dd = $("searchSuggest");
    var open = dd && !dd.hidden && suggestItems.length;
    if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      setSuggestIndex(Math.min(suggestIndex + 1, suggestItems.length - 1));
    } else if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      setSuggestIndex(Math.max(suggestIndex - 1, 0));
    } else if (e.key === "Enter" && open && suggestIndex >= 0 && suggestItems[suggestIndex]) {
      e.preventDefault();
      var it = suggestItems[suggestIndex];
      hideSuggest();
      openModal(it, false);
    } else if (e.key === "Escape" && dd && !dd.hidden) {
      e.preventDefault(); e.stopPropagation();
      hideSuggest();
    }
  });
  document.addEventListener("click", function(e){
    var form = $("searchForm");
    if (form && !form.contains(e.target)) hideSuggest();
  });
})();
(function initSurprise(){
  var hb = $("surpriseBtn"); if (hb) hb.addEventListener("click", openSurprise);
  var hero = $("heroSurprise"); if (hero) hero.addEventListener("click", openSurprise);
  var mb = $("modalSurprise"); if (mb) mb.addEventListener("click", openSurprise);
})();

/* ---------------- Filters: type / genre / country / year ----------------
   Live mode queries TMDB's /discover endpoints (with_genres +
   with_origin_country + release-year params, popularity order, paged
   via "Load more"). If TMDB is unreachable, the same filters run
   client-side over the built-in snapshot pool, so filtering never
   opens empty offline. */
var FILTER_GENRES = [
  { name:"Action",          nameMy:"အက်ရှင်",          movie:28,    tv:10759 },
  { name:"Adventure",       nameMy:"စွန့်စားခန်း",       movie:12,    tv:10759 },
  { name:"Animation",       nameMy:"ကာတွန်း",       movie:16,    tv:16 },
  { name:"Comedy",          nameMy:"ဟာသ",          movie:35,    tv:35 },
  { name:"Crime",           nameMy:"မှုခင်း",           movie:80,    tv:80 },
  { name:"Documentary",     nameMy:"မှတ်တမ်းရုပ်ရှင်",     movie:99,    tv:99 },
  { name:"Drama",           nameMy:"ဒရာမာ",           movie:18,    tv:18 },
  { name:"Family",          nameMy:"မိသားစု",          movie:10751, tv:10751 },
  { name:"Fantasy",         nameMy:"စိတ်ကူးယဉ်",         movie:14,    tv:10765 },
  { name:"History",         nameMy:"သမိုင်း",         movie:36,    tv:null },
  { name:"Horror",          nameMy:"ထိတ်လန့်ဖွယ်",          movie:27,    tv:9648 },
  { name:"Kids",            nameMy:"ကလေးများ",            movie:null,  tv:10762 },
  { name:"Music",           nameMy:"ဂီတ",           movie:10402, tv:null },
  { name:"Mystery",         nameMy:"လျှို့ဝှက်ဆန်းကြယ်",         movie:9648,  tv:9648 },
  { name:"Reality",         nameMy:"ရီယယ်လတီ",         movie:null,  tv:10764 },
  { name:"Romance",         nameMy:"အချစ်",         movie:10749, tv:10766 },
  { name:"Science Fiction", nameMy:"သိပ္ပံစိတ်ကူးယဉ်", movie:878,   tv:10765 },
  { name:"Talk",            nameMy:"စကားဝိုင်း",            movie:null,  tv:10767 },
  { name:"Thriller",        nameMy:"စိတ်လှုပ်ရှားဖွယ်",        movie:53,    tv:null },
  { name:"War",             nameMy:"စစ်",             movie:10752, tv:10768 },
  { name:"Western",         nameMy:"အနောက်တိုင်း",         movie:37,    tv:37 }
];
/* Country filter options: value is an ISO code, or "WEST" for the
   Western grouping (US / UK / Canada / Australia), which TMDB's
   with_origin_country accepts as a pipe-separated OR list. */
var COUNTRY_LABELS = { WEST:"Western", KR:"South Korea", IN:"India", CN:"China",
  JP:"Japan", TH:"Thailand", US:"United States", GB:"United Kingdom", FR:"France",
  DE:"Germany", ES:"Spain", IT:"Italy", CA:"Canada", AU:"Australia", BR:"Brazil",
  MX:"Mexico", PH:"Philippines", ID:"Indonesia", TW:"Taiwan", HK:"Hong Kong" };
var COUNTRY_GROUPS = { WEST: ["US","GB","CA","AU"] };
function countryCodes(){
  if (!fCountry) return null;
  return COUNTRY_GROUPS[fCountry] || [fCountry];
}
var fType = "all", fGenreIdx = -1, fCountry = "", fYear = "";
var filterBusy = false, filterLocalMode = false, filterShown = 0;
var filterSeen = {};     /* keyOf -> 1, dedupes titles across discover pages */
var filterPaging = null; /* {movie:{next,total}, tv:{next,total}} while live paging */

function activeGenre(){ return fGenreIdx >= 0 ? FILTER_GENRES[fGenreIdx] : null; }
function filtersActive(){ return fType !== "all" || fGenreIdx >= 0 || !!fCountry || !!fYear; }
function filterTitleText(){
  var parts = [];
  var g = activeGenre(); if (g) parts.push(genreLabel(g));
  if (fCountry) parts.push(LANG === "my" ? countryLabel(fCountry) : (COUNTRY_LABELS[fCountry] || fCountry));
  parts.push(fType === "movie" ? t("typeMovie") : fType === "tv" ? t("typeTV") : t("typeAll"));
  if (fYear) parts.push(fYear);
  return parts.join(" · ");
}
function buildGenreOptions(){
  var sel = $("genreSel");
  sel.innerHTML = '<option value="">' + t("allGenres") + '</option>';
  FILTER_GENRES.forEach(function(g, i){
    if (fType === "movie" && g.movie == null) return;
    if (fType === "tv" && g.tv == null) return;
    var o = document.createElement("option");
    o.value = String(i); o.textContent = genreLabel(g);
    sel.appendChild(o);
  });
  sel.value = fGenreIdx >= 0 ? String(fGenreIdx) : "";
  if (sel.value === "" && fGenreIdx >= 0) fGenreIdx = -1; /* genre not offered for this type */
}
function buildYearOptions(){
  var sel = $("yearSel");
  var now = new Date().getFullYear();
  for (var y = now + 1; y >= 1970; y--){
    var o = document.createElement("option");
    o.value = String(y); o.textContent = String(y);
    sel.appendChild(o);
  }
}
function syncFilterVisibility(){
  var on = filtersActive();
  $("filterView").style.display = on ? "block" : "none";
  $("rowsWrap").style.display = on ? "none" : "";
  $("hero").style.display = on ? "none" : "flex";
  $("clearFilters").classList.toggle("show", on);
  if (!on) $("filterMsg").textContent = "";
}
function resetFilters(){
  fType = "all"; fGenreIdx = -1; fCountry = ""; fYear = "";
  $("typeSel").value = "all";
  buildGenreOptions();
  $("countrySel").value = "";
  $("yearSel").value = "";
  syncFilterVisibility();
}
function applyFilters(){
  syncFilterVisibility();
  if (!filtersActive()) return;
  filterShown = 0; filterLocalMode = false; filterSeen = {}; filterPaging = null;
  $("filterTitle").textContent = filterTitleText();
  $("filterGrid").innerHTML = "";
  $("filterEmpty").style.display = "none";
  $("filterCount").textContent = t("filterLoading");
  $("filterMsg").textContent = "";
  $("loadMoreWrap").style.display = "none";
  loadFilterPage();
}
function discoverFor(type, page){
  var g = activeGenre();
  var gid = g ? (type === "movie" ? g.movie : g.tv) : null;
  if (g && gid == null) return Promise.resolve({ list: [], totalPages: 0 });
  var params = "&page=" + page + "&sort_by=popularity.desc&include_adult=false&vote_count.gte=10";
  if (gid) params += "&with_genres=" + gid;
  else if (isKids()) params += "&with_genres=16|10751";
  var cc = countryCodes();
  if (cc) params += "&with_origin_country=" + cc.join("|");
  if (fYear) params += (type === "movie" ? "&primary_release_year=" : "&first_air_date_year=") + fYear;
  return fetchJSON("/discover/" + type, params).then(function(d){
    return {
      list: (d.results || []).map(function(x){ x.media_type = type; return x; }),
      totalPages: d.total_pages != null ? d.total_pages : page
    };
  });
}
function filterHasMore(){
  if (!filterPaging) return false;
  var m = fType !== "tv" && filterPaging.movie.next <= filterPaging.movie.total;
  var v = fType !== "movie" && filterPaging.tv.next <= filterPaging.tv.total;
  return !!(m || v);
}
function loadFilterPage(){
  if (filterBusy) return;
  filterBusy = true;
  var first = !filterPaging;
  if (first) filterPaging = { movie: { next: 1, total: 1 }, tv: { next: 1, total: 1 } };
  var jobs = [];
  if (fType !== "tv") jobs.push({ type: "movie", p: discoverFor("movie", filterPaging.movie.next) });
  if (fType !== "movie") jobs.push({ type: "tv", p: discoverFor("tv", filterPaging.tv.next) });
  Promise.all(jobs.map(function(j){
    return j.p.then(function(r){ return { ok:true, type:j.type, r:r }; },
                    function(){ return { ok:false, type:j.type, r:null }; });
  })).then(function(res){
    filterBusy = false;
    if (!res.some(function(r){ return r.ok; })) {
      if (first) {
        /* Offline: filter the built-in snapshot pool client-side */
        filterLocalMode = true;
        filterPaging = null;
        renderFilterResults(filterLocal(snapshotPool()), true, true);
        $("filterMsg").textContent = t("filterOfflineMsg");
      }
      return;
    }
    var merged = [];
    res.forEach(function(r){
      if (!r.ok || !r.r) return;
      var pg = filterPaging[r.type];
      pg.total = r.r.totalPages;
      pg.next += 1;
      merged = merged.concat(r.r.list);
    });
    merged.sort(function(a, b){ return (b.popularity || 0) - (a.popularity || 0); });
    renderFilterResults(merged, false, first);
  });
}
function renderFilterResults(list, local, first){
  register(list);
  var clean = (list || []).filter(function(it){
    if (!it || !it.poster_path) return false;
    if (isKids() && !isKidsSafe(it)) return false;
    var k = keyOf(it);
    if (filterSeen[k]) return false;
    filterSeen[k] = 1;
    return true;
  });
  var grid = $("filterGrid");
  if (first) grid.innerHTML = "";
  if (clean.length) grid.insertAdjacentHTML("beforeend", clean.map(cardHTML).join(""));
  filterShown += clean.length;
  icons();
  var e = $("filterEmpty");
  if (!filterShown) {
    e.style.display = "block";
    e.innerHTML = t("filterEmpty");
    $("filterCount").textContent = titlesCount(0);
  } else {
    e.style.display = "none";
    $("filterCount").textContent = titlesCount(filterShown) +
      (local ? t("filterSuffixLocal") : t("filterSuffixLive"));
  }
  /* Keep paging until every requested type has served its last TMDB
     page — not just while a page happens to return many titles. */
  $("loadMoreWrap").style.display = (!local && filterHasMore()) ? "flex" : "none";
}
function snapshotPool(){
  var seen = {}, pool = [];
  ["trending", "movies", "tv", "top", "now"].forEach(function(k){
    (FALLBACK[k] || []).forEach(function(it){
      var key = keyOf(it);
      if (!seen[key]) { seen[key] = 1; pool.push(it); }
    });
  });
  return pool;
}
function filterLocal(list){
  var g = activeGenre();
  var cc = countryCodes();
  return (list || []).filter(function(it){
    if (isKids() && !isKidsSafe(it)) return false;
    if (fType !== "all" && typeOf(it) !== fType) return false;
    if (fYear && yearOf(it) !== String(fYear)) return false;
    if (cc) {
      var mine = countryOf(it);
      if (!cc.some(function(c){ return mine.indexOf(c) !== -1; })) return false;
    }
    if (g) {
      var gid = typeOf(it) === "movie" ? g.movie : g.tv;
      if (gid == null) return false;
      if ((it.genre_ids || []).indexOf(gid) === -1) return false;
    }
    return !!it.poster_path;
  }).sort(function(a, b){ return (b.vote_average || 0) - (a.vote_average || 0); });
}

/* ---------------- Wiring ---------------- */
document.addEventListener("click", function(e){
  var star = e.target.closest ? e.target.closest(".star") : null;
  if (star) { openPerson(Number(star.getAttribute("data-person"))); return; }
  var t10 = e.target.closest ? e.target.closest(".top10-item") : null;
  if (t10) { var tit = store[t10.getAttribute("data-key")]; if (tit) openModal(tit, false); return; }
  var card = e.target.closest ? e.target.closest(".card") : null;
  if (card) {
    if (card.hasAttribute("data-hist")) { resumeFromHistory(card.getAttribute("data-key")); return; }
    var it = store[card.getAttribute("data-key")]; if (it) openModal(it, false); return;
  }
  var chev = e.target.closest ? e.target.closest(".chev") : null;
  if (chev) {
    var sc = chev.parentElement.querySelector(".scroller");
    if (sc) sc.scrollBy({ left: Number(chev.getAttribute("data-scroll")) * sc.clientWidth * 0.85, behavior: "smooth" });
  }
});
document.querySelectorAll(".nav-links button").forEach(function(b){
  b.addEventListener("click", function(){
    var n = b.getAttribute("data-nav");
    if (n !== "mylist") resetFilters();
    if (n === "home") { showBrowse(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else if (n === "mylist") { showMyList(); }
    else {
      showBrowse(); setActiveNav(n);
      document.querySelectorAll("[data-row]").forEach(function(s){
        s.style.display = (s.getAttribute("data-row") === n || s.getAttribute("data-row") === "trending" && n === "home") ? "" :
          (s.getAttribute("data-row") === n ? "" : "none");
        if (n === "movie" || n === "tv") s.style.display = (s.getAttribute("data-row") === n) ? "" : "none";
      });
      document.getElementById("browse").scrollIntoView({ behavior: "smooth" });
    }
    applyProfileLayout();
  });
});
$("logoHome").addEventListener("click", function(e){ e.preventDefault(); resetFilters(); showBrowse(); window.scrollTo({ top: 0, behavior: "smooth" }); });
$("typeSel").addEventListener("change", function(){ fType = this.value; buildGenreOptions(); applyFilters(); });
$("genreSel").addEventListener("change", function(){ fGenreIdx = this.value === "" ? -1 : Number(this.value); applyFilters(); });
$("countrySel").addEventListener("change", function(){ fCountry = this.value; applyFilters(); });
$("yearSel").addEventListener("change", function(){ fYear = this.value; applyFilters(); });
$("clearFilters").addEventListener("click", function(){ resetFilters(); applyFilters(); });
$("loadMoreBtn").addEventListener("click", function(){ if (!filterBusy && !filterLocalMode) loadFilterPage(); });
$("altClose").addEventListener("click", showBrowse);
$("searchForm").addEventListener("submit", function(e){ e.preventDefault(); hideSuggest(); doSearch($("searchInput").value); });
$("clearHistory").addEventListener("click", clearHistory);
$("retryLive").addEventListener("click", retryLive);
$("starSearchForm").addEventListener("submit", function(e){ e.preventDefault(); doPersonSearch($("starSearchInput").value); });
var starSearchDebounce = null;
$("starSearchInput").addEventListener("input", function(){
  clearTimeout(starSearchDebounce);
  var v = this.value;
  starSearchDebounce = setTimeout(function(){ if (v.trim().length >= 3) doPersonSearch(v); }, 550);
});
$("langEn").addEventListener("click", function(){ setLang("en"); });
$("langMy").addEventListener("click", function(){ setLang("my"); });
$("modalTrailer").addEventListener("click", function(){ startTrailer(); });
$("trailerBack").addEventListener("click", function(){ stopTrailerToPlayer(); });
$("modalClose").addEventListener("click", closeModal);
$("srcNext").addEventListener("click", cycleSource);
$("fsBtn").addEventListener("click", toggleFullscreen);
$("epPrev").addEventListener("click", function(){ goEpisode(-1); });
$("epNext").addEventListener("click", function(){ goEpisode(1); });
$("seasonSel").addEventListener("change", function(){
  epSeason = Math.max(0, parseInt(this.value, 10) || 1);
  epEpisode = 1;
  if (currentItem) {
    updateSourceUI(currentItem);
    loadEpisodes(currentItem, epSeason);
    var f = $("playerFrame");
    if (f) { f.src = embedUrl(currentItem); recordHistory(currentItem); }
  }
});
$("overlay").addEventListener("click", function(e){ if (e.target === $("overlay")) closeModal(); });
document.addEventListener("keydown", function(e){
  if (e.key !== "Escape") return;
  var gate = $("profileGate");
  if (gate && gate.style.display !== "none") { if (gateCanClose) closeGate(); return; }
  hideProfileMenu();
  closeModal();
});
$("bellBtn").addEventListener("click", function(){
  this.innerHTML = '<i data-lucide="bell-ring" style="width:20px;height:20px"></i>'; icons();
  setStatus(true, "bellMsg");
});
window.addEventListener("scroll", function(){
  $("topnav").classList.toggle("scrolled", window.scrollY > 24);
}, { passive: true });

applyI18n();
buildYearOptions();
buildGenreOptions();
icons();
renderHistory();
renderPeopleRow(FALLBACK_PEOPLE);
loadPeople();
loadHome();
initProfileUI();
