# Streak de Estudo | Daily Check-in App

![Demonstração do Projeto](caminho-para-o-seu-gif-ou-imagem.gif) <!-- Substitua por um GIF curto do app funcionando no celular ou PC -->

Um aplicativo de gerenciamento de rotina de estudos e rastreamento de ofensivas (streaks). O projeto foi desenhado com foco em fundamentos de front-end, responsividade avançada e arquitetura limpa, operando perfeitamente na web e empacotado de forma nativa para Android.

## Funcionalidades

* **Autenticação e Sessão:** Login e criação de contas baseados em sistema de rotas seguras.
* **Calendário Dinâmico Responsivo:** Adaptação matemática da grade de dias baseada no `window.innerWidth`, garantindo usabilidade em qualquer tamanho de tela.
* **Plano de Estudos Interativo:** Estrutura de tópicos e subtópicos expansíveis.
* **Auto-save Silencioso:** Eventos assíncronos garantem que anotações diárias sejam salvas sem a necessidade de cliques adicionais (UX focada em mobile).
* **Theming Global:** Sistema de Light/Dark Mode estruturado via variáveis CSS (`:root`) com injeção de script bloqueante para prevenção de *Flash of Unstyled Content* (FOUC).
* **Mobile-Ready:** Empacotado como aplicativo Android (.apk) nativo.

## 🛠 Arquitetura e Tecnologias

Projeto desenvolvido para consolidar fundamentos robustos de engenharia de software no Front-end, estruturando regras de negócio e estado da aplicação como base escalável para uma futura integração com bancos de dados relacionais (SQL).

* **Tech Stack:** HTML5, CSS3 e JavaScript Puro (Vanilla ES6+). Sem frameworks.
* **Gerenciamento de Dados:** Persistência local utilizando `localStorage` e manipulação estruturada via JSON, atuando como um *mock database* arquitetado.
* **Integração Mobile:** **Capacitor** para encapsulamento WebView, transformando o projeto web em um aplicativo Android nativo.
* **Padrões de UI/UX:** Navegação em formato Single Page Application (SPA) híbrida via manipulação de DOM (`display: none/block`), modais customizados para retenção de contexto e layouts fluídos (CSS Grid/Flexbox).

## 🧠 Metodologia (AI-Assisted Development)

Este projeto foi construído utilizando um fluxo moderno de divisão estratégica de papéis com Inteligência Artificial:
* **Planejamento e Arquitetura:** O **Gemini** foi utilizado como Tech Lead para a engenharia de prompts estruturais, análise de bugs complexos (como invasão de grid e ciclo de renderização), e modelagem do banco de dados simulado.
* **Execução e Boilerplate:** O **GitHub Copilot** foi encarregado da geração de códigos a partir de escopos estritos.

Essa abordagem garantiu o controle arquitetural absoluto pelo desenvolvedor, assegurando código limpo, componentização sem bibliotecas externas e resolução de problemas estruturais profundos antes da escrita do código.