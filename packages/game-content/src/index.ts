export const phases = [
  { id: 'infancia', title: 'Infância', place: 'Quarto, corredor e sala de aula', color: '#b4a183' },
  { id: 'escola', title: 'Adolescência', place: 'Escola', color: '#8ba58d' },
  { id: 'faculdade', title: 'Jovem adulto', place: 'Faculdade', color: '#8dabb7' },
  { id: 'relacionamento', title: 'Relacionamento', place: 'Apartamento', color: '#bc9692' },
  { id: 'descobertas', title: 'Descobertas e aceitação', place: 'Laboratório do pai', color: '#aca2ba' },
  { id: 'hospital', title: 'Adulto / doença', place: 'Hospital', color: '#97b5b2' },
  { id: 'campo', title: 'Campo', place: 'Campo', color: '#b7bd88' },
] as const;
export type PhaseId = typeof phases[number]['id'];
export const childhoodObjects = [
  { id: 'relogio', name: 'Relógio de presente', text: '“Para Oliver — 18 anos. Te amo, meu filho.” O relógio de adulto parece deslocado neste quarto de infância.', x: 669, y: 255, approach: { x: 660, y: 420 }, side: 'back', clue: 'Dedicatória do pai', hint: 'Há algo gravado na parte de trás da caixa.' },
  { id: 'fotografia', name: 'Fotografia com o pai', text: 'Um homem e uma criança. O rosto do homem parece escapar da memória. No verso: “Ele ficaria feliz.”', x: 227, y: 330, approach: { x: 270, y: 468 }, side: 'back', clue: 'Anotação na fotografia', hint: 'Vire a fotografia para procurar uma anotação.' },
  { id: 'desenho', name: 'Desenho do cérebro', text: '“Algumas coisas a gente esquece.” O desenho de infância faz a voz de seu pai voltar lentamente.', x: 289, y: 483, approach: { x: 290, y: 500 }, side: 'front', clue: 'Desenho de infância', hint: 'Examine o desenho e a anotação na folha.' },
] as const;
export type ObjectId = typeof childhoodObjects[number]['id'];
export const openingMemory = [
  ['Oliver', 'Pra que serve essa parte?'],
  ['Pai', 'Ela ajuda a gente a lembrar.'],
  ['Oliver', 'Então ela guarda tudo?'],
  ['Pai', 'Não. Algumas coisas a gente esquece.'],
  ['Oliver', 'Por quê?'],
  ['Pai', 'Porque nosso cérebro não consegue guardar tudo. Ele precisa deixar algumas coisas para trás.'],
  ['Oliver', 'Até as coisas importantes?'],
  ['Pai', 'Às vezes, até elas.'],
] as const;

export type FlashbackKind = 'childhood' | 'opening' | 'brain' | 'school' | 'friend' | 'apartment' | 'father' | 'relationship' | 'hospital' | 'field';
export type FlashbackStep = { kind: 'title' | 'scene' | 'brain' | 'vhs' | 'dialogue' | 'choice'; speaker?: string; text: string; accent?: string };
export const flashbacks: Record<FlashbackKind, FlashbackStep[]> = {
  childhood: [
    { kind: 'scene', text: 'O papel da escola traz de volta uma tarde no quarto.' },
    { kind: 'dialogue', speaker: 'Oliver', text: 'Pai, como é que a gente guarda uma lembrança?' },
    { kind: 'dialogue', speaker: 'Pai', text: 'Me mostra o que você desenhou. Vamos olhar juntos.' },
    { kind: 'scene', text: 'Oliver reconhece a mão do pai sobre a folha. Anos depois, ele voltaria a procurar respostas num laboratório.' },
  ],
  opening: [
    { kind: 'title', text: 'WAS', accent: 'UMA HISTÓRIA SOBRE O QUE FICA' },
    { kind: 'brain', text: 'Duas regiões se aproximam. Uma lembrança tenta se formar.' },
    { kind: 'vhs', text: 'SISTEMA DE MEMÓRIA · REGISTRO 01' },
    { kind: 'dialogue', speaker: 'Narrador', text: 'O cérebro não guarda tudo. Ele escolhe o que consegue carregar.' },
  ],
  brain: [
    { kind: 'brain', text: 'Uma nova área se ilumina enquanto Oliver tenta lembrar.' },
    { kind: 'dialogue', speaker: 'Oliver', text: 'Por que eu não consigo lembrar disso?' },
    { kind: 'dialogue', speaker: 'Consciência', text: 'Talvez a pergunta não seja o que você esqueceu, mas por quê.' },
  ],
  school: [
    { kind: 'scene', text: 'Uma redação da escola · anos atrás' },
    { kind: 'dialogue', speaker: 'Pai', text: 'Você escreveu que quer ser médico como eu. É isso mesmo que você quer?' },
    { kind: 'dialogue', speaker: 'Oliver', text: 'A resposta dele volta junto com a lembrança daquela conversa.' },
    { kind: 'brain', text: 'A pergunta do pai permanece, mesmo depois de tantos anos.' },
  ],
  friend: [
    { kind: 'scene', text: 'Faculdade · uma semana antes' },
    { kind: 'dialogue', speaker: 'Michael', text: 'Você passou mal na semana passada. Lembra do que aconteceu?' },
    { kind: 'dialogue', speaker: 'Oliver', text: 'Eu lembro de estar cansado. Acho que foi só isso.' },
    { kind: 'brain', text: 'A resposta esconde uma lacuna que Oliver ainda não consegue nomear.' },
  ],
  apartment: [
    { kind: 'scene', text: 'Uma ligação com o pai · apartamento' },
    { kind: 'dialogue', speaker: 'Oliver', text: 'Pai, precisamos conversar. Você anda distante.' },
    { kind: 'dialogue', speaker: 'Oliver', text: 'Quero entender o que está acontecendo. Posso ir ao laboratório?' },
    { kind: 'brain', text: 'Do outro lado, o silêncio do pai também faz parte da lembrança.' },
  ],
  father: [
    { kind: 'scene', text: 'Laboratório do pai · uma revelação' },
    { kind: 'dialogue', speaker: 'Pai', text: 'Você está doente, Oliver. Eu venho tentando entender o que está acontecendo.' },
    { kind: 'dialogue', speaker: 'Pai', text: 'Eu queria ter mais tempo antes de te contar.' },
    { kind: 'brain', text: 'O arquivo permanece incompleto.' },
  ],
  relationship: [
    { kind: 'scene', text: 'Uma conversa interrompida' },
    { kind: 'dialogue', speaker: 'Oliver', text: 'Eu não lembro de ter dito isso.' },
    { kind: 'dialogue', speaker: 'Consciência', text: 'Mas lembra de como se sentiu.' },
    { kind: 'brain', text: 'A área iluminada muda de lugar.' },
  ],
  hospital: [
    { kind: 'scene', text: 'Hospital · depois da cirurgia' },
    { kind: 'dialogue', speaker: 'Pai', text: 'A cirurgia terminou. Você está seguro, Oliver.' },
    { kind: 'dialogue', speaker: 'Oliver', text: 'Eu não me lembro de ter entrado aqui.' },
    { kind: 'brain', text: 'A memória começa a fechar o círculo.' },
  ],
  field: [
    { kind: 'scene', text: 'Campo · depois da chuva' },
    { kind: 'dialogue', speaker: 'Consciência', text: 'Você voltou.' },
    { kind: 'dialogue', speaker: 'Oliver', text: 'Dessa vez, eu lembro.' },
    { kind: 'brain', text: 'O cérebro inteiro se ilumina.' },
  ],
};

export type PhaseClue = { presentation?: 'context'; id: string; title: string; text: string; x: number; y: number; approach?: { x: number; y: number } };
export type PhaseObjective = { scene: string; title: string; thought: string; clues: PhaseClue[] };
export const phaseObjectives: PhaseObjective[] = [
  { scene: 'infancia-corredor', title: 'Um caminho conhecido', thought: 'O corredor parece familiar. Caminhe por ele e deixe as lembranças voltarem aos poucos.', clues: [
    { presentation: 'context', id: 'desenhos-corredor', title: 'Desenhos na parede', text: 'Desenhos infantis cobrem o mural. Oliver reconhece o jeito como contornava as figuras várias vezes.', x: 1310, y: 220, approach: { x: 1310, y: 475 } },
    { presentation: 'context', id: 'luz-corredor', title: 'Luz da manhã', text: 'A luz atravessa as janelas e cai no piso. Por um instante, Oliver se lembra de correr por aqui depois da aula.', x: 300, y: 465, approach: { x: 300, y: 475 } },
    { presentation: 'context', id: 'porta-sala-infantil', title: 'Porta da sala', text: 'A sala no fim do corredor ainda parece esperar por ele.', x: 2715, y: 310, approach: { x: 2715, y: 475 } },
  ] },
  { scene: 'infancia-sala', title: 'Vestígios da sala de aula', thought: 'Uma cadeira rabiscada, trabalhos antigos e nomes nos armários trazem um tempo mais simples de volta.', clues: [
    { id: 'cadeira-oz', title: 'Rabisco na cadeira', text: 'As iniciais O + Z foram riscadas com cuidado no encosto. Oliver não lembra quem escreveu primeiro.', x: 781, y: 278, approach: { x: 781, y: 355 } },
    { id: 'trabalho-infantil', title: 'Trabalho guardado', text: 'Um trabalho antigo pergunta o que ele quer ser quando crescer. A letra infantil diz: “médico, igual ao meu pai”.', x: 476, y: 364, approach: { x: 477, y: 382 } },
    { id: 'nomes-armarios', title: 'Armários da turma', text: 'Oliver, Zoe, Michael. Os nomes devolvem rostos e vozes que ele ainda não consegue organizar.', x: 473, y: 207, approach: { x: 470, y: 317 } },
  ] },
  { scene: 'cenario-02', title: 'O que aconteceu naquela aula?', thought: 'A sala parece familiar. Procure a redação, a bolsa e o celular para entender por que Oliver ficou até tarde.', clues: [
    { id: 'relogio-aula', title: 'Relógio parado', text: '06:00. O horário parado faz a sala parecer presa a uma manhã que Oliver não consegue lembrar.', x: 553, y: 62, approach: { x: 478, y: 405 } },
    { id: 'redacao-futuro', title: 'Redação sobre o futuro', text: 'A letra já está mais firme: “Ainda não sei o que quero fazer”. A resposta não combina com o trabalho infantil.', x: 210, y: 355, approach: { x: 350, y: 522 } },
    { id: 'bolsa-caderno', title: 'Bolsa e caderno', text: 'Dentro da bolsa há um caderno. Na folha de rosto, uma data anotada: 17/09/1990 — o aniversário de Zoe.', x: 655, y: 350, approach: { x: 570, y: 522 } },
    { id: 'celular-antigo', title: 'Celular antigo', text: 'O celular de Oliver guarda mensagens de Zoe e de Michael. A tela está quebrada, mas ainda acende.', x: 622, y: 485, approach: { x: 620, y: 522 } },
    { id: 'prova-anatomia', title: 'Prova na bancada de Zoe', text: 'A prova de anatomia tem uma nota baixa e o nome de Oliver. O envelope tem a etiqueta do armário de Zoe. Alguém já o deixou sobre a bancada.', x: 839, y: 355, approach: { x: 842, y: 523 } },
  ] },
  { scene: 'faculdade-laboratorio', title: 'Uma lacuna na faculdade', thought: 'Relatórios, radiografias e remédios para dor de cabeça cercam Oliver. O relógio parou às 05:00.', clues: [
    { id: 'relatorios-faculdade', title: 'Relatórios médicos', text: 'Os relatórios descrevem sintomas que Oliver reconhece, mas não se lembra de ter contado a ninguém.', x: 340, y: 430, approach: { x: 300, y: 490 } },
    { id: 'raio-x-faculdade', title: 'Radiografia', text: 'A imagem tem uma marcação à mão. Oliver tenta se convencer de que é apenas material de estudo.', x: 660, y: 280, approach: { x: 790, y: 485 } },
    { id: 'relogio-faculdade', title: 'Relógio parado às 05:00', text: 'Outra madrugada de estudo. Na mesa, os comprimidos para dor de cabeça estão quase acabando.', x: 850, y: 120, approach: { x: 850, y: 485 } },
  ] },
  { scene: 'cenario-03', title: 'Reconstruir o cotidiano', thought: 'Os objetos da casa guardam sinais de uma rotina que Oliver não consegue organizar.', clues: [
    { id: 'caneca', title: 'Caneca esquecida', text: 'O café esfriou há muito tempo. Oliver reconhece o hábito de começar uma tarefa e esquecer por que entrou na sala.', x: 300, y: 510 },
    { id: 'controle-tv', title: 'Controle remoto', text: 'A televisão ficou ligada na mesma tela. O silêncio da casa parece maior do que a lembrança.', x: 600, y: 510 },
    { id: 'relogio-sala', title: 'Despertador marcando 04:00', text: 'Mais uma madrugada sem dormir. O relógio liga esta casa às noites de estudo.', x: 800, y: 510 },
  ] },
  { scene: 'cenario-04', title: 'Encontrar o fio da memória', thought: 'As fotografias parecem formar uma história. Descubra qual imagem Oliver reconhece.', clues: [
    { id: 'foto-parede', title: 'Fotografia antiga', text: 'Um rosto conhecido aparece no quadro. A lembrança vem primeiro como sensação, depois como imagem.', x: 350, y: 470 },
    { id: 'bilhete-parede', title: 'Bilhete preso à parede', text: 'Uma anotação curta: “perguntar ao pai”. Oliver não lembra quando escreveu isso.', x: 500, y: 480 },
    { id: 'quadro-anatomia', title: 'Desenho anatômico', text: 'O desenho remete aos estudos do pai e aponta para o laboratório.', x: 690, y: 470 },
  ] },
  { scene: 'cenario-05', title: 'Perceber o que mudou em casa', thought: 'A cozinha está arrumada, mas pequenos detalhes revelam uma ausência.', clues: [
    { id: 'foto-geladeira', title: 'Fotografia na geladeira', text: 'Uma foto de família está presa entre os lembretes da geladeira. Oliver reconhece a letra do pai no verso.', x: 211, y: 184, approach: { x: 370, y: 469 } },
    { id: 'bilhete-cozinha', title: 'Bilhete na bancada', text: '“Volto tarde do laboratório.” A frase explica as noites em que Oliver esperava acordado.', x: 350, y: 465 },
    { id: 'mesa-cozinha', title: 'Mesa posta para dois', text: 'Há dois lugares, embora Oliver se lembrasse de jantar sozinho. A memória começa a se corrigir.', x: 560, y: 500 },
  ] },
  { scene: 'cenario-06', title: 'Descobrir o segredo do pai', thought: 'O laboratório contém a resposta que Oliver teme encontrar. Examine os vestígios de trabalho.', clues: [
    { id: 'diario-pai', title: 'Anotações na escrivaninha', text: 'Entre os livros e as folhas, Oliver reconhece a letra do pai: “Ainda não contei ao Oliver.” A revelação não foi falta de confiança; foi uma tentativa de protegê-lo.', x: 388, y: 264, approach: { x: 335, y: 470 } },
    { id: 'microscopio-pai', title: 'Microscópio na bancada central', text: 'A lâmina foi preparada pelo pai. As notas ao lado descrevem a progressão da doença e a perda de memória.', x: 605, y: 310, approach: { x: 555, y: 468 } },
    { id: 'exames-pai', title: 'Mural de exames e anotações', text: 'Os resultados no mural indicam uma doença neurológica. As linhas conectadas mostram que o pai investigava a condição de Oliver em segredo.', x: 716, y: 182, approach: { x: 815, y: 455 } },
  ] },
  { scene: 'cenario-07', title: 'Entender a lembrança do hospital', thought: 'A imagem da cirurgia está fragmentada. Reúna os detalhes antes de falar com a consciência.', clues: [
    { id: 'monitor-hospital', title: 'Monitor clínico', text: 'Os sinais vitais estão estáveis. Oliver lembra de acordar sem saber quanto tempo passou.', x: 390, y: 465 },
    { id: 'prontuario', title: 'Prontuário', text: 'O procedimento já terminou. A letra do pai aparece nas observações anexadas ao prontuário.', x: 480, y: 495 },
    { id: 'porta-hospital', title: 'Porta da ala', text: 'Do outro lado alguém espera. A lembrança não é só sobre doença, também é sobre presença.', x: 700, y: 480 },
  ] },
  { scene: 'cenario-08', title: 'Aceitar o que permanece', thought: 'No campo, Oliver pode olhar para a lembrança sem fugir dela.', clues: [
    { id: 'passos-campo', title: 'Pegadas na grama', text: 'Duas trilhas caminharam lado a lado. Oliver se lembra do pai ensinando-o a seguir em frente.', x: 320, y: 450 },
    { id: 'flor-campo', title: 'Flor entre a grama', text: 'Uma pequena coisa resiste ao tempo. A memória não precisa ser perfeita para ser verdadeira.', x: 520, y: 470 },
    { id: 'horizonte-campo', title: 'Luz no horizonte', text: 'O sol atravessa as nuvens. Oliver aceita que algumas respostas chegam junto com a despedida.', x: 740, y: 445 },
  ] },
];


