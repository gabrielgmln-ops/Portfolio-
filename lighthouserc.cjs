// Lighthouse CI sobre dist/ — forma mobile (padrão do Lighthouse). Desktop: lighthouserc.desktop.cjs.
const categorias = ['performance', 'accessibility', 'best-practices', 'seo'];

const assercoes = (cs) => Object.fromEntries(cs.map((c) => [`categories:${c}`, ['error', { minScore: 0.95 }]]));

function config({ desktop }) {
  return {
    ci: {
      collect: {
        staticDistDir: './dist',
        // Lista explícita das páginas públicas: sem ela, o lhci pega os 5 primeiros .html (incluía a /_kit,
        // interna e noindex, e deixava /sobre e /projetos/portfolio de fora).
        url: [
          '/',
          '/plataforma/',
          '/sobre/',
          '/projetos/',
          '/projetos/ledger-api/',
          '/projetos/motor-antifraude/',
          '/projetos/landed/',
          '/projetos/portfolio/',
          '/404.html',
        ],
        // Mediana de 3 execuções: uma só oscilava até 9 pontos entre commits idênticos.
        numberOfRuns: 3,
        ...(process.env.CHROME_PATH ? { chromePath: process.env.CHROME_PATH } : {}),
        settings: {
          ...(desktop ? { preset: 'desktop' } : {}),
          chromeFlags: '--headless=new --no-sandbox',
          // Máquina local com antivírus que injeta scripts HTTP em toda página: LHCI_SEM_INJECAO=1 os bloqueia.
          ...(process.env.LHCI_SEM_INJECAO ? { blockedUrlPatterns: ['*kaspersky-labs.com*'] } : {}),
        },
      },
      // A 404 é noindex de propósito, então SEO não se aplica a ela; as outras 3 categorias valem.
      assert: {
        assertMatrix: [
          { matchingUrlPattern: '^(?!.*/404\\.html$).*', assertions: assercoes(categorias) },
          { matchingUrlPattern: '/404\\.html$', assertions: assercoes(categorias.filter((c) => c !== 'seo')) },
        ],
      },
      upload: { target: 'filesystem', outputDir: `.lighthouseci/${desktop ? 'desktop' : 'mobile'}` },
    },
  };
}

module.exports = config({ desktop: false });
module.exports.config = config;
