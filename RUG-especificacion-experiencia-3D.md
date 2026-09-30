# RUG — Especificación de la experiencia 3D

Hero + sección de servicios. Documento de concepto y producción.

---

## Principio rector

El sitio de referencia (latas de gaseosa en carrusel 3D) no funciona por el 3D. Funciona porque **es el mismo objeto repetido con variaciones**. Esa repetición crea ritmo y hace que el carrusel se lea como un sistema.

Trasladado a RUG: **un solo objeto base, cuatro contenidos distintos.**

### El error que hay que evitar

Representar cada servicio con un objeto diferente — megáfono para tráfico, pincel para creatividad, embudo para conversión, engranaje para automatización — destruye el concepto por dos razones:

1. Visualmente queda un muestrario de íconos 3D, que es el look de agencia genérica.
2. Contradice el mensaje. Si la tesis de RUG es *"no vendemos servicios aislados, construimos sistemas"*, cuatro objetos inconexos dicen exactamente lo contrario.

---

## Concepto: módulos de laboratorio

RUG se llama **Laboratorio Estratégico**. El concepto lo toma literal.

Cuatro módulos idénticos flotando en el mismo carrusel: cápsulas de vidrio con collar metálico, algo entre vial y reactor. Misma geometría, mismo material, misma luz, mismo tamaño. **Lo único que cambia es lo que vive adentro.**

Al hacer clic o al llegar el scroll, la cámara entra a la cápsula, el vidrio se desvanece y el contenido invade la pantalla mientras entra el copy del servicio.

> **Variante alternativa:** si "laboratorio" resulta demasiado literal, la misma lógica funciona con **placas o monolitos** en vez de cápsulas — misma losa, distinto material y distinto comportamiento interno. La decisión de fondo es si RUG se posiciona más clínico o más industrial.

---

## Los cuatro módulos

### 01 · Tráfico Pago

**Contenido:** partículas luminosas que entran desde fuera de la cápsula y convergen hacia un charco de luz en la base.

| Parámetro | Valor |
|---|---|
| Movimiento | Direccional, entrante |
| Ritmo | Acelerando |
| Color | Acento primario |
| Lee como | Demanda llegando con presión |

**Copy asociado:** Convertimos inversión publicitaria en oportunidades de venta. Gestionamos campañas con orientación a resultados y, sobre todo, a ventas a través de páginas web.

---

### 02 · Creatividad Estratégica

**Contenido:** tinta o pigmento en suspensión que se difunde y se mezcla.

| Parámetro | Valor |
|---|---|
| Movimiento | Orgánico, sin dirección fija |
| Ritmo | Lento, sin loop perceptible |
| Color | Acento primario + magenta saturado |
| Lee como | Romper el patrón |

Es el único módulo con un segundo color saturado y el único con movimiento orgánico. **Rompe el patrón a propósito**, porque es la pieza que rompe la atención. Esa excepción debe ser visible: si los cuatro se ven igual de ordenados, el concepto pierde su punto de tensión.

**Copy asociado:** Creamos piezas con una función dentro del sistema de ventas. No diseñamos por diseñar: convertimos atención en acción.

---

### 03 · Conversión Digital

**Contenido:** partículas dispersas que colapsan de golpe en una retícula ordenada, y vuelven a dispersarse.

| Parámetro | Valor |
|---|---|
| Movimiento | Colapso súbito |
| Ritmo | Pausa, golpe, pausa |
| Color | Acento primario |
| Lee como | El clic que convierte |

Caos → estructura. Es literalmente el momento de la conversión y es el módulo más satisfactorio de ver. Vale la pena que sea el que se muestra primero si el scroll llega directo a un servicio.

**Copy asociado:** Hacemos que el tráfico tenga dónde convertir. No llevamos más personas a una página que no está preparada para vender.

---

### 04 · Automatización & Sistemas

**Contenido:** un circuito cerrado de luz que recorre el mismo camino sin parar.

| Parámetro | Valor |
|---|---|
| Movimiento | Loop perpetuo |
| Ritmo | Constante, velocidad fija |
| Color | Acento primario |
| Lee como | Proceso que ya no hay que empujar |

Sin inicio ni final visible. Es el único que se ve igual en cualquier momento en que lo mires, y eso es precisamente el mensaje.

**Copy asociado:** Convertimos procesos repetitivos en sistemas. Menos operación manual, más capacidad para vender y crecer.

---

## Hero: el rostro del CEO

### Cómo se hace

Tres niveles de costo y esfuerzo:

**Nivel 1 — barato y muy efectivo**
Foto en alta resolución del CEO + mapa de profundidad generado con IA, montado en un shader que desplaza la imagen según la posición del mouse. Da parallax 2.5D real, pesa muy poco, y con el tratamiento gráfico encima (wireframe, partículas, glow) queda muy cerca de la referencia.

**Nivel 2 — intermedio**
Escaneo con Polycam desde un iPhone → limpieza de malla en Blender → tratamiento y render de un loop de video.

**Nivel 3 — el de la referencia**
Escaneo fotogramétrico profesional → export a `.glb` → Three.js en tiempo real con shaders propios.

### La reserva de posicionamiento

Esto no es objeción técnica, es de estrategia de marca.

Un rostro gigante en el hero convierte el sitio en **marca personal**. El portafolio de RUG está escrito en primera persona del plural y vende infraestructura comercial, no a un consultor. Si RUG se vende por la autoridad de una persona, la decisión es correcta. Si se vende como sistema, el rostro compite con el mensaje.

**Versión intermedia recomendada:** que el rostro esté ahí pero **parcialmente disuelto en la red** — que no se lea como retrato sino como nodo. Presente, no protagonista. Eso conserva el impacto visual sin convertir a RUG en una marca personal.

---

## Arquitectura y rendimiento

Este es el punto que más importa, y el más fácil de ignorar hasta que es tarde.

Dos escenas WebGL pesadas seguidas (hero con cabeza + carrusel con cuatro módulos) es la forma más rápida de matar el rendimiento en móvil. Y RUG vende conversión: un LCP de seis segundos en el sitio de la agencia que optimiza páginas para convertir es un problema que el propio cliente va a poder señalar.

**La solución: un solo canvas compartido.**

- Hero y servicios viven en la misma escena WebGL.
- El scroll mueve la **cámara** de la cabeza a los módulos, en vez de montar y desmontar dos escenas.
- Beneficio extra: la transición mejora. La cabeza se aleja y los módulos aparecen como si siempre hubieran estado ahí.
- En móvil, ese mismo canvas cae a **secuencia de imágenes** pre-renderizada.

### Presupuesto de rendimiento sugerido

| Métrica | Objetivo |
|---|---|
| LCP móvil | < 2.5 s |
| Peso del `.glb` de la cápsula | < 800 KB (es un cilindro, no necesita más) |
| Secuencia de imágenes móvil | 36–48 frames WebP |
| Lighthouse móvil | 85+ |

---

## Stack técnico

**Producción (el original de la referencia):**
- Three.js o React Three Fiber
- GSAP ScrollTrigger para ligar scroll y cámara
- Lenis para scroll suave
- Postprocessing para depth of field y bloom

**Alternativa sin código:** Spline. Se modela el cilindro, se le aplica la textura, se configura la rotación ligada al scroll dentro de Spline y se exporta el embed. Menos control, mucho más rápido.

**Alternativa a prueba de balas:** secuencia de imágenes. Se renderiza el giro 360° en 36–72 frames y se cambia el frame según la posición del scroll sobre un `<canvas>`. Es el truco de Apple. Rinde perfecto en móvil, no necesita WebGL.

### Dónde entra la IA

| Herramienta | Uso | Veredicto |
|---|---|---|
| Nano Banana / Seedream | Diseñar texturas y arte plano para envolver | Útil |
| Meshy, Tripo, Rodin | Imagen → `.glb` | **Contraproducente** para geometría simple: da malla sucia. Un cilindro hecho a mano queda mejor |
| Higgsfield | Video generativo | Herramienta equivocada: el video no reacciona al scroll |
| Depth Anything o similar | Mapa de profundidad del rostro para el hero nivel 1 | Útil |

---

## Sistema de diseño

**Color**

| Rol | Hex |
|---|---|
| Fondo grafito | `#0A0B0D` |
| Acento primario (lima señal) | `#C9F24D` |
| Acento de excepción (solo módulo 02) | `#E85D9B` |
| Estructura fría | `#3D4A52` |
| Texto marfil | `#F2F1EC` |
| Texto atenuado | `#8A9199` |

Decisión clave: **un solo acento para los cuatro módulos.** Color-codificarlos habría sido lo obvio, pero rompe la lectura de sistema. La única excepción es Creatividad.

**Tipografía**

- Display: **Space Grotesk** (700 para títulos, 400 para cuerpo)
- Etiquetas y numeración: **IBM Plex Mono** — es lo que da el aire de instrumento de laboratorio en vez de landing de agencia

---

## Decisiones pendientes

1. **Cápsula de vidrio o monolito metálico.** Clínico vs. industrial.
2. **Rostro completo o disuelto en la red** en el hero.
3. **Copy del rótulo grande.** En el mockup describe el comportamiento visual; en producción probablemente convenga el beneficio comercial en el rótulo y la descripción poética en el estado abierto.
4. **Orden de aparición de los módulos.** El 03 es el más satisfactorio visualmente, el 01 es el servicio principal del portafolio.
5. **Nivel de producción del hero** (1, 2 o 3) según presupuesto.

---

## Estructura de página propuesta

```
01 · HERO          Rostro + red. Un canvas.
02 · SERVICIOS     Carrusel de cuatro módulos. Mismo canvas.
03 · EL RECORRIDO  Atención → Conversión → Venta → Escala
04 · CASOS         Resultados medibles
05 · EL SISTEMA    Cómo se conectan las cuatro líneas
06 · CONTACTO      Agendar diagnóstico
```

A partir de la sección 03 el sitio puede volver a HTML convencional. El 3D ya cumplió su función: capturar y explicar. Sostenerlo toda la página lo vuelve ruido y castiga el rendimiento.
