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
$("searchForm").addEventListener("submit", function(e){ e.preventDefault(); doSearch($("searchInput").value); });
var searchDebounce = null;
$("searchInput").addEventListener("input", function(){
  clearTimeout(searchDebounce);
  var v = this.value;
  searchDebounce = setTimeout(function(){ if (v.trim().length >= 3) doSearch(v); }, 550);
});
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
