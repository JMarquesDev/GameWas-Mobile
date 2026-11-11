export function NotebookPasswordClue({ foundEssay, foundClock }: { foundEssay: boolean; foundClock: boolean }) {
  const found = 1 + Number(foundEssay) + Number(foundClock);
  return <section className="phone-password-puzzle" aria-label="Enigma da página rasgada no caderno">
    <div className="phone-torn-page">
      <p className="eyebrow">BILHETE RASGADO · ZOE</p>
      <p>“Se esquecer a senha, lembre do meu aniversário. O dia ficou na página que marquei. O mês está na margem da sua redação. O ano ficou no calendário perto do relógio.”</p>
      <div className="phone-torn-date" aria-label="Data incompleta">__ / __ / 19__</div>
    </div>
    <div className="phone-evidence" aria-label="Pistas encontradas">
      <div className="found"><small>CADERNO</small><strong>Página 17 ♥</strong></div>
      <div className={foundEssay ? 'found' : ''}><small>REDAÇÃO</small><strong>{foundEssay ? 'O nono mês' : 'Ainda não examinada'}</strong></div>
      <div className={foundClock ? 'found' : ''}><small>CALENDÁRIO</small><strong>{foundClock ? 'Ano da turma: 1990' : 'Ainda não observado'}</strong></div>
    </div>
    <p className="inspection-help" role="status">{found === 3 ? 'As três pistas estão reunidas. Descubra a data e use os oito números no celular, sem barras.' : `${found}/3 pistas encontradas. Investigue os objetos indicados no bilhete e volte ao caderno.`}</p>
  </section>;
}
