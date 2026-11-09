export type Puzzle = { id: string; title: string; evidence: string; questions: string[]; options: string[]; answers: number[]; focus?: boolean };
export const puzzles: Record<string, Puzzle[]> = {
 infancia: [
 {id:'desenho',title:'Montar o desenho',evidence:'A folha foi rasgada em três partes. Encaixe as faixas na ordem certa para recuperar o desenho do cérebro.',questions:['Faixa superior','Faixa central','Faixa inferior'],options:['Parte inferior','Parte superior','Parte central'],answers:[1,2,0]}],
 'cenario-02': [
 {id:'iniciais',title:'As iniciais escondidas',evidence:'Na cadeira: O + Z. As etiquetas dos armários mostram Oliver, Zoe e Michael.',questions:['Qual armário corresponde à segunda inicial?'],options:['Michael','Zoe','Oliver'],answers:[1]},
 {id:'conversa',title:'Conversa incompleta',evidence:'Ordene as mensagens: primeiro vem a pergunta sobre o trabalho; depois a resposta; por último, o pedido para buscar o que ficou guardado.',questions:['Primeiro','Depois','Por fim'],options:['Michael: pega no armário da Zoe.','Zoe: trouxe o trabalho?','Oliver: deixei guardado na escola.'],answers:[1,2,0]}],
 'faculdade-laboratorio': [
 {id:'agenda',title:'A ordem dos acontecimentos',evidence:'A agenda registra: segunda, estudo até tarde; terça, mal-estar durante a aula; quarta, repouso em casa.',questions:['Primeiro','Depois','Por fim'],options:['Repouso em casa','Estudo até tarde','Mal-estar na aula'],answers:[1,2,0]},
 {id:'prova',title:'Revisar a prova',evidence:'A anotação de estudo diz: o hipocampo participa da formação de novas memórias. A questão pede qual estrutura se relaciona a essa função.',questions:['Qual resposta corresponde à anotação?'],options:['Cerebelo','Hipocampo','Medula espinal'],answers:[1]}],
 'cenario-03': [{id:'rotina-apartamento',title:'Reconstruir a rotina',evidence:'A caneca esquecida indica a rotina de Oliver. O controle mostra o silêncio da sala. O despertador parado às 04:00 liga as noites mal dormidas ao estudo.',questions:['Café esquecido','Sala em silêncio','Madrugada de estudo'],options:['Caneca na mesa de centro','Controle remoto junto à TV','Despertador marcando 04:00'],answers:[0,1,2]}],
 'cenario-04': [{id:'fotografias',title:'O mesmo lugar',evidence:'Foto A: Oliver diante de uma janela com estrela no canto. Foto B: uma rua de tijolos. Foto C: Santiago diante da mesma janela, com a estrela no mesmo canto.',questions:['Qual par compartilha o cenário?'],options:['A + B','B + C','A + C'],answers:[2]}],
 'cenario-05': [{id:'bilhetes',title:'Bilhetes da geladeira',evidence:'Três fotografias: café com Zoe; mesa de pesquisa de Santiago; Oliver com mochila. Relacione os lembretes aos detalhes de cada imagem.',questions:['Não esquecer o trabalho','Tomar café juntos','Perguntar sobre os exames'],options:['Mesa de pesquisa','Oliver com mochila','Café com Zoe'],answers:[1,2,0]}],
 'cenario-06': [
 {id:'registros',title:'Registros de Santiago',evidence:'O diário começa observando sintomas, passa à pesquisa das causas e termina registrando descobertas.',questions:['Primeiro','Depois','Por fim'],options:['Registro das descobertas','Observação dos sintomas','Pesquisa'],answers:[1,2,0]},
 {id:'microscopio',title:'Ajustar o microscópio',evidence:'A anotação na bancada menciona a lâmina B-17. Ajuste o foco até conseguir ler a identificação e compare com o registro.',questions:['Qual identificação aparece na lâmina?'],options:['B-71','D-17','B-17'],answers:[2],focus:true}],
 'cenario-07': [
 {id:'prontuario',title:'Organizar o prontuário',evidence:'O primeiro registro é da internação; o seguinte descreve o procedimento; o último registra o despertar.',questions:['Primeiro','Depois','Por fim'],options:['Despertar','Internação','Procedimento'],answers:[1,2,0]},
 {id:'foto-hospital',title:'A anotação no verso',evidence:'No verso da fotografia: “Fiquei aqui até você abrir os olhos”. O prontuário reúne admissão, procedimento e recuperação.',questions:['A qual registro a anotação se conecta?'],options:['Recuperação','Admissão','Procedimento'],answers:[0]}],
};

