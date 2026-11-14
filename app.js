/* Recipe Guide — Caribou Coffee Egypt. Static, no build. Data: data.js (or Google Sheet via config.js) */
(function () {
  "use strict";

  /* ---------------- i18n ---------------- */
  var T = {
    ar: {
      subtitle: "دليل تحضير المشروبات", search: "ابحث باسم المشروب...", all: "الكل",
      hot: "ساخن", iced: "مثلج", blended: "بلند", hotF: "ساخنة", icedF: "مثلجة", blendedF: "بلند",
      onMenu: "على المنيو", offMenu: "غير موجود بالمنيو", menuOnly: "المنيو فقط", allDrinks: "كل المشروبات",
      count: function (n) { return n + " مشروب"; }, none: "مفيش نتايج مطابقة",
      ingredients: "المكونات", steps: "طريقة التحضير", mistakes: "أخطاء شائعة", key: "نقطة مهمة",
      serving: "التقديم", dine: "صالة", take: "تيك أواي", ingredient: "المكوّن",
      copy: "نسخ الرابط", copied: "تم نسخ الرابط", prev: "السابق", next: "التالي", close: "إغلاق",
      relatedMenu: "قريب من صنف المنيو: ", source: "المصدر", online: "بيانات من Google Sheet", embedded: "بيانات مدمجة",
      version: "الإصدار"
    },
    en: {
      subtitle: "Beverage preparation guide", search: "Search drink name...", all: "All",
      hot: "Hot", iced: "Iced", blended: "Blended", hotF: "Hot", icedF: "Iced", blendedF: "Blended",
      onMenu: "On menu", offMenu: "Not on menu", menuOnly: "On menu only", allDrinks: "All drinks",
      count: function (n) { return n + (n === 1 ? " drink" : " drinks"); }, none: "No matching drinks",
      ingredients: "Ingredients", steps: "Preparation", mistakes: "Common mistakes", key: "Key point",
      serving: "Serving", dine: "Dine-in", take: "Takeaway", ingredient: "Ingredient",
      copy: "Copy link", copied: "Link copied", prev: "Previous", next: "Next", close: "Close",
      relatedMenu: "Similar to menu item: ", source: "Source", online: "Data from Google Sheet", embedded: "Built-in data",
      version: "Version"
    }
  };

  /* values in the recipe tables are mostly English; translate the common words for Arabic view */
  var VAL_AR = [
    [/\bTo fill line\b/gi, "حتى خط التعبئة"], [/\bFill line\b/gi, "حتى الخط"], [/\bFill\b/g, "تعبئة"],
    [/Hot Choc line/gi, "خط هوت شوكليت"], [/Kids line/gi, "خط Kids"], [/\b([SML]) line\b/g, "خط $1"],
    [/\b(\d+(?:\.\d+)?) oz line\b/gi, "خط $1 أوز"], [/\bscoops\b/gi, "مغارف"], [/\bscoop\b/gi, "مغرفة"],
    [/\bpcs\b/gi, "قطعة"], [/\bpieces?\b/gi, "قطعة"], [/\bzigzag\b/gi, "زجزاج"], [/\bserving\b/gi, "حصة"],
    [/\btsp\b/gi, "ملعقة صغيرة"], [/\btop\b/gi, "فوق"], [/\bYes\b/g, "نعم"], [/\bshots?\b/gi, "شوت"],
    [/below rim/gi, "تحت الحافة"], [/\bTo\b/g, "حتى"], [/\boz\b/gi, "أوز"], [/\bg\b/g, "جم"],
    [/Chips/g, "شيبس"], [/nibbler/gi, "نيبلر"], [/Cinnamon/g, "قرفة"], [/almonds/gi, "لوز"],
    [/\bSmall\b/g, "صغير"], [/\bBig\b/g, "كبير"], [/\bSize\b/g, "مقاس"]
  ];
  function val(s) {
    if (state.lang !== "ar" || !s) return s;
    var out = s; VAL_AR.forEach(function (r) { out = out.replace(r[0], r[1]); });
    return out;
  }

  var ICON = {
    cup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h11v5a5 5 0 01-5 5h-1a5 5 0 01-5-5z"/><path d="M16 9h2a2.5 2.5 0 010 5h-2"/><path d="M8 3c0 1.2 1 1.3 1 2.5M12 3c0 1.2 1 1.3 1 2.5"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/></svg>',
    dine: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a2 2 0 002 2v9M10 3v7M6 6h4M18 3c-2 1-3 4-3 7h3v11"/></svg>',
    take: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 016 0v2"/></svg>'
  };

  /* ---------------- state ---------------- */
  var state = { lang: "ar", cat: "all", q: "", menuOnly: false, serve: "dine", open: null, source: "embedded" };
  try { var sl = localStorage.getItem("rg_lang"); if (sl === "en" || sl === "ar") state.lang = sl; } catch (e) {}

  var RECIPES = (window.RECIPES || []).slice();
  var $ = function (id) { return document.getElementById(id); };
  function t(k) { var v = T[state.lang][k]; return v === undefined ? k : v; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pick(r, base) { return state.lang === "ar" ? (r[base + "Ar"] || r[base + "En"] || "") : (r[base + "En"] || r[base + "Ar"] || ""); }
  function nameOf(r) { return state.lang === "ar" ? (r.ar || r.en) : (r.en || r.ar); }
  function otherName(r) { return state.lang === "ar" ? r.en : r.ar; }

  /* search: Arabic-aware normalisation */
  function norm(s) {
    return String(s || "").toLowerCase()
      .replace(/[ً-ٰٟـ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
      .replace(/[^a-z0-9؀-ۿ ]+/g, " ").replace(/\s+/g, " ").trim();
  }
  function hay(r) {
    if (!r._h) r._h = norm([r.en, r.ar, r.recipeEn, r.recipeAr, r.subEn, r.cat, (r.ing || []).map(function (i) { return i.en + " " + i.ar; }).join(" ")].join(" "));
    return r._h;
  }
  function matches(r) {
    if (state.cat !== "all" && r.cat !== state.cat) return false;
    if (state.menuOnly && !r.menu) return false;
    if (!state.q) return true;
    var h = hay(r), qs = norm(state.q).split(" ");
    return qs.every(function (w) { return h.indexOf(w) !== -1; });
  }
  function hl(text) {
    var s = esc(text); if (!state.q) return s;
    var ws = norm(state.q).split(" ").filter(Boolean); if (ws.length !== 1) return s;
    var i = norm(text).indexOf(ws[0]);
    if (i < 0 || norm(text).length !== String(text).length) return s;
    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + ws[0].length)) + "</mark>" + esc(text.slice(i + ws[0].length));
  }

  function imgFor(r) { return r.menu ? "img/" + r.menu + ".webp" : ""; }
  function pic(r, cls) {
    var src = imgFor(r);
    if (src) return '<div class="pic"><img src="' + src + '" alt="" loading="lazy" onerror="this.parentNode.classList.add(\'ph\');this.outerHTML=window.__cup"></div>';
    return '<div class="pic ph">' + ICON.cup + "</div>";
  }
  window.__cup = ICON.cup;
  function catTag(r) { return '<span class="tag ' + r.cat + '">' + esc(t(r.cat)) + "</span>"; }

  /* ---------------- render list ---------------- */
  function visible() { return RECIPES.filter(matches); }
  function card(r) {
    var sub = state.lang === "en" ? "" : (r.subEn || "");
    return '<button class="card" type="button" data-id="' + esc(r.id) + '">' + pic(r) +
      "<h3>" + hl(nameOf(r)) + "</h3>" +
      '<div class="en-name">' + esc(otherName(r) || "") + "</div>" +
      (r.subEn ? '<div class="sub">' + esc(r.subEn) + "</div>" : "") +
      '<div class="tags">' + catTag(r) + (r.menu ? '<span class="tag menu">' + esc(t("onMenu")) + "</span>" : "") + "</div></button>";
  }
  function renderTabs() {
    var cats = ["all", "hot", "iced", "blended"];
    $("tabs").innerHTML = cats.map(function (c) {
      var n = c === "all" ? RECIPES.length : RECIPES.filter(function (r) { return r.cat === c; }).length;
      return '<button class="tab' + (state.cat === c ? " on" : "") + '" data-cat="' + c + '" type="button">' + esc(c === "all" ? t("all") : t(c + "F")) + '<span class="n">' + n + "</span></button>";
    }).join("");
  }
  function renderChips() {
    $("chips").innerHTML = '<span class="chip-label">' + esc(t("serving") === "" ? "" : "") + "</span>" +
      '<button class="chip' + (!state.menuOnly ? " on" : "") + '" data-mo="0" type="button">' + esc(t("allDrinks")) + "</button>" +
      '<button class="chip q' + (state.menuOnly ? " on" : "") + '" data-mo="1" type="button">' + esc(t("menuOnly")) + "</button>";
  }
  function renderList() {
    var list = visible();
    $("count").textContent = t("count")(list.length);
    var el = $("list");
    if (!list.length) { el.innerHTML = '<p class="empty">' + esc(t("none")) + "</p>"; return; }
    var groups = state.cat === "all" ? ["hot", "iced", "blended"] : [state.cat];
    el.innerHTML = groups.map(function (g) {
      var items = list.filter(function (r) { return r.cat === g; });
      if (!items.length) return "";
      return '<section class="sec"><div class="sec-head"><h2>' + esc({ hot: "المشروبات الساخنة", iced: "المشروبات المثلجة", blended: "المشروبات المخلوطة (بلند)" }[g]) + '</h2><span class="en">' +
        esc(T.en[g] + " drinks") + '</span><span class="sub">' + items.length + '</span></div><div class="grid">' + items.map(card).join("") + "</div></section>";
    }).join("");
  }
  function renderChrome() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    $("langBtn").textContent = state.lang === "ar" ? "EN" : "ع";
    $("q").placeholder = t("search");
    document.querySelector("[data-i18n=subtitle]").textContent = t("subtitle");
    var meta = window.RECIPE_META || {};
    $("foot").textContent = (meta.version ? t("version") + ": " + meta.version + " — " : "") + t("source") + ": " + (state.source === "sheet" ? t("online") : t("embedded"));
  }
  function render() { renderChrome(); renderTabs(); renderChips(); renderList(); if (state.open) openRecipe(state.open, true); }

  /* ---------------- detail ---------------- */
  function sizeCells(r, ing) {
    var out = [], v = ing.v || [], i = 0;
    while (i < r.sizes.length) {
      var span = 1;
      while (i + span < r.sizes.length && !v[i + span]) span++;
      var cell = v[i] || "";
      if (cell === "—" || cell === "-") cell = "—";
      out.push('<td' + (span > 1 ? ' colspan="' + span + '"' : "") + ">" + esc(val(cell)) + "</td>");
      i += span;
    }
    return out.join("");
  }
  function openRecipe(id, silent) {
    var idx = RECIPES.findIndex(function (r) { return r.id === id; });
    if (idx < 0) return;
    var r = RECIPES[idx], list = visible(), li = list.findIndex(function (x) { return x.id === id; });
    state.open = id;
    var src = imgFor(r);
    var head = (src ? '<img src="' + src + '" alt="">' : '<div class="pic-ph">' + ICON.cup + "</div>") +
      "<div><h2>" + esc(nameOf(r)) + '</h2><div class="en-name">' + esc(otherName(r) || "") + "</div>" +
      (r.subEn ? '<p class="sub">' + esc(r.subEn) + "</p>" : "") +
      '<div class="tags">' + catTag(r) + (r.menu ? '<span class="tag menu">' + esc(r.link === "like" ? t("onMenu") + " ~" : t("onMenu")) + "</span>" : '<span class="tag">' + esc(t("offMenu")) + "</span>") + "</div></div>" +
      '<button class="close" type="button" data-close aria-label="' + esc(t("close")) + '">×</button>';
    var body = "";
    var key = pick(r, "key");
    if (key) body += '<div class="key">' + ICON.bulb + "<span>" + esc(key) + "</span></div>";
    body += "<div><h4>" + esc(t("ingredients")) + '</h4><table class="rtable"><thead><tr><th>' + esc(t("ingredient")) + "</th>" +
      r.sizes.map(function (s) { return "<th>" + esc(val(s)) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      r.ing.map(function (ing) {
        var nm = state.lang === "ar" ? (ing.ar || ing.en) : (ing.en || ing.ar), o = state.lang === "ar" ? ing.en : ing.ar;
        return "<tr><td>" + esc(nm) + (o ? "<small>" + esc(o) + "</small>" : "") + "</td>" + sizeCells(r, ing) + "</tr>";
      }).join("") + "</tbody></table></div>";
    var steps = (state.lang === "ar" ? r.stepsAr : r.stepsEn) || r.stepsEn || [];
    if (steps.length) body += "<div><h4>" + esc(t("steps")) + '</h4><ol class="steps">' + steps.map(function (s) { return "<li><span>" + esc(s) + "</span></li>"; }).join("") + "</ol></div>";
    var mis = (state.lang === "ar" ? r.misAr : r.misEn) || r.misEn || [];
    if (mis.length) body += "<div><h4>" + esc(t("mistakes")) + '</h4><ul class="mistakes">' + mis.map(function (s) { return "<li><span>" + esc(s) + "</span></li>"; }).join("") + "</ul></div>";
    var dine = pick(r, "dine"), take = pick(r, "take");
    if (dine || take) {
      body += "<div><h4>" + esc(t("serving")) + '</h4><div class="seg"><button type="button" data-serve="dine" class="' + (state.serve === "dine" ? "on" : "") + '">' + ICON.dine + esc(t("dine")) +
        '</button><button type="button" data-serve="take" class="' + (state.serve === "take" ? "on" : "") + '">' + ICON.take + esc(t("take")) + '</button></div><p class="serve-text">' + esc(state.serve === "dine" ? dine : take) + "</p></div>";
    }
    if (r.link === "like" && r.menu) body += '<p class="nomenu">' + esc(t("relatedMenu")) + esc(menuName(r.menu)) + "</p>";
    body += '<div class="nav2"><button class="btn alt" type="button" data-nav="-1"' + (li <= 0 ? " disabled" : "") + ">" + (state.lang === "ar" ? "→ " : "← ") + esc(t("prev")) +
      '</button><button class="btn alt" type="button" data-nav="1"' + (li < 0 || li >= list.length - 1 ? " disabled" : "") + ">" + esc(t("next")) + (state.lang === "ar" ? " ←" : " →") + '</button>' +
      '<button class="btn wide" type="button" data-copy>' + esc(t("copy")) + "</button></div>";
    var dlg = $("dlg");
    dlg.innerHTML = '<div class="sheet"><div class="sheet-head">' + head + '</div><div class="sheet-body">' + body + "</div></div>";
    if (!dlg.open) { try { dlg.showModal(); } catch (e) { dlg.setAttribute("open", ""); } }
    if (!silent) { try { history.replaceState(null, "", "#" + id); } catch (e) {} dlg.querySelector(".sheet").scrollTop = 0; }
  }
  function menuName(mid) { var m = (window.MENU_NAMES || {})[mid]; return m ? (state.lang === "ar" ? m.ar : m.en) : mid.replace(/-/g, " "); }
  function closeRecipe() {
    state.open = null; var d = $("dlg"); if (d.open) d.close();
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  }
  function toast(msg) { var el = $("toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove("on"); }, 1800); }

  /* ---------------- events ---------------- */
  $("q").addEventListener("input", function (e) { state.q = e.target.value; $("clearQ").hidden = !state.q; renderList(); });
  $("clearQ").addEventListener("click", function () { state.q = ""; $("q").value = ""; $("clearQ").hidden = true; renderList(); $("q").focus(); });
  $("langBtn").addEventListener("click", function () { state.lang = state.lang === "ar" ? "en" : "ar"; try { localStorage.setItem("rg_lang", state.lang); } catch (e) {} render(); });
  $("tabs").addEventListener("click", function (e) { var b = e.target.closest("[data-cat]"); if (!b) return; state.cat = b.dataset.cat; renderTabs(); renderList(); window.scrollTo({ top: 0 }); });
  $("chips").addEventListener("click", function (e) { var b = e.target.closest("[data-mo]"); if (!b) return; state.menuOnly = b.dataset.mo === "1"; renderChips(); renderList(); });
  $("list").addEventListener("click", function (e) { var c = e.target.closest(".card"); if (c) openRecipe(c.dataset.id); });
  $("dlg").addEventListener("click", function (e) {
    var tg = e.target;
    if (tg === $("dlg") || tg.closest("[data-close]")) return closeRecipe();
    var s = tg.closest("[data-serve]"); if (s) { state.serve = s.dataset.serve; return openRecipe(state.open, true); }
    var n = tg.closest("[data-nav]");
    if (n && !n.disabled) {
      var list = visible(), i = list.findIndex(function (x) { return x.id === state.open; }) + Number(n.dataset.nav);
      if (list[i]) openRecipe(list[i].id);
      return;
    }
    if (tg.closest("[data-copy]")) {
      var url = location.origin + location.pathname + "#" + state.open;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { toast(t("copied")); }, function () { toast(url); });
    }
  });
  $("dlg").addEventListener("close", function () { state.open = null; });
  $("dlg").addEventListener("cancel", function () { state.open = null; });
  window.addEventListener("hashchange", function () { var id = decodeURIComponent(location.hash.slice(1)); if (id) openRecipe(id, true); });

  /* ---------------- optional Google Sheet source ---------------- */
  function parseCSV(text) {
    var rows = [], row = [], f = "", q = false, i = 0;
    text = text.replace(/^﻿/, "");
    for (; i < text.length; i++) {
      var c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
      else if (c !== "\r") f += c;
    }
    if (f !== "" || row.length) { row.push(f); rows.push(row); }
    var hd = rows.shift().map(function (h) { return h.trim().toLowerCase().replace(/[_\- ]/g, ""); });
    return rows.filter(function (r) { return r.some(function (x) { return x.trim(); }); }).map(function (r) {
      var o = {}; hd.forEach(function (h, k) { o[h] = (r[k] || "").trim(); }); return o;
    });
  }
  function fetchCSV(url, key) {
    return fetch(url, { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txt) { try { localStorage.setItem("rg_csv_" + key, txt); } catch (e) {} return txt; })
      .catch(function () { var c; try { c = localStorage.getItem("rg_csv_" + key); } catch (e) {} if (c) return c; throw new Error("offline"); });
  }
  var list = function (s) { return s ? s.split("|").map(function (x) { return x.trim(); }).filter(Boolean) : []; };
  function loadSheets() {
    var S = window.SHEETS || {};
    if (!S.recipes || !S.ingredients) return Promise.resolve(false);
    return Promise.all([fetchCSV(S.recipes, "recipes"), fetchCSV(S.ingredients, "ingredients")]).then(function (res) {
      var rec = parseCSV(res[0]), ing = parseCSV(res[1]);
      var by = {};
      ing.forEach(function (i) {
        if (!i.id) return;
        (by[i.id] = by[i.id] || []).push({ en: i.en, ar: i.ar, v: [i.v1 || "", i.v2 || "", i.v3 || ""] });
      });
      var out = rec.filter(function (r) { return r.id && !/^(no|false|0|لا)$/i.test(r.active || "yes"); }).map(function (r) {
        var sizes = list(r.sizes), n = sizes.length || 3;
        return {
          id: r.id, cat: (r.cat || "hot").toLowerCase(), menu: r.menu || "", link: r.link || (r.menu ? "menu" : ""),
          en: r.en, ar: r.ar, recipeEn: r.recipeen || r.en, recipeAr: r.recipear || r.ar, subEn: r.suben || "",
          sizes: sizes, ing: (by[r.id] || []).map(function (i) { i.v = i.v.slice(0, n); return i; }),
          keyEn: r.keyen, keyAr: r.keyar, stepsEn: list(r.stepsen), stepsAr: list(r.stepsar),
          misEn: list(r.misen), misAr: list(r.misar), dineEn: r.dineen, dineAr: r.dinear, takeEn: r.takeen, takeAr: r.takear
        };
      });
      if (!out.length) return false;
      RECIPES = out; state.source = "sheet"; return true;
    }).catch(function () { return false; });
  }

  /* ---------------- boot ---------------- */
  render();
  function openFromHash() { var id = decodeURIComponent(location.hash.slice(1)); if (id) openRecipe(id, true); }
  openFromHash();
  loadSheets().then(function (ok) { if (ok) { render(); openFromHash(); } });
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
