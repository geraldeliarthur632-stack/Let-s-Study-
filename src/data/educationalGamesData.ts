import { GradeLevel } from '../types';

// WORD SEARCH DATA STRUCTURE
export interface WordSearchLevel {
  id: number;
  title: string;
  theme: string;
  gridSize: number; // e.g. 8x8 or 10x10
  grid: string[][];
  words: {
    word: string;
    hint: string;
    found?: boolean;
    start: [number, number]; // [row, col]
    end: [number, number];   // [row, col]
  }[];
}

// CROSSWORD DATA STRUCTURE
export interface CrosswordLevel {
  id: number;
  title: string;
  theme: string;
  gridSize: { rows: number; cols: number };
  clues: {
    number: number;
    direction: 'across' | 'down'; // horizontal ou vertical
    row: number; // 0-indexed start
    col: number; // 0-indexed start
    answer: string;
    clue: string;
  }[];
}

// SLIDING PUZZLE DATA STRUCTURE
export interface SlidingPuzzleLevel {
  id: number;
  title: string;
  category: string;
  description: string;
  size: 3 | 4; // 3x3 ou 4x4
  tiles: number[]; // e.g. [1, 2, 3, 4, 5, 6, 7, 8, 0] where 0 is empty
  solution: number[];
  themeEmojis?: string[];
  imageThemeName?: string;
}

// ================= WORD SEARCH LEVELS =================
export const WORD_SEARCH_LEVELS: WordSearchLevel[] = [
  {
    id: 1,
    title: 'Nível 1: Sistema Solar & Astronomia',
    theme: 'Ciências / Astronomia',
    gridSize: 8,
    grid: [
      ['P', 'L', 'A', 'N', 'E', 'T', 'A', 'S'],
      ['S', 'O', 'L', 'A', 'R', 'K', 'J', 'O'],
      ['T', 'E', 'R', 'R', 'A', 'B', 'M', 'L'],
      ['X', 'Z', 'U', 'N', 'A', 'S', 'A', 'A'],
      ['M', 'A', 'R', 'T', 'E', 'Q', 'R', 'R'],
      ['O', 'R', 'B', 'I', 'T', 'A', 'T', 'P'],
      ['C', 'O', 'M', 'E', 'T', 'A', 'E', 'L'],
      ['L', 'U', 'A', 'W', 'V', 'E', 'N', 'U'],
    ],
    words: [
      { word: 'PLANETA', hint: 'Corpo celeste que orbita uma estrela', start: [0, 0], end: [0, 6] },
      { word: 'SOLAR', hint: 'Relativo ao Sol', start: [1, 0], end: [1, 4] },
      { word: 'TERRA', hint: 'Nosso planeta azul', start: [2, 0], end: [2, 4] },
      { word: 'MARTE', hint: 'O planeta vermelho', start: [4, 0], end: [4, 4] },
      { word: 'ORBITA', hint: 'Trajetória de um astro no espaço', start: [5, 0], end: [5, 5] },
      { word: 'COMETA', hint: 'Corpo de gelo e poeira com cauda brilhante', start: [6, 0], end: [6, 5] },
      { word: 'LUA', hint: 'Satélite natural da Terra', start: [7, 0], end: [7, 2] },
    ],
  },
  {
    id: 2,
    title: 'Nível 2: Ecossistemas & Natureza',
    theme: 'Biologia / Meio Ambiente',
    gridSize: 8,
    grid: [
      ['F', 'L', 'O', 'R', 'E', 'S', 'T', 'A'],
      ['L', 'A', 'G', 'O', 'M', 'A', 'R', 'N'],
      ['B', 'I', 'O', 'M', 'A', 'S', 'V', 'I'],
      ['F', 'A', 'U', 'N', 'A', 'O', 'E', 'M'],
      ['F', 'L', 'O', 'R', 'A', 'L', 'R', 'A'],
      ['A', 'G', 'U', 'A', 'R', 'O', 'D', 'L'],
      ['C', 'L', 'I', 'M', 'A', 'S', 'E', 'X'],
      ['S', 'O', 'L', 'O', 'K', 'I', 'S', 'O'],
    ],
    words: [
      { word: 'FLORESTA', hint: 'Grande área com vegetação arbórea', start: [0, 0], end: [0, 7] },
      { word: 'BIOMA', hint: 'Conjunto de vida vegetal e animal', start: [2, 0], end: [2, 4] },
      { word: 'FAUNA', hint: 'Conjunto de animais de uma região', start: [3, 0], end: [3, 4] },
      { word: 'FLORA', hint: 'Conjunto de plantas de uma região', start: [4, 0], end: [4, 4] },
      { word: 'AGUA', hint: 'Recurso essencial para toda a vida', start: [5, 0], end: [5, 3] },
      { word: 'CLIMA', hint: 'Padrão meteorológico de uma região', start: [6, 0], end: [6, 4] },
      { word: 'SOLO', hint: 'Camada superficial da Terra onde plantamos', start: [7, 0], end: [7, 3] },
    ],
  },
  {
    id: 3,
    title: 'Nível 3: Matemática & Geometria',
    theme: 'Matemática e Formas',
    gridSize: 8,
    grid: [
      ['F', 'R', 'A', 'C', 'A', 'O', 'K', 'M'],
      ['A', 'N', 'G', 'U', 'L', 'O', 'R', 'A'],
      ['R', 'E', 'T', 'A', 'N', 'G', 'U', 'T'],
      ['P', 'R', 'I', 'S', 'M', 'A', 'S', 'R'],
      ['C', 'I', 'R', 'C', 'U', 'L', 'O', 'I'],
      ['S', 'O', 'M', 'A', 'V', 'E', 'Z', 'Z'],
      ['R', 'A', 'I', 'Z', 'E', 'S', 'L', 'E'],
      ['M', 'U', 'L', 'T', 'I', 'P', 'L', 'O'],
    ],
    words: [
      { word: 'FRACAO', hint: 'Parte de um todo dividido em partes iguais', start: [0, 0], end: [0, 5] },
      { word: 'ANGULO', hint: 'Abertura formada por duas semi-retas', start: [1, 0], end: [1, 5] },
      { word: 'PRISMA', hint: 'Poliedro com bases paralelas congruentes', start: [3, 0], end: [3, 5] },
      { word: 'CIRCULO', hint: 'Figura geométrica plana perfeitamente redonda', start: [4, 0], end: [4, 6] },
      { word: 'SOMA', hint: 'Operação de adição básica', start: [5, 0], end: [5, 3] },
      { word: 'RAIZ', hint: 'Operação inversa da potenciação', start: [6, 0], end: [6, 3] },
      { word: 'MULTIPLO', hint: 'Número que contém outro um número exato de vezes', start: [7, 0], end: [7, 7] },
    ],
  },
  {
    id: 4,
    title: 'Nível 4: Língua Portuguesa & Literatura',
    theme: 'Gramática e Escrita',
    gridSize: 8,
    grid: [
      ['S', 'U', 'B', 'S', 'T', 'A', 'N', 'T'],
      ['V', 'E', 'R', 'B', 'O', 'S', 'L', 'E'],
      ['P', 'O', 'E', 'S', 'I', 'A', 'F', 'X'],
      ['S', 'I', 'N', 'T', 'A', 'X', 'E', 'T'],
      ['M', 'E', 'T', 'A', 'F', 'O', 'R', 'A'],
      ['F', 'A', 'B', 'U', 'L', 'A', 'S', 'O'],
      ['R', 'I', 'M', 'A', 'S', 'P', 'R', 'O'],
      ['V', 'O', 'G', 'A', 'L', 'E', 'S', 'T'],
    ],
    words: [
      { word: 'VERBO', hint: 'Palavra que expressa ação, estado ou fenômeno', start: [1, 0], end: [1, 4] },
      { word: 'POESIA', hint: 'Gênero literário composto em versos e estrofes', start: [2, 0], end: [2, 5] },
      { word: 'SINTAXE', hint: 'Estudo da organização das palavras na oração', start: [3, 0], end: [3, 6] },
      { word: 'METAFORA', hint: 'Figura de linguagem com comparação implícita', start: [4, 0], end: [4, 7] },
      { word: 'FABULA', hint: 'Narrativa curta com animais que traz uma moral', start: [5, 0], end: [5, 5] },
      { word: 'RIMA', hint: 'Semelhança sonora no final das palavras', start: [6, 0], end: [6, 3] },
      { word: 'VOGAL', hint: 'Sons de A, E, I, O, U na nossa língua', start: [7, 0], end: [7, 4] },
    ],
  },
  {
    id: 5,
    title: 'Nível 5: História do Brasil & Cidadania',
    theme: 'História e Sociedade',
    gridSize: 8,
    grid: [
      ['I', 'N', 'D', 'I', 'G', 'E', 'N', 'A'],
      ['B', 'R', 'A', 'S', 'I', 'L', 'M', 'T'],
      ['C', 'A', 'B', 'R', 'A', 'L', 'S', 'L'],
      ['M', 'U', 'S', 'E', 'U', 'P', 'O', 'A'],
      ['L', 'I', 'B', 'E', 'R', 'D', 'A', 'D'],
      ['C', 'O', 'L', 'O', 'N', 'I', 'A', 'E'],
      ['I', 'M', 'P', 'E', 'R', 'I', 'O', 'S'],
      ['N', 'A', 'C', 'A', 'O', 'S', 'P', 'A'],
    ],
    words: [
      { word: 'INDIGENA', hint: 'Povos originários das terras brasileiras', start: [0, 0], end: [0, 7] },
      { word: 'BRASIL', hint: 'Nosso país continental verde e amarelo', start: [1, 0], end: [1, 5] },
      { word: 'CABRAL', hint: 'Navegador português que chegou em 1500', start: [2, 0], end: [2, 5] },
      { word: 'MUSEU', hint: 'Local de preservação da memória e história', start: [3, 0], end: [3, 4] },
      { word: 'COLONIA', hint: 'Período histórico de dominação portuguesa', start: [5, 0], end: [5, 6] },
      { word: 'IMPERIO', hint: 'Período governado por D. Pedro I e D. Pedro II', start: [6, 0], end: [6, 6] },
      { word: 'NACAO', hint: 'Povo unido com cultura, língua e identidade', start: [7, 0], end: [7, 4] },
    ],
  },
];

// ================= CROSSWORD LEVELS =================
export const CROSSWORD_LEVELS: CrosswordLevel[] = [
  {
    id: 1,
    title: 'Nível 1: Corpo Humano & Saúde',
    theme: 'Ciências / Corpo Humano',
    gridSize: { rows: 6, cols: 6 },
    clues: [
      {
        number: 1,
        direction: 'across',
        row: 0,
        col: 0,
        answer: 'CORACAO',
        clue: 'Órgão muscular que bombeia sangue para todo o corpo (7 letras)',
      },
      {
        number: 2,
        direction: 'across',
        row: 2,
        col: 0,
        answer: 'PULMAO',
        clue: 'Órgão responsável pelas trocas gasosas da respiração (6 letras)',
      },
      {
        number: 3,
        direction: 'across',
        row: 4,
        col: 0,
        answer: 'OSSO',
        clue: 'Estrutura rígida que forma o esqueleto (4 letras)',
      },
      {
        number: 4,
        direction: 'down',
        row: 0,
        col: 0,
        answer: 'CEREBRO',
        clue: 'Centro de comando do sistema nervoso e pensamentos (7 letras)',
      },
      {
        number: 5,
        direction: 'down',
        row: 0,
        col: 3,
        answer: 'AGUA',
        clue: 'Líquido vital que compõe mais de 60% do corpo humano (4 letras)',
      },
    ],
  },
  {
    id: 2,
    title: 'Nível 2: Planeta Terra & Geografia',
    theme: 'Geografia e Meio Ambiente',
    gridSize: { rows: 6, cols: 6 },
    clues: [
      {
        number: 1,
        direction: 'across',
        row: 0,
        col: 0,
        answer: 'OCEANO',
        clue: 'Grande massa de água salgada que cobre a Terra (6 letras)',
      },
      {
        number: 2,
        direction: 'across',
        row: 2,
        col: 0,
        answer: 'MAPA',
        clue: 'Representação gráfica e plana do relevo ou território (4 letras)',
      },
      {
        number: 3,
        direction: 'across',
        row: 4,
        col: 0,
        answer: 'RIO',
        clue: 'Curso natural de água doce que corre para o mar ou lago (3 letras)',
      },
      {
        number: 4,
        direction: 'down',
        row: 0,
        col: 0,
        answer: 'ORIENTE',
        clue: 'Região geográfica a leste onde o Sol nasce (7 letras)',
      },
      {
        number: 5,
        direction: 'down',
        row: 0,
        col: 2,
        answer: 'CLIMA',
        clue: 'Comportamento da atmosfera ao longo de décadas (5 letras)',
      },
    ],
  },
  {
    id: 3,
    title: 'Nível 3: Matemática & Lógica',
    theme: 'Operações e Geometria',
    gridSize: { rows: 6, cols: 6 },
    clues: [
      {
        number: 1,
        direction: 'across',
        row: 0,
        col: 0,
        answer: 'QUADRADO',
        clue: 'Polígono com 4 lados iguais e 4 ângulos retos de 90° (8 letras)',
      },
      {
        number: 2,
        direction: 'across',
        row: 2,
        col: 0,
        answer: 'RESTO',
        clue: 'O que sobra de uma divisão não-exata (5 letras)',
      },
      {
        number: 3,
        direction: 'across',
        row: 4,
        col: 0,
        answer: 'PI',
        clue: 'Número irracional 3,14159... usado na circunferência (2 letras)',
      },
      {
        number: 4,
        direction: 'down',
        row: 0,
        col: 0,
        answer: 'QUOCIENTE',
        clue: 'Resultado obtido ao realizar uma divisão (9 letras)',
      },
      {
        number: 5,
        direction: 'down',
        row: 0,
        col: 3,
        answer: 'AREA',
        clue: 'Medida da superfície interna de uma figura plana (4 letras)',
      },
    ],
  },
  {
    id: 4,
    title: 'Nível 4: Língua Inglesa Escolar',
    theme: 'English Vocabulary',
    gridSize: { rows: 6, cols: 6 },
    clues: [
      {
        number: 1,
        direction: 'across',
        row: 0,
        col: 0,
        answer: 'SCHOOL',
        clue: 'Lugar onde os alunos estudam e aprendem em inglês (6 letras)',
      },
      {
        number: 2,
        direction: 'across',
        row: 2,
        col: 0,
        answer: 'BOOK',
        clue: 'Objeto de leitura com páginas e capa em inglês (4 letras)',
      },
      {
        number: 3,
        direction: 'across',
        row: 4,
        col: 0,
        answer: 'PEN',
        clue: 'Caneta usada para escrever em inglês (3 letras)',
      },
      {
        number: 4,
        direction: 'down',
        row: 0,
        col: 0,
        answer: 'STUDENT',
        clue: 'Aquele que estuda na escola (7 letras em inglês)',
      },
      {
        number: 5,
        direction: 'down',
        row: 0,
        col: 2,
        answer: 'HOUSE',
        clue: 'Casa ou lar onde moramos em inglês (5 letras)',
      },
    ],
  },
  {
    id: 5,
    title: 'Nível 5: Grandes Invenções & Ciência',
    theme: 'História da Ciência',
    gridSize: { rows: 6, cols: 6 },
    clues: [
      {
        number: 1,
        direction: 'across',
        row: 0,
        col: 0,
        answer: 'VACINA',
        clue: 'Imunizante biológico que protege contra vírus e bactérias (6 letras)',
      },
      {
        number: 2,
        direction: 'across',
        row: 2,
        col: 0,
        answer: 'ROBO',
        clue: 'Máquina automática programada por computador (4 letras)',
      },
      {
        number: 3,
        direction: 'across',
        row: 4,
        col: 0,
        answer: 'LUZ',
        clue: 'Radiação eletromagnética visível gerada por lâmpadas e o Sol (3 letras)',
      },
      {
        number: 4,
        direction: 'down',
        row: 0,
        col: 0,
        answer: 'VIDRO',
        clue: 'Material transparente feito a partir de areia aquecida (5 letras)',
      },
      {
        number: 5,
        direction: 'down',
        row: 0,
        col: 3,
        answer: 'CHIP',
        clue: 'Circuito integrado de silício em computadores e celulares (4 letras)',
      },
    ],
  },
];

// ================= SLIDING PUZZLE LEVELS (QUEBRA-CABEÇA DESLIZANTE) =================
export const SLIDING_PUZZLE_LEVELS: SlidingPuzzleLevel[] = [
  {
    id: 1,
    title: 'Nível 1: Números em Ordem Crescente (3x3)',
    category: 'Raciocínio Lógico & Agilidade',
    description: 'Deslize as peças até ordenar os números de 1 a 8 com o espaço vazio no final!',
    size: 3,
    // Shuffled solvable board: 1-8 and 0 (empty)
    tiles: [1, 2, 3, 4, 0, 6, 7, 5, 8],
    solution: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    themeEmojis: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '⬜'],
  },
  {
    id: 2,
    title: 'Nível 2: O Sistema Solar dos Astros (3x3)',
    category: 'Ciências & Astronomia',
    description: 'Ordene a sequência dos planetas e astros mais importantes do Sistema Solar!',
    size: 3,
    tiles: [1, 3, 0, 4, 2, 6, 7, 5, 8],
    solution: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    themeEmojis: ['☀️ Sol', '🌍 Terra', '🌕 Lua', '🔴 Marte', '🪐 Júpiter', '☄️ Cometa', '⭐ Estrela', '🚀 Foguete', '🌌 Espaço'],
    imageThemeName: 'Astronomia',
  },
  {
    id: 3,
    title: 'Nível 3: Formas & Símbolos Matemáticos (3x3)',
    category: 'Geometria & Lógica',
    description: 'Organize os símbolos e operações matemáticas essenciais da BNCC.',
    size: 3,
    tiles: [2, 1, 3, 4, 5, 0, 7, 8, 6],
    solution: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    themeEmojis: ['➕ Soma', '➖ Subtrair', '✖️ Multiplicar', '➗ Dividir', '🔺 Triângulo', '⏹️ Quadrado', '⭕ Círculo', '📐 Ângulo', '✨ Vazio'],
    imageThemeName: 'Matemática',
  },
  {
    id: 4,
    title: 'Nível 4: Reino Animal da Biodiversidade (3x3)',
    category: 'Biologia & Natureza',
    description: 'Agrupe os animais nos seus habitats naturais ordenadamente.',
    size: 3,
    tiles: [1, 2, 3, 0, 5, 6, 4, 7, 8],
    solution: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    themeEmojis: ['🦁 Leão', '🐘 Elefante', '🐬 Golfinho', '🦅 Águia', '🐢 Tartaruga', '🐼 Panda', '🦊 Raposa', '🦉 Coruja', '🌿 Selva'],
    imageThemeName: 'Animais',
  },
  {
    id: 5,
    title: 'Nível 5: Desafio Master dos Números (4x4)',
    category: 'Alta Concentração & Mestria',
    description: 'O clássico Quebra-Cabeça 15: ordene os blocos de 1 a 15 no tabuleiro 4x4!',
    size: 4,
    tiles: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0, 14, 15],
    solution: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0],
  },
];

// ================= 1º E 2º ANO FUNDAMENTAL SPECIALIZED LEVELS =================
export const EARLY_GRADE_WORD_SEARCH: WordSearchLevel[] = [
  {
    id: 101,
    title: 'Nível 1: Animais Fofos da Fazenda',
    theme: 'Ciências / Animais (1º Ano)',
    gridSize: 8,
    grid: [
      ['G', 'A', 'T', 'O', 'S', 'O', 'L', 'P'],
      ['P', 'A', 'T', 'O', 'V', 'A', 'C', 'A'],
      ['S', 'A', 'P', 'O', 'R', 'A', 'N', 'T'],
      ['B', 'O', 'D', 'E', 'L', 'U', 'A', 'O'],
      ['T', 'A', 'T', 'U', 'C', 'A', 'O', 'S'],
      ['P', 'E', 'I', 'X', 'E', 'B', 'O', 'I'],
      ['L', 'E', 'A', 'O', 'M', 'A', 'C', 'O'],
      ['F', 'O', 'C', 'A', 'R', 'A', 'T', 'O'],
    ],
    words: [
      { word: 'GATO', hint: 'Animal de estimação que faz miau', start: [0, 0], end: [0, 3] },
      { word: 'PATO', hint: 'Ave aquática que faz quá-quá', start: [1, 0], end: [1, 3] },
      { word: 'VACA', hint: 'Animal que dá leite fresquinho', start: [1, 4], end: [1, 7] },
      { word: 'SAPO', hint: 'Anfíbio verdinho que dá pulinhos', start: [2, 0], end: [2, 3] },
      { word: 'BODE', hint: 'Animal que tem chifrinhos e barba', start: [3, 0], end: [3, 3] },
      { word: 'TATU', hint: 'Animal com casca dura que cava buracos', start: [4, 0], end: [4, 3] },
      { word: 'PEIXE', hint: 'Animal que nada nos rios e mares', start: [5, 0], end: [5, 4] },
    ],
  },
  {
    id: 102,
    title: 'Nível 2: Cores e Frutas Deliciosas',
    theme: 'Língua Portuguesa / Vocabulário (1º Ano)',
    gridSize: 8,
    grid: [
      ['M', 'A', 'C', 'A', 'L', 'I', 'M', 'A'],
      ['U', 'V', 'A', 'S', 'P', 'E', 'R', 'A'],
      ['A', 'Z', 'U', 'L', 'R', 'O', 'S', 'A'],
      ['B', 'A', 'N', 'A', 'N', 'A', 'S', 'O'],
      ['C', 'A', 'J', 'U', 'D', 'O', 'C', 'E'],
      ['M', 'A', 'M', 'A', 'O', 'S', 'O', 'L'],
      ['V', 'E', 'R', 'D', 'E', 'C', 'E', 'U'],
      ['F', 'I', 'G', 'O', 'A', 'M', 'O', 'R'],
    ],
    words: [
      { word: 'MACA', hint: 'Fruta vermelha e crocante', start: [0, 0], end: [0, 3] },
      { word: 'UVA', hint: 'Fruta em cachos roxos ou verdes', start: [1, 0], end: [1, 2] },
      { word: 'PERA', hint: 'Fruta doce e suculenta', start: [1, 4], end: [1, 7] },
      { word: 'AZUL', hint: 'A cor do céu ensolarado', start: [2, 0], end: [2, 3] },
      { word: 'ROSA', hint: 'Uma cor linda de flor', start: [2, 4], end: [2, 7] },
      { word: 'BANANA', hint: 'Fruta amarela adorada pelos macaquinhos', start: [3, 0], end: [3, 5] },
      { word: 'CAJU', hint: 'Fruta típica com castanha na ponta', start: [4, 0], end: [4, 3] },
    ],
  },
  {
    id: 103,
    title: 'Nível 3: Brinquedos & Primeiras Palavras',
    theme: 'Alfabetização / BNCC (1º Ano)',
    gridSize: 8,
    grid: [
      ['B', 'O', 'L', 'A', 'P', 'I', 'A', 'O'],
      ['C', 'A', 'S', 'A', 'D', 'A', 'D', 'O'],
      ['F', 'A', 'D', 'A', 'V', 'E', 'L', 'A'],
      ['L', 'U', 'A', 'S', 'O', 'L', 'M', 'E'],
      ['Pipa', 'I', 'P', 'A', 'R', 'O', 'D', 'A'],
      ['U', 'R', 'S', 'O', 'B', 'O', 'N', 'E'],
      ['T', 'R', 'E', 'M', 'N', 'A', 'V', 'E'],
      ['J', 'O', 'G', 'O', 'L', 'I', 'L', 'A'],
    ],
    words: [
      { word: 'BOLA', hint: 'Brinquedo redondo para chutar', start: [0, 0], end: [0, 3] },
      { word: 'PIAO', hint: 'Brinquedo de madeira que gira no chão', start: [0, 4], end: [0, 7] },
      { word: 'CASA', hint: 'Onde moramos com a nossa família', start: [1, 0], end: [1, 3] },
      { word: 'DADO', hint: 'Cubo com pontinhos para jogos', start: [1, 4], end: [1, 7] },
      { word: 'FADA', hint: 'Personagem mágico com varinha e asas', start: [2, 0], end: [2, 3] },
      { word: 'LUA', hint: 'Brilha no céu durante a noite', start: [3, 0], end: [3, 2] },
      { word: 'SOL', hint: 'Ilumina e aquece nosso dia', start: [3, 3], end: [3, 5] },
    ],
  },
];

export const EARLY_GRADE_CROSSWORD: CrosswordLevel[] = [
  {
    id: 101,
    title: 'Nível 1: Primeiras Palavras & Sons',
    theme: 'Alfabetização (1º e 2º Ano)',
    gridSize: { rows: 6, cols: 6 },
    clues: [
      {
        number: 1,
        direction: 'across',
        row: 0,
        col: 0,
        answer: 'BOLA',
        clue: 'Brinquedo redondo de chutar e brincar (4 letras)',
      },
      {
        number: 2,
        direction: 'across',
        row: 2,
        col: 0,
        answer: 'GATO',
        clue: 'Bichinho de estimação que faz miau (4 letras)',
      },
      {
        number: 3,
        direction: 'across',
        row: 4,
        col: 0,
        answer: 'SOL',
        clue: 'Astro brilhante que esquenta nosso dia (3 letras)',
      },
      {
        number: 4,
        direction: 'down',
        row: 0,
        col: 0,
        answer: 'BOLO',
        clue: 'Doce gostoso com velinhas de aniversário (4 letras)',
      },
      {
        number: 5,
        direction: 'down',
        row: 0,
        col: 3,
        answer: 'AMOR',
        clue: 'Sentimento de carinho pela nossa família (4 letras)',
      },
    ],
  },
  {
    id: 102,
    title: 'Nível 2: Frutas, Cores e Natureza',
    theme: 'Ciências & Português (1º e 2º Ano)',
    gridSize: { rows: 6, cols: 6 },
    clues: [
      {
        number: 1,
        direction: 'across',
        row: 0,
        col: 0,
        answer: 'MACA',
        clue: 'Fruta vermelha e saborosa (4 letras)',
      },
      {
        number: 2,
        direction: 'across',
        row: 2,
        col: 0,
        answer: 'UVA',
        clue: 'Fruta redondinha que dá em cachos (3 letras)',
      },
      {
        number: 3,
        direction: 'across',
        row: 4,
        col: 0,
        answer: 'LUA',
        clue: 'Aparece no céu durante a noite (3 letras)',
      },
      {
        number: 4,
        direction: 'down',
        row: 0,
        col: 0,
        answer: 'MALA',
        clue: 'Objeto usado para guardar roupas em viagens (4 letras)',
      },
      {
        number: 5,
        direction: 'down',
        row: 0,
        col: 2,
        answer: 'CASA',
        clue: 'Onde nossa família mora (4 letras)',
      },
    ],
  },
];

export const EARLY_GRADE_SLIDING_PUZZLE: SlidingPuzzleLevel[] = [
  {
    id: 101,
    title: 'Nível 1: Números Amigos de 1 a 8',
    category: 'Contagem (1º e 2º Ano)',
    description: 'Deslize as pecinhas para colocar os números de 1 até 8 na ordem certa!',
    size: 3,
    tiles: [1, 2, 3, 4, 0, 6, 7, 5, 8],
    solution: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    themeEmojis: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '⬜'],
  },
  {
    id: 102,
    title: 'Nível 2: Frutas Coloridas',
    category: 'Natureza (1º e 2º Ano)',
    description: 'Organize as frutinhas saudáveis no tabuleiro!',
    size: 3,
    tiles: [1, 3, 0, 4, 2, 6, 7, 5, 8],
    solution: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    themeEmojis: ['🍎 Maçã', '🍌 Banana', '🍇 Uva', '🍓 Morango', '🍊 Laranja', '🍍 Abacaxi', '🍉 Melancia', '🍒 Cereja', '✨ Cesta'],
    imageThemeName: 'Frutas',
  },
  {
    id: 103,
    title: 'Nível 3: Bichinhos Fofos',
    category: 'Animais (1º e 2º Ano)',
    description: 'Coloque os animaizinhos em ordem!',
    size: 3,
    tiles: [2, 1, 3, 4, 5, 0, 7, 8, 6],
    solution: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    themeEmojis: ['🐶 Cão', '🐱 Gato', '🐰 Coelho', '🐥 Pintinho', '🐼 Panda', '🐨 Coala', '🦊 Raposa', '🦁 Leão', '🌿 Casa'],
    imageThemeName: 'Animais',
  },
];

/**
 * Returns grade-appropriate Word Search levels.
 */
export function getWordSearchLevelsForGrade(grade: GradeLevel): WordSearchLevel[] {
  if (grade === '1_fund' || grade === '2_fund') {
    return [...EARLY_GRADE_WORD_SEARCH, ...WORD_SEARCH_LEVELS.slice(0, 2)];
  }
  return WORD_SEARCH_LEVELS;
}

/**
 * Returns grade-appropriate Crossword levels.
 */
export function getCrosswordLevelsForGrade(grade: GradeLevel): CrosswordLevel[] {
  if (grade === '1_fund' || grade === '2_fund') {
    return [...EARLY_GRADE_CROSSWORD, ...CROSSWORD_LEVELS.slice(0, 2)];
  }
  return CROSSWORD_LEVELS;
}

/**
 * Returns grade-appropriate Sliding Puzzle levels.
 */
export function getSlidingPuzzleLevelsForGrade(grade: GradeLevel): SlidingPuzzleLevel[] {
  if (grade === '1_fund' || grade === '2_fund') {
    return EARLY_GRADE_SLIDING_PUZZLE;
  }
  return SLIDING_PUZZLE_LEVELS;
}
