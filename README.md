# Fisio Atlas 3D

Aplicación web 3D orientada a fisioterapia. Combina un atlas anatómico interactivo con herramientas de valoración y documentación de sesión. Está preparada para desplegarse como sitio estático en GitHub Pages.

## Funciones incluidas

- Visor 3D con rotación, zoom, desplazamiento y vistas anterior/posterior/laterales.
- Selección directa de estructuras por clic y buscador por nombre.
- Filtros de músculos, huesos y otras estructuras.
- Enfocar, aislar, ocultar y restaurar estructuras.
- Fichas clínicas iniciales de músculos frecuentes: origen, inserción, acción, inervación y palpación orientativa.
- Mapa de dolor sobre el modelo 3D con intensidad 0-10.
- Goniómetro 3D de tres puntos.
- Registro de ROM por articulación con valores de referencia orientativos.
- Fuerza muscular MRC 0-5.
- Biblioteca inicial de pruebas especiales de hombro, codo, cadera, rodilla y tobillo.
- Nota SOAP de sesión.
- Prescripción editable de ejercicios.
- Temporizador de trabajo/descanso por rondas.
- Exportación de sesión a JSON y TXT, importación de JSON e impresión.
- Diseño responsivo para computadora, tableta y móvil.
- Modo de demostración 3D simplificado si el modelo anatómico no puede cargarse.

## Arranque local

Requiere Node.js moderno.

```bash
npm install
npm run dev
```

Después abre la dirección que indique Vite.

## Compilar

```bash
npm run build
```

El sitio compilado queda en `dist/`.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube todo el contenido de esta carpeta.
3. En GitHub abre `Settings > Pages`.
4. En `Build and deployment`, selecciona `GitHub Actions`.
5. Haz push a la rama `main`.
6. El workflow incluido en `.github/workflows/deploy.yml` compilará y publicará el sitio.

La configuración de Vite usa `base: './'`, por lo que funciona tanto en repositorios de proyecto como en dominio personalizado.

## Modelo anatómico

La aplicación intenta cargar, en este orden:

1. `public/models/body.glb`, si tú lo agregas al repositorio.
2. Un respaldo remoto derivado de Z-Anatomy alojado en el repositorio `hpfrei/body-anatomy-3d-viewer`.
3. Un maniquí clínico procedimental simplificado si ninguno de los anteriores está disponible.

Para una versión clínica estable conviene descargar, validar y alojar localmente el modelo 3D, manteniendo todas las atribuciones y obligaciones de la licencia del modelo. Consulta `THIRD_PARTY_NOTICES.md`.

## Privacidad

Esta versión no incluye backend, cuentas ni una base de datos clínica. Los datos de la sesión se mantienen sólo en memoria hasta recargar la página, excepto cuando el usuario los exporta manualmente.

No se recomienda introducir datos identificables del paciente en una instancia pública de GitHub Pages. Si el proyecto evoluciona a expediente clínico, autenticación, sincronización o almacenamiento de pacientes, debe añadirse una arquitectura segura y revisar la normativa aplicable.

## Alcance clínico

El proyecto es una herramienta de apoyo y educación para profesionales. No es software diagnóstico y no sustituye el juicio clínico. Los valores de ROM son referencias orientativas y deben interpretarse considerando técnica de medición, edad, variabilidad individual, patología y fuente empleada.

## Estructura

```text
fisio-atlas-3d/
  index.html
  package.json
  vite.config.js
  src/
    main.js
    styles.css
    data/
      anatomyClinical.js
      clinicalData.js
  public/
    icon.svg
    manifest.webmanifest
    models/
      README.md
  .github/workflows/deploy.yml
  REFERENCES.md
  THIRD_PARTY_NOTICES.md
  LICENSE
```

## Siguientes ampliaciones recomendadas

- Modelo completo por capas: músculos, huesos, ligamentos, nervios, fascia y articulaciones.
- Base clínica española ampliada con acciones, pruebas musculares manuales y relaciones funcionales.
- Goniometría 2D sobre fotografía o cámara con consentimiento.
- Plantillas de valoración por región corporal.
- Comparación entre sesiones y gráficas de progreso.
- PWA completamente offline con modelo local.
- Backend cifrado y autenticación si se pretende trabajar con expedientes reales.
