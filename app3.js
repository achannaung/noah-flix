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
document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeModal(); });
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
