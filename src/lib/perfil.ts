import type { Perfil } from '../types';

/** Dados da seção 1 do PROMPT.md. Campos pendentes ficariam undefined. */
export function getPerfil(): Perfil {
  return {
    nome: 'Gabriel Moraes',
    apresentacao:
      'Estudante de Tecnologia em Comércio Exterior na FATEC Guarulhos (2026–2029); começo Ciência da Computação na FIAP em fevereiro de 2027. Foco em back-end para bancos e fintechs. Base em Guarulhos, SP.',
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
