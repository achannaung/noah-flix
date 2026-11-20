
/* =====================================================================
   NOAH-FLIX — TMDB fetch + VidSrc player
   Data flow: browser -> TMDB API (live) -> rows/hero. If the direct
   api.themoviedb.org route is blocked on the viewer's network, the
   same requests retry through public CORS proxies (see "Connection
   routes" below) and images follow the winning route. If every route
   fails (offline / sandbox), a real TMDB snapshot
   fetched on 20 Oct 2026 renders instead, so the page never opens empty.
   Swap TMDB_API_KEY for your own free key from themoviedb.org.
===================================================================== */
var TMDB_API_KEY = "04c35731a5ee918f014970082a0088b1"; /* public demo key */
var API = "https://api.themoviedb.org/3";
var IMG = "https://image.tmdb.org/t/p/";
var POSTER = IMG + "w500", BACKDROP = IMG + "original", BACKDROP_SM = IMG + "w1280", PROFILE = IMG + "w185";

/* ---------------- Connection routes (direct -> CORS proxies) ----------------
   Every TMDB request tries the direct api.themoviedb.org URL first.
   If the viewer's network blocks it (network error or timeout), the
   same request is retried through public CORS proxies in order. The
   first route that answers is cached in sessionStorage, so later
   requests go straight through it. While a proxy route is active,
   TMDB images are loaded through the same proxy (see imgSrc). The
   built-in snapshot remains the final fallback when every route fails. */
var ROUTE_KEY = "noahflix.route";
var ROUTE_IDS = ["direct", "corsproxy", "allorigins"];
var route = "";
try {
  var savedRoute = sessionStorage.getItem(ROUTE_KEY);
  if (savedRoute && ROUTE_IDS.indexOf(savedRoute) !== -1) route = savedRoute;
} catch (e) {}
function routeWrap(id, url){
  if (id === "corsproxy") return "https://corsproxy.io/?url=" + encodeURIComponent(url);
  if (id === "allorigins") return "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
  return url;
}
function routeOrder(){
  var ids = ROUTE_IDS.slice();
  if (route && ids.indexOf(route) !== -1) {
    ids.splice(ids.indexOf(route), 1);
    ids.unshift(route);
  }
  return ids;
}
function proxied(url){
  return route && route !== "direct" ? routeWrap(route, url) : url;
}
function imgSrc(directUrl){ return directUrl ? proxied(directUrl) : directUrl; }
function setRoute(id){
  if (route === id) return;
  route = id;
  try {
    if (id) sessionStorage.setItem(ROUTE_KEY, id);
    else sessionStorage.removeItem(ROUTE_KEY);
  } catch (e) {}
  if (id && id !== "direct") rewriteImages();
}
/* Images rendered before the route was known (snapshot stars row,
   watch history) still point at image.tmdb.org directly — rewrite
   them through the active proxy so they load on a blocking network. */
function rewriteImages(){
  if (!route || route === "direct") return;
  document.querySelectorAll("img").forEach(function(img){
    var s = img.getAttribute("src") || "";
    if (s.indexOf(IMG) === 0) img.src = proxied(s);
  });
  ["heroBgA", "heroBgB"].forEach(function(id){
    var el = document.getElementById(id);
    if (!el) return;
    var m = (el.style.backgroundImage || "").match(/url\(["']?(https:\/\/image\.tmdb\.org[^"')]+)["']?\)/);
    if (m) el.style.backgroundImage = 'url("' + proxied(m[1]) + '")';
  });
}
function fetchWithTimeout(url, ms){
  return new Promise(function(resolve, reject){
    var ctrl = ("AbortController" in window) ? new AbortController() : null;
    var done = false;
    var timer = setTimeout(function(){
      if (done) return; done = true;
      if (ctrl) { try { ctrl.abort(); } catch (e) {} }
      reject(new Error("timeout"));
    }, ms);
    fetch(url, ctrl ? { signal: ctrl.signal } : {}).then(function(r){
      if (done) return; done = true; clearTimeout(timer); resolve(r);
    }, function(err){
      if (done) return; done = true; clearTimeout(timer); reject(err);
    });
  });
}

var GENRES = {28:"Action",12:"Adventure",16:"Animation",35:"Comedy",80:"Crime",99:"Documentary",
18:"Drama",10751:"Family",14:"Fantasy",36:"History",27:"Horror",10402:"Music",9648:"Mystery",
10749:"Romance",878:"Science Fiction",10770:"TV Movie",53:"Thriller",10752:"War",37:"Western",
10759:"Action & Adventure",10762:"Kids",10763:"News",10764:"Reality",10765:"Sci-Fi & Fantasy",
10766:"Soap",10767:"Talk",10768:"War & Politics"};
var GENRES_MY = {28:"အက်ရှင်",12:"စွန့်စားခန်း",16:"ကာတွန်း",35:"ဟာသ",80:"မှုခင်း",99:"မှတ်တမ်းရုပ်ရှင်",
18:"ဒရာမာ",10751:"မိသားစု",14:"စိတ်ကူးယဉ်",36:"သမိုင်း",27:"ထိတ်လန့်ဖွယ်",10402:"ဂီတ",9648:"လျှို့ဝှက်ဆန်းကြယ်",
10749:"အချစ်",878:"သိပ္ပံစိတ်ကူးယဉ်",10770:"TV ရုပ်ရှင်",53:"စိတ်လှုပ်ရှားဖွယ်",10752:"စစ်",37:"အနောက်တိုင်း",
10759:"အက်ရှင်နှင့် စွန့်စားခန်း",10762:"ကလေးများ",10763:"သတင်း",10764:"ရီယယ်လတီ",10765:"သိပ္ပံစိတ်ကူးယဉ်နှင့် စိတ်ကူးယဉ်",
10766:"ဇာတ်လမ်းတွဲ",10767:"စကားဝိုင်း",10768:"စစ်နှင့် နိုင်ငံရေး"};

/* ---------------- UI language (EN / မြန်မာ) ----------------
   The toggle in the header switches every UI string through the STR
   dictionaries below (static HTML carries data-i18n attributes;
   JS-rendered text calls t()). The choice is remembered in
   localStorage. When Burmese is active, TMDB is also queried with
   language=my-MM, so titles, overviews, genre and episode names come
   back in Burmese wherever TMDB has a translation and fall back to
   English where it does not. Default is English. */
var LANG_KEY = "noahflix.lang";
var LANG = "en";
try { if (localStorage.getItem(LANG_KEY) === "my") LANG = "my"; } catch (e) {}
var STR = {
en: {
  docTitle: "Noah-Flix — Stream Movies & TV Shows",
  navHome: "Home", navTV: "TV Shows", navMovies: "Movies", navMyList: "My List",
  notifications: "Notifications", profile: "Profile",
  whosWatching: "Who's watching?", manageProfiles: "Manage Profiles", done: "Done",
  addProfile: "Add Profile", editProfile: "Edit Profile", profileName: "Name",
  kidsProfileLabel: "Kids profile", kidsProfileHint: "Only kid-friendly titles — Animation & Family genres",
  kidsBadge: "KIDS", deleteProfile: "Delete Profile", saveProfile: "Save", cancel: "Cancel",
  kidsMovies: "Kids Movies", kidsTV: "Kids TV Shows", animationRow: "Animation",
  familyRow: "Family Movies & Shows", kidsRowNote: "Animation & Family",
  navAria: "Browse", filterAria: "Filter titles", heroAria: "Featured title",
  searchPlaceholder: "Titles, people, genres", searchAria: "Search titles",
  browseBy: "Browse by", fType: "Type", fGenre: "Genre", fCountry: "Country", fYear: "Year",
  typeAll: "Movies & TV Shows", typeMovie: "Movies", typeTV: "TV Shows",
  allGenres: "All genres", allCountries: "All countries",
  cWEST: "Western (US · UK · CA · AU)", cKR: "South Korea", cIN: "India", cCN: "China",
  cJP: "Japan", cTH: "Thailand", cUS: "United States", cGB: "United Kingdom", cFR: "France",
  cDE: "Germany", cES: "Spain", cIT: "Italy", cCA: "Canada", cAU: "Australia", cBR: "Brazil",
  cMX: "Mexico", cPH: "Philippines", cID: "Indonesia", cTW: "Taiwan", cHK: "Hong Kong",
  anyYear: "Any year", clearFilters: "Clear filters",
  play: "Play", moreInfo: "More Info", myList: "My List", inMyList: "In My List",
  kickerFilm: "Film · Featured today", kickerSeries: "Series · Featured today",
  loadingFeatured: "Loading featured title…",
  heroLoadingOverview: "Fetching the latest trending movies and shows from TMDB.",
  heroNoOverview: "Overview not available for this title yet — open More Info or press Play to start watching.",
  tvSeries: "TV Series", movieWord: "Movie", matchSuffix: "% Match",
  statusLine: "Posters & metadata: TMDB · Player: switchable iframe sources with fallbacks",
  continueWatching: "Continue Watching", clearHistory: "Clear history",
  popularStars: "Popular Stars", starsNote: "Actors & actresses",
  searchPeoplePh: "Search actors…", searchPeopleAria: "Search people",
  peopleHead: "People", peopleFor: "People matching “{x}”",
  searchingPeople: "Searching people…",
  peopleNoMatch: "<strong>No people matched “{x}”.</strong><br>Check the spelling, or try the full name.",
  personOffline: "<strong>TMDB is unreachable here — showing this star's best-known titles from the built-in snapshot.</strong>",
  personNoTitles: "<strong>No movies or TV shows found for this person yet.</strong>",
  bornLabel: "Born",
  trendingNow: "Trending Now", trendingNote: "TMDB · this week",
  top10Today: "Top 10 Today", top10Note: "TMDB · trending today", top10OfflineNote: "Built-in snapshot · 20 Oct 2026",
  trailer: "Trailer", backToPlayer: "Back to Player", moreLikeThis: "More Like This",
  popularMovies: "Popular Movies", popularTV: "Popular TV Shows",
  topRated: "Top Rated Movies", nowPlaying: "Now Playing in Theatres",
  scrollLeft: "Scroll left", scrollRight: "Scroll right",
  filteredTitles: "Filtered titles", loadMore: "Load more", backToBrowse: "Back to browse",
  closeAria: "Close", dialogLabel: "Title details and player",
  source: "Source", season: "Season", tryNextSource: "Try next source",
  fullscreen: "Fullscreen", prevEpisode: "Prev Episode", nextEpisode: "Next Episode",
  srcHint: "The same title is carried by several streaming hosts. If the selected source is blocked, blank, or shows an error, switch to another one — the player reloads in place, no need to reopen the title.",
  episodes: "Episodes", loadingEpisodes: "Loading episodes…",
  seasonN: "Season {x}", episodeN: "Episode {x}", epOfflineSuffix: " · titles unavailable offline",
  watched: "Watched", seriesBadge: "SERIES", filmBadge: "FILM", posterSuffix: " poster",
  justNow: "just now", minsAgo: "{x}m ago", hoursAgo: "{x}h ago", daysAgo: "{x}d ago",
  resumeAria: "Resume {x}", resumeOn: "Resume on {x}",
  noOverview: "No overview is available for this title yet. Press Play to start the stream.",
  factType: "Type", factTVShow: "TV Show", factMovie: "Movie",
  factRelease: "Release date", factFirstAired: "First aired", factVotes: "TMDB votes",
  factPopularity: "Popularity", factGenres: "Genres", factStreamSource: "Stream source",
  factRuntime: "Runtime", minSuffix: " min", factSeasons: "Seasons", factStatus: "Status",
  noteLead: "Playback streams in-page through the", noteDL: "nothing is downloaded or hosted here.",
  noteMid: "If this source is blocked on your network, switch sources above or use the \"Open player in a new tab\" link under the Play button.",
  noteLink: "Open player in a new tab",
  noteTail: "If every source is blocked, your ISP is likely blocking the streaming hosts themselves — a VPN usually fixes that. Availability and ads are controlled by the embed provider.",
  statusConnecting: "Connecting to TMDB…",
  statusLive: "Live from TMDB · full catalog fetched just now in your browser",
  statusLivePartial: "Live from TMDB · a few rows are showing the built-in offline list",
  statusOffline: "Offline list (TMDB unreachable) — showing the built-in snapshot from 20 Oct 2026 (details & search need a connection)",
  statusProxy: "Live from TMDB · via proxy (direct connection blocked on this network)",
  statusProxyPartial: "Live from TMDB via proxy · a few rows are showing the built-in offline list",
  retryLive: "Retry live",
  rowMoreSub: "More from TMDB",
  bellMsg: "You're all caught up — new trending titles load live from TMDB each visit.",
  searchingTMDB: "Searching TMDB…", resultsFor: "Results for “{x}”", resultsOfflineSuffix: " (offline snapshot)",
  noMatchHTML: "<strong>No titles matched “{x}”.</strong><br>Check the spelling, or try a shorter title.",
  noMatchOffline: "<strong>No match in the offline snapshot, and TMDB search needs a connection.</strong>",
  nothingFound: "Nothing found.",
  myListEmpty: "<strong>Your list is empty.</strong><br>Tap “My List” on any title to keep it here — it is saved for this profile on this device.",
  filterLoading: "Loading…",
  filterOfflineMsg: "TMDB unreachable — results filtered from the built-in snapshot",
  filterSuffixLive: " · TMDB discover", filterSuffixLocal: " · offline snapshot",
  filterEmpty: "<strong>No titles match these filters.</strong><br>Try a different genre, type, or year.",
  footer1: '<strong style="color:#ddd">Noah-Flix</strong> — a front-end demo built with vanilla JS, Tailwind CSS utilities and Lucide icons.',
  footer2: 'Movie &amp; TV metadata and artwork come from <a href="https://www.themoviedb.org/" target="_blank" rel="noopener">TMDB</a> (fetched live in your browser; a snapshot from 20 Oct 2026 is built in as an offline fallback). This product uses the TMDB API but is not endorsed or certified by TMDB. Video playback is provided by third-party embeds (VidSrc and alternate hosts, switchable in the player) and is not affiliated with Netflix, Inc.'
},
my: {
  docTitle: "Noah-Flix — ရုပ်ရှင်နှင့် TV အစီအစဉ်များ ကြည့်ရှုရန်",
  navHome: "ပင်မစာမျက်နှာ", navTV: "TV အစီအစဉ်များ", navMovies: "ရုပ်ရှင်များ", navMyList: "ကျွန်ုပ်၏စာရင်း",
  notifications: "အကြောင်းကြားချက်များ", profile: "ပရိုဖိုင်",
  whosWatching: "ဘယ်သူ ကြည့်နေတာလဲ?", manageProfiles: "ပရိုဖိုင်များ စီမံရန်", done: "ပြီးပါပြီ",
  addProfile: "ပရိုဖိုင် အသစ်ထည့်ရန်", editProfile: "ပရိုဖိုင် ပြင်ဆင်ရန်", profileName: "အမည်",
  kidsProfileLabel: "ကလေး ပရိုဖိုင်", kidsProfileHint: "ကလေးအတွက် သင့်တော်သော ဇာတ်ကားများသာ — ကာတွန်းနှင့် မိသားစု အမျိုးအစားများ",
  kidsBadge: "ကလေး", deleteProfile: "ပရိုဖိုင် ဖျက်ရန်", saveProfile: "သိမ်းရန်", cancel: "မလုပ်တော့ပါ",
  kidsMovies: "ကလေး ရုပ်ရှင်များ", kidsTV: "ကလေး TV အစီအစဉ်များ", animationRow: "ကာတွန်းများ",
  familyRow: "မိသားစု ဇာတ်ကားများ", kidsRowNote: "ကာတွန်းနှင့် မိသားစု",
  navAria: "ရှာဖွေရန်", filterAria: "ခေါင်းစဉ်များ စစ်ထုတ်ရန်", heroAria: "အထူးခေါင်းစဉ်",
  searchPlaceholder: "ခေါင်းစဉ်၊ သရုပ်ဆောင်၊ အမျိုးအစား ရှာရန်", searchAria: "ခေါင်းစဉ်ရှာရန်",
  browseBy: "အမျိုးအစားအလိုက်", fType: "အမျိုးအစား", fGenre: "ဇာတ်လမ်းအမျိုးအစား", fCountry: "နိုင်ငံ", fYear: "ခုနှစ်",
  typeAll: "ရုပ်ရှင်နှင့် TV အစီအစဉ်များ", typeMovie: "ရုပ်ရှင်များ", typeTV: "TV အစီအစဉ်များ",
  allGenres: "အမျိုးအစားအားလုံး", allCountries: "နိုင်ငံအားလုံး",
  cWEST: "အနောက်တိုင်း (US · UK · CA · AU)", cKR: "တောင်ကိုရီးယား", cIN: "အိန္ဒိယ", cCN: "တရုတ်",
  cJP: "ဂျပန်", cTH: "ထိုင်း", cUS: "အမေရိကန်", cGB: "ဗြိတိန်", cFR: "ပြင်သစ်",
  cDE: "ဂျာမနီ", cES: "စပိန်", cIT: "အီတလီ", cCA: "ကနေဒါ", cAU: "ဩစတြေးလျ", cBR: "ဘရာဇီး",
  cMX: "မက်ဆီကို", cPH: "ဖိလစ်ပိုင်", cID: "အင်ဒိုနီးရှား", cTW: "ထိုင်ဝမ်", cHK: "ဟောင်ကောင်",
  anyYear: "ခုနှစ်အားလုံး", clearFilters: "စစ်ထုတ်မှု ရှင်းရန်",
  play: "ကြည့်ရန်", moreInfo: "အသေးစိတ်", myList: "ကျွန်ုပ်၏စာရင်း", inMyList: "စာရင်းထဲ ရှိပြီးသား",
  kickerFilm: "ရုပ်ရှင် · ယနေ့အထူး", kickerSeries: "စီးရီး · ယနေ့အထူး",
  loadingFeatured: "အထူးခေါင်းစဉ် ရယူနေသည်…",
  heroLoadingOverview: "TMDB မှ နောက်ဆုံးရ ရေပန်းစားသော ရုပ်ရှင်နှင့် အစီအစဉ်များ ရယူနေသည်။",
  heroNoOverview: "ဤခေါင်းစဉ်အတွက် အကျဉ်းချုပ် မရနိုင်သေးပါ — အသေးစိတ်ကို နှိပ်ကြည့်ပါ သို့မဟုတ် ကြည့်ရန် နှိပ်၍ စတင်ကြည့်ရှုနိုင်ပါသည်။",
  tvSeries: "TV စီးရီး", movieWord: "ရုပ်ရှင်", matchSuffix: "% ကိုက်ညီ",
  statusLine: "ပိုစတာနှင့် အချက်အလက်များ: TMDB · Player: source များ ပြောင်းသုံးနိုင်သည်",
  continueWatching: "ဆက်ကြည့်ရန်", clearHistory: "မှတ်တမ်း ရှင်းရန်",
  popularStars: "နာမည်ကြီး သရုပ်ဆောင်များ", starsNote: "သရုပ်ဆောင်နှင့် သရုပ်ဆောင်မများ",
  searchPeoplePh: "သရုပ်ဆောင် ရှာရန်…", searchPeopleAria: "သရုပ်ဆောင် ရှာရန်",
  peopleHead: "သရုပ်ဆောင်များ", peopleFor: "“{x}” နှင့် ကိုက်ညီသော သရုပ်ဆောင်များ",
  searchingPeople: "သရုပ်ဆောင်များ ရှာနေသည်…",
  peopleNoMatch: "<strong>“{x}” နှင့် ကိုက်ညီသော သရုပ်ဆောင် မတွေ့ပါ။</strong><br>စာလုံးပေါင်း စစ်ကြည့်ပါ သို့မဟုတ် အမည်အပြည့်ဖြင့် ရှာကြည့်ပါ။",
  personOffline: "<strong>TMDB သို့ မချိတ်ဆက်နိုင်ပါ — built-in snapshot မှ ဤကြယ်ပွင့်၏ လူသိအများဆုံး ဇာတ်ကားများကို ပြနေသည်။</strong>",
  personNoTitles: "<strong>ဤသရုပ်ဆောင်အတွက် ရုပ်ရှင် သို့မဟုတ် TV အစီအစဉ် မတွေ့သေးပါ။</strong>",
  bornLabel: "မွေးဖွား",
  trendingNow: "ရေပန်းစားနေသည်", trendingNote: "TMDB · ဒီအပတ်",
  top10Today: "ယနေ့ Top 10", top10Note: "TMDB · ယနေ့ ရေပန်းစားနေသည်", top10OfflineNote: "built-in snapshot · 20 Oct 2026",
  trailer: "နမူနာဗီဒီယို", backToPlayer: "Player သို့ ပြန်သွားရန်", moreLikeThis: "ဒါနဲ့ဆင်တူသော ဇာတ်ကားများ",
  popularMovies: "လူကြိုက်များသော ရုပ်ရှင်များ", popularTV: "လူကြိုက်များသော TV အစီအစဉ်များ",
  topRated: "အဆင့်အမြင့်ဆုံး ရုပ်ရှင်များ", nowPlaying: "ရုံတင်ပြသဆဲ ရုပ်ရှင်များ",
  scrollLeft: "ဘယ်သို့ ရွှေ့ရန်", scrollRight: "ညာသို့ ရွှေ့ရန်",
  filteredTitles: "စစ်ထုတ်ထားသော ခေါင်းစဉ်များ", loadMore: "နောက်ထပ် ပြရန်", backToBrowse: "နောက်သို့",
  closeAria: "ပိတ်ရန်", dialogLabel: "ခေါင်းစဉ် အသေးစိတ်နှင့် player",
  source: "Source ရွေးရန်", season: "ရာသီ", tryNextSource: "နောက် source စမ်းကြည့်ရန်",
  fullscreen: "မျက်နှာပြည့်", prevEpisode: "ရှေ့အပိုင်း", nextEpisode: "နောက်အပိုင်း",
  srcHint: "တူညီသောခေါင်းစဉ်ကို streaming host အမျိုးမျိုးတွင် ရနိုင်ပါသည်။ ရွေးထားသော source က ပိတ်ဆို့ခံရခြင်း၊ ဘာမှ မပေါ်ခြင်း သို့မဟုတ် error ပြနေပါက အခြား source တစ်ခုသို့ ပြောင်းပါ — ခေါင်းစဉ်ကို ပြန်ဖွင့်စရာ မလိုဘဲ player က နေရာတွင်ပင် ပြန်ဖွင့်ပေးပါမည်။",
  episodes: "အပိုင်းများ", loadingEpisodes: "အပိုင်းများ ရယူနေသည်…",
  seasonN: "ရာသီ {x}", episodeN: "အပိုင်း {x}", epOfflineSuffix: " · အော့ဖ်လိုင်းဖြစ်၍ ခေါင်းစဉ်များ မရနိုင်ပါ",
  watched: "ကြည့်ပြီး", seriesBadge: "စီးရီး", filmBadge: "ရုပ်ရှင်", posterSuffix: " ပိုစတာ",
  justNow: "ခုလေးတင်", minsAgo: "{x} မိနစ်က", hoursAgo: "{x} နာရီက", daysAgo: "{x} ရက်က",
  resumeAria: "{x} ကို ဆက်ကြည့်ရန်", resumeOn: "{x} ဖြင့် ဆက်ကြည့်ရန်",
  noOverview: "ဤခေါင်းစဉ်အတွက် အကျဉ်းချုပ် မရနိုင်သေးပါ။ ကြည့်ရန် နှိပ်၍ စတင်ကြည့်ရှုပါ။",
  factType: "အမျိုးအစား", factTVShow: "TV အစီအစဉ်", factMovie: "ရုပ်ရှင်",
  factRelease: "ထွက်ရှိရက်", factFirstAired: "စတင်ပြသရက်", factVotes: "TMDB မဲအရေအတွက်",
  factPopularity: "လူကြိုက်များမှု", factGenres: "အမျိုးအစားများ", factStreamSource: "ကြည့်ရှုရန် source",
  factRuntime: "ကြာချိန်", minSuffix: " မိနစ်", factSeasons: "ရာသီများ", factStatus: "အခြေအနေ",
  noteLead: "ဗီဒီယိုကို ဤစာမျက်နှာတွင်ပင်", noteDL: "ဤနေရာတွင် ဒေါင်းလုဒ် သို့မဟုတ် သိမ်းဆည်းထားခြင်း မရှိပါ။",
  noteMid: "ဤ source က သင့်ကွန်ရက်တွင် ပိတ်ဆို့ခံရပါက အပေါ်မှ source ပြောင်းပါ သို့မဟုတ် Play ခလုတ်အောက်ရှိ လင့်ခ်မှ tab အသစ်တွင် ဖွင့်ပါ။",
  noteLink: "player ကို tab အသစ်တွင် ဖွင့်ရန်",
  noteTail: "source အားလုံး ပိတ်ဆို့ခံရပါက သင့် ISP က streaming host များကို ပိတ်ဆို့ထားခြင်း ဖြစ်နိုင်ပြီး VPN သုံးပါက ပုံမှန်အားဖြင့် ပြေလည်သွားပါသည်။ ရနိုင်မှုနှင့် ကြော်ငြာများကို embed provider က ထိန်းချုပ်ပါသည်။",
  statusConnecting: "TMDB သို့ ချိတ်ဆက်နေသည်…",
  statusLive: "TMDB မှ တိုက်ရိုက် · စာရင်းအပြည့် ခုနအတွက် ရယူထားသည်",
  statusLivePartial: "TMDB မှ တိုက်ရိုက် · အချို့ အတန်းများတွင် အော့ဖ်လိုင်း စာရင်းကို ပြနေသည်",
  statusOffline: "အော့ဖ်လိုင်း စာရင်း (TMDB သို့ မချိတ်ဆက်နိုင်ပါ) — 20 Oct 2026 snapshot ကို ပြနေသည် (အသေးစိတ်နှင့် ရှာဖွေမှုအတွက် အင်တာနက် လိုအပ်သည်)",
  statusProxy: "TMDB မှ တိုက်ရိုက် · proxy မှတစ်ဆင့် (ဤကွန်ရက်တွင် တိုက်ရိုက်ချိတ်ဆက်မှု ပိတ်ဆို့ခံရသည်)",
  statusProxyPartial: "TMDB မှ တိုက်ရိုက် (proxy မှတစ်ဆင့်) · အချို့ အတန်းများတွင် အော့ဖ်လိုင်း စာရင်းကို ပြနေသည်",
  retryLive: "တိုက်ရိုက် ပြန်စမ်းရန်",
  rowMoreSub: "TMDB မှ နောက်ထပ် ခေါင်းစဉ်များ",
  bellMsg: "အသစ်များ အားလုံး ရရှိပြီးပါပြီ — လာရောက်တိုင်း TMDB မှ ရေပန်းစားသော ခေါင်းစဉ်အသစ်များ တိုက်ရိုက် ရယူပေးပါသည်။",
  searchingTMDB: "TMDB တွင် ရှာနေသည်…", resultsFor: "“{x}” အတွက် ရလဒ်များ", resultsOfflineSuffix: " (အော့ဖ်လိုင်း snapshot)",
  noMatchHTML: "<strong>“{x}” နှင့် ကိုက်ညီသော ခေါင်းစဉ် မတွေ့ပါ။</strong><br>စာလုံးပေါင်း စစ်ကြည့်ပါ သို့မဟုတ် ခေါင်းစဉ် တိုတိုဖြင့် ရှာကြည့်ပါ။",
  noMatchOffline: "<strong>အော့ဖ်လိုင်း snapshot တွင် မတွေ့ပါ၊ TMDB ရှာဖွေမှုအတွက် အင်တာနက် ချိတ်ဆက်မှု လိုအပ်ပါသည်။</strong>",
  nothingFound: "ဘာမှ မတွေ့ပါ။",
  myListEmpty: "<strong>သင့်စာရင်း ဗလာဖြစ်နေသည်။</strong><br>ခေါင်းစဉ်တစ်ခုခုတွင် “ကျွန်ုပ်၏စာရင်း” ကို နှိပ်ပါ — ဤ profile အတွက် ဤစက်တွင် သိမ်းထားပေးမည်။",
  filterLoading: "ရယူနေသည်…",
  filterOfflineMsg: "TMDB သို့ မချိတ်ဆက်နိုင်ပါ — snapshot မှ စစ်ထုတ်ထားသော ရလဒ်များ",
  filterSuffixLive: " · TMDB မှ", filterSuffixLocal: " · အော့ဖ်လိုင်း snapshot",
  filterEmpty: "<strong>ဤစစ်ထုတ်မှုများနှင့် ကိုက်ညီသော ခေါင်းစဉ် မရှိပါ။</strong><br>အမျိုးအစား၊ ရုပ်ရှင်/TV သို့မဟုတ် ခုနှစ် ပြောင်း၍ စမ်းကြည့်ပါ။",
  footer1: '<strong style="color:#ddd">Noah-Flix</strong> — vanilla JS, Tailwind CSS utilities နှင့် Lucide icon များဖြင့် တည်ဆောက်ထားသော front-end demo တစ်ခုဖြစ်သည်။',
  footer2: 'ရုပ်ရှင်နှင့် TV အချက်အလက်နှင့် ပုံများသည် <a href="https://www.themoviedb.org/" target="_blank" rel="noopener">TMDB</a> မှ ဖြစ်ပါသည် (သင့် browser တွင် တိုက်ရိုက် ရယူသည်၊ အော့ဖ်လိုင်းအတွက် 20 Oct 2026 snapshot ပါဝင်သည်)။ ဤထုတ်ကုန်သည် TMDB API ကို သုံးသော်လည်း TMDB က ထောက်ခံ သို့မဟုတ် အသိအမှတ်ပြုထားခြင်း မရှိပါ။ ဗီဒီယို ပြသမှုကို ပြင်ပ embed များ (VidSrc နှင့် အခြား host များ၊ player တွင် ပြောင်းနိုင်သည်) က ပေးပြီး Netflix, Inc. နှင့် မသက်ဆိုင်ပါ။'
}
};
function t(key, x){
  var s = (STR[LANG] && STR[LANG][key]) || STR.en[key] || key;
  if (x !== undefined) s = s.replace("{x}", String(x));
  return s;
}
function tmdbLang(){ return LANG === "my" ? "my-MM" : "en-US"; }
function genreLabel(g){ return LANG === "my" && g.nameMy ? g.nameMy : g.name; }
function countryLabel(code){ return t("c" + code); }
function titlesCount(n){
  return LANG === "my" ? "ခေါင်းစဉ် " + n + " ခု" : n + (n === 1 ? " title" : " titles");
}
function epCountText(n){
  return LANG === "my" ? "· အပိုင်း " + n + " ခု" : "· " + n + (n === 1 ? " episode" : " episodes");
}
var lastStatus = { live: false, key: "statusConnecting" };
function renderStatus(){
  var el = document.getElementById("dataStatus");
  if (el) el.innerHTML = '<span class="dot' + (lastStatus.live ? "" : " amber") + '"></span>' + esc(t(lastStatus.key));
}
function applyI18n(){
  document.documentElement.lang = LANG === "my" ? "my" : "en";
  document.title = t("docTitle");
  document.querySelectorAll("[data-i18n]").forEach(function(el){ el.textContent = t(el.getAttribute("data-i18n")); });
  document.querySelectorAll("[data-i18n-html]").forEach(function(el){ el.innerHTML = t(el.getAttribute("data-i18n-html")); });
  document.querySelectorAll("[data-i18n-ph]").forEach(function(el){ el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
  document.querySelectorAll("[data-i18n-aria]").forEach(function(el){ el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
  document.querySelectorAll("[data-i18n-title]").forEach(function(el){ el.setAttribute("title", t(el.getAttribute("data-i18n-title"))); });
  document.querySelectorAll(".chev.left").forEach(function(el){ el.setAttribute("aria-label", t("scrollLeft")); });
  document.querySelectorAll(".chev.right").forEach(function(el){ el.setAttribute("aria-label", t("scrollRight")); });
  var le = document.getElementById("langEn"), lm = document.getElementById("langMy");
  if (le) le.classList.toggle("on", LANG === "en");
  if (lm) lm.classList.toggle("on", LANG === "my");
  if (typeof heroItems !== "undefined" && !heroItems.length) {
    var ht = document.getElementById("heroTitle"), ho = document.getElementById("heroOverview");
    if (ht) ht.textContent = t("loadingFeatured");
    if (ho) ho.textContent = t("heroLoadingOverview");
  }
  if (typeof heroItems !== "undefined" && heroItems.length && typeof syncListBtn === "function")
    syncListBtn(document.getElementById("heroList"), heroItems[heroIdx]);
  if (typeof currentItem !== "undefined" && currentItem && typeof syncListBtn === "function")
    syncListBtn(document.getElementById("modalList"), currentItem);
  renderStatus();
}
function setLang(l){
  l = l === "my" ? "my" : "en";
  if (l === LANG) { applyI18n(); return; }
  LANG = l;
  try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
  applyI18n();
  buildGenreOptions();
  if (document.getElementById("altView").style.display !== "none") showBrowse();
  renderHistory();
  loadHome();
  loadPeople();
  if (typeof refreshProfileUI === "function") refreshProfileUI();
  if (filtersActive()) applyFilters();
}

/* --- Built-in snapshot (real TMDB results, 20 Oct 2026) --- */
function F(id,type,title,year,rating,poster,backdrop,overview){
  var o = {id:id, media_type:type, title:title, name:title,
    vote_average:rating, poster_path:poster,
    backdrop_path:backdrop, overview:(overview || OVERVIEWS[id] || ""),
    origin_country:(typeof SNAP_COUNTRIES !== "undefined" && SNAP_COUNTRIES[id]) || [],
    genre_ids:(typeof SNAP_GENRES !== "undefined" && SNAP_GENRES[id]) || []};
  if (type === "tv") o.first_air_date = year+"-01-01"; else o.release_date = year+"-01-01";
  return o;
}
/* Real TMDB overviews for every snapshot title (fetched 20 Oct 2026),
   so the detail modal shows the genuine synopsis even when the
   TMDB API is unreachable and the snapshot is what renders. */
var OVERVIEWS = {
  "122": "As armies mass for a final battle that will decide the fate of the world--and powerful, ancient forces of Light and Dark compete to determine the outcome--one member of the Fellowship of the Ring is revealed as the noble heir to the throne of the Kings of Men. Yet, the sole hope for triumph over evil lies with a brave hobbit, Frodo, who, accompanied by his loyal friend Sam and the hideous, wretched Gollum, ventures deep into the very dark heart of Mordor on his seemingly impossible quest to destroy the Ring of Power.​",
  "129": "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
  "155": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
  "238": "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.",
  "240": "In the continuing saga of the Corleone crime family, a young Vito Corleone grows up in Sicily and in 1910s New York. In the 1950s, Michael Corleone attempts to expand the family business into Las Vegas, Hollywood and Cuba.",
  "278": "Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden. During his long stretch in prison, Dufresne comes to be admired by the other inmates -- including an older prisoner named Red -- for his integrity and unquenchable sense of hope.",
  "389": "The defense and the prosecution have rested and the jury is filing into the jury room to decide if a young Spanish-American is guilty or innocent of murdering his father. What begins as an open and shut case soon becomes a mini-drama of each of the jurors' prejudices and preconceptions about the trial, the accused, and each other.",
  "424": "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory during World War II.",
  "456": "Set in Springfield, the average American town, the show focuses on the antics and everyday adventures of the Simpson family; Homer, Marge, Bart, Lisa and Maggie, as well as a virtual cast of thousands. Since the beginning, the series has been a pop culture icon, attracting hundreds of celebrities to guest star. The show has also made name for itself in its fearless satirical take on politics, media and American life in general.",
  "497": "A supernatural tale set on death row in a Southern prison, where gentle giant John Coffey possesses the mysterious power to heal people's ailments. When the cell block's head guard, Paul Edgecomb, recognizes Coffey's miraculous gift, he tries desperately to help stave off the condemned man's execution.",
  "549": "In cases ripped from the headlines, police investigate serious and often deadly crimes, weighing the evidence and questioning the suspects until someone is taken into custody. The district attorney's office then builds a case to convict the perpetrator by proving the person guilty beyond a reasonable doubt. Working together, these expert teams navigate all sides of the complex criminal justice system to make New York a safer place.",
  "1416": "Follows the personal and professional lives of a group of doctors at Seattle's Grey Sloan Memorial Hospital.",
  "1434": "Sick, twisted, politically incorrect and Freakin' Sweet animated series featuring the adventures of the dysfunctional Griffin family. Bumbling Peter and long-suffering Lois have three kids. Stewie (a brilliant but sadistic baby bent on killing his mother and taking over the world), Meg (the oldest, and is the most unpopular girl in town) and Chris (the middle kid, he's not very bright but has a passion for movies). The final member of the family is Brian - a talking dog and much more than a pet, he keeps Stewie in check whilst sipping Martinis and sorting through his own life issues.",
  "1622": "When they were boys, Sam and Dean Winchester lost their mother to a mysterious and demonic supernatural force. Subsequently, their father raised them to be soldiers. He taught them about the paranormal evil that lives in the dark corners and on the back roads of America ... and he taught them how to kill it. Now, the Winchester brothers crisscross the country in their '67 Chevy Impala, battling every kind of supernatural threat they encounter along the way. ",
  "2224": "The World's Fakest News Team tackle the biggest stories in news, politics and pop culture.",
  "2261": "The Tonight Show Starring Johnny Carson is a talk show hosted by Johnny Carson under The Tonight Show franchise from 1962 to 1992. It originally aired during late-night. For its first ten years, Carson's Tonight Show was based in New York City with occasional trips to Burbank, California; in May 1972, the show moved permanently to Burbank, California. In 2002, The Tonight Show Starring Johnny Carson was ranked #12 on TV Guide's 50 Greatest TV Shows of All Time.",
  "2734": "In the criminal justice system, sexually-based offenses are considered especially heinous. In New York City, the dedicated detectives who investigate these vicious felonies are members of an elite squad known as the Special Victims Unit. These are their stories.",
  "4057": "An elite team of FBI profilers analyze the country's most twisted criminal minds, anticipating their next moves before they strike again. The Behavioral Analysis Unit's most experienced agent is David Rossi, a founding member of the BAU who returns to help the team solve new cases.",
  "4614": "From murder and espionage to terrorism and stolen submarines, a team of special agents investigates any crime that has any connection to Navy and Marine Corps personnel, regardless of rank or position.",
  "5920": "Patrick Jane, a former celebrity psychic medium, uses his razor sharp skills of observation and expertise at \"reading\" people to solve serious crimes with the California Bureau of Investigation.",
  "9479": "Tired of scaring humans every October 31 with the same old bag of tricks, Jack Skellington, the spindly king of Halloween Town, kidnaps Santa Claus and plans to deliver shrunken heads and other ghoulish gifts to children on Christmas morning. But as Christmas approaches, Jack's rag-doll girlfriend, Sally, tries to foil his misguided plans.",
  "14424": "Malhação is a Brazilian television series for the teenage audience. The soap started in 1995, and was set in a fictional Gym Club called Malhação on Barra da Tijuca, Rio de Janeiro. Through the years the location varied slightly. Although the name of the soap remains the same, it is now set in the Múltipla Escolha High School.",
  "15226": "A team of dedicated men and women in the Crime Investigation Department will risk everything to solve Mumbai's toughest, most complicated crimes.",
  "15325": "Dagsrevyen is the daily evening news programme for the Norwegian television channel NRK1, the main channel of the Norwegian Broadcasting Corporation, broadcast at 19:00. In 2007, the programme started airing simultaneously on NRK's dedicated news channel NRK2, but this arrangement ended that same year. Dagsrevyen's first newscast was broadcast in 1958 and it has kept its name since. It is Norway's most viewed programme, with daily ratings of around one million. Around 200 people are involved in its production, with headquarters at Marienlyst in Oslo.\n\nDagsrevyen aims at fewer, but longer and more extensive stories than its competitors. NRK hosts a tight network of domestic journalists in addition to international correspondence offices, though NRK also uses footage acquired through the European Broadcasting Union. There are always two anchors, one male and one female. The Saturday and Sunday broadcasts are dubbed Lørdagsrevyen and Søndagsrevyen, respectively.\n\nThe editor of television news is Solveig Tvedt and the lead news editor is Stein Bjøntegård.\n\nOther news-related broadcasts on NRK include Dagsrevyen 21, Kveldsnytt, Standpunkt, RedaksjonEN, Urix and Dagsnytt, plus the radio shows Ukeslutt, Dagsnytt 18 and Her og Nå. NRK also broadcasts daily newscasts from most regional offices.",
  "19404": "Raj is a rich, carefree, happy-go-lucky second generation NRI. Simran is the daughter of Chaudhary Baldev Singh, who in spite of being an NRI is very strict about adherence to Indian values. Simran has left for India to be married to her childhood fiancé. Raj leaves for India with a mission at his hands, to claim his lady love under the noses of her whole family. Thus begins a saga.",
  "22980": "Bravo network executive Andy Cohen discusses pop culture topics with celebrities and reality show personalities.",
  "30984": "For as long as he can remember, Ichigo Kurosaki has been able to see ghosts. But when he meets Rukia, a Soul Reaper who battles evil spirits known as Hollows, he finds his life is changed forever. Now, with a newfound wealth of spiritual energy, Ichigo discovers his true calling: to protect the living and the dead from evil.",
  "33238": "These days, as variety shows are gradually disappearing, this is one of Korea’s representative variety shows that has been responsible for Sunday evenings for over 10 years. This program features numerous stars and members going around various places, playing games, and completing missions. In particular, among the many fun elements of variety shows, this one focuses solely on laughter.\n\nOpen your eyes! Big fun is coming in!\n\nOpen your mouth! Big laughter is coming in!\n\nOpen your heart! Useful lessons are coming in!",
  "59941": "After Jay Leno's second retirement from the program, Jimmy Fallon stepped in as his permanent replacement. After 42 years in Los Angeles the program was brought back to New York.",
  "61818": "Seth Meyers, who is \"Saturday Night Live's\" longest serving anchor on the show's wildly popular \"Weekend Update,\" takes over as host of NBC's \"Late Night\" — home to A-list celebrity guests, memorable comedy and the best in musical talent. As the Emmy Award-winning head writer for \"SNL,\" Meyers has established a reputation for sharp wit and perfectly timed comedy, and has gained fame for his spot-on jokes and satire. Meyers takes his departure from \"SNL\" to his new post at \"Late Night,\" as Jimmy Fallon moves to \"The Tonight Show\".",
  "63770": "Stephen Colbert brings his signature satire and comedy to The Late Show with Stephen Colbert, the #1 show in late night, where he talks with an eclectic mix of guests about what is new and relevant in the worlds of politics, entertainment, business, music, technology, and more. Featuring bandleader Jon Batiste with his band Stay Human, the Emmy Award-nominated show is broadcast from the historic Ed Sullivan Theater.",
  "65733": "Robotic cat Doraemon is sent back in time from the 22nd century to protect 10-year-old Noby, a lazy and uncoordinated boy who is destined to have a tragic future. Doraemon can create secret gadgets from a pocket on his stomach, but they usually cause more bad than good because of Noby's propensity to misuse them.",
  "91759": "Hung Sue Gan starting from the bottom, established his own logistics company, which is now running smoothly. His only concern now are his three daughters. His eldest daughter has immigrated overseas. His second daughter Hung Yeuk Shui has reached the marriageable age, but has no hopes for marriage anytime soon. She is constantly bickering with her younger sister Hung Sum Yue, who is an honour student, over trivial matters, causing their father to not know whether to laugh or cry. Hung Sue Yan, Hung Sue Gan's brother, moves in with the family, temporarily ending his life as a nomadic photographer. He joins Hung Yeuk Shui's company and encounters Ko Pak Fei, the director of an online shop. The two appear to be former lovers, making for lots of laughter. Since Hung Sue Yan moved in, a series of strange events have occurred in the family. Upon investigation, the source is traced to Lung Ging Fung, a promising young man who is the son of department store mogul Lung Gam Wai.",
  "105248": "In a dystopia riddled with corruption and cybernetic implants, a talented but reckless street kid strives to become a mercenary outlaw — an edgerunner.",
  "108978": "Jack Reacher, a veteran military police investigator, has just recently entered civilian life. Reacher is a drifter, carrying no phone and the barest of essentials as he travels the country and explores the nation he once served.",
  "123542": "Using superpowers to enter their clientele’s photos one by one, Cheng Xiaoshi and Lu Guang take their work seriously at “Time Photo Studio,” a small photography shop set in the backdrop of a modern metropolis. Each job can be full of danger, but nothing is more important than fulfilling every order, no matter the scale…or peril involved!",
  "157336": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
  "203857": "Amid an international crisis, a US diplomat contends with her high-profile job as ambassador to the UK and her strained marriage to a political star.",
  "206559": "A South African Afrikaans soap opera. It is set in and around the fictional private hospital, Binneland Kliniek, in Pretoria, and the storyline follows the trials, trauma and tribulations of the staff and patients of the hospital.",
  "213375": "With a bounty on his head, Vision must confront his nature and resist Ultron's influence to survive.",
  "213562": "Single mother Pam Voorhees has been unable to shake her grief after her young, sickly son Jason tragically drowned in the town lake almost a year before. When two strangers arrive at Pam's door digging into her past, a disturbing chain of events is set into motion, leaving the townspeople of Crystal Lake wondering: just who is Pam Voorhees?",
  "285322": "When a mysterious sea creature terrorizes a small Newfoundland town, a hard-bitten fisherman and his family fight to protect their close-knit community.",
  "288673": "After her father's sudden, untimely death thrusts her into the unforgiving ecosystem of public high school, Carrie is forced to navigate a viral bullying scandal that tears through her community, the relentless pressure and casual cruelty of the social‑media age, and the awakening of mysterious telekinetic powers that rise alongside her adolescence.",
  "300146": "An ambitious street urchin seizes the chance to impersonate a noblewoman and becomes a warlord's bride, but when her comatose husband awakens, she must navigate deadly schemes, win his heart through cunning, and uncover her royal heritage to triumph over rivals and rise from gutter to glory.",
  "372058": "High schoolers Mitsuha and Taki are complete strangers living separate lives. But one night, they suddenly switch places. Mitsuha wakes up in Taki’s body, and he in hers. This bizarre occurrence continues to happen randomly, and the two must adjust their lives around each other.",
  "460458": "Once the booming home of pharmaceutical giant Umbrella Corporation, Raccoon City is now a dying Midwestern town. The company’s exodus left the city a wasteland…with great evil brewing below the surface. When that evil is unleashed, the townspeople are forever…changed…and a small group of survivors must work together to uncover the truth behind Umbrella and make it through the night.",
  "496243": "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
  "687163": "Science teacher Ryland Grace wakes up on a spaceship light years from home with no recollection of who he is or how he got there. As his memory returns, he begins to uncover his mission: solve the riddle of the mysterious substance causing the sun to die out. He must call on his scientific knowledge and unorthodox ideas to save everything on Earth from extinction.",
  "936075": "The story of Michael Jackson, one of the most influential artists the world has ever known, and his life beyond the music. His journey from the discovery of his extraordinary talent as the lead of the Jackson Five, to the visionary artist whose creative ambition fueled a relentless pursuit to become the biggest entertainer in the world, highlighting both his life off-stage and some of the most iconic performances from his early solo career.",
  "969681": "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
  "980431": "Avatar Aang, the world's last Airbender, learns of an ancient power that could save his culture from extinction. With the help of his friends, he embarks on a global quest to find it before it falls into the wrong hands and threatens to upend the peace they sacrificed everything to achieve.",
  "1003596": "Beloved heroes from three distinct universes are set on a deadly collision course and face an existential threat unlike anything they've ever encountered.",
  "1007757": "A small woodland creature and a majestic bird, two natural sworn enemies of the Valley, magically trade places and set off on an adventure of a lifetime to switch back. Their journey soon uncovers a greater threat—one that could endanger not only their species, but the entire valley they call home.",
  "1058424": "In the remote South Korean village of Hope Harbor, police chief Bum-seok and officer Sung-ae are called to investigate a mysterious creature wreaking havoc on the community. But all is not as it seems, and perceptions can be misleading. What begins as ignorance plants the seed of disaster, escalating through human conflict into a tragedy of cosmic proportions.",
  "1084244": "When Bonnie receives a Lilypad tablet as a gift and becomes obsessed, Buzz, Woody, Jessie and the rest of the gang's jobs become exponentially harder when they have to go head to head with the all-new threat to playtime.",
  "1101383": "After a mysterious cosmic event rips Oak Street from suburbia and transports their neighborhood to someplace unknown, the Platt family soon discovers that their very survival depends on them sticking together as they navigate their now unrecognizable surroundings.",
  "1101412": "On a perilous climb across Thailand's Mount Kwan, two climbers become trapped thousands of feet above the ground, where vertigo-inducing heights, sheer exposure, and impossible odds turn every moment into a fight for survival.",
  "1148365": "When a group of former childhood friends reconnect, their reunion takes a wild turn as they stumble upon a dangerous international plot—and must save the world.",
  "1153576": "In 1993, estranged Street Fighters Ryu and Ken Masters are thrown back into combat when the mysterious Chun-Li recruits them for the next World Warrior Tournament: a brutal clash of fists, fate, and fury. But behind this battle royale lies a deadly conspiracy that forces them to face off against each other and the demons of their past. And if they don't, it's GAME OVER!",
  "1198654": "A struggling primary school teacher is forced to take drastic action because of a foul-mouthed, violent student, and uncovers how her community will turn a blind eye to the most outrageous events to preserve harmony and their sense of safety.",
  "1204680": "After Acme products fail him one too many times in his dogged pursuit of the Roadrunner, Wile E. Coyote decides to hire a billboard lawyer to sue the Acme Corporation.",
  "1218925": "In a brutal war between devils, hunters, and secret enemies, a mysterious girl named Reze has stepped into Denji's world, and he faces his deadliest battle yet, fueled by love in a world where survival knows no rules.",
  "1228834": "Disillusioned by the end of the war in Afghanistan, a group of disgraced, war-torn ex-CIA operatives set out to Tehran to take down a life-changing score.",
  "1232449": "14-year-old Elias increasingly feels like an outsider in his village. When he meets his new neighbour of the same age, Alexander, Elias is confronted with his burgeoning sexuality.",
  "1232569": "Influenced by a sinister Cricket and created by Geppetto, Pinocchio launches a violent crusade to carve himself into a real boy like his brother James, one piece at a time.",
  "1236045": "When the son of an L.A. mayoral candidate is kidnapped, he and his wife have a few hours to come up with the ransom payment. With most of their money spent on his political campaign, they have to get their hands dirty and expose a side of their lives they never intended to see the light of day.",
  "1255833": "Following the death of his father, Jay Gardiner goes diving off the central Coast of California in search of his remains, but is swallowed by a massive sperm whale. While trapped inside its belly with only one hour of oxygen left, Jay comes to realize that the hard-earned lessons his father imparted may be the key to his escape.",
  "1275779": "A cybersecurity expert becomes a whistleblower after uncovering secrets about aliens, putting him on the run from a corporation. Meanwhile, a meteorologist experiencing strange phenomena joins forces with him to prove there's life beyond our understanding.",
  "1288069": "A determined man embarks on a high-stakes quest—and defies seemingly impossible odds—to fulfill his dream of being the first to reach the summit of Mount Everest.",
  "1288445": "After witnessing his billionaire boss' murder and being framed for the crime, Cole Reed boards a cargo ship on a one-man crusade to avenge his boss' death only to discover an international conspiracy.",
  "1291595": "Gemma, a young mother raising her daughter in the house she grew up in, discovers she can travel into The Further, where she possesses an ability to bring what lives there back to the real world.",
  "1294189": "A falsely accused war hero with nothing to lose leads police on an epic televised cross-country car chase, helped by members of his former Special Forces Army battalion and closely monitored by a fascinated public rooting for his safe getaway.",
  "1302904": "The Owens sisters must confront the dark curse that threatens to unravel their family once and for all.",
  "1311031": "The Demon Slayer Corps are drawn into the Infinity Castle, where Tanjiro, Nezuko, and the Hashira face terrifying Upper Rank demons in a desperate fight as the final battle against Muzan Kibutsuji begins.",
  "1339274": "A mother moves into a new house with her two children. One night she must leave the siblings home alone. What begins as a blast of carefree play soon turns into a claustrophobic horror story.",
  "1339713": "After breaking the mysterious \"One Wish Willow\" to win his crush's heart, a hopeless romantic finds himself getting exactly what he asked for but soon discovers that some desires come at a dark, sinister price.",
  "1368337": "Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.",
  "1375161": "A church group's annual retreat turns deadly when they wander into the wrong part of the Ozark wilderness, and something starts picking them off one by one.  Suspicion falls on Ricky, the troublemaker of the group. But the real threat is far worse.  Deep in the forest, wrapped in a labyrinth of webs, the group is pursued by a terrifying prehistoric arachnid that hunts by vibration. When every step could be their last, they only have one choice: Don't Move.  It's up to Megan to hold what's left of the group together and get them out alive.",
  "1377237": "A former soldier is thrown into a brutal race against time when a critical medical delivery makes him and his unlikely partner the targets of a ruthless cartel. As the mission spirals into a deadly manhunt, every detour, delay, and bullet pushes them closer to failure. With betrayal closing in from every side, they must survive the chase and deliver their cargo to save the life of a little girl.",
  "1381078": "After a chance encounter sparks a sweeping romance, Maya's future is suddenly upended, sending her on an unexpected journey to love and live again.",
  "1389172": "A young reporter and her reluctant cameraman chase a story, only to get entangled in an illegal sand-mining racket run by a ruthless syndicate.",
  "1400837": "Young Bela forms a relationship with a sinister entity in her home that looks uncannily like her own mother, drawing her into a terrifying and increasingly dark world.",
  "1400940": "Matt Hagen's meteoric rise from Gotham street kid to Hollywood leading man is tragically cut short when a local crime boss's actions leave him horribly disfigured. Abandoned by his team and with nothing left, Matt seeks out a cutting edge treatment that miraculously returns him to his former self… but also unexpectedly affects his grip on reality, spiraling him down a destructive path of all-consuming revenge.",
  "1423191": "Medical courier Bryan unwittingly finds himself fighting for survival as one fateful, horrifying night collapses around him in chaos.",
  "1514026": "A magical, singing orange unicorn holds his cast hostage in a surreal TV-show dimension, as he becomes more and more demented.",
  "1560520": "Arkham Asylum has been destroyed, and all its inmates have been unleashed upon Gotham City. As Batman races to round up some of his greatest enemies, he is pushed to his physical and mental limits and into a final confrontation with a new threat: the man called Bane!",
  "1561726": "When a legendary thief sets his sights on the Mona Lisa, he recruits two young strangers to help him before revealing they are long-lost siblings… and oh yes, by the way, he is their father. Thrown into a chaotic reunion they never asked for, this new family must learn to work together — and try not to kill each other — if they want any chance at pulling off the heist of the century.",
  "1621552": "Two Mexican officers must survive the final hours of their shift after crossing a ruthless cartel boss.",
  "1630423": "Hunted for her rare blood type, a caged woman vows to fight alongside the assassin she loves to protect their future when an old enemy resurfaces.",
  "1632181": "Two women discover they were both scammed by the same man (who also got them pregnant). They form an alliance to take revenge.",
  "1712451": "A man keeping his recently zombified daughter secure in hopes of a cure is tasked with delivering an unknown package through hordes of undead. If he succeeds, he will be given a cure for his daughter. If he fails, or opens the package, they will both be killed."
};

/* Real TMDB genre ids for every snapshot title (fetched 20 Oct 2026),
   so genre filtering also works when the snapshot is what renders. */
var SNAP_GENRES = {
  "122": [12, 14, 28],
  "129": [16, 10751, 14],
  "155": [28, 53, 80],
  "238": [18, 80],
  "240": [18, 80],
  "278": [18, 80],
  "389": [18],
  "424": [18, 36, 10752],
  "456": [16, 35],
  "497": [14, 18, 80],
  "549": [80, 18],
  "1416": [18],
  "1434": [16, 35],
  "1622": [18, 9648, 10765],
  "2224": [10763, 35],
  "2261": [10767],
  "2734": [80, 18, 9648],
  "4057": [80, 18, 9648],
  "4614": [80, 18, 10759],
  "5920": [80, 18, 9648],
  "9479": [14, 16, 10751],
  "14424": [10766, 35, 18],
  "15226": [10759, 80, 18, 9648],
  "15325": [],
  "19404": [35, 18, 10749],
  "22980": [10767, 35],
  "30984": [10759, 16, 10765],
  "33238": [35, 10764],
  "59941": [35, 10767],
  "61818": [10767, 35],
  "63770": [35, 10767],
  "65733": [10759, 16, 35, 10765, 10762, 10751],
  "91759": [10751, 35, 18],
  "105248": [16, 10759, 10765, 80],
  "108978": [10759, 80],
  "123542": [16, 10765, 9648, 18],
  "157336": [12, 18, 878],
  "203857": [18, 10768],
  "206559": [10766],
  "213375": [10765, 18],
  "213562": [18, 9648],
  "285322": [18, 9648],
  "288673": [9648, 18, 10765],
  "300146": [18],
  "372058": [16, 10749, 18],
  "460458": [28, 27, 878],
  "496243": [35, 53, 18],
  "687163": [878, 12],
  "936075": [10402, 18],
  "969681": [878, 28, 12],
  "980431": [16, 12, 14, 28],
  "1003596": [878, 28, 12],
  "1007757": [12, 16, 10751, 14],
  "1058424": [878, 9648, 28],
  "1084244": [16, 10751, 35, 12],
  "1101383": [878, 9648, 53],
  "1101412": [53],
  "1148365": [28, 35, 12],
  "1153576": [28, 14],
  "1198654": [35, 53],
  "1204680": [35, 12, 10751],
  "1218925": [16, 28, 10749, 14],
  "1228834": [28, 53],
  "1232449": [18, 10749],
  "1232569": [27, 14, 9648],
  "1236045": [53, 18],
  "1255833": [53],
  "1275779": [878, 53],
  "1288069": [18, 36],
  "1288445": [28, 53],
  "1291595": [27, 53],
  "1294189": [28, 53],
  "1302904": [10749, 14, 35],
  "1311031": [16, 28, 14],
  "1339274": [27, 18, 53],
  "1339713": [27, 53],
  "1368337": [12, 28, 14],
  "1375161": [27, 53],
  "1377237": [28, 35],
  "1381078": [10749, 18],
  "1389172": [80, 53],
  "1400837": [27],
  "1400940": [27, 53, 878],
  "1423191": [27, 878, 12],
  "1514026": [27, 35, 14],
  "1560520": [16, 28, 12, 18],
  "1561726": [28, 53],
  "1621552": [80, 28, 53],
  "1630423": [28, 18, 10749],
  "1632181": [35, 10749],
  "1712451": [27]
};

/* Origin countries (ISO 3166-1 codes, TMDB origin_country values) for
   every snapshot title, so the country filter also works when the
   snapshot is what renders. Live TMDB results carry origin_country
   natively; countryOf() below falls back to this map. */
var SNAP_COUNTRIES = {
  "122": ["NZ", "US"],
  "129": ["JP"],
  "155": ["GB", "US"],
  "238": ["US"],
  "240": ["US"],
  "278": ["US"],
  "389": ["US"],
  "424": ["US"],
  "456": ["US"],
  "497": ["US"],
  "549": ["US"],
  "1416": ["US"],
  "1434": ["US"],
  "1622": ["US"],
  "2224": ["US"],
  "2261": ["US"],
  "2734": ["US"],
  "4057": ["US"],
  "4614": ["US"],
  "5920": ["US"],
  "9479": ["US"],
  "14424": ["BR"],
  "15226": ["IN"],
  "15325": ["NO"],
  "19404": ["IN"],
  "22980": ["US"],
  "30984": ["JP"],
  "33238": ["KR"],
  "59941": ["US"],
  "61818": ["US"],
  "63770": ["US"],
  "65733": ["JP"],
  "91759": ["HK"],
  "105248": ["JP", "PL", "US"],
  "108978": ["US"],
  "123542": ["CN"],
  "157336": ["GB", "US"],
  "203857": ["US"],
  "206559": ["ZA"],
  "213375": ["US"],
  "213562": ["US"],
  "285322": ["CA", "GB"],
  "288673": ["CA", "US"],
  "300146": ["CN"],
  "372058": ["JP"],
  "460458": ["DE", "US", "CA"],
  "496243": ["KR"],
  "687163": ["US"],
  "936075": ["US"],
  "969681": ["US"],
  "980431": ["US", "KR", "AU"],
  "1003596": ["US"],
  "1007757": ["US", "ES"],
  "1058424": ["KR"],
  "1084244": ["US"],
  "1101383": ["US"],
  "1101412": ["GB", "US"],
  "1148365": ["US"],
  "1153576": ["JP", "US"],
  "1198654": ["GB", "US"],
  "1204680": ["US"],
  "1218925": ["JP"],
  "1228834": ["US"],
  "1232449": ["BE", "NL"],
  "1232569": ["GB"],
  "1236045": ["US"],
  "1255833": ["US"],
  "1275779": ["US"],
  "1288069": ["AU", "GB", "US"],
  "1288445": ["GB", "US"],
  "1291595": ["US"],
  "1294189": ["US"],
  "1302904": ["US"],
  "1311031": ["JP"],
  "1339274": ["MX"],
  "1339713": ["US", "GB"],
  "1368337": ["GB", "US"],
  "1375161": ["CA", "US"],
  "1377237": ["US", "AU", "GB"],
  "1381078": ["US"],
  "1389172": ["IN"],
  "1400837": ["US"],
  "1400940": ["US"],
  "1423191": ["US", "DE", "FR"],
  "1514026": ["US", "IL"],
  "1560520": ["US"],
  "1561726": ["FR", "US"],
  "1621552": ["MX"],
  "1630423": ["TH"],
  "1632181": ["MX"],
  "1712451": ["US"]
};

function countryOf(it){
  if (it && it.origin_country && it.origin_country.length) return it.origin_country;
  return (it && SNAP_COUNTRIES[it.id]) || [];
}
var FALLBACK = {
  trending: [
    F(123542,"tv","LINK CLICK",2021,8.0,"/hCt2bLRGTCjHGqtV5FP3Img6w1h.jpg","/w3agwUSMpJ4X9t1jGrDtqqRPjDQ.jpg"),
    F(213562,"tv","Crystal Lake",2026,8.5,"/3ENhExiD2fcjk5FX0AcAXcvLu9N.jpg","/wxiBsKFEOOFK8eQStWOykNORlXY.jpg"),
    F(213375,"tv","VisionQuest",2026,8.8,"/WGyAyBPncfuu8MZhLY9RtfZPM0.jpg","/uoXXbN2PrOxH6UKyP7kYwmGpAAP.jpg"),
    F(1058424,"movie","Hope",2026,6.9,"/6VY1ZKgpsc8CfGsQcCGiYEgHdH0.jpg","/qqHFLg90IUSoTmSMpKOOW5RyqN3.jpg"),
    F(288673,"tv","Carrie",2026,8.3,"/6mUMquPQBFJGqTACS3Azkwwrx8d.jpg","/9yCJtipMeDe8uAdSJKvw8BnYfRz.jpg"),
    F(969681,"movie","Spider-Man: Brand New Day",2026,8.5,"/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg","/r08LxMJCbf1SiJIWeyH9aJmdqwC.jpg"),
    F(1153576,"movie","Street Fighter",2026,6.3,"/pwUb3gdkSrlyMZWs0MFOQg3N5s7.jpg","/5H5YphHsQmkQhrw13Wv1whCZKtN.jpg"),
    F(1561726,"movie","Masterplan",2026,7.1,"/5xmXVd7nCK3tAo34XkO58SxUCip.jpg","/dgUDj84BWtW6EZzee8BkgKnjDhh.jpg"),
    F(1288069,"movie","Tenzing",2026,8.3,"/eI0QW02PYqhnmIvLRdn9vrfVVP7.jpg","/6GXqVvL20Y0MpyVP30WoI2NPK69.jpg"),
    F(1302904,"movie","Practical Magic 2",2026,7.0,"/ogwQOLbCfncjvBhFb5l0OmQH8KC.jpg","/oIglj0Jy9duG4LnrRUpH8n001Pk.jpg"),
    F(1198654,"movie","Bad Apples",2026,7.1,"/pcPLnxCThCIo9JFQIMFX4kAE5Yz.jpg","/ldeiBXtVM12oDUVSiJtwjESLSOc.jpg"),
    F(1255833,"movie","Whalefall",2026,6.7,"/vjTYUTgh9nO88i6HZ4YPRhiFL05.jpg","/shW2jHkQLZVv4Fko2rJDqTGU0gx.jpg"),
    F(1400940,"movie","Clayface",2026,8.1,"/5jCpQnWPikggmQZoDp1eAi6BI6w.jpg","/kVtOcoUJ68chBD2tmERkdWz7lK5.jpg"),
    F(1514026,"movie","Buddy",2026,7.1,"/1BdZbNvl1SfrrX8J9X5tQzN6Ivu.jpg","/ytoLEl5yDaxB8AtZ52uKWjaQ9ql.jpg"),
    F(1423191,"movie","Resident Evil",2026,7.3,"/i7UyjfPio0VFHB9rBUZSFyhOoM8.jpg","/3icyRAqgakNcQn6aDVz9libFmBA.jpg"),
    F(30984,"tv","Bleach",2004,8.4,"/2EewmxXe72ogD0EaWM8gqa0ccIw.jpg","/o0NsbcIvsllg6CJX0FBFY8wWbsn.jpg"),
    F(105248,"tv","Cyberpunk: Edgerunners",2022,8.5,"/v3JuB15WybKmxDeT1hWdK3j6eSJ.jpg","/3UbHGmu9vIMSC5uNfnGt7DjetqT.jpg"),
    F(1381078,"movie","Love of Your Life",2026,6.9,"/c2bHsFBSvMPozJXBGuiIpCRh7hf.jpg","/mqYqKvrKTgMvK50VtEDZlYFsnHz.jpg"),
    F(203857,"tv","The Diplomat",2023,7.6,"/cUy0ZYme43lop08nOtbQLWL0dX.jpg","/hzznrBI07C2chXivlLYvEmQESP7.jpg"),
    F(1236045,"movie","Animals",2026,7.0,"/iISM36voS1E8gX9BM0DVK0kgi3E.jpg","/tzoarEu7TsG959upiELyYPm5kO9.jpg"),
    F(1003596,"movie","Avengers: Doomsday",2026,0.0,"/jzPwsojjFStf5lR5Nm07w2hH56G.jpg","/g3gpP5YDbA85DsA0bt5mgGQIe5q.jpg"),
    F(300146,"tv","Where the Mask Ends",2026,9.0,"/cE9Og0lCCRCP2RArarzJXmu6xEB.jpg","/YndvGwqwroUDVltBWmnOuTvJke.jpg"),
    F(1148365,"movie","Matchbox the Movie",2026,7.8,"/lFKA4GMz36dImEy3DQPdPF7G4V9.jpg","/jdJsnhHfkIi3J7jwfiCFT4gXNx5.jpg"),
    F(285322,"tv","Below",2026,7.2,"/vgLqqhMUbljp585qPp1EFCyJtcz.jpg","/cn0feYcDvVzVjUDoXa1O8sRgzz.jpg")
  ],
  movies: [
    F(969681,"movie","Spider-Man: Brand New Day",2026,8.5,"/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg","/r08LxMJCbf1SiJIWeyH9aJmdqwC.jpg"),
    F(1058424,"movie","Hope",2026,6.9,"/6VY1ZKgpsc8CfGsQcCGiYEgHdH0.jpg","/qqHFLg90IUSoTmSMpKOOW5RyqN3.jpg"),
    F(1148365,"movie","Matchbox the Movie",2026,7.8,"/lFKA4GMz36dImEy3DQPdPF7G4V9.jpg","/jdJsnhHfkIi3J7jwfiCFT4gXNx5.jpg"),
    F(1291595,"movie","Insidious: Out of the Further",2026,7.7,"/4tTrW9dXCByS5wt2pXVWb58zNjz.jpg","/p40lmrdI4blcAPZQMTPaiy5v5Ym.jpg"),
    F(1368337,"movie","The Odyssey",2026,8.0,"/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg","/nVBzWBqHTB3XD0iqWiJLfKLo5fq.jpg"),
    F(1101412,"movie","Fall 2: Deadpoint",2026,7.3,"/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg","/nGau0KBOaRILSK5MqFcuTfv7GMl.jpg"),
    F(1228834,"movie","The Fix",2026,6.8,"/jlP8XDjZN89GrpM3je5Uf8Grqx8.jpg","/dJTWIecL2vxsCRl5G0lRhPsfrhc.jpg"),
    F(1236045,"movie","Animals",2026,7.0,"/iISM36voS1E8gX9BM0DVK0kgi3E.jpg","/tzoarEu7TsG959upiELyYPm5kO9.jpg"),
    F(1377237,"movie","Runner",2026,8.3,"/yBKMAIj7clP42UkFejhGDBBoTpb.jpg","/npXZNWjOEYrqdMDPQ11SGBrXqAG.jpg"),
    F(1423191,"movie","Resident Evil",2026,7.3,"/i7UyjfPio0VFHB9rBUZSFyhOoM8.jpg","/3icyRAqgakNcQn6aDVz9libFmBA.jpg"),
    F(1153576,"movie","Street Fighter",2026,6.3,"/pwUb3gdkSrlyMZWs0MFOQg3N5s7.jpg","/5H5YphHsQmkQhrw13Wv1whCZKtN.jpg"),
    F(1561726,"movie","Masterplan",2026,7.0,"/5xmXVd7nCK3tAo34XkO58SxUCip.jpg","/dgUDj84BWtW6EZzee8BkgKnjDhh.jpg"),
    F(1712451,"movie","Resident Dead",2026,5.6,"/qKhMVWwFikSUzOpkhOl35GBLkGH.jpg","/yKx5gYrYgakKZuUWAsuFDStBroy.jpg"),
    F(1302904,"movie","Practical Magic 2",2026,7.0,"/ogwQOLbCfncjvBhFb5l0OmQH8KC.jpg","/oIglj0Jy9duG4LnrRUpH8n001Pk.jpg"),
    F(1514026,"movie","Buddy",2026,7.1,"/1BdZbNvl1SfrrX8J9X5tQzN6Ivu.jpg","/ytoLEl5yDaxB8AtZ52uKWjaQ9ql.jpg"),
    F(1084244,"movie","Toy Story 5",2026,8.3,"/sfQtVlIHljToOwYjhe21KPGzZWK.jpg","/qjTqY5coNiz6sVtPng40IzltsoN.jpg"),
    F(1375161,"movie","Don't Move",2026,5.5,"/uh0ZSdM8iOQgHwnUlhhanP8Dkl6.jpg","/1b0wNCRLYT3mGwvHyTEbqOk98Ix.jpg"),
    F(1294189,"movie","The Mongoose",2026,0.0,"/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg","/iRIhPqqoUHiFBxn8oYf3gCQnaKk.jpg"),
    F(1339274,"movie","Don't Leave the Kids Alone",2026,6.8,"/7kaglo9sblVsQrKsUqaVxrfc6ag.jpg","/flo7Xmyxz2wDUjr5Ff0VrxaVwlY.jpg"),
    F(1101383,"movie","The End of Oak Street",2026,7.1,"/hkPxuAMEqIqo1HCtIi4sqx0GRuP.jpg","/b9q9VmbXDvJmTziRqkwdEmFdwhr.jpg"),
    F(460458,"movie","Resident Evil: Welcome to Raccoon City",2021,5.9,"/bArhvjRHl535XMaSh9VjInF2mSZ.jpg","/wYtEvBmpBRXPdwGgr1gcWiwJSI7.jpg"),
    F(1389172,"movie","Reporting Live",2026,7.4,"/xVabS4lTi6IMscr2FOucxydE6ZD.jpg","/faJB8DXU0LXwq5ebMLj5drz8S4N.jpg"),
    F(1232569,"movie","Pinocchio: Unstrung",2026,6.5,"/hJNdizFlxOW89edX3Rzr6OliSFI.jpg","/7RsPdXLDNugDIlwXPVeeprNfMx.jpg"),
    F(1204680,"movie","Coyote vs. Acme",2026,7.5,"/kYDCl2y0VPvhT5eYWbMRInPoB03.jpg","/viZqGq9TNvQ5uXSD4ahg2RpRONT.jpg")
  ],
  tv: [
    F(91759,"tv","Come Home Love: Lo and Behold",2017,5.4,"/lgD4j9gUGmMckZpWWRJjorWqGVT.jpg","/dyFTt1a9ZpFdKE96kPlE9fQvXOJ.jpg"),
    F(22980,"tv","Watch What Happens Live with Andy Cohen",2009,4.9,"/onSD9UXfJwrMXWhq7UY7hGF2S1h.jpg","/hINekSpbcBxjnjGqmIm6I4bz2ab.jpg"),
    F(2261,"tv","The Tonight Show Starring Johnny Carson",1962,7.6,"/uSvET5YUvHNDIeoCpErrbSmasFb.jpg","/qFfWFwfaEHzDLWLuttWiYq7Poy2.jpg"),
    F(2734,"tv","Law & Order: Special Victims Unit",1999,8.0,"/pHNhUwSXuDQ9jPZOCb8SgJaQZsc.jpg","/xhK9YCxNwnE0OB1SWvCY39heHQI.jpg"),
    F(59941,"tv","The Tonight Show Starring Jimmy Fallon",2014,5.8,"/1N4o5PmmqhlVDrcdJ2RlCFWbLGX.jpg","/i4OYRb5V13BrOnTPJGdyXWg4r0J.jpg"),
    F(549,"tv","Law & Order",1990,7.3,"/hmd2tEtjolLWpNLCTvXS2PO5VCi.jpg","/hrfP9BQ4mOMZOa8nHbFJLSDHBLz.jpg"),
    F(456,"tv","The Simpsons",1989,8.0,"/tf0CUEynk6GfmrlHIQKQ5mfFP5P.jpg","/jIArNHIekrCSVgdMbKPAXpPY03Y.jpg"),
    F(33238,"tv","Running Man",2010,8.2,"/2Wmmu1MkqxJ48J7aySET9EKEjXz.jpg","/wsHj4oHQJoe7DMYaqNFwVoyLiAh.jpg"),
    F(108978,"tv","Reacher",2022,8.1,"/f1VCQIG2iCyOookdgOzwtUpwWC0.jpg","/pF0qkRsrHkdYadPWY9AMeFZfcwk.jpg"),
    F(61818,"tv","Late Night with Seth Meyers",2014,5.1,"/u0ttHM5ZQCvnfL0lkueEgS4h2nI.jpg","/dfX2UaHVE5c7kLBFbgmEZJuy4Ev.jpg"),
    F(4614,"tv","NCIS",2003,7.6,"/y4fGncqELtnvRQuwSpuH8LncZqU.jpg","/c1aBrG5s5xFa6Tbnihu2Hhj4t2q.jpg"),
    F(63770,"tv","The Late Show with Stephen Colbert",2015,6.1,"/9jkThAGYj2yp8jsS6Nriy5mzKFT.jpg","/gMMnf8VRg3Z98WaFmOLr9Jk8pIs.jpg"),
    F(1416,"tv","Grey's Anatomy",2005,8.2,"/gO8Fo47KV1opiutRDdBS5jclTQB.jpg","/A4NwkQXTXElE5iAsne5RpvS8R2Z.jpg"),
    F(15325,"tv","Dagsrevyen",1958,8.0,"/5wGSp6VaXG406ZbgQoJizPKUE79.jpg","/lBXXZJAUN1UbuoAXxjCMVPp6hSD.jpg"),
    F(5920,"tv","The Mentalist",2008,8.4,"/acYXu4KaDj1NIkMgObnhe4C4a0T.jpg","/rJFqKcmMSttdNP58l0dVzY2NcTA.jpg"),
    F(65733,"tv","Doraemon",2005,8.1,"/9ZN1P32SHviL3SV51qLivxycvcx.jpg","/c2oiRa7V3bQzof4wVGzLXtWJ5QU.jpg"),
    F(15226,"tv","C.I.D.",1998,5.8,"/3UymnlLfLMKxG8OcFhSnAlnhQfZ.jpg","/1gZrOa2E9DOohEvSLLBJqus2zGu.jpg"),
    F(2224,"tv","The Daily Show",1996,6.4,"/ixcfyK7it6FjRM36Te4OdblAq4X.jpg","/qLMfcvdCcCGD2BNLH8b6ZCBuO7D.jpg"),
    F(213375,"tv","VisionQuest",2026,8.8,"/WGyAyBPncfuu8MZhLY9RtfZPM0.jpg","/uoXXbN2PrOxH6UKyP7kYwmGpAAP.jpg"),
    F(1622,"tv","Supernatural",2005,8.3,"/8iixmfGx5EIFPdpNvB2JvI3VIqX.jpg","/lirPqYLTtd6XZqGn4cS1wiesTq0.jpg"),
    F(1434,"tv","Family Guy",1999,7.4,"/3PFsEuAiyLkWsP4GG6dIV37Q6gu.jpg","/jbTqU6BJMufoMnPSlO4ThrcXs3Y.jpg"),
    F(14424,"tv","Young Hearts",1995,6.3,"/bF24r2FxsjzgkJcrbBU8RC9JVoU.jpg","/7Vpk75SxS86Ai7o2iilJUz5rx4x.jpg"),
    F(206559,"tv","Binnelanders",2005,5.5,"/3bzECfllho8PphdYujLUIuhncJD.jpg","/s1dTt4M31q2HwD5Fkl1tf5tQzJg.jpg"),
    F(4057,"tv","Criminal Minds",2005,8.3,"/hWSb4UnIjlTvnvrP98NbFSO60HA.jpg","/tUtXfyVy54BY7eJnRtI8Xnmr1ZL.jpg")
  ],
  top: [
    F(1560520,"movie","Batman: Knightfall Part 1: Knightfall",2026,9.1,"/360qdtu2hLnqMu8SVHMywn420w1.jpg","/caBIySpwuFi2i7ynvHIlnxJLOdN.jpg"),
    F(980431,"movie","Avatar Aang: The Last Airbender",2026,9.1,"/3sgnSfNT27Bx5O5ukr7B26mhEQq.jpg","/ezbrL1dMymKQZw7mDEWa2ZTzN7d.jpg"),
    F(1007757,"movie","Swapped",2026,8.9,"/tHhxWxge06goXU6ZQH1hj7vK8Hd.jpg","/zMwhWailP1WY7sb6AoE6b8ugoy.jpg"),
    F(1632181,"movie","Accidental Partners",2026,8.8,"/j0CIVzeR7hRAPBPGR54qDZoOQpp.jpg","/iCML6fBe3X0y06P33bM7dyYXPKZ.jpg"),
    F(1311031,"movie","Demon Slayer: Kimetsu no Yaiba Infinity Castle",2025,8.8,"/fWVSwgjpT2D78VUh6X8UBd2rorW.jpg","/1RgPyOhN4DRs225BGTlHJqCudII.jpg"),
    F(1621552,"movie","Facing El Chapo",2026,8.8,"/alpf5v4UqSFawPmG9RX03Or4BDk.jpg","/c4U96GrPRfnNrS01mBtqnocvlLJ.jpg"),
    F(278,"movie","The Shawshank Redemption",1994,8.7,"/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg","/pNjh59JSxChQktamG3LMp9ZoQzp.jpg"),
    F(238,"movie","The Godfather",1972,8.7,"/3bhkrj58Vtu7enYsRolD1fZdja1.jpg","/ejdD20cdHNFAYAN2DlqPToXKyzx.jpg"),
    F(687163,"movie","Project Hail Mary",2026,8.6,"/iOb2fjXLbpJgyQXe46n1WtGCnaa.jpg","/8Tfys3mDZVp4tNoH2ktm06a0Tau.jpg"),
    F(936075,"movie","Michael",2026,8.6,"/dueFqKLvjftnELZaGYwY7xinfaI.jpg","/ufSwlnECLoUbBjPrFqEQcWBzHwc.jpg"),
    F(1232449,"movie","Young Hearts",2024,8.6,"/iGCtYxfuvXfy0BD5m6p7vKuPOxS.jpg","/3HaqAPZ0C8n6Hd5T86U53yJlBAN.jpg"),
    F(389,"movie","12 Angry Men",1957,8.6,"/zhG3vKWyDRaZYoaww1UVAi29T9h.jpg","/qqHQsStV6exghCM7zbObuYBiYxw.jpg"),
    F(240,"movie","The Godfather Part II",1974,8.6,"/8a1lJs7mFyGhGhZZDT1azJUoQiZ.jpg","/pGzqRKrYeK4LogoysNro0vG8d8N.jpg"),
    F(424,"movie","Schindler's List",1993,8.6,"/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg","/zb6fM1CX41D9rF9hdgclu0peUmy.jpg"),
    F(1630423,"movie","My Dearest Assassin",2026,8.6,"/ul4dQcA68mtSx8J56N5gEcaCCtP.jpg","/xA6AM5MvEkieZKlv1Tn3sN23I7i.jpg"),
    F(1218925,"movie","Chainsaw Man - The Movie: Reze Arc",2025,8.5,"/pHyxb2RV5wLlboAwm9ZJ9qTVEDw.jpg","/gqTz24ZRsCP6AKjARmEivY7m0cK.jpg"),
    F(155,"movie","The Dark Knight",2008,8.5,"/qJ2tW6WMUDux911r6m7haRef0WH.jpg","/9FE5eD92WfVCiivM9Pq9GVSrlWk.jpg"),
    F(129,"movie","Spirited Away",2001,8.5,"/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg","/6oaL4DP75yABrd5EbC4H2zq5ghc.jpg"),
    F(497,"movie","The Green Mile",1999,8.5,"/8VG8fDNiy50H4FedGwdSVUPoaJe.jpg","/amZavErrjrdgDwhsIdpWxHNenIx.jpg"),
    F(122,"movie","The Lord of the Rings: The Return of the King",2003,8.5,"/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg","/ctiw6FZK4N36LmkjSklWEbuvlq9.jpg"),
    F(19404,"movie","Dilwale Dulhania Le Jayenge",1995,8.5,"/lfRkUr7DYdHldAqi3PwdQGBRBPM.jpg","/7VDLEHli74eLsYLNcq9djn1Gw76.jpg"),
    F(372058,"movie","Your Name.",2016,8.5,"/vfJFJPepRKapMd5G2ro7klIRysq.jpg","/mMtUybQ6hL24FXo0F3Z4j2KG7kZ.jpg"),
    F(157336,"movie","Interstellar",2014,8.5,"/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg","/8sNiAPPYU14PUepFNeSNGUTiHW.jpg"),
    F(496243,"movie","Parasite",2019,8.5,"/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg","/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg")
  ],
  now: [
    F(1058424,"movie","Hope",2026,6.9,"/6VY1ZKgpsc8CfGsQcCGiYEgHdH0.jpg","/qqHFLg90IUSoTmSMpKOOW5RyqN3.jpg"),
    F(1148365,"movie","Matchbox the Movie",2026,7.8,"/lFKA4GMz36dImEy3DQPdPF7G4V9.jpg","/jdJsnhHfkIi3J7jwfiCFT4gXNx5.jpg"),
    F(1368337,"movie","The Odyssey",2026,8.0,"/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg","/nVBzWBqHTB3XD0iqWiJLfKLo5fq.jpg"),
    F(1101412,"movie","Fall 2: Deadpoint",2026,7.3,"/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg","/nGau0KBOaRILSK5MqFcuTfv7GMl.jpg"),
    F(1228834,"movie","The Fix",2026,6.8,"/jlP8XDjZN89GrpM3je5Uf8Grqx8.jpg","/dJTWIecL2vxsCRl5G0lRhPsfrhc.jpg"),
    F(1236045,"movie","Animals",2026,7.0,"/iISM36voS1E8gX9BM0DVK0kgi3E.jpg","/tzoarEu7TsG959upiELyYPm5kO9.jpg"),
    F(1377237,"movie","Runner",2026,8.3,"/yBKMAIj7clP42UkFejhGDBBoTpb.jpg","/npXZNWjOEYrqdMDPQ11SGBrXqAG.jpg"),
    F(1423191,"movie","Resident Evil",2026,7.3,"/i7UyjfPio0VFHB9rBUZSFyhOoM8.jpg","/3icyRAqgakNcQn6aDVz9libFmBA.jpg"),
    F(1153576,"movie","Street Fighter",2026,6.3,"/pwUb3gdkSrlyMZWs0MFOQg3N5s7.jpg","/5H5YphHsQmkQhrw13Wv1whCZKtN.jpg"),
    F(1561726,"movie","Masterplan",2026,7.1,"/5xmXVd7nCK3tAo34XkO58SxUCip.jpg","/dgUDj84BWtW6EZzee8BkgKnjDhh.jpg"),
    F(1302904,"movie","Practical Magic 2",2026,7.0,"/ogwQOLbCfncjvBhFb5l0OmQH8KC.jpg","/oIglj0Jy9duG4LnrRUpH8n001Pk.jpg"),
    F(1514026,"movie","Buddy",2026,7.1,"/1BdZbNvl1SfrrX8J9X5tQzN6Ivu.jpg","/ytoLEl5yDaxB8AtZ52uKWjaQ9ql.jpg"),
    F(1375161,"movie","Don't Move",2026,5.5,"/uh0ZSdM8iOQgHwnUlhhanP8Dkl6.jpg","/1b0wNCRLYT3mGwvHyTEbqOk98Ix.jpg"),
    F(1389172,"movie","Reporting Live",2026,7.4,"/xVabS4lTi6IMscr2FOucxydE6ZD.jpg","/faJB8DXU0LXwq5ebMLj5drz8S4N.jpg"),
    F(1232569,"movie","Pinocchio: Unstrung",2026,6.5,"/hJNdizFlxOW89edX3Rzr6OliSFI.jpg","/7RsPdXLDNugDIlwXPVeeprNfMx.jpg"),
    F(1204680,"movie","Coyote vs. Acme",2026,7.5,"/kYDCl2y0VPvhT5eYWbMRInPoB03.jpg","/viZqGq9TNvQ5uXSD4ahg2RpRONT.jpg"),
    F(1400837,"movie","Other Mommy",2026,6.0,"/fGRNCssTRrhYZxNzykGGCoMsAVq.jpg","/ncm7djsVTHQQMX2HEbEVxMUFchG.jpg"),
    F(1339713,"movie","Obsession",2026,8.2,"/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg","/5lTZyuBTNOfawsfPT8Q0cIg6qAF.jpg"),
    F(1275779,"movie","Disclosure Day",2026,7.4,"/AnJ8IQJI23hNpYXVNaythu061Ru.jpg","/1e0KDRYKRPHiVNj8yQKYuU2jVyQ.jpg"),
    F(1381078,"movie","Love of Your Life",2026,6.9,"/dL3Tcv4FU2K85bgnGRBgLjFSrLr.jpg","/mqYqKvrKTgMvK50VtEDZlYFsnHz.jpg"),
    F(1255833,"movie","Whalefall",2026,6.7,"/vjTYUTgh9nO88i6HZ4YPRhiFL05.jpg","/shW2jHkQLZVv4Fko2rJDqTGU0gx.jpg"),
    F(1288445,"movie","Mutiny",2026,7.6,"/pu2VxGlpGwffOx292w18b1tv96j.jpg","/e2QAGrEmbpmZpMymDRkDisJkvg9.jpg"),
    F(9479,"movie","The Nightmare Before Christmas",1993,7.9,"/oQffRNjK8e19rF7xVYEN8ew0j7b.jpg","/dSfrsjhqC6lYe7LYDYnzWeXZmEl.jpg"),
    F(1288069,"movie","Tenzing",2026,8.3,"/eI0QW02PYqhnmIvLRdn9vrfVVP7.jpg","/6GXqVvL20Y0MpyVP30WoI2NPK69.jpg")
  ]
};
