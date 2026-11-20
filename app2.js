
/* Built-in snapshot of popular stars (real TMDB people + their
   best-known acting credits, fetched Oct 2026), so the Popular Stars
   row and a star's filmography also render when TMDB is unreachable.
   Live mode replaces the row with /person/popular and loads full
   combined credits per star. */
var FALLBACK_PEOPLE = [
  { id:500, name:"Tom Cruise", profile_path:"/maf8PhSvDCdEwjEMbYfGpojR5RP.jpg", known_for_department:"Acting", credits:[
    { id:1248832, media_type:"movie", title:"Digger", release_date:"2026-09-28", vote_average:7.5, poster_path:"/1ATXKrIPJyKNwnJ6lcG088Sa6zi.jpg" },
    { id:361743, media_type:"movie", title:"Top Gun: Maverick", release_date:"2022-05-21", vote_average:8.2, poster_path:"/n0YuM4f5lvGAP6MAW2kBIzugXnc.jpg" },
    { id:575265, media_type:"movie", title:"Mission: Impossible - The Final Reckoning", release_date:"2025-05-17", vote_average:7.2, poster_path:"/iKPsC9EFUafRP9SrUznI61getVP.jpg" },
    { id:954, media_type:"movie", title:"Mission: Impossible", release_date:"1996-05-22", vote_average:7.0, poster_path:"/l5uxY5m5OInWpcExIpKG6AR3rgL.jpg" },
    { id:74, media_type:"movie", title:"War of the Worlds", release_date:"2005-06-28", vote_average:6.6, poster_path:"/6Biy7R9LfumYshur3YKhpj56MpB.jpg" },
    { id:744, media_type:"movie", title:"Top Gun", release_date:"1986-05-16", vote_average:7.1, poster_path:"/xUuHj3CgmZQ9P2cMaqQs4J0d4Zc.jpg" },
  ] },
  { id:1245, name:"Scarlett Johansson", profile_path:"/tgxYh3jMs5bY2Ub4d2dcp9iaz1R.jpg", known_for_department:"Acting", credits:[
    { id:299536, media_type:"movie", title:"Avengers: Infinity War", release_date:"2018-04-25", vote_average:8.2, poster_path:"/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg" },
    { id:299534, media_type:"movie", title:"Avengers: Endgame", release_date:"2019-04-24", vote_average:8.2, poster_path:"/bR8ISy1O9XQxqiy0fQFw2BX72RQ.jpg" },
    { id:24428, media_type:"movie", title:"The Avengers", release_date:"2012-04-25", vote_average:8.1, poster_path:"/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg" },
    { id:99861, media_type:"movie", title:"Avengers: Age of Ultron", release_date:"2015-04-22", vote_average:7.3, poster_path:"/4ssDuvEDkSArWEdyBl2X5EHvYKU.jpg" },
    { id:1234821, media_type:"movie", title:"Jurassic World Rebirth", release_date:"2025-06-23", vote_average:6.2, poster_path:"/1RICxzeoNCAO5NpcRMIgg1XT6fm.jpg" },
    { id:709, media_type:"tv", title:"Robot Chicken", first_air_date:"2005-02-20", vote_average:7.6, poster_path:"/x5O2W1JulF0TM16HEITgVNML3KS.jpg" },
  ] },
  { id:6193, name:"Leonardo DiCaprio", profile_path:"/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg", known_for_department:"Acting", credits:[
    { id:466420, media_type:"movie", title:"Killers of the Flower Moon", release_date:"2023-10-18", vote_average:7.4, poster_path:"/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg" },
    { id:466272, media_type:"movie", title:"Once Upon a Time... in Hollywood", release_date:"2019-07-24", vote_average:7.4, poster_path:"/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg" },
    { id:27205, media_type:"movie", title:"Inception", release_date:"2010-07-15", vote_average:8.4, poster_path:"/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg" },
    { id:597, media_type:"movie", title:"Titanic", release_date:"1997-12-18", vote_average:7.9, poster_path:"/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg" },
    { id:68718, media_type:"movie", title:"Django Unchained", release_date:"2012-12-25", vote_average:8.2, poster_path:"/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg" },
    { id:106646, media_type:"movie", title:"The Wolf of Wall Street", release_date:"2013-12-25", vote_average:8.0, poster_path:"/kW9LmvYHAaS9iA0tHmZVq8hQYoq.jpg" },
  ] },
  { id:287, name:"Brad Pitt", profile_path:"/ajNaPmXVVMJFg9GWmu6MJzTaXdV.jpg", known_for_department:"Acting", credits:[
    { id:911430, media_type:"movie", title:"F1", release_date:"2025-06-25", vote_average:7.8, poster_path:"/9PXZIUsSDh4alB80jheWX4fhZmy.jpg" },
    { id:2122, media_type:"tv", title:"King of the Hill", first_air_date:"1997-01-12", vote_average:7.4, poster_path:"/e2xyMapmYgv4AuSoSDv9Y4pQlD6.jpg" },
    { id:40, media_type:"tv", title:"Dallas", first_air_date:"1978-04-02", vote_average:6.9, poster_path:"/jmqo8bgHrhKYPc0RK5F71GHa8rm.jpg" },
    { id:466272, media_type:"movie", title:"Once Upon a Time... in Hollywood", release_date:"2019-07-24", vote_average:7.4, poster_path:"/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg" },
    { id:1263337, media_type:"movie", title:"Heart of the Beast", release_date:"2026-09-19", vote_average:7.4, poster_path:"/1ApfSA8JTqeha3GTFEY8syV4auq.jpg" },
    { id:72190, media_type:"movie", title:"World War Z", release_date:"2013-06-19", vote_average:6.9, poster_path:"/aCnVdvExw6UWSeQfr0tUH3jr4qG.jpg" },
  ] },
  { id:6384, name:"Keanu Reeves", profile_path:"/8RZLOyYGsoRe9p44q3xin9QkMHv.jpg", known_for_department:"Acting", credits:[
    { id:1084244, media_type:"movie", title:"Toy Story 5", release_date:"2026-06-17", vote_average:8.3, poster_path:"/sfQtVlIHljToOwYjhe21KPGzZWK.jpg" },
    { id:603, media_type:"movie", title:"The Matrix", release_date:"1999-03-31", vote_average:8.3, poster_path:"/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg" },
    { id:603692, media_type:"movie", title:"John Wick: Chapter 4", release_date:"2023-03-21", vote_average:7.7, poster_path:"/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg" },
    { id:541671, media_type:"movie", title:"Ballerina", release_date:"2025-06-04", vote_average:7.3, poster_path:"/2VUmvqsHb6cEtdfscEA6fqqVzLg.jpg" },
    { id:939243, media_type:"movie", title:"Sonic the Hedgehog 3", release_date:"2024-12-19", vote_average:7.6, poster_path:"/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg" },
    { id:324552, media_type:"movie", title:"John Wick: Chapter 2", release_date:"2017-02-08", vote_average:7.3, poster_path:"/hXWBc0ioZP3cN4zCu6SN3YHXZVO.jpg" },
  ] },
  { id:18918, name:"Dwayne Johnson", profile_path:"/5QApZVV8FUFlVxQpIK3Ew6cqotq.jpg", known_for_department:"Acting", credits:[
    { id:1434, media_type:"tv", title:"Family Guy", first_air_date:"1999-01-31", vote_average:7.4, poster_path:"/3PFsEuAiyLkWsP4GG6dIV37Q6gu.jpg" },
    { id:1084242, media_type:"movie", title:"Zootopia 2", release_date:"2025-11-26", vote_average:7.7, poster_path:"/oJ7g2CifqpStmoYQyaLQgEU32qO.jpg" },
    { id:1855, media_type:"tv", title:"Star Trek: Voyager", first_air_date:"1995-01-16", vote_average:7.8, poster_path:"/gNS5tRSG3UlXodCxznKKOKweqxh.jpg" },
    { id:1108427, media_type:"movie", title:"Moana", release_date:"2026-07-08", vote_average:7.5, poster_path:"/gaet1xQ2nxrG0V1Ep9T20ZMNEIC.jpg" },
    { id:52, media_type:"tv", title:"That '70s Show", first_air_date:"1998-08-23", vote_average:7.9, poster_path:"/laEZvTqM80UaplUaDSCCbWhlyEV.jpg" },
    { id:1241982, media_type:"movie", title:"Moana 2", release_date:"2024-11-21", vote_average:7.0, poster_path:"/aLVkiINlIeCkcZIzb7XHzPYgO6L.jpg" },
  ] },
  { id:3223, name:"Robert Downey Jr.", profile_path:"/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg", known_for_department:"Acting", credits:[
    { id:1003596, media_type:"movie", title:"Avengers: Doomsday", release_date:"2026-12-16", vote_average:0.0, poster_path:"/jzPwsojjFStf5lR5Nm07w2hH56G.jpg" },
    { id:1480, media_type:"tv", title:"Ally McBeal", first_air_date:"1997-09-08", vote_average:6.5, poster_path:"/weS8htxS2j0EQ6jorK3WOR1dZpH.jpg" },
    { id:1434, media_type:"tv", title:"Family Guy", first_air_date:"1999-01-31", vote_average:7.4, poster_path:"/3PFsEuAiyLkWsP4GG6dIV37Q6gu.jpg" },
    { id:299536, media_type:"movie", title:"Avengers: Infinity War", release_date:"2018-04-25", vote_average:8.2, poster_path:"/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg" },
    { id:299534, media_type:"movie", title:"Avengers: Endgame", release_date:"2019-04-24", vote_average:8.2, poster_path:"/bR8ISy1O9XQxqiy0fQFw2BX72RQ.jpg" },
    { id:24428, media_type:"movie", title:"The Avengers", release_date:"2012-04-25", vote_average:8.1, poster_path:"/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg" },
  ] },
  { id:234352, name:"Margot Robbie", profile_path:"/euDPyqLnuwaWMHajcU3oZ9uZezR.jpg", known_for_department:"Acting", credits:[
    { id:466272, media_type:"movie", title:"Once Upon a Time... in Hollywood", release_date:"2019-07-24", vote_average:7.4, poster_path:"/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg" },
    { id:436969, media_type:"movie", title:"The Suicide Squad", release_date:"2021-07-28", vote_average:7.4, poster_path:"/q61qEyssk2ku3okWICKArlAdhBn.jpg" },
    { id:106646, media_type:"movie", title:"The Wolf of Wall Street", release_date:"2013-12-25", vote_average:8.0, poster_path:"/kW9LmvYHAaS9iA0tHmZVq8hQYoq.jpg" },
    { id:346698, media_type:"movie", title:"Barbie", release_date:"2023-07-19", vote_average:6.9, poster_path:"/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg" },
    { id:2674, media_type:"tv", title:"Neighbours", first_air_date:"1985-03-18", vote_average:6.1, poster_path:"/bXY78bQsKCIiD17Sr6yO4wLIXqS.jpg" },
    { id:615777, media_type:"movie", title:"Babylon", release_date:"2022-12-22", vote_average:7.3, poster_path:"/wjOHjWCUE0YzDiEzKv8AfqHj3ir.jpg" },
  ] },
  { id:505710, name:"Zendaya", profile_path:"/qGkBlyn1AwQpuFnRARMRwj0iHZp.jpg", known_for_department:"Acting", credits:[
    { id:969681, media_type:"movie", title:"Spider-Man: Brand New Day", release_date:"2026-07-29", vote_average:8.5, poster_path:"/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg" },
    { id:1368337, media_type:"movie", title:"The Odyssey", release_date:"2026-07-15", vote_average:8.0, poster_path:"/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg" },
    { id:85552, media_type:"tv", title:"Euphoria", first_air_date:"2019-06-16", vote_average:8.3, poster_path:"/aJrG7OkoTMPWG5c8opz8a93AZPY.jpg" },
    { id:634649, media_type:"movie", title:"Spider-Man: No Way Home", release_date:"2021-12-15", vote_average:7.9, poster_path:"/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg" },
    { id:693134, media_type:"movie", title:"Dune: Part Two", release_date:"2024-02-27", vote_average:8.1, poster_path:"/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg" },
    { id:438631, media_type:"movie", title:"Dune", release_date:"2021-09-15", vote_average:7.8, poster_path:"/v1tRXZ4JtD2Iv6fjkPvT4GiwslV.jpg" },
  ] },
  { id:1190668, name:"Timothée Chalamet", profile_path:"/dFxpwRpmzpVfP1zjluH68DeQhyj.jpg", known_for_department:"Acting", credits:[
    { id:549, media_type:"tv", title:"Law & Order", first_air_date:"1990-09-13", vote_average:7.3, poster_path:"/hmd2tEtjolLWpNLCTvXS2PO5VCi.jpg" },
    { id:1407, media_type:"tv", title:"Homeland", first_air_date:"2011-10-02", vote_average:7.6, poster_path:"/6GAvS2e6VIRsms9FpVt33PsCoEW.jpg" },
    { id:157336, media_type:"movie", title:"Interstellar", release_date:"2014-11-04", vote_average:8.5, poster_path:"/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg" },
    { id:693134, media_type:"movie", title:"Dune: Part Two", release_date:"2024-02-27", vote_average:8.1, poster_path:"/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg" },
    { id:438631, media_type:"movie", title:"Dune", release_date:"2021-09-15", vote_average:7.8, poster_path:"/v1tRXZ4JtD2Iv6fjkPvT4GiwslV.jpg" },
    { id:398818, media_type:"movie", title:"Call Me by Your Name", release_date:"2017-10-01", vote_average:8.1, poster_path:"/gXiE0WveDnT0n5J4sW9TMxXF4oT.jpg" },
  ] },
  { id:2037, name:"Cillian Murphy", profile_path:"/2lKs67r7FI4bPu0AXxMUJZxmUXn.jpg", known_for_department:"Acting", credits:[
    { id:60574, media_type:"tv", title:"Peaky Blinders", first_air_date:"2013-09-12", vote_average:8.5, poster_path:"/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg" },
    { id:872585, media_type:"movie", title:"Oppenheimer", release_date:"2023-07-19", vote_average:8.0, poster_path:"/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
    { id:27205, media_type:"movie", title:"Inception", release_date:"2010-07-15", vote_average:8.4, poster_path:"/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg" },
    { id:155, media_type:"movie", title:"The Dark Knight", release_date:"2008-07-16", vote_average:8.5, poster_path:"/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
    { id:272, media_type:"movie", title:"Batman Begins", release_date:"2005-06-10", vote_average:7.7, poster_path:"/sPX89Td70IDDjVr85jdSBb4rWGr.jpg" },
    { id:49026, media_type:"movie", title:"The Dark Knight Rises", release_date:"2012-07-17", vote_average:7.8, poster_path:"/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg" },
  ] },
  { id:974169, name:"Jenna Ortega", profile_path:"/cV4x7jNmsGLdKZn5I6xVF3Ltnmg.jpg", known_for_department:"Acting", credits:[
    { id:119051, media_type:"tv", title:"Wednesday", first_air_date:"2022-11-23", vote_average:8.3, poster_path:"/9PFonBhy4cQy7Jz20NpMygczOkv.jpg" },
    { id:78191, media_type:"tv", title:"You", first_air_date:"2018-09-09", vote_average:8.0, poster_path:"/oANi0vEE92nuijiZQgPZ88FSxqQ.jpg" },
    { id:2458, media_type:"tv", title:"CSI: NY", first_air_date:"2004-09-22", vote_average:7.3, poster_path:"/4TGV4Bb3OPay4cHkQRlfwghv3vC.jpg" },
    { id:68721, media_type:"movie", title:"Iron Man 3", release_date:"2013-04-18", vote_average:6.9, poster_path:"/qhPtAc1TKbMPqNvcdXSOn9Bn7hZ.jpg" },
    { id:61418, media_type:"tv", title:"Jane the Virgin", first_air_date:"2014-10-13", vote_average:7.9, poster_path:"/DRRHgvsNEfBloMgIP8bBw4zi4E.jpg" },
    { id:917496, media_type:"movie", title:"Beetlejuice Beetlejuice", release_date:"2024-09-04", vote_average:6.9, poster_path:"/kKgQzkUCnQmeTPkyIwHly2t6ZFI.jpg" },
  ] },
  { id:35742, name:"Shah Rukh Khan", profile_path:"/tKeQhSyXyzlzxNtxFq24iIvzXrC.jpg", known_for_department:"Acting", credits:[
    { id:19404, media_type:"movie", title:"Dilwale Dulhania Le Jayenge", release_date:"1995-10-20", vote_average:8.5, poster_path:"/lfRkUr7DYdHldAqi3PwdQGBRBPM.jpg" },
    { id:26022, media_type:"movie", title:"My Name Is Khan", release_date:"2010-02-11", vote_average:8.0, poster_path:"/5Y36lCiNyyV71mjq6LavgiggbhT.jpg" },
    { id:247043, media_type:"tv", title:"The Ba***ds of Bollywood", first_air_date:"2025-09-18", vote_average:6.9, poster_path:"/6QFnXFx5XJAp0SxMd9g23cbti4m.jpg" },
    { id:872906, media_type:"movie", title:"Jawan", release_date:"2023-09-07", vote_average:7.0, poster_path:"/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg" },
    { id:8079, media_type:"movie", title:"Om Shanti Om", release_date:"2007-11-07", vote_average:7.1, poster_path:"/oArsQTD4bPPMtRjqr03SO9W6phF.jpg" },
    { id:10757, media_type:"movie", title:"Kabhi Khushi Kabhie Gham", release_date:"2001-12-14", vote_average:7.7, poster_path:"/eJrD94E1msYEa0DygvkvdEKpChm.jpg" },
  ] },
  { id:73249, name:"Lee Jung-jae", profile_path:"/lx8oiTXL9lIx78KOXlrlvNfoz43.jpg", known_for_department:"Acting", credits:[
    { id:93405, media_type:"tv", title:"Squid Game", first_air_date:"2021-09-17", vote_average:7.9, poster_path:"/1QdXdRYfktUSONkl1oD5gc6Be0s.jpg" },
    { id:114479, media_type:"tv", title:"The Acolyte", first_air_date:"2024-06-04", vote_average:5.3, poster_path:"/mztdt3y6GBsJR69zHtszFezTCLT.jpg" },
    { id:397567, media_type:"movie", title:"Along with the Gods: The Two Worlds", release_date:"2017-12-20", vote_average:8.1, poster_path:"/gJSvIsI6oQfFim0PGyuuiCYfqKs.jpg" },
    { id:124157, media_type:"movie", title:"The Thieves", release_date:"2012-07-25", vote_average:6.8, poster_path:"/eYJihoMqME80tp9uJIpIlRF9RI0.jpg" },
    { id:518068, media_type:"movie", title:"Along with the Gods: The Last 49 Days", release_date:"2018-08-01", vote_average:8.0, poster_path:"/9BnqBHFGDv3WlCPB2qQwzAWdy7y.jpg" },
    { id:285770, media_type:"tv", title:"Nice to Not Meet You", first_air_date:"2025-11-03", vote_average:7.7, poster_path:"/h14bGZcVxYQzLoxC8KYqUVWvYfU.jpg" },
  ] },
  { id:20738, name:"Song Kang-ho", profile_path:"/kBM9UTPYXUA2RNk210DXhztLFns.jpg", known_for_department:"Acting", credits:[
    { id:496243, media_type:"movie", title:"Parasite", release_date:"2019-05-30", vote_average:8.5, poster_path:"/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg" },
    { id:154385, media_type:"tv", title:"BEEF", first_air_date:"2023-04-06", vote_average:7.8, poster_path:"/25ih0Xq2zWbxhhKxwhvswKYQyEr.jpg" },
    { id:11423, media_type:"movie", title:"Memories of Murder", release_date:"2003-04-25", vote_average:8.1, poster_path:"/jcgUjx1QcupGzjntTVlnQ15lHqy.jpg" },
    { id:1255, media_type:"movie", title:"The Host", release_date:"2006-07-27", vote_average:7.0, poster_path:"/dEDLY3KeghKFzks5nTDWdigVikr.jpg" },
    { id:110415, media_type:"movie", title:"Snowpiercer", release_date:"2013-08-01", vote_average:6.9, poster_path:"/kw6YQudA0TMcNmGUGy5XIw7zbnV.jpg" },
    { id:4689, media_type:"movie", title:"Sympathy for Mr. Vengeance", release_date:"2002-03-29", vote_average:7.5, poster_path:"/uj42ubGbgVL65T10SvPVr0p9mJc.jpg" },
  ] },
];
/* ---------------- State & helpers ---------------- */
var store = {};            /* key "movie:123" -> item */
var myList = {};           /* same keys, session only */
var heroItems = [], heroIdx = 0, heroTimer = null, heroFlip = false;
var currentItem = null;

function $(id){ return document.getElementById(id); }
function keyOf(it){ return (it.media_type || "movie") + ":" + it.id; }
function titleOf(it){ return it.title || it.name || "Untitled"; }
function yearOf(it){ var d = it.release_date || it.first_air_date || ""; return d ? d.slice(0,4) : ""; }
function typeOf(it){ return it.media_type === "tv" ? "tv" : "movie"; }
function register(list){ (list||[]).forEach(function(it){ if(it && it.id) store[keyOf(it)] = it; }); }
function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function matchPct(it){ var v = it.vote_average||0; return v ? Math.round(v*10) + t("matchSuffix") : ""; }
function genreNames(it){
  if (it.genres && it.genres.length) return it.genres.map(function(g){return g.name;});
  var map = LANG === "my" ? GENRES_MY : GENRES;
  return (it.genre_ids||[]).map(function(id){return map[id] || GENRES[id];}).filter(Boolean);
}
/* ---------------- Stream sources (with fallbacks) ----------------
   Each source is a different third-party host with its own embed URL
   format. If one host is blocked by a network or ISP, another usually
   works. The chosen source is kept for this session only. */
var SOURCES = [
  { id:"vidsrc", name:"VidSrc", url:function(it, s, e){
      return typeOf(it) === "tv" ? "https://vidsrc.me/embed/tv?tmdb=" + it.id
                                : "https://vidsrc.me/embed/movie?tmdb=" + it.id; },
    page:function(it, s, e){
      return typeOf(it) === "tv" ? "https://vidsrc.me/embed/tv?tmdb=" + it.id
                                : "https://vidsrc.me/embed/movie?tmdb=" + it.id; } },
  { id:"vidsrc-to", name:"VidSrc.to", url:function(it, s, e){
      return typeOf(it) === "tv" ? "https://vidsrc.to/embed/tv/" + it.id + "/" + s + "/" + e
                                : "https://vidsrc.to/embed/movie/" + it.id; },
    page:function(it, s, e){
      return typeOf(it) === "tv" ? "https://vidsrc.to/embed/tv/" + it.id + "/" + s + "/" + e
                                : "https://vidsrc.to/embed/movie?tmdb=" + it.id; } },
  { id:"embed2", name:"2Embed", url:function(it, s, e){
      return typeOf(it) === "tv" ? "https://www.2embed.cc/embedtvfull?tmdb=" + it.id
                                : "https://www.2embed.cc/embed/" + it.id; },
    page:function(it, s, e){
      return typeOf(it) === "tv" ? "https://www.2embed.cc/embedtvfull?tmdb=" + it.id
                                : "https://www.2embed.cc/embed/" + it.id; } },
  { id:"embedsu", name:"Embed.su", url:function(it, s, e){
      return typeOf(it) === "tv" ? "https://embed.su/embed/tv/" + it.id + "/" + s + "/" + e
                                : "https://embed.su/embed/movie/" + it.id; },
    page:function(it, s, e){
      return typeOf(it) === "tv" ? "https://embed.su/embed/tv/" + it.id + "/" + s + "/" + e
                                : "https://embed.su/embed/movie/" + it.id; } },
  { id:"superembed", name:"SuperEmbed", url:function(it, s, e){
      return typeOf(it) === "tv" ? "https://multiembed.mov/directstream.php?video_id=" + it.id + "&tmdb=1&s=" + s + "&e=" + e
                                : "https://multiembed.mov/?video_id=" + it.id + "&tmdb=1"; },
    page:function(it, s, e){
      return typeOf(it) === "tv" ? "https://multiembed.mov/directstream.php?video_id=" + it.id + "&tmdb=1&s=" + s + "&e=" + e
                                : "https://multiembed.mov/?video_id=" + it.id + "&tmdb=1"; } }
];
var currentSourceId = "vidsrc";
var epSeason = 1, epEpisode = 1;
function currentSource(){
  for (var i = 0; i < SOURCES.length; i++) if (SOURCES[i].id === currentSourceId) return SOURCES[i];
  return SOURCES[0];
}
function embedUrl(it){ return currentSource().url(it, epSeason, epEpisode); }
/* Direct player URL for the "open player in a new tab" link: each
   source's own embed player address, never its landing/info page
   (e.g. 2embed.skin/movie/ID), which is where a bare provider link
   or a redirect would otherwise land. */
function externalUrl(it){ return currentSource().page(it, epSeason, epEpisode); }
function overviewOf(it){ return (it && it.overview) || (it && OVERVIEWS[it.id]) || ""; }
function renderSourceBar(it){
  var wrap = $("srcBtns"); if (!wrap) return;
  wrap.innerHTML = "";
  SOURCES.forEach(function(s){
    var b = document.createElement("button");
    b.type = "button";
    b.className = "src-btn" + (s.id === currentSourceId ? " on" : "");
    b.textContent = s.name;
    b.onclick = function(){ setSource(s.id); };
    wrap.appendChild(b);
  });
  $("srcEp").style.display = typeOf(it) === "tv" ? "inline-flex" : "none";
  updateSourceUI(it);
}
function updateSourceUI(it){
  if (!it) return;
  $("embedUrlPreview").textContent = embedUrl(it);
  $("embedExternal").href = externalUrl(it);
  var pn = $("embedProviderName"); if (pn) pn.textContent = currentSource().name;
  var fs = $("factSource"); if (fs) fs.textContent = currentSource().name + " embed (iframe)";
}
function setSource(id){
  currentSourceId = id;
  if (!currentItem) return;
  renderSourceBar(currentItem);
  var f = $("playerFrame");
  if (f) { f.src = embedUrl(currentItem); recordHistory(currentItem); }
}
function cycleSource(){
  var i = SOURCES.indexOf(currentSource());
  setSource(SOURCES[(i + 1) % SOURCES.length].id);
  if (currentItem && !$("playerFrame")) startPlayer(currentItem);
}
function icons(){ if (window.lucide) lucide.createIcons(); }

/* ---------------- Cards & rows ---------------- */
function cardHTML(it){
  var poster = it.poster_path ? imgSrc(POSTER + it.poster_path) : "";
  var img = poster
    ? '<img loading="lazy" src="' + poster + '" alt="' + esc(titleOf(it)) + t("posterSuffix") + '" onerror="this.style.display=\'none\'">'
    : "";
  return '<button class="card" data-key="' + keyOf(it) + '" aria-label="' + esc(titleOf(it)) + '">' +
    '<span class="poster">' + img +
      '<span class="rank"><i data-lucide="star"></i>' + (it.vote_average ? Number(it.vote_average).toFixed(1) : "—") + '</span>' +
      '<span class="type">' + (typeOf(it) === "tv" ? t("seriesBadge") : t("filmBadge")) + '</span>' +
      '<span class="playhint"><span class="circ"><i data-lucide="play" style="width:20px;height:20px"></i></span></span>' +
    '</span>' +
    '<span class="t">' + esc(titleOf(it)) + '</span>' +
    '<span class="s"><span>' + yearOf(it) + '</span><span class="star"><i data-lucide="star"></i>' +
      (it.vote_average ? Number(it.vote_average).toFixed(1) : "—") + '</span></span>' +
  '</button>';
}
function renderRow(elId, list){
  var el = $(elId); if (!el) return;
  register(list);
  el.innerHTML = (list||[]).filter(function(it){ return it && it.poster_path; })
    .slice(0,20).map(cardHTML).join("");
  icons();
}
function skeletons(elId, n){
  var el = $(elId); if (!el) return;
  var h = ""; for (var i=0;i<(n||8);i++) h += '<div class="skel"><div class="ph"></div><div class="ln" style="width:70%"></div></div>';
  el.innerHTML = h;
}

/* ---------------- Top 10 Today ---------------- */
function top10HTML(it, idx){
  var poster = it.poster_path ? imgSrc(POSTER + it.poster_path) : "";
  var img = poster ? '<img loading="lazy" src="' + poster + '" alt="' + esc(titleOf(it)) + t("posterSuffix") + '" onerror="this.style.display=\'none\'">' : "";
  return '<button class="top10-item" data-key="' + keyOf(it) + '" aria-label="#' + (idx+1) + ' ' + esc(titleOf(it)) + '">' +
    '<span class="top10-num" aria-hidden="true">' + (idx+1) + '</span>' +
    '<span class="poster">' + img + '<span class="type">' + (typeOf(it)==="tv" ? t("seriesBadge") : t("filmBadge")) + '</span></span>' +
  '</button>';
}
function renderTop10(list, offline){
  var el = $("row-top10"); if(!el) return;
  var clean = (list||[]).filter(function(it){return it && it.poster_path;}).slice(0,10);
  register(clean);
  el.innerHTML = clean.map(function(it,i){return top10HTML(it,i);}).join("");
  var note = $("top10Note");
  if (note) note.textContent = offline ? t("top10OfflineNote") : t("top10Note");
  icons();
}
function top10OfflineList(){
  /* Offline fallback: a distinct highest-rated selection from the
     whole snapshot pool (not the weekly Trending Now list), labelled
     honestly as the built-in snapshot via top10OfflineNote. */
  var pool = snapshotPool().slice();
  pool.sort(function(a,b){ return (b.vote_average||0) - (a.vote_average||0); });
  return pool.slice(0,10);
}
function loadTop10(){
  skeletons("row-top10", 5);
  fetchJSON("/trending/all/day").then(function(d){
    var list = (d.results||[]).filter(function(x){return x.media_type==="movie"||x.media_type==="tv";});
    if(list.length) renderTop10(list, false); else renderTop10(top10OfflineList(), true);
  }).catch(function(){ renderTop10(top10OfflineList(), true); });
}

/* ---------------- Hover Preview (desktop) ---------------- */
var hoverTimer=null, hoverHideTimer=null, hoverItem=null, hoverAnchor=null;
function isHoverCapable(){ return window.matchMedia && matchMedia("(hover:hover) and (pointer:fine)").matches && window.innerWidth>=768; }
function positionHoverPreview(anchor){
  var pv=$("hoverPreview"); if(!pv||!anchor) return;
  var r=anchor.getBoundingClientRect(); var w=342; var h=pv.offsetHeight||380;
  var left=r.left + r.width/2 - w/2; left=Math.max(8, Math.min(left, window.innerWidth - w - 8));
  var top=r.top - 28; if(top + h > window.innerHeight - 8) top = window.innerHeight - h - 8; if(top<8) top=8;
  // For poster cards, anchor on poster element if present
  var poster=anchor.querySelector ? anchor.querySelector(".poster") : null;
  if(poster){ var pr=poster.getBoundingClientRect(); left=pr.left + pr.width/2 - w/2; left=Math.max(8, Math.min(left, window.innerWidth - w - 8)); top=pr.top - 36; if(top+h>window.innerHeight-8) top=window.innerHeight-h-8; if(top<8) top=8; }
  pv.style.left=left+"px"; pv.style.top=top+"px";
}
function showHoverPreview(it, anchor){
  if(!isHoverCapable()||!it) return;
  hoverItem=it; hoverAnchor=anchor;
  var pv=$("hoverPreview"); if(!pv) return;
  var bd=it.backdrop_path ? imgSrc(BACKDROP_SM+it.backdrop_path) : (it.poster_path ? imgSrc(POSTER+it.poster_path) : "");
  var img=$("hpBackdrop"); img.src=bd||""; img.style.display=bd?"block":"none"; img.alt=titleOf(it);
  $("hpTitle").textContent=titleOf(it);
  var g=genreNames(it).slice(0,2).join(" · ");
  $("hpMeta").innerHTML=(it.vote_average?'<span class="match">'+matchPct(it)+'</span><span>★ '+Number(it.vote_average).toFixed(1)+'</span>':"")+(yearOf(it)?"<span>"+yearOf(it)+"</span>":"")+'<span class="badge">'+(typeOf(it)==="tv"?t("tvSeries"):t("movieWord"))+'</span>'+(g?"<span>"+esc(g)+"</span>":"");
  $("hpOverview").textContent=overviewOf(it)||t("heroNoOverview");
  syncListBtn($("hpList"), it);
  // hpList uses hp-btn styling, override inner to keep icon+label
  var inList=!!myList[keyOf(it)];
  $("hpList").innerHTML='<i data-lucide="'+(inList?"check":"plus")+'" style="width:15px;height:15px"></i> <span>'+(inList?t("inMyList"):t("myList"))+'</span>';
  $("hpPlay").onclick=function(){ hideHoverPreview(true); openModal(it,true); };
  $("hpList").onclick=function(e){ e.stopPropagation(); toggleList(it, $("hpList")); var il=!!myList[keyOf(it)]; $("hpList").innerHTML='<i data-lucide="'+(il?"check":"plus")+'" style="width:15px;height:15px"></i> <span>'+(il?t("inMyList"):t("myList"))+'</span>'; icons(); };
  $("hpInfo").onclick=function(){ hideHoverPreview(true); openModal(it,false); };
  pv.classList.add("on"); pv.setAttribute("aria-hidden","false");
  // position after making visible (needs layout)
  requestAnimationFrame(function(){ positionHoverPreview(anchor); icons(); });
  icons();
}
function hideHoverPreview(immediate){
  var pv=$("hoverPreview"); if(!pv) return;
  if(hoverHideTimer) clearTimeout(hoverHideTimer);
  if(immediate){ pv.classList.remove("on"); pv.setAttribute("aria-hidden","true"); hoverItem=null; return; }
  hoverHideTimer=setTimeout(function(){ pv.classList.remove("on"); pv.setAttribute("aria-hidden","true"); hoverItem=null; },180);
}
function scheduleHover(it, anchor){
  if(!isHoverCapable()) return;
  if(hoverTimer) clearTimeout(hoverTimer);
  if(hoverHideTimer) clearTimeout(hoverHideTimer);
  hoverTimer=setTimeout(function(){ showHoverPreview(it, anchor); },520);
}
document.addEventListener("mouseover", function(e){
  if(!isHoverCapable()) return;
  var pv=$("hoverPreview");
  if(pv && pv.contains(e.target)){ if(hoverHideTimer) clearTimeout(hoverHideTimer); if(hoverTimer) clearTimeout(hoverTimer); return; }
  var card=e.target.closest ? e.target.closest(".card, .top10-item") : null;
  if(card && !card.classList.contains("more-tile")){
    var it=store[card.getAttribute("data-key")];
    if(it && hoverItem!==it) scheduleHover(it, card);
    return;
  }
  if(hoverItem) hideHoverPreview(false);
});
document.addEventListener("mouseout", function(e){
  var card=e.target.closest ? e.target.closest(".card, .top10-item") : null;
  if(card && hoverTimer){ /* if leaving before delay, cancel */ if(!e.relatedTarget || !card.contains(e.relatedTarget)){ clearTimeout(hoverTimer); } }
});
window.addEventListener("scroll", function(){ if(hoverItem) hideHoverPreview(true); if(hoverTimer) clearTimeout(hoverTimer); }, {passive:true});
document.addEventListener("click", function(){ if(hoverItem) hideHoverPreview(true); }, true);

/* ---------------- Trailer + More Like This ---------------- */
var trailerKey=null, trailerWasPlaying=false;
function resetTrailerUI(){
  trailerKey=null;
  var b=$("modalTrailer"); if(b) b.style.display="none";
  var back=$("trailerBack"); if(back) back.classList.remove("show");
  var tf=$("trailerFrame"); if(tf) tf.remove();
}
function loadTrailer(it){
  resetTrailerUI();
  fetchJSON("/"+typeOf(it)+"/"+it.id+"/videos").then(function(d){
    if(!currentItem || currentItem.id!==it.id) return;
    var vids=(d && d.results)||[];
    var pick=null;
    // Prefer official YouTube Trailer, then any Trailer, then Teaser
    var yt=vids.filter(function(v){return v.site==="YouTube" && v.key;});
    pick=yt.filter(function(v){return v.type==="Trailer" && v.official;})[0] || yt.filter(function(v){return v.type==="Trailer";})[0] || yt.filter(function(v){return v.type==="Teaser";})[0] || yt[0] || null;
    if(pick){ trailerKey=pick.key; var btn=$("modalTrailer"); if(btn) btn.style.display=""; }
  }).catch(function(){ /* offline: no trailer button */ });
}
function startTrailer(){
  if(!trailerKey || !currentItem) return;
  trailerWasPlaying=!!$("playerFrame");
  stopPlayer();
  var old=$("trailerFrame"); if(old) old.remove();
  var media=$("modalMedia");
  var f=document.createElement("iframe");
  f.id="trailerFrame"; f.src="https://www.youtube.com/embed/"+encodeURIComponent(trailerKey)+"?autoplay=1&rel=0";
  f.title="Trailer — "+titleOf(currentItem);
  f.setAttribute("allowfullscreen","true"); f.setAttribute("allow","autoplay; fullscreen; picture-in-picture; encrypted-media"); f.setAttribute("referrerpolicy","origin");
  media.appendChild(f);
  $("modalBackdrop").style.display="none"; $("modalFade").style.display="none"; $("modalTitlebar").style.display="none";
  $("trailerBack").classList.add("show"); icons();
}
function stopTrailerToPlayer(){
  var tf=$("trailerFrame"); if(tf) tf.remove();
  $("trailerBack").classList.remove("show");
  if(currentItem){ startPlayer(currentItem); }
}
function simCardHTML(it){
  var imgPath=it.backdrop_path||it.poster_path; var src=imgPath?imgSrc((it.backdrop_path?BACKDROP_SM:POSTER)+imgPath):"";
  var img=src?'<img loading="lazy" src="'+src+'" alt="'+esc(titleOf(it))+'" onerror="this.style.display=\'none\'">':"";
  return '<button class="sim-card" data-sim="'+keyOf(it)+'"><span class="sim-img">'+img+'<span class="sim-rate">★ '+(it.vote_average?Number(it.vote_average).toFixed(1):"—")+'</span></span><span class="sim-body"><span class="sim-t">'+esc(titleOf(it))+'</span><span class="sim-m"><span>'+yearOf(it)+'</span><span>'+(typeOf(it)==="tv"?t("tvSeries"):t("movieWord"))+'</span></span><span class="sim-o">'+esc(overviewOf(it)||"")+'</span></span></button>';
}
function renderSimilar(list){
  var wrap=$("similarWrap"), grid=$("similarGrid"); if(!wrap||!grid) return;
  var clean=(list||[]).filter(function(it){return it && it.id && (it.poster_path||it.backdrop_path);}).slice(0,9);
  if(!clean.length){ wrap.style.display="none"; grid.innerHTML=""; return; }
  register(clean); wrap.style.display="block"; grid.innerHTML=clean.map(simCardHTML).join("");
  grid.querySelectorAll("[data-sim]").forEach(function(b){ b.onclick=function(){ var it2=store[b.getAttribute("data-sim")]; if(it2){ openModal(it2,false); $("overlay").scrollTop=0; } }; });
  icons();
}
function fallbackSimilar(it){
  var myGenres={}; (it.genre_ids||[]).forEach(function(g){myGenres[g]=1;});
  if(it.genres) it.genres.forEach(function(g){myGenres[g.id]=1;});
  var pool=snapshotPool().concat(Object.keys(store).map(function(k){return store[k];}));
  var seen={}, scored=[];
  pool.forEach(function(c){ if(!c||c.id===it.id||typeOf(c)!==typeOf(it)&&false) return; var k=keyOf(c); if(seen[k])return; seen[k]=1; var overlap=(c.genre_ids||[]).filter(function(g){return myGenres[g];}).length; if(overlap>0) scored.push({it:c,score:overlap*10+(c.vote_average||0)}); });
  // if no genre info, fall back to same-type popular snapshot titles
  if(!scored.length){ pool.forEach(function(c){ if(c&&c.id!==it.id&&c.poster_path) scored.push({it:c,score:c.vote_average||0}); }); }
  scored.sort(function(a,b){return b.score-a.score;});
  return scored.slice(0,9).map(function(s){return s.it;});
}
function loadSimilar(it){
  var wrap=$("similarWrap"); if(wrap){wrap.style.display="none"; $("similarGrid").innerHTML="";}
  var type=typeOf(it);
  fetchJSON("/"+type+"/"+it.id+"/similar").then(function(d){
    if(!currentItem||currentItem.id!==it.id) return;
    var list=(d&&d.results)||[];
    if(list.length){ list.forEach(function(x){ if(!x.media_type) x.media_type=type; }); renderSimilar(list); }
    else {
      fetchJSON("/"+type+"/"+it.id+"/recommendations").then(function(d2){
        if(!currentItem||currentItem.id!==it.id) return;
        var l2=(d2&&d2.results)||[]; l2.forEach(function(x){ if(!x.media_type) x.media_type=type; });
        renderSimilar(l2.length?l2:fallbackSimilar(it));
      }).catch(function(){ if(currentItem&&currentItem.id===it.id) renderSimilar(fallbackSimilar(it)); });
    }
  }).catch(function(){ if(currentItem&&currentItem.id===it.id) renderSimilar(fallbackSimilar(it)); });
}

/* ---------------- Popular Stars & person pages ----------------
   The stars row is live from TMDB /person/popular; the built-in
   FALLBACK_PEOPLE snapshot renders first (and stays if TMDB is
   unreachable), so the row is never empty. Clicking a star opens a
   person page in the alt view: header (photo, department, born,
   bio) plus a grid of their movies & TV shows from
   /person/{id}/combined_credits — clicking any title opens the
   usual detail/player modal. Offline, the grid falls back to the
   star's snapshot credits. */
var peopleStore = {};   /* person id -> person object */
var personSeq = 0;      /* guards async person/search renders */
function starKnownTitle(p){
  var kf = p.known_for && p.known_for[0];
  if (kf) return kf.title || kf.name || "";
  if (p.credits && p.credits[0]) return p.credits[0].title || "";
  return "";
}
function starHTML(p){
  var img = p.profile_path
    ? '<img loading="lazy" src="' + imgSrc(PROFILE + p.profile_path) + '" alt="' + esc(p.name) + '" onerror="this.style.display=\'none\'">'
    : "";
  var ini = esc((p.name || "?").trim().charAt(0).toUpperCase());
  var sub = starKnownTitle(p);
  return '<button class="star" data-person="' + p.id + '" aria-label="' + esc(p.name) + '">' +
    '<span class="face"><span class="ini">' + ini + '</span>' + img + '</span>' +
    '<span class="n">' + esc(p.name) + '</span>' +
    (sub ? '<span class="k">' + esc(sub) + '</span>' : '') +
  '</button>';
}
function registerPeople(list){
  (list || []).forEach(function(p){ if (p && p.id) peopleStore[p.id] = p; });
}
function renderPeopleRow(list){
  var el = $("row-stars"); if (!el) return;
  registerPeople(list);
  el.innerHTML = (list || []).filter(function(p){ return p && p.id; }).slice(0, 20).map(starHTML).join("");
  icons();
}
function loadPeople(){
  fetchJSON("/person/popular").then(function(d){
    var list = (d.results || []).filter(function(p){ return p && p.profile_path; });
    if (list.length) renderPeopleRow(list);
  }).catch(function(){ /* snapshot row already rendered */ });
}
function processCredits(cast){
  var seen = {}, out = [];
  (cast || []).forEach(function(c){
    if (!c || (c.media_type !== "movie" && c.media_type !== "tv") || !c.poster_path) return;
    var ch = (c.character || "").toLowerCase();
    if (ch.indexOf("self") === 0) return;                    /* talk-show appearances */
    if ((c.genre_ids || []).some(function(g){ return g === 10767 || g === 10763; })) return; /* Talk / News */
    var k = c.media_type + ":" + c.id;
    if (seen[k]) return;
    seen[k] = 1; out.push(c);
  });
  out.sort(function(a, b){
    return (b.popularity || 0) - (a.popularity || 0) || (b.vote_count || 0) - (a.vote_count || 0);
  });
  return out.slice(0, 48);
}
function fillPersonGrid(list, offline){
  var clean = (list || []).filter(function(it){ return it && it.poster_path; });
  register(clean);
  $("altGrid").innerHTML = clean.map(cardHTML).join("");
  var e = $("altEmpty");
  if (!clean.length) { e.style.display = "block"; e.innerHTML = t("personNoTitles"); }
  else if (offline) { e.style.display = "block"; e.innerHTML = t("personOffline"); }
  else e.style.display = "none";
  icons();
}
function fillPersonHead(p, details){
  var d = details || p;
  $("personIni").textContent = (d.name || p.name || "?").trim().charAt(0).toUpperCase();
  var img = $("personPhoto");
  var path = d.profile_path || p.profile_path;
  img.src = path ? imgSrc(PROFILE + path) : "";
  img.style.display = path ? "block" : "none";
  img.alt = d.name || p.name || "";
  var chips = "";
  var dept = d.known_for_department || p.known_for_department;
  if (dept) chips += '<span class="chip">' + esc(dept) + '</span>';
  chips += '<span class="chip">TMDB ID: ' + p.id + '</span>';
  $("personChips").innerHTML = chips;
  var facts = "";
  if (d.birthday) facts += t("bornLabel") + " " + esc(d.birthday);
  if (d.place_of_birth) facts += (facts ? " · " : "") + esc(d.place_of_birth);
  $("personFacts").textContent = facts;
  $("personBio").textContent = d.biography || "";
}
function openPerson(id){
  var p = peopleStore[id] || null;
  if (!p) FALLBACK_PEOPLE.forEach(function(x){ if (x.id === id) p = x; });
  if (!p) return;
  var seq = ++personSeq;
  showAlt(p.name, [], "<strong>" + t("filterLoading") + "</strong>");
  altKind = "person";
  $("altPerson").style.display = "flex";
  fillPersonHead(p, null);
  fetchJSON("/person/" + id).then(function(d){
    if (seq !== personSeq || !d) return;
    peopleStore[id] = Object.assign({}, p, d);
    fillPersonHead(p, d);
  }).catch(function(){});
  fetchJSON("/person/" + id + "/combined_credits").then(function(d){
    if (seq !== personSeq) return;
    fillPersonGrid(processCredits(d && d.cast), false);
  }).catch(function(){
    if (seq !== personSeq) return;
    fillPersonGrid((p.credits || []).slice(), true);
  });
}
function renderPeopleGrid(list){
  registerPeople(list);
  $("altGrid").innerHTML = (list || []).map(starHTML).join("");
  var e = $("altEmpty");
  if (!list || !list.length) { e.style.display = "block"; e.innerHTML = t("peopleNoMatch", lastPeopleQuery); }
  else e.style.display = "none";
  icons();
}
var lastPeopleQuery = "";
function doPersonSearch(q){
  q = (q || "").trim();
  if (!q) return;
  lastPeopleQuery = esc(q);
  var seq = ++personSeq;
  showAlt(t("peopleFor", q), [], "<strong>" + t("searchingPeople") + "</strong>");
  altKind = "people";
  fetchJSON("/search/person", "&query=" + encodeURIComponent(q))
    .then(function(d){
      if (seq !== personSeq) return;
      renderPeopleGrid((d.results || []).slice(0, 24));
    })
    .catch(function(){
      if (seq !== personSeq) return;
      var ql = q.toLowerCase();
      renderPeopleGrid(FALLBACK_PEOPLE.filter(function(p){
        return p.name.toLowerCase().indexOf(ql) !== -1;
      }));
    });
}
function setAltPeople(list){
  var wrap = $("altPeople"), row = $("altPeopleRow");
  if (!wrap || !row) return;
  if (!list || !list.length) { wrap.style.display = "none"; row.innerHTML = ""; return; }
  registerPeople(list);
  wrap.style.display = "block";
  row.innerHTML = list.slice(0, 20).map(starHTML).join("");
  icons();
}

/* ---------------- Hero ---------------- */
function setHero(it){
  if (!it) return;
  register([it]);
  var bg = it.backdrop_path ? imgSrc(BACKDROP + it.backdrop_path) : (it.poster_path ? imgSrc(BACKDROP + it.poster_path) : "");
  var a = $("heroBgA"), b = $("heroBgB");
  var showEl = heroFlip ? a : b, hideEl = heroFlip ? b : a;
  showEl.style.backgroundImage = bg ? 'url("' + bg + '")' : "none";
  showEl.classList.add("on"); hideEl.classList.remove("on");
  heroFlip = !heroFlip;
  $("heroTitle").textContent = titleOf(it);
  $("heroKicker").textContent = typeOf(it) === "tv" ? t("kickerSeries") : t("kickerFilm");
  $("heroOverview").textContent = overviewOf(it) || t("heroNoOverview");
  var g = genreNames(it).slice(0,3).join(" · ");
  $("heroMeta").innerHTML =
    (it.vote_average ? '<span class="match">' + matchPct(it) + '</span>' : "") +
    '<span class="badge">' + (it.vote_average ? Number(it.vote_average).toFixed(1) + " ★ TMDB" : "TMDB") + '</span>' +
    (yearOf(it) ? "<span>" + yearOf(it) + "</span>" : "") +
    '<span class="badge">' + (typeOf(it) === "tv" ? t("tvSeries") : t("movieWord")) + '</span>' +
    (g ? "<span>" + esc(g) + "</span>" : "");
  $("heroMaturity").textContent = it.adult ? "18+" : (typeOf(it) === "tv" ? "TV-MA" : "PG-13");
  $("heroPlay").onclick = function(){ openModal(it, true); };
  $("heroInfo").onclick = function(){ openModal(it, false); };
  $("heroList").onclick = function(){ toggleList(it, $("heroList")); };
  syncListBtn($("heroList"), it);
  var dots = $("heroDots"); dots.innerHTML = "";
  heroItems.forEach(function(_, i){
    var d = document.createElement("button");
    if (i === heroIdx) d.className = "on";
    d.setAttribute("aria-label", "Featured title " + (i+1));
    d.onclick = (function(idx){ return function(){ heroIdx = idx; setHero(heroItems[idx]); restartHeroTimer(); }; })(i);
    dots.appendChild(d);
  });
}
function restartHeroTimer(){
  if (heroTimer) clearInterval(heroTimer);
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (heroItems.length < 2) return;
  heroTimer = setInterval(function(){
    heroIdx = (heroIdx + 1) % heroItems.length;
    setHero(heroItems[heroIdx]);
  }, 9000);
}

/* ---------------- My List (session only) ---------------- */
function syncListBtn(btn, it){
  if (!btn || !it) return;
  var inList = !!myList[keyOf(it)];
  btn.innerHTML = '<i data-lucide="' + (inList ? "check" : "plus") + '" style="width:20px;height:20px"></i> ' + (inList ? t("inMyList") : t("myList"));
  icons();
}
function toggleList(it, btn){
  var k = keyOf(it);
  if (myList[k]) delete myList[k]; else { myList[k] = it; register([it]); }
  syncListBtn(btn, it);
  if (currentItem && keyOf(currentItem) === k) syncListBtn($("modalList"), it);
  if ($("altView").style.display !== "none" && altKind === "mylist") showMyList();
}

/* ---------------- Watch history (localStorage) ----------------
   Every Play press records the title (plus season/episode and the
   source in use for TV) to localStorage, most recent first. The
   Continue Watching row renders from that list on every load, so it
   survives reloads and works in offline snapshot mode too — posters
   come from the stored TMDB poster paths. */
var HISTORY_KEY = "noahflix.watchHistory.v1";
var HISTORY_MAX = 24;
var pendingResume = null;   /* {id, season, episode} while a history card reopens a show */
var watchHistory = loadHistory();
function loadHistory(){
  try {
    var raw = localStorage.getItem(HISTORY_KEY);
    var list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.filter(function(h){ return h && h.id && h.title; }).slice(0, HISTORY_MAX);
  } catch (e) { return []; }
}
function saveHistory(){
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(watchHistory)); } catch (e) {}
}
function recordHistory(it){
  if (!it || !it.id) return;
  var isTV = typeOf(it) === "tv";
  var entry = {
    key: keyOf(it), id: it.id, type: typeOf(it),
    title: titleOf(it),
    poster: it.poster_path || "", backdrop: it.backdrop_path || "",
    year: yearOf(it), rating: it.vote_average || 0,
    season: isTV ? epSeason : null,
    episode: isTV ? epEpisode : null,
    seasons: it.number_of_seasons || null,
    sourceId: currentSourceId, sourceName: currentSource().name,
    ts: Date.now()
  };
  watchHistory = watchHistory.filter(function(h){ return h.key !== entry.key; });
  watchHistory.unshift(entry);
  watchHistory = watchHistory.slice(0, HISTORY_MAX);
  saveHistory();
  renderHistory();
}
function timeAgo(ts){
  var s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return t("justNow");
  var m = Math.floor(s / 60); if (m < 60) return t("minsAgo", m);
  var h = Math.floor(m / 60); if (h < 24) return t("hoursAgo", h);
  var d = Math.floor(h / 24); if (d < 30) return t("daysAgo", d);
  return new Date(ts).toLocaleDateString();
}
function historyCardHTML(h){
  var img = h.poster
    ? '<img loading="lazy" src="' + imgSrc(POSTER + h.poster) + '" alt="' + esc(h.title) + t("posterSuffix") + '" onerror="this.style.display=\'none\'">'
    : "";
  var se = h.type === "tv" && h.season != null ? "S" + h.season + " · E" + (h.episode || 1) : "";
  var sub = (se ? se + " · " : "") + timeAgo(h.ts);
  return '<button class="card" data-key="' + h.key + '" data-hist="1" aria-label="' + t("resumeAria", esc(h.title)) + '"' +
      ' title="' + t("resumeOn", esc(h.sourceName || "VidSrc")) + '">' +
    '<span class="poster">' + img +
      '<span class="watched"><i data-lucide="check"></i> ' + t("watched") + '</span>' +
      '<span class="type">' + (h.type === "tv" ? t("seriesBadge") : t("filmBadge")) + '</span>' +
      (se ? '<span class="se-chip">' + se + '</span>' : "") +
      '<span class="wbar"></span>' +
      '<span class="playhint"><span class="circ"><i data-lucide="play" style="width:20px;height:20px"></i></span></span>' +
    '</span>' +
    '<span class="t">' + esc(h.title) + '</span>' +
    '<span class="s"><span>' + esc(sub) + '</span></span>' +
  '</button>';
}
function renderHistory(){
  var sec = $("historyRow"), sc = $("row-history");
  if (!sec || !sc) return;
  if (!watchHistory.length) { sec.style.display = "none"; sc.innerHTML = ""; return; }
  sec.style.display = "";
  sc.innerHTML = watchHistory.map(historyCardHTML).join("");
  icons();
}
function clearHistory(){
  watchHistory = [];
  saveHistory();
  renderHistory();
}
function resumeFromHistory(key){
  var h = null;
  watchHistory.forEach(function(x){ if (x.key === key) h = x; });
  if (!h) return;
  var it = { id: h.id, media_type: h.type, title: h.title, name: h.title,
    poster_path: h.poster || null, backdrop_path: h.backdrop || null,
    vote_average: h.rating || 0, number_of_seasons: h.seasons || undefined };
  if (h.year) {
    if (h.type === "tv") it.first_air_date = h.year + "-01-01";
    else it.release_date = h.year + "-01-01";
  }
  if (SOURCES.some(function(s){ return s.id === h.sourceId; })) currentSourceId = h.sourceId;
  pendingResume = h.type === "tv"
    ? { id: h.id, season: h.season || 1, episode: h.episode || 1 }
    : null;
  openModal(it, true);
}

/* ---------------- Modal + player ---------------- */
function openModal(it, autoplay){
  currentItem = it; register([it]);
  enrichedFor = "";
  resetTrailerUI();
  loadTrailer(it);
  loadSimilar(it);
  /* When reopening from Continue Watching, start from the saved
     season/episode so the autoplayed player (and the history entry
     it re-records) lands on the right episode, not S1E1. */
  if (pendingResume && pendingResume.id === it.id) {
    epSeason = pendingResume.season || 1;
    epEpisode = pendingResume.episode || 1;
  } else { epSeason = 1; epEpisode = 1; }
  initEpisodePicker(it);
  stopPlayer();
  var bd = it.backdrop_path ? imgSrc(BACKDROP_SM + it.backdrop_path) : (it.poster_path ? imgSrc(POSTER + it.poster_path) : "");
  var img = $("modalBackdrop");
  img.src = bd || ""; img.alt = titleOf(it) + " backdrop";
  img.style.display = bd ? "block" : "none";
  $("modalFade").style.display = "block";
  $("modalTitlebar").style.display = "block";
  $("modalTitle").textContent = titleOf(it);
  var g = genreNames(it);
  $("modalMeta").innerHTML =
    (it.vote_average ? '<span class="match">' + matchPct(it) + '</span>' : "") +
    "<span>" + (it.vote_average ? Number(it.vote_average).toFixed(1) : "—") + " ★</span>" +
    (yearOf(it) ? "<span>" + yearOf(it) + "</span>" : "") +
    '<span class="badge">' + (typeOf(it) === "tv" ? t("tvSeries") : t("movieWord")) + '</span>' +
    (it.original_language ? '<span class="badge">' + esc(it.original_language.toUpperCase()) + '</span>' : "");
  $("modalOverview").textContent = overviewOf(it) || t("noOverview");
  $("modalGenres").innerHTML = g.map(function(n){ return '<span class="chip">' + esc(n) + '</span>'; }).join("");
  var facts = "";
  facts += "<div><b>TMDB ID:</b> <span>" + it.id + "</span></div>";
  facts += "<div><b>" + t("factType") + ":</b> <span>" + (typeOf(it) === "tv" ? t("factTVShow") : t("factMovie")) + "</span></div>";
  if (it.release_date) facts += "<div><b>" + t("factRelease") + ":</b> <span>" + esc(it.release_date) + "</span></div>";
  if (it.first_air_date) facts += "<div><b>" + t("factFirstAired") + ":</b> <span>" + esc(it.first_air_date) + "</span></div>";
  if (it.vote_count) facts += "<div><b>" + t("factVotes") + ":</b> <span>" + Number(it.vote_count).toLocaleString() + "</span></div>";
  if (it.popularity) facts += "<div><b>" + t("factPopularity") + ":</b> <span>" + Math.round(it.popularity) + "</span></div>";
  if (g.length) facts += "<div><b>" + t("factGenres") + ":</b> <span>" + esc(g.join(", ")) + "</span></div>";
  facts += '<div><b>' + t("factStreamSource") + ':</b> <span id="factSource">VidSrc embed (iframe)</span></div>';
  $("modalFacts").innerHTML = facts;
  renderSourceBar(it);
  syncListBtn($("modalList"), it);
  $("modalPlay").onclick = function(){ startPlayer(it); };
  $("modalList").onclick = function(){ toggleList(it, $("modalList")); };
  $("overlay").classList.add("open");
  document.body.style.overflow = "hidden";
  $("overlay").scrollTop = 0;
  icons();
  if (autoplay) startPlayer(it);
  /* Enrich with full TMDB details (genres/runtime) when online */
  fetchJSON("/" + typeOf(it) + "/" + it.id).then(function(d){
    if (d && currentItem && d.id === it.id) {
      var merged = Object.assign({}, it, d, { media_type: typeOf(it) });
      currentItem = merged; register([merged]);
      /* Refresh details even while the player is open, so a synopsis
         that arrives late replaces the "no overview" placeholder. */
      openModalRefresh(merged);
    }
  }).catch(function(){});
}
var enrichedFor = "";
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
    heroItems = res[0].filter(function(it){ return it.backdrop_path && it.overview; }).slice(0, 5);
    if (!heroItems.length) heroItems = res[0].filter(function(it){ return it.backdrop_path; }).slice(0, 5);
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
      var list = (d.results || []).filter(function(x){
        return (x.media_type === "movie" || x.media_type === "tv") && x.poster_path;
      });
      showAlt(t("resultsFor", q), list, t("noMatchHTML", esc(q)));
      setAltPeople(people);
    })
    .catch(function(){
      var ql = q.toLowerCase();
      var local = Object.keys(store).map(function(k){ return store[k]; })
        .filter(function(it){ return titleOf(it).toLowerCase().indexOf(ql) !== -1; });
      showAlt(t("resultsFor", q) + t("resultsOfflineSuffix"), local, t("noMatchOffline"));
      setAltPeople(FALLBACK_PEOPLE.filter(function(p){
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
