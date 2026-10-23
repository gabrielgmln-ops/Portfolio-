# Issues para o back-end (abertas pelo front)

1. **O corpo do MDX está fora do contrato.**
   - O `CaseStudy` precisa de Problema, Decisões, Testes, Limitações e Próximos passos.
   - Esse conteúdo existe no corpo do MDX (ex.: `ledger-api.mdx` tem "Teste de fumaça" e "Teste de concorrência"), mas `getProjeto()` não o expõe.
   - Hoje a página do projeto mostra só Contexto (`resumo`), Minha contribuição (`papel`), Testes (`prova`) e Resultado.
   - Pedido: `getEstudo(slug)` devolvendo as seções como `{ titulo, html }`.
2. **O Louco está `em-desenvolvimento`**, mas o prompt do front dizia "concluído". O front segue o conteúdo: a carta aparece dessaturada.
3. **Não há categoria de competência.** `getCompetencias()` devolve competência → projetos. O front agrupa pela trilha do projeto que comprova a competência.
4. **"Forma de trabalhar" (página Sobre)** não tem campo no `Perfil`, então a seção foi omitida.
5. **Nome:** o prompt diz "Gabriel Moraes Lopes", mas `getPerfil().nome` é "Gabriel Moraes". O front usa o conteúdo.
6. **O `atualizadoEm` da Ledger API é 2026-10-30**, uma data futura em 23/10. Conferir.
7. **Pendências de conteúdo** (os `[PENDENTE]` são omitidos na interface):
   - Portfólio: resumo, papel, prova, trilha, repo e demo.
   - Roteiro: quase todos os itens estão sem frase e sem critério; só o Assistente aduaneiro tem `prova`.
