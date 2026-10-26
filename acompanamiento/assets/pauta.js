(function () {
  const R = window.RUBRICA, U = window.RUB, A = window.APP, C = window.CONFIG;
  const { esc } = U;
  const $ = id => document.getElementById(id);

  const K = { obs: "pauta.obs", actual: "pauta.actual", cola: "pauta.cola", nomina: "pauta.nomina", codigo: "pauta.codigo", observador: "pauta.observador", compacto: "pauta.compacto", equipo: "pauta.equipo" };
  const CAMPOS = ["docente", "coDocente", "curso", "asignatura", "fecha", "horaInicio", "horaFin", "observador", "objetivo", "herramientasIA"];
  const RETRO = ["fortalezas", "mejoras", "acuerdos", "fechaRetro", "fechaSeguimiento"];

  let nomina = [];
  let obs = null;

  const todas = () => A.store.get(K.obs, {});
  function persistir() {
    obs.actualizado = new Date().toISOString();
    const t = todas(); t[obs.id] = obs; A.store.set(K.obs, t); A.store.set(K.actual, obs.id);
  }
  function hoy() { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); }

  function nueva(base) {
    return {
      id: A.uid(), estado: "borrador", creado: new Date().toISOString(),
      docente: "", coDocente: "", grupo: "", curso: "", asignatura: "", fecha: hoy(), horaInicio: "", horaFin: "",
      observador: A.store.get(K.observador, ""), objetivo: "", herramientasIA: "",
      usosIA: [], evidenciasIA: [], niveles: {}, comentarios: {},
      retro: { fortalezas: "", mejoras: "", sugerencias: "", general: "", acuerdos: "", fechaRetro: "", fechaSeguimiento: "" },
      ...(base || {})
    };
  }

  /* ---------- Nómina ---------- */
  async function cargarNomina() {
    if (A.conectado()) {
      const codigo = A.store.get(K.codigo, "");
      if (codigo) {
        try {
          const r = await A.api("nomina", { codigo });
          nomina = r.nomina; A.store.set(K.nomina, nomina); return;
        } catch (e) {
          if (/código/i.test(e.message)) { A.store.del(K.codigo); return pedirCodigo(); }
        }
      } else return pedirCodigo();
    }
    nomina = A.store.get(K.nomina, null) || window.NOMINA_LOCAL || [];
  }

  function pedirCodigo() {
    return new Promise(resolve => {
      const m = A.modal(`<h2>Código de observador</h2>
        <p class="small muted">Ingrese el código entregado por UTP. Se recordará en este equipo.</p>
        <input id="mCodigo" type="password" autocomplete="off" placeholder="Código">
        <p class="small" id="mErr" style="color:var(--danger)"></p>
        <div class="actions"><button class="btn primary" id="mOk">Ingresar</button></div>`, { persist: true });
      const ok = async () => {
        const codigo = m.el.querySelector("#mCodigo").value.trim();
        if (!codigo) return;
        try {
          const r = await A.api("nomina", { codigo });
          A.store.set(K.codigo, codigo); nomina = r.nomina; A.store.set(K.nomina, nomina);
          m.close(); resolve();
        } catch (e) {
          if (!navigator.onLine) { nomina = A.store.get(K.nomina, []) || []; m.close(); resolve(); return; }
          m.el.querySelector("#mErr").textContent = e.message;
        }
      };
      m.el.querySelector("#mOk").onclick = ok;
      m.el.querySelector("#mCodigo").addEventListener("keydown", e => { if (e.key === "Enter") ok(); });
      setTimeout(() => m.el.querySelector("#mCodigo").focus(), 50);
    });
  }

  function llenarSelects() {
    const activos = nomina.filter(n => !A.enStandBy(n)), pausa = nomina.filter(A.enStandBy);
    const opt = n => `<option value="${esc(n.nombre)}">${esc(n.nombre)}${n.rol ? " · " + esc(n.rol) : ""}</option>`;
    const grupos = [...new Set(activos.map(n => n.grupo))];
    const opts = grupos.map(g => `<optgroup label="${esc(g)}">${activos.filter(n => n.grupo === g).map(opt).join("")}</optgroup>`).join("")
      + (pausa.length ? `<optgroup label="En stand by (sin acompañamiento)">${pausa.map(opt).join("")}</optgroup>` : "");
    $("docente").innerHTML = `<option value="">Seleccione…</option>` + opts;
    $("coDocente").innerHTML = `<option value="">—</option>` + opts;
  }

  /* ---------- Render de la rúbrica ---------- */
  function renderRubrica() {
    const criterios = `<section class="card criterios"><h2>Criterios para decidir el nivel</h2>
      <p class="small muted" style="margin-top:-6px">Aplican a todos los indicadores. Cada indicador detalla además qué observar y el descriptor de cada nivel.</p>
      <dl>${R.niveles.map(l => `<div><dt><span class="lv n${l.n}">${l.n}</span> ${esc(l.nombre)}</dt><dd>${esc(l.def)}</dd></div>`).join("")}</dl></section>`;
    $("rubrica").innerHTML = criterios + R.dimensiones.map((d, di) => `
      <section class="card" data-dim="${d.id}">
        <div class="card-head">
          <h2>${di === 0 ? "2. " : ""}${d.id.replace("D", "Dimensión ")}: ${esc(d.nombre)}</h2>
          <span class="avg" id="avg-${d.id}"></span>
        </div>
        ${d.sub.map(s => `
          <div class="sub-title">${s.id} ${esc(s.nombre)}</div>
          ${s.ind.map(i => `
            <div class="ind" data-ind="${i.id}">
              <div class="ind-head"><span class="code">${i.id}</span><span class="name">${esc(i.nombre)}${i.evidencia ? '<span class="tag">revisar evidencia</span>' : ""}</span></div>
              <div class="ind-desc">${esc(i.desc)}</div>
              <div class="ind-obs"><b>Qué observar:</b><ul>${i.observar.map(o => `<li>${esc(o)}</li>`).join("")}</ul></div>
              <div class="levels" role="group" aria-label="Nivel ${i.id}">
                ${R.niveles.map(l => `<button type="button" class="lvl n${l.n}" data-n="${l.n}" aria-pressed="false"><b>${l.n} · ${l.nombre}</b><span>${esc(i.niveles[l.n - 1])}</span></button>`).join("")}
                <button type="button" class="lvl n0" data-n="0" aria-pressed="false" title="No observado / no aplica"><b>N/O</b></button>
              </div>
              <textarea data-com="${i.id}" rows="1" placeholder="Evidencia observada / comentario"></textarea>
            </div>`).join("")}`).join("")}
      </section>`).join("");

    $("rubrica").addEventListener("click", e => {
      const b = e.target.closest(".lvl"); if (!b) return;
      const id = b.closest(".ind").dataset.ind, n = Number(b.dataset.n);
      if (obs.niveles[id] === n) delete obs.niveles[id]; else obs.niveles[id] = n;
      marcarNiveles(id); actualizarResumen(); cambio();
    });
    $("rubrica").addEventListener("input", e => {
      const id = e.target.dataset.com; if (!id) return;
      obs.comentarios[id] = e.target.value; cambio();
    });
  }

  function marcarNiveles(id) {
    document.querySelectorAll(`.ind[data-ind="${id}"] .lvl`).forEach(b => b.setAttribute("aria-pressed", String(obs.niveles[id] === Number(b.dataset.n))));
  }

  function actualizarResumen() {
    R.dimensiones.forEach(d => {
      const ids = U.indicadores.filter(i => i.dim === d.id);
      $("avg-" + d.id).textContent = `${ids.filter(i => obs.niveles[i.id] != null).length} de ${ids.length} indicadores marcados`;
    });
    const total = U.indicadores.length, hechos = U.indicadores.filter(i => obs.niveles[i.id] != null).length;
    $("barra").style.width = (100 * hechos / total) + "%";
    $("estadoObs").textContent = `${etiquetaEstado()} · ${hechos}/${total} indicadores`;
  }
  function etiquetaEstado() {
    return { borrador: "Borrador (guardado en este equipo)", pendiente: "Pendiente de envío a Drive", guardado: "Guardado en Drive" }[obs.estado] || "Borrador";
  }

  /* ---------- Formulario <-> objeto ---------- */
  function cargarEnFormulario() {
    CAMPOS.forEach(c => { $(c).value = obs[c] || ""; });
    $("grupo").value = obs.grupo || "";
    document.querySelectorAll("#usosIA input").forEach(x => x.checked = obs.usosIA.includes(x.value));
    document.querySelectorAll("#evidenciasIA input").forEach(x => x.checked = obs.evidenciasIA.includes(x.value));
    U.indicadores.forEach(i => { marcarNiveles(i.id); document.querySelector(`[data-com="${i.id}"]`).value = obs.comentarios[i.id] || ""; });
    RETRO.forEach(c => { $("r_" + c).value = obs.retro[c] || ""; });
    actualizarResumen(); ajustarAlturas();
  }

  function ajustarAlturas() {
    document.querySelectorAll("textarea[data-com]").forEach(t => { t.style.height = "auto"; t.style.height = Math.max(40, t.scrollHeight + 2) + "px"; });
  }

  let tGuardar = null;
  function cambio() {
    if (obs.estado === "guardado") obs.estado = "borrador"; // hubo cambios después de guardar
    clearTimeout(tGuardar); tGuardar = setTimeout(() => { persistir(); actualizarResumen(); }, 300);
  }

  function enlazarFormulario() {
    $("usosIA").innerHTML = R.usosIA.map(u => `<label><input type="checkbox" value="${esc(u)}"> ${esc(u)}</label>`).join("");
    $("evidenciasIA").innerHTML = R.evidenciasIA.map(u => `<label><input type="checkbox" value="${esc(u)}"> ${esc(u)}</label>`).join("");
    CAMPOS.forEach(c => $(c).addEventListener("input", () => {
      obs[c] = $(c).value;
      if (c === "docente") {
        const n = nomina.find(x => x.nombre === obs.docente);
        obs.grupo = n ? n.grupo : ""; $("grupo").value = obs.grupo;
        if (n && n.curso && !obs.curso) { obs.curso = n.curso; $("curso").value = n.curso; }
      }
      if (c === "observador") A.store.set(K.observador, obs.observador);
      cambio();
    }));
    ["usosIA", "evidenciasIA"].forEach(k => $(k).addEventListener("change", () => {
      obs[k] = [...document.querySelectorAll(`#${k} input:checked`)].map(x => x.value); cambio();
    }));
    RETRO.forEach(c => $("r_" + c).addEventListener("input", () => { obs.retro[c] = $("r_" + c).value; cambio(); }));
    $("rubrica").addEventListener("input", e => { if (e.target.dataset.com) { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + 2 + "px"; } });
  }

  function validar() {
    const faltan = [];
    if (!obs.docente) faltan.push("docente");
    if (!obs.fecha) faltan.push("fecha");
    if (!obs.observador) faltan.push("observador/a");
    const sinNivel = U.indicadores.filter(i => obs.niveles[i.id] == null).length;
    return { faltan, sinNivel };
  }

  /* ---------- Acciones ---------- */
  function generar() {
    const r = A.generarRetro(obs);
    const hayTexto = obs.retro.fortalezas || obs.retro.mejoras;
    if (hayTexto && !confirm("¿Reemplazar el texto actual de fortalezas y aspectos a mejorar?")) return;
    Object.assign(obs.retro, r);
    if (!obs.retro.fechaRetro) obs.retro.fechaRetro = hoy();
    RETRO.forEach(c => { $("r_" + c).value = obs.retro[c] || ""; });
    cambio(); A.toast("Retroalimentación generada. Revísela y edítela si es necesario.");
  }

  function vistaPrevia() {
    const m = A.modal(`<div class="card-head"><h2>Vista previa</h2><span class="avg"><button class="btn small" id="pvPrint">Imprimir</button> <button class="btn small" data-close>Cerrar</button></span></div><iframe title="Vista previa del informe"></iframe>`, { wide: true });
    m.el.querySelector("iframe").srcdoc = A.informeHTML(obs);
    m.el.querySelector("#pvPrint").onclick = () => m.el.querySelector("iframe").contentWindow.print();
  }

  function imprimir() {
    const v = validar();
    if (v.faltan.length) return A.toast("Complete: " + v.faltan.join(", "));
    A.imprimirHTML(A.informeHTML(obs));
  }

  async function enviar(o) {
    const r = await A.api("guardar", { codigo: A.store.get(K.codigo, ""), obs: o, html: A.informeHTML(o) });
    o.estado = "guardado"; o.pdfUrl = r.pdfUrl || ""; o.guardadoEn = new Date().toISOString();
    const t = todas(); t[o.id] = o; A.store.set(K.obs, t);
    A.store.set(K.cola, A.store.get(K.cola, []).filter(x => x !== o.id));
    return r;
  }

  async function guardar() {
    const v = validar();
    if (v.faltan.length) return A.toast("Complete: " + v.faltan.join(", "));
    if (v.sinNivel && !confirm(`Hay ${v.sinNivel} indicador(es) sin nivel marcado. ¿Guardar de todas formas?`)) return;
    clearTimeout(tGuardar); persistir();
    if (!A.conectado()) { A.toast("Modo local: la observación quedó guardada solo en este equipo."); return; }
    const btn = $("btnGuardar"); btn.disabled = true; btn.textContent = "Guardando…";
    try {
      const r = await enviar(obs);
      A.toast("Guardado en Drive" + (r.pdfUrl ? " con su PDF." : "."));
    } catch (e) {
      obs.estado = "pendiente"; persistir();
      const cola = A.store.get(K.cola, []); if (!cola.includes(obs.id)) cola.push(obs.id); A.store.set(K.cola, cola);
      A.toast("Sin conexión con Drive. Quedó en cola y se enviará automáticamente. (" + e.message + ")", 5000);
    } finally {
      btn.disabled = false; btn.textContent = "Guardar en Drive"; actualizarResumen(); estadoConexion();
    }
  }

  async function procesarCola() {
    if (!A.conectado() || !navigator.onLine) return;
    const cola = A.store.get(K.cola, []); if (!cola.length) return;
    const t = todas(); let n = 0;
    for (const id of cola) { if (t[id]) { try { await enviar(t[id]); n++; } catch (e) { break; } } }
    if (n) { A.toast(`${n} observación(es) pendiente(s) enviada(s) a Drive.`); if (obs && todas()[obs.id]) { obs.estado = todas()[obs.id].estado; actualizarResumen(); } }
    estadoConexion();
  }

  function estadoConexion() {
    const el = $("estadoConexion"), pend = A.store.get(K.cola, []).length;
    let cls = "ok", txt = "Conectado a Drive";
    if (!A.conectado()) { cls = "warn"; txt = "Modo local"; }
    else if (!navigator.onLine) { cls = "off"; txt = "Sin internet"; }
    if (pend) { cls = "warn"; txt += ` · ${pend} pendiente(s)`; }
    el.className = "chip " + cls; el.lastElementChild.textContent = txt;
  }

  function abrir(id) { obs = nueva(todas()[id]); A.store.set(K.actual, id); cargarEnFormulario(); window.scrollTo(0, 0); }

  function nuevaObs() {
    obs = nueva(); persistir(); cargarEnFormulario(); window.scrollTo(0, 0); A.toast("Nueva observación");
  }

  function duplicar() {
    if (!obs.coDocente) return A.toast("Seleccione primero en 'Clase compartida con' al/la co-docente.");
    const co = nomina.find(x => x.nombre === obs.coDocente);
    const copia = nueva({ ...JSON.parse(JSON.stringify(obs)), id: A.uid(), estado: "borrador", pdfUrl: "", docente: obs.coDocente, coDocente: obs.docente, grupo: co ? co.grupo : "", creado: new Date().toISOString() });
    persistir(); obs = copia; persistir(); cargarEnFormulario();
    A.toast(`Copia creada para ${copia.docente}. Revise los niveles y comentarios individuales.`);
  }

  // Observaciones del equipo: las guardadas en Drive por todos + los borradores de este computador
  async function cargarEquipo() {
    let servidor = A.store.get(K.equipo, []), enLinea = false;
    if (A.conectado() && navigator.onLine) {
      try {
        const r = await A.api("listar", { codigo: A.store.get(K.codigo, "") });
        servidor = r.observaciones || []; A.store.set(K.equipo, servidor); enLinea = true;
      } catch (e) { }
    }
    const mapa = {};
    servidor.forEach(o => { mapa[o.id] = { ...o, estado: "guardado" }; });
    Object.values(todas()).forEach(o => {
      const s = mapa[o.id];
      // Se prefiere la versión local solo si tiene cambios aún no enviados
      if (!s || (o.estado !== "guardado" && (o.actualizado || "") >= (s.actualizado || ""))) mapa[o.id] = o;
    });
    return { mapa, enLinea };
  }

  // Eliminar una pauta guardada en Drive (repetida o por error). Requiere la clave UTP, que se verifica en el servidor.
  function eliminarDeDrive(o, alTerminar) {
    const m = A.modal(`<h2>Eliminar observación</h2>
      <p>Se eliminará la pauta de <b>${esc(o.docente)}</b> (${esc(o.curso)} · ${esc(A.fechaLarga(o.fecha))}), registrada por ${esc(o.observador || "—")}.</p>
      <p class="small muted">Desaparecerá de la lista del equipo y del Área UTP. Queda un respaldo en la hoja «Eliminadas» de la planilla y el PDF pasa a la papelera de Drive.</p>
      <label class="f">Clave UTP<input id="eClave" type="password" autocomplete="off"></label>
      <p class="small" id="eErr" style="color:var(--danger)"></p>
      <div class="actions"><button class="btn" data-close>Cancelar</button><button class="btn primary" id="eOk" style="background:var(--danger);border-color:var(--danger)">Eliminar</button></div>`);
    const ok = async () => {
      const clave = m.el.querySelector("#eClave").value.trim(); if (!clave) return;
      const b = m.el.querySelector("#eOk"); b.disabled = true; b.textContent = "Eliminando…";
      try {
        await A.api("eliminar", { clave, id: o.id });
        const all = todas(); delete all[o.id]; A.store.set(K.obs, all);
        A.store.set(K.equipo, A.store.get(K.equipo, []).filter(x => x.id !== o.id));
        A.store.set(K.cola, A.store.get(K.cola, []).filter(x => x !== o.id));
        if (obs.id === o.id) nuevaObs();
        m.close(); A.toast("Observación eliminada."); alTerminar && alTerminar();
      } catch (e) {
        m.el.querySelector("#eErr").textContent = e.message; b.disabled = false; b.textContent = "Eliminar";
      }
    };
    m.el.querySelector("#eOk").onclick = ok;
    m.el.querySelector("#eClave").addEventListener("keydown", e => { if (e.key === "Enter") ok(); });
    setTimeout(() => m.el.querySelector("#eClave").focus(), 50);
  }

  async function misObservaciones() {
    const m = A.modal(`<h2>Observaciones del equipo</h2><p class="muted">Cargando desde Drive…</p>`);
    const { mapa, enLinea } = await cargarEquipo();
    const lista = Object.values(mapa).filter(o => o.docente || o.estado !== "guardado")
      .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "") || (b.actualizado || "").localeCompare(a.actualizado || ""));
    const fila = o => {
      const marcados = U.indicadores.filter(i => o.niveles[i.id] != null).length;
      const b = o.estado === "guardado" ? `<span class="badge ok">En Drive</span>` : o.estado === "pendiente" ? `<span class="badge warn">Pendiente (este equipo)</span>` : `<span class="badge">Borrador (este equipo)</span>`;
      const buscar = [o.docente, o.observador, o.curso, o.grupo, o.fecha].join(" ").toLowerCase();
      return `<tr data-buscar="${esc(buscar)}"><td><b>${esc(o.docente || "(sin docente)")}</b><br><span class="small muted">${esc(o.curso)} · ${esc(o.fecha)}</span></td><td class="small">${esc(o.observador || "—")}</td><td>${marcados}/${U.indicadores.length}</td><td>${b}${o.pdfUrl ? `<br><a class="small" href="${esc(o.pdfUrl)}" target="_blank" rel="noopener">PDF</a>` : ""}</td>
        <td class="actions"><button class="btn small" data-abrir="${o.id}">Abrir</button><button class="btn small" data-imp="${o.id}">Imprimir</button>${o.estado !== "guardado" ? `<button class="btn small ghost" data-del="${o.id}" title="Eliminar de este computador">Eliminar</button>` : `<button class="btn small ghost" data-elim="${o.id}" title="Eliminar de Drive (requiere clave UTP)" style="color:var(--danger)">Eliminar</button>`}</td></tr>`;
    };
    m.el.querySelector(".modal").style.maxWidth = "860px";
    m.el.querySelector(".modal").innerHTML = `<h2>Observaciones del equipo (${lista.length})</h2>
      <p class="small muted" style="margin-top:-4px">${enLinea ? "Incluye las pautas guardadas en Drive por todo el equipo y los borradores de este computador." : A.conectado() ? "Sin conexión con Drive: se muestra la última lista descargada y los borradores de este computador." : "Modo local: solo observaciones de este computador."}</p>
      <input id="mBuscar" placeholder="Buscar por docente, observador/a, curso o grupo" style="margin-bottom:8px">
      ${lista.length ? `<table class="list"><thead><tr><th>Docente</th><th>Observador/a</th><th>Avance</th><th>Estado</th><th></th></tr></thead><tbody>${lista.map(fila).join("")}</tbody></table>` : `<p class="muted">Aún no hay observaciones.</p>`}
      <div class="actions"><button class="btn" data-close>Cerrar</button></div>`;
    m.el.querySelector("[data-close]").onclick = m.close;
    m.el.querySelector("#mBuscar").addEventListener("input", e => {
      const q = e.target.value.toLowerCase().trim();
      m.el.querySelectorAll("tr[data-buscar]").forEach(tr => { tr.style.display = !q || tr.dataset.buscar.includes(q) ? "" : "none"; });
    });
    m.el.addEventListener("click", e => {
      const t = e.target;
      if (t.dataset.abrir) {
        const o = mapa[t.dataset.abrir], all = todas();
        if (!all[o.id] || all[o.id].estado === "guardado") { all[o.id] = o; A.store.set(K.obs, all); }
        abrir(o.id); m.close();
        if (o.observador && o.observador !== A.store.get(K.observador, "")) A.toast(`Pauta de ${o.observador}. Si la modifica y guarda, se actualiza para todo el equipo.`, 4500);
      }
      if (t.dataset.imp) A.imprimirHTML(A.informeHTML(mapa[t.dataset.imp]));
      if (t.dataset.elim) eliminarDeDrive(mapa[t.dataset.elim], () => { m.close(); misObservaciones(); });
      if (t.dataset.del && confirm("¿Eliminar este borrador de este computador? No se puede deshacer.")) {
        const all = todas(); delete all[t.dataset.del]; A.store.set(K.obs, all);
        A.store.set(K.cola, A.store.get(K.cola, []).filter(x => x !== t.dataset.del));
        m.close(); if (obs.id === t.dataset.del) nuevaObs(); misObservaciones();
      }
    });
  }

  /* ---------- Inicio ---------- */
  async function init() {
    await (window.UTP360_LISTO || Promise.resolve()); // espera el ingreso único de la plataforma UTP360
    renderRubrica(); enlazarFormulario();
    const compacto = A.store.get(K.compacto, false);
    $("compacto").checked = compacto; document.body.classList.toggle("compact", compacto);
    $("compacto").onchange = () => { document.body.classList.toggle("compact", $("compacto").checked); A.store.set(K.compacto, $("compacto").checked); };
    $("subtitulo").textContent = `${C.COLEGIO} · Innovación Pedagógica`;

    if (!A.conectado()) {
      $("avisoLocal").classList.remove("hidden");
      $("avisoLocal").innerHTML = "<b>Modo local.</b> Aún no se ha configurado la conexión con Google Drive: las observaciones se guardan solo en este navegador. Puede imprimirlas igual.";
    }
    await cargarNomina(); llenarSelects();

    const actual = A.store.get(K.actual, null), t = todas();
    obs = actual && t[actual] ? nueva(t[actual]) : nueva();
    persistir(); cargarEnFormulario();

    $("btnGenerar").onclick = generar;
    $("btnVista").onclick = vistaPrevia;
    $("btnImprimir").onclick = imprimir;
    $("btnGuardar").onclick = guardar;
    $("btnNueva").onclick = () => { if (confirm("¿Iniciar una nueva observación? La actual queda en 'Observaciones del equipo'.")) nuevaObs(); };
    $("btnMis").onclick = misObservaciones;
    $("btnDuplicar").onclick = duplicar;
    window.addEventListener("online", () => { estadoConexion(); procesarCola(); });
    window.addEventListener("offline", estadoConexion);
    window.addEventListener("resize", ajustarAlturas);
    estadoConexion(); procesarCola();
  }
  init();
})();
