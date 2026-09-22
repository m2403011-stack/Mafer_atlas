export const romReference = {
  shoulder: {
    label: 'Hombro', movements: {
      flexion: { label: 'Flexión', reference: 180 },
      extension: { label: 'Extensión', reference: 60 },
      abduction: { label: 'Abducción', reference: 180 },
      externalRotation: { label: 'Rotación externa', reference: 90 },
      internalRotation: { label: 'Rotación interna', reference: 90 }
    }
  },
  elbow: {
    label: 'Codo', movements: {
      flexion: { label: 'Flexión', reference: 150 },
      extension: { label: 'Extensión', reference: 0 },
      pronation: { label: 'Pronación', reference: 80 },
      supination: { label: 'Supinación', reference: 80 }
    }
  },
  wrist: {
    label: 'Muñeca', movements: {
      flexion: { label: 'Flexión', reference: 80 },
      extension: { label: 'Extensión', reference: 70 },
      radialDeviation: { label: 'Desviación radial', reference: 20 },
      ulnarDeviation: { label: 'Desviación cubital', reference: 50 }
    }
  },
  hip: {
    label: 'Cadera', movements: {
      flexion: { label: 'Flexión', reference: 120 },
      extension: { label: 'Extensión', reference: 20 },
      abduction: { label: 'Abducción', reference: 45 },
      adduction: { label: 'Aducción', reference: 30 },
      externalRotation: { label: 'Rotación externa', reference: 45 },
      internalRotation: { label: 'Rotación interna', reference: 40 }
    }
  },
  knee: {
    label: 'Rodilla', movements: {
      flexion: { label: 'Flexión', reference: 135 },
      extension: { label: 'Extensión', reference: 0 }
    }
  },
  ankle: {
    label: 'Tobillo', movements: {
      dorsiflexion: { label: 'Dorsiflexión', reference: 20 },
      plantarflexion: { label: 'Flexión plantar', reference: 45 },
      inversion: { label: 'Inversión', reference: 30 },
      eversion: { label: 'Eversión', reference: 20 }
    }
  }
};

export const mrcGrades = [
  { value: 0, label: '0 - Sin contracción visible o palpable' },
  { value: 1, label: '1 - Contracción visible/palpable, sin movimiento' },
  { value: 2, label: '2 - Movimiento con gravedad eliminada' },
  { value: 3, label: '3 - Movimiento contra gravedad' },
  { value: 4, label: '4 - Movimiento contra gravedad y resistencia' },
  { value: 5, label: '5 - Fuerza considerada normal para el músculo evaluado' }
];

export const specialTests = {
  shoulder: [
    { id: 'hawkins', name: 'Hawkins-Kennedy', purpose: 'Provocación subacromial', procedure: 'Hombro y codo a 90°, aplicar rotación interna pasiva de hombro.', note: 'Un resultado positivo es un dato clínico de provocación, no un diagnóstico aislado.' },
    { id: 'jobe', name: 'Jobe / Empty Can', purpose: 'Evaluación clínica del supraespinoso', procedure: 'Abducción en plano escapular con pulgares hacia abajo; aplicar resistencia descendente.', note: 'Registrar dolor, debilidad o ambos.' },
    { id: 'apprehension', name: 'Aprehensión anterior', purpose: 'Inestabilidad glenohumeral anterior', procedure: 'En supino, llevar a abducción y rotación externa de forma controlada.', note: 'Detener ante aprehensión marcada o síntomas intensos.' }
  ],
  elbow: [
    { id: 'cozen', name: 'Cozen', purpose: 'Provocación del origen extensor lateral', procedure: 'Resistir extensión y desviación radial de muñeca con codo estabilizado.', note: 'Registrar localización exacta del dolor.' },
    { id: 'valgus', name: 'Estrés en valgo', purpose: 'Evaluación del complejo ligamentario medial', procedure: 'Aplicar estrés en valgo de forma gradual con el codo ligeramente flexionado.', note: 'Comparar con lado contralateral y registrar dolor/laxitud.' }
  ],
  hip: [
    { id: 'faber', name: 'FABER', purpose: 'Provocación de cadera/región sacroilíaca', procedure: 'Flexión, abducción y rotación externa; descender suavemente la rodilla.', note: 'Interpretar según localización del dolor y movilidad comparativa.' },
    { id: 'fadir', name: 'FADIR', purpose: 'Provocación de cadera anterior', procedure: 'Flexión, aducción y rotación interna de cadera.', note: 'Un resultado positivo no identifica por sí solo una lesión específica.' },
    { id: 'trendelenburg', name: 'Trendelenburg', purpose: 'Control frontal de pelvis', procedure: 'Apoyo unipodal y observación de la pelvis y estrategia del tronco.', note: 'Registrar lado de apoyo y compensaciones.' }
  ],
  knee: [
    { id: 'lachman', name: 'Lachman', purpose: 'Evaluación clínica del LCA', procedure: 'Rodilla en ligera flexión; estabilizar fémur y trasladar tibia anteriormente.', note: 'Registrar excursión y sensación terminal comparada.' },
    { id: 'mcmurray', name: 'McMurray', purpose: 'Provocación meniscal', procedure: 'Flexionar rodilla, combinar rotación tibial con valgo/varo durante extensión controlada.', note: 'Registrar dolor, chasquido y localización.' },
    { id: 'valgus_knee', name: 'Estrés en valgo de rodilla', purpose: 'Complejo ligamentario medial', procedure: 'Aplicar estrés en valgo a 0° y ligera flexión, comparando ambos lados.', note: 'Evitar maniobras agresivas en lesión aguda.' }
  ],
  ankle: [
    { id: 'anterior_drawer_ankle', name: 'Cajón anterior de tobillo', purpose: 'Evaluación del complejo ligamentario lateral', procedure: 'Estabilizar tibia y trasladar calcáneo/pie anteriormente.', note: 'Comparar laxitud y sensación terminal.' },
    { id: 'talar_tilt', name: 'Talar tilt', purpose: 'Provocación ligamentaria lateral/medial', procedure: 'Aplicar inversión o eversión controlada del retropié.', note: 'Registrar dolor y laxitud comparativa.' },
    { id: 'thompson', name: 'Thompson', purpose: 'Continuidad funcional del tendón de Aquiles', procedure: 'Paciente en prono; comprimir la pantorrilla y observar respuesta de flexión plantar.', note: 'Ante sospecha aguda importante, derivar según contexto clínico.' }
  ]
};

export const exerciseTemplates = [
  'Isométrico de cuádriceps', 'Puente de glúteo', 'Abducción de cadera', 'Elevación de talones',
  'Dorsiflexión con banda', 'Rotación externa de hombro con banda', 'Retracción escapular',
  'Deslizamiento de pared', 'Sentadilla asistida', 'Step-up', 'Movilidad activa de tobillo', 'Caminata'
];
