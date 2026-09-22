export const anatomyClinical = [
  {
    key: 'deltoid', aliases: ['deltoid','deltoideus','deltoides'], name: 'Deltoides', region: 'Hombro',
    origin: 'Tercio lateral de clavícula, acromion y espina de la escápula.',
    insertion: 'Tuberosidad deltoidea del húmero.',
    action: 'Abducción del hombro; las fibras anteriores colaboran en flexión y rotación interna, y las posteriores en extensión y rotación externa.',
    innervation: 'Nervio axilar (C5-C6).', palpation: 'Palpable rodeando el contorno lateral del hombro durante abducción resistida.'
  },
  {
    key: 'supraspinatus', aliases: ['supraspinatus','supraespinoso'], name: 'Supraespinoso', region: 'Hombro',
    origin: 'Fosa supraespinosa de la escápula.', insertion: 'Faceta superior del tubérculo mayor del húmero.',
    action: 'Inicia y asiste la abducción; contribuye a la estabilización glenohumeral.', innervation: 'Nervio supraescapular (C5-C6).',
    palpation: 'Se localiza profundo al trapecio superior, en la fosa supraespinosa.'
  },
  {
    key: 'infraspinatus', aliases: ['infraspinatus','infraespinoso'], name: 'Infraespinoso', region: 'Hombro',
    origin: 'Fosa infraespinosa de la escápula.', insertion: 'Faceta media del tubérculo mayor del húmero.',
    action: 'Rotación externa y estabilización glenohumeral.', innervation: 'Nervio supraescapular (C5-C6).',
    palpation: 'Palpable en la fosa infraespinosa durante rotación externa resistida.'
  },
  {
    key: 'teres minor', aliases: ['teres minor','redondo menor'], name: 'Redondo menor', region: 'Hombro',
    origin: 'Borde lateral de la escápula.', insertion: 'Faceta inferior del tubérculo mayor del húmero.',
    action: 'Rotación externa; ayuda a la aducción y estabilización glenohumeral.', innervation: 'Nervio axilar (C5-C6).',
    palpation: 'Posterolateral de la escápula, superior al redondo mayor.'
  },
  {
    key: 'subscapularis', aliases: ['subscapularis','subescapular'], name: 'Subescapular', region: 'Hombro',
    origin: 'Fosa subescapular.', insertion: 'Tubérculo menor del húmero.', action: 'Rotación interna y estabilización glenohumeral.',
    innervation: 'Nervios subescapulares superior e inferior (C5-C7).', palpation: 'Palpación profunda en región axilar anterior, con precaución.'
  },
  {
    key: 'pectoralis major', aliases: ['pectoralis major','pectoral major','pectoral mayor'], name: 'Pectoral mayor', region: 'Tórax/Hombro',
    origin: 'Clavícula medial, esternón y cartílagos costales superiores.', insertion: 'Labio lateral del surco intertubercular del húmero.',
    action: 'Aducción y rotación interna; la porción clavicular contribuye a flexión del hombro.', innervation: 'Nervios pectorales lateral y medial (C5-T1).',
    palpation: 'Borde anterior de la axila durante aducción horizontal resistida.'
  },
  {
    key: 'latissimus dorsi', aliases: ['latissimus dorsi','dorsal ancho'], name: 'Dorsal ancho', region: 'Tronco/Hombro',
    origin: 'Fascia toracolumbar, vértebras torácicas inferiores, cresta ilíaca y costillas inferiores.', insertion: 'Suelo del surco intertubercular del húmero.',
    action: 'Extensión, aducción y rotación interna del hombro.', innervation: 'Nervio toracodorsal (C6-C8).', palpation: 'Pliegue axilar posterior durante extensión y aducción resistidas.'
  },
  {
    key: 'trapezius', aliases: ['trapezius','trapecio'], name: 'Trapecio', region: 'Cuello/Escápula',
    origin: 'Occipital, ligamento nucal y apófisis espinosas cervicales y torácicas.', insertion: 'Clavícula lateral, acromion y espina de la escápula.',
    action: 'Elevación, retracción, depresión y rotación superior de la escápula según porción.', innervation: 'Nervio accesorio (XI) y ramos cervicales C3-C4.',
    palpation: 'Porciones superior, media e inferior durante sus respectivas acciones escapulares.'
  },
  {
    key: 'biceps brachii', aliases: ['biceps brachii','biceps','bíceps braquial'], name: 'Bíceps braquial', region: 'Brazo',
    origin: 'Cabeza larga: tubérculo supraglenoideo. Cabeza corta: proceso coracoides.', insertion: 'Tuberosidad radial y aponeurosis bicipital.',
    action: 'Supinación y flexión del codo; ayuda a flexión del hombro.', innervation: 'Nervio musculocutáneo (C5-C6).',
    palpation: 'Vientre anterior del brazo con flexión de codo y supinación resistidas.'
  },
  {
    key: 'triceps brachii', aliases: ['triceps brachii','triceps','tríceps braquial'], name: 'Tríceps braquial', region: 'Brazo',
    origin: 'Cabeza larga: tubérculo infraglenoideo. Cabezas lateral y medial: cara posterior del húmero.', insertion: 'Olécranon de la ulna.',
    action: 'Extensión del codo; la cabeza larga ayuda en extensión y aducción del hombro.', innervation: 'Nervio radial (C6-C8).',
    palpation: 'Cara posterior del brazo durante extensión de codo resistida.'
  },
  {
    key: 'gluteus maximus', aliases: ['gluteus maximus','gluteo mayor','glúteo mayor'], name: 'Glúteo mayor', region: 'Cadera',
    origin: 'Ilion posterior, sacro, cóccix y ligamento sacrotuberoso.', insertion: 'Tracto iliotibial y tuberosidad glútea.',
    action: 'Extensión y rotación externa de cadera; contribuye a estabilidad pélvica.', innervation: 'Nervio glúteo inferior (L5-S2).',
    palpation: 'Región glútea durante extensión de cadera resistida.'
  },
  {
    key: 'gluteus medius', aliases: ['gluteus medius','gluteo medio','glúteo medio'], name: 'Glúteo medio', region: 'Cadera',
    origin: 'Cara externa del ilion entre líneas glúteas anterior y posterior.', insertion: 'Cara lateral del trocánter mayor.',
    action: 'Abducción y control frontal de la pelvis; fibras anteriores ayudan a rotación interna.', innervation: 'Nervio glúteo superior (L4-S1).',
    palpation: 'Superolateral de la cadera durante abducción resistida.'
  },
  {
    key: 'rectus femoris', aliases: ['rectus femoris','recto femoral'], name: 'Recto femoral', region: 'Muslo anterior',
    origin: 'Espina ilíaca anteroinferior y borde acetabular superior.', insertion: 'Patela y, a través del ligamento patelar, tuberosidad tibial.',
    action: 'Extensión de rodilla y flexión de cadera.', innervation: 'Nervio femoral (L2-L4).', palpation: 'Centro del muslo anterior durante extensión de rodilla resistida.'
  },
  {
    key: 'vastus medialis', aliases: ['vastus medialis','vasto medial'], name: 'Vasto medial', region: 'Muslo anterior',
    origin: 'Línea intertrocantérica y labio medial de la línea áspera.', insertion: 'Tendón del cuádriceps, patela y tuberosidad tibial vía ligamento patelar.',
    action: 'Extensión de rodilla y contribución al control patelar.', innervation: 'Nervio femoral (L2-L4).', palpation: 'Porción distal medial del muslo durante extensión terminal de rodilla.'
  },
  {
    key: 'vastus lateralis', aliases: ['vastus lateralis','vasto lateral'], name: 'Vasto lateral', region: 'Muslo anterior',
    origin: 'Trocánter mayor y labio lateral de la línea áspera.', insertion: 'Tendón del cuádriceps, patela y tuberosidad tibial vía ligamento patelar.',
    action: 'Extensión de rodilla.', innervation: 'Nervio femoral (L2-L4).', palpation: 'Cara anterolateral del muslo durante extensión de rodilla resistida.'
  },
  {
    key: 'biceps femoris', aliases: ['biceps femoris','bíceps femoral'], name: 'Bíceps femoral', region: 'Muslo posterior',
    origin: 'Cabeza larga: tuberosidad isquiática. Cabeza corta: línea áspera.', insertion: 'Cabeza del peroné.',
    action: 'Flexión de rodilla y rotación externa de la pierna; la cabeza larga extiende cadera.', innervation: 'Nervio ciático: división tibial y, para cabeza corta, fibular común.',
    palpation: 'Tendón posterolateral de rodilla durante flexión resistida.'
  },
  {
    key: 'semitendinosus', aliases: ['semitendinosus','semitendinoso'], name: 'Semitendinoso', region: 'Muslo posterior',
    origin: 'Tuberosidad isquiática.', insertion: 'Pata de ganso en tibia proximal medial.', action: 'Extensión de cadera, flexión de rodilla y rotación interna de la pierna.',
    innervation: 'División tibial del nervio ciático (L5-S2).', palpation: 'Tendón posteromedial de rodilla durante flexión resistida.'
  },
  {
    key: 'semimembranosus', aliases: ['semimembranosus','semimembranoso'], name: 'Semimembranoso', region: 'Muslo posterior',
    origin: 'Tuberosidad isquiática.', insertion: 'Cóndilo medial de la tibia, cara posterior.', action: 'Extensión de cadera, flexión de rodilla y rotación interna de la pierna.',
    innervation: 'División tibial del nervio ciático (L5-S2).', palpation: 'Profundo al semitendinoso en región posteromedial.'
  },
  {
    key: 'gastrocnemius', aliases: ['gastrocnemius','gastrocnemio','gemelos'], name: 'Gastrocnemio', region: 'Pierna posterior',
    origin: 'Cóndilos femorales medial y lateral.', insertion: 'Calcáneo mediante tendón de Aquiles.', action: 'Flexión plantar y asistencia en flexión de rodilla.',
    innervation: 'Nervio tibial (S1-S2).', palpation: 'Pantorrilla durante elevación de talón.'
  },
  {
    key: 'soleus', aliases: ['soleus','sóleo','soleo'], name: 'Sóleo', region: 'Pierna posterior',
    origin: 'Cabeza y cara posterior proximal del peroné; línea del sóleo en tibia.', insertion: 'Calcáneo mediante tendón de Aquiles.',
    action: 'Flexión plantar; importante en control postural.', innervation: 'Nervio tibial (S1-S2).', palpation: 'Profundo al gastrocnemio; se enfatiza con rodilla flexionada.'
  },
  {
    key: 'tibialis anterior', aliases: ['tibialis anterior','tibial anterior'], name: 'Tibial anterior', region: 'Pierna anterior',
    origin: 'Cóndilo lateral y cara lateral proximal de la tibia.', insertion: 'Cuneiforme medial y base del primer metatarsiano.',
    action: 'Dorsiflexión e inversión del pie.', innervation: 'Nervio fibular profundo (L4-L5).', palpation: 'Anterolateral a la tibia durante dorsiflexión e inversión resistidas.'
  }
];

export function getClinicalAnatomyForMesh(mesh) {
  const source = [mesh?.name, mesh?.userData?.name, mesh?.userData?.nameDetail]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return anatomyClinical.find(item => item.aliases.some(alias => source.includes(alias.toLowerCase()))) || null;
}
