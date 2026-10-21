/**
 * UTP360 — Guardián de acceso + datos individuales por cliente
 * ---------------------------------------------------------------
 * Incluir en CADA herramienta (Planificador, Evalúa, etc.), justo antes de
 * cerrar </body>:
 *
 *   <script>window.UTP360_PRODUCTO = "Planificador";</script>  <!-- EXACTO como en la columna "Producto" de la hoja Accesos -->
 *   <script src="/guardia.js"></script>
 *
 * Qué resuelve:
 *   1. El cliente llega a la app con un link personal: /app/planificador/?c=su-codigo
 *      (acceso.html ya agrega automáticamente ese "?c=" al redirigirlo).
 *   2. Este script valida ese código contra la planilla de Google: que exista,
 *      esté activo, no esté vencido, y sea EXACTAMENTE para este producto.
 *      Si algo falla, bloquea toda la pantalla — el cliente nunca ve ni toca
 *      la herramienta sin un código válido para ESE producto.
 *   3. Si el código es válido, deja disponible window.UTP360 con:
 *        UTP360.codigo              → identificador único de este cliente
 *        UTP360.nombre              → su nombre
 *        UTP360.cuenta / UTP360.rol → cuenta (persona o colegio) y rol (Administrador / Docente)
 *        UTP360.diasRestantes       → días de acceso que le quedan
 *        UTP360.cargar(cb)          → cb(datosGuardados) — lo que este cliente guardó antes ({} la primera vez)
 *        UTP360.guardar(datos, cb)  → guarda el objeto "datos" SOLO para este cliente en este producto
 *
 * Aislamiento de datos: cada cliente tiene su propio Codigo, y cargar()/guardar()
 * siempre quedan amarrados a ese Codigo + al producto declarado arriba. Así,
 * dos clientes distintos usando la MISMA herramienta (ej. dos personas que
 * compraron el Planificador) jamás ven ni sobrescriben los datos del otro.
 *
 * Evento disponible una vez validado el acceso:
 *   document.addEventListener('utp360:acceso-ok', function(e){ ...e.detail... });
 *   Úsalo para, por ejemplo, llamar a UTP360.cargar() y recién ahí dibujar
 *   los datos guardados del cliente en la pantalla.
 */
(function () {
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby6NhYIB6ZWgR76ny3UMIMvYVAgAbCMb1tQX43V5TIg1Y_875PigS2tLav9yI4AseI/exec';
  var PRODUCTO = window.UTP360_PRODUCTO || '';

  function llamarAppsScript(params) {
    return new Promise(function (resolve, reject) {
      var callbackName = 'utp360cb_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
      var script = document.createElement('script');
      var settled = false;

      function limpiar() {
        delete window[callbackName];
        if (script.parentNode) script.parentNode.removeChild(script);
        clearTimeout(timer);
      }
      var timer = setTimeout(function () {
        if (settled) return;
        settled = true; limpiar(); reject(new Error('timeout'));
      }, 15000);

      window[callbackName] = function (data) {
        if (settled) return;
        settled = true; limpiar(); resolve(data);
      };
      script.onerror = function () {
        if (settled) return;
        settled = true; limpiar(); reject(new Error('script_error'));
      };

      var qs = new URLSearchParams(params);
      qs.set('callback', callbackName);
      script.src = APPS_SCRIPT_URL + '?' + qs.toString();
      document.body.appendChild(script);
    });
  }

  function bloquear(titulo, desc) {
    document.documentElement.style.overflow = 'hidden';
    var overlay = document.createElement('div');
    overlay.setAttribute('style', 'position:fixed;inset:0;z-index:999999;background:#F7F5EF;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,sans-serif;');
    overlay.innerHTML =
      '<div style="max-width:420px;text-align:center;background:#fff;border-radius:16px;padding:32px;box-shadow:0 10px 30px -10px rgba(0,0,0,0.2);">' +
        '<p style="font-weight:800;font-size:18px;margin:0 0 8px;color:#a83f26;">' + titulo + '</p>' +
        '<p style="color:#5B6357;font-size:15px;margin:0 0 20px;">' + desc + '</p>' +
        '<a href="/acceso.html" style="display:inline-block;background:#1C231C;color:#F7F5EF;padding:12px 22px;border-radius:100px;font-weight:700;text-decoration:none;font-size:14.5px;">Ir a acceso de clientes</a>' +
      '</div>';
    document.body.appendChild(overlay);
  }

  function mostrarCargando() {
    var overlay = document.createElement('div');
    overlay.id = 'utp360-loading-overlay';
    overlay.setAttribute('style', 'position:fixed;inset:0;z-index:999999;background:#F7F5EF;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#5B6357;font-weight:600;');
    overlay.textContent = 'Verificando tu acceso…';
    document.body.appendChild(overlay);
  }
  function quitarCargando() {
    var el = document.getElementById('utp360-loading-overlay');
    if (el) el.remove();
  }

  var params = new URLSearchParams(window.location.search);
  var codigo = (params.get('c') || '').trim();

  window.UTP360 = {
    codigo: codigo,
    nombre: '',
    diasRestantes: null,
    cargar: function (cb) {
      llamarAppsScript({ codigo: codigo, accion: 'cargar', producto: PRODUCTO })
        .then(function (resp) { cb(resp && resp.valid ? (resp.datos || {}) : {}); })
        .catch(function () { cb({}); });
    },
    guardar: function (datos, cb) {
      llamarAppsScript({ codigo: codigo, accion: 'guardar', producto: PRODUCTO, datos: JSON.stringify(datos || {}) })
        .then(function (resp) { if (cb) cb(!!(resp && resp.valid)); })
        .catch(function () { if (cb) cb(false); });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (!codigo) {
      bloquear('Acceso restringido', 'Esta herramienta es solo para clientes. Ingresa tu código de acceso para continuar.');
      return;
    }
    mostrarCargando();
    llamarAppsScript({ codigo: codigo })
      .then(function (resp) {
        quitarCargando();
        if (!resp.valid) {
          var mensajes = {
            no_encontrado: 'No encontramos ese código de acceso.',
            vencido: 'El período contratado de tu cuenta venció.',
            suspendido: 'Tu acceso está suspendido. Contáctanos para resolverlo.'
          };
          bloquear('No pudimos validar tu acceso', mensajes[resp.motivo] || 'Ocurrió un problema al verificar tu código.');
          return;
        }
        var prodEsperado = String(PRODUCTO || '').trim().toLowerCase();
        var tiene = (resp.productos || []).some(function (p) {
          return p.contratado && String(p.producto || '').trim().toLowerCase() === prodEsperado;
        });
        if (!tiene) {
          bloquear('Herramienta no contratada', 'Tu cuenta no incluye esta herramienta UTP360. Escríbenos a contacto@utp360.cl para agregarla.');
          return;
        }
        window.UTP360.cuenta = resp.cuenta;
        window.UTP360.rol = resp.rol;
        window.UTP360.nombre = resp.nombre;
        window.UTP360.diasRestantes = resp.diasRestantes;
        document.dispatchEvent(new CustomEvent('utp360:acceso-ok', { detail: resp }));
      })
      .catch(function () {
        quitarCargando();
        bloquear('No pudimos verificar tu acceso', 'Hubo un problema de conexión. Recarga la página o inténtalo más tarde.');
      });
  });
})();
