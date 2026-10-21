import type { Perfil } from '../types';

/** Dados da seção 1 do PROMPT.md. Campos pendentes ficariam undefined. */
export function getPerfil(): Perfil {
  return {
    nome: 'Gabriel Moraes',
    apresentacao:
      'Estudante de Tecnologia em Comércio Exterior na FATEC Guarulhos (2026–2029) com início em Ciência da Computação na FIAP previsto para fevereiro de 2027; experiência com automação de processos; foco em desenvolvimento para bancos e fintechs.',
    email: 'gabriel.gmln@gmail.com',
    github: { usuario: 'gabrielgmln-ops', url: 'https://github.com/gabrielgmln-ops' },
    linkedin: 'https://www.linkedin.com/in/gabrielmoraeslopes/',
    idiomas: [
      { idioma: 'Português', nivel: 'nativo' },
      { idioma: 'Inglês', nivel: 'avançado' },
      { idioma: 'Espanhol', nivel: 'básico' },
    ],
  };
}
