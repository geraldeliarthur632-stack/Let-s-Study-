import { GradeLevel, Question, SubjectId, SubjectInfo, TopicLesson, DifficultyLevel } from '../types';

export const GRADE_LABELS: Record<GradeLevel, { short: string; full: string; stage: string; previousGrade: GradeLevel | null }> = {
  '1_fund': { short: '1º Ano', full: '1º Ano do Ensino Fundamental', stage: 'Fund. I', previousGrade: null },
  '2_fund': { short: '2º Ano', full: '2º Ano do Ensino Fundamental', stage: 'Fund. I', previousGrade: '1_fund' },
  '3_fund': { short: '3º Ano', full: '3º Ano do Ensino Fundamental', stage: 'Fund. I', previousGrade: '2_fund' },
  '4_fund': { short: '4º Ano', full: '4º Ano do Ensino Fundamental', stage: 'Fund. I', previousGrade: '3_fund' },
  '5_fund': { short: '5º Ano', full: '5º Ano do Ensino Fundamental', stage: 'Fund. I', previousGrade: '4_fund' },
  '6_fund': { short: '6º Ano', full: '6º Ano do Ensino Fundamental', stage: 'Fund. II', previousGrade: '5_fund' },
  '7_fund': { short: '7º Ano', full: '7º Ano do Ensino Fundamental', stage: 'Fund. II', previousGrade: '6_fund' },
  '8_fund': { short: '8º Ano', full: '8º Ano do Ensino Fundamental', stage: 'Fund. II', previousGrade: '7_fund' },
  '9_fund': { short: '9º Ano', full: '9º Ano do Ensino Fundamental', stage: 'Fund. II', previousGrade: '8_fund' },
  '1_medio': { short: '1º EM', full: '1ª Série do Ensino Médio', stage: 'Médio', previousGrade: '9_fund' },
  '2_medio': { short: '2º EM', full: '2ª Série do Ensino Médio', stage: 'Médio', previousGrade: '1_medio' },
  '3_medio': { short: '3º EM', full: '3ª Série do Ensino Médio', stage: 'Médio', previousGrade: '2_medio' },
  'enem': { short: 'ENEM', full: 'Pré-Vestibular & ENEM', stage: 'Avançado', previousGrade: '3_medio' },
};

export const SUBJECTS: SubjectInfo[] = [
  {
    id: 'matematica',
    name: 'Matemática',
    icon: 'Calculator',
    color: 'from-amber-500 to-orange-600',
    description: 'Números, operações, álgebra, geometria e raciocínio lógico.',
  },
  {
    id: 'portugues',
    name: 'Língua Portuguesa',
    icon: 'BookOpen',
    color: 'from-blue-500 to-indigo-600',
    description: 'Gramática, interpretação de texto, ortografia e literatura.',
  },
  {
    id: 'ciencias',
    name: 'Ciências da Natureza',
    icon: 'Atom',
    color: 'from-emerald-500 to-teal-600',
    description: 'Corpo humano, ecossistemas, química e física do cotidiano.',
  },
  {
    id: 'historia',
    name: 'História',
    icon: 'Hourglass',
    color: 'from-rose-500 to-red-600',
    description: 'História do Brasil, civilizações antigas e fatos do mundo.',
  },
  {
    id: 'geografia',
    name: 'Geografia',
    icon: 'Globe',
    color: 'from-cyan-500 to-blue-600',
    description: 'Mapas, relevo, clima, vegetação e geopolítica mundial.',
  },
  {
    id: 'fisica',
    name: 'Física',
    icon: 'Zap',
    color: 'from-violet-500 to-purple-600',
    description: 'Mecânica, energia, óptica, eletricidade e ondas.',
  },
  {
    id: 'quimica',
    name: 'Química',
    icon: 'FlaskConical',
    color: 'from-pink-500 to-rose-600',
    description: 'Matéria, reações, tabela periódica e transformações.',
  },
  {
    id: 'biologia',
    name: 'Biologia',
    icon: 'Dna',
    color: 'from-teal-500 to-emerald-600',
    description: 'Células, genética, evolução e ecologia.',
  },
  {
    id: 'ingles',
    name: 'Língua Inglesa',
    icon: 'Languages',
    color: 'from-sky-500 to-indigo-600',
    description: 'Vocabulário, conversação, gramática e interpretação em inglês.',
  },
];

export const HIGH_SCHOOL_GRADES: GradeLevel[] = ['1_medio', '2_medio', '3_medio', 'enem'];

export function getSubjectsForGrade(grade?: GradeLevel | string): SubjectInfo[] {
  const isHighSchool = grade && HIGH_SCHOOL_GRADES.includes(grade as GradeLevel);
  if (isHighSchool) {
    // No Ensino Médio (1º, 2º, 3º ano e ENEM), Ciências da Natureza se divide em Física, Química e Biologia
    return SUBJECTS.filter((s) => s.id !== 'ciencias');
  } else {
    // No Ensino Fundamental (1º ao 9º ano), Física, Biologia e Química são integradas em Ciências da Natureza
    return SUBJECTS.filter((s) => !['fisica', 'quimica', 'biologia'].includes(s.id));
  }
}

// Rich lesson topics with didactic explanations and 5 questions each
export const SAMPLE_LESSONS: TopicLesson[] = [
  // 6º ano - Matemática - Frações
  {
    id: 'mat_6_fracoes',
    subject: 'matematica',
    grade: '6_fund',
    title: 'Frações e Divisão em Partes Iguais',
    summary:
      'Uma fração representa uma ou mais partes iguais de um todo que foi dividido. O numerador (número de cima) indica quantas partes foram tomadas, e o denominador (número de baixo) indica em quantas partes o todo foi dividido.',
    keyPoints: [
      'O número de cima é o Numerador (quantas partes pegamos).',
      'O número de baixo é o Denominador (o total de partes iguais).',
      'Frações equivalentes têm o mesmo valor numérico (ex: 1/2 = 2/4 = 4/8).',
      'Para somar frações com mesmo denominador, somamos os numeradores e mantemos o denominador.',
    ],
    example:
      'Se uma pizza for dividida em 8 fatias iguais e você comer 3 fatias, você consumiu 3/8 da pizza. As 5 fatias restantes representam 5/8.',
    practiceQuestions: [
      {
        id: 'q_mat_6_1',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Em uma barra de chocolate com 10 pedaços iguais, Pedro comeu 4 pedaços. Qual fração representa o que Pedro comeu?',
        options: ['4/10 (ou 2/5)', '10/4', '4/6', '6/10'],
        correctIndex: 0,
        explanation: 'Pedro comeu 4 de um total de 10 partes, resultando em 4/10, que simplificado é 2/5.',
        difficulty: 'easy',
      },
      {
        id: 'q_mat_6_2',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Qual fração é equivalente a 1/2?',
        options: ['3/6', '2/3', '3/4', '1/4'],
        correctIndex: 0,
        explanation: 'Multiplicando numerador e denominador de 1/2 por 3, obtemos 3/6.',
        difficulty: 'easy',
      },
      {
        id: 'q_mat_6_3',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Quanto é 2/7 + 3/7?',
        options: ['5/7', '5/14', '6/7', '1/7'],
        correctIndex: 0,
        explanation: 'Como os denominadores são iguais a 7, somamos os numeradores: 2 + 3 = 5, mantendo o 7 embaixo (5/7).',
        difficulty: 'medium',
      },
      {
        id: 'q_mat_6_4',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Uma turma tem 30 alunos. Se 1/3 gosta de futebol, quantos alunos gostam de futebol?',
        options: ['10 alunos', '15 alunos', '20 alunos', '5 alunos'],
        correctIndex: 0,
        explanation: '1/3 de 30 é calculado dividindo 30 por 3 = 10 alunos.',
        difficulty: 'medium',
      },
      {
        id: 'q_mat_6_5',
        subject: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Qual das frações a seguir é considerada uma fração imprópria (onde o numerador é maior que o denominador)?',
        options: ['7/4', '2/5', '3/8', '1/2'],
        correctIndex: 0,
        explanation: '7/4 tem o numerador (7) maior que o denominador (4), representando mais do que 1 inteiro.',
        difficulty: 'hard',
      },
    ],
  },
  // 8º ano - Ciências - Sistema Circulatório e Sangue
  {
    id: 'cie_8_circulatorio',
    subject: 'ciencias',
    grade: '8_fund',
    title: 'Sistema Cardiovascular e Circulação Humana',
    summary:
      'O sistema cardiovascular é responsável por transportar nutrientes, oxigênio e hormônios para todas as células do corpo através do sangue impulsionado pelo coração.',
    keyPoints: [
      'O coração funciona como uma bomba com 4 cavidades (2 átrios e 2 ventrículos).',
      'Artérias levam sangue que sai do coração; veias trazem sangue de volta ao coração.',
      'Os glóbulos vermelhos (hemácias) transportam oxigênio com a hemoglobina.',
      'Os glóbulos brancos (leucócitos) são as células de defesa do organismo.',
    ],
    example:
      'Na pequena circulação, o sangue vai do coração aos pulmões para receber oxigênio (hematose) e retorna ao coração. Na grande circulação, o sangue oxigenado é distribuído para todo o corpo.',
    practiceQuestions: [
      {
        id: 'q_cie_8_1',
        subject: 'ciencias',
        grade: '8_fund',
        topic: 'Sistema Cardiovascular',
        question: 'Qual componente do sangue é o principal responsável pelo transporte de oxigênio?',
        options: ['Hemácias (glóbulos vermelhos)', 'Leucócitos (glóbulos brancos)', 'Plaquetas', 'Plasma'],
        correctIndex: 0,
        explanation: 'As hemácias contêm hemoglobina, proteína que se liga ao oxigênio nos pulmões e o leva às células.',
        difficulty: 'easy',
      },
      {
        id: 'q_cie_8_2',
        subject: 'ciencias',
        grade: '8_fund',
        topic: 'Sistema Cardiovascular',
        question: 'Os vasos sanguíneos que levam sangue DO coração PARA o restante do corpo chamam-se:',
        options: ['Artérias', 'Veias', 'Capilares linfáticos', 'Vênulas'],
        correctIndex: 0,
        explanation: 'Artérias saem do coração com sangue sob alta pressão; veias trazem o sangue de volta.',
        difficulty: 'easy',
      },
      {
        id: 'q_cie_8_3',
        subject: 'ciencias',
        grade: '8_fund',
        topic: 'Sistema Cardiovascular',
        question: 'O coração humano é dividido internamente em quantas cavidades?',
        options: ['4 (2 átrios e 2 ventrículos)', '2 cavidades', '3 cavidades', '6 cavidades'],
        correctIndex: 0,
        explanation: 'São 2 átrios superiores que recebem sangue e 2 ventrículos inferiores que bombeiam o sangue.',
        difficulty: 'medium',
      },
      {
        id: 'q_cie_8_4',
        subject: 'ciencias',
        grade: '8_fund',
        topic: 'Sistema Cardiovascular',
        question: 'Qual é a função principal das plaquetas sanguíneas?',
        options: ['Auxiliar na coagulação do sangue', 'Combater vírus e bactérias', 'Produzir hormônios', 'Transportar gás carbônico'],
        correctIndex: 0,
        explanation: 'As plaquetas atuam na formação de coágulos para conter sangramentos e cicatrizar feridas.',
        difficulty: 'medium',
      },
      {
        id: 'q_cie_8_5',
        subject: 'ciencias',
        grade: '8_fund',
        topic: 'Sistema Cardiovascular',
        question: 'O processo de oxigenação do sangue que ocorre nos alvéolos pulmonares é chamado de:',
        options: ['Hematose', 'Fagocitose', 'Diapedese', 'Hemólise'],
        correctIndex: 0,
        explanation: 'Hematose é a troca gasosa onde o gás carbônico sai do sangue e o oxigênio entra.',
        difficulty: 'hard',
      },
    ],
  },
  // 1º Ano Ensino Médio - Português - Figuras de Linguagem
  {
    id: 'port_1em_figuras',
    subject: 'portugues',
    grade: '1_medio',
    title: 'Figuras de Linguagem e Expressividade',
    summary:
      'Figuras de linguagem são recursos estilísticos utilizados pelo autor para dar maior expressividade, emoção, impacto e beleza ao texto ou fala.',
    keyPoints: [
      'Metáfora: comparação implícita sem conectivo (ex: "Ela é uma flor").',
      'Metonímia: troca de um termo por outro com relação de proximidade (ex: "Li Machado de Assis").',
      'Hipérbole: exagero intencional (ex: "Estou morrendo de sede").',
      'Antítese: aproximação de palavras com sentidos opostos (ex: "O amor e o ódio").',
    ],
    example:
      'Quando dizemos "Chorei rios de lágrimas", estamos usando uma Hipérbole para enfatizar a intensidade do choro por meio do exagero.',
    practiceQuestions: [
      {
        id: 'q_port_1em_1',
        subject: 'portugues',
        grade: '1_medio',
        topic: 'Figuras de Linguagem',
        question: 'Na frase "Ele comeu dois pratos inteiros no almoço", qual figura de linguagem ocorre?',
        options: ['Metonímia (o continente pelo conteúdo)', 'Metáfora', 'Eufemismo', 'Pleonasmo'],
        correctIndex: 0,
        explanation: 'Ele comeu a comida que estava nos pratos, e não os pratos de cerâmica. Isso é metonímia.',
        difficulty: 'easy',
      },
      {
        id: 'q_port_1em_2',
        subject: 'portugues',
        grade: '1_medio',
        topic: 'Figuras de Linguagem',
        question: 'Em "O vento sussurrava segredos pelas frestas da janela", temos um exemplo de:',
        options: ['Personificação / Prosopopeia', 'Hipérbole', 'Ironia', 'Paradoxo'],
        correctIndex: 0,
        explanation: 'Atribuir características humanas (sussurrar segredos) a elementos inanimados (o vento) é personificação.',
        difficulty: 'easy',
      },
      {
        id: 'q_port_1em_3',
        subject: 'portugues',
        grade: '1_medio',
        topic: 'Figuras de Linguagem',
        question: 'Substituir a frase "Ele morreu" por "Ele descansou e foi para o andar de cima" é um exemplo de:',
        options: ['Eufemismo (suavização)', 'Hipérbole', 'Sinestesia', 'Antítese'],
        correctIndex: 0,
        explanation: 'O eufemismo é utilizado para suavizar uma ideia desagradável ou chocante.',
        difficulty: 'medium',
      },
      {
        id: 'q_port_1em_4',
        subject: 'portugues',
        grade: '1_medio',
        topic: 'Figuras de Linguagem',
        question: 'A frase "Amor é fogo que arde sem se ver / É ferida que dói e não se sente" de Camões apresenta principalmente:',
        options: ['Paradoxo (ideias contraditórias que parecem impossíveis juntas)', 'Catacrese', 'Aliteração', 'Onomatopeia'],
        correctIndex: 0,
        explanation: 'O paradoxo reúne conceitos inconciliáveis na lógica cotidiana para expressar a complexidade do amor.',
        difficulty: 'hard',
      },
      {
        id: 'q_port_1em_5',
        subject: 'portugues',
        grade: '1_medio',
        topic: 'Figuras de Linguagem',
        question: 'Em "Senti o doce perfume da sua voz", qual figura combina sentidos corporais diferentes (paladar e audição/olfato)?',
        options: ['Sinestesia', 'Pleonasmo', 'Anacoluto', 'Zeugma'],
        correctIndex: 0,
        explanation: 'Sinestesia é a fusão de diferentes sensações físicas em uma mesma expressão.',
        difficulty: 'hard',
      },
    ],
  },
  // 3º Ano EM / ENEM - História - Revolução Industrial e Era Contemporânea
  {
    id: 'hist_enem_revolucao',
    subject: 'historia',
    grade: 'enem',
    title: 'A Revolução Industrial e as Transformações no Trabalho',
    summary:
      'Iniciada na Inglaterra no século XVIII, a Revolução Industrial substituiu o trabalho artesanal pelas máquinas a vapor, impulsionando a urbanização rápida e novas relações de classe social.',
    keyPoints: [
      'Pioneirismo inglês devido a carvão, ferro, capitais acumulados e cercamento dos campos.',
      'Surgimento da burguesia industrial e do proletariado operário.',
      'Jornadas extenuantes de trabalho que deram origem ao movimento operário e sindicatos.',
      'Impacto definitivo na velocidade dos transportes com trens e barcos a vapor.',
    ],
    example:
      'As ferrovias permitiram escoar a produção têxtil de Manchester para o porto de Liverpool em poucas horas, integrando mercados globais.',
    practiceQuestions: [
      {
        id: 'q_hist_enem_1',
        subject: 'historia',
        grade: 'enem',
        topic: 'Revolução Industrial',
        question: 'Qual país foi o pioneiro na Primeira Revolução Industrial no século XVIII?',
        options: ['Inglaterra', 'França', 'Alemanha', 'Estados Unidos'],
        correctIndex: 0,
        explanation: 'A Inglaterra reuniu jazidas de carvão/ferro, capital comercial acumulado e mão de obra urbana disponível.',
        difficulty: 'easy',
      },
      {
        id: 'q_hist_enem_2',
        subject: 'historia',
        grade: 'enem',
        topic: 'Revolução Industrial',
        question: 'A principal fonte de energia motriz da Primeira Revolução Industrial foi:',
        options: ['O vapor gerado pela queima de carvão mineral', 'A eletricidade', 'O petróleo', 'A energia nuclear'],
        correctIndex: 0,
        explanation: 'A máquina a vapor de James Watt impulsionada pelo carvão foi o motor central da primeira fase.',
        difficulty: 'easy',
      },
      {
        id: 'q_hist_enem_3',
        subject: 'historia',
        grade: 'enem',
        topic: 'Revolução Industrial',
        question: 'O movimento operário inglês que destruía máquinas por considerá-las culpadas pelo desemprego ficou conhecido como:',
        options: ['Ludismo', 'Cartismo', 'Anarquismo', 'Taylorismo'],
        correctIndex: 0,
        explanation: 'O ludismo (liderado simbolicamente por Ned Ludd) quebrava teares mecânicos em protesto às condições de vida.',
        difficulty: 'medium',
      },
      {
        id: 'q_hist_enem_4',
        subject: 'historia',
        grade: 'enem',
        topic: 'Revolução Industrial',
        question: 'Qual foi o fenômeno socioespacial provocado pela transferência de camponeses para as cidades industriais?',
        options: ['Êxodo rural e rápido crescimento urbano desordenado', 'Reforma agrária planejada', 'Desconcentração urbana', 'Colonização do interior'],
        correctIndex: 0,
        explanation: 'A Lei de Cercamento dos Campos expulsou camponeses para os centros fabris superlotados.',
        difficulty: 'medium',
      },
      {
        id: 'q_hist_enem_5',
        subject: 'historia',
        grade: 'enem',
        topic: 'Revolução Industrial',
        question: 'A Segunda Revolução Industrial (século XIX) destacou-se principalmente por introduzir:',
        options: ['Petróleo, eletricidade, aço e a indústria química', 'Apenas teares manuais', 'A energia eólica em larga escala', 'O artesanato feudal'],
        correctIndex: 0,
        explanation: 'A segunda fase expandiu-se com motor a combustão, eletricidade e produção em massa de aço.',
        difficulty: 'hard',
      },
    ],
  },
];

// Curated questions categorized by grade to serve journey, local pass-and-play and multiplayer
export const CURRICULUM_QUESTIONS_POOL: Record<GradeLevel, Question[]> = {
  '1_fund': [
    {
      id: 'q_1f_1',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Contagem e Adição',
      question: 'Se você tem 3 maçãs e ganha mais 2 maçãs, com quantas maçãs você fica?',
      options: ['5 maçãs', '4 maçãs', '6 maçãs', '3 maçãs'],
      correctIndex: 0,
      explanation: '3 + 2 = 5 maçãs no total!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_2',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Contagem até 10',
      question: 'Quantos dedos temos juntando as duas mãos?',
      options: ['10 dedos', '5 dedos', '8 dedos', '12 dedos'],
      correctIndex: 0,
      explanation: 'Cada mão tem 5 dedos. 5 + 5 = 10 dedos!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_3',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Adição Simples',
      question: 'Quanto é 4 + 1?',
      options: ['5', '3', '6', '4'],
      correctIndex: 0,
      explanation: 'Contando 1 depois do 4, temos o número 5.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_4',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Formas Geométricas',
      question: 'Qual forma geométrica parece com uma roda de bicicleta?',
      options: ['Círculo', 'Quadrado', 'Triângulo', 'Retângulo'],
      correctIndex: 0,
      explanation: 'A roda é redonda como um círculo!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_5',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Sequência Numérica',
      question: 'Qual número vem logo depois do número 6?',
      options: ['7', '5', '8', '9'],
      correctIndex: 0,
      explanation: 'Na ordem numérica: 1, 2, 3, 4, 5, 6, 7...',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_8',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Subtração básica',
      question: 'Se havia 5 patinhos na lagoa e 2 foram embora, quantos ficaram?',
      options: ['3 patinhos', '2 patinhos', '4 patinhos', '1 patinho'],
      correctIndex: 0,
      explanation: '5 - 2 = 3 patinhos restantes.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_7',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Comparação de Quantidades',
      question: 'Qual número é MAIOR: 8 ou 3?',
      options: ['8', '3', 'São iguais', 'Nenhum'],
      correctIndex: 0,
      explanation: '8 representa uma quantidade maior do que 3.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_8',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Adição Simples',
      question: 'Lucas tem 2 carrinhos azuis e 2 carrinhos vermelhos. Quantos carrinhos ele tem ao todo?',
      options: ['4 carrinhos', '3 carrinhos', '5 carrinhos', '2 carrinhos'],
      correctIndex: 0,
      explanation: '2 + 2 = 4 carrinhos.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_9',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Formas Geométricas',
      question: 'Qual forma geométrica tem 3 pontas (três lados)?',
      options: ['Triângulo', 'Círculo', 'Quadrado', 'Retângulo'],
      correctIndex: 0,
      explanation: 'O triângulo tem 3 lados e 3 pontas.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_10',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Subtração Simples',
      question: 'Você tinha 4 balas e deu 1 para seu amigo. Com quantas balas você ficou?',
      options: ['3 balas', '2 balas', '5 balas', '1 bala'],
      correctIndex: 0,
      explanation: '4 - 1 = 3 balas.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_11',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Adição com Zero',
      question: 'Quanto é 6 + 0?',
      options: ['6', '0', '7', '60'],
      correctIndex: 0,
      explanation: 'Somar zero não altera a quantidade: 6 + 0 = 6.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_mat_12',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Contagem de Objetos',
      question: 'Quantas patas tem um cachorrinho saudável?',
      options: ['4 patas', '2 patas', '6 patas', '3 patas'],
      correctIndex: 0,
      explanation: 'O cachorro é um animal quadrúpede e tem 4 patas.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_11',
      subject: 'matematica',
      grade: '1_fund',
      topic: 'Comparação de Tamanho',
      question: 'Qual destes objetos é geralmente MAIOR que um lápis?',
      options: ['Um carro', 'Uma borracha', 'Um apontador', 'Um clipe'],
      correctIndex: 0,
      explanation: 'Um carro é muito maior do que um lápis!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_2',
      subject: 'portugues',
      grade: '1_fund',
      topic: 'Alfabeto',
      question: 'Qual é a primeira letra da palavra BOLA?',
      options: ['B', 'O', 'L', 'A'],
      correctIndex: 0,
      explanation: 'A palavra BOLA começa com a letra B!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_6',
      subject: 'portugues',
      grade: '1_fund',
      topic: 'Vogais',
      question: 'Quais são as cinco vogais do nosso alfabeto?',
      options: ['A, E, I, O, U', 'B, C, D, F, G', '1, 2, 3, 4, 5', 'P, Q, R, S, T'],
      correctIndex: 0,
      explanation: 'As vogais são A, E, I, O e U.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_9',
      subject: 'portugues',
      grade: '1_fund',
      topic: 'Identificação de Letras',
      question: 'Qual destas palavras começa com a letra M?',
      options: ['Maçã', 'Pato', 'Bola', 'Sapo'],
      correctIndex: 0,
      explanation: 'A palavra Maçã começa com a letra M!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_3',
      subject: 'ciencias',
      grade: '1_fund',
      topic: 'Animais',
      question: 'Qual destes animais sabe voar?',
      options: ['Passarinho', 'Cachorro', 'Gato', 'Tartaruga'],
      correctIndex: 0,
      explanation: 'Os passarinhos têm asas e sabem voar.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_7',
      subject: 'ciencias',
      grade: '1_fund',
      topic: 'Plantas',
      question: 'O que a plantinha precisa para crescer saudável?',
      options: ['Água e luz do Sol', 'Refrigerante e doce', 'Ficar no escuro', 'Brinquedos'],
      correctIndex: 0,
      explanation: 'As plantas precisam de água, terra boa e luz solar.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_12',
      subject: 'ciencias',
      grade: '1_fund',
      topic: 'Higiene e Saúde',
      question: 'O que devemos fazer sempre antes de comer e depois de brincar?',
      options: ['Lavar as mãos com água e sabão', 'Assistir televisão', 'Dormir', 'Correr descalço'],
      correctIndex: 0,
      explanation: 'Lavar as mãos elimina bactérias e nos mantém saudáveis.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_10',
      subject: 'historia',
      grade: '1_fund',
      topic: 'Família e Convivência',
      question: 'O que devemos fazer para ter uma boa convivência com os colegas na escola?',
      options: ['Respeitar e compartilhar', 'Gritar e brigar', 'Não falar com ninguém', 'Correr empurrando'],
      correctIndex: 0,
      explanation: 'O respeito e o carinho tornam a convivência harmoniosa.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_5',
      subject: 'geografia',
      grade: '1_fund',
      topic: 'Dia e Noite',
      question: 'O que ilumina o nosso céu durante o dia?',
      options: ['O Sol', 'A Lua', 'As estrelas', 'As nuvens'],
      correctIndex: 0,
      explanation: 'O Sol é a grande estrela que ilumina nosso dia.',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_ing_1',
      subject: 'ingles',
      grade: '1_fund',
      topic: 'Greetings',
      question: 'Como dizemos "Olá" em inglês para a professora ou amigos?',
      options: ['Hello (ou Hi)', 'Goodbye', 'Night', 'Thanks'],
      correctIndex: 0,
      explanation: '"Hello" e "Hi" significam "Olá" em inglês!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_ing_2',
      subject: 'ingles',
      grade: '1_fund',
      topic: 'Colors',
      question: 'Qual é a cor "RED" em português?',
      options: ['Vermelho', 'Azul', 'Amarelo', 'Verde'],
      correctIndex: 0,
      explanation: '"Red" é a cor vermelha, como a maçã!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_ing_3',
      subject: 'ingles',
      grade: '1_fund',
      topic: 'Animals',
      question: 'Como chamamos o "Cachorro" em inglês?',
      options: ['Dog', 'Cat', 'Fish', 'Bird'],
      correctIndex: 0,
      explanation: '"Dog" significa cachorro em inglês!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_ing_4',
      subject: 'ingles',
      grade: '1_fund',
      topic: 'Numbers',
      question: 'Quantos dedos você tem em uma mão em inglês? (5 dedos)',
      options: ['Five (5)', 'Two (2)', 'Ten (10)', 'One (1)'],
      correctIndex: 0,
      explanation: 'Número 5 em inglês é "Five"!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_ing_5',
      subject: 'ingles',
      grade: '1_fund',
      topic: 'Colors',
      question: 'Qual cor representa a palavra "BLUE"?',
      options: ['Azul', 'Rosa', 'Preto', 'Branco'],
      correctIndex: 0,
      explanation: '"Blue" é a cor azul, como o céu ensolarado!',
      difficulty: 'easy',
    },
    {
      id: 'q_1f_ing_6',
      subject: 'ingles',
      grade: '1_fund',
      topic: 'Greetings',
      question: 'Quando vamos embora da escola, dizemos:',
      options: ['Goodbye! (Tchau)', 'Hello!', 'Please', 'Good morning'],
      correctIndex: 0,
      explanation: '"Goodbye" ou "Bye" usamos para nos despedir.',
      difficulty: 'easy',
    },
  ],

  '2_fund': [
    {
      id: 'q_2f_1',
      subject: 'matematica',
      grade: '2_fund',
      topic: 'Dezenas',
      question: 'Quantas unidades formam 1 dezena?',
      options: ['10 unidades', '5 unidades', '20 unidades', '100 unidades'],
      correctIndex: 0,
      explanation: '1 dezena é igual a 10 unidades.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_2',
      subject: 'portugues',
      grade: '2_fund',
      topic: 'Sílabas',
      question: 'Quantas sílabas tem a palavra CA-CHOR-RO?',
      options: ['3 sílabas', '2 sílabas', '4 sílabas', '1 sílaba'],
      correctIndex: 0,
      explanation: 'A palavra CA-CHOR-RO tem 3 sílabas.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_3',
      subject: 'ciencias',
      grade: '2_fund',
      topic: 'Sentidos',
      question: 'Qual órgão usamos para sentir o gosto dos alimentos?',
      options: ['A língua (paladar)', 'Os olhos (visão)', 'Os ouvidos (audição)', 'O nariz (olfato)'],
      correctIndex: 0,
      explanation: 'O paladar é percebido pelas papilas gustativas na língua.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_4',
      subject: 'matematica',
      grade: '2_fund',
      topic: 'Dobro',
      question: 'Qual é o dobro de 6?',
      options: ['12', '8', '14', '10'],
      correctIndex: 0,
      explanation: 'O dobro de 6 é 6 x 2 = 12.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_5',
      subject: 'geografia',
      grade: '2_fund',
      topic: 'Meios de Transporte',
      question: 'Qual é um meio de transporte aquático?',
      options: ['Navio', 'Avião', 'Bicicleta', 'Metrô'],
      correctIndex: 0,
      explanation: 'Navios navegam sobre as águas.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_6',
      subject: 'portugues',
      grade: '2_fund',
      topic: 'Rimas',
      question: 'Qual palavra rima com CORAÇÃO?',
      options: ['Balão', 'Janela', 'Sapato', 'Casa'],
      correctIndex: 0,
      explanation: 'Coração e Balão terminam com o mesmo som "-ão".',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_7',
      subject: 'ciencias',
      grade: '2_fund',
      topic: 'Estados da Água',
      question: 'Quando a água congela e vira gelo, ela está em qual estado?',
      options: ['Sólido', 'Líquido', 'Gasoso', 'Vapor'],
      correctIndex: 0,
      explanation: 'O gelo é a água em estado sólido.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_8',
      subject: 'portugues',
      grade: '2_fund',
      topic: 'Antônimos',
      question: 'Qual é o contrário (antônimo) da palavra ALTO?',
      options: ['Baixo', 'Grande', 'Forte', 'Largo'],
      correctIndex: 0,
      explanation: 'O contrário de alto é baixo.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_9',
      subject: 'matematica',
      grade: '2_fund',
      topic: 'Horas',
      question: 'Quantas horas tem um dia completo?',
      options: ['24 horas', '12 horas', '48 horas', '60 horas'],
      correctIndex: 0,
      explanation: 'Um dia completo tem 24 horas.',
      difficulty: 'easy',
    },
    {
      id: 'q_2f_10',
      subject: 'historia',
      grade: '2_fund',
      topic: 'Passagem do Tempo',
      question: 'Qual instrumento usamos para medir a passagem dos dias, semanas e meses?',
      options: ['Calendário', 'Termômetro', 'Régua', 'Balança'],
      correctIndex: 0,
      explanation: 'O calendário organiza os dias, meses e anos.',
      difficulty: 'easy',
    },
  ],

  '3_fund': [
    {
      id: 'q_3f_1',
      subject: 'matematica',
      grade: '3_fund',
      topic: 'Multiplicação',
      question: 'Quanto é 4 vezes 5?',
      options: ['20', '15', '25', '18'],
      correctIndex: 0,
      explanation: '4 x 5 = 20.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_2',
      subject: 'portugues',
      grade: '3_fund',
      topic: 'Substantivos',
      question: 'Qual das palavras é um substantivo próprio (deve ser escrito com letra maiúscula)?',
      options: ['Brasil', 'cidade', 'menino', 'cadeira'],
      correctIndex: 0,
      explanation: 'Brasil é o nome próprio de um país.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_3',
      subject: 'ciencias',
      grade: '3_fund',
      topic: 'Luz e Sombra',
      question: 'A sombra de um objeto é formada quando:',
      options: ['O objeto bloqueia a passagem da luz', 'A luz atravessa totalmente o objeto', 'Está completamente escuro', 'O objeto esquenta'],
      correctIndex: 0,
      explanation: 'Objetos opacos barram a luz, projetando a sombra.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_4',
      subject: 'geografia',
      grade: '3_fund',
      topic: 'Paisagem Natural e Cultural',
      question: 'Qual elemento é típico de uma paisagem cultural (modificada pelo ser humano)?',
      options: ['Um prédio de apartamentos', 'Uma floresta nativa', 'Uma cachoeira', 'Uma montanha'],
      correctIndex: 0,
      explanation: 'Prédios são construções humanas, compondo a paisagem cultural.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_5',
      subject: 'matematica',
      grade: '3_fund',
      topic: 'Centena',
      question: 'Quantas dezenas formam 1 centena (100)?',
      options: ['10 dezenas', '5 dezenas', '100 dezenas', '20 dezenas'],
      correctIndex: 0,
      explanation: '10 dezenas x 10 = 100.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_6',
      subject: 'portugues',
      grade: '3_fund',
      topic: 'Pontuação',
      question: 'Qual sinal de pontuação usamos no final de uma pergunta?',
      options: ['Ponto de interrogação (?)', 'Ponto final (.)', 'Ponto de exclamação (!)', 'Vírgula (,)'],
      correctIndex: 0,
      explanation: 'O ponto de interrogação (?) finaliza perguntas diretas.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_7',
      subject: 'ciencias',
      grade: '3_fund',
      topic: 'Ciclo da Água',
      question: 'Como se chama o processo em que a água líquida se transforma em vapor pelo calor do Sol?',
      options: ['Evaporação', 'Condensação', 'Precipitação', 'Solidificação'],
      correctIndex: 0,
      explanation: 'A evaporação transforma água líquida em vapor de água.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_8',
      subject: 'historia',
      grade: '3_fund',
      topic: 'Comunidades Tradicionais',
      question: 'Quem foram os primeiros habitantes do território que hoje chamamos de Brasil?',
      options: ['Os povos indígenas', 'Os imigrantes europeus', 'Os navegadores asiáticos', 'Os astronautas'],
      correctIndex: 0,
      explanation: 'Diversos povos indígenas já habitavam o Brasil milhares de anos antes da chegada dos portugueses.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_9',
      subject: 'portugues',
      grade: '3_fund',
      topic: 'Sílaba Tônica',
      question: 'Na palavra "MÁGICA", qual é a sílaba tônica (mais forte)?',
      options: ['MÁ', 'GI', 'CA', 'GICA'],
      correctIndex: 0,
      explanation: 'A sílaba MÁ é a mais forte e recebe acento agudo.',
      difficulty: 'easy',
    },
    {
      id: 'q_3f_10',
      subject: 'matematica',
      grade: '3_fund',
      topic: 'Divisão Simples',
      question: 'Se dividirmos 18 balas igualmente entre 3 amigos, quantas balas cada um ganha?',
      options: ['6 balas', '5 balas', '9 balas', '4 balas'],
      correctIndex: 0,
      explanation: '18 ÷ 3 = 6 balas para cada.',
      difficulty: 'easy',
    },
  ],

  '4_fund': [
    {
      id: 'q_4f_1',
      subject: 'matematica',
      grade: '4_fund',
      topic: 'Geometria e Formas',
      question: 'Quantos lados tem um triângulo e um retângulo respectivamente?',
      options: ['3 e 4', '4 e 3', '3 e 5', '4 e 4'],
      correctIndex: 0,
      explanation: 'O triângulo possui 3 lados e o retângulo 4 lados.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_mat_2',
      subject: 'matematica',
      grade: '4_fund',
      topic: 'Multiplicação por 2 algarismos',
      question: 'Quanto é 25 multiplicado por 4?',
      options: ['100', '75', '125', '90'],
      correctIndex: 0,
      explanation: '25 x 4 = 100.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_mat_3',
      subject: 'matematica',
      grade: '4_fund',
      topic: 'Frações Intuitivas',
      question: 'Se uma barra de chocolate tem 8 pedaços e você come a metade (1/2), quantos pedaços você comeu?',
      options: ['4 pedaços', '2 pedaços', '6 pedaços', '8 pedaços'],
      correctIndex: 0,
      explanation: 'A metade de 8 é 8 ÷ 2 = 4 pedaços.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_mat_4',
      subject: 'matematica',
      grade: '4_fund',
      topic: 'Perímetro',
      question: 'Um quadrado tem lados de 5 cm cada. Qual é o perímetro desse quadrado?',
      options: ['20 cm', '25 cm', '15 cm', '10 cm'],
      correctIndex: 0,
      explanation: 'O perímetro é a soma dos 4 lados: 5 + 5 + 5 + 5 = 20 cm.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_mat_5',
      subject: 'matematica',
      grade: '4_fund',
      topic: 'Sistema de Numeração Decimal',
      question: 'No número 3.482, qual algarismo ocupa a ordem das centenas?',
      options: ['4 (quatrocentos)', '3 (três mil)', '8 (oitenta)', '2 (duas unidades)'],
      correctIndex: 0,
      explanation: 'O algarismo 4 representa 4 centenas (400).',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_2',
      subject: 'ciencias',
      grade: '4_fund',
      topic: 'Cadeia Alimentar',
      question: 'Em uma cadeia alimentar, as plantas verdes que realizam fotossíntese são chamadas de:',
      options: ['Produtores', 'Consumidores primários', 'Decompositores', 'Predadores de topo'],
      correctIndex: 0,
      explanation: 'As plantas produzem seu próprio alimento por fotossíntese a partir da luz solar.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_cie_2',
      subject: 'ciencias',
      grade: '4_fund',
      topic: 'Misturas e Transformações',
      question: 'Quando misturamos água e sal e o sal se dissolve completamente, temos uma mistura:',
      options: ['Homogênea (uma única fase visível)', 'Heterogênea', 'Sólida', 'Gasosa'],
      correctIndex: 0,
      explanation: 'Misturas homogêneas apresentam aspecto uniforme com apenas uma fase visível.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_cie_3',
      subject: 'ciencias',
      grade: '4_fund',
      topic: 'Microrganismos e Fungos',
      question: 'Qual destes seres vivos atua como decompositor essencial na reciclagem de matéria orgânica na natureza?',
      options: ['Fungos e bactérias', 'Leões e tigres', 'Árvores e grama', 'Gaviões e corujas'],
      correctIndex: 0,
      explanation: 'Fungos e bactérias decompõem restos de folhas e seres mortos, nutrindo o solo.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_cie_4',
      subject: 'ciencias',
      grade: '4_fund',
      topic: 'Pontos Cardeais e Bússola',
      question: 'Qual instrumento com agulha magnética aponta sempre na direção norte para navegação?',
      options: ['Bússola', 'Termômetro', 'Telescópio', 'Barômetro'],
      correctIndex: 0,
      explanation: 'A bússola possui agulha imantada que se alinha com o campo magnético da Terra.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_3',
      subject: 'portugues',
      grade: '4_fund',
      topic: 'Adjetivos',
      question: 'Na frase "A menina inteligente resolveu o problema rápido", qual palavra é um adjetivo?',
      options: ['Inteligente', 'Menina', 'Problema', 'Resolveu'],
      correctIndex: 0,
      explanation: '"Inteligente" caracteriza e qualifica o substantivo "menina".',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_por_2',
      subject: 'portugues',
      grade: '4_fund',
      topic: 'Tempos Verbais',
      question: 'Em "Ontem os alunos brincaram no pátio", em qual tempo verbal está o verbo?',
      options: ['Passado (Pretérito)', 'Presente', 'Futuro', 'Imperativo'],
      correctIndex: 0,
      explanation: '"Brincaram" indica uma ação que já aconteceu no passado.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_por_3',
      subject: 'portugues',
      grade: '4_fund',
      topic: 'Pronomes Pessoais',
      question: 'Qual pronome substitui corretamente o termo destacado em: "Lucas e Pedro foram ao parque"?',
      options: ['Eles', 'Nós', 'Vós', 'Ele'],
      correctIndex: 0,
      explanation: '"Lucas e Pedro" é 3ª pessoa do plural, correspondente ao pronome "Eles".',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_por_4',
      subject: 'portugues',
      grade: '4_fund',
      topic: 'Acentuação',
      question: 'Qual das palavras a seguir é uma oxítona (última sílaba mais forte) acentuada?',
      options: ['Café', 'Árvore', 'Lápis', 'Mesa'],
      correctIndex: 0,
      explanation: 'Ca-fé tem a última sílaba forte e terminada em E, recebendo acento.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_4',
      subject: 'historia',
      grade: '4_fund',
      topic: 'Grandes Navegações e Brasil',
      question: 'Em qual ano os navios portugueses comandados por Pedro Álvares Cabral chegaram ao Brasil?',
      options: ['1500', '1822', '1889', '1492'],
      correctIndex: 0,
      explanation: 'A frota de Cabral aportou em Porto Seguro em 22 de abril de 1500.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_his_2',
      subject: 'historia',
      grade: '4_fund',
      topic: 'Pau-Brasil e Primeiros Ciclos',
      question: 'Qual foi a primeira riqueza natural explorada pelos portugueses no litoral brasileiro?',
      options: ['Pau-Brasil', 'Café', 'Ouro', 'Soja'],
      correctIndex: 0,
      explanation: 'O pau-brasil era extraído pela madeira avermelhada usada para tingir tecidos na Europa.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_his_3',
      subject: 'historia',
      grade: '4_fund',
      topic: 'Capitanias Hereditárias',
      question: 'A divisão inicial do território brasileiro em 15 grandes faixas de terra doadas a nobres portugueses chamava-se:',
      options: ['Capitanias Hereditárias', 'República Federativa', 'Governo Geral', 'Tratado de Tordesilhas'],
      correctIndex: 0,
      explanation: 'As Capitanias Hereditárias foram criadas pelo rei D. João III em 1534.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_5',
      subject: 'geografia',
      grade: '4_fund',
      topic: 'Regiões do Brasil',
      question: 'O Brasil é dividido oficialmente em quantas grandes regiões pelo IBGE?',
      options: ['5 regiões (Norte, Nordeste, Centro-Oeste, Sudeste e Sul)', '3 regiões', '7 regiões', '4 regiões'],
      correctIndex: 0,
      explanation: 'São 5 macro-regiões: Norte, Nordeste, Centro-Oeste, Sudeste e Sul.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_geo_2',
      subject: 'geografia',
      grade: '4_fund',
      topic: 'Capital do Brasil',
      question: 'Qual é a capital federal do Brasil, localizada no Distrito Federal?',
      options: ['Brasília', 'São Paulo', 'Rio de Janeiro', 'Salvador'],
      correctIndex: 0,
      explanation: 'Brasília é a capital federal do país, inaugurada em 1960.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_geo_3',
      subject: 'geografia',
      grade: '4_fund',
      topic: 'Rosa dos Ventos',
      question: 'Quais são os quatro pontos cardeais principais da Rosa dos Ventos?',
      options: ['Norte, Sul, Leste e Oeste', 'Cima, Baixo, Direita e Esquerda', 'Primavera, Verão, Outono e Inverno', 'Sol, Lua, Terra e Mar'],
      correctIndex: 0,
      explanation: 'Os pontos cardeais fundamentais para orientação geográfica são Norte, Sul, Leste e Oeste.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_ing_1',
      subject: 'ingles',
      grade: '4_fund',
      topic: 'Pronomes e Verbo To Be',
      question: 'Como dizemos "Eu sou um estudante" em inglês?',
      options: ['I am a student', 'He is a student', 'They are students', 'We are student'],
      correctIndex: 0,
      explanation: '"I am" corresponde a "Eu sou / Eu estou" no presente.',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_ing_2',
      subject: 'ingles',
      grade: '4_fund',
      topic: 'Clima e Tempo',
      question: 'Qual palavra em inglês usamos quando o dia está ensolarado com muito sol?',
      options: ['Sunny', 'Rainy', 'Cloudy', 'Snowy'],
      correctIndex: 0,
      explanation: '"Sunny" significa ensolarado (derivado de Sun = Sol).',
      difficulty: 'easy',
    },
    {
      id: 'q_4f_ing_3',
      subject: 'ingles',
      grade: '4_fund',
      topic: 'Horas',
      question: 'O que significa a expressão "It is ten o\'clock"?',
      options: ['São dez horas em ponto', 'São duas horas', 'São cinco horas', 'São dez minutos'],
      correctIndex: 0,
      explanation: '"Ten o\'clock" significa dez horas em ponto.',
      difficulty: 'easy',
    },
  ],

  '5_fund': [
    {
      id: 'q_5f_1',
      subject: 'matematica',
      grade: '5_fund',
      topic: 'Frações Decimais',
      question: 'O número decimal 0,75 corresponde a qual fração simplificada?',
      options: ['3/4', '1/2', '1/4', '4/5'],
      correctIndex: 0,
      explanation: '0,75 = 75/100, que simplificado dividindo por 25 dá 3/4.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_mat_2',
      subject: 'matematica',
      grade: '5_fund',
      topic: 'Porcentagem Básica',
      question: 'Quanto é 50% de R$ 120,00?',
      options: ['R$ 60,00', 'R$ 50,00', 'R$ 24,00', 'R$ 70,00'],
      correctIndex: 0,
      explanation: '50% representa a metade exata do valor: 120 ÷ 2 = 60.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_mat_3',
      subject: 'matematica',
      grade: '5_fund',
      topic: 'Área de Retângulo',
      question: 'Uma sala retangular mede 6 metros de comprimento por 4 metros de largura. Qual é a área dessa sala?',
      options: ['24 m²', '20 m²', '10 m²', '36 m²'],
      correctIndex: 0,
      explanation: 'A área do retângulo é calculada por base x altura: 6 x 4 = 24 m².',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_mat_4',
      subject: 'matematica',
      grade: '5_fund',
      topic: 'As 4 Operações',
      question: 'Se uma fábrica produz 350 brinquedos por dia, quantos brinquedos produzirá em 10 dias?',
      options: ['3.500 brinquedos', '35.000 brinquedos', '350 brinquedos', '1.350 brinquedos'],
      correctIndex: 0,
      explanation: 'Multiplicando por 10, basta acrescentar um zero à direita: 350 x 10 = 3.500.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_2',
      subject: 'ciencias',
      grade: '5_fund',
      topic: 'Sistema Respiratório',
      question: 'Qual é o gás que absorvemos na inspiração e é essencial para a respiração de todas as células?',
      options: ['Oxigênio (O2)', 'Gás Carbônico (CO2)', 'Metano', 'Hélio'],
      correctIndex: 0,
      explanation: 'Nosso corpo necessita do oxigênio para a produção de energia nas células.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_cie_2',
      subject: 'ciencias',
      grade: '5_fund',
      topic: 'Sistema Circulatório e Coração',
      question: 'Qual órgão musculoso funciona como uma bomba impulsionando o sangue para todo o corpo humano?',
      options: ['O coração', 'O estômago', 'O pulmão', 'O fígado'],
      correctIndex: 0,
      explanation: 'O coração bombeia o sangue oxigenado através das artérias e veias.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_cie_3',
      subject: 'ciencias',
      grade: '5_fund',
      topic: 'Água e Sustentabilidade',
      question: 'Qual é a atitude correta para economizar água tratada em casa?',
      options: ['Fechar a torneira enquanto escova os dentes', 'Lavar calçadas com mangueira aberta', 'Tomar banhos de 30 minutos', 'Deixar torneiras pingando'],
      correctIndex: 0,
      explanation: 'Fechar a torneira enquanto escovamos os dentes evita o desperdício de litros de água tratada.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_3',
      subject: 'historia',
      grade: '5_fund',
      topic: 'Cidadania e Constituição',
      question: 'O que é a Constituição de um país?',
      options: ['A lei máxima fundamental que define os direitos e deveres dos cidadãos', 'Um livro de contos históricos', 'O mapa das capitais', 'O hino nacional'],
      correctIndex: 0,
      explanation: 'A Constituição é a Carta Magna que rege as leis e a cidadania do país.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_his_2',
      subject: 'historia',
      grade: '5_fund',
      topic: 'Direitos Humanos e Criança',
      question: 'No Brasil, o documento legal que protege integralmente os direitos das crianças e adolescentes é:',
      options: ['O Estatuto da Criança e do Adolescente (ECA)', 'O Código de Trânsito', 'A Carta de Pero Vaz de Caminha', 'O Tratado de Madri'],
      correctIndex: 0,
      explanation: 'O ECA (Lei nº 8.069/1990) garante direitos à educação, saúde, proteção e convivência familiar.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_his_3',
      subject: 'historia',
      grade: '5_fund',
      topic: 'Patrimônio Histórico',
      question: 'Cidades históricas como Ouro Preto (MG) e Olinda (PE) são consideradas patrimônios culturais porque:',
      options: ['Preservam a memória, arquitetura e história do povo brasileiro', 'Têm os maiores shoppings centers', 'São capitais atuais do Brasil', 'Foram construídas ontem'],
      correctIndex: 0,
      explanation: 'Patrimônios históricos guardam a identidade cultural e a história de gerações passadas.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_4',
      subject: 'portugues',
      grade: '5_fund',
      topic: 'Tempos Verbais',
      question: 'Na frase "Nós estudaremos para a prova amanhã", o verbo está em qual tempo?',
      options: ['Futuro', 'Passado (Pretérito)', 'Presente', 'Imperativo'],
      correctIndex: 0,
      explanation: '"Estudaremos" indica uma ação que ainda irá acontecer no futuro.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_por_2',
      subject: 'portugues',
      grade: '5_fund',
      topic: 'Gêneros Textuais',
      question: 'Um texto narrativo curto que traz animais como personagens e ensina uma moral final chama-se:',
      options: ['Fábula', 'Notícia jornalística', 'Receita culinária', 'Bula de remédio'],
      correctIndex: 0,
      explanation: 'Fábulas (como a da Lebre e a Tartaruga) usam animais personificados para transmitir lições morais.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_por_3',
      subject: 'portugues',
      grade: '5_fund',
      topic: 'Sujeito e Predicado',
      question: 'Na oração "Os atletas brasileiros conquistaram a medalha de ouro", qual é o predicado?',
      options: ['Conquistaram a medalha de ouro', 'Os atletas brasileiros', 'A medalha de ouro', 'Os atletas'],
      correctIndex: 0,
      explanation: 'O predicado é tudo aquilo que se declara a respeito do sujeito (a partir do verbo).',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_5',
      subject: 'geografia',
      grade: '5_fund',
      topic: 'Biomas Brasileiros',
      question: 'Qual é a maior floresta tropical do mundo localizada em grande parte no Norte do Brasil?',
      options: ['Floresta Amazônica', 'Mata Atlântica', 'Cerrado', 'Caatinga'],
      correctIndex: 0,
      explanation: 'A Amazônia é a maior floresta tropical úmida do planeta e abriga a maior bacia hidrográfica.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_geo_2',
      subject: 'geografia',
      grade: '5_fund',
      topic: 'Relevo Brasileiro',
      question: 'As formas de relevo no Brasil são predominantemente formadas por:',
      options: ['Planaltos, planícies e depressões', 'Altas cordilheiras com vulcões ativos', 'Geleiras e fiordes', 'Abismos submarinos visíveis'],
      correctIndex: 0,
      explanation: 'O relevo brasileiro é antigo e erodido, composto de planaltos, depressões e planícies.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_geo_3',
      subject: 'geografia',
      grade: '5_fund',
      topic: 'Zona Rural e Urbana',
      question: 'A produção agropecuária (plantações e criação de gado) ocorre principalmente na:',
      options: ['Zona Rural (campo)', 'Zona Urbana (centro da metrópole)', 'Área industrial portuária', 'Zona comercial financeira'],
      correctIndex: 0,
      explanation: 'O campo ou zona rural é o espaço onde se concentram as atividades do setor primário da economia.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_ing_1',
      subject: 'ingles',
      grade: '5_fund',
      topic: 'Rotina e Present Simple',
      question: 'Como dizemos "Eu acordo às 7 horas" em inglês?',
      options: ['I wake up at 7 o\'clock', 'I sleeping at 7 o\'clock', 'I dinner at 7', 'I study yesterday at 7'],
      correctIndex: 0,
      explanation: '"Wake up" significa acordar na rotina diária.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_ing_2',
      subject: 'ingles',
      grade: '5_fund',
      topic: 'Wh- Questions',
      question: 'Qual palavra interrogativa usamos para perguntar ONDE (lugar) em inglês?',
      options: ['Where', 'When', 'Who', 'Why'],
      correctIndex: 0,
      explanation: '"Where" significa onde/aonde, "When" é quando, "Who" é quem e "Why" é por que.',
      difficulty: 'easy',
    },
    {
      id: 'q_5f_ing_3',
      subject: 'ingles',
      grade: '5_fund',
      topic: 'Preposições de Lugar',
      question: 'Se o livro está SOBRE (em cima da) mesa, dizemos:',
      options: ['The book is ON the table', 'The book is UNDER the table', 'The book is IN the table', 'The book is BEHIND the table'],
      correctIndex: 0,
      explanation: '"On" indica sobre/em cima de uma superfície.',
      difficulty: 'easy',
    },
  ],

  '6_fund': [
    ...SAMPLE_LESSONS[0].practiceQuestions,
    {
      id: 'q_6f_6',
      subject: 'historia',
      grade: '6_fund',
      topic: 'Mesopotâmia e Egito',
      question: 'Qual rio foi fundamental para o desenvolvimento da agricultura no Egito Antigo?',
      options: ['Rio Nilo', 'Rio Amazonas', 'Rio Tigre', 'Rio Danúbio'],
      correctIndex: 0,
      explanation: 'O Rio Nilo fertilizava as terras egípcias através de suas cheias periódicas.',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_his_2',
      subject: 'historia',
      grade: '6_fund',
      topic: 'Grécia e Roma Antiga',
      question: 'A pólis grega famosa por sua disciplina militar rígida e guerreiros implacáveis era:',
      options: ['Esparta', 'Atenas', 'Corinto', 'Tebas'],
      correctIndex: 0,
      explanation: 'Esparta educava seus cidadãos desde os 7 anos na arte da guerra (agogê).',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_7',
      subject: 'ciencias',
      grade: '6_fund',
      topic: 'Célula e Seres Vivos',
      question: 'A estrutura que abriga o material genético (DNA) na célula eucarionte é:',
      options: ['O núcleo', 'A membrana plasmática', 'A parede celular', 'O citoplasma'],
      correctIndex: 0,
      explanation: 'Nas células eucariontes, o DNA fica protegido dentro da membrana nuclear.',
      difficulty: 'medium',
    },
    {
      id: 'q_6f_cie_2',
      subject: 'ciencias',
      grade: '6_fund',
      topic: 'Atmosfera e Ar',
      question: 'Qual é o gás mais abundante na atmosfera terrestre que respiramos?',
      options: ['Nitrogênio (N2 - cerca de 78%)', 'Oxigênio (O2)', 'Gás Carbônico (CO2)', 'Hélio (He)'],
      correctIndex: 0,
      explanation: 'O nitrogênio compõe aproximadamente 78% do volume do ar atmosférico, seguido pelo oxigênio (21%).',
      difficulty: 'medium',
    },
    {
      id: 'q_6f_8',
      subject: 'geografia',
      grade: '6_fund',
      topic: 'Camadas da Terra',
      question: 'A camada mais externa e sólida da Terra onde vivemos é chamada de:',
      options: ['Crosta terrestre (Litosfera)', 'Manto superior', 'Núcleo externo', 'Núcleo interno'],
      correctIndex: 0,
      explanation: 'A crosta terrestre é a camada superficial rochosa do planeta.',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_geo_2',
      subject: 'geografia',
      grade: '6_fund',
      topic: 'Cartografia e Mapas',
      question: 'A linha imaginária que divide a Terra em Hemisfério Norte e Hemisfério Sul é a:',
      options: ['Linha do Equador', 'Meridiano de Greenwich', 'Trópico de Câncer', 'Círculo Polar Ártico'],
      correctIndex: 0,
      explanation: 'A Linha do Equador (latitude 0º) divide o globo entre os hemisférios Norte e Sul.',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_9',
      subject: 'matematica',
      grade: '6_fund',
      topic: 'MDC e MMC',
      question: 'Qual é o Mínimo Múltiplo Comum (MMC) entre 4 e 6?',
      options: ['12', '24', '10', '2'],
      correctIndex: 0,
      explanation: 'Os múltiplos de 4 são 4, 8, 12, 16... e de 6 são 6, 12, 18... O menor comum é 12.',
      difficulty: 'medium',
    },
    {
      id: 'q_6f_mat_2',
      subject: 'matematica',
      grade: '6_fund',
      topic: 'Potenciação',
      question: 'Quanto vale 3 elevado ao cubo (3³)?',
      options: ['27', '9', '6', '18'],
      correctIndex: 0,
      explanation: '3³ = 3 x 3 x 3 = 27.',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_10',
      subject: 'portugues',
      grade: '6_fund',
      topic: 'Substantivo Coletivo',
      question: 'Qual é o substantivo coletivo para um conjunto de ilhas?',
      options: ['Arquipélago', 'Constelação', 'Cardume', 'Alcateia'],
      correctIndex: 0,
      explanation: 'Arquipélago é o coletivo que designa um grupo de ilhas.',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_por_2',
      subject: 'portugues',
      grade: '6_fund',
      topic: 'Classes Gramaticais',
      question: 'Na frase "Os alunos inteligentes estudaram bastante", a palavra "bastante" funciona como:',
      options: ['Advérbio de intensidade', 'Substantivo', 'Verbo', 'Adjetivo'],
      correctIndex: 0,
      explanation: '"Bastante" intensifica a ação do verbo estudar, atuando como advérbio de intensidade.',
      difficulty: 'medium',
    },
    {
      id: 'q_6f_ing_1',
      subject: 'ingles',
      grade: '6_fund',
      topic: 'Present Continuous',
      question: 'Qual frase está correta no Present Continuous (ação acontecendo agora)?',
      options: ['They are playing soccer', 'They plays soccer', 'They play soccer yesterday', 'They is playing soccer'],
      correctIndex: 0,
      explanation: 'Com "They", usamos "are" + verbo terminado em "-ing": "They are playing".',
      difficulty: 'easy',
    },
    {
      id: 'q_6f_ing_2',
      subject: 'ingles',
      grade: '6_fund',
      topic: 'Possessive Adjectives',
      question: 'Complete: "This is Maria. _____ car is blue."',
      options: ['Her', 'His', 'My', 'Their'],
      correctIndex: 0,
      explanation: '"Her" é o adjetivo possessivo feminino singular (dela).',
      difficulty: 'easy',
    },
  ],

  '7_fund': [
    {
      id: 'q_7f_1',
      subject: 'matematica',
      grade: '7_fund',
      topic: 'Números Negativos',
      question: 'Qual é o resultado de (-8) + (+15)?',
      options: ['+7', '-7', '+23', '-23'],
      correctIndex: 0,
      explanation: 'Ao somar -8 com +15, subtraímos os valores e mantemos o sinal do maior módulo: +7.',
      difficulty: 'easy',
    },
    {
      id: 'q_7f_mat_2',
      subject: 'matematica',
      grade: '7_fund',
      topic: 'Regra de Três Simples',
      question: 'Se 3 cadernos custam R$ 15,00, quanto custarão 6 cadernos?',
      options: ['R$ 30,00', 'R$ 25,00', 'R$ 45,00', 'R$ 20,00'],
      correctIndex: 0,
      explanation: 'Dobrando a quantidade de cadernos, o preço também dobra: 15 x 2 = R$ 30,00.',
      difficulty: 'easy',
    },
    {
      id: 'q_7f_5',
      subject: 'matematica',
      grade: '7_fund',
      topic: 'Equação de 1º Grau',
      question: 'Resolva a equação: 2x + 4 = 14. Qual é o valor de x?',
      options: ['x = 5', 'x = 9', 'x = 7', 'x = 4'],
      correctIndex: 0,
      explanation: '2x = 14 - 4 => 2x = 10 => x = 5.',
      difficulty: 'medium',
    },
    {
      id: 'q_7f_9',
      subject: 'matematica',
      grade: '7_fund',
      topic: 'Ângulos',
      question: 'Como é chamado um ângulo que mede exatamente 90 graus?',
      options: ['Ângulo reto', 'Ângulo agudo', 'Ângulo obtuso', 'Ângulo raso'],
      correctIndex: 0,
      explanation: 'O ângulo reto mede precisamente 90º.',
      difficulty: 'easy',
    },
    {
      id: 'q_7f_2',
      subject: 'ciencias',
      grade: '7_fund',
      topic: 'Reinos dos Seres Vivos',
      question: 'As bactérias pertencem a qual reino de seres vivos?',
      options: ['Reino Monera', 'Reino Fungi', 'Reino Plantae', 'Reino Animalia'],
      correctIndex: 0,
      explanation: 'Bactérias e arqueas são procariontes e constituem o reino Monera.',
      difficulty: 'easy',
    },
    {
      id: 'q_7f_7',
      subject: 'ciencias',
      grade: '7_fund',
      topic: 'Vacinas e Imunidade',
      question: 'Como as vacinas agem no corpo humano?',
      options: ['Estimulam o sistema imunológico a produzir anticorpos de memória', 'Matam bactérias instantaneamente como antibióticos', 'Substituem o sangue doente', 'Aumentam a temperatura corporal para sempre'],
      correctIndex: 0,
      explanation: 'Vacinas apresentam antígenos atenuados para treinar os linfócitos a criar defesas.',
      difficulty: 'medium',
    },
    {
      id: 'q_7f_3',
      subject: 'historia',
      grade: '7_fund',
      topic: 'Feudalismo',
      question: 'No feudalismo da Idade Média europeia, a principal fonte de riqueza e poder era:',
      options: ['A posse da terra (o feudo)', 'O comércio marítimo internacional', 'O trabalho assalariado', 'A indústria manufatureira'],
      correctIndex: 0,
      explanation: 'A economia feudal era agrária e descentralizada com base no feudo.',
      difficulty: 'medium',
    },
    {
      id: 'q_7f_10',
      subject: 'historia',
      grade: '7_fund',
      topic: 'Renascimento',
      question: 'O movimento cultural e artístico dos séculos XIV a XVI que valorizou a razão e a cultura greco-romana foi:',
      options: ['Renascimento Cultural', 'Iluminismo', 'Guerra Fria', 'Cruzadas'],
      correctIndex: 0,
      explanation: 'O Renascimento destacou gênios como Leonardo da Vinci e Michelangelo.',
      difficulty: 'medium',
    },
    {
      id: 'q_7f_4',
      subject: 'geografia',
      grade: '7_fund',
      topic: 'Domínios Morfoclimáticos',
      question: 'O bioma brasileiro com clima semiárido, vegetação com espinhos e cactos chama-se:',
      options: ['Caatinga', 'Pampa', 'Pantanal', 'Mata dos Cocais'],
      correctIndex: 0,
      explanation: 'A Caatinga é exclusiva do Brasil e adaptada à seca.',
      difficulty: 'easy',
    },
    {
      id: 'q_7f_6',
      subject: 'portugues',
      grade: '7_fund',
      topic: 'Sujeito e Predicado',
      question: 'Na oração "Os alunos dedicados venceram a competição", qual é o sujeito simples?',
      options: ['Os alunos dedicados', 'Venceram a competição', 'A competição', 'Dedicados venceram'],
      correctIndex: 0,
      explanation: 'O sujeito é quem pratica a ação expressa no verbo.',
      difficulty: 'easy',
    },
    {
      id: 'q_7f_8',
      subject: 'ingles',
      grade: '7_fund',
      topic: 'Simple Present',
      question: 'Complete com o verbo correto: "She _____ English every day."',
      options: ['studies', 'study', 'studying', 'is study'],
      correctIndex: 0,
      explanation: 'Na 3ª pessoa do singular (He/She/It) no presente simples, adicionamos -s/-es/-ies.',
      difficulty: 'medium',
    },
    {
      id: 'q_7f_ing_2',
      subject: 'ingles',
      grade: '7_fund',
      topic: 'Comparatives',
      question: 'Qual frase usa corretamente o grau comparativo em inglês?',
      options: ['An elephant is bigger than a mouse', 'An elephant is more big than a mouse', 'An elephant is biggest than a mouse', 'An elephant is big than a mouse'],
      correctIndex: 0,
      explanation: 'Para adjetivos curtos como "big", dobramos a consoante e acrescentamos "-er": "bigger than".',
      difficulty: 'medium',
    },
  ],

  '8_fund': [
    ...SAMPLE_LESSONS[1].practiceQuestions,
    {
      id: 'q_8f_6',
      subject: 'matematica',
      grade: '8_fund',
      topic: 'Notação Científica',
      question: 'Como escrevemos o número 35.000 em notação científica?',
      options: ['3,5 x 10⁴', '35 x 10³', '0,35 x 10⁵', '3,5 x 10³'],
      correctIndex: 0,
      explanation: 'Deslocamos a vírgula 4 casas para a esquerda: 3,5 x 10⁴.',
      difficulty: 'medium',
    },
    {
      id: 'q_8f_10',
      subject: 'matematica',
      grade: '8_fund',
      topic: 'Produtos Notáveis',
      question: 'O desenvolvimento do quadrado da soma (x + 3)² é igual a:',
      options: ['x² + 6x + 9', 'x² + 9', 'x² + 3x + 9', '2x + 6'],
      correctIndex: 0,
      explanation: '(x + 3)² = x² + 2(x)(3) + 3² = x² + 6x + 9.',
      difficulty: 'hard',
    },
    {
      id: 'q_8f_7',
      subject: 'historia',
      grade: '8_fund',
      topic: 'Independência do Brasil',
      question: 'Quem proclamou a Independência do Brasil às margens do Rio Ipiranga em 1822?',
      options: ['Dom Pedro I', 'Tiradentes', 'Dom Pedro II', 'Marechal Deodoro'],
      correctIndex: 0,
      explanation: 'Dom Pedro I deu o Grito do Ipiranga em 7 de setembro de 1822.',
      difficulty: 'easy',
    },
    {
      id: 'q_8f_his_2',
      subject: 'historia',
      grade: '8_fund',
      topic: 'Iluminismo e Revolução Francesa',
      question: 'O lema iluminista que guiou a Revolução Francesa de 1789 foi:',
      options: ['Liberdade, Igualdade e Fraternidade', 'Ordem e Progresso', 'Deus, Pátria e Família', 'Pão e Circo'],
      correctIndex: 0,
      explanation: '"Liberté, Égalité, Fraternité" foi o grande lema transformador da Revolução Francesa.',
      difficulty: 'easy',
    },
    {
      id: 'q_8f_8',
      subject: 'geografia',
      grade: '8_fund',
      topic: 'Américas',
      question: 'A cordilheira de montanhas mais extensa da América do Sul é:',
      options: ['Cordilheira dos Andes', 'Montanhas Rochosas', 'Montes Urais', 'Himalaia'],
      correctIndex: 0,
      explanation: 'Os Andes estendem-se por milhares de quilômetros na costa oeste sul-americana.',
      difficulty: 'easy',
    },
    {
      id: 'q_8f_9',
      subject: 'portugues',
      grade: '8_fund',
      topic: 'Vozes Verbais',
      question: 'Em "A carta foi escrita pelo aluno", a oração está em qual voz verbal?',
      options: ['Voz passiva', 'Voz ativa', 'Voz reflexiva', 'Voz recíproca'],
      correctIndex: 0,
      explanation: 'O sujeito "A carta" recebe a ação praticada pelo agente da passiva "o aluno".',
      difficulty: 'medium',
    },
    {
      id: 'q_8f_cie_1',
      subject: 'ciencias',
      grade: '8_fund',
      topic: 'Sistema Nervoso',
      question: 'A unidade básica e funcional do sistema nervoso responsável pela condução de impulsos elétricos é o:',
      options: ['Neurônio', 'Néfron', 'Glóbulo vermelho', 'Alvéolo'],
      correctIndex: 0,
      explanation: 'Os neurônios transmitem sinais através de sinapses químicas e elétricas.',
      difficulty: 'easy',
    },
    {
      id: 'q_8f_ing_1',
      subject: 'ingles',
      grade: '8_fund',
      topic: 'Future with Will and Going to',
      question: 'Complete: "Look at the dark clouds! It _____ rain."',
      options: ['is going to', 'will', 'did', 'was'],
      correctIndex: 0,
      explanation: 'Usamos "be going to" para previsões baseadas em evidências visuais no presente.',
      difficulty: 'medium',
    },
  ],

  '9_fund': [
    {
      id: 'q_9f_1',
      subject: 'matematica',
      grade: '9_fund',
      topic: 'Equação do 2º Grau',
      question: 'Qual fórmula é tradicionalmente usada para encontrar as raízes de uma equação ax² + bx + c = 0?',
      options: ['Fórmula de Bhaskara', 'Teorema de Pitágoras', 'Regra de Três', 'Fórmula de Heron'],
      correctIndex: 0,
      explanation: 'Bhaskara calcula x = (-b ± √Δ) / 2a com Δ = b² - 4ac.',
      difficulty: 'easy',
    },
    {
      id: 'q_9f_2',
      subject: 'ciencias',
      grade: '9_fund',
      topic: 'Química e Tabela Periódica',
      question: 'Qual é o símbolo químico do elemento Ouro na Tabela Periódica?',
      options: ['Au', 'Ag', 'Fe', 'Cu'],
      correctIndex: 0,
      explanation: 'Au vem do latim "Aurum" (brilhante). Ag é prata e Fe é ferro.',
      difficulty: 'easy',
    },
    {
      id: 'q_9f_3',
      subject: 'ciencias',
      grade: '9_fund',
      topic: 'Física - Velocidade Média',
      question: 'Um carro percorre 120 km em 2 horas. Qual foi sua velocidade média?',
      options: ['60 km/h', '120 km/h', '240 km/h', '30 km/h'],
      correctIndex: 0,
      explanation: 'Vm = ΔS / Δt = 120 km / 2 h = 60 km/h.',
      difficulty: 'easy',
    },
    {
      id: 'q_9f_4',
      subject: 'historia',
      grade: '9_fund',
      topic: 'Primeira Guerra Mundial',
      question: 'Qual fato histórico de 1914 deflagrou o início da Primeira Guerra Mundial?',
      options: ['O assassinato do arquiduque Francisco Ferdinando em Sarajevo', 'A queda da Bastilha', 'O ataque a Pearl Harbor', 'A quebra da Bolsa de Nova York'],
      correctIndex: 0,
      explanation: 'O atentado contra o herdeiro austro-húngaro ativou o sistema de alianças militares.',
      difficulty: 'medium',
    },
    {
      id: 'q_9f_5',
      subject: 'matematica',
      grade: '9_fund',
      topic: 'Teorema de Pitágoras',
      question: 'Em um triângulo retângulo com catetos medindo 3 cm e 4 cm, a hipotenusa mede:',
      options: ['5 cm', '7 cm', '6 cm', '8 cm'],
      correctIndex: 0,
      explanation: 'a² = 3² + 4² = 9 + 16 = 25 => a = √25 = 5 cm.',
      difficulty: 'medium',
    },
    {
      id: 'q_9f_6',
      subject: 'portugues',
      grade: '9_fund',
      topic: 'Orações Coordenadas',
      question: 'Na frase "Ele estudou muito, porém não conseguiu a nota", a conjunção "porém" expressa ideia de:',
      options: ['Adversidade / oposição', 'Conclusão', 'Explicação', 'Adição'],
      correctIndex: 0,
      explanation: '"Porém", "mas", "contudo" e "todavia" são conjunções adversativas.',
      difficulty: 'easy',
    },
    {
      id: 'q_9f_7',
      subject: 'geografia',
      grade: '9_fund',
      topic: 'Globalização',
      question: 'A integração econômica, cultural e tecnológica entre diferentes nações do mundo é chamada de:',
      options: ['Globalização', 'Protecionismo', 'Isolacionismo', 'Feudalismo'],
      correctIndex: 0,
      explanation: 'A globalização encurtou distâncias por meio das telecomunicações e transportes modernos.',
      difficulty: 'easy',
    },
    {
      id: 'q_9f_8',
      subject: 'ciencias',
      grade: '9_fund',
      topic: 'Genética',
      question: 'Quem é considerado o "Pai da Genética" por seus experimentos com ervilhas?',
      options: ['Gregor Mendel', 'Charles Darwin', 'Louis Pasteur', 'Albert Einstein'],
      correctIndex: 0,
      explanation: 'Mendel formulou as leis da hereditariedade cruzando linhagens de ervilhas.',
      difficulty: 'medium',
    },
    {
      id: 'q_9f_9',
      subject: 'ingles',
      grade: '9_fund',
      topic: 'Modal Verbs',
      question: 'Qual verbo modal indica uma obrigação ou necessidade forte?',
      options: ['Must', 'Might', 'Could', 'May'],
      correctIndex: 0,
      explanation: '"Must" expressa dever/obrigação estrita (ex: You must study).',
      difficulty: 'medium',
    },
    {
      id: 'q_9f_10',
      subject: 'matematica',
      grade: '9_fund',
      topic: 'Função Afim',
      question: 'Na função f(x) = 3x - 5, qual é o valor de f(4)?',
      options: ['7', '12', '9', '-1'],
      correctIndex: 0,
      explanation: 'f(4) = 3(4) - 5 = 12 - 5 = 7.',
      difficulty: 'medium',
    },
  ],

  '1_medio': [
    ...SAMPLE_LESSONS[2].practiceQuestions,
    {
      id: 'q_1m_6',
      subject: 'fisica',
      grade: '1_medio',
      topic: 'Leis de Newton',
      question: 'A 2ª Lei de Newton (Princípio Fundamental da Dinâmica) é expressa matematicamente por:',
      options: ['F = m . a', 'E = m . c²', 'V = d / t', 'P = U . i'],
      correctIndex: 0,
      explanation: 'Força resultante é o produto da massa do corpo pela aceleração adquirida (F = m . a).',
      difficulty: 'easy',
    },
    {
      id: 'q_1m_fis_2',
      subject: 'fisica',
      grade: '1_medio',
      topic: 'Cinemática Escalar',
      question: 'Um móvel parte do repouso e atinge a velocidade de 20 m/s em 4 segundos. Sua aceleração média foi:',
      options: ['5 m/s²', '80 m/s²', '16 m/s²', '2,5 m/s²'],
      correctIndex: 0,
      explanation: 'a = Δv / Δt = (20 - 0) / 4 = 5 m/s².',
      difficulty: 'easy',
    },
    {
      id: 'q_1m_7',
      subject: 'quimica',
      grade: '1_medio',
      topic: 'Modelos Atômicos',
      question: 'Qual cientista propôs o modelo atômico com elétrons girando em órbitas quantizadas de energia?',
      options: ['Niels Bohr', 'John Dalton', 'J.J. Thomson', 'Ernest Rutherford'],
      correctIndex: 0,
      explanation: 'Bohr aperfeiçoou o modelo de Rutherford introduzindo níveis de energia quantizados.',
      difficulty: 'medium',
    },
    {
      id: 'q_1m_qui_2',
      subject: 'quimica',
      grade: '1_medio',
      topic: 'Ligações Químicas',
      question: 'A ligação formada pela atração eletrostática entre um metal (que doa elétrons) e um não metal (que recebe) é a ligação:',
      options: ['Iônica', 'Covalente simples', 'Metálica', 'Ponte de hidrogênio'],
      correctIndex: 0,
      explanation: 'A ligação iônica ocorre por transferência definitiva de elétrons formando cátions e ânions.',
      difficulty: 'easy',
    },
    {
      id: 'q_1m_8',
      subject: 'biologia',
      grade: '1_medio',
      topic: 'Membrana Plasmática',
      question: 'O modelo que descreve a estrutura dinâmica da membrana celular com fosfolipídios e proteínas é o:',
      options: ['Mosaico Fluido', 'Pudim de Passas', 'Dupla Hélice', 'Célula Fechada'],
      correctIndex: 0,
      explanation: 'Proposto por Singer e Nicolson em 1972, descreve a fluidez da bicamada lipídica.',
      difficulty: 'medium',
    },
    {
      id: 'q_1m_bio_2',
      subject: 'biologia',
      grade: '1_medio',
      topic: 'Organelas Celulares',
      question: 'Qual organela citoplasmática é a principal responsável pela respiração celular e produção de ATP?',
      options: ['Mitocôndria', 'Complexo de Golgi', 'Lisossomo', 'Retículo Endoplasmático'],
      correctIndex: 0,
      explanation: 'As mitocôndrias produzem a maior parte do ATP através do ciclo de Krebs e cadeia respiratória.',
      difficulty: 'easy',
    },
    {
      id: 'q_1m_9',
      subject: 'matematica',
      grade: '1_medio',
      topic: 'Conjuntos e Funções',
      question: 'Uma função f(x) = ax + b é estritamente crescente quando o coeficiente angular "a" é:',
      options: ['Maior que zero (a > 0)', 'Menor que zero (a < 0)', 'Igual a zero (a = 0)', 'Negativo fracionário'],
      correctIndex: 0,
      explanation: 'Se a > 0, à medida que x aumenta, f(x) também aumenta.',
      difficulty: 'easy',
    },
    {
      id: 'q_1m_10',
      subject: 'historia',
      grade: '1_medio',
      topic: 'Grécia Antiga',
      question: 'Qual pólis (cidade-estado) grega é famosa pelo nascimento da Democracia direta na Antiguidade?',
      options: ['Atenas', 'Esparta', 'Tebas', 'Corinto'],
      correctIndex: 0,
      explanation: 'Atenas desenvolveu a democracia na praça pública (Ágora).',
      difficulty: 'easy',
    },
    {
      id: 'q_1m_geo_1',
      subject: 'geografia',
      grade: '1_medio',
      topic: 'Estrutura Geológica e Placas Tectônicas',
      question: 'O movimento em que duas placas tectônicas colidem uma contra a outra é chamado de limite:',
      options: ['Convergente', 'Divergente', 'Transformante', 'Estático'],
      correctIndex: 0,
      explanation: 'Limites convergentes provocam subducção ou orogênese (formação de cadeias montanhosas).',
      difficulty: 'medium',
    },
    {
      id: 'q_1m_ing_1',
      subject: 'ingles',
      grade: '1_medio',
      topic: 'First Conditional',
      question: 'Complete: "If it rains tomorrow, we _____ stay at home."',
      options: ['will', 'would', 'did', 'have'],
      correctIndex: 0,
      explanation: 'A First Conditional usa "If + Present Simple" na oração condicional e "Will + verbo base" na oração principal.',
      difficulty: 'medium',
    },
  ],

  '2_medio': [
    {
      id: 'q_2m_1',
      subject: 'quimica',
      grade: '2_medio',
      topic: 'Termoquímica',
      question: 'Uma reação química que libera calor para o ambiente e tem variação de entalpia negativa (ΔH < 0) é:',
      options: ['Exotérmica', 'Endotérmica', 'Isotérmica', 'Adiabática'],
      correctIndex: 0,
      explanation: 'Reações exotérmicas liberam energia na forma de calor para o meio.',
      difficulty: 'easy',
    },
    {
      id: 'q_2m_7',
      subject: 'quimica',
      grade: '2_medio',
      topic: 'Soluções e Concentração',
      question: 'Se dissolvermos 20g de sal em água até completar 1 litro de solução, a concentração comum é:',
      options: ['20 g/L', '10 g/L', '40 g/L', '0,2 g/L'],
      correctIndex: 0,
      explanation: 'C = m / V = 20 g / 1 L = 20 g/L.',
      difficulty: 'easy',
    },
    {
      id: 'q_2m_2',
      subject: 'fisica',
      grade: '2_medio',
      topic: 'Termologia e Escalas',
      question: 'Qual temperatura na escala Celsius corresponde ao ponto de fusão do gelo ao nível do mar?',
      options: ['0 ºC', '100 ºC', '32 ºC', '-273 ºC'],
      correctIndex: 0,
      explanation: 'O gelo funde a 0 ºC (32 ºF / 273 K).',
      difficulty: 'easy',
    },
    {
      id: 'q_2m_6',
      subject: 'fisica',
      grade: '2_medio',
      topic: 'Óptica Geométrica',
      question: 'O arco-íris e a separação da luz branca em várias cores ao atravessar um prisma é devido ao fenômeno da:',
      options: ['Refração e dispersão da luz', 'Reflexão total', 'Polarização', 'Difração sonora'],
      correctIndex: 0,
      explanation: 'Cada frequência de luz refrata em um ângulo diferente ao mudar de meio.',
      difficulty: 'medium',
    },
    {
      id: 'q_2m_3',
      subject: 'biologia',
      grade: '2_medio',
      topic: 'Botânica',
      question: 'Qual grupo vegetal foi o primeiro a desenvolver sementes protegidas no interior de frutos?',
      options: ['Angiospermas', 'Gimnospermas', 'Pteridófitas', 'Briófitas'],
      correctIndex: 0,
      explanation: 'As angiospermas são as plantas com flores e frutos verdadeiros.',
      difficulty: 'medium',
    },
    {
      id: 'q_2m_4',
      subject: 'matematica',
      grade: '2_medio',
      topic: 'Trigonometria',
      question: 'Qual é o valor do seno de um ângulo de 30 graus (sen 30º)?',
      options: ['1/2 (ou 0,5)', '√3/2', '√2/2', '1'],
      correctIndex: 0,
      explanation: 'Na tabela dos ângulos notáveis, sen 30º = 1/2 e cos 60º = 1/2.',
      difficulty: 'easy',
    },
    {
      id: 'q_2m_9',
      subject: 'matematica',
      grade: '2_medio',
      topic: 'Matrizes e Determinantes',
      question: 'O determinante da matriz 2x2 com linhas [3, 2] e [1, 4] é:',
      options: ['10', '14', '6', '12'],
      correctIndex: 0,
      explanation: 'Det = (3 x 4) - (2 x 1) = 12 - 2 = 10.',
      difficulty: 'medium',
    },
    {
      id: 'q_2m_5',
      subject: 'portugues',
      grade: '2_medio',
      topic: 'Romantismo no Brasil',
      question: 'O poema "Canção do Exílio" ("Minha terra tem palmeiras, onde canta o sabiá...") foi escrito por:',
      options: ['Gonçalves Dias', 'Castro Alves', 'Álvares de Azevedo', 'Casimiro de Abreu'],
      correctIndex: 0,
      explanation: 'Gonçalves Dias é o ícone da 1ª geração romântica nacionalista.',
      difficulty: 'medium',
    },
    {
      id: 'q_2m_8',
      subject: 'historia',
      grade: '2_medio',
      topic: 'Brasil Império',
      question: 'O período em que Dom Pedro II governou o Brasil por quase 50 anos é conhecido como:',
      options: ['Segundo Reinado', 'Primeiro Reinado', 'República Velha', 'Regência Una'],
      correctIndex: 0,
      explanation: 'O Segundo Reinado durou de 1840 (Golpe da Maioridade) até 1889.',
      difficulty: 'easy',
    },
    {
      id: 'q_2m_10',
      subject: 'geografia',
      grade: '2_medio',
      topic: 'Fontes de Energia',
      question: 'Qual fonte de energia limpa e renovável aproveita a força dos ventos?',
      options: ['Energia Eólica', 'Energia Termelétrica', 'Energia Nuclear', 'Carvão Mineral'],
      correctIndex: 0,
      explanation: 'Aerogeradores convertem a energia cinética do vento em eletricidade.',
      difficulty: 'easy',
    },
    {
      id: 'q_2m_ing_1',
      subject: 'ingles',
      grade: '2_medio',
      topic: 'Phrasal Verbs',
      question: 'O que significa o phrasal verb "give up" na frase "Never give up on your dreams"?',
      options: ['Desistir', 'Começar', 'Acelerar', 'Esquecer'],
      correctIndex: 0,
      explanation: '"Give up" significa desistir ou renunciar.',
      difficulty: 'easy',
    },
  ],

  '3_medio': [
    {
      id: 'q_3m_1',
      subject: 'quimica',
      grade: '3_medio',
      topic: 'Química Orgânica',
      question: 'Compostos formados exclusivamente por átomos de carbono e hidrogênio são chamados de:',
      options: ['Hidrocarbonetos', 'Álcoois', 'Ésteres', 'Aminas'],
      correctIndex: 0,
      explanation: 'Hidrocarbonetos (como metano, propano e gasolina) contêm apenas C e H.',
      difficulty: 'easy',
    },
    {
      id: 'q_3m_9',
      subject: 'quimica',
      grade: '3_medio',
      topic: 'Isomeria Plana',
      question: 'Compostos que possuem a mesma fórmula molecular mas fórmulas estruturais diferentes são chamados de:',
      options: ['Isômeros', 'Polímeros', 'Isótopos', 'Alótropos'],
      correctIndex: 0,
      explanation: 'Isomeria ocorre quando a mesma composição atômica gera arranjos moleculares distintos.',
      difficulty: 'medium',
    },
    {
      id: 'q_3m_2',
      subject: 'fisica',
      grade: '3_medio',
      topic: 'Eletrodinâmica',
      question: 'A 1ª Lei de Ohm que relaciona Tensão (U), Resistência (R) e Corrente (i) é:',
      options: ['U = R . i', 'P = m . g', 'F = q . E', 'B = μ . i'],
      correctIndex: 0,
      explanation: 'A ddp é proporcional à corrente elétrica através da resistência (U = R.i).',
      difficulty: 'easy',
    },
    {
      id: 'q_3m_8',
      subject: 'fisica',
      grade: '3_medio',
      topic: 'Eletromagnetismo',
      question: 'A criação de uma corrente elétrica a partir da variação de um campo magnético é o princípio da:',
      options: ['Indução Eletromagnética (Faraday)', 'Gravitação Universal', 'Termodinâmica', 'Lei de Coulomb'],
      correctIndex: 0,
      explanation: 'A indução de Faraday é a base do funcionamento de geradores e usinas hidrelétricas.',
      difficulty: 'medium',
    },
    {
      id: 'q_3m_3',
      subject: 'biologia',
      grade: '3_medio',
      topic: 'Ecologia',
      question: 'A relação ecológica entre abelhas e flores, na qual ambas as espécies se beneficiam, é um exemplo de:',
      options: ['Mutualismo', 'Parasitismo', 'Predatismo', 'Amensalismo'],
      correctIndex: 0,
      explanation: 'No mutualismo interespecífico, ambos os seres envolvidos obtêm vantagens mútuas.',
      difficulty: 'easy',
    },
    {
      id: 'q_3m_4',
      subject: 'matematica',
      grade: '3_medio',
      topic: 'Geometria Analítica',
      question: 'A distância entre a origem (0,0) e o ponto P(3, 4) no plano cartesiano é:',
      options: ['5 unidades', '7 unidades', '6 unidades', '25 unidades'],
      correctIndex: 0,
      explanation: 'd = √(3² + 4²) = √(9 + 16) = √25 = 5.',
      difficulty: 'easy',
    },
    {
      id: 'q_3m_7',
      subject: 'matematica',
      grade: '3_medio',
      topic: 'Probabilidade',
      question: 'Ao lançar um dado justo de 6 faces, qual é a probabilidade de sair um número par?',
      options: ['3/6 (ou 50%)', '1/6', '2/6', '4/6'],
      correctIndex: 0,
      explanation: 'Os números pares são {2, 4, 6}, ou seja, 3 em 6 casos possíveis (50%).',
      difficulty: 'easy',
    },
    {
      id: 'q_3m_5',
      subject: 'portugues',
      grade: '3_medio',
      topic: 'Modernismo Brasileiro',
      question: 'Qual evento marco inaugurou oficialmente o Modernismo no Brasil em 1922?',
      options: ['Semana de Arte Moderna em São Paulo', 'A Proclamação da República', 'O Manifesto Antropófago', 'A fundação da ABL'],
      correctIndex: 0,
      explanation: 'A Semana de 22 ocorreu no Theatro Municipal de SP em fevereiro de 1922.',
      difficulty: 'medium',
    },
    {
      id: 'q_3m_6',
      subject: 'historia',
      grade: '3_medio',
      topic: 'Guerra Fria',
      question: 'O confronto geopolítico e ideológico indireto entre EUA (capitalismo) e URSS (socialismo) foi a:',
      options: ['Guerra Fria', 'Primeira Guerra Mundial', 'Guerra do Vietnã', 'Guerra das Rosas'],
      correctIndex: 0,
      explanation: 'A Guerra Fria durou do fim da Segunda Guerra Mundial até 1991.',
      difficulty: 'easy',
    },
    {
      id: 'q_3m_10',
      subject: 'geografia',
      grade: '3_medio',
      topic: 'Urbanização e Metrópoles',
      question: 'A conurbação de duas ou mais metrópoles criando uma gigantesca mancha urbana contínua é chamada de:',
      options: ['Megalópole', 'Megacidade', 'Tecnopolo', 'Distrito Industrial'],
      correctIndex: 0,
      explanation: 'Megalópoles se formam pela união funcional de complexos metropolitanos.',
      difficulty: 'medium',
    },
    {
      id: 'q_3m_ing_1',
      subject: 'ingles',
      grade: '3_medio',
      topic: 'False Friends (Falsos Cognatos)',
      question: 'A palavra em inglês "actually" significa:',
      options: ['Na verdade / Realmente', 'Atualmente', 'Eventualmente', 'Atualmente no momento'],
      correctIndex: 0,
      explanation: '"Actually" significa na verdade. Para dizer "atualmente", usa-se "currently" ou "nowadays".',
      difficulty: 'medium',
    },
  ],

  'enem': [
    ...SAMPLE_LESSONS[3].practiceQuestions,
    {
      id: 'q_enem_6',
      subject: 'biologia',
      grade: 'enem',
      topic: 'Biotecnologia',
      question: 'Organismos que receberam e incorporaram genes de outra espécie por engenharia genética são chamados de:',
      options: ['Transgênicos (OGMs)', 'Clones', 'Mutantes aleatórios', 'Fósseis vivos'],
      correctIndex: 0,
      explanation: 'Transgênicos possuem sequências de DNA recombinante de outras espécies.',
      difficulty: 'medium',
    },
    {
      id: 'q_enem_7',
      subject: 'matematica',
      grade: 'enem',
      topic: 'Estatística - Média, Moda e Mediana',
      question: 'Em um conjunto de dados [2, 4, 4, 7, 8], qual valor representa a Moda?',
      options: ['4 (valor mais frequente)', '5 (média aritmética)', '7', '2'],
      correctIndex: 0,
      explanation: 'A moda é o elemento que aparece com maior frequência no conjunto.',
      difficulty: 'easy',
    },
    {
      id: 'q_enem_8',
      subject: 'geografia',
      grade: 'enem',
      topic: 'Aquecimento Global e Efeito Estufa',
      question: 'O principal gás de efeito estufa emitido pela queima maciça de combustíveis fósseis é:',
      options: ['Dióxido de Carbono (CO2)', 'Gás Ozônio (O3)', 'Hélio (He)', 'Nitrogênio (N2)'],
      correctIndex: 0,
      explanation: 'O CO2 retém a radiação infravermelha, elevando a temperatura média global.',
      difficulty: 'easy',
    },
    {
      id: 'q_enem_9',
      subject: 'portugues',
      grade: 'enem',
      topic: 'Interpretação e Coesão',
      question: 'A anáfora na construção textual consiste em:',
      options: ['Retomar um termo ou ideia já mencionado anteriormente no texto', 'Antecipar um termo que ainda será dito', 'Repetir sons consonantais', 'Usar termos estrangeiros'],
      correctIndex: 0,
      explanation: 'A coesão anafórica recupera referentes anteriores para evitar repetições desnecessárias.',
      difficulty: 'medium',
    },
    {
      id: 'q_enem_10',
      subject: 'fisica',
      grade: 'enem',
      topic: 'Consumo de Energia Elétrica',
      question: 'Um chuveiro elétrico de 5.000 W (5 kW) ligado por 2 horas consome quanta energia em kWh?',
      options: ['10 kWh', '2,5 kWh', '10.000 kWh', '25 kWh'],
      correctIndex: 0,
      explanation: 'Energia = Potência x Tempo = 5 kW x 2 h = 10 kWh.',
      difficulty: 'easy',
    },
    {
      id: 'q_enem_qui_1',
      subject: 'quimica',
      grade: 'enem',
      topic: 'Eletroquímica e Pilhas',
      question: 'Em uma pilha galvânica (como a pilha de Daniell), a oxidação ocorre em qual polo?',
      options: ['No Ânodo (polo negativo)', 'No Cátodo (polo positivo)', 'Na ponte salina', 'No voltímetro'],
      correctIndex: 0,
      explanation: 'Regra mnemônica CROA: Cátodo Reduz, Oxida no Ânodo.',
      difficulty: 'medium',
    },
    {
      id: 'q_enem_his_1',
      subject: 'historia',
      grade: 'enem',
      topic: 'Ditadura Militar e Redemocratização',
      question: 'O movimento popular de 1983-1984 que exigia eleições presidenciais diretas no Brasil ficou conhecido como:',
      options: ['Diretas Já', 'Caras-Pintadas', 'Revolta da Vacina', 'Marcha dos 100 Mil'],
      correctIndex: 0,
      explanation: 'As "Diretas Já" mobilizaram milhões de brasileiros em prol da Emenda Dante de Oliveira.',
      difficulty: 'easy',
    },
    {
      id: 'q_enem_ing_1',
      subject: 'ingles',
      grade: 'enem',
      topic: 'ENEM Reading Comprehension',
      question: 'Ao responder questões de Língua Inglesa do ENEM, a estratégia "Skimming" consiste em:',
      options: ['Fazer uma leitura rápida para captar a ideia geral e o tema central do texto', 'Procurar uma palavra-chave específica (Scanning)', 'Traduzir palavra por palavra no dicionário', 'Ler de trás para frente'],
      correctIndex: 0,
      explanation: 'Skimming é a técnica de leitura dinâmica para identificar a ideia global do texto.',
      difficulty: 'easy',
    },
  ],
};

// Tiebreaker questions specifically built from lighter questions of the grade below!
export function getTiebreakerQuestions(grade: GradeLevel): Question[] {
  const previousGrade = GRADE_LABELS[grade].previousGrade;
  
  if (!previousGrade) {
    // 1_fund fallback tiebreakers: ultra-easy questions
    return [
      {
        id: 'tb_1_1',
        subject: 'matematica',
        grade: '1_fund',
        topic: 'Desempate Rápido',
        question: '⭐ DESEMPATE: Quanto é 1 + 1?',
        options: ['2', '1', '3', '0'],
        correctIndex: 0,
        explanation: '1 + 1 = 2!',
        difficulty: 'easy',
        isTiebreaker: true,
      },
      {
        id: 'tb_1_2',
        subject: 'portugues',
        grade: '1_fund',
        topic: 'Desempate Rápido',
        question: '⭐ DESEMPATE: Qual a cor da banana madura?',
        options: ['Amarela', 'Azul', 'Vermelha', 'Roxa'],
        correctIndex: 0,
        explanation: 'A banana madura é amarela.',
        difficulty: 'easy',
        isTiebreaker: true,
      },
      {
        id: 'tb_1_3',
        subject: 'ciencias',
        grade: '1_fund',
        topic: 'Desempate Rápido',
        question: '⭐ DESEMPATE: Quantas pernas tem um pato?',
        options: ['2 pernas', '4 pernas', '6 pernas', '1 perna'],
        correctIndex: 0,
        explanation: 'O pato é uma ave bípede e tem 2 pernas!',
        difficulty: 'easy',
        isTiebreaker: true,
      },
    ];
  }

  // Pick questions from the previous grade and format them with "DESEMPATE" badge
  const pool = CURRICULUM_QUESTIONS_POOL[previousGrade] || CURRICULUM_QUESTIONS_POOL['1_fund'];
  return pool.slice(0, 5).map((q, idx) => ({
    ...q,
    id: `tb_${previousGrade}_${idx}`,
    question: `⭐ DESEMPATE (${GRADE_LABELS[previousGrade].short}): ${q.question}`,
    isTiebreaker: true,
  }));
}

/**
 * Utility to randomly shuffle the options of a single question and update its correctIndex.
 * Guarantees that the correct answer is NOT always in position A (index 0).
 */
export function shuffleQuestionOptions(question: Question): Question {
  if (!question.options || question.options.length <= 1) return question;

  const correctText = question.options[question.correctIndex];
  // Pair each option with a random key for Fisher-Yates / unbiased shuffle
  const paired = question.options.map((opt) => ({ opt, sort: Math.random() }));
  paired.sort((a, b) => a.sort - b.sort);

  const newOptions = paired.map((p) => p.opt);
  let newCorrectIndex = newOptions.indexOf(correctText);
  if (newCorrectIndex === -1) {
    newCorrectIndex = 0;
  }

  return {
    ...question,
    options: newOptions,
    correctIndex: newCorrectIndex,
  };
}

/**
 * Helper to retrieve all curated questions across all grades for a specific subject.
 * Guarantees that only questions from that exact subject are returned.
 */
export function getAllQuestionsForSubject(subject: SubjectId): Question[] {
  const allQuestions: Question[] = [];

  // 1. From sample lessons
  for (const lesson of SAMPLE_LESSONS) {
    if (lesson.subject === subject) {
      allQuestions.push(...lesson.practiceQuestions);
    }
  }

  // 2. From all grade pools
  for (const gradeKey of Object.keys(CURRICULUM_QUESTIONS_POOL) as GradeLevel[]) {
    const gradePool = CURRICULUM_QUESTIONS_POOL[gradeKey] || [];
    for (const q of gradePool) {
      if (q.subject === subject) {
        allQuestions.push(q);
      }
    }
  }

  return allQuestions;
}

// Function to generate dynamic, BNCC-accurate unique procedural questions for any grade and subject
export function generateProceduralQuestions(
  grade: GradeLevel,
  subject: SubjectId,
  count: number,
  excludeTexts: Set<string>
): Question[] {
  const result: Question[] = [];
  const subjInfo = SUBJECTS.find((s) => s.id === subject);
  const subjName = subjInfo?.name || 'Estudos';
  const gradeLabel = GRADE_LABELS[grade]?.short || 'Série';

  // Bank of specialized dynamic question generators by subject
  const generators: Array<() => Question | null> = [];

  if (grade === '1_fund') {
    if (subject === 'matematica') {
      // 1. Additions up to 10
      for (let a = 1; a <= 5; a++) {
        for (let b = 1; b <= 5; b++) {
          generators.push(() => {
            const sum = a + b;
            const qText = `Quanto é ${a} + ${b}?`;
            if (excludeTexts.has(qText.toLowerCase())) return null;
            return {
              id: `dyn_mat_add_${a}_${b}_${Date.now()}`,
              subject: 'matematica',
              grade: '1_fund',
              topic: 'Adição Simples',
              question: qText,
              options: [`${sum}`, `${sum + 1}`, `${Math.max(1, sum - 1)}`, `${sum + 2}`],
              correctIndex: 0,
              explanation: `Juntando ${a} com mais ${b}, temos exatamente ${sum}.`,
              difficulty: 'easy',
            };
          });
        }
      }

      // 2. Subtractions within 10
      const subPairs = [[4, 1], [5, 2], [6, 1], [5, 3], [7, 2], [8, 3], [6, 3], [9, 2], [10, 5], [3, 2], [4, 3], [8, 4], [7, 3]];
      for (const [a, b] of subPairs) {
        generators.push(() => {
          const diff = a - b;
          const qText = `Se você tinha ${a} figurinhas e deu ${b} para seu amigo, quantas restaram?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          return {
            id: `dyn_mat_sub_${a}_${b}_${Date.now()}`,
            subject: 'matematica',
            grade: '1_fund',
            topic: 'Subtração Básica',
            question: qText,
            options: [`${diff} figurinhas`, `${diff + 1} figurinhas`, `${Math.max(1, diff - 1)} figurinhas`, `${diff + 2} figurinhas`],
            correctIndex: 0,
            explanation: `Diminuindo ${b} de ${a}, sobram exatamente ${diff} figurinhas.`,
            difficulty: 'easy',
          };
        });
      }

      // 3. Shapes
      const shapes = [
        { shape: 'Círculo', obj: 'Uma bola de futebol', hint: 'redondinha e sem pontas' },
        { shape: 'Quadrado', obj: 'Uma janela com 4 lados iguais', hint: 'quatro lados retinhos e iguais' },
        { shape: 'Triângulo', obj: 'Uma fatia de pizza triangular', hint: 'três pontas (três lados)' },
        { shape: 'Retângulo', obj: 'A tela de uma televisão ou porta', hint: 'dois lados compridos e dois mais curtos' },
      ];
      for (const sh of shapes) {
        generators.push(() => {
          const qText = `Qual destes objetos tem o formato parecido com um ${sh.shape}?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          return {
            id: `dyn_mat_sh_${sh.shape}_${Date.now()}`,
            subject: 'matematica',
            grade: '1_fund',
            topic: 'Formas Geométricas',
            question: qText,
            options: [sh.obj, 'Um lápis pontudo', 'Uma régua quebrada', 'Uma nuvem no céu'],
            correctIndex: 0,
            explanation: `O ${sh.shape} tem o formato característico de ${sh.hint}.`,
            difficulty: 'easy',
          };
        });
      }

      // 4. Greater than / Counting
      const compNumbers = [[7, 2], [9, 4], [8, 5], [6, 1], [10, 3], [5, 0]];
      for (const [m1, m2] of compNumbers) {
        generators.push(() => {
          const qText = `Qual número representa a MAIOR quantidade: ${m1} ou ${m2}?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          return {
            id: `dyn_mat_cmp_${m1}_${m2}_${Date.now()}`,
            subject: 'matematica',
            grade: '1_fund',
            topic: 'Comparação de Quantidades',
            question: qText,
            options: [`O número ${m1}`, `O número ${m2}`, 'São quantidades iguais', 'Nenhum dos dois'],
            correctIndex: 0,
            explanation: `O número ${m1} tem mais unidades do que o ${m2}.`,
            difficulty: 'easy',
          };
        });
      }
    }

    if (subject === 'portugues') {
      const words = [
        { word: 'GATO', letter: 'G', vow: 2, sil: 2 },
        { word: 'SAPO', letter: 'S', vow: 2, sil: 2 },
        { word: 'VACA', letter: 'V', vow: 2, sil: 2 },
        { word: 'PATO', letter: 'P', vow: 2, sil: 2 },
        { word: 'LEÃO', letter: 'L', vow: 3, sil: 2 },
        { word: 'URSO', letter: 'U', vow: 2, sil: 2 },
        { word: 'MACACO', letter: 'M', vow: 3, sil: 3 },
        { word: 'ZEBRA', letter: 'Z', vow: 2, sil: 2 },
        { word: 'BONECA', letter: 'B', vow: 3, sil: 3 },
        { word: 'PIPA', letter: 'P', vow: 2, sil: 2 },
        { word: 'CASA', letter: 'C', vow: 2, sil: 2 },
        { word: 'ESTRELA', letter: 'E', vow: 3, sil: 3 },
      ];

      for (const w of words) {
        generators.push(() => {
          const qText = `Qual é a PRIMEIRA letra da palavra ${w.word}?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          const otherLetters = ['A', 'B', 'M', 'T', 'D'].filter((l) => l !== w.letter).slice(0, 3);
          return {
            id: `dyn_por_let_${w.word}_${Date.now()}`,
            subject: 'portugues',
            grade: '1_fund',
            topic: 'Letra Inicial',
            question: qText,
            options: [`Letra ${w.letter}`, `Letra ${otherLetters[0]}`, `Letra ${otherLetters[1]}`, `Letra ${otherLetters[2]}`],
            correctIndex: 0,
            explanation: `A palavra ${w.word} começa com o som da letra ${w.letter}.`,
            difficulty: 'easy',
          };
        });

        generators.push(() => {
          const qText = `Quantos pedacinhos (sílabas) tem a palavra ${w.word} ao falar em voz alta?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          return {
            id: `dyn_por_sil_${w.word}_${Date.now()}`,
            subject: 'portugues',
            grade: '1_fund',
            topic: 'Separação Silábica',
            question: qText,
            options: [`${w.sil} sílabas`, `${w.sil + 1} sílabas`, `${Math.max(1, w.sil - 1)} sílabas`, `${w.sil + 2} sílabas`],
            correctIndex: 0,
            explanation: `Ao pronunciar ${w.word} pausadamente batendo palmas, abrimos a boca ${w.sil} vezes.`,
            difficulty: 'easy',
          };
        });
      }

      // Rhymes
      const rhymes = [
        { p1: 'PATO', p2: 'GATO', wrong: ['BOLA', 'MESA', 'SAPATO'] },
        { p1: 'BOLA', p2: 'MOLA', wrong: ['DADO', 'GATO', 'CARRO'] },
        { p1: 'SOL', p2: 'CARACOL', wrong: ['LUA', 'CHUVA', 'VENTO'] },
        { p1: 'PANELA', p2: 'JANELA', wrong: ['PRATO', 'COPO', 'GARFO'] },
        { p1: 'MÃO', p2: 'AVIÃO', wrong: ['PÉ', 'OLHO', 'BOCA'] },
      ];
      for (const rh of rhymes) {
        generators.push(() => {
          const qText = `Qual destas palavras RIMA (combina no final) com a palavra ${rh.p1}?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          return {
            id: `dyn_por_rhy_${rh.p1}_${Date.now()}`,
            subject: 'portugues',
            grade: '1_fund',
            topic: 'Rimas Infantis',
            question: qText,
            options: [rh.p2, rh.wrong[0], rh.wrong[1], rh.wrong[2]],
            correctIndex: 0,
            explanation: `${rh.p1} rima com ${rh.p2} porque ambas terminam com o mesmo som final!`,
            difficulty: 'easy',
          };
        });
      }
    }

    if (subject === 'ciencias') {
      const senses = [
        { action: 'ouvir uma bela música e a voz dos amigos', sense: 'Audição (Ouvidos)' },
        { action: 'enxergar as cores do arco-íris e ler historinhas', sense: 'Visão (Olhos)' },
        { action: 'sentir o cheirinho gostoso de um bolo assando', sense: 'Olfato (Nariz)' },
        { action: 'saborear o gosto doce de uma maçã ou sorvete', sense: 'Paladar (Língua/Boca)' },
        { action: 'sentir se um ursinho de pelúcia é macio ou fofinho', sense: 'Tato (Pele/Mãos)' },
      ];
      for (const sn of senses) {
        generators.push(() => {
          const qText = `Qual sentido do nosso corpo usamos para ${sn.action}?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          const otherSenses = ['Visão', 'Audição', 'Olfato', 'Tato', 'Paladar'].filter((s) => !sn.sense.includes(s)).slice(0, 3);
          return {
            id: `dyn_cie_sn_${sn.sense}_${Date.now()}`,
            subject: 'ciencias',
            grade: '1_fund',
            topic: 'Cinco Sentidos',
            question: qText,
            options: [sn.sense, otherSenses[0], otherSenses[1], otherSenses[2]],
            correctIndex: 0,
            explanation: `Para ${sn.action}, usamos o sentido da ${sn.sense}.`,
            difficulty: 'easy',
          };
        });
      }

      const animals = [
        { q: 'Qual destes animais vive dentro da água e usa nadadeiras para nadar?', a: 'O Peixinho', w: ['O Cavalo', 'O Cachorro', 'O Macaco'] },
        { q: 'Qual destes animais tem penas, bico e duas asas?', a: 'O Passarinho', w: ['O Gato', 'O Leão', 'O Elefante'] },
        { q: 'Qual animal é conhecido como o melhor amigo do homem e late?', a: 'O Cachorro', w: ['A Vaca', 'O Tigre', 'O Coelho'] },
        { q: 'Qual animal produz leite e vive na fazenda?', a: 'A Vaca', w: ['A Cobra', 'O Gavião', 'O Rato'] },
        { q: 'O que devemos fazer para manter nossos dentes sempre limpinhos e saudáveis?', a: 'Escovar os dentes após as refeições', w: ['Comer balas o dia todo', 'Não escovar antes de dormir', 'Beber refrigerante'] },
        { q: 'De que as plantinhas precisam para produzir seu próprio alimento e crescer?', a: 'Água, terra boa e luz do Sol', w: ['Apenas ficar no escuro', 'Refrigerante e doces', 'Brinquedos plásticos'] },
      ];
      for (const an of animals) {
        generators.push(() => {
          if (excludeTexts.has(an.q.toLowerCase())) return null;
          return {
            id: `dyn_cie_an_${Date.now()}_${Math.random()}`,
            subject: 'ciencias',
            grade: '1_fund',
            topic: 'Animais e Natureza',
            question: an.q,
            options: [an.a, an.w[0], an.w[1], an.w[2]],
            correctIndex: 0,
            explanation: `Resposta correta: ${an.a}.`,
            difficulty: 'easy',
          };
        });
      }
    }

    if (subject === 'historia' || subject === 'geografia') {
      const histGeoItems = [
        { q: 'O que brilha no céu durante o dia aquecendo a Terra?', a: 'O Sol', w: ['A Lua', 'As Estrelas', 'Os Cometas'] },
        { q: 'O que aparece no céu à noite quando o dia escurece?', a: 'A Lua e as estrelas', w: ['O Sol forte', 'O arco-íris de dia', 'O meio-dia'] },
        { q: 'Qual atitude torna a sala de aula um lugar alegre e respeitoso?', a: 'Compartilhar brinquedos e ajudar os colegas', w: ['Gritar e brigar', 'Empurrar no recreio', 'Não ouvir a professora'] },
        { q: 'Quando olhamos para a nossa frente, o que fica na direção contrária?', a: 'Atrás de nós', w: ['Em cima', 'Embaixo', 'No chão'] },
        { q: 'Qual documento registra o dia em que uma criança nasceu e o nome de seus pais?', a: 'Certidão de Nascimento', w: ['Bilhete de cinema', 'Cupom de mercado', 'Desenho no papel'] },
        { q: 'Onde guardamos os brinquedos e descansamos com nossa família?', a: 'Em nossa casa (nosso lar)', w: ['No supermercado', 'No trânsito da rua', 'No ponto de ônibus'] },
        { q: 'Qual é o lugar da escola onde a turma se reúne com o professor para aprender?', a: 'Sala de aula', w: ['Portaria', 'Estacionamento', 'Cozinha'] },
      ];
      for (const hg of histGeoItems) {
        generators.push(() => {
          if (excludeTexts.has(hg.q.toLowerCase())) return null;
          return {
            id: `dyn_hg_${Date.now()}_${Math.random()}`,
            subject,
            grade: '1_fund',
            topic: subject === 'historia' ? 'Família e Convivência' : 'Espaço e Localização',
            question: hg.q,
            options: [hg.a, hg.w[0], hg.w[1], hg.w[2]],
            correctIndex: 0,
            explanation: `Correto: ${hg.a}.`,
            difficulty: 'easy',
          };
        });
      }
    }

    if (subject === 'ingles') {
      const engColors = [
        { pt: 'Vermelho', en: 'Red' },
        { pt: 'Azul', en: 'Blue' },
        { pt: 'Amarelo', en: 'Yellow' },
        { pt: 'Verde', en: 'Green' },
        { pt: 'Rosa', en: 'Pink' },
        { pt: 'Laranja', en: 'Orange' },
        { pt: 'Preto', en: 'Black' },
        { pt: 'Branco', en: 'White' },
      ];
      for (const col of engColors) {
        generators.push(() => {
          const qText = `Como dizemos a cor "${col.pt}" em inglês?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          const otherColors = ['Red', 'Blue', 'Yellow', 'Green', 'Pink', 'Black'].filter((c) => c !== col.en).slice(0, 3);
          return {
            id: `dyn_eng_col_${col.en}_${Date.now()}`,
            subject: 'ingles',
            grade: '1_fund',
            topic: 'Colors in English',
            question: qText,
            options: [col.en, otherColors[0], otherColors[1], otherColors[2]],
            correctIndex: 0,
            explanation: `A cor "${col.pt}" em inglês é "${col.en}".`,
            difficulty: 'easy',
          };
        });
      }

      const engNums = [
        { pt: '1 (Um)', en: 'One' },
        { pt: '2 (Dois)', en: 'Two' },
        { pt: '3 (Três)', en: 'Three' },
        { pt: '4 (Quatro)', en: 'Four' },
        { pt: '5 (Cinco)', en: 'Five' },
        { pt: '6 (Seis)', en: 'Six' },
        { pt: '7 (Sete)', en: 'Seven' },
        { pt: '8 (Oito)', en: 'Eight' },
        { pt: '9 (Nove)', en: 'Nine' },
        { pt: '10 (Dez)', en: 'Ten' },
      ];
      for (const num of engNums) {
        generators.push(() => {
          const qText = `Como dizemos o número ${num.pt} em inglês?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          const otherNums = ['One', 'Two', 'Three', 'Four', 'Five', 'Ten'].filter((n) => n !== num.en).slice(0, 3);
          return {
            id: `dyn_eng_num_${num.en}_${Date.now()}`,
            subject: 'ingles',
            grade: '1_fund',
            topic: 'Numbers 1-10',
            question: qText,
            options: [num.en, otherNums[0], otherNums[1], otherNums[2]],
            correctIndex: 0,
            explanation: `O número ${num.pt} em inglês é "${num.en}".`,
            difficulty: 'easy',
          };
        });
      }

      const engAnimals = [
        { pt: 'Cachorro', en: 'Dog', wr: ['Cat', 'Fish', 'Bird'] },
        { pt: 'Gato', en: 'Cat', wr: ['Dog', 'Lion', 'Duck'] },
        { pt: 'Peixe', en: 'Fish', wr: ['Bird', 'Dog', 'Cat'] },
        { pt: 'Pássaro / Passarinho', en: 'Bird', wr: ['Fish', 'Dog', 'Cat'] },
        { pt: 'Leão', en: 'Lion', wr: ['Cat', 'Dog', 'Fish'] },
      ];
      for (const an of engAnimals) {
        generators.push(() => {
          const qText = `Como se diz "${an.pt}" em inglês?`;
          if (excludeTexts.has(qText.toLowerCase())) return null;
          return {
            id: `dyn_eng_an_${an.en}_${Date.now()}`,
            subject: 'ingles',
            grade: '1_fund',
            topic: 'Animals in English',
            question: qText,
            options: [an.en, an.wr[0], an.wr[1], an.wr[2]],
            correctIndex: 0,
            explanation: `"${an.pt}" em inglês é "${an.en}".`,
            difficulty: 'easy',
          };
        });
      }
    }
  }

  // Comprehensive subject-specific generators for 2º ano through Ensino Médio / ENEM
  if (subject === 'matematica') {
    const multPairs = [[2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 9], [6, 6], [7, 7], [8, 8], [5, 5], [3, 7], [4, 8]];
    for (const [x, y] of multPairs) {
      generators.push(() => {
        const prod = x * y;
        const qText = `Quanto é ${x} × ${y}?`;
        if (excludeTexts.has(qText.toLowerCase())) return null;
        return {
          id: `dyn_mat_mult_${x}_${y}_${Date.now()}`,
          subject: 'matematica',
          grade,
          topic: 'Multiplicação e Cálculo',
          question: qText,
          options: [`${prod}`, `${prod + 2}`, `${Math.max(1, prod - 2)}`, `${prod + x}`],
          correctIndex: 0,
          explanation: `${x} multiplicado por ${y} resulta em ${prod}.`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'portugues') {
    const portTopics = [
      { q: `Na análise gramatical da Língua Portuguesa para o ${gradeLabel}, qual palavra funciona como núcleo do sujeito?`, a: 'O substantivo ou pronome substantivo', w: ['O adjetivo restritivo', 'O verbo transitivo', 'A conjunção coordenativa'] },
      { q: `Qual alternativa indica corretamente uma figura de linguagem baseada na aproximação de ideias opostas?`, a: 'Antítese ou Paradoxo', w: ['Metonímia simples', 'Aliteração consonantal', 'Onomatopeia'] },
    ];
    for (const pt of portTopics) {
      generators.push(() => {
        if (excludeTexts.has(pt.q.toLowerCase())) return null;
        return {
          id: `dyn_por_gen_${Date.now()}_${Math.random()}`,
          subject: 'portugues',
          grade,
          topic: 'Gramática e Análise Textual',
          question: pt.q,
          options: [pt.a, pt.w[0], pt.w[1], pt.w[2]],
          correctIndex: 0,
          explanation: `A resposta correta em Língua Portuguesa é "${pt.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'ciencias' || subject === 'biologia') {
    const bioGen = [
      { q: `Qual processo biológico converte gás carbônico e água em glicose e oxigênio nas plantas verdes?`, a: 'Fotossíntese', w: ['Respiração celular anaeróbica', 'Fermentação lática', 'Transpiração foliar'] },
      { q: `Na genética estudada no ${gradeLabel}, como são chamadas as diferentes formas de um mesmo gene que determinam uma característica?`, a: 'Alelos', w: ['Ribossomos', 'Cromátides-irmãs', 'Mutations aleatórias'] },
    ];
    for (const bg of bioGen) {
      generators.push(() => {
        if (excludeTexts.has(bg.q.toLowerCase())) return null;
        return {
          id: `dyn_bio_gen_${Date.now()}_${Math.random()}`,
          subject,
          grade,
          topic: 'Biologia e Ciências',
          question: bg.q,
          options: [bg.a, bg.w[0], bg.w[1], bg.w[2]],
          correctIndex: 0,
          explanation: `O conceito correto em ${subjName} é "${bg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'historia') {
    const histGen = [
      { q: `Qual foi o período histórico caracterizado pelo modo de produção feudal na Europa Ocidental?`, a: 'Idade Média', w: ['Antiguidade Clássica', 'Revolução Contemporânea', 'Período Neolítico'] },
      { q: `O movimento intelectual e científico do século XVIII que valorizava a razão contra o absolutismo chamou-se:`, a: 'Iluminismo', w: ['Escolástica medieval', 'Mercantilismo estatal', 'Feudalismo agrário'] },
    ];
    for (const hg of histGen) {
      generators.push(() => {
        if (excludeTexts.has(hg.q.toLowerCase())) return null;
        return {
          id: `dyn_hist_gen_${Date.now()}_${Math.random()}`,
          subject: 'historia',
          grade,
          topic: 'História Geral e do Brasil',
          question: hg.q,
          options: [hg.a, hg.w[0], hg.w[1], hg.w[2]],
          correctIndex: 0,
          explanation: `Historicamente, a alternativa correta é "${hg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'geografia') {
    const geoGen = [
      { q: `Como se denominam as linhas imaginárias horizontais traçadas paralelamente à Linha do Equador?`, a: 'Paralelos (Latitude)', w: ['Meridianos (Longitude)', 'Fusos horários', 'Coordenadas UTM'] },
      { q: `Qual bioma brasileiro é caracterizado por árvores de troncos tortuosos, casca grossa e clima com duas estações bem definidas?`, a: 'Cerrado', w: ['Mata de Araucárias', 'Pampa gaúcho', 'Floresta Amazônica'] },
    ];
    for (const gg of geoGen) {
      generators.push(() => {
        if (excludeTexts.has(gg.q.toLowerCase())) return null;
        return {
          id: `dyn_geo_gen_${Date.now()}_${Math.random()}`,
          subject: 'geografia',
          grade,
          topic: 'Geografia Física e Humana',
          question: gg.q,
          options: [gg.a, gg.w[0], gg.w[1], gg.w[2]],
          correctIndex: 0,
          explanation: `Na Geografia, a resposta correta é "${gg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'fisica') {
    const fisGen = [
      { q: `Qual é a unidade de medida da Força no Sistema Internacional (SI)?`, a: 'Newton (N)', w: ['Joule (J)', 'Watt (W)', 'Pascal (Pa)'] },
      { q: `O princípio que afirma que a energia total de um sistema isolado permanece constante é a:`, a: 'Conservação da Energia', w: ['Inércia absoluta', 'Atrito dinâmico', 'Indução eletromagnética'] },
    ];
    for (const fg of fisGen) {
      generators.push(() => {
        if (excludeTexts.has(fg.q.toLowerCase())) return null;
        return {
          id: `dyn_fis_gen_${Date.now()}_${Math.random()}`,
          subject: 'fisica',
          grade,
          topic: 'Física Geral',
          question: fg.q,
          options: [fg.a, fg.w[0], fg.w[1], fg.w[2]],
          correctIndex: 0,
          explanation: `Na Física, a alternativa correta é "${fg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'quimica') {
    const quiGen = [
      { q: `Qual é a ligação química formada pela partilha de pares de elétrons entre átomos de ametais?`, a: 'Ligação Covalente', w: ['Ligação Iônica', 'Ligação Metálica', 'Ponte de Hidrogênio'] },
      { q: `Uma solução que possui concentração máxima de soluto dissolvido a uma dada temperatura é chamada de:`, a: 'Saturada', w: ['Insaturada', 'Supersaturada instável', 'Diluída'] },
    ];
    for (const qg of quiGen) {
      generators.push(() => {
        if (excludeTexts.has(qg.q.toLowerCase())) return null;
        return {
          id: `dyn_qui_gen_${Date.now()}_${Math.random()}`,
          subject: 'quimica',
          grade,
          topic: 'Química Geral',
          question: qg.q,
          options: [qg.a, qg.w[0], qg.w[1], qg.w[2]],
          correctIndex: 0,
          explanation: `Em Química, o conceito correto é "${qg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  } else if (subject === 'ingles') {
    const engGen = [
      { q: `What is the past tense of the irregular verb "to go" in English?`, a: 'Went', w: ['Goed', 'Gone', 'Going'] },
      { q: `Which modal verb expresses ability or capacity in English?`, a: 'Can', w: ['Must', 'Should', 'Might'] },
    ];
    for (const eg of engGen) {
      generators.push(() => {
        if (excludeTexts.has(eg.q.toLowerCase())) return null;
        return {
          id: `dyn_eng_gen_${Date.now()}_${Math.random()}`,
          subject: 'ingles',
          grade,
          topic: 'English Grammar',
          question: eg.q,
          options: [eg.a, eg.w[0], eg.w[1], eg.w[2]],
          correctIndex: 0,
          explanation: `The correct English grammar choice is "${eg.a}".`,
          difficulty: 'medium',
        };
      });
    }
  }

  // Shuffle generators and collect unique questions
  const shuffledGens = [...generators].sort(() => Math.random() - 0.5);

  for (const gen of shuffledGens) {
    if (result.length >= count) break;
    const q = gen();
    if (q && !excludeTexts.has(q.question.toLowerCase())) {
      excludeTexts.add(q.question.toLowerCase());
      result.push(shuffleQuestionOptions(q));
    }
  }

  // GUARANTEED UNIVERSAL FALLBACK: If still need more questions to reach count, generate procedural unique questions
  let fallbackIdx = 1;
  while (result.length < count) {
    const qText = `Questão prática de fixação de ${subjName} (${gradeLabel}) #${fallbackIdx++}: Qual dos conceitos a seguir é fundamental para o domínio desta unidade?`;
    if (!excludeTexts.has(qText.toLowerCase())) {
      excludeTexts.add(qText.toLowerCase());
      result.push({
        id: `dyn_fallback_${subject}_${grade}_${Date.now()}_${Math.random()}`,
        subject,
        grade,
        topic: `Fundamentos de ${subjName}`,
        question: qText,
        options: [
          `Compreensão analítica e aplicação prática dos princípios de ${subjName}`,
          `Memorização isolada sem contextualização`,
          `Estudo exclusivo de regras genéricas`,
          `Nenhuma das alternativas anteriores`,
        ],
        correctIndex: 0,
        explanation: `O estudo de ${subjName} no ${gradeLabel} exige a compreensão e aplicação prática dos conceitos fundamentais da disciplina.`,
        difficulty: 'medium',
      });
    } else {
      fallbackIdx++;
      if (fallbackIdx > 100) break;
    }
  }

  return result.map(shuffleQuestionOptions);
}

// Function to get questions for matches with difficulty support and randomized options
export function getQuestionsForMatch(
  grade: GradeLevel,
  count: number = 5,
  difficulty?: 'easy' | 'medium' | 'hard',
  subject?: SubjectId | 'all'
): Question[] {
  const pool = CURRICULUM_QUESTIONS_POOL[grade] || CURRICULUM_QUESTIONS_POOL['1_fund'] || [];
  
  let filtered = [...pool];

  if (subject && subject !== 'all') {
    const bySubj = pool.filter((q) => q.subject === subject);
    if (bySubj.length > 0) {
      filtered = bySubj;
    }
  }

  if (difficulty) {
    const matched = filtered.filter((q) => q.difficulty === difficulty);
    if (matched.length > 0) {
      filtered = matched;
    }
  }

  // Shuffle and deduplicate
  const seenTexts = new Set<string>();
  const uniqueSelected: Question[] = [];

  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  for (const q of shuffled) {
    const normalized = q.question.trim().toLowerCase();
    if (!seenTexts.has(normalized)) {
      seenTexts.add(normalized);
      uniqueSelected.push(shuffleQuestionOptions(q));
      if (uniqueSelected.length >= count) break;
    }
  }

  // If we still need more questions to reach count, generate procedural unique questions
  if (uniqueSelected.length < count && subject && subject !== 'all') {
    const needed = count - uniqueSelected.length;
    const dynamicQs = generateProceduralQuestions(grade, subject, needed, seenTexts);
    uniqueSelected.push(...dynamicQs);
  }

  return uniqueSelected.map(shuffleQuestionOptions);
}

/**
 * Returns a balanced, 100% UNIQUE 10-question set:
 * - 5 questions from the previous grade (foundation/revision)
 * - 5 questions from the user's current grade (target curriculum)
 * GUARANTEES: NEVER repeats a question within the session.
 */
export function getGradeAndRevisionQuestions(
  grade: GradeLevel,
  subject?: SubjectId | 'all',
  previousCount: number = 5,
  currentCount: number = 5,
  difficulty?: 'easy' | 'medium' | 'hard'
): Question[] {
  const previousGrade = GRADE_LABELS[grade]?.previousGrade;
  const currentGradeLabel = GRADE_LABELS[grade]?.short || 'Série Atual';
  const previousGradeLabel = previousGrade ? GRADE_LABELS[previousGrade]?.short : 'Base Inicial';

  const usedQuestionTexts = new Set<string>();

  const getUniqueFromPool = (targetGrade: GradeLevel, countNeeded: number): Question[] => {
    const rawPool = CURRICULUM_QUESTIONS_POOL[targetGrade] || CURRICULUM_QUESTIONS_POOL['1_fund'] || [];
    let candidates = [...rawPool];

    if (subject && subject !== 'all') {
      const bySubj = rawPool.filter((q) => q.subject === subject);
      if (bySubj.length > 0) {
        candidates = bySubj;
      }
    }

    if (difficulty) {
      const byDiff = candidates.filter((q) => q.difficulty === difficulty);
      if (byDiff.length > 0) candidates = byDiff;
    }

    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const chosen: Question[] = [];

    for (const q of shuffled) {
      const normalized = q.question.trim().toLowerCase();
      if (!usedQuestionTexts.has(normalized)) {
        usedQuestionTexts.add(normalized);
        chosen.push(q);
        if (chosen.length >= countNeeded) break;
      }
    }

    return chosen;
  };

  // 1. Gather 5 unique revision questions
  const prevTargetGrade = previousGrade || '1_fund';
  const selectedPrevRaw = getUniqueFromPool(prevTargetGrade, previousCount);
  
  // If fewer than requested, generate unique procedural questions to fill to 5
  if (selectedPrevRaw.length < previousCount) {
    const needed = previousCount - selectedPrevRaw.length;
    const targetSubj = subject && subject !== 'all' ? subject : 'matematica';
    const dynamic = generateProceduralQuestions(prevTargetGrade, targetSubj, needed, usedQuestionTexts);
    selectedPrevRaw.push(...dynamic);
  }

  const selectedPrev: Question[] = selectedPrevRaw.map((q, idx) => ({
    ...shuffleQuestionOptions(q),
    id: `rev_${q.id || idx}_${Date.now()}_${idx}`,
    gradeOriginLabel: previousGrade ? `Revisão: ${previousGradeLabel}` : `Base Inicial (${currentGradeLabel})`,
  }));

  // 2. Gather 5 unique current grade questions
  const selectedCurrRaw = getUniqueFromPool(grade, currentCount);

  // If fewer than requested, generate unique procedural questions to fill to 5
  if (selectedCurrRaw.length < currentCount) {
    const needed = currentCount - selectedCurrRaw.length;
    const targetSubj = subject && subject !== 'all' ? subject : 'matematica';
    const dynamic = generateProceduralQuestions(grade, targetSubj, needed, usedQuestionTexts);
    selectedCurrRaw.push(...dynamic);
  }

  const selectedCurr: Question[] = selectedCurrRaw.map((q, idx) => ({
    ...shuffleQuestionOptions(q),
    id: `cur_${q.id || idx}_${Date.now()}_${idx}`,
    gradeOriginLabel: `Conteúdo da Série: ${currentGradeLabel}`,
  }));

  const combined = [...selectedPrev, ...selectedCurr];

  // Invariant assertion: if a subject was specified, NEVER allow questions of other subjects
  if (subject && subject !== 'all') {
    return combined.filter((q) => q.subject === subject);
  }

  return combined;
}

/**
 * Provides a dedicated, age-appropriate fallback lesson with BNCC-aligned theory,
 * keypoints, practical example, and 10 questions when offline or generating dynamically.
 */
export function getFallbackLesson(grade: GradeLevel, subjectId: SubjectId): TopicLesson {
  const subjInfo = SUBJECTS.find((s) => s.id === subjectId);
  const subjectName = subjInfo?.name || 'Estudos';
  const gradeLabel = GRADE_LABELS[grade]?.short || 'Série';

  const questions = getGradeAndRevisionQuestions(grade, subjectId, 5, 5);

  // 1º ANO FUNDAMENTAL SPECIALIZED CURATED THEORIES (Strictly no division/multiplication)
  if (grade === '1_fund') {
    if (subjectId === 'ingles') {
      return {
        id: `fb_ing_1f`,
        subject: 'ingles',
        grade: '1_fund',
        revisionTitle: 'Revisão: Sons, Cores e Gestos Divertidos',
        revisionSummary:
          'Aprender inglês é muito divertido! Começamos reconhecendo cumprimentos com sorrisos, cores alegres e bichinhos fofos.',
        revisionKeyPoints: [
          'Dizemos "Hello" para dar olá e "Goodbye" para dar tchau.',
          'As cores primárias: Red é vermelho e Blue é azul.',
          'Animais de estimação: Dog é cachorro e Cat é gato.',
        ],
        revisionExample: 'Quando chegamos na aula e dizemos "Hello teacher!", estamos falando em inglês!',
        title: 'Primeiras Palavrinhas em Inglês (Numbers & Colors)',
        summary:
          'Hoje vamos praticar contar de 1 até 5 em inglês e reconhecer os nomes das cores do arco-íris!',
        keyPoints: [
          'Números: 1 (One), 2 (Two), 3 (Three), 4 (Four), 5 (Five).',
          'Cores: Yellow é amarelo e Green é verde.',
          'Apontar os objetos e falar o nome em voz alta ajuda a gravar!',
        ],
        example: 'Se você vê 2 maçãs vermelhas, pode dizer: "Two red apples!"',
        practiceQuestions: questions,
      };
    }
    if (subjectId === 'matematica') {
      return {
        id: `fb_mat_1f`,
        subject: 'matematica',
        grade: '1_fund',
        revisionTitle: 'Revisão: Contagem Inicial e Formas Básicas',
        revisionSummary:
          'Vamos relembrar como contar objetos apontando o dedinho e reconhecer formas redondas como o círculo e retas como o quadrado.',
        revisionKeyPoints: [
          'Contar devagar com os dedinhos: 1, 2, 3, 4 e 5.',
          'O círculo é redondinho como uma bola ou o sol.',
          'O quadrado tem quatro lados retinhos e pontas iguais.',
        ],
        revisionExample: 'Olhe ao seu redor: uma moeda é um círculo e uma janela pode ser um quadrado!',
        title: 'Contagem Divertida, Somas e Números até 10',
        summary:
          'No 1º ano, aprendemos a juntar quantidades simples e resolver probleminhas com animais e brinquedos até 10!',
        keyPoints: [
          'Contar até 10: 1, 2, 3, 4, 5, 6, 7, 8, 9 e 10.',
          'Juntar (somar): se você tem 2 maçãs e ganha mais 1, fica com 3.',
          'Separar (subtrair): se você tem 4 balas e come 1, sobram 3.',
          'Comparações: saber quem tem mais ou menos brinquedos.',
        ],
        example:
          'Se você tem 3 figurinhas de animais e seu amigo te dá mais 2 de presente, você agora tem 5 figurinhas no total!',
        practiceQuestions: questions,
      };
    }
    if (subjectId === 'portugues') {
      return {
        id: `fb_por_1f`,
        subject: 'portugues',
        grade: '1_fund',
        revisionTitle: 'Revisão: Sons das Letras e Vogais Mágicas',
        revisionSummary:
          'As letras formam palavras maravilhosas! Vamos relembrar o som das 5 vogais especiais: A, E, I, O e U.',
        revisionKeyPoints: [
          'As cinco vogais são A, E, I, O e U.',
          'Cada palavra começa com um som e uma letrinha inicial especial.',
          'Rimas são palavrinhas que combinam no final (ex: Pato e Gato).',
        ],
        revisionExample: 'A palavra ABELHA começa com a vogal A, e a palavra URSO começa com a letra U.',
        title: 'O Alfabeto e Primeiras Palavrinhas do Cotidiano',
        summary:
          'Juntando as letras com as vogais, formamos sílabas e palavras do dia a dia como BOLA, CASA e AMOR!',
        keyPoints: [
          'Nosso alfabeto tem 26 letras com sons únicos.',
          'B com A faz BA, C com A faz CA.',
          'Ouvir a historinha com atenção ajuda a entender as palavras.',
          'Escrever o próprio nome é o primeiro grande passo!',
        ],
        example:
          'Juntando B-O com L-A formamos a palavra BOLA!',
        practiceQuestions: questions,
      };
    }
    if (subjectId === 'ciencias') {
      return {
        id: `fb_cie_1f`,
        subject: 'ciencias',
        grade: '1_fund',
        revisionTitle: 'Revisão: Os 5 Sentidos do Nosso Corpo',
        revisionSummary:
          'Nosso corpo tem cinco sentidos incríveis para sentir, cheirar, provar, escutar e ver todo o mundo!',
        revisionKeyPoints: [
          'Olhos para ver (visão) e nariz para cheirar (olfato).',
          'Boca para saborear (paladar) e ouvidos para escutar (audição).',
          'Mãos e pele para tocar (tato).',
        ],
        revisionExample: 'Usamos a visão para ver as cores e o olfato para sentir o cheirinho do bolo quentinho.',
        title: 'Higiene, Saúde e Cuidado com a Natureza',
        summary:
          'Cuidar do corpo com bons hábitos e proteger as plantas e animais faz parte do nosso aprendizado de Ciências!',
        keyPoints: [
          'Lavar as mãos antes de comer elimina germes e bactérias.',
          'Escovar os dentes depois das refeições mantém o sorriso saudável.',
          'Plantas precisam de água, terra boa e luz do sol para crescer.',
          'Economizar água e jogar lixo no lixo protege nosso planeta.',
        ],
        example:
          'Lavar as mãos cantando uma musiquinha garante que elas fiquem limpinhas!',
        practiceQuestions: questions,
      };
    }
    if (subjectId === 'historia' || subjectId === 'geografia') {
      return {
        id: `fb_hg_1f`,
        subject: subjectId,
        grade: '1_fund',
        revisionTitle: 'Revisão: Eu, Minha Família e Minha Casa',
        revisionSummary:
          'Cada criança tem uma história especial com sua família, seus costumes e os lugares onde vive e brinca.',
        revisionKeyPoints: [
          'A família é nosso primeiro grupo de convivência.',
          'Nossa casa é o nosso lar e lugar de proteção.',
          'Respeitar as diferenças torna tudo mais bonito.',
        ],
        revisionExample: 'Ajudar a guardar os brinquedos em casa é um exemplo de cooperação familiar.',
        title: 'A Escola, a Convivência e os Espaços',
        summary:
          'Na escola aprendemos coisas novas, fazemos amigos e descobrimos como nos localizar no espaço com carinho e respeito.',
        keyPoints: [
          'Respeitar professores e colegas faz a escola mais feliz.',
          'O Sol brilha durante o dia e a Lua surge à noite.',
          'Saber o que está na frente, atrás, em cima e embaixo ajuda a se localizar.',
          'Cuidar da sala de aula é dever de todos nós.',
        ],
        example:
          'Saber que o quadro fica na frente e a porta fica ao lado nos ajuda a organizar a sala.',
        practiceQuestions: questions,
      };
    }
  }

  // 2º AO 5º ANO FUNDAMENTAL
  if (['2_fund', '3_fund', '4_fund', '5_fund'].includes(grade)) {
    return {
      id: `fb_${subjectId}_${grade}`,
      subject: subjectId,
      grade,
      revisionTitle: `Revisão de Fundamentos de ${subjectName}`,
      revisionSummary: `Antes de iniciar os tópicos do ${gradeLabel}, vamos revisar os conceitos essenciais da série anterior em 5 questões rápidas.`,
      revisionKeyPoints: [
        `Revisão ativa da base necessária para avançar sem dúvidas.`,
        `Fixação de vocabulário e operações fundamentais da disciplina.`,
        `Aquecimento do raciocínio com 5 questões de revisão.`,
      ],
      revisionExample: `Relembrar as noções de base torna o conteúdo novo muito mais simples de resolver.`,
      title: `Aprendendo ${subjectName}: Conteúdo do ${gradeLabel}`,
      summary: `Nesta aula do ${gradeLabel}, exploramos os novos tópicos previstos na BNCC com explicações didáticas e 5 exercícios de aplicação prática.`,
      keyPoints: [
        `Aplicação prática dos novos conceitos de ${subjectName}.`,
        `Leitura atenta dos enunciados e identificação das variáveis-chave.`,
        `Desenvolvimento progressivo do raciocínio e da autonomia.`,
        `Fixação com explicações passo a passo em cada alternativa.`,
      ],
      example: `Ao compreender a estrutura do conteúdo de ${subjectName}, resolver questões do cotidiano e provas escolares se torna natural e intuitivo.`,
      practiceQuestions: questions,
    };
  }

  // 6º AO 9º ANO E ENSINO MÉDIO / ENEM
  return {
    id: `fb_${subjectId}_${grade}`,
    subject: subjectId,
    grade,
    revisionTitle: `Revisão Estratégica de Base • ${subjectName}`,
    revisionSummary: `Revisão direcionada dos pré-requisitos essenciais de ${subjectName} para garantir segurança e fluidez no conteúdo do ${gradeLabel}.`,
    revisionKeyPoints: [
      `Fundamentos estruturais e conceitos-chave da série anterior.`,
      `Conexões lógicas indispensáveis para o avanço da matéria.`,
      `5 questões de aquecimento com feedback pedagógico imediato.`,
    ],
    revisionExample: `Dominar a base evita lacunas de aprendizado em matérias cumulativas.`,
    title: `Domínio de ${subjectName} • ${gradeLabel}`,
    summary: `Estudo aprofundado do conteúdo principal de ${subjectName} para o ${gradeLabel}: teoria condensada, raciocínio analítico e 5 questões práticas da série.`,
    keyPoints: [
      `Conceitos centrais e aplicações contemporâneas da BNCC.`,
      `Resolução analítica e estratégias de resolução rápida.`,
      `5 questões da série atual com explicações pedagógicas completas.`,
      `Consolidação do conhecimento para provas e simulados.`,
    ],
    example: `A análise consistente deste método de estudo garante alta retenção e desempenho destacado em vestibulares e avaliações.`,
    practiceQuestions: questions,
  };
}
