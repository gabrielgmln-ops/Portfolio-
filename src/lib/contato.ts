import { z } from 'zod';
import { getPerfil } from './perfil';

/**
 * Contato (lançamento): mailto + copiar e-mail. Sem serverless, sem .env.
 *
 * Honeypot para o front: o input `name="site"` deve ficar FORA da tela
 * (position:absolute; left:-9999px), com tabindex="-1", autocomplete="off"
 * e aria-hidden="true". Nunca use display:none (bots detectam e ignoram).
 */
export const HONEYPOT_CAMPO = 'site';

export const contatoSchema = z.object({
  nome: z.string().trim().min(1).max(100),
  email: z.string().trim().pipe(z.email()),
  mensagem: z.string().trim().min(1).max(2000),
  site: z.string().max(0).optional(),
});

export type DadosContato = z.infer<typeof contatoSchema>;

export type ResultadoValidacao =
  | { ok: true; dados?: DadosContato }
  | { ok: false; erro: 'validacao'; campos: string[] };

export type ResultadoEnvio =
  | { ok: true }
  | { ok: false; erro: 'validacao' | 'limite' | 'rede'; campos?: string[] };

function honeypotPreenchido(dados: unknown): boolean {
  if (typeof dados !== 'object' || dados === null) return false;
  const v = (dados as Record<string, unknown>)[HONEYPOT_CAMPO];
  return typeof v === 'string' ? v.length > 0 : v !== undefined && v !== null;
}

/**
 * Valida os dados. Honeypot preenchido → `{ ok: true }` sem `dados`
 * (descarte silencioso: o bot acha que deu certo e nada é enviado).
 */
export function validarContato(dados: unknown): ResultadoValidacao {
  if (honeypotPreenchido(dados)) return { ok: true };
  const r = contatoSchema.safeParse(dados);
  if (r.success) return { ok: true, dados: r.data };
  const campos = [...new Set(r.error.issues.map((i) => String(i.path[0] ?? '')))].filter(Boolean);
  return { ok: false, erro: 'validacao', campos };
}

export function montarMailto(dados: Pick<DadosContato, 'nome' | 'email' | 'mensagem'>): string {
  const destino = getPerfil().email;
  if (destino === undefined) throw new Error('contato: e-mail do perfil não definido (getPerfil().email)');
  const assunto = `Contato pelo portfólio — ${dados.nome}`;
  const corpo = `${dados.mensagem}\n\n— ${dados.nome} <${dados.email}>`;
  return `mailto:${destino}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

/**
 * Valida e abre o cliente de e-mail. 'limite' é reservado para uma futura
 * função serverless com rate limit (não ocorre na versão mailto).
 */
export async function enviarContato(
  dados: unknown,
  opcoes?: { abrir?: (url: string) => void },
): Promise<ResultadoEnvio> {
  const v = validarContato(dados);
  if (!v.ok) return { ok: false, erro: 'validacao', campos: v.campos };
  if (v.dados === undefined) return { ok: true };
  let abrir = opcoes?.abrir;
  if (abrir === undefined) {
    if (typeof window === 'undefined') return { ok: false, erro: 'rede' };
    abrir = (url) => {
      window.location.href = url;
    };
  }
  try {
    abrir(montarMailto(v.dados));
    return { ok: true };
  } catch {
    return { ok: false, erro: 'rede' };
  }
}
