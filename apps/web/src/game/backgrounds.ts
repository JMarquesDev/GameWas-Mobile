// Mapa cronológico de cenários e das sete fases narrativas do documento.
export const backgrounds = [
  { key: 'infancia', title: '01 — Quarto da infância', file: 'infancia-quarto-v7.png', phase: 0 },
  { key: 'infancia-corredor', title: '02 — Corredor da escola', file: 'corredor-tres-trechos.png', phase: 0 },
  { key: 'infancia-sala', title: '03 — Sala de aula · infância', file: 'infancia-sala-aula-v2.png', phase: 0 },
  { key: 'cenario-02', title: '04 — Laboratório escolar · 04:00', file: 'cena-02-laboratorio-aula-v2.png', phase: 1 },
  { key: 'faculdade-laboratorio', title: '05 — Laboratório da faculdade · 05:00', file: 'cena-03-laboratorio-faculdade-v1.png', phase: 2 },
  { key: 'cenario-03', title: '06 — Apartamento · sala de estar', file: 'cena-03-sala-estar-v2.png', phase: 3 },
  { key: 'cenario-04', title: '07 — Apartamento · parede de quadros', file: 'cena-04-parede-quadros-v2.png', phase: 3 },
  { key: 'cenario-05', title: '08 — Apartamento · cozinha', file: 'cena-05-cozinha-v3.jpg', phase: 3 },
  { key: 'cenario-06', title: '09 — Laboratório do pai', file: 'cena-06-laboratorio-pai-v3.jpg', phase: 4 },
  { key: 'cenario-07', title: '10 — Hospital', file: 'cena-07-hospital-v2.png', phase: 5 },
  { key: 'cenario-08', title: '11 — Campo', file: 'cena-08-campo-v2.png', phase: 6 },
] as const;

// Dimensões dos arquivos ativos: o canvas acompanha a proporção de cada arte.
const dimensions: Record<string, readonly [number, number]> = {
  infancia: [1860, 846], 'infancia-corredor': [941, 1672 / 3], 'infancia-sala': [1672, 941],
  'cenario-02': [1833, 858], 'faculdade-laboratorio': [1672, 941], 'cenario-03': [1891, 831],
  'cenario-04': [1939, 811], 'cenario-05': [1600, 669],
  'cenario-06': [1600, 827], 'cenario-07': [1744, 902], 'cenario-08': [1932, 814],
};
export function sceneSize(key: string) {
  const [width, height] = dimensions[key] ?? dimensions.infancia;
  return { width: 960, height: 960 * height / width };
}
