import { FlashcardDeck, GradeLevel, SubjectId } from '../types';

export const PREBUILT_FLASHCARD_DECKS: FlashcardDeck[] = [
  // ================= 1º ANO FUNDAMENTAL =================
  {
    id: 'mat_1fund_basico',
    subjectId: 'matematica',
    grade: '1_fund',
    title: 'Números e Formas Divertidas',
    description: 'Contagem, formas geométricas e somas simples do 1º ano.',
    icon: '🔢',
    color: 'from-blue-500 to-indigo-600',
    cards: [
      {
        id: 'fc_1f_mat_1',
        subjectId: 'matematica',
        grade: '1_fund',
        topic: 'Contagem',
        question: 'Quantas patas têm 2 gatinhos juntos?',
        answer: '8 patas! Cada gatinho tem 4 patas (4 + 4 = 8).',
        hint: 'Conte as patas de um gato e depois dobre.',
        category: 'Contagem',
      },
      {
        id: 'fc_1f_mat_2',
        subjectId: 'matematica',
        grade: '1_fund',
        topic: 'Adição Simples',
        question: 'Você tem 3 maçãs e ganha mais 2. Com quantas maçãs você fica?',
        answer: '5 maçãs! (3 + 2 = 5)',
        hint: 'Use seus dedinhos para contar: 3 dedinhos mais 2 dedinhos.',
        category: 'Adição',
      },
      {
        id: 'fc_1f_mat_3',
        subjectId: 'matematica',
        grade: '1_fund',
        topic: 'Formas Geométricas',
        question: 'Qual forma geométrica não tem nenhum cantinho pontudo e parece uma bola?',
        answer: 'Círculo! (ou esfera)',
        hint: 'Ela é redonda como o sol e como a roda da bicicleta.',
        category: 'Geometria',
      },
      {
        id: 'fc_1f_mat_4',
        subjectId: 'matematica',
        grade: '1_fund',
        topic: 'Contagem e Ordem',
        question: 'Qual número vem logo depois do 9?',
        answer: 'O número 10!',
        hint: 'É o número formado pelo 1 e pelo 0 juntos.',
        category: 'Números',
      },
      {
        id: 'fc_1f_mat_5',
        subjectId: 'matematica',
        grade: '1_fund',
        topic: 'Subtração Simples',
        question: 'Haviam 6 passarinhos na árvore e 2 voaram. Quantos restaram?',
        answer: '4 passarinhos! (6 - 2 = 4)',
        hint: 'Tire 2 de 6.',
        category: 'Subtração',
      },
      {
        id: 'fc_1f_mat_6',
        subjectId: 'matematica',
        grade: '1_fund',
        topic: 'Formas',
        question: 'Quantos lados tem um triângulo?',
        answer: '3 lados!',
        hint: 'Tri- significa três pontas.',
        category: 'Geometria',
      },
    ],
  },
  {
    id: 'port_1fund_letras',
    subjectId: 'portugues',
    grade: '1_fund',
    title: 'Vogais e Palavrinhas Mágicas',
    description: 'Reconhecimento de letras, vogais e sons simples.',
    icon: '🔤',
    color: 'from-emerald-500 to-teal-600',
    cards: [
      {
        id: 'fc_1f_por_1',
        subjectId: 'portugues',
        grade: '1_fund',
        topic: 'Vogais',
        question: 'Quais são as 5 vogais do nosso alfabeto?',
        answer: 'A, E, I, O, U!',
        hint: 'Começam com Abelha, Elefante, Igreja, Ovo e Uva.',
        category: 'Alfabetização',
      },
      {
        id: 'fc_1f_por_2',
        subjectId: 'portugues',
        grade: '1_fund',
        topic: 'Sílaba e Sons',
        question: 'Quantos pedacinhos (sílabas) têm a palavra BA-NA-NA ao bater palmas?',
        answer: '3 pedacinhos! (BA - NA - NA)',
        hint: 'Bata palmas falando a palavra devagar.',
        category: 'Sílabas',
      },
      {
        id: 'fc_1f_por_3',
        subjectId: 'portugues',
        grade: '1_fund',
        topic: 'Rimas',
        question: 'Qual palavra rima com CORAÇÃO: Avião ou Mesa?',
        answer: 'Avião! Ambas terminam com o som -ÃO.',
        hint: 'Ouça o finalzinho das duas palavras.',
        category: 'Rimas',
      },
      {
        id: 'fc_1f_por_4',
        subjectId: 'portugues',
        grade: '1_fund',
        topic: 'Letra Inicial',
        question: 'Com qual letra começa o nome do animal GATO?',
        answer: 'Com a letra G (gê)!',
        hint: 'É a mesma letra de Goiaba e Girafa.',
        category: 'Letras',
      },
    ],
  },
  {
    id: 'cie_1fund_corpo',
    subjectId: 'ciencias',
    grade: '1_fund',
    title: 'Nossos 5 Sentidos e a Natureza',
    description: 'Corpo humano, sentidos e animais.',
    icon: '🌿',
    color: 'from-amber-500 to-orange-600',
    cards: [
      {
        id: 'fc_1f_cie_1',
        subjectId: 'ciencias',
        grade: '1_fund',
        topic: 'Os 5 Sentidos',
        question: 'Qual sentido usamos para sentir o cheiro das flores?',
        answer: 'O Olfato (usando o nosso nariz)!',
        hint: 'Fica no meio do nosso rosto.',
        category: 'Corpo Humano',
      },
      {
        id: 'fc_1f_cie_2',
        subjectId: 'ciencias',
        grade: '1_fund',
        topic: 'Os 5 Sentidos',
        question: 'Qual órgão usamos para ver as cores e ler livros?',
        answer: 'Os Olhos (Sentido da Visão)!',
        hint: 'Nós piscamos eles quando estamos com sono.',
        category: 'Sentidos',
      },
      {
        id: 'fc_1f_cie_3',
        subjectId: 'ciencias',
        grade: '1_fund',
        topic: 'Animais',
        question: 'A coruja dorme de dia e caça à noite. Ela é um animal diurno ou noturno?',
        answer: 'Animal noturno!',
        hint: 'Noturno vem de noite.',
        category: 'Animais',
      },
    ],
  },

  // ================= 2º A 5º ANO FUNDAMENTAL =================
  {
    id: 'mat_fund_multiplicacao',
    subjectId: 'matematica',
    grade: '4_fund',
    title: 'Tabuada e Multiplicação Rápida',
    description: 'Cartões mentais de multiplicação e divisões básicas.',
    icon: '✖️',
    color: 'from-blue-600 to-indigo-700',
    cards: [
      {
        id: 'fc_mat_tab_1',
        subjectId: 'matematica',
        grade: '4_fund',
        topic: 'Tabuada',
        question: 'Quanto é 7 × 8?',
        answer: '56!',
        hint: 'Dica: 7 × 7 é 49, adicione mais 7.',
        category: 'Tabuada',
      },
      {
        id: 'fc_mat_tab_2',
        subjectId: 'matematica',
        grade: '4_fund',
        topic: 'Tabuada',
        question: 'Quanto é 9 × 6?',
        answer: '54! (Dica do 9: 5 + 4 = 9)',
        hint: 'O resultado na tabuada do 9 tem soma dos dígitos igual a 9.',
        category: 'Tabuada',
      },
      {
        id: 'fc_mat_tab_3',
        subjectId: 'matematica',
        grade: '4_fund',
        topic: 'Dobro e Metade',
        question: 'Qual é a metade de 150?',
        answer: '75 (porque 75 + 75 = 150)',
        hint: 'Pense na metade de 100 (50) + metade de 50 (25).',
        category: 'Cálculo Mental',
      },
      {
        id: 'fc_mat_tab_4',
        subjectId: 'matematica',
        grade: '4_fund',
        topic: 'Divisão',
        question: 'Quanto é 48 dividido por 6?',
        answer: '8! (Pois 6 × 8 = 48)',
        hint: 'Qual número vezes 6 dá 48?',
        category: 'Divisão',
      },
    ],
  },
  {
    id: 'cie_fund_agua_plantas',
    subjectId: 'ciencias',
    grade: '5_fund',
    title: 'Ciclo da Água e Plantas',
    description: 'Estados físicos, evaporação e fotossíntese.',
    icon: '💧',
    color: 'from-teal-500 to-cyan-600',
    cards: [
      {
        id: 'fc_cie_agua_1',
        subjectId: 'ciencias',
        grade: '5_fund',
        topic: 'Estados da Água',
        question: 'Como se chama a passagem da água líquida para o estado gasoso?',
        answer: 'Evaporação (ou vaporização)!',
        hint: 'Acontece quando a água ferve ou as poças secam ao sol.',
        category: 'Matéria',
      },
      {
        id: 'fc_cie_agua_2',
        subjectId: 'ciencias',
        grade: '5_fund',
        topic: 'Fotossíntese',
        question: 'Qual gás as plantas absorvem do ar para fazer a fotossíntese?',
        answer: 'Gás Carbônico (Dióxido de Carbono - CO₂), liberando Oxigênio (O₂)!',
        hint: 'É o gás que nós expiramos na respiração.',
        category: 'Botânica',
      },
      {
        id: 'fc_cie_agua_3',
        subjectId: 'ciencias',
        grade: '5_fund',
        topic: 'Clorofila',
        question: 'Qual é o pigmento verde que dá cor às folhas e absorve a luz solar?',
        answer: 'Clorofila!',
        hint: 'Começa com "Cloro".',
        category: 'Plantas',
      },
    ],
  },

  // ================= 6º AO 9º ANO FUNDAMENTAL =================
  {
    id: 'mat_6fund_fracoes',
    subjectId: 'matematica',
    grade: '6_fund',
    title: 'Frações, Ângulos e Geometria',
    description: 'Conceitos essenciais de frações e geometria plana.',
    icon: '📐',
    color: 'from-blue-600 to-indigo-800',
    cards: [
      {
        id: 'fc_mat_6f_1',
        subjectId: 'matematica',
        grade: '6_fund',
        topic: 'Frações',
        question: 'Qual fração representa a metade de uma quantidade?',
        answer: '1/2 (um meio) ou 50% ou 0,5.',
        hint: 'Numerador 1 e denominador 2.',
        category: 'Frações',
      },
      {
        id: 'fc_mat_6f_2',
        subjectId: 'matematica',
        grade: '6_fund',
        topic: 'Ângulos',
        question: 'Como é chamado um ângulo que mede exatamente 90 graus?',
        answer: 'Ângulo Reto!',
        hint: 'Forma a quina perfeita de uma folha de papel ou parede.',
        category: 'Geometria',
      },
      {
        id: 'fc_mat_6f_3',
        subjectId: 'matematica',
        grade: '6_fund',
        topic: 'Triângulos',
        question: 'Qual é a soma dos ângulos internos de qualquer triângulo?',
        answer: 'Sempre 180° (cento e oitenta graus)!',
        hint: 'Se você juntar os três vértices, formará uma linha reta.',
        category: 'Teoremas',
      },
      {
        id: 'fc_mat_6f_4',
        subjectId: 'matematica',
        grade: '6_fund',
        topic: 'Números Primos',
        question: 'Qual é o único número par que é um número primo?',
        answer: 'O número 2! (Só é divisível por 1 e por ele mesmo).',
        hint: 'É o menor número primo existente.',
        category: 'Aritmética',
      },
    ],
  },
  {
    id: 'por_6fund_classes',
    subjectId: 'portugues',
    grade: '6_fund',
    title: 'Classes Gramaticais e Sintaxe',
    description: 'Substantivo, adjetivo, verbo, sujeito e predicado.',
    icon: '📚',
    color: 'from-emerald-600 to-green-700',
    cards: [
      {
        id: 'fc_por_6f_1',
        subjectId: 'portugues',
        grade: '6_fund',
        topic: 'Morfologia',
        question: 'Qual classe de palavras expressa ações, estados ou fenômenos da natureza?',
        answer: 'Verbo (ex: correr, estar, chover).',
        hint: 'Pode ser conjugado no passado, presente e futuro.',
        category: 'Gramática',
      },
      {
        id: 'fc_por_6f_2',
        subjectId: 'portugues',
        grade: '6_fund',
        topic: 'Morfologia',
        question: 'Qual classe de palavras caracteriza e atribui qualidades ao substantivo?',
        answer: 'Adjetivo (ex: aluno DEDICADO, casa BONITA).',
        hint: 'Indica como algo é.',
        category: 'Gramática',
      },
      {
        id: 'fc_por_6f_3',
        subjectId: 'portugues',
        grade: '6_fund',
        topic: 'Figuras de Linguagem',
        question: 'O que é uma Metáfora?',
        answer: 'Uma comparação implícita, sem uso de conectivos como "como" ou "tal qual". Ex: "Aquele menino é um raio".',
        hint: 'Diferente da comparação explícita, a metáfora afirma diretamente.',
        category: 'Figuras de Linguagem',
      },
    ],
  },
  {
    id: 'his_fund_brasil',
    subjectId: 'historia',
    grade: '7_fund',
    title: 'História do Brasil & Grandes Marcos',
    description: 'Independência, Proclamação da República e marcos históricos.',
    icon: '🏛️',
    color: 'from-amber-600 to-rose-700',
    cards: [
      {
        id: 'fc_his_1',
        subjectId: 'historia',
        grade: '7_fund',
        topic: 'Brasil Colônia',
        question: 'Em que ano os portugueses liderados por Pedro Álvares Cabral chegaram ao Brasil?',
        answer: 'No ano de 1500 (22 de abril).',
        hint: 'Foi no início do século XVI.',
        category: 'Datas Históricas',
      },
      {
        id: 'fc_his_2',
        subjectId: 'historia',
        grade: '7_fund',
        topic: 'Independência',
        question: 'Quem proclamou a Independência do Brasil em 7 de setembro de 1822?',
        answer: 'Dom Pedro I, às margens do rio Ipiranga.',
        hint: 'Gritou "Independência ou Morte!".',
        category: 'Império',
      },
      {
        id: 'fc_his_3',
        subjectId: 'historia',
        grade: '7_fund',
        topic: 'República',
        question: 'Qual marechal proclamou a República no Brasil em 15 de novembro de 1889?',
        answer: 'Marechal Deodoro da Fonseca!',
        hint: 'Foi o primeiro presidente do Brasil.',
        category: 'República',
      },
    ],
  },
  {
    id: 'geo_fund_brasil',
    subjectId: 'geografia',
    grade: '7_fund',
    title: 'Geografia do Brasil e Planeta Terra',
    description: 'Regiões brasileiras, placas tectônicas e clima.',
    icon: '🌍',
    color: 'from-cyan-600 to-blue-700',
    cards: [
      {
        id: 'fc_geo_1',
        subjectId: 'geografia',
        grade: '7_fund',
        topic: 'Regiões do Brasil',
        question: 'Quais são as 5 regiões oficiais do Brasil segundo o IBGE?',
        answer: 'Norte, Nordeste, Centro-Oeste, Sudeste e Sul.',
        hint: 'São cinco divisões geográficas macro.',
        category: 'Brasil',
      },
      {
        id: 'fc_geo_2',
        subjectId: 'geografia',
        grade: '7_fund',
        topic: 'Biomas',
        question: 'Qual é o maior bioma brasileiro e a maior floresta tropical do mundo?',
        answer: 'Bioma Amazônia!',
        hint: 'Cobre a maior parte da Região Norte.',
        category: 'Biomas',
      },
      {
        id: 'fc_geo_3',
        subjectId: 'geografia',
        grade: '7_fund',
        topic: 'Relevo',
        question: 'O que causa terremotos e formação de grandes cordilheiras como os Andes?',
        answer: 'O movimento e choque das Placas Tectônicas na crosta terrestre.',
        hint: 'Grandes blocos rochosos que flutuam sobre o magma.',
        category: 'Geologia',
      },
    ],
  },

  // ================= ENSINO MÉDIO / ENEM =================
  {
    id: 'fis_medio_newton',
    subjectId: 'fisica',
    grade: '1_medio',
    title: 'Física Clássica: Leis de Newton & Cinemática',
    description: 'Inércia, F=m·a, Ação e Reação e fórmulas fundamentais.',
    icon: '⚡',
    color: 'from-violet-600 to-purple-800',
    cards: [
      {
        id: 'fc_fis_1',
        subjectId: 'fisica',
        grade: '1_medio',
        topic: '1ª Lei de Newton',
        question: 'O que afirma a 1ª Lei de Newton (Princípio da Inércia)?',
        answer: 'Um corpo em repouso permanece em repouso, e um corpo em movimento retilíneo uniforme permanece em movimento, a menos que uma força resultante atue sobre ele.',
        hint: 'Pense em quando um ônibus freia bruscamente e seu corpo vai para frente.',
        category: 'Leis de Newton',
      },
      {
        id: 'fc_fis_2',
        subjectId: 'fisica',
        grade: '1_medio',
        topic: '2ª Lei de Newton',
        question: 'Qual é a fórmula fundamental da Dinâmica (2ª Lei de Newton)?',
        answer: 'F = m · a (Força resultante = massa × aceleração). Unidade: Newton (N).',
        hint: 'F é igual a m vezes a.',
        category: 'Fórmula',
      },
      {
        id: 'fc_fis_3',
        subjectId: 'fisica',
        grade: '1_medio',
        topic: '3ª Lei de Newton',
        question: 'O que diz o Princípio da Ação e Reação (3ª Lei de Newton)?',
        answer: 'A toda ação corresponde uma reação de mesma intensidade, mesma direção e sentido oposto, aplicadas em corpos DIFERENTES (logo, não se anulam).',
        hint: 'Empurrar a parede ou o recuo de uma arma.',
        category: 'Leis de Newton',
      },
      {
        id: 'fc_fis_4',
        subjectId: 'fisica',
        grade: '1_medio',
        topic: 'Energia Mecânica',
        question: 'Qual a fórmula da Energia Cinética de um corpo de massa m e velocidade v?',
        answer: 'Ec = (m · v²) / 2',
        hint: 'Depende do quadrado da velocidade.',
        category: 'Fórmula',
      },
    ],
  },
  {
    id: 'qui_medio_tabela',
    subjectId: 'quimica',
    grade: '2_medio',
    title: 'Química Geral & Tabela Periódica',
    description: 'Modelos atômicos, ligações químicas e reações.',
    icon: '🧪',
    color: 'from-emerald-600 to-teal-800',
    cards: [
      {
        id: 'fc_qui_1',
        subjectId: 'quimica',
        grade: '2_medio',
        topic: 'Ligações Químicas',
        question: 'Qual a diferença entre Ligação Iônica e Ligação Covalente?',
        answer: 'Ligação Iônica ocorre por TRANSFERÊNCIA de elétrons (metal + ametal). Ligação Covalente ocorre por COMPARTILHAMENTO de pares de elétrons (ametais).',
        hint: 'Iônica doa/recebe; Covalente compartilha.',
        category: 'Conceito',
      },
      {
        id: 'fc_qui_2',
        subjectId: 'quimica',
        grade: '2_medio',
        topic: 'Número Atômico',
        question: 'O que define o Número Atômico (Z) de um elemento químico?',
        answer: 'O número de prótons presentes no núcleo do átomo.',
        hint: 'É a "identidade" única de cada elemento na Tabela Periódica.',
        category: 'Estrutura Atômica',
      },
      {
        id: 'fc_qui_3',
        subjectId: 'quimica',
        grade: '2_medio',
        topic: 'pH',
        question: 'Em uma escala de pH de 0 a 14, quando uma solução é considerada ácida, neutra ou básica?',
        answer: 'pH < 7 = Ácido; pH = 7 = Neutro (água pura); pH > 7 = Básico (alcalino).',
        hint: 'O suco de limão é < 7 e o sabão é > 7.',
        category: 'Soluções',
      },
    ],
  },
  {
    id: 'bio_medio_genetica',
    subjectId: 'biologia',
    grade: '3_medio',
    title: 'Genética & Biologia Celular ENEM',
    description: 'DNA, RNA, Mendel e respiração celular.',
    icon: '🧬',
    color: 'from-pink-600 to-rose-800',
    cards: [
      {
        id: 'fc_bio_1',
        subjectId: 'biologia',
        grade: '3_medio',
        topic: 'Bases Nitrogenadas',
        question: 'Quais bases nitrogenadas pareiam no DNA de dupla hélice?',
        answer: 'Adenina (A) com Timina (T) [A=T], e Guanina (G) com Citosina (C) [G≡C]. No RNA, a Timina é substituída por Uracila (U).',
        hint: 'Mnemônico: "Agnaldo Timóteo" e "Gal Costa".',
        category: 'Genética',
      },
      {
        id: 'fc_bio_2',
        subjectId: 'biologia',
        grade: '3_medio',
        topic: 'Organelas Celulares',
        question: 'Qual organela celular é a principal responsável pela Respiração Celular e síntese de ATP?',
        answer: 'Mitocôndria!',
        hint: 'É a "usina de energia" da célula eucariótica.',
        category: 'Citologia',
      },
      {
        id: 'fc_bio_3',
        subjectId: 'biologia',
        grade: '3_medio',
        topic: '1ª Lei de Mendel',
        question: 'O que afirma a 1ª Lei de Mendel (Lei da Segregação dos Fatores)?',
        answer: 'Cada caráter é determinado por um par de fatores (alelos) que se separam na formação dos gametas, indo apenas um alelo para cada gameta.',
        hint: 'Experimento com as ervilhas amarelas e verdes.',
        category: 'Genética',
      },
    ],
  },

  // ================= LÍNGUA INGLESA =================
  {
    id: 'ing_1fund_intro',
    subjectId: 'ingles',
    grade: '1_fund',
    title: 'First Words in English (Primeiras Palavras)',
    description: 'Cores, saudações e animais básicos em inglês para crianças.',
    icon: '🇬🇧',
    color: 'from-sky-500 to-blue-600',
    cards: [
      {
        id: 'fc_ing_1f_1',
        subjectId: 'ingles',
        grade: '1_fund',
        topic: 'Greetings',
        question: 'Como dizemos "Olá" e "Tchau" em inglês?',
        answer: '"Hello" (ou "Hi") = Olá / "Goodbye" (ou "Bye") = Tchau!',
        hint: 'Palavras de cumprimento diário.',
        category: 'Greetings',
      },
      {
        id: 'fc_ing_1f_2',
        subjectId: 'ingles',
        grade: '1_fund',
        topic: 'Colors',
        question: 'Como se fala a cor "Vermelho" e a cor "Azul" em inglês?',
        answer: 'Red (Vermelho) e Blue (Azul)!',
        hint: 'Red como morango, Blue como o céu.',
        category: 'Colors',
      },
      {
        id: 'fc_ing_1f_3',
        subjectId: 'ingles',
        grade: '1_fund',
        topic: 'Animals',
        question: 'Como chamamos o "Cachorro" e o "Gato" em inglês?',
        answer: 'Dog (Cachorro) e Cat (Gato)!',
        hint: 'Animais de estimação favoritos.',
        category: 'Animals',
      },
      {
        id: 'fc_ing_1f_4',
        subjectId: 'ingles',
        grade: '1_fund',
        topic: 'Numbers',
        question: 'Como contamos de 1 a 3 em inglês?',
        answer: 'One (1), Two (2), Three (3)!',
        hint: 'One, Two, Three...',
        category: 'Numbers',
      },
    ],
  },
  {
    id: 'ing_fund2_essentials',
    subjectId: 'ingles',
    grade: '6_fund',
    title: 'English Essentials: Grammar & Daily Vocab',
    description: 'Verbo To Be, pronomes, preposições e vocabulário do dia a dia.',
    icon: '🗣️',
    color: 'from-blue-600 to-indigo-700',
    cards: [
      {
        id: 'fc_ing_6f_1',
        subjectId: 'ingles',
        grade: '6_fund',
        topic: 'Verb To Be',
        question: 'Quais são as três formas do Verb To Be no presente?',
        answer: 'AM, IS e ARE (ex: I am, He/She/It is, You/We/They are). Significa Ser ou Estar.',
        hint: 'Conjugado de acordo com o pronome sujeito.',
        category: 'Grammar',
      },
      {
        id: 'fc_ing_6f_2',
        subjectId: 'ingles',
        grade: '6_fund',
        topic: 'Pronouns',
        question: 'Qual pronome em inglês usamos para "Ela" e para "Ele"?',
        answer: '"She" para Ela e "He" para Ele! ("It" para coisas/animais).',
        hint: 'She / He / It.',
        category: 'Pronouns',
      },
      {
        id: 'fc_ing_6f_3',
        subjectId: 'ingles',
        grade: '6_fund',
        topic: 'Prepositions',
        question: 'O que significam as preposições IN, ON e UNDER?',
        answer: 'IN = Dentro / ON = Em cima de (em contato com a superfície) / UNDER = Embaixo de!',
        hint: 'Indicam posição no espaço.',
        category: 'Prepositions',
      },
      {
        id: 'fc_ing_6f_4',
        subjectId: 'ingles',
        grade: '6_fund',
        topic: 'Wh- Questions',
        question: 'O que significam: WHAT, WHERE e WHO?',
        answer: 'WHAT = O que / Qual, WHERE = Onde, WHO = Quem!',
        hint: 'Palavras interrogativas essenciais.',
        category: 'Questions',
      },
    ],
  },
  {
    id: 'ing_medio_mastery',
    subjectId: 'ingles',
    grade: '3_medio',
    title: 'ENEM & Vestibulares: Linking Words & Phrasal Verbs',
    description: 'Conectivos textuais, falsos amigos (falsos cognatos) e interpretação.',
    icon: '🎯',
    color: 'from-indigo-600 to-violet-700',
    cards: [
      {
        id: 'fc_ing_em_1',
        subjectId: 'ingles',
        grade: '3_medio',
        topic: 'Linking Words',
        question: 'O que significam os conectivos HOWEVER, ALTHOUGH e THEREFORE?',
        answer: 'HOWEVER = No entanto/Porém; ALTHOUGH = Embora/Apesar de; THEREFORE = Portanto/Por conseguinte.',
        hint: 'Conectivos de oposição e conclusão frequentes no ENEM.',
        category: 'Connectors',
      },
      {
        id: 'fc_ing_em_2',
        subjectId: 'ingles',
        grade: '3_medio',
        topic: 'False Friends',
        question: 'O que realmente significa "ACTUALLY" e "PRETEND" em inglês?',
        answer: '"Actually" significa "Na verdade / Realmente" (não atualmente). "Pretend" significa "Fingir" (não pretender).',
        hint: 'Falsos cognatos clássicos.',
        category: 'Vocabulary',
      },
      {
        id: 'fc_ing_em_3',
        subjectId: 'ingles',
        grade: '3_medio',
        topic: 'Conditionals',
        question: 'Como é formada a Second Conditional (hipótese irreal no presente)?',
        answer: 'If + Past Simple, would + verbo no infinitivo (ex: If I had money, I would travel).',
        hint: 'If I were you, I would...',
        category: 'Grammar',
      },
    ],
  },
];

const FLASHCARD_STORAGE_KEY = 'estudar_go_custom_flashcard_decks_v1';
const FLASHCARD_PROGRESS_KEY = 'estudar_go_flashcard_user_progress_v1';

export interface UserFlashcardProgress {
  [cardId: string]: {
    status: 'known' | 'learning' | 'mastered';
    lastReviewed: number;
    reviewsCount: number;
    consecutiveCorrect: number;
  };
}

export function loadAllDecks(): FlashcardDeck[] {
  try {
    const saved = localStorage.getItem(FLASHCARD_STORAGE_KEY);
    if (saved) {
      const customDecks: FlashcardDeck[] = JSON.parse(saved);
      return [...PREBUILT_FLASHCARD_DECKS, ...customDecks];
    }
  } catch (err) {
    console.error('Error loading custom flashcard decks', err);
  }
  return PREBUILT_FLASHCARD_DECKS;
}

export function saveCustomDeck(deck: FlashcardDeck): void {
  try {
    const saved = localStorage.getItem(FLASHCARD_STORAGE_KEY);
    const existing: FlashcardDeck[] = saved ? JSON.parse(saved) : [];
    const updated = existing.filter((d) => d.id !== deck.id);
    updated.unshift({ ...deck, isCustom: true });
    localStorage.setItem(FLASHCARD_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving custom flashcard deck', err);
  }
}

export function deleteCustomDeck(deckId: string): void {
  try {
    const saved = localStorage.getItem(FLASHCARD_STORAGE_KEY);
    if (saved) {
      const existing: FlashcardDeck[] = JSON.parse(saved);
      const filtered = existing.filter((d) => d.id !== deckId);
      localStorage.setItem(FLASHCARD_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (err) {
    console.error('Error deleting custom flashcard deck', err);
  }
}

export function loadFlashcardProgress(): UserFlashcardProgress {
  try {
    const saved = localStorage.getItem(FLASHCARD_PROGRESS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

export function updateCardProgress(cardId: string, isCorrect: boolean): void {
  try {
    const progress = loadFlashcardProgress();
    const current = progress[cardId] || {
      status: 'learning',
      lastReviewed: 0,
      reviewsCount: 0,
      consecutiveCorrect: 0,
    };

    const newConsecutive = isCorrect ? current.consecutiveCorrect + 1 : 0;
    const newStatus = newConsecutive >= 2 ? 'mastered' : isCorrect ? 'known' : 'learning';

    progress[cardId] = {
      status: newStatus,
      lastReviewed: Date.now(),
      reviewsCount: current.reviewsCount + 1,
      consecutiveCorrect: newConsecutive,
    };

    localStorage.setItem(FLASHCARD_PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Error updating flashcard progress', err);
  }
}
