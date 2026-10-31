// O que a carta do Louco revela: o resumo do GitHub. Só fatos dos READMEs públicos de cada repositório.
export type Grupo = 'Plataforma bancária' | 'Comércio exterior';

export interface RepoResumo {
  nome: string;
  repo: string;
  /** como aparece ao lado do nome */
  linguagem: string;
  /** linguagens que entram na contagem do topo */
  linguagens: string[];
  grupo: Grupo;
  frase: string;
}

export const GRUPOS: Grupo[] = ['Plataforma bancária', 'Comércio exterior'];

export const GITHUB_RESUMO = {
  usuario: 'gabrielgmln-ops',
  url: 'https://github.com/gabrielgmln-ops',
  /** A frase do Louco: o ponto zero, antes do primeiro passo. */
  leitura:
    'O Louco é a carta zero: o começo da jornada. Aqui ela abre o caderno de oficina, onde cada projeto ficou registrado commit a commit, com testes, CI e dados sintéticos.',
  repos: [
    {
      nome: 'Ledger API',
      repo: 'ledger-api',
      linguagem: 'Java',
      linguagens: ['Java'],
      grupo: 'Plataforma bancária',
      frase: 'Livro-razão com partidas dobradas, idempotência e auditoria append-only.',
    },
    {
      nome: 'Pix Simulado',
      repo: 'pix-simulado',
      linguagem: 'Kotlin',
      linguagens: ['Kotlin'],
      grupo: 'Plataforma bancária',
      frase: 'Pagamentos instantâneos sobre a Ledger API, com Testcontainers e CI.',
    },
    {
      nome: 'Motor Antifraude',
      repo: 'motor-antifraude',
      linguagem: 'Python',
      linguagens: ['Python'],
      grupo: 'Plataforma bancária',
      frase: 'Kafka, regras e IsolationForest classificando transações em tempo real.',
    },
    {
      nome: 'Gateway de Segurança',
      repo: 'gateway-seguranca',
      linguagem: 'Go',
      linguagens: ['Go'],
      grupo: 'Plataforma bancária',
      frase: 'Autentica, autoriza, limita e registra antes de encaminhar.',
    },
    {
      nome: 'Esteira DevSecOps',
      repo: 'esteira-devsecops-bancaria',
      linguagem: 'Python',
      linguagens: ['Python'],
      grupo: 'Plataforma bancária',
      frase: 'SAST, segredos e imagens com gate de merge, e SIEM em ELK.',
    },
    {
      nome: 'Robô de Fechamento Diário',
      repo: 'robo-fechamento',
      linguagem: 'Python',
      linguagens: ['Python'],
      grupo: 'Plataforma bancária',
      frase: 'Fecha o dia da Ledger e aponta as anomalias em relatório PDF.',
    },
    {
      nome: 'Landed',
      repo: 'Landed',
      linguagem: 'Python',
      linguagens: ['Python'],
      grupo: 'Comércio exterior',
      frase: 'Custo de importação até o centavo, conferido contra cálculos feitos à mão.',
    },
    {
      nome: 'Rastreador de Importação',
      repo: 'Rastreador-de-Importacao',
      linguagem: 'Python + React',
      linguagens: ['Python', 'TypeScript'],
      grupo: 'Comércio exterior',
      frase: 'Etapas do processo, alertas de atraso e custo vindo da Landed.',
    },
    {
      nome: 'Despachante Digital',
      repo: 'despachante-digital',
      linguagem: 'Python',
      linguagens: ['Python'],
      grupo: 'Comércio exterior',
      frase: 'Lê NF e fatura em PDF, cruza por processo e relata as divergências.',
    },
    {
      nome: 'Monitor de Câmbio',
      repo: 'monitor-cambio',
      linguagem: 'Python',
      linguagens: ['Python'],
      grupo: 'Comércio exterior',
      frase: 'PTAX real com alerta de variação configurável.',
    },
  ] satisfies RepoResumo[],
} as const;

export function linguagensDoResumo(): string[] {
  return [...new Set(GITHUB_RESUMO.repos.flatMap((r) => r.linguagens))];
}

export function reposDoGrupo(g: Grupo): readonly RepoResumo[] {
  return GITHUB_RESUMO.repos.filter((r) => r.grupo === g);
}
