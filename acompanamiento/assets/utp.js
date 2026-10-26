(function () {
  const R = window.RUBRICA, U = window.RUB, A = window.APP, C = window.CONFIG;
  const { esc, fmt, promedio, nivelNombre } = U;
  const $ = id => document.getElementById(id);
  const IND = U.indicadores;

  let datos = { observaciones: [], nomina: [] };
  let fuente = "";
  let tab = "resumen";

  /* ---------- Acceso ---------- */
  function initLogin() {
    if (A.conectado()) {
      $("btnEntrar").onclick = entrar;
      $("clave").addEventListener("keydown", e => { if (e.key === "Enter") entrar(); });
      // Mantener la sesión solo mientras la pestaña esté abierta
      let s = null; try { s = sessionStorage.getItem("utp.clave"); } catch (e) { }
      if (s) { $("clave").value = s; entrar(); }
    } else {
      $("loginConectado").classList.add("hidden");
      $("loginLocal").classList.remove("hidden");
      $("btnDemo").onclick = () => mostrar(datosDemo(), "Datos de ejemplo");
      $("btnLocales").onclick = () => {
        const obs = Object.values(A.store.get("pauta.obs", {})).filter(o => o.docente);
        mostrar({ observaciones: obs, nomina: A.store.get("pauta.nomina", null) || window.NOMINA_LOCAL || [] }, "Observaciones de este equipo");
      };
    }
  }

  async function entrar() {
    const clave = $("clave").value.trim(); if (!clave) return;
    $("btnEntrar").disabled = true; $("loginErr").textContent = "";
    try {
      const r = await A.api("datos", { clave });
      try { sessionStorage.setItem("utp.clave", clave); } catch (e) { }
      mostrar({ observaciones: r.observaciones, nomina: r.nomina }, "Google Drive");
    } catch (e) {
      $("loginErr").textContent = e.message;
      try { sessionStorage.removeItem("utp.clave"); } catch (_) { }
    } finally { $("btnEntrar").disabled = false; }
  }

  function salir() {
    try { sessionStorage.removeItem("utp.clave"); } catch (e) { }
    datos = { observaciones: [], nomina: [] };
    location.reload();
  }

  function mostrar(d, f) {
    datos = d; fuente = f;
    $("login").classList.add("hidden"); $("panel").classList.remove("hidden");
    $("btnSalir").classList.remove("hidden");
    if (A.conectado()) $("btnRecargar").classList.remove("hidden");
    $("fuente").className = "chip " + (f === "Google Drive" ? "ok" : "warn");
    $("fuente").lastElementChild.textContent = `${f} · ${d.observaciones.length} observaciones`;
    $("subtitulo").textContent = `${C.COLEGIO} · Confidencial · uso exclusivo UTP`;
    llenarFiltros(); render();
  }

  /* ---------- Datos de ejemplo ---------- */
  function datosDemo() {
    const nom = (window.NOMINA_LOCAL || Array.from({ length: 30 }, (_, i) => ({ nombre: `Docente ${i + 1}`, grupo: `Grupo ${1 + (i % 6)}`, curso: `${1 + (i % 8)}°A`, rol: "" })));
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const obs = [];
    nom.slice(0, Math.round(nom.length * 0.75)).forEach((n, k) => {
      const base = 1.8 + rnd() * 1.8;
      const niveles = {};
      IND.forEach(i => {
        let v = base + (rnd() - 0.5) * 1.6 + (i.dim === "D4" ? -0.4 : 0) + (i.sub === "3.3" ? -0.3 : 0) + (i.dim === "D2" ? 0.4 : 0);
        niveles[i.id] = rnd() < 0.04 ? 0 : Math.max(1, Math.min(4, Math.round(v)));
      });
      const d = new Date(2026, 9, 19 + (k % 20));
      obs.push({
        id: "demo-" + k, docente: n.nombre, grupo: n.grupo, curso: n.curso, asignatura: ["Lenguaje", "Matemática", "Ciencias", "Historia"][k % 4],
        fecha: d.toISOString().slice(0, 10), observador: ["Eduardo Ossandón", "Jefatura UTP"][k % 2],
        usosIA: R.usosIA.filter(() => rnd() < 0.5), evidenciasIA: R.evidenciasIA.filter(() => rnd() < 0.6),
        herramientasIA: ["ChatGPT", "Gemini", "MagicSchool", "Canva IA"][k % 4], niveles,
        comentarios: { "4.2.1": rnd() < 0.5 ? "Los estudiantes formulan preguntas a la IA mediadas por la docente." : "" },
        retro: { fortalezas: "", mejoras: "", sugerencias: "", acuerdos: "" }
      });
    });
    return { observaciones: obs, nomina: nom };
  }

  /* ---------- Filtros ---------- */
  function llenarFiltros() {
    const grupos = [...new Set(datos.nomina.map(n => n.grupo).concat(datos.observaciones.map(o => o.grupo)).filter(Boolean))].sort();
    $("fGrupo").innerHTML = `<option value="">Todos</option>` + grupos.map(g => `<option>${esc(g)}</option>`).join("");
    const obsv = [...new Set(datos.observaciones.map(o => o.observador).filter(Boolean))].sort();
    $("fObs").innerHTML = `<option value="">Todos</option>` + obsv.map(g => `<option>${esc(g)}</option>`).join("");
    ["fGrupo", "fDesde", "fHasta", "fObs"].forEach(id => $(id).onchange = render);
  }
  function filtradas() {
    const g = $("fGrupo").value, d = $("fDesde").value, h = $("fHasta").value, ob = $("fObs").value;
    return datos.observaciones.filter(o => (!g || o.grupo === g) && (!d || o.fecha >= d) && (!h || o.fecha <= h) && (!ob || o.observador === ob));
  }
  // Nómina activa: excluye a quienes están en stand by (no requieren acompañamiento)
  function nominaFiltrada() { const g = $("fGrupo").value; return datos.nomina.filter(n => (!g || n.grupo === g) && !A.enStandBy(n)); }
  function standBy() { const g = $("fGrupo").value; return datos.nomina.filter(n => (!g || n.grupo === g) && A.enStandBy(n)); }

  /* ---------- Cálculos ---------- */
  function statsIndicador(obs, id) {
    const c = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    obs.forEach(o => { const n = o.niveles[id]; if (n != null) c[n]++; });
    const val = c[1] + c[2] + c[3] + c[4];
    const avg = val ? (c[1] + 2 * c[2] + 3 * c[3] + 4 * c[4]) / val : null;
    return { c, val, avg, logro: val ? (c[3] + c[4]) / val : null };
  }
  function promDim(obs, dimId) { return promedio(obs.flatMap(o => IND.filter(i => i.dim === dimId).map(i => o.niveles[i.id]))); }
  function promGeneral(obs) { return promedio(obs.flatMap(o => IND.map(i => o.niveles[i.id]))); }
  function porDocente(obs) {
    const m = new Map();
    obs.forEach(o => { if (!m.has(o.docente)) m.set(o.docente, []); m.get(o.docente).push(o); });
    return [...m.entries()].map(([nombre, lista]) => {
      const ind = Object.fromEntries(IND.map(i => [i.id, statsIndicador(lista, i.id).avg]));
      const dims = Object.fromEntries(R.dimensiones.map(d => [d.id, promDim(lista, d.id)]));
      const n = datos.nomina.find(x => x.nombre === nombre);
      return { nombre, grupo: (n && n.grupo) || lista[0].grupo || "", lista, ind, dims, general: promGeneral(lista), ultima: lista.map(o => o.fecha).sort().pop() };
    }).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }
  const cls = v => v == null ? "n0" : "n" + Math.max(1, Math.min(4, Math.round(v)));

  /* ---------- Tooltip ---------- */
  function initTip() {
    const tip = $("tip");
    document.addEventListener("mousemove", e => {
      const t = e.target.closest("[data-tip]");
      if (!t) { tip.classList.add("hidden"); return; }
      tip.innerHTML = t.dataset.tip; tip.classList.remove("hidden");
      const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8), y = Math.min(e.clientY + 14, innerHeight - tip.offsetHeight - 8);
      tip.style.left = x + "px"; tip.style.top = y + "px";
    });
  }

  /* ---------- Componentes ---------- */
  const pct = x => x == null ? "—" : Math.round(x * 100) + "%";
  function barrasDim(items) {
    // items: [{nombre, v}] en escala 1–4; línea de referencia en 3 (Desarrollado)
    const pos = v => ((v - 1) / 3 * 100);
    return items.map(it => `<div class="hbar" data-tip="${esc(it.nombre)}<br>Promedio ${fmt(it.v)} · ${it.v == null ? "sin datos" : nivelNombre(it.v)}">
        <span class="name">${esc(it.nombre)}</span>
        <span class="track"><span class="fill" style="width:${it.v == null ? 0 : Math.max(1, pos(it.v))}%"></span><span class="ref" style="left:${pos(3)}%"></span></span>
        <span class="v">${fmt(it.v)}</span></div>`).join("") +
      `<div class="axis"><span></span><span class="ticks">${[1, 2, 3, 4].map(t => `<span style="left:${pos(t)}%">${t}</span>`).join("")}</span><span></span></div>
       <p class="small muted" style="margin:6px 0 0">Escala 1 (Por desarrollar) a 4 (Destacado). Línea punteada: nivel Desarrollado (3), referente satisfactorio.</p>`;
  }
  const leyenda = `<div class="legend">${R.niveles.map(l => `<span><i class="b${l.n}"></i>${l.n} · ${l.nombre}</span>`).join("")}<span><i class="b0"></i>N/O</span></div>`;
  function apilada(nombreHTML, s, extraTip) {
    const tot = s.val + s.c[0];
    const segs = [1, 2, 3, 4, 0].filter(n => s.c[n]).map(n => `<span class="b${n}" style="flex:${s.c[n]}" data-tip="${extraTip}<br><b>${n ? nivelNombre(n) : "No observado"}</b>: ${s.c[n]} de ${tot} (${Math.round(100 * s.c[n] / tot)}%)"></span>`).join("");
    return `<div class="stk"><span class="name">${nombreHTML}</span><span class="bar">${segs || '<span class="b0" style="flex:1" data-tip="Sin datos"></span>'}</span><span class="v" data-tip="Promedio ${fmt(s.avg)} · ${pct(s.logro)} en nivel 3–4">${fmt(s.avg)}</span></div>`;
  }

  /* ---------- Vistas ---------- */
  function vResumen(obs) {
    const nom = nominaFiltrada(), docs = porDocente(obs);
    const observados = new Set(obs.map(o => o.docente));
    const todos = obs.flatMap(o => IND.map(i => o.niveles[i.id])).filter(v => v > 0);
    const logro = todos.length ? todos.filter(v => v >= 3).length / todos.length : null;
    const conIA = docs.filter(d => d.dims.D4 != null);
    const metaIA = conIA.length ? conIA.filter(d => d.dims.D4 >= 3).length / conIA.length : null;
    const pg = promGeneral(obs);
    const stats = IND.map(i => ({ i, s: statsIndicador(obs, i.id) })).filter(x => x.s.avg != null).sort((a, b) => b.s.avg - a.s.avg);
    const top = stats.slice(0, 3), bottom = stats.slice(-3).reverse();
    const item = x => `<li><span class="lv sm ${cls(x.s.avg)}">${fmt(x.s.avg)}</span><span class="grow"><b>${x.i.id}</b> ${esc(x.i.nombre)}<br><span class="small muted">${esc(x.i.dimNombre)} · ${pct(x.s.logro)} en nivel 3–4</span></span></li>`;
    return `
    <div class="tiles">
      <div class="tile"><div class="lbl">Observaciones</div><div class="val">${obs.length}</div><div class="det">${observados.size} docentes distintos</div></div>
      <div class="tile"><div class="lbl">Cobertura de la nómina</div><div class="val">${nom.length ? pct([...observados].filter(n => nom.some(x => x.nombre === n)).length / nom.length) : "—"}</div><div class="det">${[...observados].filter(n => nom.some(x => x.nombre === n)).length} de ${nom.length} docentes observados</div></div>
      <div class="tile"><div class="lbl">Promedio general</div><div class="val">${fmt(pg)}</div><div class="det">${pg == null ? "" : nivelNombre(pg)} · ${pct(logro)} de registros en nivel 3–4</div></div>
      <div class="tile"><div class="lbl">Meta de innovación: uso de IA</div><div class="val">${pct(metaIA)}</div><div class="det">docentes con Dimensión IA ≥ 3 · meta ${pct(C.META_IA)}</div>
        ${metaIA == null ? "" : `<div class="st ${metaIA >= C.META_IA ? "ok" : "warn"}">${metaIA >= C.META_IA ? "✓ Meta cumplida" : "▲ Bajo la meta"}</div>`}</div>
    </div>
    <div class="two">
      <section class="card"><h2>Promedio por dimensión</h2>${barrasDim(R.dimensiones.map(d => ({ nombre: d.nombre, v: promDim(obs, d.id) })))}</section>
      <section class="card"><h2>Promedio por subdimensión</h2>${barrasDim(R.dimensiones.flatMap(d => d.sub.map(s => ({ nombre: `${s.id} ${s.nombre}`, v: promedio(obs.flatMap(o => s.ind.map(i => o.niveles[i.id]))) }))))}</section>
    </div>
    <div class="two">
      <section class="card"><h2>Fortalezas institucionales</h2><p class="small muted" style="margin-top:-6px">Indicadores con mayor promedio</p><ul class="rank">${top.map(item).join("") || "<li class='muted'>Sin datos</li>"}</ul></section>
      <section class="card"><h2>Debilidades institucionales</h2><p class="small muted" style="margin-top:-6px">Indicadores con menor promedio</p><ul class="rank">${bottom.map(item).join("") || "<li class='muted'>Sin datos</li>"}</ul></section>
    </div>`;
  }

  function vIndicadores(obs) {
    return R.dimensiones.map(d => `<section class="card"><div class="card-head"><h2>${esc(d.nombre)}</h2><span class="avg">Promedio ${fmt(promDim(obs, d.id))}</span></div>
      ${leyenda}
      ${d.sub.map(s => `<div class="sub-title">${s.id} ${esc(s.nombre)}</div>` + s.ind.map(i => apilada(`<span class="code">${i.id}</span>${esc(i.nombre)}`, statsIndicador(obs, i.id), `${i.id} ${esc(i.nombre)}`)).join("")).join("")}
    </section>`).join("") + vUsosIA(obs);
  }

  function vUsosIA(obs) {
    const n = obs.length || 1;
    const fila = (lbl, k) => { const c = obs.filter(o => (o[k] || []).includes(lbl)).length; return `<div class="hbar" data-tip="${esc(lbl)}: ${c} de ${obs.length} observaciones"><span class="name">${esc(lbl)}</span><span class="track"><span class="fill" style="width:${100 * c / n}%"></span></span><span class="v">${pct(c / n)}</span></div>`; };
    return `<div class="two"><section class="card"><h2>Uso de IA observado</h2><p class="small muted" style="margin-top:-6px">% de observaciones en que se registró cada uso</p>${R.usosIA.map(u => fila(u, "usosIA")).join("")}</section>
      <section class="card"><h2>Evidencias de innovación pedagógica</h2><p class="small muted" style="margin-top:-6px">% de observaciones con cada evidencia</p>${R.evidenciasIA.map(u => fila(u, "evidenciasIA")).join("")}</section></div>`;
  }

  function vDocentes(obs) {
    const docs = porDocente(obs);
    const observados = new Set(docs.map(d => d.nombre));
    const pendientes = nominaFiltrada().filter(n => !observados.has(n.nombre));
    const head = `<tr><th class="nm">Docente</th><th>Obs.</th><th>Gral.</th>${R.dimensiones.map(d => `<th data-tip="${esc(d.nombre)}">${d.id}</th>`).join("")}<th class="sep"></th>${R.dimensiones.map((d, k) => (k ? '<th class="sep"></th>' : "") + d.sub.flatMap(s => s.ind).map(i => `<th data-tip="${i.id} ${esc(i.nombre)}">${i.id}</th>`).join("")).join("")}</tr>`;
    const cel = (v, tip) => `<td class="c"><span class="lv sm ${cls(v)}" data-tip="${tip}">${v == null ? "–" : fmt(v)}</span></td>`;
    const filas = docs.map(d => `<tr><td class="nm"><button data-doc="${esc(d.nombre)}" title="Ver informe individual">${esc(d.nombre)}</button><br><span class="small muted">${esc(d.grupo)}</span></td>
      <td class="c">${d.lista.length}</td>${cel(d.general, `${esc(d.nombre)}<br>Promedio general ${fmt(d.general)}`)}
      ${R.dimensiones.map(x => cel(d.dims[x.id], `${esc(d.nombre)}<br>${esc(x.nombre)}: ${fmt(d.dims[x.id])}`)).join("")}<td class="sep"></td>
      ${R.dimensiones.map((x, k) => (k ? '<td class="sep"></td>' : "") + x.sub.flatMap(s => s.ind).map(i => cel(d.ind[i.id], `${esc(d.nombre)}<br>${i.id} ${esc(i.nombre)}: ${d.ind[i.id] == null ? "sin dato" : fmt(d.ind[i.id]) + " · " + nivelNombre(d.ind[i.id])}`)).join("")).join("")}</tr>`).join("");
    return `<section class="card"><div class="card-head"><h2>Mapa de docentes por indicador</h2><span class="avg small">Clic en un nombre para ver su informe individual</span></div>
      ${leyenda}<div class="heat-wrap"><table class="heat"><thead>${head}</thead><tbody>${filas || `<tr><td class="muted">Sin observaciones</td></tr>`}</tbody></table></div></section>
      <section class="card"><h2>Pendientes de observar (${pendientes.length})</h2>
      ${pendientes.length ? `<table class="list"><thead><tr><th>Docente</th><th>Grupo CPA</th><th>Curso</th></tr></thead><tbody>${pendientes.map(n => `<tr><td>${esc(n.nombre)}</td><td>${esc(n.grupo)}</td><td>${esc(n.curso)}</td></tr>`).join("")}</tbody></table>` : `<p class="muted">Toda la nómina tiene al menos una observación.</p>`}</section>
      ${standBy().length ? `<section class="card"><h2>En stand by (${standBy().length})</h2><p class="small muted" style="margin-top:-6px">No requieren acompañamiento este período. No se cuentan en la cobertura ni en los pendientes.</p>
      <table class="list"><thead><tr><th>Docente</th><th>Grupo CPA</th><th>Rol</th></tr></thead><tbody>${standBy().map(n => `<tr><td>${esc(n.nombre)}</td><td>${esc(n.grupo)}</td><td>${esc(n.rol)}</td></tr>`).join("")}</tbody></table></section>` : ""}`;
  }

  function vGrupos(obs) {
    const grupos = [...new Set(obs.map(o => o.grupo || "Sin grupo"))].sort();
    const filas = grupos.map(g => {
      const l = obs.filter(o => (o.grupo || "Sin grupo") === g);
      const nom = datos.nomina.filter(n => n.grupo === g).length;
      const lider = datos.nomina.find(n => n.grupo === g && /líder/i.test(n.rol || ""));
      return `<tr><td class="nm"><b>${esc(g)}</b><br><span class="small muted">${lider ? "Líder IA: " + esc(lider.nombre) : ""}</span></td><td class="c">${new Set(l.map(o => o.docente)).size}/${nom || "?"}</td>
        ${[...R.dimensiones.map(d => [d.id, promDim(l, d.id), d.nombre]), ["Gral.", promGeneral(l), "Promedio general"]].map(([k, v, n]) => `<td class="c"><span class="lv ${cls(v)}" data-tip="${esc(g)}<br>${esc(n)}: ${fmt(v)}">${v == null ? "–" : fmt(v)}</span></td>`).join("")}</tr>`;
    }).join("");
    return `<section class="card"><h2>Comparación por Grupo CPA</h2>${leyenda}
      <div class="heat-wrap"><table class="heat"><thead><tr><th class="nm">Grupo</th><th>Observados</th>${R.dimensiones.map(d => `<th data-tip="${esc(d.nombre)}">${d.id} ${esc(d.nombre.split(" ").slice(0, 2).join(" "))}</th>`).join("")}<th>General</th></tr></thead><tbody>${filas}</tbody></table></div></section>
      <section class="card"><h2>Dimensión IA por grupo</h2>${barrasDim(grupos.map(g => ({ nombre: g, v: promDim(obs.filter(o => (o.grupo || "Sin grupo") === g), "D4") })))}</section>`;
  }

  function vInformes(obs) {
    const docs = porDocente(obs);
    return `<section class="card"><h2>Informe institucional</h2>
      <p class="small muted">Consolidado confidencial de fortalezas y debilidades, con el filtro aplicado (${obs.length} observaciones).</p>
      <div class="actions"><button class="btn primary" id="infInst">Ver e imprimir informe institucional</button></div></section>
      <section class="card"><h2>Informe individual por docente</h2>
      <p class="small muted">Perfil de fortalezas y debilidades del/la docente comparado con el promedio institucional.</p>
      <div class="grid"><label class="f">Docente<select id="infDoc">${docs.map(d => `<option>${esc(d.nombre)}</option>`).join("")}</select></label></div>
      <div class="actions" style="margin-top:10px"><button class="btn primary" id="infInd" ${docs.length ? "" : "disabled"}>Ver e imprimir informe individual</button></div></section>`;
  }

  /* ---------- Informes privados (HTML imprimible) ---------- */
  const estiloInf = `<style>@page{size:A4;margin:14mm 12mm}body{font-family:Arial,Helvetica,sans-serif;font-size:9.5pt;color:#111;margin:0}
    h1{font-size:14pt;margin:0}h2{font-size:11pt;color:#1f5fae;border-bottom:1.5px solid #1f5fae;padding-bottom:2px;margin:16px 0 6px}h3{font-size:10pt;margin:10px 0 4px}
    .conf{display:inline-block;border:1.5px solid #b42323;color:#b42323;font-weight:bold;font-size:8.5pt;padding:1px 6px;margin-bottom:4px}
    .sub{color:#555;font-size:9pt}table{border-collapse:collapse;width:100%;margin-bottom:6px}td,th{border:1px solid #aaa;padding:3px 5px;vertical-align:top}th{background:#e9eef6;text-align:left;font-size:8.5pt}
    .c{text-align:center}.n1{background:#f6cfcd}.n2{background:#fbe3dc}.n3{background:#dbe8f8}.n4{background:#b9d2f2}.n0{background:#eee}
    ul{margin:4px 0 4px 16px;padding:0}li{margin:2px 0}.k{display:inline-block;margin-right:18px}.k b{font-size:13pt}.note{font-size:8.5pt;color:#555}tr{page-break-inside:avoid}
    .firma{margin-top:40px;text-align:center}.firma div{display:inline-block;border-top:1px solid #111;padding-top:4px;width:40%}</style>`;
  const td = (v, extra = "") => `<td class="c ${cls(v)}" ${extra}>${v == null ? "–" : fmt(v)}</td>`;
  function filtroTxt() {
    const p = [];
    if ($("fGrupo").value) p.push("Grupo: " + $("fGrupo").value);
    if ($("fDesde").value) p.push("Desde: " + A.fechaLarga($("fDesde").value));
    if ($("fHasta").value) p.push("Hasta: " + A.fechaLarga($("fHasta").value));
    if ($("fObs").value) p.push("Observador/a: " + $("fObs").value);
    return p.join(" · ") || "Todas las observaciones";
  }
  function cabecera(titulo) {
    return `<div class="conf">CONFIDENCIAL · USO EXCLUSIVO UTP</div><h1>${titulo}</h1>
      <div class="sub">${esc(C.COLEGIO)} · Acompañamiento de aula ${C.ANIO} · Innovación Pedagógica<br>${esc(filtroTxt())} · Emitido el ${new Date().toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}</div>`;
  }

  function informeInstitucional(obs) {
    const docs = porDocente(obs);
    const stats = IND.map(i => ({ i, s: statsIndicador(obs, i.id) })).filter(x => x.s.avg != null).sort((a, b) => b.s.avg - a.s.avg);
    const fort = stats.slice(0, 5), deb = stats.slice(-5).reverse();
    const conIA = docs.filter(d => d.dims.D4 != null), metaIA = conIA.length ? conIA.filter(d => d.dims.D4 >= 3).length / conIA.length : null;
    const prioridad = docs.filter(d => d.general != null && (d.general < 2.5 || Object.values(d.ind).filter(v => v != null && v < 1.5).length >= 3)).sort((a, b) => a.general - b.general);
    const referentes = docs.filter(d => d.dims.D4 != null && d.dims.D4 >= 3.5).sort((a, b) => b.dims.D4 - a.dims.D4);
    const pendientes = nominaFiltrada().filter(n => !docs.some(d => d.nombre === n.nombre));
    const grupos = [...new Set(obs.map(o => o.grupo || "Sin grupo"))].sort();
    const dist = s => [1, 2, 3, 4].map(n => `<td class="c">${s.val ? Math.round(100 * s.c[n] / s.val) + "%" : "–"}</td>`).join("");
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe institucional UTP</title>${estiloInf}</head><body>
      ${cabecera("Informe institucional de acompañamiento de aula")}
      <h2>1. Síntesis</h2>
      <p><span class="k">Observaciones: <b>${obs.length}</b></span><span class="k">Docentes observados: <b>${docs.length}</b>/${nominaFiltrada().length}</span><span class="k">Promedio general: <b>${fmt(promGeneral(obs))}</b> (${promGeneral(obs) == null ? "—" : nivelNombre(promGeneral(obs))})</span><span class="k">Meta de innovación (IA): <b>${pct(metaIA)}</b> (meta ${pct(C.META_IA)})</span></p>
      <table><thead><tr><th>Dimensión</th><th class="c">Promedio</th><th class="c">% Por desarrollar</th><th class="c">% En desarrollo</th><th class="c">% Desarrollado</th><th class="c">% Destacado</th></tr></thead><tbody>
      ${R.dimensiones.map(d => { const ids = IND.filter(i => i.dim === d.id).map(i => i.id); const c = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }; obs.forEach(o => ids.forEach(id => { const n = o.niveles[id]; if (n != null) c[n]++; })); const s = { c, val: c[1] + c[2] + c[3] + c[4] }; return `<tr><td>${esc(d.nombre)}</td>${td(promDim(obs, d.id))}${dist(s)}</tr>`; }).join("")}
      </tbody></table>
      <h2>2. Fortalezas institucionales</h2>
      <table><thead><tr><th>Indicador</th><th class="c">Promedio</th><th class="c">% nivel 3–4</th></tr></thead><tbody>${fort.map(x => `<tr><td><b>${x.i.id}</b> ${esc(x.i.nombre)} <span class="note">· ${esc(x.i.dimNombre)}</span></td>${td(x.s.avg)}<td class="c">${pct(x.s.logro)}</td></tr>`).join("")}</tbody></table>
      <h2>3. Debilidades institucionales y focos de desarrollo profesional</h2>
      <table><thead><tr><th>Indicador</th><th class="c">Promedio</th><th class="c">% nivel 3–4</th><th>Acciones sugeridas para la CPA / desarrollo profesional</th></tr></thead><tbody>
      ${deb.map(x => `<tr><td><b>${x.i.id}</b> ${esc(x.i.nombre)} <span class="note">· ${esc(x.i.dimNombre)}</span></td>${td(x.s.avg)}<td class="c">${pct(x.s.logro)}</td><td><ul>${x.i.sug.map(s => `<li>${esc(s)}</li>`).join("")}</ul></td></tr>`).join("")}</tbody></table>
      <h2>4. Innovación pedagógica: Integración pedagógica de la IA</h2>
      <table><thead><tr><th>Indicador IA</th><th class="c">Promedio</th><th class="c">% PD</th><th class="c">% ED</th><th class="c">% D</th><th class="c">% DS</th></tr></thead><tbody>
      ${IND.filter(i => i.dim === "D4").map(i => { const s = statsIndicador(obs, i.id); return `<tr><td><b>${i.id}</b> ${esc(i.nombre)}</td>${td(s.avg)}${dist(s)}</tr>`; }).join("")}</tbody></table>
      <p class="note">Meta de innovación pedagógica: ${pct(C.META_IA)} de los docentes implementa herramientas de IA. Se considera logrado cuando el promedio de la Dimensión 4 del/la docente es ≥ 3. Resultado: ${conIA.filter(d => d.dims.D4 >= 3).length} de ${conIA.length} docentes observados (${pct(metaIA)}).</p>
      <h3>Uso de IA y evidencias registradas</h3>
      <table><thead><tr><th>Uso de IA</th>${R.usosIA.map(u => `<th class="c">${esc(u)}</th>`).join("")}</tr></thead><tbody><tr><td>% observaciones</td>${R.usosIA.map(u => `<td class="c">${pct(obs.length ? obs.filter(o => (o.usosIA || []).includes(u)).length / obs.length : null)}</td>`).join("")}</tr></tbody></table>
      <h2>5. Resultados por Grupo CPA</h2>
      <table><thead><tr><th>Grupo</th><th class="c">Docentes obs.</th>${R.dimensiones.map(d => `<th class="c">${esc(d.nombre)}</th>`).join("")}<th class="c">General</th></tr></thead><tbody>
      ${grupos.map(g => { const l = obs.filter(o => (o.grupo || "Sin grupo") === g); return `<tr><td>${esc(g)}</td><td class="c">${new Set(l.map(o => o.docente)).size}</td>${R.dimensiones.map(d => td(promDim(l, d.id))).join("")}${td(promGeneral(l))}</tr>`; }).join("")}</tbody></table>
      <h2>6. Resultados por docente</h2>
      <table><thead><tr><th>Docente</th><th>Grupo</th><th class="c">Obs.</th>${R.dimensiones.map(d => `<th class="c">${d.id}</th>`).join("")}<th class="c">General</th></tr></thead><tbody>
      ${docs.map(d => `<tr><td>${esc(d.nombre)}</td><td>${esc(d.grupo)}</td><td class="c">${d.lista.length}</td>${R.dimensiones.map(x => td(d.dims[x.id])).join("")}${td(d.general)}</tr>`).join("")}</tbody></table>
      <p class="note">${R.dimensiones.map(d => `${d.id}: ${esc(d.nombre)}`).join(" · ")}</p>
      <h2>7. Prioridades de acompañamiento</h2>
      <h3>Docentes que requieren acompañamiento prioritario</h3>
      <p class="note">Criterio: promedio general menor a 2,5 o tres o más indicadores en nivel Por desarrollar.</p>
      ${prioridad.length ? `<ul>${prioridad.map(d => `<li><b>${esc(d.nombre)}</b> (${esc(d.grupo)}) · promedio ${fmt(d.general)} · indicadores más descendidos: ${IND.filter(i => d.ind[i.id] != null).sort((a, b) => d.ind[a.id] - d.ind[b.id]).slice(0, 3).map(i => esc(i.nombre)).join("; ")}</li>`).join("")}</ul>` : "<p>No hay docentes en esta condición.</p>"}
      <h3>Docentes referentes en IA para modelar en las CPA</h3>
      <p class="note">Criterio: promedio de la Dimensión IA igual o mayor a 3,5.</p>
      ${referentes.length ? `<ul>${referentes.map(d => `<li><b>${esc(d.nombre)}</b> (${esc(d.grupo)}) · Dimensión IA ${fmt(d.dims.D4)}</li>`).join("")}</ul>` : "<p>Aún no hay docentes en esta condición.</p>"}
      ${pendientes.length ? `<h3>Docentes pendientes de observar (${pendientes.length})</h3><p>${pendientes.map(n => esc(n.nombre)).join(", ")}</p>` : ""}
      ${standBy().length ? `<h3>Docentes en stand by (${standBy().length})</h3><p class="note">No requieren acompañamiento este período; no se consideran en la cobertura.</p><p>${standBy().map(n => esc(n.nombre)).join(", ")}</p>` : ""}
      <div class="firma"><div>Jefatura Unidad Técnico Pedagógica</div></div>
    </body></html>`;
  }

  function informeIndividual(obs, nombre) {
    const d = porDocente(obs).find(x => x.nombre === nombre); if (!d) return "";
    const inst = Object.fromEntries(IND.map(i => [i.id, statsIndicador(obs, i.id).avg]));
    const conDato = IND.filter(i => d.ind[i.id] != null);
    const fort = conDato.filter(i => d.ind[i.id] >= 3).sort((a, b) => d.ind[b.id] - d.ind[a.id]);
    const deb = conDato.filter(i => d.ind[i.id] < 2.5).sort((a, b) => d.ind[a.id] - d.ind[b.id]);
    const coms = d.lista.flatMap(o => IND.filter(i => (o.comentarios || {})[i.id]).map(i => ({ f: o.fecha, i, t: o.comentarios[i.id] })));
    const dif = (a, b) => { if (a == null || b == null) return "–"; const x = Math.round((a - b) * 10) / 10; return x === 0 ? "0,0" : (x > 0 ? "+" : "") + x.toFixed(1).replace(".", ","); };
    const estado = d.general == null ? "" : d.general < 2.5 ? "Requiere acompañamiento prioritario." : d.dims.D4 >= 3.5 ? "Referente potencial para modelar prácticas con IA en su CPA." : d.general >= 3 ? "Desempeño satisfactorio; continuar con desafíos para avanzar a Destacado." : "Desempeño en progreso; acompañar los focos de mejora definidos.";
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe UTP ${esc(nombre)}</title>${estiloInf}</head><body>
      ${cabecera("Informe individual de acompañamiento · " + esc(nombre))}
      <h2>1. Antecedentes</h2>
      <table><tr><th style="width:22%">Docente</th><td>${esc(d.nombre)}</td><th style="width:16%">Grupo CPA</th><td>${esc(d.grupo)}</td></tr></table>
      <table><thead><tr><th>Fecha</th><th>Curso</th><th>Asignatura</th><th>Observador/a</th>${R.dimensiones.map(x => `<th class="c">${x.id}</th>`).join("")}<th class="c">General</th></tr></thead><tbody>
      ${d.lista.sort((a, b) => a.fecha.localeCompare(b.fecha)).map(o => { const p = U.promediosObs(o.niveles); return `<tr><td>${A.fechaLarga(o.fecha)}</td><td>${esc(o.curso)}</td><td>${esc(o.asignatura)}</td><td>${esc(o.observador)}</td>${R.dimensiones.map(x => td(p[x.id])).join("")}${td(p.general)}</tr>`; }).join("")}</tbody></table>
      <p><b>Valoración global:</b> ${estado}</p>
      <h2>2. Perfil por dimensión comparado con el promedio institucional</h2>
      <table><thead><tr><th>Dimensión</th><th class="c">Docente</th><th class="c">Institucional</th><th class="c">Diferencia</th></tr></thead><tbody>
      ${R.dimensiones.map(x => `<tr><td>${esc(x.nombre)}</td>${td(d.dims[x.id])}${td(promDim(obs, x.id))}<td class="c">${dif(d.dims[x.id], promDim(obs, x.id))}</td></tr>`).join("")}
      <tr><td><b>General</b></td>${td(d.general)}${td(promGeneral(obs))}<td class="c">${dif(d.general, promGeneral(obs))}</td></tr></tbody></table>
      <h2>3. Fortalezas</h2>
      ${fort.length ? `<table><thead><tr><th>Indicador</th><th class="c">Docente</th><th class="c">Institucional</th></tr></thead><tbody>${fort.map(i => `<tr><td><b>${i.id}</b> ${esc(i.nombre)}</td>${td(d.ind[i.id])}${td(inst[i.id])}</tr>`).join("")}</tbody></table>` : "<p>No se registran indicadores en nivel Desarrollado o Destacado.</p>"}
      <h2>4. Debilidades y acciones sugeridas</h2>
      ${deb.length ? `<table><thead><tr><th>Indicador</th><th class="c">Docente</th><th class="c">Inst.</th><th>Acciones sugeridas</th></tr></thead><tbody>${deb.map(i => `<tr><td><b>${i.id}</b> ${esc(i.nombre)}</td>${td(d.ind[i.id])}${td(inst[i.id])}<td><ul>${i.sug.map(s => `<li>${esc(s)}</li>`).join("")}</ul></td></tr>`).join("")}</tbody></table>` : "<p>No se registran indicadores bajo 2,5.</p>"}
      <h2>5. Evidencias registradas por los observadores</h2>
      ${coms.length ? `<table><thead><tr><th style="width:16%">Fecha</th><th style="width:30%">Indicador</th><th>Evidencia</th></tr></thead><tbody>${coms.map(c => `<tr><td>${A.fechaLarga(c.f)}</td><td>${c.i.id} ${esc(c.i.nombre)}</td><td>${esc(c.t)}</td></tr>`).join("")}</tbody></table>` : "<p>Sin comentarios registrados.</p>"}
      <h2>6. Acuerdos registrados en las retroalimentaciones</h2>
      ${d.lista.filter(o => o.retro && o.retro.acuerdos).map(o => `<p><b>${A.fechaLarga(o.fecha)}:</b> ${esc(o.retro.acuerdos).replace(/\n/g, "<br>")}</p>`).join("") || "<p>Sin acuerdos registrados.</p>"}
      <div class="firma"><div>Jefatura Unidad Técnico Pedagógica</div></div>
    </body></html>`;
  }

  function verInforme(html) {
    const m = A.modal(`<div class="card-head"><h2>Informe privado</h2><span class="avg"><button class="btn small primary" id="ipPrint">Imprimir / PDF</button> <button class="btn small" data-close>Cerrar</button></span></div><iframe title="Informe"></iframe>`, { wide: true });
    m.el.querySelector("iframe").srcdoc = html;
    m.el.querySelector("#ipPrint").onclick = () => m.el.querySelector("iframe").contentWindow.print();
  }

  /* ---------- CSV ---------- */
  function exportarCSV() {
    const obs = filtradas();
    const cols = ["id", "fecha", "docente", "grupo", "curso", "asignatura", "observador", ...R.dimensiones.map(d => "prom_" + d.id), "prom_general", ...IND.map(i => i.id), "usosIA", "evidenciasIA", "herramientasIA"];
    const q = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = obs.map(o => { const p = U.promediosObs(o.niveles); return [o.id, o.fecha, o.docente, o.grupo, o.curso, o.asignatura, o.observador, ...R.dimensiones.map(d => p[d.id] == null ? "" : p[d.id].toFixed(2).replace(".", ",")), p.general == null ? "" : p.general.toFixed(2).replace(".", ","), ...IND.map(i => o.niveles[i.id] ?? ""), (o.usosIA || []).join(" | "), (o.evidenciasIA || []).join(" | "), o.herramientasIA || ""].map(q).join(";"); });
    const blob = new Blob(["﻿" + [cols.map(q).join(";"), ...rows].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `acompanamiento_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- Render ---------- */
  function render() {
    const obs = filtradas();
    document.querySelectorAll(".tabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
    const v = { resumen: vResumen, indicadores: vIndicadores, docentes: vDocentes, grupos: vGrupos, informes: vInformes }[tab];
    $("vista").innerHTML = obs.length || tab === "docentes" ? v(obs) : `<section class="card"><p class="muted">No hay observaciones con el filtro seleccionado.</p></section>`;
    if (tab === "informes" && obs.length) {
      $("infInst").onclick = () => verInforme(informeInstitucional(obs));
      $("infInd").onclick = () => verInforme(informeIndividual(obs, $("infDoc").value));
    }
  }

  function init() {
    initTip(); (window.UTP360_LISTO || Promise.resolve()).then(initLogin);
    document.querySelector(".tabs").addEventListener("click", e => { const b = e.target.closest("button[data-tab]"); if (b) { tab = b.dataset.tab; render(); } });
    $("vista").addEventListener("click", e => { const b = e.target.closest("[data-doc]"); if (b) verInforme(informeIndividual(filtradas(), b.dataset.doc)); });
    $("btnCSV").onclick = exportarCSV;
    $("btnSalir").onclick = salir;
    $("btnRecargar").onclick = async () => {
      let clave = null; try { clave = sessionStorage.getItem("utp.clave"); } catch (e) { }
      if (!clave) return salir();
      try { const r = await A.api("datos", { clave }); mostrar({ observaciones: r.observaciones, nomina: r.nomina }, "Google Drive"); A.toast("Datos actualizados"); }
      catch (e) { A.toast(e.message); }
    };
  }
  init();
})();
