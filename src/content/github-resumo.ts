// O que a carta do Louco revela: o resumo do GitHub. Só fatos dos READMEs públicos de cada repositório.
export interface RepoResumo {
  nome: string;
  repo: string;
  linguagem: string;
  frase: string;
}

export const GITHUB_RESUMO = {
  usuario: 'gabrielgmln-ops',
  url: 'https://github.com/gabrielgmln-ops',
  /** A frase do Louco: o ponto zero, antes do primeiro passo. */
  leitura:
    'O Louco é a carta zero: o começo da jornada. Aqui ela abre o caderno de oficina, onde cada projeto ficou registrado commit a commit, com testes, CI e dados sintéticos.',
  repos: [
    {
      nome: 'Ledger API',
      repo: 'Projeto-B-A',
      linguagem: 'Java',
      frase: 'Livro-razão com partidas dobradas, idempotência e auditoria append-only.',
    },
    {
      nome: 'Pix Simulado',
      repo: 'Pix-Simulado-',
      linguagem: 'Kotlin',
      frase: 'Pagamentos instantâneos sobre a Ledger API, com Testcontainers e CI.',
    },
    {
      nome: 'Motor Antifraude',
      repo: 'motor-antifraude',
      linguagem: 'Python',
      frase: 'Kafka, regras e IsolationForest classificando transações em tempo real.',
    },
    {
      nome: 'Gateway de Segurança',
      repo: 'Gateway-de-Seguran-a',
      linguagem: 'Go',
      frase: 'Gateway de API que autentica, autoriza, limita e registra antes de encaminhar.',
    },
    {
      nome: 'Esteira DevSecOps',
      repo: 'esteira-devsecops-bancaria',
      linguagem: 'Python',
      frase: 'SAST, varredura de segredos e imagens com gate de merge, e SIEM em ELK.',
    },
    {
      nome: 'JARVIS',
      repo: 'jarvis',
      linguagem: 'Python',
      frase: 'Assistente de voz e automação para Windows com LLM rodando localmente.',
    },
  ] satisfies RepoResumo[],
} as const;

export function linguagensDoResumo(): string[] {
  return [...new Set(GITHUB_RESUMO.repos.map((r) => r.linguagem))];
}
