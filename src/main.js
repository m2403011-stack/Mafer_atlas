import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { getClinicalAnatomyForMesh } from './data/anatomyClinical.js';
import { romReference, mrcGrades, specialTests, exerciseTemplates } from './data/clinicalData.js';

const REMOTE_MODEL = 'https://cdn.jsdelivr.net/gh/hpfrei/body-anatomy-3d-viewer@main/public/body.glb';
const DRACO_PATH = 'https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/libs/draco/';

const state = {
  model: null,
  meshes: [],
  selected: null,
  selectedOriginalMaterial: null,
  hidden: new Set(),
  isolated: false,
  layers: { muscle: true, bone: true, other: true },
  painMode: false,
  gonioMode: false,
  painMarkers: [],
  gonioPoints: [],
  gonioObjects: [],
  evaluations: [],
  exercises: [],
  timer: { id: null, running: false, phase: 'work', round: 1, remaining: 30 },
  modelBounds: null,
  fallback: false,
};

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <strong>Fisio Atlas 3D</strong>
        <span>Atlas anatómico y apoyo de valoración fisioterapéutica</span>
      </div>
      <div class="status-pill" id="load-status"><span class="status-dot" id="status-dot"></span><span id="status-text">Cargando modelo anatómico...</span></div>
    </header>
    <main class="layout">
      <section class="viewer-column">
        <div class="viewer-toolbar">
          <div class="search-wrap">
            <input id="anatomy-search" type="search" placeholder="Buscar músculo o estructura..." autocomplete="off" aria-label="Buscar estructura anatómica" />
            <div class="search-results" id="search-results"></div>
          </div>
          <div class="view-buttons" aria-label="Vistas anatómicas">
            <button class="btn small" data-view="front" type="button">Anterior</button>
            <button class="btn small" data-view="back" type="button">Posterior</button>
            <button class="btn small" data-view="left" type="button">Izquierda</button>
            <button class="btn small" data-view="right" type="button">Derecha</button>
          </div>
          <button class="btn small" id="focus-selected" type="button">Enfocar</button>
          <button class="btn small" id="isolate-selected" type="button">Aislar</button>
          <button class="btn small danger" id="hide-selected" type="button">Ocultar</button>
          <button class="btn small" id="restore-all" type="button">Restaurar</button>
        </div>
        <div class="viewport" id="viewport">
          <div id="three-root"></div>
          <div class="angle-readout" id="angle-readout">Ángulo: <strong id="angle-value">--</strong></div>
          <div class="viewport-help">Arrastra para rotar, rueda para acercar y clic derecho para desplazar. Selecciona una estructura para ver sus datos.</div>
        </div>
        <div class="viewer-tools">
          <label class="layer-control"><input type="checkbox" data-layer="muscle" checked /> Músculos</label>
          <label class="layer-control"><input type="checkbox" data-layer="bone" checked /> Huesos</label>
          <label class="layer-control"><input type="checkbox" data-layer="other" checked /> Otros</label>
          <button class="tool-btn" id="pain-tool" type="button">Marcar dolor</button>
          <button class="tool-btn" id="gonio-tool" type="button">Goniómetro 3D</button>
          <button class="tool-btn" id="clear-gonio" type="button">Limpiar ángulo</button>
        </div>
      </section>

      <aside class="sidebar">
        <div class="tabs" role="tablist">
          <button class="tab-btn active" data-tab="atlas" type="button">Atlas</button>
          <button class="tab-btn" data-tab="evaluation" type="button">Valoración</button>
          <button class="tab-btn" data-tab="session" type="button">Sesión</button>
        </div>
        <div class="side-scroll">
          <section class="panel active" data-panel="atlas">
            <h2>Estructura seleccionada</h2>
            <div id="selection-panel" class="empty-state">Selecciona una estructura del modelo 3D o búscala por nombre.</div>

            <h3>Mapa de dolor 3D</h3>
            <div class="card">
              <div class="pain-controls">
                <label class="field">Intensidad 0-10
                  <input id="pain-intensity" type="number" min="0" max="10" value="5" inputmode="numeric" />
                </label>
                <button class="btn" id="pain-tool-side" type="button">Activar</button>
              </div>
              <p class="small-text muted">Activa la herramienta y toca el modelo donde el paciente refiere dolor. Se guardará la posición 3D y la intensidad.</p>
              <div class="pain-list" id="pain-list"></div>
            </div>
          </section>

          <section class="panel" data-panel="evaluation">
            <h2>Valoración funcional</h2>
            <div class="notice">Las referencias de ROM son orientativas y deben ajustarse al método, edad, articulación, fuente utilizada y contexto clínico. La aplicación no emite diagnósticos.</div>
            <form id="evaluation-form" class="card" style="margin-top:10px">
              <div class="form-grid">
                <label class="field">Región / articulación
                  <select id="joint-select"></select>
                </label>
                <label class="field">Lado
                  <select id="side-select"><option>Derecho</option><option>Izquierdo</option><option>Bilateral</option><option>No aplica</option></select>
                </label>
                <label class="field">Movimiento
                  <select id="movement-select"></select>
                </label>
                <label class="field">ROM medido (°)
                  <input id="rom-value" type="number" min="-30" max="240" step="1" placeholder="Ej. 120" />
                </label>
                <div class="reference-box span-2" id="rom-reference">Referencia orientativa: --</div>
                <label class="field span-2">Fuerza muscular MRC
                  <select id="mrc-select"></select>
                </label>
                <label class="field span-2">Observaciones
                  <textarea id="evaluation-notes" placeholder="Dolor, compensaciones, sensación terminal, calidad del movimiento..."></textarea>
                </label>
              </div>
              <h3>Pruebas especiales</h3>
              <div id="special-tests"></div>
              <div class="actions"><button class="btn primary" type="submit">Agregar a la sesión</button></div>
            </form>
            <h3>Registros de esta sesión</h3>
            <div id="evaluation-list"></div>
            <p class="footer-note">Escala MRC: usada con permiso del Medical Research Council. Registrar la fuerza como hallazgo clínico y no como diagnóstico aislado.</p>
          </section>

          <section class="panel" data-panel="session">
            <h2>Nota de sesión</h2>
            <div class="notice">No introduzcas nombre, teléfono, expediente ni otros identificadores del paciente si vas a usar esta versión pública en GitHub Pages. Los datos permanecen en memoria hasta recargar, salvo que tú los exportes.</div>
            <div class="card" style="margin-top:10px">
              <div class="form-grid">
                <label class="field span-2">S - Subjetivo<textarea id="soap-s" placeholder="Síntomas, evolución, tolerancia, objetivos del paciente..."></textarea></label>
                <label class="field span-2">O - Objetivo<textarea id="soap-o" placeholder="Hallazgos observables y mediciones..."></textarea></label>
                <label class="field span-2">A - Análisis clínico<textarea id="soap-a" placeholder="Interpretación profesional de los hallazgos..."></textarea></label>
                <label class="field span-2">P - Plan<textarea id="soap-p" placeholder="Intervención, progresión y seguimiento..."></textarea></label>
              </div>
            </div>

            <h3>Ejercicios / indicaciones</h3>
            <div class="card">
              <div class="exercise-add">
                <select id="exercise-template"></select>
                <button class="btn" id="add-exercise" type="button">Agregar</button>
              </div>
              <div id="exercise-list" style="margin-top:9px"></div>
            </div>

            <h3>Temporizador terapéutico</h3>
            <div class="card timer">
              <div class="timer-settings">
                <label class="field">Trabajo (s)<input id="timer-work" type="number" min="1" max="600" value="30" /></label>
                <label class="field">Descanso (s)<input id="timer-rest" type="number" min="0" max="600" value="30" /></label>
                <label class="field">Rondas<input id="timer-rounds" type="number" min="1" max="99" value="5" /></label>
              </div>
              <div class="timer-display" id="timer-display">00:30</div>
              <div class="timer-phase" id="timer-phase">Trabajo - ronda 1 de 5</div>
              <div class="timer-controls">
                <button class="btn primary" id="timer-start" type="button">Iniciar</button>
                <button class="btn" id="timer-pause" type="button">Pausar</button>
                <button class="btn" id="timer-reset" type="button">Reiniciar</button>
              </div>
            </div>

            <h3>Exportación</h3>
            <div class="card">
              <div class="actions">
                <button class="btn primary" id="export-json" type="button">Exportar JSON</button>
                <button class="btn" id="export-txt" type="button">Exportar resumen TXT</button>
                <button class="btn" id="import-json" type="button">Importar JSON</button>
                <button class="btn" id="print-session" type="button">Imprimir</button>
                <input class="file-input" id="import-file" type="file" accept="application/json,.json" />
              </div>
            </div>

            <div class="footer-note">
              Uso de apoyo educativo y clínico por profesionales. No es software diagnóstico ni sustituye el juicio clínico. Revisa licencias y atribuciones del modelo anatómico antes de redistribuir derivados.
            </div>
          </section>
        </div>
      </aside>
    </main>
  </div>
`;

const els = Object.fromEntries([
  'three-root','viewport','load-status','status-dot','status-text','anatomy-search','search-results','selection-panel',
  'focus-selected','isolate-selected','hide-selected','restore-all','pain-tool','pain-tool-side','pain-intensity','pain-list',
  'gonio-tool','clear-gonio','angle-readout','angle-value','joint-select','movement-select','side-select','rom-value',
  'rom-reference','mrc-select','evaluation-notes','special-tests','evaluation-form','evaluation-list','soap-s','soap-o','soap-a','soap-p',
  'exercise-template','add-exercise','exercise-list','timer-work','timer-rest','timer-rounds','timer-display','timer-phase','timer-start',
  'timer-pause','timer-reset','export-json','export-txt','import-json','import-file','print-session'
].map(id => [id, document.getElementById(id)]));

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x08101b, 7, 24);
const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 200);
camera.position.set(0, 0.6, 5.5);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
els['three-root'].appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 0.5, 0);
controls.minDistance = 0.35;
controls.maxDistance = 25;

scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x1c2430, 2.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
keyLight.position.set(4, 6, 5);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x9cc9ff, 1.25);
fillLight.position.set(-4, 2, -4);
scene.add(fillLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(3.2, 64),
  new THREE.MeshStandardMaterial({ color: 0x101927, roughness: 1, metalness: 0, transparent: true, opacity: 0.48 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.02;
scene.add(floor);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDown = null;

function setStatus(text, mode = 'loading') {
  els['status-text'].textContent = text;
  els['status-dot'].className = 'status-dot' + (mode === 'ok' ? ' ok' : mode === 'error' ? ' error' : '');
}

function cleanName(name = '') {
  return String(name)
    .replace(/[_]+/g, ' ')
    .replace(/\.(l|r)(\.|$)/gi, (_, side) => side.toLowerCase() === 'l' ? ' izquierda ' : ' derecha ')
    .replace(/\s+/g, ' ')
    .trim() || 'Estructura anatómica';
}

function classifyMesh(mesh) {
  const raw = [mesh.userData?.type, mesh.userData?.category, mesh.userData?.name, mesh.name].filter(Boolean).join(' ').toLowerCase();
  if (/muscle|muscular|tendon|fascia/.test(raw)) return 'muscle';
  if (/bone|skelet|osse|vertebr|femur|tibia|fibula|humer|radius|ulna|scapula|clavicle|rib|pelvis|patella/.test(raw)) return 'bone';
  return 'other';
}

function meshDisplayName(mesh) {
  return cleanName(mesh.userData?.nameDetail || mesh.userData?.name || mesh.name);
}

function indexModel(root) {
  state.meshes = [];
  root.traverse(obj => {
    if (!obj.isMesh) return;
    obj.userData.__atlasType = classifyMesh(obj);
    obj.userData.__atlasName = meshDisplayName(obj);
    obj.castShadow = false;
    obj.receiveShadow = false;
    state.meshes.push(obj);
  });
  state.meshes.sort((a, b) => a.userData.__atlasName.localeCompare(b.userData.__atlasName, 'es'));
}

function normalizeModel(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const height = Math.max(size.y, 0.001);
  const targetHeight = 3.7;
  const scale = targetHeight / height;
  root.scale.multiplyScalar(scale);
  root.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(root);
  const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
  root.position.x -= scaledCenter.x;
  root.position.z -= scaledCenter.z;
  root.position.y += -1.0 - scaledBox.min.y;
  root.updateMatrixWorld(true);
  state.modelBounds = new THREE.Box3().setFromObject(root);
  const finalCenter = state.modelBounds.getCenter(new THREE.Vector3());
  const finalSize = state.modelBounds.getSize(new THREE.Vector3());
  controls.target.copy(finalCenter);
  const dist = Math.max(finalSize.y * 1.25, finalSize.x * 2.2, 4.7);
  camera.position.set(finalCenter.x, finalCenter.y + finalSize.y * 0.03, finalCenter.z + dist);
  camera.near = 0.01;
  camera.far = 100;
  camera.updateProjectionMatrix();
  controls.update();
}

function createCapsule(name, p1, p2, radius, color, type = 'muscle') {
  const start = new THREE.Vector3(...p1);
  const end = new THREE.Vector3(...p2);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const length = start.distanceTo(end);
  const geom = new THREE.CapsuleGeometry(radius, Math.max(0.01, length - radius * 2), 8, 16);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.78 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = name;
  mesh.userData.type = type;
  mesh.position.copy(mid);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
  mesh.quaternion.copy(q);
  return mesh;
}

function createFallbackModel() {
  const group = new THREE.Group();
  group.name = 'Clinical demo mannequin';
  const skin = 0x9f5f59;
  const bone = 0xded7c3;
  const muscle = 0x984f52;
  group.add(new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 16), new THREE.MeshStandardMaterial({ color: skin, roughness: .9 })));
  group.children.at(-1).name = 'Head';
  group.children.at(-1).userData.type = 'other';
  group.children.at(-1).position.set(0, 1.35, 0);
  group.add(createCapsule('Spine', [0, 1.05, 0], [0, -0.5, 0], 0.075, bone, 'bone'));
  group.add(createCapsule('Left humerus', [-0.32, 0.75, 0], [-0.72, -0.05, 0], 0.06, bone, 'bone'));
  group.add(createCapsule('Right humerus', [0.32, 0.75, 0], [0.72, -0.05, 0], 0.06, bone, 'bone'));
  group.add(createCapsule('Left forearm bones', [-0.72, -0.05, 0], [-0.8, -0.82, 0], 0.045, bone, 'bone'));
  group.add(createCapsule('Right forearm bones', [0.72, -0.05, 0], [0.8, -0.82, 0], 0.045, bone, 'bone'));
  group.add(createCapsule('Left femur', [-0.2, -0.55, 0], [-0.28, -1.5, 0], 0.07, bone, 'bone'));
  group.add(createCapsule('Right femur', [0.2, -0.55, 0], [0.28, -1.5, 0], 0.07, bone, 'bone'));
  group.add(createCapsule('Left tibia', [-0.28, -1.5, 0], [-0.29, -2.35, 0], 0.055, bone, 'bone'));
  group.add(createCapsule('Right tibia', [0.28, -1.5, 0], [0.29, -2.35, 0], 0.055, bone, 'bone'));
  group.add(createCapsule('Deltoid left', [-0.25, 0.78, 0.02], [-0.45, 0.42, 0.02], 0.11, muscle));
  group.add(createCapsule('Deltoid right', [0.25, 0.78, 0.02], [0.45, 0.42, 0.02], 0.11, muscle));
  group.add(createCapsule('Biceps brachii left', [-0.46, 0.35, 0.08], [-0.68, -0.05, 0.08], 0.085, muscle));
  group.add(createCapsule('Biceps brachii right', [0.46, 0.35, 0.08], [0.68, -0.05, 0.08], 0.085, muscle));
  group.add(createCapsule('Rectus femoris left', [-0.16, -0.65, 0.1], [-0.25, -1.42, 0.1], 0.1, muscle));
  group.add(createCapsule('Rectus femoris right', [0.16, -0.65, 0.1], [0.25, -1.42, 0.1], 0.1, muscle));
  group.add(createCapsule('Gastrocnemius left', [-0.27, -1.58, -0.05], [-0.29, -2.25, -0.07], 0.085, muscle));
  group.add(createCapsule('Gastrocnemius right', [0.27, -1.58, -0.05], [0.29, -2.25, -0.07], 0.085, muscle));
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.72, 12, 24), new THREE.MeshStandardMaterial({ color: muscle, roughness: .82 }));
  torso.name = 'Pectoralis major and trunk demonstration';
  torso.userData.type = 'muscle';
  torso.position.set(0, 0.35, 0);
  group.add(torso);
  return group;
}

async function loadAnatomy() {
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_PATH);
  loader.setDRACOLoader(draco);

  const candidates = [
    `${import.meta.env.BASE_URL}models/body.glb`,
    REMOTE_MODEL,
  ];

  let root = null;
  for (const url of candidates) {
    try {
      setStatus(url === REMOTE_MODEL ? 'Cargando atlas anatómico abierto...' : 'Buscando modelo anatómico local...');
      const gltf = await loader.loadAsync(url);
      root = gltf.scene;
      state.fallback = false;
      break;
    } catch (err) {
      console.warn('No se pudo cargar', url, err);
    }
  }
  draco.dispose();

  if (!root) {
    root = createFallbackModel();
    state.fallback = true;
    setStatus('Modelo externo no disponible. Modo demostración 3D simplificado.', 'error');
  } else {
    setStatus('Atlas 3D listo. Selecciona una estructura.', 'ok');
  }
  state.model = root;
  scene.add(root);
  normalizeModel(root);
  indexModel(root);
  applyVisibility();
}

function restoreSelectionMaterial() {
  if (state.selected && state.selectedOriginalMaterial) {
    state.selected.material = state.selectedOriginalMaterial;
  }
  state.selectedOriginalMaterial = null;
}

function selectMesh(mesh) {
  restoreSelectionMaterial();
  state.selected = mesh;
  if (!mesh) {
    els['selection-panel'].className = 'empty-state';
    els['selection-panel'].textContent = 'Selecciona una estructura del modelo 3D o búscala por nombre.';
    return;
  }
  if (mesh.material) {
    state.selectedOriginalMaterial = mesh.material;
    const highlighted = Array.isArray(mesh.material) ? mesh.material.map(m => m.clone()) : mesh.material.clone();
    const apply = mat => {
      if ('emissive' in mat) mat.emissive.setHex(0x194f6a);
      if ('emissiveIntensity' in mat) mat.emissiveIntensity = 0.85;
    };
    Array.isArray(highlighted) ? highlighted.forEach(apply) : apply(highlighted);
    mesh.material = highlighted;
  }
  const clinical = getClinicalAnatomyForMesh(mesh);
  const type = mesh.userData.__atlasType || classifyMesh(mesh);
  const extra = clinical ? `
    <div class="info-grid">
      <div class="info-row"><strong>Región</strong><p>${escapeHtml(clinical.region)}</p></div>
      <div class="info-row"><strong>Origen</strong><p>${escapeHtml(clinical.origin)}</p></div>
      <div class="info-row"><strong>Inserción</strong><p>${escapeHtml(clinical.insertion)}</p></div>
      <div class="info-row"><strong>Acción</strong><p>${escapeHtml(clinical.action)}</p></div>
      <div class="info-row"><strong>Inervación</strong><p>${escapeHtml(clinical.innervation)}</p></div>
      <div class="info-row"><strong>Palpación orientativa</strong><p>${escapeHtml(clinical.palpation)}</p></div>
    </div>` : `<p class="small-text muted">Esta estructura todavía no tiene ficha clínica curada. El modelo puede contener más estructuras que la base clínica inicial.</p>`;
  els['selection-panel'].className = 'card';
  els['selection-panel'].innerHTML = `
    <div class="selection-name">${escapeHtml(mesh.userData.__atlasName || meshDisplayName(mesh))}</div>
    <div class="selection-meta">${type === 'muscle' ? 'Sistema muscular' : type === 'bone' ? 'Sistema óseo' : 'Estructura anatómica'}</div>
    ${extra}
  `;
}

function focusOnMesh(mesh = state.selected) {
  if (!mesh) return;
  const box = new THREE.Box3().setFromObject(mesh);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.length() * 0.9, 0.28);
  controls.target.copy(center);
  const direction = camera.position.clone().sub(controls.target).normalize();
  camera.position.copy(center.clone().add(direction.multiplyScalar(radius * 3.0)));
  controls.update();
}

function applyVisibility() {
  state.meshes.forEach(mesh => {
    const type = mesh.userData.__atlasType || 'other';
    const layerVisible = state.layers[type] !== false;
    const hidden = state.hidden.has(mesh);
    const isolatedOut = state.isolated && mesh !== state.selected;
    mesh.visible = layerVisible && !hidden && !isolatedOut;
  });
}

function setView(view) {
  if (!state.modelBounds) return;
  const center = state.modelBounds.getCenter(new THREE.Vector3());
  const size = state.modelBounds.getSize(new THREE.Vector3());
  const dist = Math.max(size.y * 1.25, 4.8);
  const positions = {
    front: [center.x, center.y, center.z + dist],
    back: [center.x, center.y, center.z - dist],
    left: [center.x - dist, center.y, center.z],
    right: [center.x + dist, center.y, center.z],
  };
  camera.position.set(...positions[view]);
  controls.target.copy(center);
  controls.update();
}

function screenToRay(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(state.meshes.filter(m => m.visible), false);
}

function addPainMarker(point, mesh) {
  const intensity = clamp(Number(els['pain-intensity'].value), 0, 10, 5);
  const color = new THREE.Color().setHSL(0.12 - (intensity / 10) * 0.12, 0.85, 0.56);
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 16, 12),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35 })
  );
  marker.position.copy(point);
  scene.add(marker);
  const item = {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    intensity,
    structure: mesh ? meshDisplayName(mesh) : 'Sin estructura',
    point: { x: point.x, y: point.y, z: point.z },
    object: marker,
  };
  state.painMarkers.push(item);
  renderPainList();
}

function renderPainList() {
  els['pain-list'].innerHTML = state.painMarkers.length ? state.painMarkers.map((m, i) => `
    <div class="pain-item"><span>P${i + 1}: ${escapeHtml(m.structure)} - ${m.intensity}/10</span><button class="btn small danger" data-remove-pain="${m.id}" type="button">Quitar</button></div>
  `).join('') : '<div class="small-text muted">Sin puntos registrados.</div>';
}

function addGonioPoint(point) {
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.026, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0x69d6ff, emissive: 0x1c6d8f, emissiveIntensity: .55 })
  );
  dot.position.copy(point);
  scene.add(dot);
  state.gonioObjects.push(dot);
  state.gonioPoints.push(point.clone());
  if (state.gonioPoints.length >= 2) redrawGonioLines();
  if (state.gonioPoints.length === 3) {
    const [a, b, c] = state.gonioPoints;
    const ba = a.clone().sub(b).normalize();
    const bc = c.clone().sub(b).normalize();
    const angle = THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(ba.dot(bc), -1, 1)));
    els['angle-value'].textContent = `${angle.toFixed(1)}°`;
    els['angle-readout'].classList.add('show');
    state.gonioMode = false;
    updateToolButtons();
  }
}

function redrawGonioLines() {
  const oldLines = state.gonioObjects.filter(o => o.isLine);
  oldLines.forEach(line => { scene.remove(line); line.geometry.dispose(); line.material.dispose(); });
  state.gonioObjects = state.gonioObjects.filter(o => !o.isLine);
  if (state.gonioPoints.length < 2) return;
  const points = state.gonioPoints.length === 2 ? state.gonioPoints : [state.gonioPoints[0], state.gonioPoints[1], state.gonioPoints[2]];
  const geom = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x69d6ff }));
  scene.add(line);
  state.gonioObjects.push(line);
}

function clearGoniometer() {
  state.gonioObjects.forEach(o => {
    scene.remove(o);
    o.geometry?.dispose?.();
    if (Array.isArray(o.material)) o.material.forEach(m => m.dispose?.()); else o.material?.dispose?.();
  });
  state.gonioObjects = [];
  state.gonioPoints = [];
  els['angle-readout'].classList.remove('show');
  els['angle-value'].textContent = '--';
}

function updateToolButtons() {
  els['pain-tool'].classList.toggle('active', state.painMode);
  els['pain-tool-side'].classList.toggle('active', state.painMode);
  els['pain-tool-side'].textContent = state.painMode ? 'Activo' : 'Activar';
  els['gonio-tool'].classList.toggle('active', state.gonioMode);
}

function togglePainMode() {
  state.painMode = !state.painMode;
  if (state.painMode) state.gonioMode = false;
  updateToolButtons();
}

function toggleGonioMode() {
  if (state.gonioPoints.length >= 3) clearGoniometer();
  state.gonioMode = !state.gonioMode;
  if (state.gonioMode) state.painMode = false;
  updateToolButtons();
}

function handleCanvasClick(event) {
  const hits = screenToRay(event);
  if (!hits.length) return;
  const hit = hits[0];
  if (state.painMode) {
    addPainMarker(hit.point, hit.object);
    return;
  }
  if (state.gonioMode) {
    addGonioPoint(hit.point);
    return;
  }
  selectMesh(hit.object);
}

function renderSearchResults(query) {
  const q = query.trim().toLowerCase();
  if (!q) { els['search-results'].innerHTML = ''; return; }
  const matches = state.meshes.filter(mesh => {
    const hay = [mesh.userData.__atlasName, mesh.name, mesh.userData?.name, mesh.userData?.nameDetail].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  }).slice(0, 24);
  els['search-results'].innerHTML = matches.length ? matches.map((mesh, i) => `<button type="button" data-search-index="${i}">${escapeHtml(mesh.userData.__atlasName)}</button>`).join('') : '<div class="small-text muted" style="padding:10px">Sin coincidencias.</div>';
  els['search-results']._matches = matches;
}

function initClinicalForms() {
  els['joint-select'].innerHTML = Object.entries(romReference).map(([key, item]) => `<option value="${key}">${item.label}</option>`).join('');
  els['mrc-select'].innerHTML = '<option value="">No evaluada</option>' + mrcGrades.map(g => `<option value="${g.value}">${g.label}</option>`).join('');
  els['exercise-template'].innerHTML = exerciseTemplates.map(name => `<option>${name}</option>`).join('');
  updateMovementOptions();
  renderPainList();
  renderEvaluations();
  renderExercises();
  updateTimerDisplay();
}

function updateMovementOptions() {
  const joint = els['joint-select'].value || Object.keys(romReference)[0];
  const data = romReference[joint];
  els['movement-select'].innerHTML = Object.entries(data.movements).map(([key, item]) => `<option value="${key}">${item.label}</option>`).join('');
  renderSpecialTests(joint);
  updateRomReference();
}

function updateRomReference() {
  const joint = els['joint-select'].value;
  const movement = els['movement-select'].value;
  const item = romReference[joint]?.movements?.[movement];
  const measured = Number(els['rom-value'].value);
  if (!item) { els['rom-reference'].textContent = 'Referencia orientativa: --'; return; }
  const diff = Number.isFinite(measured) && els['rom-value'].value !== '' ? ` | diferencia respecto a referencia: ${(measured - item.reference) > 0 ? '+' : ''}${measured - item.reference}°` : '';
  els['rom-reference'].textContent = `Referencia orientativa para ${item.label.toLowerCase()}: ${item.reference}°${diff}`;
}

function renderSpecialTests(joint) {
  const tests = specialTests[joint] || [];
  els['special-tests'].innerHTML = tests.length ? tests.map(test => `
    <div class="test-item" data-test-id="${test.id}">
      <div class="test-item-title">${escapeHtml(test.name)}</div>
      <p><strong>Objetivo:</strong> ${escapeHtml(test.purpose)}</p>
      <p>${escapeHtml(test.procedure)}</p>
      <p>${escapeHtml(test.note)}</p>
      <div class="test-controls">
        <select data-test-result>
          <option value="not_tested">No realizada</option>
          <option value="negative">Negativa</option>
          <option value="positive">Positiva</option>
          <option value="indeterminate">Indeterminada</option>
        </select>
        <input data-test-note type="text" placeholder="Nota breve" />
      </div>
    </div>
  `).join('') : '<div class="small-text muted">No hay pruebas preconfiguradas para esta región.</div>';
}

function collectSpecialTests() {
  return [...els['special-tests'].querySelectorAll('[data-test-id]')].map(node => {
    const id = node.dataset.testId;
    const joint = els['joint-select'].value;
    const source = (specialTests[joint] || []).find(t => t.id === id);
    return {
      id,
      name: source?.name || id,
      result: node.querySelector('[data-test-result]')?.value || 'not_tested',
      note: node.querySelector('[data-test-note]')?.value.trim() || '',
    };
  }).filter(t => t.result !== 'not_tested' || t.note);
}

function renderEvaluations() {
  if (!state.evaluations.length) {
    els['evaluation-list'].innerHTML = '<div class="empty-state">Aún no hay registros.</div>';
    return;
  }
  els['evaluation-list'].innerHTML = state.evaluations.map((ev, idx) => {
    const tests = ev.tests?.length ? `<div>Pruebas: ${ev.tests.map(t => `${t.name}: ${translateTestResult(t.result)}`).join('; ')}</div>` : '';
    return `<div class="card eval-item"><strong>${escapeHtml(ev.jointLabel)} - ${escapeHtml(ev.side)}</strong>
      <div>${escapeHtml(ev.movementLabel)}: ${ev.rom === null ? 'sin ROM' : `${ev.rom}°`} | Ref. ${ev.reference}° | MRC: ${ev.mrc === '' ? 'no evaluada' : ev.mrc}</div>
      ${tests}
      ${ev.notes ? `<div>${escapeHtml(ev.notes)}</div>` : ''}
      <div class="actions"><button class="btn small danger" type="button" data-remove-eval="${idx}">Eliminar</button></div>
    </div>`;
  }).join('');
}

function translateTestResult(value) {
  return ({ positive: 'positiva', negative: 'negativa', indeterminate: 'indeterminada', not_tested: 'no realizada' })[value] || value;
}

function addExercise(name = 'Ejercicio') {
  state.exercises.push({ name, sets: '3', reps: '10', frequency: '1 vez/día' });
  renderExercises();
}

function renderExercises() {
  els['exercise-list'].innerHTML = state.exercises.length ? state.exercises.map((ex, idx) => `
    <div class="exercise-row" data-exercise="${idx}">
      <input aria-label="Ejercicio" data-ex-field="name" value="${escapeAttr(ex.name)}" />
      <input aria-label="Series" data-ex-field="sets" value="${escapeAttr(ex.sets)}" />
      <input aria-label="Repeticiones" data-ex-field="reps" value="${escapeAttr(ex.reps)}" />
      <input class="freq" aria-label="Frecuencia" data-ex-field="frequency" value="${escapeAttr(ex.frequency)}" />
      <button type="button" aria-label="Eliminar ejercicio" data-remove-exercise="${idx}">X</button>
    </div>
  `).join('') : '<div class="small-text muted">Sin ejercicios agregados.</div>';
}

function syncExerciseInputs() {
  [...els['exercise-list'].querySelectorAll('[data-exercise]')].forEach(row => {
    const idx = Number(row.dataset.exercise);
    const ex = state.exercises[idx];
    if (!ex) return;
    row.querySelectorAll('[data-ex-field]').forEach(input => { ex[input.dataset.exField] = input.value; });
  });
}

function resetTimer() {
  stopTimer();
  state.timer.phase = 'work';
  state.timer.round = 1;
  state.timer.remaining = clamp(Number(els['timer-work'].value), 1, 600, 30);
  updateTimerDisplay();
}

function startTimer() {
  if (state.timer.running) return;
  const rounds = clamp(Number(els['timer-rounds'].value), 1, 99, 5);
  if (state.timer.round > rounds) resetTimer();
  state.timer.running = true;
  state.timer.id = window.setInterval(() => {
    state.timer.remaining -= 1;
    if (state.timer.remaining <= 0) advanceTimerPhase();
    updateTimerDisplay();
  }, 1000);
  updateTimerDisplay();
}

function stopTimer() {
  if (state.timer.id) window.clearInterval(state.timer.id);
  state.timer.id = null;
  state.timer.running = false;
}

function advanceTimerPhase() {
  const work = clamp(Number(els['timer-work'].value), 1, 600, 30);
  const rest = clamp(Number(els['timer-rest'].value), 0, 600, 30);
  const rounds = clamp(Number(els['timer-rounds'].value), 1, 99, 5);
  if (state.timer.phase === 'work') {
    if (rest > 0) {
      state.timer.phase = 'rest';
      state.timer.remaining = rest;
    } else if (state.timer.round < rounds) {
      state.timer.round += 1;
      state.timer.remaining = work;
    } else {
      stopTimer();
      state.timer.remaining = 0;
    }
  } else {
    if (state.timer.round < rounds) {
      state.timer.round += 1;
      state.timer.phase = 'work';
      state.timer.remaining = work;
    } else {
      stopTimer();
      state.timer.remaining = 0;
    }
  }
}

function updateTimerDisplay() {
  const sec = Math.max(0, Math.round(state.timer.remaining));
  const minPart = String(Math.floor(sec / 60)).padStart(2, '0');
  const secPart = String(sec % 60).padStart(2, '0');
  els['timer-display'].textContent = `${minPart}:${secPart}`;
  const rounds = clamp(Number(els['timer-rounds'].value), 1, 99, 5);
  els['timer-phase'].textContent = `${state.timer.phase === 'work' ? 'Trabajo' : 'Descanso'} - ronda ${Math.min(state.timer.round, rounds)} de ${rounds}${state.timer.running ? '' : ' (pausado)'}`;
}

function buildSessionData() {
  syncExerciseInputs();
  return {
    schema: 'fisio-atlas-3d-session-v1',
    exportedAt: new Date().toISOString(),
    warning: 'Evitar datos identificables del paciente en una instancia pública.',
    soap: {
      subjective: els['soap-s'].value,
      objective: els['soap-o'].value,
      assessment: els['soap-a'].value,
      plan: els['soap-p'].value,
    },
    evaluations: state.evaluations,
    exercises: state.exercises,
    painMarkers: state.painMarkers.map(({ object, ...marker }) => marker),
    goniometer: state.gonioPoints.length === 3 ? {
      points: state.gonioPoints.map(p => ({ x: p.x, y: p.y, z: p.z })),
      angle: els['angle-value'].textContent,
    } : null,
  };
}

function buildTextSummary(data) {
  const lines = [
    'FISIO ATLAS 3D - RESUMEN DE SESIÓN',
    `Fecha de exportación: ${new Date(data.exportedAt).toLocaleString('es-MX')}`,
    '',
    'S - Subjetivo', data.soap.subjective || '-', '',
    'O - Objetivo', data.soap.objective || '-', '',
    'A - Análisis clínico', data.soap.assessment || '-', '',
    'P - Plan', data.soap.plan || '-', '',
    'VALORACIONES'
  ];
  if (!data.evaluations.length) lines.push('-');
  data.evaluations.forEach((ev, i) => {
    lines.push(`${i + 1}. ${ev.jointLabel} ${ev.side} | ${ev.movementLabel}: ${ev.rom ?? 's/d'}° | Ref. ${ev.reference}° | MRC ${ev.mrc === '' ? 's/d' : ev.mrc}`);
    if (ev.tests?.length) lines.push(`   Pruebas: ${ev.tests.map(t => `${t.name}: ${translateTestResult(t.result)}${t.note ? ` (${t.note})` : ''}`).join('; ')}`);
    if (ev.notes) lines.push(`   Notas: ${ev.notes}`);
  });
  lines.push('', 'MAPA DE DOLOR');
  if (!data.painMarkers.length) lines.push('-');
  data.painMarkers.forEach((m, i) => lines.push(`${i + 1}. ${m.structure}: ${m.intensity}/10`));
  lines.push('', 'EJERCICIOS / INDICACIONES');
  if (!data.exercises.length) lines.push('-');
  data.exercises.forEach((ex, i) => lines.push(`${i + 1}. ${ex.name} | series ${ex.sets} | reps/tiempo ${ex.reps} | ${ex.frequency}`));
  lines.push('', 'Nota: herramienta de apoyo. No es software diagnóstico.');
  return lines.join('\n');
}

function importSession(data) {
  if (!data || data.schema !== 'fisio-atlas-3d-session-v1') throw new Error('Formato de sesión no reconocido.');
  els['soap-s'].value = data.soap?.subjective || '';
  els['soap-o'].value = data.soap?.objective || '';
  els['soap-a'].value = data.soap?.assessment || '';
  els['soap-p'].value = data.soap?.plan || '';
  state.evaluations = Array.isArray(data.evaluations) ? data.evaluations : [];
  state.exercises = Array.isArray(data.exercises) ? data.exercises : [];
  renderEvaluations();
  renderExercises();
  state.painMarkers.forEach(m => scene.remove(m.object));
  state.painMarkers = [];
  (data.painMarkers || []).forEach(m => {
    const p = new THREE.Vector3(Number(m.point?.x) || 0, Number(m.point?.y) || 0, Number(m.point?.z) || 0);
    const intensity = clamp(Number(m.intensity), 0, 10, 5);
    const color = new THREE.Color().setHSL(0.12 - (intensity / 10) * 0.12, 0.85, 0.56);
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .35 }));
    marker.position.copy(p);
    scene.add(marker);
    state.painMarkers.push({ ...m, intensity, point: { x: p.x, y: p.y, z: p.z }, object: marker });
  });
  renderPainList();
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function clamp(value, min, max, fallback) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]);
}

function escapeAttr(value = '') { return escapeHtml(value); }

function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.dataset.panel === btn.dataset.tab));
  }));
  document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
  document.querySelectorAll('[data-layer]').forEach(input => input.addEventListener('change', () => {
    state.layers[input.dataset.layer] = input.checked;
    applyVisibility();
  }));

  els['anatomy-search'].addEventListener('input', e => renderSearchResults(e.target.value));
  els['search-results'].addEventListener('click', e => {
    const btn = e.target.closest('[data-search-index]');
    if (!btn) return;
    const mesh = els['search-results']._matches?.[Number(btn.dataset.searchIndex)];
    if (mesh) {
      if (!mesh.visible) { state.hidden.delete(mesh); state.isolated = false; applyVisibility(); }
      selectMesh(mesh); focusOnMesh(mesh);
      els['search-results'].innerHTML = '';
      els['anatomy-search'].value = mesh.userData.__atlasName;
    }
  });

  els['focus-selected'].addEventListener('click', () => focusOnMesh());
  els['isolate-selected'].addEventListener('click', () => {
    if (!state.selected) return;
    state.isolated = !state.isolated;
    els['isolate-selected'].classList.toggle('active', state.isolated);
    els['isolate-selected'].textContent = state.isolated ? 'Salir de aislar' : 'Aislar';
    applyVisibility();
  });
  els['hide-selected'].addEventListener('click', () => {
    if (!state.selected) return;
    state.hidden.add(state.selected);
    applyVisibility();
    selectMesh(null);
  });
  els['restore-all'].addEventListener('click', () => {
    state.hidden.clear(); state.isolated = false;
    els['isolate-selected'].classList.remove('active');
    els['isolate-selected'].textContent = 'Aislar';
    document.querySelectorAll('[data-layer]').forEach(input => { input.checked = true; state.layers[input.dataset.layer] = true; });
    applyVisibility();
  });

  els['pain-tool'].addEventListener('click', togglePainMode);
  els['pain-tool-side'].addEventListener('click', togglePainMode);
  els['gonio-tool'].addEventListener('click', toggleGonioMode);
  els['clear-gonio'].addEventListener('click', clearGoniometer);
  els['pain-list'].addEventListener('click', e => {
    const btn = e.target.closest('[data-remove-pain]');
    if (!btn) return;
    const idx = state.painMarkers.findIndex(m => m.id === btn.dataset.removePain);
    if (idx >= 0) {
      scene.remove(state.painMarkers[idx].object);
      state.painMarkers.splice(idx, 1);
      renderPainList();
    }
  });

  renderer.domElement.addEventListener('pointerdown', e => { pointerDown = { x: e.clientX, y: e.clientY }; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!pointerDown) return;
    const moved = Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y);
    pointerDown = null;
    if (moved < 5 && e.button === 0) handleCanvasClick(e);
  });

  els['joint-select'].addEventListener('change', updateMovementOptions);
  els['movement-select'].addEventListener('change', updateRomReference);
  els['rom-value'].addEventListener('input', updateRomReference);
  els['evaluation-form'].addEventListener('submit', e => {
    e.preventDefault();
    const jointKey = els['joint-select'].value;
    const movementKey = els['movement-select'].value;
    const ref = romReference[jointKey]?.movements?.[movementKey];
    const romRaw = els['rom-value'].value.trim();
    const rom = romRaw === '' ? null : clamp(Number(romRaw), -30, 240, null);
    state.evaluations.push({
      joint: jointKey,
      jointLabel: romReference[jointKey].label,
      side: els['side-select'].value,
      movement: movementKey,
      movementLabel: ref.label,
      reference: ref.reference,
      rom,
      mrc: els['mrc-select'].value,
      notes: els['evaluation-notes'].value.trim(),
      tests: collectSpecialTests(),
      createdAt: new Date().toISOString(),
    });
    els['rom-value'].value = '';
    els['evaluation-notes'].value = '';
    els['mrc-select'].value = '';
    renderSpecialTests(jointKey);
    updateRomReference();
    renderEvaluations();
  });
  els['evaluation-list'].addEventListener('click', e => {
    const btn = e.target.closest('[data-remove-eval]');
    if (!btn) return;
    state.evaluations.splice(Number(btn.dataset.removeEval), 1);
    renderEvaluations();
  });

  els['add-exercise'].addEventListener('click', () => addExercise(els['exercise-template'].value));
  els['exercise-list'].addEventListener('input', syncExerciseInputs);
  els['exercise-list'].addEventListener('click', e => {
    const btn = e.target.closest('[data-remove-exercise]');
    if (!btn) return;
    syncExerciseInputs();
    state.exercises.splice(Number(btn.dataset.removeExercise), 1);
    renderExercises();
  });

  ['timer-work', 'timer-rest', 'timer-rounds'].forEach(id => els[id].addEventListener('change', resetTimer));
  els['timer-start'].addEventListener('click', startTimer);
  els['timer-pause'].addEventListener('click', () => { stopTimer(); updateTimerDisplay(); });
  els['timer-reset'].addEventListener('click', resetTimer);

  els['export-json'].addEventListener('click', () => {
    const data = buildSessionData();
    downloadFile(`fisio-sesion-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(data, null, 2), 'application/json');
  });
  els['export-txt'].addEventListener('click', () => {
    const data = buildSessionData();
    downloadFile(`fisio-resumen-${new Date().toISOString().slice(0,10)}.txt`, buildTextSummary(data), 'text/plain;charset=utf-8');
  });
  els['import-json'].addEventListener('click', () => els['import-file'].click());
  els['import-file'].addEventListener('change', async () => {
    const file = els['import-file'].files?.[0];
    if (!file) return;
    try { importSession(JSON.parse(await file.text())); }
    catch (err) { window.alert(err.message || 'No se pudo importar la sesión.'); }
    finally { els['import-file'].value = ''; }
  });
  els['print-session'].addEventListener('click', () => window.print());

  window.addEventListener('keydown', e => {
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
    if (e.key === '/') { e.preventDefault(); els['anatomy-search'].focus(); }
    if (e.key === '1') setView('front');
    if (e.key === '2') setView('back');
    if (e.key === '3') setView('left');
    if (e.key === '4') setView('right');
    if (e.key === 'Escape') { state.painMode = false; state.gonioMode = false; updateToolButtons(); }
  });
}

function resize() {
  const rect = els['three-root'].getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

const ro = new ResizeObserver(resize);
ro.observe(els['three-root']);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

initClinicalForms();
bindEvents();
resize();
animate();
loadAnatomy();
