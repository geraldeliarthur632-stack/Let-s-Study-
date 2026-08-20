import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { Chess } from 'chess.js';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Initialize Gemini SDK with User-Agent header as required by AI Studio guidelines
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Resilient multi-model Gemini caller with automatic quota/rate-limit fallback
  async function callGeminiSafe(params: {
    contents: any;
    config?: any;
    models?: string[];
  }): Promise<any> {
    if (!ai) return null;
    // Prefer gemini-3.1-flash-lite first for high throughput & dedicated quota, followed by 3.7-flash and flash-latest
    const modelCandidates = params.models || ['gemini-3.1-flash-lite', 'gemini-3.7-flash', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const model of modelCandidates) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';
        const isQuotaOrBusy =
          err?.status === 'RESOURCE_EXHAUSTED' ||
          err?.status === 'UNAVAILABLE' ||
          err?.error?.code === 429 ||
          err?.error?.code === 503 ||
          msg.includes('429') ||
          msg.includes('503') ||
          msg.includes('quota') ||
          msg.includes('Quota exceeded') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE');

        if (isQuotaOrBusy) {
          console.warn(`Gemini model ${model} rate-limited or busy. Trying next model candidate...`);
        } else {
          console.warn(`Gemini model ${model} call error:`, msg);
        }
      }
    }
    return null;
  }

// In-memory rooms for Multiplayer Competition
interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  score: number;
  errors: number;
  currentQuestionIndex: number;
  isReady: boolean;
  connected: boolean;
}

interface ServerQuestion {
  id: string;
  subject: string;
  grade: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isTiebreaker?: boolean;
  englishAudioText?: string;
}

interface ChessGameState {
  fen: string;
  turn: 'w' | 'b';
  history: string[];
  lastMove: { from: string; to: string } | null;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  capturedByWhite: string[];
  capturedByBlack: string[];
  whitePlayerId: string;
  blackPlayerId: string;
}

interface Room {
  code: string;
  grade: string;
  gameType: 'general' | 'chess' | 'math' | 'english';
  status: 'waiting' | 'in_progress' | 'tiebreaker' | 'finished';
  hostId: string;
  players: RoomPlayer[];
  questions: ServerQuestion[];
  tiebreakerQuestions: ServerQuestion[];
  currentQuestionIndex: number;
  maxPlayers: number;
  createdAt: number;
  winnerId?: string;
  chessState?: ChessGameState;
}

function shuffleServerQuestionOptions(q: ServerQuestion): ServerQuestion {
  if (!q.options || q.options.length <= 1) return q;
  const correctText = q.options[q.correctIndex];
  const paired = q.options.map((opt) => ({ opt, sort: Math.random() }));
  paired.sort((a, b) => a.sort - b.sort);
  const newOptions = paired.map((p) => p.opt);
  let newCorrectIndex = newOptions.indexOf(correctText);
  if (newCorrectIndex === -1) newCorrectIndex = 0;
  return {
    ...q,
    options: newOptions,
    correctIndex: newCorrectIndex,
  };
}

const rooms = new Map<string, Room>();

// Clean up old rooms after 2 hours
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.createdAt > 2 * 60 * 60 * 1000) {
      rooms.delete(code);
    }
  }
}, 15 * 60 * 1000);

// --- AI STUDY ENDPOINT ---
app.post('/api/ai/explain', async (req, res) => {
  try {
    const { text, imageBase64, grade, subject, difficulty } = req.body;

    if (!text && !imageBase64) {
      return res.status(400).json({ error: 'Forneça um texto ou imagem do conteúdo escolar a ser estudado.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Chave do Gemini não configurada no servidor. Usando modo de estudo local.',
        fallback: true,
      });
    }

    const diffLabel = difficulty === 'easy' ? 'FÁCIL (direto e conceitual)' : difficulty === 'hard' ? 'DIFÍCIL (complexo e aprofundado)' : 'MÉDIO (padrão BNCC)';
    const gradeRule = GRADE_BNCC_RULES[grade] || GRADE_BNCC_RULES['6_fund'] || '';

    const systemInstruction = 
      'Você é um professor e tutor didático especialista do sistema educacional brasileiro (BNCC) com base de conhecimento alinhada a fontes oficiais como MEC, BNCC e Gemini. ' +
      'Sua tarefa é explicar conteúdos escolares (Matemática, Língua Portuguesa, Ciências, História, Geografia, Física, Química, Biologia, etc.) ' +
      'de forma extremamente clara, didática e estruturada para ser lida e ouvida pelo aluno. ' +
      `DIRETRIZES DA SÉRIE:\n${gradeRule}\n\n` +
      'REGRA ABSOLUTA DE SEGURANÇA PEDAGÓGICA POR SÉRIE: ' +
      '- Se o aluno for do 1º ano fundamental (1_fund): NUNCA gere divisão, fração, multiplicação, álgebra ou números decimais! ' +
      'Em Matemática do 1º ano, use APENAS contagem de 1 a 10, somas e subtrações simples menores que 10 com objetos do cotidiano (maçãs, dedinhos, patinhos) e formas geométricas básicas (círculo, quadrado, triângulo). ' +
      '- Se o aluno for do 2º ano: somas/subtrações até 50, sem divisão com resto e sem frações. ' +
      'Além da explicação, você DEVE gerar exatamente 10 perguntas de múltipla escolha adequadas à série: ' +
      '5 perguntas de REVISÃO da série anterior para fixar a base necessária, e 5 perguntas da SÉRIE ATUAL para dominar a matéria. ' +
      'Cada questão deve ter 4 alternativas com a resposta correta no índice 0 (o servidor fará o embaralhamento) e explicação educativa detalhada. ' +
      'IMPORTANTE: Se o usuário enviar assunto não-escolar, recuse educadamente informando que o app é para matérias escolares.';

    const promptText = `Analise o seguinte conteúdo para a série escolar ${grade || 'Ensino Fundamental/Médio'}:
Matéria: ${subject || 'Geral'}
Dificuldade: ${diffLabel}
Texto/Dúvida do estudante: "${text || 'Explique o conteúdo da imagem escolar anexada'}"

Estruture a resposta:
1. Explicação didática completa: título cativante, resumo claro em parágrafos simples para leitura em voz alta, 4 pontos-chave essenciais, e 1 exemplo prático do cotidiano.
2. Exatamente 10 questões de múltipla escolha com 4 alternativas:
   - 5 questões com 'gradeOriginLabel' indicando revisão do ano anterior (ex: "Revisão (Ano Anterior)").
   - 5 questões com 'gradeOriginLabel' indicando a matéria da série atual (ex: "Série Atual (${grade || 'Atual'})").

Retorne em formato JSON estruturado.`;

    const parts: any[] = [];
    if (imageBase64) {
      const mimeType = imageBase64.includes('data:image/png') ? 'image/png' : 'image/jpeg';
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }
    parts.push({ text: promptText });

    const response = await callGeminiSafe({
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isAcademicStudy: {
              type: Type.BOOLEAN,
              description: 'Verdadeiro se o conteúdo for acadêmico/estudo escolar, falso se for aleatório/não-estudo.',
            },
            rejectionMessage: {
              type: Type.STRING,
              description: 'Mensagem de recusa se não for conteúdo de estudo.',
            },
            title: {
              type: Type.STRING,
              description: 'Título do conteúdo escolar.',
            },
            summary: {
              type: Type.STRING,
              description: 'Explicação didática detalhada e simples em parágrafos fluidos para leitura e voz.',
            },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 a 5 pontos fundamentais para fixação.',
            },
            example: {
              type: Type.STRING,
              description: 'Exemplo prático do cotidiano.',
            },
            practiceQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  gradeOriginLabel: { type: Type.STRING, description: 'Ex: "Revisão (1º Ano)" ou "Série Atual (2º Ano)"' },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['isAcademicStudy'],
        },
      },
    });

    if (!response || !response.text) {
      return res.status(503).json({
        error: 'Limite temporário da IA atingido. Ativando currículo local inteligente.',
        fallback: true,
      });
    }

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.practiceQuestions && Array.isArray(parsed.practiceQuestions)) {
      parsed.practiceQuestions = parsed.practiceQuestions.map(shuffleServerQuestionOptions);
    }
    return res.json(parsed);
  } catch (err: any) {
    const errorMsg = err?.message || 'Serviço temporariamente ocupado';
    return res.status(503).json({
      error: `Instabilidade temporária na IA: ${errorMsg}. Usando modo de estudo local.`,
      fallback: true,
    });
  }
});

// --- AI DAILY STUDY TIP & MOTIVATION ENDPOINT ---
const FALLBACK_TIPS = [
  {
    tip: 'A técnica de repetição espaçada (revisar em 1 dia, 3 dias e 7 dias) aumenta a retenção da memória em até 80%!',
    category: 'tecnica_memorizacao',
    topic: 'Técnica de Aprendizado',
    icon: '🧠',
  },
  {
    tip: 'Explicar uma matéria em voz alta para si mesmo ou para outra pessoa (Técnica de Feynman) é a forma mais rápida de descobrir o que você realmente aprendeu.',
    category: 'dica_estudo',
    topic: 'Método Feynman',
    icon: '💡',
  },
  {
    tip: 'O cérebro humano consome cerca de 20% de toda a energia do corpo quando você está focado em resolver desafios e estudar!',
    category: 'fato_rapido',
    topic: 'Curiosidade Científica',
    icon: '🔬',
  },
  {
    tip: 'O sucesso no aprendizado não é sobre estudar 10 horas em um só dia, e sim estudar 25 minutos com foco total todos os dias.',
    category: 'motivacao',
    topic: 'Consistência Diária',
    icon: '⚡',
  },
  {
    tip: 'Fazer pausas de 5 minutos a cada 25 minutos de estudo (Método Pomodoro) restaura o foco e evita a fadiga mental.',
    category: 'tecnica_memorizacao',
    topic: 'Foco & Produtividade',
    icon: '⏱️',
  },
  {
    tip: 'Resolver exercícios práticos ativa 3x mais conexões neurais do que apenas ler passivamente resumos ou anotações.',
    category: 'dica_estudo',
    topic: 'Prática Ativa',
    icon: '🎯',
  },
];

app.post('/api/ai/daily-tip', async (req, res) => {
  try {
    const { grade, userName } = req.body;

    if (!ai) {
      const randomFallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
      return res.json(randomFallback);
    }

    const systemInstruction =
      'Você é um mentor e tutor educacional brasileiro motivador, dinâmico e inteligente. ' +
      'Gere uma "Dica do Dia" ou "Fato Rápido de Estudo" impactante, curioso, prático e motivador para estudantes do ensino fundamental e médio. ' +
      'Pode ser: uma técnica comprovada de memorização/estudo, uma curiosidade científica/histórica fascinante, ou uma mensagem curta e energizante de foco e disciplina.';

    const promptText = `Gere uma dica de estudo ou fato rápido inteligente do dia para o estudante ${userName || 'Estudante'} (Série: ${grade || 'Ensino Fundamental/Médio'}).
A dica deve ter entre 1 e 3 frases, com linguagem clara, positiva e cativante.
Retorne no formato JSON com:
- tip: texto da dica ou fato
- category: uma de ["dica_estudo", "fato_rapido", "motivacao", "tecnica_memorizacao"]
- topic: título curto do tema (ex: "Fórmula da Memória", "Curiosidade Científica", "Foco Imbatível")
- icon: um emoji temático representativo (ex: 🧠, 💡, ⚡, 🔬, 🚀, 🎯)`;

    const response = await callGeminiSafe({
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tip: {
              type: Type.STRING,
              description: 'Texto da dica motivacional ou fato rápido.',
            },
            category: {
              type: Type.STRING,
              enum: ['dica_estudo', 'fato_rapido', 'motivacao', 'tecnica_memorizacao'],
              description: 'Categoria da dica.',
            },
            topic: {
              type: Type.STRING,
              description: 'Tema ou título curto da dica.',
            },
            icon: {
              type: Type.STRING,
              description: 'Emoji temático.',
            },
          },
          required: ['tip', 'category', 'topic', 'icon'],
        },
      },
    });

    const parsed = JSON.parse(response?.text || '{}');
    if (!parsed.tip) {
      throw new Error('Resposta vazia da IA');
    }
    return res.json(parsed);
  } catch (_err) {
    // When model experiences high demand or temporary 503, provide high quality curated tip instantly
    const randomFallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
    return res.json(randomFallback);
  }
});

// Grade-level BNCC Curriculum Rules for accurate age-appropriate pedagogical content
const GRADE_BNCC_RULES: Record<string, string> = {
  '1_fund': `1º ANO DO ENSINO FUNDAMENTAL (Crianças de 6 a 7 anos):
- MATEMÁTICA: Contagem até 10, somas e subtrações simples com números menores ou iguais a 10 (ex: 2+3, 5-2, quantos patinhos), noções de maior/menor, antes/depois, figuras geométricas básicas (círculo, quadrado, triângulo). ESTRITAMENTE PROIBIDO: NUNCA USAR DIVISÃO, NUNCA USAR FRAÇÕES, NUNCA USAR MULTIPLICAÇÃO, NUNCA USAR ÁLGEBRA, NUNCA USAR NÚMEROS NEGATIVOS! Todas as perguntas de matemática devem ser de contagem simples, adição básica até 10 ou formas geométricas.
- PORTUGUÊS: Alfabeto, vogais (A, E, I, O, U), identificar primeira/última letra de palavras cotidianas (BOLA, PATO, CASA), rimas simples, separação de letras.
- CIÊNCIAS: Corpo humano básico (olhos, boca, mãos, pés), 5 sentidos, hábitos de higiene (lavar mãos, escovar dentes), animais conhecidos, plantas simples, dia e noite.
- HISTÓRIA E GEOGRAFIA: Família, escola, brinquedos, regras de convivência, em cima/embaixo, direita/esquerda, dia/noite.
- INGLÊS: First Words: Saudações (Hello, Hi, Bye), cores básicas (Red, Blue, Yellow, Green), números 1 a 5 (One, Two, Three...), animais conhecidos (Dog, Cat, Bird).`,
  '2_fund': `2º ANO DO ENSINO FUNDAMENTAL (7 a 8 anos):
- MATEMÁTICA: Contagem até 100, dezenas e unidades, somas e subtrações com números até 50, dobro e metade intuitivo, relógio de horas cheias, moedas de Real. ESTRITAMENTE PROIBIDO: divisão formal com resto, frações, potenciação, álgebra.
- PORTUGUÊS: Sílabas simples e complexas (LH, NH, CH, RR, SS), separação de sílabas, antônimos simples (alto/baixo, grande/pequeno), pontuação (. ? !).
- CIÊNCIAS: Ambientes naturais e construídos, seres vivos e elementos não vivos, fases da vida (bebê, criança, adulto, idoso).
- HISTÓRIA E GEOGRAFIA: Bairro, moradias, meios de transporte, profissões, calendário (dias da semana e meses).
- INGLÊS: Membros da família (Mother, Father, Brother, Sister), partes do corpo (Eyes, Nose, Mouth), frutas (Apple, Banana), números até 10.`,
  '3_fund': `3º ANO DO ENSINO FUNDAMENTAL (8 a 9 anos):
- MATEMÁTICA: Centenas (até 1.000), adição e subtração com reserva, introdução à multiplicação (tabuadas 2, 3, 4, 5) como adição repetida, noções de medidas (metro, quilo, litro), divisão intuitiva exata sem resto.
- PORTUGUÊS: Substantivos próprios e comuns, adjetivos, sílaba tônica, sinônimos/antônimos.
- CIÊNCIAS: Solo, água e seus estados (sólido, líquido, gasoso), animais vertebrados e invertebrados, luz e sombra.
- HISTÓRIA E GEOGRAFIA: Povos indígenas, história da cidade, paisagens naturais e modificadas, pontos cardeais.
- INGLÊS: Objetos escolares (Pencil, Book, Eraser), dias da semana, sentimentos (Happy, Sad), comandos simples de sala de aula.`,
  '4_fund': `4º ANO DO ENSINO FUNDAMENTAL (9 a 10 anos):
- MATEMÁTICA: Milhares, multiplicação por 2 algarismos, divisão simples com 1 dígito no divisor, frações intuitivas (metade, 1/3, 1/4), perímetro de figuras simples.
- PORTUGUÊS: Verbos (passado, presente, futuro), concordância nominal, pronomes, acentuação.
- CIÊNCIAS: Cadeia alimentar (produtores, consumidores, decompositores), misturas, microrganismos.
- HISTÓRIA E GEOGRAFIA: Colonização do Brasil, mapas, estados e capitais brasileiras, migrações.
- INGLÊS: Pronomes pessoais (I, You, He, She, It, We, They), Verbo To Be no presente (am, is, are), dizer as horas, roupas e clima (sunny, rainy).`,
  '5_fund': `5º ANO DO ENSINO FUNDAMENTAL (10 a 11 anos):
- MATEMÁTICA: As 4 operações completas com números grandes, frações equivalentes, decimais simples (vírgula e dinheiro), porcentagens básicas (50%, 25%, 10%), cálculo de área.
- PORTUGUÊS: Sujeito e predicado básico, conjunções simples, gêneros textuais (fábulas, notícias, cartas).
- CIÊNCIAS: Sistemas do corpo (digestório, respiratório, circulatório básico), ciclo da água, sustentabilidade e reciclagem.
- HISTÓRIA E GEOGRAFIA: Cidadania, direitos e deveres, regiões do Brasil, relevo e hidrografia brasileira.
- INGLÊS: Present Simple e rotina diária (wake up, go to school), perguntas com Wh- (What, Where, When, Who), preposições de lugar (in, on, under).`,
  '6_fund': `6º ANO DO ENSINO FUNDAMENTAL:
- MATEMÁTICA: Múltiplos e divisores, MDC e MMC, frações e decimais, potências e raízes exatas, ângulos e polígonos.
- PORTUGUÊS: Classes de palavras (substantivo, adjetivo, verbo, pronome, numeral, artigo), figuras de linguagem iniciais.
- CIÊNCIAS: Células, tecidos, sistemas do corpo humano, atmosfera e camadas da Terra.
- HISTÓRIA E GEOGRAFIA: Pré-história, Mesopotâmia, Egito, Grécia e Roma Antiga, relevo, clima e vegetação.
- INGLÊS: Present Continuous (ações em andamento), adjetivos possessivos (my, your, his, her), advérbios de frequência (always, never, sometimes).`,
  '7_fund': `7º ANO DO ENSINO FUNDAMENTAL:
- MATEMÁTICA: Números inteiros (positivos e negativos), operações com inteiros, equações do 1º grau simples, ângulos, proporção e regra de três simples.
- PORTUGUÊS: Predicado verbal e nominal, transitividade verbal, tipos de frases, crônicas e contos.
- CIÊNCIAS: Biodiversidade, os 5 reinos dos seres vivos, biomas brasileiros (Amazônia, Cerrado, Caatinga, Mata Atlântica...), vacinas e saúde pública.
- HISTÓRIA E GEOGRAFIA: Idade Média, Feudalismo, Renascimento, Grandes Navegações, formação do território brasileiro e demografia.
- INGLÊS: Simple Past com verbos regulares e irregulares (went, saw, played), comparativos e superlativos (bigger, the best), vocabulário de viagens e ambiente.`,
  '8_fund': `8º ANO DO ENSINO FUNDAMENTAL:
- MATEMÁTICA: Cálculo algébrico, produtos notáveis, fatoração, sistemas de equações do 1º grau, geometria e triângulos, porcentagem e juros simples.
- PORTUGUÊS: Vozes verbais (ativa, passiva, reflexiva), concordância verbal e nominal, figuras de sintaxe.
- CIÊNCIAS: Sistema cardiovascular, respiratório, nervoso e endócrino, reprodução e sexualidade, fontes de energia (renováveis e não renováveis).
- HISTÓRIA E GEOGRAFIA: Iluminismo, Revolução Francesa, Independência dos EUA e da América Latina, geopolítica da América e África.
- INGLÊS: Futuro com Will e Going to, Modal Verbs (can, could, should, must), quantificadores (many, much, a few).`,
  '9_fund': `9º ANO DO ENSINO FUNDAMENTAL:
- MATEMÁTICA: Equações do 2º grau (Bhaskara), Teorema de Pitágoras, Teorema de Tales, funções afins e quadráticas básicas, probabilidade e estatística.
- PORTUGUÊS: Orações coordenadas e subordinadas, regência verbal e nominal, crase, análise sintática avançada.
- CIÊNCIAS: Introdução à Química (matéria, átomo, tabela periódica, ligações químicas) e à Física (movimento, velocidade, aceleração, forças e Leis de Newton, ondas e calor).
- HISTÓRIA E GEOGRAFIA: Proclamação da República, Era Vargas, Primeira e Segunda Guerras Mundiais, Guerra Fria, Globalização e blocos econômicos.
- INGLÊS: Present Perfect (have/has + past participle), voz passiva básica, leitura e interpretação de textos autênticos e notícias internacionais.`,
  '1_medio': `1ª SÉRIE DO ENSINO MÉDIO:
- MATEMÁTICA: Funções afim, quadrática, modular e exponencial, conjuntos, progressões (PA e PG).
- FÍSICA: Cinemática escalar e vetorial, Leis de Newton, Trabalho, Energia mecânica e Potência.
- QUÍMICA: Estrutura atômica, Tabela Periódica, Ligações iônicas e covalentes, Funções inorgânicas.
- BIOLOGIA: Bioquímica celular (água, sais, proteínas, carboidratos, lipídios, DNA e RNA), Citologia e organelas celulares.
- PORTUGUÊS: Trovadorismo, Humanismo, Classicismo, Quinhentismo, Teoria da Literatura, funções da linguagem.
- HISTÓRIA E GEOGRAFIA: Antiguidade Clássica, Feudalismo, Formação dos Estados Nacionais, Cartografia, Geologia, Fusos horários.
- INGLÊS: Reading strategies (Skimming, Scanning), First e Second Conditionals (If clauses), prefixes and suffixes, vocabulário acadêmico.`,
  '2_medio': `2ª SÉRIE DO ENSINO MÉDIO:
- MATEMÁTICA: Trigonometria no ciclo, Matrizes, Determinantes, Sistemas lineares, Geometria Espacial.
- FÍSICA: Termologia (temperatura, calorimetria, termodinâmica), Óptica geométrica (espelhos e lentes), Ondulatória.
- QUÍMICA: Estequiometria, Soluções (concentrações, molaridade), Termoquímica, Cinética química, Equilíbrio químico.
- BIOLOGIA: Reino Plantae, Reino Animalia, Fisiologia humana comparada.
- PORTUGUÊS: Barroco, Arcadismo, Romantismo, Realismo, Naturalismo, Parnasianismo, Simbolismo.
- HISTÓRIA E GEOGRAFIA: Brasil Império, Revoluções do século XIX, Imperialismo, Industrialização mundial.
- INGLÊS: Reported speech, Phrasal verbs, Third Conditional, conectivos de causa, contraste e conclusão em textos argumentativos.`,
  '3_medio': `3ª SÉRIE DO ENSINO MÉDIO / ENEM:
- MATEMÁTICA: Geometria Analítica, Números Complexos, Polinômios, Análise Combinatória e Probabilidade avançada, Estatística.
- FÍSICA: Eletrostática, Eletrodinâmica (circuitos, resistores, Lei de Ohm), Eletromagnetismo, Física Moderna.
- QUÍMICA: Química Orgânica, Eletroquímica (pilhas e eletrólise).
- BIOLOGIA: Genética Mendeliana e Molecular, Biotecnologia, Evolução, Ecologia e Impactos Ambientais.
- PORTUGUÊS & REDAÇÃO: Pré-Modernismo, Modernismo no Brasil, Tendências contemporâneas, Redação nota 1000.
- HISTÓRIA E GEOGRAFIA: República Velha, Ditadura Militar no Brasil, Redemocratização, Nova Ordem Mundial, Geopolítica contemporânea.
- INGLÊS ENEM: Interpretação de charges, cartuns, tirinhas, artigos de opinião, falsos cognatos (false friends) e identificação de tese central e inferências textuais.`,
  'enem': `PRÉ-VESTIBULAR & ENEM:
- Matriz interdisciplinar completa do ENEM e vestibulares incluindo Língua Inglesa instrumental e interpretação crítica.`,
};

function getGradeRule(gradeKeyOrName?: string): string {
  if (!gradeKeyOrName) return GRADE_BNCC_RULES['6_fund'];
  if (GRADE_BNCC_RULES[gradeKeyOrName]) return GRADE_BNCC_RULES[gradeKeyOrName];
  const lower = gradeKeyOrName.toLowerCase();
  if (lower.includes('1º ano') || lower.includes('1_fund') || lower.includes('1 ano') || lower.includes('primeiro ano')) {
    return GRADE_BNCC_RULES['1_fund'];
  }
  if (lower.includes('2º ano') || lower.includes('2_fund') || lower.includes('2 ano') || lower.includes('segundo ano')) {
    return GRADE_BNCC_RULES['2_fund'];
  }
  if (lower.includes('3º ano') || lower.includes('3_fund') || lower.includes('3 ano') || lower.includes('terceiro ano')) {
    return GRADE_BNCC_RULES['3_fund'];
  }
  if (lower.includes('4º ano') || lower.includes('4_fund') || lower.includes('4 ano') || lower.includes('quarto ano')) {
    return GRADE_BNCC_RULES['4_fund'];
  }
  if (lower.includes('5º ano') || lower.includes('5_fund') || lower.includes('5 ano') || lower.includes('quinto ano')) {
    return GRADE_BNCC_RULES['5_fund'];
  }
  if (lower.includes('6º ano') || lower.includes('6_fund') || lower.includes('6 ano') || lower.includes('sexto ano')) {
    return GRADE_BNCC_RULES['6_fund'];
  }
  if (lower.includes('7º ano') || lower.includes('7_fund') || lower.includes('7 ano') || lower.includes('setimo ano') || lower.includes('sétimo ano')) {
    return GRADE_BNCC_RULES['7_fund'];
  }
  if (lower.includes('8º ano') || lower.includes('8_fund') || lower.includes('8 ano') || lower.includes('oitavo ano')) {
    return GRADE_BNCC_RULES['8_fund'];
  }
  if (lower.includes('9º ano') || lower.includes('9_fund') || lower.includes('9 ano') || lower.includes('nono ano')) {
    return GRADE_BNCC_RULES['9_fund'];
  }
  if (lower.includes('1_medio') || lower.includes('1º em') || lower.includes('1ª serie') || lower.includes('1ª série')) {
    return GRADE_BNCC_RULES['1_medio'];
  }
  if (lower.includes('2_medio') || lower.includes('2º em') || lower.includes('2ª serie') || lower.includes('2ª série')) {
    return GRADE_BNCC_RULES['2_medio'];
  }
  if (lower.includes('3_medio') || lower.includes('3º em') || lower.includes('3ª serie') || lower.includes('3ª série')) {
    return GRADE_BNCC_RULES['3_medio'];
  }
  if (lower.includes('enem') || lower.includes('vestibular')) {
    return GRADE_BNCC_RULES['enem'];
  }
  return GRADE_BNCC_RULES['6_fund'];
}

// --- DYNAMIC AI LESSON GENERATOR ENDPOINT (JOURNEY MODE) ---
app.post('/api/ai/generate-lesson', async (req, res) => {
  try {
    const { grade, subject, userName } = req.body;

    if (!ai) {
      return res.status(503).json({ error: 'AI offline, usando currículo local.' });
    }

    const gradeRule = getGradeRule(grade);

    const systemInstruction =
      'Você é um professor e autor pedagógico brasileiro especialista na BNCC. ' +
      `REGRA ABSOLUTA DE DISCIPLINA: Você está criando uma lição EXCLUSIVAMENTE de "${subject}". ` +
      `Todas as 10 questões, a teoria, os resumos e os exemplos DEVEM ser 100% de "${subject}". ` +
      `NUNCA misture matérias! (Exemplo: se a matéria for Língua Portuguesa, NUNCA inclua contas matemáticas, história ou ciências; todas as 10 perguntas devem ser estritamente de Português/Gramática/Interpretação). ` +
      'Sua missão é criar uma lição escolar completa, didática e 100% precisa para a série solicitada em DUAS FASES DIDÁTICAS: ' +
      'Fase 1: Explicação de REVISÃO (base inicial ou série anterior) para as primeiras 5 perguntas. ' +
      'Fase 2: Explicação do CONTEÚDO DA SÉRIE ATUAL para as outras 5 perguntas da série. ' +
      `DIRETRIZ CURRICULAR OBRIGATÓRIA DA SÉRIE:\n${gradeRule}\n\n` +
      'ATENÇÃO MÁXIMA À FAIXA ETÁRIA: Se a série for 1º ano, NUNCA use divisão, multiplicação, frações ou álgebra! ' +
      'Gere exatamente 10 questões de múltipla escolha com 4 alternativas: ' +
      '5 questões de REVISÃO com gradeOriginLabel="Revisão: Fundamentos" e ' +
      '5 questões da SÉRIE ATUAL com gradeOriginLabel="Série Atual". ' +
      'REGRA DE OURO DE UNICIDADE: TODAS as 10 perguntas DEVEM ser totalmente diferentes umas das outras. É estritamente proibido repetir o mesmo enunciado ou pergunta. ' +
      'A alternativa 0 deve ser a correta (o servidor embaralha). Resumos diretos para leitura por voz clara.';

    const promptText = `Crie uma lição escolar completa exclusivamente sobre a matéria "${subject || 'Matemática'}" para o estudante ${userName || 'Estudante'} da série ${grade || '1_fund'}.
LEMBRE-SE: TODAS as 10 questões e explicações DEVEM ser 100% sobre ${subject} e 100% ÚNICAS SEM NENHUMA REPETIÇÃO! Não repita perguntas.
A lição deve conter:
1. revisionTitle: Título da Revisão (ex: "Revisão: Fundamentos de ${subject}").
2. revisionSummary: Resumo didático e conciso de 2 frases para a IA explicar a revisão em voz alta.
3. revisionKeyPoints: 3 pontos-chave da revisão.
4. revisionExample: 1 exemplo prático simples de revisão.
5. title: Título do Conteúdo Principal da Série Atual de ${subject}.
6. summary: Resumo didático e conciso de 2-3 frases para a IA explicar a matéria da série em voz alta.
7. keyPoints: 3 a 4 pontos essenciais da série atual de ${subject}.
8. example: 1 exemplo prático do cotidiano da série atual.
9. practiceQuestions: Exatamente 10 questões de múltipla escolha estritamente sobre ${subject} (5 de revisão inicial + 5 da série atual), TODAS com enunciados únicos e diferentes.`;

    const response = await callGeminiSafe({
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            subject: { type: Type.STRING },
            grade: { type: Type.STRING },
            revisionTitle: { type: Type.STRING },
            revisionSummary: { type: Type.STRING },
            revisionKeyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            revisionExample: { type: Type.STRING },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            example: { type: Type.STRING },
            practiceQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  gradeOriginLabel: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['title', 'summary', 'keyPoints', 'example', 'practiceQuestions'],
        },
      },
    });

    if (!response || !response.text) {
      return res.status(503).json({
        error: 'Limite de requisições da IA temporariamente atingido. Usando currículo local inteligente.',
        fallback: true,
      });
    }

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.practiceQuestions && Array.isArray(parsed.practiceQuestions)) {
      parsed.practiceQuestions = parsed.practiceQuestions.map(shuffleServerQuestionOptions);
    }
    return res.json(parsed);
  } catch (err: any) {
    const msg = err?.message || 'Erro temporário na geração da lição';
    return res.status(503).json({
      error: `IA temporariamente indisponível: ${msg}. Usando currículo local.`,
      fallback: true,
    });
  }
});

// --- AI TUTOR CHAT & PHOTO EXPLAINER ENDPOINT ---
app.post('/api/ai/tutor-chat', async (req, res) => {
  try {
    const { messages = [], grade = '6_fund', userName = 'Estudante', imageBase64, mimeType = 'image/jpeg', currentText = '' } = req.body;

    const gradeRule = getGradeRule(grade);

    const systemInstruction =
      'Você é o Tutor IA Pedagógico do aplicativo escolar "Let\'s Study". ' +
      'Você é um professor paciente, acolhedor, altamente didático e especialista na Base Nacional Comum Curricular (BNCC) do Brasil. ' +
      `O estudante se chama ${userName} e estuda na série escolar ${gradeRule}. ` +
      'DIRETRIZES PEDAGÓGICAS OBRIGATÓRIAS (ANTI-COLA / MÉTODO SOCRÁTICO):\n' +
      '1. FOTO DA MATÉRIA / CONCEITO (LIVRO, CADERNO, LOUSA, EXPLICAÇÃO TEÓRICA):\n' +
      '- Se o estudante enviar uma foto de anotações, livro didático, quadro ou tema de aula e pedir explicação, analise a imagem e explique o conteúdo de forma didática, clara, com tópicos destacados, exemplos da vida real e linguagem perfeitamente adaptada à série.\n' +
      '2. FOTO DE TEMA DE CASA / DEVER / PROVA OU PEDIDO DE RESPOSTA DIRETA / GABARITO:\n' +
      '- SE O ESTUDANTE PEDIR A RESPOSTA ("qual a resposta?", "me dá a resposta", "resolve pra mim", "qual letra marco?", "qual é a certa?", "gabarito", "qual a conta pronta?"), ' +
      'VOCÊ NUNCA DEVE DAR A RESPOSTA FINAL PRONTA NEM A LETRA DO GABARITO! ' +
      'DIGA COM SIMPATIA: "Como seu tutor de aprendizado, meu papel é te ensinar a pensar para você aprender de verdade, por isso não posso passar a resposta pronta ou a letra da alternativa. Mas vou te explicar o passo a passo com todo o prazer para você resolver sozinho!" ' +
      'Em seguida, forneça: a) O que a questão pede em linguagem simples; b) O conceito ou regra matemática/gramatical/científica necessária; c) O roteiro de raciocínio passo a passo; d) Uma pergunta orientadora para o aluno tentar concluir.\n' +
      '3. PERGUNTAS SIMPLES COM PEDIDO DE RESPOSTA:\n' +
      '- Mesmo para perguntas simples, se o aluno pedir apenas a resposta direta para copiar no dever, explique como chegar ao resultado em vez de entregar a resposta crua.\n' +
      '4. FORMATAÇÃO:\n' +
      '- Use formatação limpa com emojis educacionais, tópicos com bullets e parágrafos fluidos para uma excelente leitura em voz alta.';

    if (!ai) {
      // Local smart pedagogical fallback
      const lastMsg = currentText || (messages[messages.length - 1]?.text || '');
      const lower = lastMsg.toLowerCase();
      const asksForDirectAnswer =
        lower.includes('resposta') ||
        lower.includes('gabarito') ||
        lower.includes('resolve pra mim') ||
        lower.includes('qual letra') ||
        lower.includes('qual alternativa') ||
        lower.includes('me dá a resposta') ||
        lower.includes('faz pra mim');

      let fallbackReply = '';
      if (asksForDirectAnswer) {
        fallbackReply = `Olá, ${userName}! 🎓 Como seu Tutor de Aprendizado, meu objetivo é te ajudar a compreender a matéria de verdade, por isso não posso passar a resposta pronta ou a letra da questão. Mas posso te explicar como pensar para resolver:\n\n` +
          `1. 🎯 **Identifique o objetivo**: Leia com atenção o enunciado para destacar o que está sendo perguntado.\n` +
          `2. 🧠 **Lembre-se da regra principal**: Aplique o conceito ensinado nas aulas da sua série (${gradeRule}).\n` +
          `3. 📝 **Passo a passo**: Faça a análise por partes e elimine as opções que não fazem sentido.\n\n` +
          `Qual parte do enunciado você achou mais desafiadora? Me conte para resolvermos juntos!`;
      } else if (imageBase64) {
        fallbackReply = `Excelente foto, ${userName}! 📸 Analisei o material da sua matéria (${gradeRule}).\n\n` +
          `💡 **Resumo do Conteúdo**:\n` +
          `• O tema trata de conceitos essenciais para o seu ano escolar.\n` +
          `• A chave para dominar este tópico é praticar a leitura atenta e relacionar os exemplos ao seu dia a dia.\n\n` +
          `O que você gostaria de explorar mais sobre essa lição? Posso te explicar qualquer termo ou dar um exemplo prático!`;
      } else {
        fallbackReply = `Olá, ${userName}! 🌟 Estou aqui para te ajudar com qualquer dúvida sobre as matérias escolares da sua série (${gradeRule}).\n\n` +
          `Você pode me enviar uma pergunta escrita, falar no microfone 🎙️ ou tirar uma foto do seu caderno/livro 📸! Como posso te ajudar hoje?`;
      }

      return res.json({ reply: fallbackReply });
    }

    // Build Gemini contents array with multimodal support
    const contents: any[] = [];

    // Add prior messages (last 6 for context)
    const recentMessages = messages.slice(-6);
    for (const msg of recentMessages) {
      if (msg.role === 'user') {
        const parts: any[] = [];
        if (msg.imageBase64) {
          const cleanBase64 = msg.imageBase64.includes('base64,')
            ? msg.imageBase64.split('base64,')[1]
            : msg.imageBase64;
          parts.push({
            inlineData: {
              data: cleanBase64,
              mimeType: msg.mimeType || 'image/jpeg',
            },
          });
        }
        if (msg.text) {
          parts.push({ text: msg.text });
        }
        if (parts.length > 0) {
          contents.push({ role: 'user', parts });
        }
      } else if (msg.role === 'model' && msg.text) {
        contents.push({ role: 'model', parts: [{ text: msg.text }] });
      }
    }

    // If current message has an image or text not yet in array
    if (imageBase64 || currentText) {
      const currentParts: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.includes('base64,')
          ? imageBase64.split('base64,')[1]
          : imageBase64;
        currentParts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || 'image/jpeg',
          },
        });
      }
      if (currentText) {
        currentParts.push({ text: currentText });
      } else if (imageBase64 && currentParts.length === 1) {
        currentParts.push({
          text: 'Por favor, analise a foto desta matéria/exercício. Se for uma explicação de matéria, explique de forma didática para a minha série. Se for uma pergunta ou tema de casa pedindo resposta, NÃO me dê a resposta pronta, mas me explique o conceito e o passo a passo de como resolver!',
        });
      }
      contents.push({ role: 'user', parts: currentParts });
    }

    // Ensure we have at least one user content
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Olá, pode me ajudar a estudar?' }] });
    }

    const response = await callGeminiSafe({
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response?.text || 'Desculpe, não consegui processar a resposta no momento. Poderia perguntar novamente?';
    return res.json({ reply });
  } catch (err: any) {
    console.error('Error in /api/ai/tutor-chat:', err);
    return res.json({
      reply: 'Tivemos uma oscilação momentânea na conexão com o servidor de IA. Mas posso continuar te ajudando! Envie sua dúvida novamente.',
    });
  }
});

// --- AI STUDY RECOMMENDATION ENDPOINT ---
app.post('/api/ai/study-recommendation', async (req, res) => {
  try {
    const { grade, currentSubject, correctCount, totalCount, revisionMistakes, currentMistakes, studiedSubjects } = req.body;

    if (!ai) {
      let recSubject = 'ingles';
      if (currentSubject === 'matematica') recSubject = 'portugues';
      else if (currentSubject === 'portugues') recSubject = 'ingles';
      else if (currentSubject === 'ingles') recSubject = 'ciencias';

      const needsReinforcement = (correctCount || 0) < ((totalCount || 10) * 0.7);
      return res.json({
        type: needsReinforcement ? 'reinforce' : 'advance',
        targetSubject: needsReinforcement ? currentSubject : recSubject,
        headline: needsReinforcement ? `Recomendação de Reforço em ${currentSubject}` : `Próximo Passo: Explorar ${recSubject}`,
        advice: needsReinforcement
          ? `Percebemos que você teve algumas dúvidas. Recomendamos revisar os conceitos de ${currentSubject} usando os Flashcards ou refazer a prática!`
          : `Excelente desempenho com ${correctCount}/${totalCount} acertos! Recomendamos agora avançar para ${recSubject} para manter seu aprendizado equilibrado!`,
        actionType: needsReinforcement ? 'flashcards' : 'new_subject',
      });
    }

    const prompt = `Gere uma recomendação inteligente de estudos para um estudante da série ${grade || '6_fund'}.
Dados:
- Matéria atual estudada: ${currentSubject || 'Matemática'}
- Acertos totais: ${correctCount || 0} de ${totalCount || 10}
- Erros na fase de revisão: ${revisionMistakes || 0}
- Erros na série atual: ${currentMistakes || 0}
- Matérias já estudadas: ${(studiedSubjects || []).join(', ') || 'Nenhuma'}

REGRA DE MATÉRIAS:
- Para o Ensino Fundamental (1º ao 9º ano), targetSubject DEVE ser uma de: ['matematica', 'portugues', 'ciencias', 'historia', 'geografia', 'ingles'].
- Para o Ensino Médio (1º EM, 2º EM, 3º EM e ENEM), targetSubject pode ser: ['matematica', 'portugues', 'fisica', 'quimica', 'biologia', 'historia', 'geografia', 'ingles'].

Responda em JSON:
{
  "type": "reinforce" (se teve muitos erros) ou "advance" (se dominou bem),
  "targetSubject": id da matéria compatível com a série,
  "headline": título motivador em português (ex: "Reforçar Frações" ou "Avançar para Língua Inglesa"),
  "advice": conselho pedagógico de 2 frases simples,
  "actionType": "flashcards" ou "new_subject"
}`;

    const response = await callGeminiSafe({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            targetSubject: { type: Type.STRING },
            headline: { type: Type.STRING },
            advice: { type: Type.STRING },
            actionType: { type: Type.STRING },
          },
          required: ['type', 'targetSubject', 'headline', 'advice', 'actionType'],
        },
      },
    });

    const parsed = JSON.parse(response?.text || '{}');
    return res.json(parsed);
  } catch (_err) {
    return res.json({
      type: 'advance',
      targetSubject: 'ingles',
      headline: 'Avançar para Língua Inglesa',
      advice: 'Parabéns pelos estudos! Que tal agora praticar vocabulário e interpretação em Inglês?',
      actionType: 'new_subject',
    });
  }
});

// --- AI CHALLENGE QUESTIONS ENDPOINT (MATH, GENERAL) ---
app.post('/api/ai/challenge-questions', async (req, res) => {
  try {
    const { grade, subject, difficulty, count = 5 } = req.body;

    if (!ai) {
      return res.status(503).json({ error: 'AI indisponível, usando questões locais.' });
    }

    const gradeRule = getGradeRule(grade);

    const diffDesc =
      difficulty === 'easy'
        ? 'FÁCIL: conceitos diretos, contas simples dentro da faixa etária, vocabulário básico do dia a dia.'
        : difficulty === 'hard'
        ? 'DIFÍCIL: problemas mais elaborados de raciocínio dentro da faixa etária, pegadinhas lógicas.'
        : 'MÉDIO: aplicação padrão da série escolar.';

    const systemInstruction =
      'Você é um criador de questões escolares de alto nível para olimpíadas e simulados da BNCC brasileira. ' +
      `REGRA ABSOLUTA: Todas as ${count} questões DEVEM pertencer 100% à matéria "${subject || 'Matemática'}". NUNCA misture matérias (por exemplo, nunca coloque contas em prova de português, nem gramática em prova de matemática). ` +
      `Gere exatamente ${count} questões de múltipla escolha para a matéria "${subject || 'Matemática'}" da série "${grade || '6_fund'}". ` +
      `DIRETRIZ PEDAGÓGICA DA SÉRIE:\n${gradeRule}\n\n` +
      `Complexidade exigida: ${diffDesc}. ` +
      'ATENÇÃO: Se for 1º ano, NUNCA use divisão ou multiplicação! ' +
      'Cada questão deve ter 4 alternativas onde a primeira (índice 0) é a correta, com explicação detalhada em português.';

    const prompt = `Gere ${count} questões exclusivamente sobre ${subject} para ${grade} na dificuldade ${difficulty} (${diffDesc}).
Retorne no formato JSON com lista de questions contendo id, topic, question, options (4 alternativas), correctIndex (0), explanation, difficulty.`;

    const response = await callGeminiSafe({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                },
                required: ['id', 'topic', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsed = JSON.parse(response?.text || '{}');
    const rawQuestions: ServerQuestion[] = parsed.questions || [];
    const randomizedQuestions = rawQuestions.map(shuffleServerQuestionOptions);
    return res.json(randomizedQuestions);
  } catch (err: any) {
    const errorMsg = err?.message || 'Erro temporário na geração de questões';
    return res.status(500).json({ error: `Não foi possível gerar novas questões no momento: ${errorMsg}. Usando banco de questões padrão.` });
  }
});

// --- AI FLASHCARDS GENERATOR ENDPOINT ---
app.post('/api/ai/generate-flashcards', async (req, res) => {
  try {
    const { grade, subject, topic, count = 6 } = req.body;

    if (!ai) {
      return res.status(503).json({ error: 'IA indisponível, usando flashcards pré-carregados.' });
    }

    const gradeRule = getGradeRule(grade);

    const systemInstruction =
      'Você é um especialista em métodos de estudo ativo, repetição espaçada e flashcards educacionais alinhados à BNCC brasileira. ' +
      `Gere exatamente ${count} flashcards de alta qualidade para o tema escolar "${topic || 'Conceitos Fundamentais'}" da matéria "${subject || 'Geral'}" para a série "${grade || '6_fund'}". ` +
      `DIRETRIZ PEDAGÓGICA OBRIGATÓRIA DA SÉRIE:\n${gradeRule}\n\n` +
      'ATENÇÃO: Se a série for 1º ano, NUNCA use divisão, multiplicação, frações ou termos complexos! ' +
      'Cada flashcard deve conter: ' +
      '1. question: A pergunta ou conceito da frente do cartão (clara, instigante, direta). ' +
      '2. answer: A resposta completa, resumida e fácil de memorizar do verso do cartão. ' +
      '3. hint: Uma dica curta para ajudar o estudante a lembrar sem dar a resposta imediatamente. ' +
      '4. category: Categoria do cartão (ex: "Conceito-Chave", "Fórmula", "Vocabulário", "Data", "Curiosidade").';

    const prompt = `Crie um baralho de ${count} flashcards sobre "${topic || 'Revisão Geral'}" da matéria ${subject || 'Matemática'} para o ${grade || '6_fund'}.
Retorne no formato JSON com:
- title: Título do Baralho
- description: Breve descrição
- cards: Lista de ${count} objetos com { id, topic, question, answer, hint, category }`;

    const response = await callGeminiSafe({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['id', 'topic', 'question', 'answer', 'hint', 'category'],
              },
            },
          },
          required: ['title', 'description', 'cards'],
        },
      },
    });

    const parsed = JSON.parse(response?.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    const errorMsg = err?.message || 'Erro ao gerar flashcards';
    return res.status(500).json({ error: `Erro na IA: ${errorMsg}. Usando baralho padrão.` });
  }
});

// --- MULTIPLAYER ROOMS API ---

// Create Room (General, Chess, or Math)
app.post('/api/rooms/create', (req, res) => {
  const { hostName, hostGrade, hostAvatar, grade, gameType, questions, tiebreakerQuestions } = req.body;

  const type = (gameType || 'general') as 'general' | 'chess' | 'math';
  const prefix = type === 'chess' ? 'XADREZ' : type === 'math' ? 'MAT' : 'SALA';
  const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
  const code = `${prefix}-${randomCode}`;
  const hostId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const hostPlayer: RoomPlayer = {
    id: hostId,
    name: hostName || 'Jogador 1',
    avatar: hostAvatar || (type === 'chess' ? '♟️' : '🎓'),
    grade: hostGrade || grade || '6_fund',
    score: 0,
    errors: 0,
    currentQuestionIndex: 0,
    isReady: true,
    connected: true,
  };

  let chessState: ChessGameState | undefined = undefined;
  if (type === 'chess') {
    const chess = new Chess();
    chessState = {
      fen: chess.fen(),
      turn: 'w',
      history: [],
      lastMove: null,
      isCheck: false,
      isCheckmate: false,
      isDraw: false,
      capturedByWhite: [],
      capturedByBlack: [],
      whitePlayerId: hostId,
      blackPlayerId: '',
    };
  }

  const incomingQuestions: ServerQuestion[] = (questions || []).map(shuffleServerQuestionOptions);
  const incomingTiebreakers: ServerQuestion[] = (tiebreakerQuestions || []).map(shuffleServerQuestionOptions);

  const newRoom: Room = {
    code,
    grade: grade || hostGrade || '6_fund',
    gameType: type,
    status: 'waiting',
    hostId,
    players: [hostPlayer],
    questions: incomingQuestions,
    tiebreakerQuestions: incomingTiebreakers,
    currentQuestionIndex: 0,
    maxPlayers: type === 'chess' ? 2 : 3,
    createdAt: Date.now(),
    chessState,
  };

  rooms.set(code, newRoom);
  return res.json({ room: newRoom, playerId: hostId });
});

// Join Room
app.post('/api/rooms/join', (req, res) => {
  const { code, playerName, playerGrade, playerAvatar } = req.body;
  const cleanCode = code?.trim().toUpperCase();
  const room = rooms.get(cleanCode);

  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada. Verifique o código e tente novamente.' });
  }

  if (room.status !== 'waiting') {
    return res.status(400).json({ error: 'Esta partida já foi iniciada.' });
  }

  if (room.players.length >= room.maxPlayers) {
    return res.status(400).json({ error: `A sala já está cheia (máximo de ${room.maxPlayers} jogadores).` });
  }

  const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newPlayer: RoomPlayer = {
    id: playerId,
    name: playerName || `Jogador ${room.players.length + 1}`,
    avatar: playerAvatar || (room.gameType === 'chess' ? '♟️' : '⭐'),
    grade: playerGrade || room.grade,
    score: 0,
    errors: 0,
    currentQuestionIndex: 0,
    isReady: true,
    connected: true,
  };

  room.players.push(newPlayer);

  // If chess, assign black player id
  if (room.gameType === 'chess' && room.chessState) {
    room.chessState.blackPlayerId = playerId;
    // Auto-start chess when 2 players join
    room.status = 'in_progress';
  }

  return res.json({ room, playerId });
});

// Get Room Status
app.get('/api/rooms/:code', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  return res.json({ room });
});

// Start Room Match
app.post('/api/rooms/:code/start', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const { playerId } = req.body;
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  if (room.hostId !== playerId) {
    return res.status(403).json({ error: 'Apenas o anfitrião pode iniciar a partida.' });
  }

  room.status = 'in_progress';
  room.currentQuestionIndex = 0;
  return res.json({ room });
});

// Submit Quiz Answer (Math, English, General)
app.post('/api/rooms/:code/answer', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const { playerId, isCorrect, questionIndex, isTiebreaker } = req.body;
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    return res.status(404).json({ error: 'Jogador não encontrado na sala.' });
  }

  if (isCorrect) {
    player.score += 1;
  } else {
    player.errors += 1;
  }
  player.currentQuestionIndex = questionIndex + 1;

  const totalQuestions = room.questions.length || 10;
  const allFinishedRegular = room.players.every((p) => p.currentQuestionIndex >= totalQuestions);

  if (allFinishedRegular && room.status === 'in_progress') {
    const scores = room.players.map((p) => p.score);
    const maxScore = Math.max(...scores);
    const topPlayers = room.players.filter((p) => p.score === maxScore);

    if (topPlayers.length === 1) {
      room.status = 'finished';
      room.winnerId = topPlayers[0].id;
    } else {
      room.status = 'tiebreaker';
    }
  } else if (room.status === 'tiebreaker' && isTiebreaker) {
    const scores = room.players.map((p) => p.score);
    const maxScore = Math.max(...scores);
    const topPlayers = room.players.filter((p) => p.score === maxScore);

    if (topPlayers.length === 1) {
      room.status = 'finished';
      room.winnerId = topPlayers[0].id;
    }
  }

  return res.json({ room });
});

// --- CHESS MOVE API ---
app.post('/api/rooms/:code/chess-move', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const { playerId, from, to, promotion } = req.body;
  const room = rooms.get(code);

  if (!room || !room.chessState) {
    return res.status(404).json({ error: 'Partida de xadrez não encontrada.' });
  }

  const isWhite = room.chessState.whitePlayerId === playerId;
  const isBlack = room.chessState.blackPlayerId === playerId;

  if (!isWhite && !isBlack) {
    return res.status(403).json({ error: 'Você não é um dos jogadores desta partida.' });
  }

  const expectedTurn = room.chessState.turn;
  if ((expectedTurn === 'w' && !isWhite) || (expectedTurn === 'b' && !isBlack)) {
    return res.status(400).json({ error: 'Não é a sua vez de jogar!' });
  }

  try {
    const chess = new Chess(room.chessState.fen);
    const moveResult = chess.move({ from, to, promotion: promotion || 'q' });

    if (!moveResult) {
      return res.status(400).json({ error: 'Movimento inválido no xadrez.' });
    }

    // Capture detection
    if (moveResult.captured) {
      if (expectedTurn === 'w') {
        room.chessState.capturedByWhite.push(moveResult.captured);
      } else {
        room.chessState.capturedByBlack.push(moveResult.captured);
      }
    }

    room.chessState.fen = chess.fen();
    room.chessState.turn = chess.turn();
    room.chessState.history.push(moveResult.san);
    room.chessState.lastMove = { from, to };
    room.chessState.isCheck = chess.inCheck();
    room.chessState.isCheckmate = chess.isCheckmate();
    room.chessState.isDraw = chess.isDraw();

    if (chess.isCheckmate()) {
      room.status = 'finished';
      room.winnerId = isWhite ? room.chessState.whitePlayerId : room.chessState.blackPlayerId;
    } else if (chess.isDraw()) {
      room.status = 'finished';
      room.winnerId = undefined; // Draw
    }

    return res.json({ room, move: moveResult });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Erro ao realizar movimento de xadrez.' });
  }
});

// Reset Chess Board for Rematch
app.post('/api/rooms/:code/chess-reset', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const room = rooms.get(code);

  if (!room || !room.chessState) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  const chess = new Chess();
  // Swap colors for rematch
  const oldWhite = room.chessState.whitePlayerId;
  const oldBlack = room.chessState.blackPlayerId;

  room.chessState = {
    fen: chess.fen(),
    turn: 'w',
    history: [],
    lastMove: null,
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
    capturedByWhite: [],
    capturedByBlack: [],
    whitePlayerId: oldBlack || oldWhite,
    blackPlayerId: oldBlack ? oldWhite : '',
  };
  room.status = 'in_progress';
  room.winnerId = undefined;

  return res.json({ room });
});

  // Vite middleware for development or static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EstudaHero server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
