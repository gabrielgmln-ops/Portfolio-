// Lighthouse CI sobre dist/ — forma mobile (padrão do Lighthouse). Desktop: lighthouserc.desktop.cjs.
const categorias = ['performance', 'accessibility', 'best-practices', 'seo'];

const assercoes = (cs) => Object.fromEntries(cs.map((c) => [`categories:${c}`, ['error', { minScore: 0.95 }]]));

function config({ desktop }) {
  return {
    ci: {
      collect: {
        staticDistDir: './dist',
        numberOfRuns: 1,
        ...(process.env.CHROME_PATH ? { chromePath: process.env.CHROME_PATH } : {}),
        settings: {
          ...(desktop ? { preset: 'desktop' } : {}),
          chromeFlags: '--headless=new --no-sandbox',
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
