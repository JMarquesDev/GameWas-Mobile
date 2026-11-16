import { useState } from 'react';
import { Modal } from './Modal';

const team = [
  { role: 'Desenvolvimento e gestão do grupo', names: ['João Pedro'] },
  { role: 'Marketing', names: ['Ester Valeriano', 'Isadora Berganton', 'Giovana Santos', 'Heloisa Aparecida'] },
  { role: 'Adaptação mobile', names: ['Guilherme Guerra', 'Emanuel Lara', 'Kevin', 'Camila Saori'] },
  { role: 'Produto · regras, mecânicas e fluxo do jogo', names: ['Alexandre Junior', 'João Pedro', 'Guilherme Parreira'] },
  { role: 'Identidade visual', names: ['Marília Torres', 'Miguel Augusto', 'Beatriz Gomes', 'Giovanna Faria', 'Gabriella Fernandes'] },
];

const memories = [
  { image: 'infancia-quarto-v7.png', title: 'As primeiras perguntas', text: 'No quarto, Oliver perguntava ao pai como o cérebro guardava as lembranças. Ainda havia tanto para descobrir.' },
  { image: 'infancia-sala-aula-v2.png', title: 'Os nomes que ficaram', text: 'Vieram a escola, os amigos e as iniciais de Zoe numa cadeira. Pequenos gestos que ele levaria consigo.' },
  { image: 'cena-02-laboratorio-aula-v2.png', title: 'Um futuro por escolher', text: 'Entre estudos e noites longas, Oliver tentou encontrar o próprio caminho. Nem sempre soube dizer quando precisava de ajuda.' },
  { image: 'cena-03-sala-estar-v2.png', title: 'Uma vida compartilhada', text: 'Com Zoe, a vida também aconteceu nas coisas comuns: uma conversa, uma refeição, alguém esperando por ele.' },
  { image: 'cena-06-laboratorio-pai-v3.jpg', title: 'O cuidado do pai', text: 'O pai procurou respostas nos exames e nas anotações. Por trás de cada tentativa, havia o medo de perder o filho.' },
  { image: 'cena-07-hospital-v2.png', title: 'Quem permaneceu perto', text: 'No hospital, nem tudo voltou à memória. Mas Oliver não atravessou aqueles dias sozinho.' },
  { image: 'cena-08-campo-final-v3.png', title: 'O que permanece', text: 'Oliver chega ao fim dessas lembranças. Houve medo, dúvidas e coisas que ficaram por dizer. Também houve amor. Essa vida foi sua.' },
];

export function EndingSequence({ choice, onFinish }: { choice: 'remember' | 'release' | 'credits'; onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const [credits, setCredits] = useState(choice === 'credits');
  const current = memories[step];
  return <Modal open title={credits ? 'Créditos' : choice === 'remember' ? 'Uma vida em lembranças' : 'Deixar partir'} onClose={() => setCredits(true)} className={`ending-sequence ${choice === 'release' && !credits ? 'ending-release' : ''}`}>
    {credits ? <section className="ending-credits" aria-label="Créditos do WAS"><div className="credits-viewport"><div className="credits-roll"><p className="eyebrow">CRÉDITOS</p><h2>WAS</h2><p>Memórias de Oliver</p><div className="credits-team">{team.map(group => <section key={group.role}><h3>{group.role}</h3><ul>{group.names.map(name => <li key={name}>{name}</li>)}</ul></section>)}</div><p>Obrigado por acompanhar Oliver.</p></div></div><button className="credits-exit" onClick={onFinish}>Voltar ao menu</button></section>
      : choice === 'release' ? <section className="ending-content"><button className="secondary" onClick={() => setCredits(true)}>Continuar</button></section>
      : <><img key={current.image} className="ending-art" src={`/assets/backgrounds/${current.image}`} alt=""/><section className="ending-content" key={step}><p className="eyebrow">UMA VIDA EM LEMBRANÇAS · {step + 1}/{memories.length}</p><h2>{current.title}</h2><p aria-live="polite">{current.text}</p><button onClick={() => step === memories.length - 1 ? setCredits(true) : setStep(value => value + 1)}>{step === memories.length - 1 ? 'Ver créditos' : 'Continuar'}</button><button className="text-button" onClick={() => setCredits(true)}>Ir aos créditos</button></section></>}
  </Modal>;
}
