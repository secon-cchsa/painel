# Dashboard de Contratações — GitHub Pages

## Arquivos
- `index.html`: dashboard estático; carrega os dados de `dados.json`.
- `dados.json`: dados publicados pelo site.
- `base_contratacoes.xlsx`: planilha local de trabalho, preenchida com os 500 registros presentes na base original; agora usa as colunas Modalidade e Ano no lugar de Número do pregão e inclui a coluna Descrição após Ano para registrar o objeto da contratação.
- `atualizar_dados.py`: converte a planilha em JSON.
- `ATUALIZAR_DADOS.bat`: executa a conversão no Windows e mostra os erros antes de fechar.
- `ABRIR_DASHBOARD_LOCAL.bat`: abre o dashboard localmente por um pequeno servidor HTTP.

## Publicação gratuita no GitHub Pages

O projeto está preparado para hospedagem estática. Para publicar e receber um endereço gratuito `https://SEU-USUARIO.github.io/dashboard-contratacoes/`:

1. Entre em [github.com](https://github.com/) e crie um repositório público chamado `dashboard-contratacoes`.
2. Envie `index.html`, `dados.json`, `.nojekyll`, `README.md`, `atualizar_dados.py`, `ATUALIZAR_DADOS.bat` e `.gitignore` para a raiz do repositório. **Não envie `base_contratacoes.xlsx`**: ela contém a planilha de trabalho e deve ficar no computador.
3. No GitHub, abra **Settings → Pages**. Em **Build and deployment**, escolha **Deploy from a branch**, branch `main` e pasta `/(root)`, e salve.
4. Aguarde o GitHub Pages publicar. O endereço do site aparecerá na seção **Pages** das configurações do repositório.

Esta pasta ainda não está ligada a uma conta ou repositório GitHub. Depois que o endereço gratuito estiver funcionando, um domínio próprio poderá ser comprado e conectado nas configurações do Pages e no painel DNS do registrador.

## Como testar o dashboard no computador

**Não abra `index.html` com duplo clique.** Nesse caso o endereço começa com `file://`, e os navegadores normalmente bloqueiam a leitura de `dados.json` por segurança. Isso deixa a dashboard vazia mesmo que o JSON exista.

1. Deixe `index.html` e `dados.json` na mesma pasta.
2. Dê duplo clique em `ABRIR_DASHBOARD_LOCAL.bat`.
3. O navegador abrirá `http://127.0.0.1:8000/index.html`. Aguarde aparecer a mensagem de base carregada.
4. Mantenha a janela preta aberta enquanto estiver usando o dashboard. Para encerrar, volte a ela e pressione `Ctrl+C`.

É necessário ter Python 3 instalado no Windows. Se o arquivo BAT fechar ou mostrar erro, execute-o novamente e anote a mensagem exibida.

## Atualização mensal (Windows)
1. Faça uma cópia de segurança de `base_contratacoes.xlsx`.
2. Abra a planilha e atualize os registros na aba `Contratacoes`. Não mude os nomes das colunas da primeira linha. A coluna Modalidade aceita apenas Pregão ou IRP; Ano contém o ano da contratação; Descrição deve conter o objeto de aquisição/contratação correspondente. Os registros antigos não tinham essa informação, então a nova coluna começa vazia e deve ser preenchida conforme os documentos oficiais.
3. Salve e feche o Excel.
4. Dê duplo clique em `ATUALIZAR_DADOS.bat`. A janela deverá permanecer aberta e informar quantos registros foram exportados para `dados.json`. Se houver erro, a mensagem ficará visível; confira se o Python 3 está instalado, se `base_contratacoes.xlsx` está na mesma pasta e se a planilha foi fechada antes de executar.
5. Abra o GitHub Desktop. Ele deverá mostrar `dados.json` como arquivo modificado. Revise a mudança, escreva uma mensagem como `Atualização mensal da base` e clique em **Commit to main**.
6. Clique em **Push origin** para enviar a nova versão ao GitHub.
7. Depois da publicação, confira totais, filtros, mapa e notas fiscais no site público. Se o navegador mostrar dados antigos, atualize a página com Ctrl+F5.

## Importante
- A planilha Excel deve permanecer na pasta local do projeto, mas não precisa ser publicada no repositório. O arquivo `.gitignore` impede que `base_contratacoes.xlsx` seja enviado acidentalmente pelo Git.
- O dashboard público mostra a última versão de `dados.json` enviada ao GitHub. Alterações na planilha local não aparecem até executar o conversor e publicar o JSON.
- Não é necessário servidor externo nem manter o computador ligado.
- Não publique informações pessoais, restritas ou que não possam ser divulgadas publicamente.
- A planilha incluída é um ponto de partida com os dados presentes no dashboard de origem. Valide os dados antes de usar/publicar oficialmente.
- Não altere os cabeçalhos do Excel sem atualizar o script.
