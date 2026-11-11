export type Puzzle = { id: string; title: string; evidence: string; questions: string[]; options: string[]; answers: number[]; focus?: boolean };
export const puzzles: Record<string, Puzzle[]> = {
 infancia: [
 {id:'desenho',title:'Reconstruir o desenho',evidence:'Os pedaços da folha estavam no estojo. Aproxime as bordas e siga os traços de lápis para recompor o desenho.',questions:['Contorno externo','Curvas internas','Haste na base'],options:['Tronco','Silhueta','Dobras'],answers:[1,2,0]}],
 'infancia-sala': [
 {id:'trabalho-infantil',title:'O que Oliver queria ser?',evidence:'O rabisco O + Z está na cadeira. O trabalho infantil fala em ser médico como o pai, e os armários ainda guardam o nome de Michael.',questions:['A inicial Z','O sonho no trabalho','O outro colega'],options:['Michael','Zoe','Médico'],answers:[1,2,0]}],
 'cenario-02': [
 {id:'iniciais',title:'As iniciais escondidas',evidence:'Na cadeira: O + Z. As etiquetas dos armários mostram Oliver, Zoe e Michael.',questions:['Qual armário corresponde à segunda inicial?'],options:['Michael','Zoe','Oliver'],answers:[1]},
 {id:'conversa',title:'Conversa incompleta',evidence:'Ordene as mensagens: primeiro vem a pergunta sobre o trabalho; depois a resposta; por último, o pedido para buscar o que ficou guardado.',questions:['Primeiro','Depois','Por fim'],options:['Michael: pega no armário da Zoe.','Zoe: trouxe o trabalho?','Oliver: deixei guardado na escola.'],answers:[1,2,0]}],
 'cenario-03': [
 {id:'rotina',title:'Fragmentos da madrugada',evidence:'A caneca de café ficou esquecida, a televisão permaneceu ligada e o despertador marca 04:00. Relacione cada vestígio ao que Oliver tenta lembrar.',questions:['Hora da madrugada','Tarefa interrompida','Silêncio da sala'],options:['Caneca esquecida','Televisão ligada','Relógio às 04:00'],answers:[2,0,1]}],
 'cenario-04': [{id:'fotografias',title:'O mesmo lugar',evidence:'Foto A: Oliver diante de uma janela com estrela no canto. Foto B: uma rua de tijolos. Foto C: Santiago diante da mesma janela, com a estrela no mesmo canto.',questions:['Qual par compartilha o cenário?'],options:['A + B','B + C','A + C'],answers:[2]}],
 'cenario-05': [{id:'bilhetes',title:'Bilhetes da geladeira',evidence:'Três fotografias: café com Zoe; mesa de pesquisa de Santiago; Oliver com mochila. Relacione os lembretes aos detalhes de cada imagem.',questions:['Não esquecer o trabalho','Tomar café juntos','Perguntar sobre os exames'],options:['Mesa de pesquisa','Oliver com mochila','Café com Zoe'],answers:[1,2,0]}],
 'cenario-06': [
 {id:'registros',title:'Registros de Santiago',evidence:'O diário começa observando sintomas, passa à pesquisa das causas e termina registrando descobertas.',questions:['Primeiro','Depois','Por fim'],options:['Registro das descobertas','Observação dos sintomas','Pesquisa'],answers:[1,2,0]},
 {id:'microscopio',title:'Ajustar o microscópio',evidence:'A anotação na bancada menciona a lâmina B-17. Ajuste o foco até conseguir ler a identificação e compare com o registro.',questions:['Qual identificação aparece na lâmina?'],options:['B-71','D-17','B-17'],answers:[2],focus:true}],
 'cenario-07': [
 {id:'prontuario',title:'Organizar o prontuário',evidence:'O primeiro registro é da internação; o seguinte descreve o procedimento; o último registra o despertar.',questions:['Primeiro','Depois','Por fim'],options:['Despertar','Internação','Procedimento'],answers:[1,2,0]},
 {id:'foto-hospital',title:'A anotação no verso',evidence:'No verso da fotografia: “Fiquei aqui até você abrir os olhos”. O prontuário reúne admissão, procedimento e recuperação.',questions:['A qual registro a anotação se conecta?'],options:['Recuperação','Admissão','Procedimento'],answers:[0]}],
 'cenario-08': [
 {id:'campo',title:'O que permanece',evidence:'No campo, Oliver vê duas trilhas lado a lado, uma flor que resistiu e a luz depois da chuva. Cada detalhe completa uma parte da lembrança.',questions:['As duas trilhas','A flor','A luz no horizonte'],options:['Aceitar a despedida','Caminhar com o pai','Uma memória imperfeita que permanece'],answers:[1,2,0]}],
};

