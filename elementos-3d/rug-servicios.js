/* ═══════════════════════════════════════════════════════════════════════════
   RUG · SECCIÓN 02 — Cuatro módulos, un solo sistema
   Carrusel de cápsulas en Three.js ligado al scroll.

   Uso:
     import { mountRugServicios } from './rug-servicios.js';
     const app = mountRugServicios(document.querySelector('#rug-servicios'));
     // app.destroy() para desmontar (SPA / cambio de ruta)

   Requiere three >= 0.176 (por `renderer.transmissionResolutionScale`).
   Todas las opciones de render están en RENDER.md.
   ═══════════════════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║  1 · TEXTOS DE LOS SERVICIOS                                            ║
   ║  Esto es lo único que edita quien no toca el 3D.                        ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

export const MODULES = [
  {
    id: 'trafico-pago',
    numero: '01',
    nombre: 'Tráfico Pago',
    titular: 'Demanda que llega con presión.',
    descripcion:
      'Convertimos inversión publicitaria en oportunidades de venta. Gestionamos campañas ' +
      'con orientación a resultados y, sobre todo, a ventas a través de páginas web.',
    capacidades: [
      'Planeación de campañas',
      'Meta Ads / Google Ads',
      'Segmentación de audiencias',
      'Estructura de embudos',
      'Seguimiento de conversiones'
    ],
    reaccion: 'trafico',
    recipiente: 'matraz',   // los otros tres son el cilindro base
    excepcion: false          // false = acento lima · true = acento magenta
  },

  {
    id: 'creatividad-estrategica',
    numero: '02',
    nombre: 'Creatividad Estratégica',
    titular: 'Romper el patrón, a propósito.',
    descripcion:
      'Creamos piezas con una función dentro del sistema de ventas. ' +
      'No diseñamos por diseñar: convertimos atención en acción.',
    capacidades: [
      'Dirección de arte',
      'Piezas para campaña',
      'Video y motion',
      'Mensajes y ángulos',
      'Pruebas creativas A/B'
    ],
    reaccion: 'creatividad',
    excepcion: true
  },

  {
    id: 'conversion-digital',
    numero: '03',
    nombre: 'Conversión Digital',
    titular: 'Caos que colapsa en estructura.',
    descripcion:
      'Hacemos que el tráfico tenga dónde convertir. No llevamos más personas ' +
      'a una página que no está preparada para vender.',
    capacidades: [
      'Landing pages de venta',
      'Arquitectura de página',
      'Copy de conversión',
      'Optimización de velocidad',
      'Medición y analítica'
    ],
    reaccion: 'conversion',
    excepcion: false
  },

  {
    id: 'automatizacion-sistemas',
    numero: '04',
    nombre: 'Automatización & Sistemas',
    titular: 'Procesos que ya no hay que empujar.',
    descripcion:
      'Convertimos procesos repetitivos en sistemas. Menos operación manual, ' +
      'más capacidad para vender y crecer.',
    capacidades: [
      'Integraciones y CRM',
      'Flujos automatizados',
      'Seguimiento de leads',
      'Reportería automática',
      'Operación sin fricción'
    ],
    reaccion: 'auto',
    excepcion: false
  }
];

/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║  2 · CONFIGURACIÓN DE RENDER                                            ║
   ║  Cada clave está explicada en RENDER.md, con su costo y su efecto.      ║
   ║  No hace falta tocar nada de aquí para que funcione.                    ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

export const CONFIG = {

  paleta: {
    fondo:     '#0A0B0D',
    acento:    '#C9F24D',
    excepcion: '#E85D9B',
    frio:      '#3D4A52'
  },

  /* --- pipeline de render (valores originales de rug-servicios-original) - */
  render: {
    entorno:            true,
    entornoIntensidad:  { vidrio: 1.25, metal: 1.55 },
    transmision:        true,
    toneMapping:        'aces',
    exposicion:         1.06,
    grabado:            true,
    grabadoOpacidad:    0.80,
    bloom:  { activo: true, fuerza: 0.62, radio: 0.72, umbral: 0.62 },
    film:   { activo: true, grano: 0.042, vineta: 1.25, aberracion: 0.0040 },
    antialias:          true,
    pixelRatioMax:      { escritorio: 1.75, movil: 1.25 },

    /* Resolucion del buffer de transmision, como fraccion del drawing buffer.
       OJO con la historia: hasta three 0.176 la propiedad NO existia, el guard
       `in renderer` fallaba en silencio y esto llevaba meses sin hacer nada —
       la transmision corria a resolucion completa. Ahora el knob es real, por
       eso queda en 1.0: bajarlo SI cambia el aspecto de la refraccion.
       0.5 en escritorio es el ahorro grande si decides aceptarlo. */
    escalaTransmision:  { escritorio: 1.0,  movil: 1.0 }
  },

  /* --- geometría y layout (cilindro recto, idéntico al original) --------- */
  capsula: {
    radio:      0.50,
    altura:     1.72,
    segmentos:  { escritorio: 96, movil: 48 }
  },
  layout: {
    separacion:     2.45,
    profundidad:    1.35,
    inclinacion:    0.085,
    escalaLateral:  0.16,
    camaraLejos:    6.80,   // z entre módulos
    camaraCerca:    4.60,   // z centrado → cápsula ≈ 70% del alto (FOV 30°, H 1.72)
    dispersionFoco: 2.0,    // multiplicador de separación cuando focus=1
    disolucionVidrio: 0.82
  },

  /* --- transicion hero -> modulo 01 ------------------------------------- */
  /* activa:false deja el modulo EXACTAMENTE como en v4/v5: canvas dentro de la
     seccion, sin particulas de transicion, sin barrido. Solo v6 lo enciende. */
  transicion: {
    activa:        false,
    onProgreso:    null,   // (p) => void. La pagina anfitriona anima su UI aqui
    alturaVh:      180,    // alto del pin, en vh
    chispas:       { alto: 900, medio: 500, bajo: 220 }
  },

  /* --- velo de fondo ---------------------------------------------------- */
  velo: {
    base:      0.45,   // opacidad ya al entrar: sin esto el copy compite con el fondo
    techo:     0.90,   // opacidad una vez pasado el primer modulo
    recorrido: 0.85    // en modulos: cuanto tarda en llegar del base al techo
  },

  /* --- movimiento ------------------------------------------------------ */
  movimiento: {
    giroCapsula:      0.10,
    flotacion:        0.020,
    amortiguacion:    0.085,
    margenScroll:     0.08
  },

  /* --- móvil ----------------------------------------------------------- */
  movil: {
    /* En movil la capsula llenaba la pantalla de arriba abajo y el texto
       quedaba encima del vidrio, ilegible. Se aleja la camara para que ocupe
       ~40% del alto en vez de ~70%, y se baja para que el objeto suba a la
       mitad superior y deje la inferior libre para el copy.

       El calculo: con FOV 30 la altura visible es 0.536*distancia. Para que
       H=1.72 sea el 40% hacen falta 4.30 de alto visible, o sea 8.0 de
       distancia. El desplazamiento de 0.95 sube el objeto ~22% del cuadro. */
    camara: { cerca: 8.0, lejos: 10.6, desplazamientoY: 1.12 },
    desactivarTransmision: true,
    opacidadVidrio:        0.50,
    particulasTrafico:     300,
    particulasConversion:  150
  },

  escritorio: {
    particulasTrafico:     800,
    particulasConversion:  280
  }
};


/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║  3 · IMPLEMENTACIÓN                                                     ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

/* ── PERFIL DEL MATRAZ ERLENMEYER ──────────────────────────────────────────
   Un solo juego de numeros del que salen DOS cosas: la geometria de vidrio
   (LatheGeometry) y el radio que siguen las particulas dentro. Estan escritos
   una vez y la version GLSL se genera desde este mismo objeto, asi que el
   flujo no puede desalinearse del recipiente por mas que se toquen valores.

   La forma es cono + cuello unidos por un "smooth max": la recta del cono se
   extrapola hasta cruzar el radio del cuello en `apice`, y el maximo suave
   contra ese radio produce el hombro redondeado sin fabricar el filete a
   mano. Fuera del hombro el error del smooth max es despreciable.          */
const MATRAZ = {
  cuello: 0.32,    // radio nominal del cuello, en fraccion de R. OJO: el smooth
                   // max le suma ~0.5*filete, asi que el radio real es ~0.41R.
                   // Con eso la relacion cuello/base queda en 0.40, la de un
                   // Erlenmeyer de verdad (34mm de boca sobre 85mm de base).
  pie:    0.045,   // altura del pie recto, en fraccion de H desde la base
  apice:  0.715,   // altura donde la recta del cono alcanza el radio del cuello
  filete: 0.052,   // radio del hombro, en fraccion de H
  labio:  0.10     // ensanche del labio en la boca, en fraccion del cuello
};

function matrazRadio(y, R, H) {
  const rN = R * MATRAZ.cuello;
  const yF = -H / 2 + H * MATRAZ.pie;
  const yA = -H / 2 + H * MATRAZ.apice;
  const k  = H * MATRAZ.filete;
  const cone = R + (rN - R) * clamp((y - yF) / (yA - yF), 0, 1);
  const d = cone - rN;
  return rN + 0.5 * (d + Math.sqrt(d * d + k * k))
       + rN * MATRAZ.labio * smoothstep(y, H / 2 - H * 0.045, H / 2);
}

/* La misma funcion, para el vertex shader de las particulas. */
const MATRAZ_GLSL = `
float matrazR(float y){
  float rN = uR * ${MATRAZ.cuello};
  float yF = -uH * 0.5 + uH * ${MATRAZ.pie};
  float yA = -uH * 0.5 + uH * ${MATRAZ.apice};
  float k  = uH * ${MATRAZ.filete};
  float cone = uR + (rN - uR) * clamp((y - yF) / (yA - yF), 0.0, 1.0);
  float d = cone - rN;
  return rN + 0.5 * (d + sqrt(d * d + k * k))
       + rN * ${MATRAZ.labio} * smoothstep(uH * 0.5 - uH * 0.045, uH * 0.5, y);
}`;

/* Perfil muestreado para LatheGeometry, de la base a la boca. */
function matrazPerfil(R, H, pasos, offset = 0) {
  const p = [];
  for (let i = 0; i <= pasos; i++) {
    const y = -H / 2 + (i / pasos) * H;
    p.push(new THREE.Vector2(matrazRadio(y, R, H) + offset, y));
  }
  return p;
}


const TONE = {
  aces:    THREE.ACESFilmicToneMapping,
  neutral: THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping,
  none:    THREE.NoToneMapping
};

/* Detecta WebGL sin instanciar three. La pagina la llama ANTES del import()
   dinamico, asi que un dispositivo sin WebGL no llega a descargar la libreria. */
/* Nivel de calidad por heuristica barata. detect-gpu necesita descargar una
   base de datos de GPUs; estas cuatro senales aciertan lo suficiente para
   repartir en tres cajones y cuestan cero bytes.
   `alto` deja todos los parametros como en v5, que es el requisito. */
export function nivelCalidad() {
  const q = (typeof location !== 'undefined' &&
    /[?&]calidad=(alto|medio|bajo)/.exec(location.search));
  if (q) return q[1];                       // forzado por query, para medir

  const movil = matchMedia('(max-width: 860px)').matches;
  const mem   = navigator.deviceMemory || (movil ? 4 : 8);
  const nucleos = navigator.hardwareConcurrency || (movil ? 4 : 8);

  let gpu = '';
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) gpu = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)).toLowerCase();
  } catch (_) {}
  /* Integradas viejas y moviles de gama baja: nombres que aparecen una y otra
     vez en el ultimo cuartil de rendimiento. */
  const debil = /(swiftshader|llvmpipe|software|adreno [1-5]\d\d|mali-[tg]?[1-6]\d\d|powervr|intel.*(hd|uhd) graphics (5|6)\d\d)/.test(gpu);

  if (debil || mem <= 2 || nucleos <= 2) return 'bajo';
  if (movil || mem <= 4 || nucleos <= 4) return 'medio';
  return 'alto';
}

export function webglDisponible() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
              (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (_) { return false; }
}

export function mountRugServicios(root, overrides = {}) {
  const cfg = deepMerge(structuredClone(CONFIG), overrides);

  const isMobile = matchMedia('(max-width: 860px)').matches;
  const reduced  = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nivel    = nivelCalidad();

  const ACCENT  = new THREE.Color(cfg.paleta.acento);
  const MAGENTA = new THREE.Color(cfg.paleta.excepcion);
  const COLD    = new THREE.Color(cfg.paleta.frio);
  const R = cfg.capsula.radio;
  const H = cfg.capsula.altura;
  const SEG = isMobile ? cfg.capsula.segmentos.movil : cfg.capsula.segmentos.escritorio;

  /* ---- DOM ---------------------------------------------------------- */
  root.classList.add('rug-sv');
  if (cfg.transicion.activa) {
    root.classList.add('rug-sv--transicion');
    /* El riel conserva su altura de siempre: la transicion vive en el tramo
       de salida del hero, antes de el, y no le roba recorrido a los modulos. */
  }
  root.innerHTML = markup();
  const stage   = root.querySelector('.rug-sv__stage');
  const washEl  = root.querySelector('.rug-sv__wash');
  const canvas  = root.querySelector('.rug-sv__canvas');
  const copyEl  = root.querySelector('.rug-sv__copy');
  const railEl  = root.querySelector('.rug-sv__rail');
  const pieEl   = root.querySelector('.rug-sv__foot');

  const slots = MODULES.map(m => {
    const el = document.createElement('article');
    el.className = 'rug-sv__slot';
    el.id = m.id;
    el.innerHTML = `
      <div class="rug-sv__kicker${m.excepcion ? ' is-alt' : ''}">¿Qué ofrecemos?</div>
      <h3 class="rug-sv__title">${m.nombre}</h3>
      <p class="rug-sv__desc">${m.descripcion}</p>
      ${m.capacidades?.length ? `<ul class="rug-sv__caps">${
        m.capacidades.map(c => `<li>${c}</li>`).join('')}</ul>` : ''}
`;
    copyEl.appendChild(el);
    return el;
  });

  const bars = MODULES.map(() => {
    const i = document.createElement('i');
    const s = document.createElement('s');
    i.appendChild(s); railEl.appendChild(i);
    return s;
  });

  /* ---- renderer ------------------------------------------------------ */
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true,
    antialias: cfg.render.antialias && !isMobile,
    powerPreference: 'high-performance'
  });
  /* Nivel de calidad. `alto` deja todo exactamente como en v5 — ese es el
     requisito; medio y bajo recortan resolucion, que es de donde sale el
     grueso del coste en GPU debil. */
  const factorPR = nivel === 'bajo' ? 0.72 : nivel === 'medio' ? 0.85 : 1;
  const escalaBloomRef = nivel === 'bajo' ? 0.5 : nivel === 'medio' ? 0.7 : 1;
  renderer.setPixelRatio(Math.min(devicePixelRatio,
    (isMobile ? cfg.render.pixelRatioMax.movil : cfg.render.pixelRatioMax.escritorio) * factorPR));
  renderer.outputColorSpace   = THREE.SRGBColorSpace;
  renderer.toneMapping        = TONE[cfg.render.toneMapping] ?? THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = cfg.render.exposicion;
  /* three >= 0.176. El guard se queda por si alguien revierte el vendor a una
     version vieja, pero ya no deberia entrar nunca en el else. */
  if ('transmissionResolutionScale' in renderer) {
    renderer.transmissionResolutionScale =
      isMobile ? cfg.render.escalaTransmision.movil : cfg.render.escalaTransmision.escritorio;
  } else if (cfg.render.escalaTransmision.escritorio !== 1.0) {
    console.warn('[RUG] three sin transmissionResolutionScale: escalaTransmision se ignora');
  }

  const scene  = new THREE.Scene();
  scene.fog    = new THREE.Fog(new THREE.Color(cfg.paleta.fondo), 7, 12);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);

  /* ---- entorno: lightbox propio → PMREM (idéntico al original) ------- */
  let envMap = null;
  if (cfg.render.entorno) {
    const s = new THREE.Scene();
    s.background = new THREE.Color(0x05060a);
    const panel = (w, h, hex, mult, pos, look) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(hex).multiplyScalar(mult),
          toneMapped: false, side: THREE.DoubleSide
        }));
      m.position.set(...pos); m.lookAt(...(look || [0, 0, 0])); s.add(m);
    };
    panel(7, 4.2, '#ffffff', 2.6, [-2.4,  2.6,  3.4]);
    panel(0.55, 6.0, '#dfe9ff', 9.0, [ 3.0,  0.4,  1.6]);
    panel(0.40, 5.0, '#ffffff', 6.0, [-2.9, -0.1,  0.9]);
    panel(6, 4, '#1a2430', 1.0, [0, -0.2, -5.0]);
    panel(5, 5, cfg.paleta.acento, 0.55, [0, -3.1, 0.4], [0, 1, 0]);
    panel(5, 5, '#0b0d10', 1.0, [0, 3.4, 0], [0, -1, 0]);
    const pmrem = new THREE.PMREMGenerator(renderer);
    envMap = pmrem.fromScene(s, 0.035).texture;
    pmrem.dispose();
    scene.environment = envMap;
  }

  /* ---- textura de grabado -------------------------------------------- */
  const etch = cfg.render.grabado ? etchTexture(renderer) : null;

  /* ---- reacciones ---------------------------------------------------- */
  const REACTIONS = {
    trafico:     () => reactionTrafico(cfg, isMobile, R, H, ACCENT, renderer),
    creatividad: () => reactionCreatividad(R, H, ACCENT, MAGENTA),
    conversion:  () => reactionConversion(cfg, isMobile, R, H, ACCENT, renderer),
    auto:        () => reactionAuto(cfg, isMobile, R, ACCENT, COLD, renderer)
  };

  /* ---- las cuatro cápsulas (idénticas al original) ------------------- */
  const capsules = MODULES.map((m, j) => {
    const g = new THREE.Group(); scene.add(g);
    const tone = m.excepcion ? MAGENTA : ACCENT;
    const noTrans = isMobile && cfg.movil.desactivarTransmision;

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x14181b, metalness: 0, roughness: 0.075, ior: 1.46,
      transmission: (cfg.render.transmision && !noTrans) ? 1 : 0,
      thickness: 0.42, transparent: true, depthWrite: false,
      clearcoat: 1, clearcoatRoughness: 0.06,
      envMapIntensity: cfg.render.entorno ? cfg.render.entornoIntensidad.vidrio : 0,
      side: THREE.DoubleSide,
      opacity: noTrans ? cfg.movil.opacidadVidrio : 1
    });
    /* Matraz: lathe sobre el perfil compartido. PASOS alto porque el hombro
       es lo unico curvo de la pieza y con pocos tramos se facetea a la vista.
       rBoca sustituye a R en todo lo que vive en la parte alta (collar, boca,
       anillo): en el cilindro esas piezas median R, aqui miden el cuello. */
    const esMatraz = m.recipiente === 'matraz';
    const PASOS = isMobile ? 72 : 144;
    const rBoca = esMatraz ? matrazRadio(H / 2, R, H) : R;

    const glass = new THREE.Mesh(
      esMatraz ? new THREE.LatheGeometry(matrazPerfil(R, H, PASOS), SEG)
               : new THREE.CylinderGeometry(R, R, H, SEG, 1, true), glassMat);
    glass.renderOrder = 2; g.add(glass);

    const metalMat = new THREE.MeshPhysicalMaterial({
      color: cfg.render.entorno ? 0xb8bfc4 : 0x6a7278,
      metalness: 1, roughness: 0.185,
      envMapIntensity: cfg.render.entorno ? cfg.render.entornoIntensidad.metal : 0,
      clearcoat: 0.5, clearcoatRoughness: 0.25, transparent: true
    });
    if ('anisotropy' in metalMat) { metalMat.anisotropy = 0.85; metalMat.anisotropyRotation = Math.PI / 2; }

    const collarTop = new THREE.Mesh(
      new THREE.CylinderGeometry(rBoca * 1.045, rBoca * 1.045, 0.115, SEG, 1, true), metalMat);
    collarTop.position.y = H / 2 - 0.045;

    /* El collar bajo no puede ser recto sobre el matraz: el pie mide R y el
       cono ya se cierra encima. Se le da la misma conicidad y se acorta para
       no morder la pared inclinada. */
    const collarBot = new THREE.Mesh(esMatraz
      ? new THREE.CylinderGeometry(matrazRadio(-H / 2 + 0.16, R, H) * 1.035, R * 1.07, 0.17, SEG, 1, true)
      : new THREE.CylinderGeometry(R * 1.07, R * 1.02, 0.235, SEG, 1, true), metalMat);
    collarBot.position.y = esMatraz ? -H / 2 + 0.072 : -H / 2 + 0.09;
    const base = new THREE.Mesh(new THREE.CircleGeometry(R * 1.02, SEG), metalMat);
    base.rotation.x = -Math.PI / 2; base.position.y = -H / 2 - 0.026;
    g.add(collarTop, collarBot, base);

    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x05070a, transparent: true });
    const mouth = new THREE.Mesh(new THREE.CircleGeometry(rBoca * 0.985, SEG), mouthMat);
    mouth.rotation.x = -Math.PI / 2; mouth.position.y = H / 2 - 0.004;
    const ringMat = new THREE.MeshBasicMaterial({ color: tone, toneMapped: false, transparent: true });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(rBoca * 0.985, 0.0075, 8, 80), ringMat);
    ring.rotation.x = Math.PI / 2; ring.position.y = H / 2;
    g.add(mouth, ring);

    let wrapMat = null;
    if (etch) {
      wrapMat = new THREE.MeshBasicMaterial({
        map: etch, transparent: true, opacity: cfg.render.grabadoOpacidad,
        depthWrite: false, side: THREE.DoubleSide
      });
      /* El grabado sigue el mismo perfil, desplazado 4 milesimas hacia afuera.
         En el matraz se estira sobre el cono — que es justo como se ve la
         serigrafia impresa en un Erlenmeyer real. */
      const wrap = new THREE.Mesh(esMatraz
        ? new THREE.LatheGeometry(matrazPerfil(R, H, PASOS, 0.004), SEG)
        : new THREE.CylinderGeometry(R * 1.004, R * 1.004, H * 0.96, SEG, 1, true), wrapMat);
      wrap.renderOrder = 3; g.add(wrap);
    }

    const glowMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: tone.clone() }, uI: { value: m.excepcion ? 0.5 : 0.62 } },
      vertexShader: `varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform vec3 uColor;uniform float uI;varying vec2 v;
        void main(){float d=length(v-.5)*2.,a=pow(max(1.-d,0.),3.2)*uI;gl_FragColor=vec4(uColor*a,a);}`
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.9), glowMat);
    glow.rotation.x = -Math.PI / 2; glow.position.y = -H / 2 - 0.05; g.add(glow);

    const reaction = REACTIONS[m.reaccion]();
    g.add(reaction.group);

    return { group: g, glassMat, metalMat, wrapMat, ringMat, mouthMat, glowMat,
             reaction, index: j, baseGlow: m.excepcion ? 0.5 : 0.62, noTrans, active: false };
  });

  /* ---- chispas de entrada --------------------------------------------- */
  let chispas = null;
  if (cfg.transicion.activa && !reduced) {
    chispas = chispasEntrada(cfg, nivel, H, ACCENT, renderer);
    scene.add(chispas.objeto);
  }

  /* ---- postproceso --------------------------------------------------- */
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.addPass(new RenderPass(scene, camera));

  let bloom = null;
  if (cfg.render.bloom.activo) {
    /* El bloom de three es multipase sobre 5 mips; bajarle la resolucion de
       partida es lo que mas alivia en gama baja, y a estas intensidades
       apenas se distingue. */
    const escalaBloom = escalaBloomRef;
    bloom = new UnrealBloomPass(
      new THREE.Vector2(innerWidth * escalaBloom, innerHeight * escalaBloom),
      isMobile ? cfg.render.bloom.fuerza * 0.68 : cfg.render.bloom.fuerza,
      cfg.render.bloom.radio, cfg.render.bloom.umbral);
    composer.addPass(bloom);
  }

  let film = null;
  if (cfg.render.film.activo) {
    film = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null }, uTime: { value: 0 },
        uGrain: { value: cfg.render.film.grano },
        uVig:   { value: cfg.render.film.vineta },
        uCA:    { value: cfg.render.film.aberracion },
      },
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `
        uniform sampler2D tDiffuse;uniform float uTime,uGrain,uVig,uCA;
        varying vec2 vUv;
        void main(){
          vec2 d=vUv-.5;
          vec2 uv = vUv;
          vec4 t=texture2D(tDiffuse,uv);
          float r=texture2D(tDiffuse,uv+d*uCA).r;
          float b=texture2D(tDiffuse,uv-d*uCA).b;
          vec3 c=vec3(r,t.g,b);
          c*=clamp(1.-dot(d,d)*uVig,0.,1.);
          float n=fract(sin(dot(vUv*vec2(1234.5,7654.3)+uTime,vec2(12.9898,78.233)))*43758.5453);
          /* Alpha reconstruido desde la LUMINANCIA, no heredado del buffer.
             UnrealBloomPass no es alpha-safe: su copia final aditiva deja
             alpha=1 en todo el frame, y por eso el canvas salia opaco y tapaba
             lo que hubiera detras en la pagina anfitriona. Aqui la opacidad la
             da la luz: donde la escena brilla ocluye, donde esta oscura deja
             pasar el fondo. Con premultipliedAlpha (el defecto de three) esto
             compone como c + fondo*(1-a), asi que SOBRE NEGRO el resultado es
             identico al opaco de antes — la demo aislada no cambia — y sobre el
             video del hero deja verse el rostro por las zonas oscuras.
             OJO: si se desactiva el pase de film, el canvas vuelve a ser opaco. */
          float lum=max(c.r,max(c.g,c.b));
          float a=clamp(lum*1.60,0.,1.);
          gl_FragColor=vec4(c+(n-.5)*uGrain*a,a);}`
    });
    composer.addPass(film);
  }
  composer.addPass(new OutputPass());

  /* ---- scroll → idx --------------------------------------------------- */
  let rawIdx = 0, idx = 0;

  /* Geometria del riel, cacheada. readScroll() corre en cada frame y hacerle
     un getBoundingClientRect() ahi dentro fuerza un layout por frame sobre un
     documento de siete pantallas. Lo unico que cambia frame a frame es
     scrollY; la posicion y el alto del riel solo cambian al redimensionar. */
  let rielTop = 0, rielAlto = 0, vpAlto = 1;
  function medirRiel() {
    const r = root.getBoundingClientRect();
    rielTop  = r.top + scrollY;   // offset absoluto en el documento
    rielAlto = r.height;
    vpAlto   = innerHeight || 1;
  }

  /* Progreso de la transicion, 0 a 1. Solo en modo transicion; en el resto
     queda clavado en 1, que es el estado "modulos ya presentes" de v4/v5. */
  let pTrans = cfg.transicion.activa ? 0 : 1;
  let ultProgresoAvisado = -1;

  const readScroll = () => {
    const total = Math.max(rielAlto - vpAlto, 1);
    const bruto = (scrollY - rielTop) / total;

    if (cfg.transicion.activa) {
      /* El progreso se mide desde el INICIO DEL DOCUMENTO, no desde el riel.
         Esta fue una correccion sobre la marcha: al colgarlo del riel, la
         transicion no arrancaba hasta que el stage quedaba pegado — y para
         entonces el hero ya habia salido de pantalla por scroll normal, asi
         que no llegaba a solapar nada. Justo la costura que veniamos a tapar.
         Midiendolo contra la salida del hero, la coreografia ocurre
         exactamente donde estaba el corte, y no hace falta alargar el riel ni
         desplazar los modulos. */
      const vhPin = reduced ? 40 : cfg.transicion.alturaVh;
      pTrans = clamp(scrollY / ((vhPin / 100) * vpAlto), 0, 1);
    }

    const p = clamp(bruto, 0, 1);
    const m = cfg.movimiento.margenScroll;
    rawIdx = clamp((p - m) / (1 - m * 2), 0, 1) * (MODULES.length - 1);
  };
  /* Antes esto era un addEventListener('scroll'). Con Lenis de por medio los
     eventos llegan sobre su timeline suavizado (~1.2 s de easing) y el riel se
     sentia gomoso. Leyendolo en el rAF la seccion queda inmune a cualquier
     libreria de scroll suave que monte la pagina anfitriona. */

  /* ---- layout derivado ------------------------------------------------ */
  function layout() {
    const near  = Math.round(idx);
    const dist  = Math.abs(idx - near);
    const focus = 1 - smoothstep(dist, 0.04, 0.42);

    /* ---- coreografia de la transicion ---------------------------------
       Todo es funcion pura de pTrans, por eso el scroll hacia arriba lo
       deshace exacto: no hay estado acumulado que revertir. */
    let dollyY = 0, dollyZ = 0, giro = 0, llegada = 1, entradaTexto = 1;
    if (cfg.transicion.activa && !reduced) {
      const p = pTrans;

      /* Llegada del matraz.
         Antes esto era un dolly de 1.35 en Y, 1.10 en Z y un roll de 0.09: el
         objeto se echaba encima de la camara y se ladeaba, que es exactamente
         lo que hace que un movimiento se lea como dibujo animado. Un zoom
         grande mas rotacion es lenguaje de cartoon, no de camara real.

         Ahora la pieza NO viaja: aparece. El unico movimiento es un retroceso
         minimo en Z (0.22, una quinta parte del anterior) que da sensacion de
         profundidad sin que nada se abalance; cero desplazamiento vertical y
         cero giro. El peso de la entrada lo lleva la luz — `llegada` —, no la
         geometria, y por eso se lee como algo que se enciende en la oscuridad
         en vez de algo que entra volando.

         La ventana se alarga (0.42→0.92 en vez de 0.50→0.85) y la curva pasa
         de easeInOutExpo a power3: expo arranca casi parado y luego dispara,
         que es el otro ingrediente del efecto rebote. power3 sale rapido y
         frena largo, que es como se comporta una camara de verdad. */
      const eLleg = easeOutPower3(tramo(p, 0.46, 1.0));
      dollyY = 0;
      dollyZ = 0.22 * (1 - eLleg);
      giro   = 0;
      llegada = eLleg;                    // 0 = matraz aun en la oscuridad

      /* El copy entra DESPUES de que el matraz empiece a asomar (0.50), no a
         la vez: primero se reconoce el objeto, luego se lee. Ventana larga
         (0.58 -> 0.98) para que sea una aparicion lenta y no un parpadeo. */
      entradaTexto = easeOutPower3(tramo(p, 0.64, 1.0));

      /* Chispas: ventana 0.20 -> 0.62, o sea que empiezan bastante antes de
         que el matraz asome (0.42) y se apagan mientras este se enciende.
         Anuncian la aparicion en vez de acompanarla. */
      if (chispas) {
        chispas.material.uniforms.uProgress.value = tramo(p, 0.20, 0.62);
        chispas.material.uniforms.uOpacity.value  = 1 - smoothstep(p, 0.58, 0.72);
      }

      /* Se avisa a la pagina solo cuando el valor cambia de verdad: asi la
         capa de UI no reescribe estilos identicos 60 veces por segundo, que es
         la leccion que ya aplicamos en v5. */
      if (cfg.transicion.onProgreso && Math.abs(p - ultProgresoAvisado) > 0.0015) {
        ultProgresoAvisado = p;
        cfg.transicion.onProgreso(p);
      }

    }

    const cam = isMobile ? cfg.movil.camara : null;
    const zCerca = cam ? cam.cerca : cfg.layout.camaraCerca;
    const zLejos = cam ? cam.lejos : cfg.layout.camaraLejos;
    /* La camara baja y mira horizontal (mismo y en posicion y objetivo), asi
       el objeto sube en el cuadro sin deformarse por perspectiva. Inclinar la
       mirada en vez de trasladar daria un escorzo raro en el vidrio. */
    const dy = cam ? cam.desplazamientoY : 0;

    camera.position.set(0, 0.06 + dollyY - dy, lerp(zLejos, zCerca, focus) + dollyZ);
    camera.lookAt(0, -dy, 0);
    camera.rotateZ(giro);   // el roll va DESPUES: lookAt reescribe la rotacion
    scene.fog.near = camera.position.z + 0.55;
    scene.fog.far  = camera.position.z + 5.4;

    // Cuando focus=1 (una cápsula centrada), las demás se separan lateralmente
    // multiplicando su desplazamiento — salen del cuadro para que el texto y
    // la cápsula focal tengan espacio solos. Al desplazarse entre módulos
    // (focus→0), vuelven a la separación normal.
    const spread = 1 + focus * cfg.layout.dispersionFoco;

    capsules.forEach((c, j) => {
      const off = j - idx, ao = Math.abs(off);
      c.group.position.x = off * cfg.layout.separacion * spread;
      c.group.position.z = -ao * cfg.layout.profundidad;
      c.group.rotation.z = off * cfg.layout.inclinacion;
      c.group.scale.setScalar(1 - Math.min(ao, 2.6) * cfg.layout.escalaLateral);
      c.active = ao < 1.5;

      // Fade extra de laterales cuando estamos enfocados en una cápsula.
      // Rampas largas (0.18→1.05 y 0.30→2.15): el vecino se difumina
      // durante todo su recorrido lateral en vez de cortarse en seco.
      const focusHide = smoothstep(ao, 0.18, 1.05) * focus;
      /* `llegada` vale 1 fuera de la transicion, asi que en v4/v5 esto es
         exactamente la misma expresion de antes. Durante la transicion hace
         que el matraz emerja de la oscuridad: al multiplicar vis, la atenuacion
         cae en cascada sobre vidrio, metal, anillo, boca, glow y reaccion. */
      const vis = (1 - smoothstep(ao, 0.30, 2.15)) * (1 - focusHide) * llegada;
      c.group.visible = vis > 0.002;

      const dissolve = focus * (1 - smoothstep(ao, 0, 0.5)) * cfg.layout.disolucionVidrio;

      /* Todo lo opaco de la cápsula se multiplica por vis. Antes el vidrio
         y el metal iban a opacidad plena y desaparecían de golpe cuando el
         grupo se apagaba — de ahí el corte en seco al deslizar. */
      c.glassMat.opacity = (c.noTrans ? cfg.movil.opacidadVidrio : 1) * (1 - dissolve) * vis;
      /* Cada objeto con transmision obliga a three a renderizar la escena otra
         vez. Durante la transicion solo se deja activo el de la capsula
         enfocada: las demas estan fuera de cuadro en ese momento, asi que no
         se nota, y el ahorro es un render completo por vecina. Fuera de la
         transicion, `soloUna` es false y el comportamiento es el de v5. */
      const soloUna = cfg.transicion.activa && pTrans > 0.001 && pTrans < 0.999;
      const permite = !soloUna || j === near;
      if (!c.noTrans && cfg.render.transmision) {
        c.glassMat.transmission = permite ? (1 - dissolve * 0.67) * vis : 0;
      }
      if (c.wrapMat) c.wrapMat.opacity = cfg.render.grabadoOpacidad * (1 - dissolve * 1.1) * vis;
      c.metalMat.opacity = (1 - dissolve * 0.43) * vis;
      c.ringMat.opacity  = vis;
      c.mouthMat.opacity = vis * (1 - dissolve);
      c.glowMat.uniforms.uI.value = c.baseGlow * (vis * 0.5 + dissolve * 1.1);

      const o = vis * (0.55 + dissolve * 0.9);
      c.reaction.mats.forEach(m => m.uniforms.uOpacity.value = o);
      if (c.reaction.extraFade) c.reaction.extraFade.forEach(m => m.opacity = Math.min(m.opacity, o));
    });

    /* Salida de la seccion. El canvas es fixed a pantalla completa, asi que
       al terminar el riel de modulos seguiria pintando por detras de las
       secciones de contenido y compitiendo con su texto. Se desvanece a
       medida que el borde inferior del riel cruza la parte alta de la
       pantalla: cuando bottomRel llega a 0 la seccion ya salio del todo.
       Un fade y no un corte, por lo mismo de siempre — nada recto. */
    let salidaCanvas = 1;
    if (cfg.transicion.activa) {
      const bottomRel = (rielTop + rielAlto - scrollY) / vpAlto;
      /* Ventana larga y adelantada (1.9 -> 0.75 viewports). Antes era
         0.15->1.0: la escena seguia a plena intensidad cuando la seccion
         siguiente ya estaba en pantalla, y el ultimo cilindro se veia por
         detras de su texto. Ahora termina de apagarse tres cuartos de pantalla
         ANTES del limite, asi que el corte entre secciones queda marcado. */
      salidaCanvas = smoothstep(bottomRel, 0.75, 1.9);
      canvas.style.opacity = salidaCanvas.toFixed(3);

      /* El copy y el riel viven dentro del stage, que al dejar de estar pegado
         se va hacia arriba con la pagina: por eso el texto del ultimo modulo
         se DESPLAZABA en vez de desvanecerse como los otros tres. Atandolos a
         la misma salida, se apagan en el sitio. */
      copyEl.style.opacity = salidaCanvas.toFixed(3);
      if (pieEl) pieEl.style.opacity = salidaCanvas.toFixed(3);
    }

    /* Velo: entra en `velo.base` y sube a `velo.techo` durante el primer
       modulo. Al principio el fondo de la pagina (en v4, el rostro del hero)
       se sigue viendo; despues se apaga para que el contraste de textos y
       capsulas no dependa de lo que haya detras. */
    /* `entradaVelo` es la correccion de un fallo real: al pasar el velo a
       position:fixed cubre el viewport ENTERO desde el primer scroll, y con
       `base` en 0.45 estaba echando un 45% de negro sobre el hero antes de que
       la transicion empezara siquiera. Por eso el rostro se veia apagado.
       Ahora entra con el progreso de la transicion: en el hero vale 0. */
    const entradaVelo = cfg.transicion.activa
      ? smoothstep(pTrans, 0.05, 0.55)
      : 1;

    washEl.style.opacity = (cfg.velo.base +
      (cfg.velo.techo - cfg.velo.base) * smoothstep(idx, 0, cfg.velo.recorrido))
      * salidaCanvas * entradaVelo;

    slots.forEach((el, j) => {
      const d = Math.abs(idx - j);
      /* Rampa corta (0→0.20): el texto se apaga en cuanto el scroll sale del
         modulo, en vez de arrastrarse casi media transicion. */
      const a = (1 - smoothstep(d, 0, 0.20)) * focus;
      if (cfg.transicion.activa) {
        /* Fade limpio, sin desplazamiento: el texto no sube desde abajo, se
           revela donde ya esta. El translateY se queda para v4/v5, que no
           tienen transicion y ahi si aporta. */
        el.style.opacity = a * entradaTexto;
        el.style.transform = '';
      } else {
        el.style.opacity = a;
        el.style.transform = `translateY(${(1 - a) * 16}px)`;
      }
      el.style.pointerEvents = a > 0.6 ? 'auto' : 'none';
      el.setAttribute('aria-hidden', a > 0.6 ? 'false' : 'true');
      bars[j].style.transform = `scaleX(${clamp(1 - d, 0, 1)})`;
    });
  }

  /* ---- bucle ---------------------------------------------------------- */
  function resize() {
    /* Con el canvas fijo, el tamano de referencia es el viewport. Si siguiera
       midiendo el stage, el canvas y el buffer se desalinearian. */
    const w = cfg.transicion.activa ? innerWidth  : stage.clientWidth;
    const h = cfg.transicion.activa ? innerHeight : stage.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    if (bloom) bloom.resolution.set(w * escalaBloomRef, h * escalaBloomRef);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => { resize(); medirRiel(); });
  ro.observe(stage);
  ro.observe(root);   // el alto del riel es 620vh: cambia con el viewport
  resize(); medirRiel(); readScroll(); idx = rawIdx;

  const clock = new THREE.Clock();
  let frame = 0, raf = 0, visible = true;

  /* Al reentrar en vista, rawIdx quedo congelado en el ultimo frame visible.
     Se releen ambos para que el riel no arranque amortiguando desde un valor
     viejo. */
  /* rootMargin generoso en modo transicion: la escena tiene que estar
     renderizando ya cuando las particulas empiezan a volar sobre el hero,
     un viewport y medio antes de que la seccion entre por si misma. */
  const io = new IntersectionObserver(e => {
    visible = e[0].isIntersecting;
    if (visible) { readScroll(); idx = rawIdx; }
  }, { threshold: 0, rootMargin: cfg.transicion.activa ? '200% 0px 0px 0px' : '0px' });
  io.observe(root);

  /* Con la pestana oculta el rAF ya viene estrangulado, pero el navegador aun
     puede concedernos frames sueltos. Cortar por bandera evita renderizar y
     recomponer una escena que nadie esta viendo. */
  let pestanaVisible = !document.hidden;
  const onVis = () => {
    pestanaVisible = !document.hidden;
    if (pestanaVisible) { medirRiel(); readScroll(); idx = rawIdx; }
  };
  document.addEventListener('visibilitychange', onVis);

  /* Precompilar los shaders antes del primer frame. compile() recorre con
     traverseVisible, y en este punto ningun layout() ha corrido todavia, asi
     que las cuatro capsulas siguen visibles y entran las cuatro. Si se llamara
     despues, las que estan fuera de cuadro se saltarian y su tiron de
     compilacion aparecería al entrar en pantalla. Fire-and-forget: no bloquea
     el arranque del bucle. */
  if (typeof renderer.compileAsync === 'function') {
    renderer.compileAsync(scene, camera).catch(() => {});
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    if (!pestanaVisible) return;
    /* readScroll va ANTES del guard de visibilidad: en modo transicion la
       coreografia arranca mientras el hero aun llena la pantalla y la seccion
       todavia no intersecta. Si se leyera despues, la transicion no empezaria
       hasta que ya fuese tarde. Es una lectura de dos restas, sin layout. */
    readScroll();
    if (!visible) return;
    frame++;

    idx += (rawIdx - idx) * (reduced ? 1 : cfg.movimiento.amortiguacion);
    if (chispas) chispas.material.uniforms.uTime.value = t;
    layout();

    capsules.forEach(c => {
      if (c.active || frame % 4 === 0) c.reaction.update(t, dt);
      if (!reduced) {
        c.group.rotation.y = t * cfg.movimiento.giroCapsula + c.index * 0.7;
        c.group.position.y = Math.sin(t * 0.62 + c.index) * cfg.movimiento.flotacion;
        /* La cápsula sigue girando igual que las otras tres — el principio
           de "módulos idénticos" no se toca. Lo que se contrarresta es la
           reacción: la sustancia queda suspendida, sin eje propio. */
        if (c.reaction.noSpin) c.reaction.group.rotation.y = -c.group.rotation.y;
      }
    });

    if (film) film.uniforms.uTime.value = t;
    composer.render();
  }
  loop();

  /* ---- panel de diagnostico (?debug) ---------------------------------- */
  /* Solo con ?debug en la URL: expone la app y engancha stats-gl. Nada de esto
     se descarga ni se ejecuta para un visitante normal. */
  if (typeof location !== 'undefined' && /(?:^|[?&])debug(?:$|[&=])/.test(location.search)) {
    window.rugServicios = { scene, camera, renderer, composer, capsules, config: cfg };
    import('https://cdn.jsdelivr.net/npm/stats-gl@3.6.0/dist/main.js')
      .then(({ default: Stats }) => {
        const stats = new Stats({ trackGPU: true });
        stats.init(renderer);
        stats.dom.style.cssText += ';position:fixed;top:8px;left:8px;z-index:9999';
        document.body.appendChild(stats.dom);
        const orig = composer.render.bind(composer);
        composer.render = (...a) => { stats.begin(); orig(...a); stats.end(); stats.update(); };
      })
      .catch(err => console.warn('[RUG] stats-gl no disponible:', err));
  }

  /* ---- API ------------------------------------------------------------ */
  return {
    scene, camera, renderer, capsules, config: cfg, nivel,
    get progresoTransicion() { return pTrans; },
    goTo(i) { const r = root.getBoundingClientRect();
      const total = r.height - innerHeight, m = cfg.movimiento.margenScroll;
      const p = m + (i / (MODULES.length - 1)) * (1 - m * 2);
      scrollTo({ top: scrollY + r.top + p * total, behavior: 'smooth' }); },
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
        scene.traverse(o => { o.geometry?.dispose?.();
        [].concat(o.material || []).forEach(m => m?.dispose?.()); });
      chispas?.dispose();
      etch?.dispose(); envMap?.dispose();
      composer.dispose?.(); renderer.dispose();
      root.innerHTML = '';
    }
  };

  function markup() {
    /* En modo transicion el velo y el canvas salen del stage y pasan a ser
       hermanos suyos, fijos al viewport. Tienen que estar FUERA porque
       .rug-sv__stage lleva overflow:hidden y eso recorta a un descendiente
       fixed — el mismo tropiezo que ya tuvimos con el velo.
       Que cubran siempre la pantalla entera es justo lo que elimina la linea:
       ningun borde suyo coincide ya con el limite de una seccion. */
    const trans = cfg.transicion.activa;
    const capas = `
        <div class="rug-sv__wash"></div>
        <canvas class="rug-sv__canvas"></canvas>`;
    return `
      ${trans ? capas : ''}
      <div class="rug-sv__stage">
        ${trans ? '' : capas}
        <div class="rug-sv__copy"></div>
        <footer class="rug-sv__foot">
          <div class="rug-sv__rail"></div>
        </footer>
      </div>`;
  }
}


/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║  4 · LAS CUATRO REACCIONES                                              ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */

const NOISE = `
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}`;

/* ===========================================================================
   CHISPAS DE ENTRADA
   ---------------------------------------------------------------------------
   Un puñado de destellos que saltan justo ANTES de que el matraz se encienda:
   anuncian que algo va a materializarse ahi. No es la nube de particulas que
   quitamos — son pocas, breves y concentradas alrededor del punto donde va a
   aparecer la pieza.

   Como todo lo demas, la posicion es funcion pura de (aSeed, uProgress): sin
   updates de buffer por frame y reversible al hacer scroll hacia arriba.     */
function chispasEntrada(cfg, nivel, H, ACCENT, renderer) {
  const N = cfg.transicion.chispas[nivel] ?? cfg.transicion.chispas.medio;
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3), rnd = new Float32Array(N), sd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    /* Distribucion en disco alrededor del eje del matraz: mas densa cerca del
       centro, para que el destello se lea como un foco y no como lluvia. */
    const a = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 0.6) * 2.6;
    pos[i * 3]     = Math.cos(a) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
    pos[i * 3 + 2] = Math.sin(a) * r * 0.7;
    rnd[i] = Math.random();
    sd[i]  = Math.random();
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aRandom',  new THREE.BufferAttribute(rnd, 1));
  g.setAttribute('aSeed',    new THREE.BufferAttribute(sd, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: {
      uProgress: { value: 0 }, uTime: { value: 0 }, uOpacity: { value: 1 },
      uColor: { value: ACCENT.clone() },
      uScale: { value: 150 * renderer.getPixelRatio() }
    },
    vertexShader: `
    attribute float aRandom, aSeed;
    uniform float uProgress, uTime, uScale;
    varying float vA;
    void main(){
      /* Cada chispa vive un instante corto dentro de la ventana global, con
         su propio arranque: el conjunto chisporrotea en vez de encenderse y
         apagarse a la vez. */
      float ini = aRandom * 0.62;
      float t = clamp((uProgress - ini) / 0.30, 0.0, 1.0);

      /* Deriva hacia el centro: al final convergen donde nace el matraz. */
      vec3 p = mix(position, position * 0.34, t * t);
      p.y += sin(uTime * 1.6 + aSeed * 30.0) * 0.06 * (1.0 - t);

      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position  = projectionMatrix * mv;
      gl_PointSize = (0.30 + aSeed * 0.55) * uScale / max(-mv.z, 0.001);

      /* Destello: sube rapido y cae largo. El parpadeo lo da un seno de
         frecuencia propia por chispa. */
      float vida = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.35, 1.0, t));
      float parpadeo = 0.55 + 0.45 * sin(uTime * (7.0 + aSeed * 9.0) + aRandom * 20.0);
      vA = vida * parpadeo;
    }`,
    fragmentShader: `
    uniform vec3 uColor; uniform float uOpacity; varying float vA;
    void main(){
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      float m = smoothstep(0.45, 0.05, d), core = smoothstep(0.18, 0.0, d);
      vec3 col = mix(uColor, vec3(1.0), core * 0.7);
      float a = (m * 0.30 + core * 0.80) * vA * uOpacity;
      gl_FragColor = vec4(col * a, a);
    }`
  });

  const puntos = new THREE.Points(g, mat);
  puntos.renderOrder = 6;
  puntos.frustumCulled = false;
  return { objeto: puntos, material: mat,
           dispose() { g.dispose(); mat.dispose(); } };
}


/* DOT_FRAG — punto compacto. Halo angosto + núcleo pequeño para que bajo
   el bloom original las partículas se lean como puntos distinguibles y
   no como una masa continua sobreexpuesta. */
const DOT_FRAG = `uniform vec3 uColor;uniform float uOpacity;varying float vA;
void main(){vec2 c=gl_PointCoord-.5;float d=length(c);
 float m=smoothstep(.42,.08,d),core=smoothstep(.16,0.,d);
 gl_FragColor=vec4(uColor*(m*.55+core*0.85),(m*.65+core*0.85)*vA*uOpacity);}`;

/* TRAFICO_FRAG — variante más tenue del DOT_FRAG. El módulo 01 tenía
   demasiada luz (racimo saturado); esto baja intensidad de color y alpha
   ~40% para que se distinga cada partícula individual sin lavar la escena. */
const TRAFICO_FRAG = `uniform vec3 uColor;uniform float uOpacity;varying float vA;
void main(){vec2 c=gl_PointCoord-.5;float d=length(c);
 float m=smoothstep(.40,.08,d),core=smoothstep(.14,0.,d);
 gl_FragColor=vec4(uColor*(m*.19+core*0.34),(m*.27+core*0.37)*vA*uOpacity);}`;


/* 01 · TRÁFICO PAGO — flujo entrando desde afuera al matraz.
   El tramo interior lee su radio de matrazR(), el mismo perfil con el que se
   tornea el vidrio: el embudo de particulas y el recipiente son la misma
   curva, no dos aproximaciones que hay que ir cuadrando a ojo.
   Las partículas salen de un anillo amplio sobre la boca,
   convergen al eje pasando por la boca, se abren dentro del cuerpo
   ocupando el volumen interno, y terminan en el charco de la base.
   El "acelerando" (pow(t, 2.3)) se conserva.                            */
function reactionTrafico(cfg, isMobile, R, H, ACCENT, renderer) {
  const N = isMobile ? cfg.movil.particulasTrafico : cfg.escritorio.particulasTrafico;
  const g = new THREE.BufferGeometry();
  const ph = new Float32Array(N), sd = new Float32Array(N), ln = new Float32Array(N);
  for (let i = 0; i < N; i++) { ph[i] = Math.random(); sd[i] = Math.random(); ln[i] = Math.floor(Math.random() * 6); }
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
  g.setAttribute('aSeed',  new THREE.BufferAttribute(sd, 1));
  g.setAttribute('aLane',  new THREE.BufferAttribute(ln, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: {
      uTime:   { value: 0 },
      uColor:  { value: ACCENT.clone() },
      uOpacity:{ value: 1 },
      uScale:  { value: (isMobile ? 170 : 300) * renderer.getPixelRatio() },
      uR:      { value: R },
      uH:      { value: H }
    },
    vertexShader: `
    attribute float aPhase, aSeed, aLane;
    uniform float uTime, uScale, uR, uH;
    varying float vA;
    ${MATRAZ_GLSL}

    void main(){
      float t = fract(aPhase + uTime * .17 * (.72 + aSeed * .55));
      /* Exponente bajo = menos acumulacion en el tramo de entrada.
         Con 2.3 las particulas se amontonaban arriba del embudo. */
      float e = pow(t, 1.55);

      float yBoca = uH * 0.5;
      float yLabio = yBoca + uH * 0.17;        // labio de la corola, al aire
      float yFondo = -uH * 0.5 + 0.035;
      float rBoca = matrazR(yBoca);

      /* Dos tramos. [0, eIn): corola sobre la boca, convergiendo al cuello.
         [eIn, 1]: dentro del matraz — aqui el radio NO se interpola a mano,
         se lee del perfil del vidrio, asi que el flujo se abre exactamente
         donde se abre el cono y se estrecha donde esta el cuello. */
      float eIn = 0.26;

      float u1 = clamp(e / eIn, 0.0, 1.0);
      float y1 = mix(yLabio, yBoca, u1);
      float r1 = mix(rBoca * 2.60, rBoca * 0.55, pow(u1, 0.62));

      float u2 = clamp((e - eIn) / (1.0 - eIn), 0.0, 1.0);
      float y2 = mix(yBoca, yFondo, pow(u2, 0.70));

      /* Cuanto del ancho disponible ocupa el flujo: ajustado mientras baja
         por el cuello, suelto una vez entra al cono. El factor por particula
         llena el volumen — sin el, todas caerian sobre una misma cascara. */
      float lleno = mix(0.42, 0.92, smoothstep(0.14, 0.62, u2)) * (0.55 + 0.45 * aSeed);
      float r2 = matrazR(y2) * lleno * (1.0 - smoothstep(0.88, 1.0, u2) * 0.94);

      float dentro = step(eIn, e);
      float y   = mix(y1, y2, dentro);
      float rad = mix(r1, r2, dentro);

      // Angulo con carril + torsion residual que se atenua al descender
      float ang = aSeed * 6.28318 + aLane * 1.0472 + (1.0 - e) * 0.9;

      vec4 mv = modelViewMatrix * vec4(cos(ang) * rad, y, sin(ang) * rad * 0.9, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (0.75 + e * 2.2) * uScale / max(-mv.z, .001);
      vA = 0.38 * smoothstep(0.0, 0.07, t) * (1.0 - smoothstep(0.90, 1.0, t));
    }`,
    fragmentShader: TRAFICO_FRAG
  });

  const poolMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { uTime: { value: 0 }, uColor: { value: ACCENT.clone() }, uOpacity: { value: 1 } },
    vertexShader: `varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uColor;uniform float uTime,uOpacity;varying vec2 v;
    void main(){float d=length(v-.5)*2.,p=.82+.18*sin(uTime*2.1);
      float core=pow(max(1.-d*1.75,0.),2.)*0.50,halo=pow(max(1.-d,0.),3.)*.28;
      float a=(core+halo)*p*uOpacity;gl_FragColor=vec4(mix(uColor,vec3(1.),core*.40)*a,a);}`
  });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(R * 2.1, R * 2.1), poolMat);
  pool.rotation.x = -Math.PI / 2; pool.position.y = -H / 2 + 0.03;

  const group = new THREE.Group();
  group.add(new THREE.Points(g, mat), pool);
  group.renderOrder = 4;
  const mats = [mat, poolMat];
  return { group, mats, update(t) { mats.forEach(m => m.uniforms.uTime.value = t); } };
}


/* 02 · CREATIVIDAD ESTRATÉGICA — orgánico, sin loop, 6 sustancias en suspensión.
   Seis tintas en pares cromáticos opuestos (magenta/lima, cian/naranja,
   violeta/ámbar) derivan por el recipiente sin orbitar: cada centro se mueve
   con tres senos de frecuencias inconmensurables por eje, así que no hay
   giro ni ciclo perceptible. Los bordes se deforman con FBM para que se
   mezclen como pigmento suspendido en líquido, y al solaparse generan
   híbridos — refuerza el mensaje "creatividad".                          */
function reactionCreatividad(R, H, ACCENT, MAGENTA) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uTime:    { value: 0 },
      uOpacity: { value: 1 },
      /* 6 sustancias en pares cromaticos opuestos:
         magenta/lima, cian/naranja, violeta/ambar. Los pares complementarios
         son lo que hace que al solaparse aparezcan hibridos y no un barro. */
      uC1: { value: new THREE.Color('#E85D9B') },   // magenta (acento excepcion)
      uC2: { value: new THREE.Color('#C9F24D') },   // lima  -> opuesto de magenta
      uC3: { value: new THREE.Color('#2FE3F2') },   // cian electrico
      uC4: { value: new THREE.Color('#FF7A2F') },   // naranja -> opuesto de cian
      uC5: { value: new THREE.Color('#7B5CFF') },   // violeta
      uC6: { value: new THREE.Color('#FFD53D') }    // ambar -> opuesto de violeta
    },
    vertexShader: `varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uTime, uOpacity;
    uniform vec3 uC1, uC2, uC3, uC4, uC5, uC6;
    varying vec2 v;
    ${NOISE}

    /* Deriva libre: tres senos de frecuencias inconmensurables por eje.
       No hay termino angular, asi que la sustancia no orbita ni gira
       sobre un eje: vaga por el recipiente y nunca repite trayectoria. */
    vec2 drift(float s, float sx, float sy){
      float t = uTime;
      float x = sin(t * 0.0231 + s * 6.1) * 0.46
              + sin(t * 0.0157 + s * 2.7) * 0.28
              + sin(t * 0.0094 + s * 9.4) * 0.17;
      float y = cos(t * 0.0189 + s * 4.3) * 0.44
              + cos(t * 0.0133 + s * 8.1) * 0.26
              + cos(t * 0.0071 + s * 1.9) * 0.19;
      return vec2(x * sx, y * sy);
    }

    void main(){
      vec2 p = v * 2.0 - 1.0;

      /* Deformacion de coordenadas: los bordes se enredan como pigmento
         suspendido. Lenta a proposito — es difusion, no turbulencia. */
      vec2 warp = vec2(
        fbm(vec3(p * 2.1 + vec2(1.7,  0.3), uTime * 0.028)),
        fbm(vec3(p * 2.1 + vec2(5.2, 11.0), uTime * 0.024 + 3.0))
      ) * 0.46 - 0.23;
      vec2 pw = p + warp;

      /* Centros: deriva aleatoria lenta. sy < sx porque el recipiente
         es mas alto que ancho en UV y conviene que no toquen las tapas. */
      vec2 c1 = drift(0.13, 0.52, 0.62);
      vec2 c2 = drift(1.77, 0.58, 0.55);
      vec2 c3 = drift(3.41, 0.49, 0.66);
      vec2 c4 = drift(5.09, 0.61, 0.51);
      vec2 c5 = drift(6.83, 0.44, 0.60);
      vec2 c6 = drift(8.27, 0.55, 0.58);

      /* Radio de cada mancha, respirando en su propia frecuencia. */
      float r1 = 0.50 + 0.10 * sin(uTime * 0.041 + 1.0);
      float r2 = 0.46 + 0.11 * sin(uTime * 0.035 + 2.0);
      float r3 = 0.53 + 0.09 * sin(uTime * 0.029 + 3.0);
      float r4 = 0.44 + 0.12 * sin(uTime * 0.025 + 4.0);
      float r5 = 0.48 + 0.10 * sin(uTime * 0.021 + 5.0);
      float r6 = 0.42 + 0.11 * sin(uTime * 0.017 + 6.0);

      float f1 = smoothstep(r1, 0.05, length(pw - c1));
      float f2 = smoothstep(r2, 0.05, length(pw - c2));
      float f3 = smoothstep(r3, 0.05, length(pw - c3));
      float f4 = smoothstep(r4, 0.05, length(pw - c4));
      float f5 = smoothstep(r5, 0.05, length(pw - c5));
      float f6 = smoothstep(r6, 0.05, length(pw - c6));

      vec3 col = uC1 * f1 * 0.92
               + uC2 * f2 * 0.80
               + uC3 * f3 * 0.88
               + uC4 * f4 * 0.86
               + uC5 * f5 * 0.84
               + uC6 * f6 * 0.78;

      float a = (f1 + f2 + f3 + f4 + f5 + f6) * 0.40 * uOpacity;

      /* Filamento blanco vertical que ondula — chispazo puntual. */
      float fx  = 0.13 * sin(p.y * 3.1 + uTime * 0.21)
                + 0.07 * sin(p.y * 7.3 - uTime * 0.13);
      float fil = smoothstep(0.014, 0.0, abs(p.x - fx)) * 0.35;
      col += vec3(1.0) * fil;
      a   += fil * uOpacity;

      /* Mascara rectangular suave: contiene la mezcla dentro del cilindro. */
      float mask = (1.0 - smoothstep(0.70, 1.0, abs(p.x)))
                 * (1.0 - smoothstep(0.84, 1.0, abs(p.y)));
      gl_FragColor = vec4(col * mask, a * mask);
    }`
  });
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.PlaneGeometry(R * 2.02, H * 0.97), mat));
  group.renderOrder = 4;
  /* noSpin: el loop principal no aplica rotacion.y a esta capsula, para que
     la mezcla se lea como suspension y no como algo que gira en su eje. */
  return { group, mats: [mat], noSpin: true, update(t) { mat.uniforms.uTime.value = t; } };
}


/* 03 · CONVERSIÓN DIGITAL — flujo orgánico entrando y saliendo.
   Sin forma geométrica (no hay grid): cada partícula oscila verticalmente
   entre encima de la boca y la mitad baja del cuerpo. Cuando está encima
   de la boca su radio → 0 (sale por el orificio); cuando está dentro se
   ensancha ocupando el volumen. El resultado es un flujo continuo que
   entra-sale-entra a medida que recorre arriba/abajo, sin patrón.      */
function reactionConversion(cfg, isMobile, R, H, ACCENT, renderer) {
  const N = isMobile ? cfg.movil.particulasConversion : cfg.escritorio.particulasConversion;
  const g = new THREE.BufferGeometry();
  const seed = new Float32Array(N), phase = new Float32Array(N);
  for (let i = 0; i < N; i++) { seed[i] = Math.random(); phase[i] = Math.random(); }
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  g.setAttribute('aSeed',  new THREE.BufferAttribute(seed, 1));
  g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: {
      uTime:   { value: 0 },
      uColor:  { value: ACCENT.clone() },
      uOpacity:{ value: 1 },
      uScale:  { value: (isMobile ? 145 : 240) * renderer.getPixelRatio() },
      uR:      { value: R },
      uH:      { value: H }
    },
    vertexShader: `
    attribute float aSeed, aPhase;
    uniform float uTime, uScale, uR, uH;
    varying float vA;

    void main(){
      /* Ciclo vertical por partícula: velocidad + fase individuales, sin
         sincronización. sin() por dos frecuencias no-múltiplos produce
         que la Y de cada partícula sea "casi periódica" pero no repetible
         a simple vista. */
      float speed = 0.15 + aSeed * 0.22;
      float ph    = uTime * speed + aPhase * 6.28318;

      float y1 = sin(ph);
      float y2 = sin(ph * 1.37 + aSeed * 3.14) * 0.35;
      float yNorm = clamp((y1 + y2) * 0.5 + 0.5, 0.0, 1.0);
      float y = mix(-uH * 0.40, uH * 0.62, yNorm);

      /* Radio: se estrecha al eje cuando Y sube por encima del orificio
         (la partícula "sale"); se ensancha cuando está dentro del cuerpo.
         mouthT = 1 cuando la partícula está sobre/por encima de la boca. */
      float mouthT = smoothstep(uH * 0.36, uH * 0.55, y);
      float rBase  = mix(uR * 0.72, uR * 0.04, mouthT);

      /* Modulación radial orgánica: la partícula no traza un cilindro
         constante, oscila su distancia al eje con otro sinusoide. */
      float rMod = 0.55 + 0.45 * sin(ph * 1.73 + aSeed * 9.1);
      float r    = rBase * rMod;

      /* Ángulo con giro continuo + offset por semilla. */
      float ang = ph * 0.62 + aSeed * 6.28318;
      vec3 pos = vec3(cos(ang) * r, y, sin(ang) * r * 0.72);

      /* Jitter orgánico (mismas frecuencias que la reacción original). */
      pos += vec3(
        sin(uTime * 0.50 + aSeed * 9.) * 0.024,
        cos(uTime * 0.37 + aSeed * 6.) * 0.028,
        sin(uTime * 0.43 + aSeed * 4.) * 0.024
      );

      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = 1.35 * uScale / max(-mv.z, .001);
      /* Alpha: se atenúa cuando la partícula está afuera (sobre la boca)
         para que la lectura sea "sale por arriba" en vez de "aparece
         flotando sobre el vidrio". */
      vA = 0.72 - 0.38 * mouthT;
    }`,
    fragmentShader: DOT_FRAG
  });

  const group = new THREE.Group();
  group.add(new THREE.Points(g, mat));
  group.renderOrder = 4;
  return {
    group, mats: [mat],
    update(t) { mat.uniforms.uTime.value = t; }
  };
}


/* 04 · AUTOMATIZACIÓN & SISTEMAS — loop perpetuo, TODO el circuito visible.
   Base "rail" del squircle siempre encendida (fría, azul-gris), sobre la
   que corre un pulso lima brillante. Al parpadear el rail garantiza que
   TODO el recorrido se vea siempre — sin él, sólo se veía la cabeza.
   Encima, chispas cortas saltan del rail y se encienden al paso del pulso.  */
function reactionAuto(cfg, isMobile, R, ACCENT, COLD, renderer) {
  const pts = [];
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), e = 0.62;
    pts.push(new THREE.Vector3(
      0.20 * Math.sign(c) * Math.pow(Math.abs(c), e),
      0.46 * Math.sign(s) * Math.pow(Math.abs(s), e) - 0.04, 0));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);

  /* Rail base — el CIRCUITO siempre visible. Line + LineBasicMaterial (no
     bloomea, no se lava). Es lo que dibuja la geometría del recorrido. */
  const railPts = [];
  const seg = 220;
  for (let i = 0; i <= seg; i++) railPts.push(curve.getPointAt(i / seg));
  const railMat = new THREE.LineBasicMaterial({
    color: COLD, transparent: true, opacity: 0.68, toneMapped: false
  });
  const rail = new THREE.Line(new THREE.BufferGeometry().setFromPoints(railPts), railMat);

  /* Traza lima suave — un "wash" tenue del acento sobre el mismo recorrido,
     para que se lea como un circuito lima incluso cuando la cabeza no está
     encima. */
  const washMat = new THREE.LineBasicMaterial({
    color: ACCENT, transparent: true, opacity: 0.22, toneMapped: false
  });
  const wash = new THREE.Line(new THREE.BufferGeometry().setFromPoints(railPts), washMat);

  /* Pulso corriendo — head + tail brillante que ilumina el segmento por
     donde va pasando. Tubo con shader sobre la misma curva. */
  const pulseMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { uTime: { value: 0 }, uColor: { value: ACCENT.clone() }, uOpacity: { value: 1 } },
    vertexShader: `varying float vU;void main(){vU=uv.x;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uColor;uniform float uTime,uOpacity;varying float vU;
    void main(){
      float ph   = fract(vU - uTime * 0.155);
      float head = pow(1.0 - ph, 30.0);
      float tail = pow(1.0 - ph, 6.0) * 0.28;
      float a    = (head * 1.15 + tail) * uOpacity;
      vec3  col  = uColor * (head * 2.6 + tail);
      gl_FragColor = vec4(col * a * 1.4, a);
    }`
  });
  const pulse = new THREE.Mesh(new THREE.TubeGeometry(curve, 220, 0.0055, 7, true), pulseMat);

  /* Nodos de junction sobre el recorrido — puntos de soldadura fijos. */
  const nodeMat = new THREE.MeshBasicMaterial({ color: ACCENT, toneMapped: false, transparent: true, opacity: 0.85 });
  const nodes = new THREE.Group();
  [0.10, 0.40, 0.72].forEach(u => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 12), nodeMat);
    m.position.copy(curve.getPointAt(u)); nodes.add(m);
  });

  /* Chispas — descargas cortas sobre el recorrido. Cada una nace pegada al
     rail, salta hacia afuera por su normal y se apaga; el ciclo es corto y
     la fase es propia, asi que el conjunto chisporrotea sin cadencia.
     Se encienden mucho mas fuerte cuando el pulso pasa por encima: eso es
     lo que las ata al circuito en vez de leerse como polvo suelto. */
  const NS = isMobile ? 55 : 130;
  const sg = new THREE.BufferGeometry();
  const sPos = new Float32Array(NS * 3), sDir = new Float32Array(NS * 3);
  const sSeed = new Float32Array(NS), sPhase = new Float32Array(NS), sU = new Float32Array(NS);
  for (let i = 0; i < NS; i++) {
    const u = Math.random();
    const p = curve.getPointAt(u), tg = curve.getTangentAt(u);
    sU[i] = u;
    sPos[i * 3] = p.x; sPos[i * 3 + 1] = p.y; sPos[i * 3 + 2] = p.z;
    // Normal en el plano del circuito, con signo al azar + algo de fuga en Z.
    const sgn = Math.random() < 0.5 ? -1 : 1;
    sDir[i * 3]     = -tg.y * sgn;
    sDir[i * 3 + 1] =  tg.x * sgn;
    sDir[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    sSeed[i] = Math.random(); sPhase[i] = Math.random();
  }
  sg.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sg.setAttribute('aDir',   new THREE.BufferAttribute(sDir, 3));
  sg.setAttribute('aSeed',  new THREE.BufferAttribute(sSeed, 1));
  sg.setAttribute('aPhase', new THREE.BufferAttribute(sPhase, 1));
  sg.setAttribute('aU',     new THREE.BufferAttribute(sU, 1));

  const sparkMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: {
      uTime:    { value: 0 },
      uColor:   { value: ACCENT.clone() },
      uOpacity: { value: 1 },
      uScale:   { value: (isMobile ? 120 : 210) * renderer.getPixelRatio() }
    },
    vertexShader: `
    attribute vec3 aDir;
    attribute float aSeed, aPhase, aU;
    uniform float uTime, uScale;
    varying float vA;

    void main(){
      /* Vida corta y desigual: unas duran el triple que otras. */
      float life = fract(aPhase + uTime * (0.55 + aSeed * 1.25));
      float pop  = pow(1.0 - life, 2.6);          // se apaga rapido
      float grow = pow(life, 0.55);               // el salto arranca veloz

      vec3 p = position + aDir * (0.004 + grow * 0.052);
      p.y += (aSeed - 0.5) * grow * 0.022;

      /* Refuerzo cuando la cabeza del pulso pasa por esta posicion del
         recorrido (misma velocidad 0.155 que pulseMat). */
      float d    = abs(fract(aU - uTime * 0.155 + 0.5) - 0.5);
      float near = smoothstep(0.085, 0.0, d);

      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position  = projectionMatrix * mv;
      gl_PointSize = (0.45 + aSeed * 0.95) * (0.45 + pop) * uScale / max(-mv.z, .001);
      vA = pop * (0.22 + near * 1.05);
    }`,
    fragmentShader: DOT_FRAG
  });
  const sparks = new THREE.Points(sg, sparkMat);

  /* Cabeza brillante blanca — el puntero del loop. */
  const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.019, 14, 14), headMat);

  const group = new THREE.Group();
  group.add(rail, wash, pulse, nodes, sparks, head);
  group.renderOrder = 4;

  return {
    group, mats: [pulseMat, sparkMat],
    extraFade: [nodeMat, headMat, railMat, washMat],
    update(t) {
      pulseMat.uniforms.uTime.value = t;
      sparkMat.uniforms.uTime.value = t;
      head.position.copy(curve.getPointAt((t * 0.155) % 1));
    }
  };
}


/* ╔═════════════════════════════════════════════════════════════════════════╗
   ║  5 · TEXTURA DE GRABADO (idéntica al original)                          ║
   ╚═════════════════════════════════════════════════════════════════════════╝ */
function etchTexture(renderer) {
  const W = 2048, H = 1024;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d');

  const g = x.createLinearGradient(0, H * 0.58, 0, H * 0.92);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.35, 'rgba(255,255,255,.085)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, H * 0.58, W, H * 0.34);

  x.strokeStyle = 'rgba(255,255,255,.34)';
  for (let i = 0; i < 128; i++) {
    const px = i / 128 * W, major = i % 8 === 0;
    x.lineWidth = major ? 2.4 : 1.2;
    x.globalAlpha = major ? 0.85 : 0.4;
    x.beginPath(); x.moveTo(px, H * 0.30); x.lineTo(px, H * 0.30 + (major ? 34 : 17)); x.stroke();
  }
  x.globalAlpha = 1;

  x.strokeStyle = 'rgba(255,255,255,.10)'; x.lineWidth = 1;
  for (let i = 0; i < 24; i++) { const px = i / 24 * W + 9; x.beginPath(); x.moveTo(px, 0); x.lineTo(px, H); x.stroke(); }

  for (let i = 0; i < 4; i++) {
    const px = i * (W / 4) + 40;
    x.fillStyle = 'rgba(255,255,255,.62)'; x.font = '500 30px "IBM Plex Mono", monospace';
    x.fillText('RUG · LAB', px, H * 0.235);
    x.fillStyle = 'rgba(255,255,255,.34)'; x.font = '400 22px "IBM Plex Mono", monospace';
    x.fillText('CAP-0' + (i + 1) + ' / SERIE 0xA7F3', px, H * 0.72);
    x.fillText('VOL · 250 ML   ·   CLASE II', px, H * 0.78);
  }

  x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = 2.2;
  x.beginPath(); x.moveTo(0, H * 0.66); x.lineTo(W, H * 0.66); x.stroke();

  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  t.wrapS = THREE.RepeatWrapping;
  return t;
}


/* ── utilidades ───────────────────────────────────────────────────────── */
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const lerp  = (a, b, t) => a + (b - a) * t;
/* Easings de la coreografia. expo y power3 como pide el brief; el scrub en si
   se queda lineal, que es lo que hace que el scroll se sienta directo. */
function easeOutExpo(t)  { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function easeInOutExpo(t){ return t <= 0 ? 0 : t >= 1 ? 1
  : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2; }
function easeOutPower3(t){ return 1 - Math.pow(1 - t, 3); }
/* Ventana normalizada: convierte el progreso global en el 0-1 de un tramo. */
function tramo(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }

function smoothstep(x, e0, e1) { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }
function deepMerge(base, extra) {
  for (const k in extra) {
    if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k])) {
      base[k] = deepMerge(base[k] ?? {}, extra[k]);
    } else base[k] = extra[k];
  }
  return base;
}
