# RUG — Landing Page

Este repositorio contiene la **landing page** de **RUG (Laboratorio Estratégico)**, una agencia que se posiciona como infraestructura comercial — no como consultora ni como marca personal.

El sitio se construye como una experiencia **one-page** con hero 3D interactivo y carrusel de servicios en el mismo canvas WebGL.

---

## Qué es RUG

**Laboratorio Estratégico** que convierte inversión publicitaria y procesos en ventas. La tesis central: *"no vendemos servicios aislados, construimos sistemas"*. Todo el lenguaje visual y verbal debe reforzar esa idea.

Voz: primera persona del plural. Tono: clínico/industrial, no cálido de agencia.

---

## Servicios (los 4 módulos)

Los cuatro servicios se representan como **módulos idénticos con contenidos distintos** — cápsulas/monolitos con la misma geometría, material y luz. Lo único que cambia es lo que vive adentro. Ese principio es innegociable: cambiar de objeto por servicio destruye el concepto.

1. **Tráfico Pago** — Campañas orientadas a ventas vía páginas web.
   Visual: partículas luminosas que convergen hacia un charco de luz.

2. **Creatividad Estratégica** — Piezas con función dentro del sistema de ventas.
   Visual: tinta/pigmento en suspensión, movimiento orgánico. **Único módulo con segundo color saturado (magenta).** Rompe el patrón a propósito.

3. **Conversión Digital** — Preparar la página para que el tráfico convierta.
   Visual: partículas dispersas que colapsan en retícula ordenada. Caos → estructura.

4. **Automatización & Sistemas** — Procesos repetitivos convertidos en sistemas.
   Visual: circuito cerrado de luz en loop perpetuo.

---

## Alcance de la landing

Estructura de página propuesta:

```
01 · HERO          Rostro + red. Un canvas WebGL.
02 · SERVICIOS     Carrusel de cuatro módulos. Mismo canvas.
03 · EL RECORRIDO  Atención → Conversión → Venta → Escala
04 · CASOS         Resultados medibles
05 · EL SISTEMA    Cómo se conectan las cuatro líneas
06 · CONTACTO      Agendar diagnóstico
```

Desde la sección 03 el sitio vuelve a HTML convencional. El 3D ya cumplió su función: capturar y explicar.

---

## Arquitectura técnica

**Regla arquitectónica clave: un solo canvas compartido para hero + servicios.** Dos escenas WebGL seguidas matan el rendimiento móvil. El scroll mueve la cámara, no monta/desmonta escenas.

**Stack:**
- Three.js (vanilla) — el proyecto es HTML puro, no React
- GSAP ScrollTrigger — sincroniza scroll y cámara
- Lenis — scroll suave
- Postprocessing — depth of field y bloom
- Fallback móvil: secuencia de imágenes WebP pre-renderizada (36–48 frames)

**Presupuesto de rendimiento:**

| Métrica | Objetivo |
|---|---|
| LCP móvil | < 2.5 s |
| `.glb` de la cápsula | < 800 KB |
| Lighthouse móvil | 85+ |

---

## Hero — el rostro

Tres niveles de producción documentados. Se arranca por **Nivel 1**:

- Foto en alta resolución + mapa de profundidad generado con IA (Depth Anything)
- Shader que desplaza la imagen según posición del mouse (parallax 2.5D)
- Tratamiento gráfico encima: wireframe, partículas, glow

**Decisión de posicionamiento pendiente:** rostro completo vs. parcialmente disuelto en la red. El doc recomienda la segunda opción para no convertir la landing en marca personal.

Foto base actual: `jeison.jpeg`.

---

## Sistema de diseño

**Color**

| Rol | Hex |
|---|---|
| Fondo grafito | `#0A0B0D` |
| Acento primario (lima señal) | `#C9F24D` |
| Acento excepción (solo módulo 02) | `#E85D9B` |
| Estructura fría | `#3D4A52` |
| Texto marfil | `#F2F1EC` |
| Texto atenuado | `#8A9199` |

**Un solo acento para los cuatro módulos.** Color-codificar por servicio rompe la lectura de sistema.

**Tipografía**
- Display: **Space Grotesk** (700 títulos, 400 cuerpo)
- Etiquetas/numeración: **IBM Plex Mono** — es lo que da el aire de instrumento de laboratorio

---

## Archivos de referencia en el repo

- `RUG-especificacion-experiencia-3D.md` — **especificación completa** de la experiencia 3D. Fuente de verdad para el hero y los módulos.
- `RUG-servicios-3D-tableros.pdf` — tableros visuales de los servicios.
- `01-carrusel-reposo-RUG.png` — carrusel en estado de reposo.
- `02-modulo-abierto-RUG.png` — módulo abierto (estado expandido).
- `03-ficha-comportamiento-RUG.png` — ficha de comportamiento de módulo.
- `neural-interface.html` — HTML base de trabajo (SynapseX como plantilla).
- `jeison.jpeg` — foto del CEO para el hero.

---

## Skill de referencia

Para construcción de la landing seguir el framework **F.R.A.M.E.** documentado en:

`.claude/skills/landing-builder-skill.md`

Ese skill define el proceso (Fundación, Render, Animación, Montaje, Entrega), los prompts para generar assets con ChatGPT Images 2 / Seedance, y la estructura de entrega esperada. Consultarlo antes de proponer estructura de secciones, generar assets, o decidir el ritmo de animación.

---

## Decisiones pendientes

1. Cápsula de vidrio vs. monolito metálico (clínico vs. industrial).
2. Rostro completo vs. disuelto en la red en el hero.
3. Copy del rótulo grande de cada módulo (comportamiento visual vs. beneficio comercial).
4. Orden de aparición de los módulos (03 es el más satisfactorio, 01 es el principal del portafolio).
5. Nivel de producción del hero (1, 2 o 3) según presupuesto — provisional: Nivel 1.
