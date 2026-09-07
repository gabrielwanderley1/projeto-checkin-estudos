Streak de Estudo | Daily Check-in App

Um aplicativo Full-stack de gerenciamento de rotina de estudos e rastreamento de ofensivas (streaks). O projeto foi desenhado com foco em arquitetura limpa, responsividade avançada e persistência em nuvem, operando perfeitamente na web e empacotado de forma nativa para Android.

🚀 Funcionalidades

Autenticação Segura via OTP: Sistema de recuperação de senha utilizando fluxo de One-Time Password, com mitigação de brute-force, controle de rate limiting no client-side e gerenciamento estrito de sessões preventivo contra acessos indevidos.

Motor de Ofensiva Atômico (Streak Engine): A lógica de cálculo de streaks e validação de datas foi movida integralmente para o banco de dados via RPC (Remote Procedure Call) transacional, prevenindo fraudes de manipulação de relógio local, bugs de fuso horário e condições de corrida (múltiplos cliques).

Calendário Dinâmico Responsivo: Adaptação matemática da grade de dias baseada no window.innerWidth, garantindo usabilidade em qualquer tamanho de tela.

Plano de Estudos Interativo (Drag and Drop): Estrutura de tópicos e subtópicos expansíveis e reordenáveis.

Auto-save Silencioso & Promise Queue: Eventos assíncronos salvam anotações no banco de dados sem cliques adicionais. Uma Fila de Promessas (Promise Queue) foi implementada no Front-end para evitar Race Conditions (condições de corrida) entre o auto-save e os botões de ação.

Theming Global: Sistema de Light/Dark Mode estruturado via variáveis CSS e salvo localmente.

Mobile-Ready: Empacotado como aplicativo Android (.apk) nativo.

🛠 Arquitetura e Tecnologias

O projeto evoluiu de um MVP com armazenamento local para uma arquitetura Client-Server robusta, focada em segurança de dados e performance.

Front-end:

HTML5, CSS3 e JavaScript Puro (Vanilla ES6+). Sem frameworks.

Padrões SPA (Single Page Application) híbrida via manipulação de DOM.

Back-end & Banco de Dados (BaaS):

Supabase (PostgreSQL): Banco de dados relacional para persistência de check-ins, perfis e planos de estudo.

Atomicidade via RPC: Funções embutidas no banco de dados (Remote Procedure Calls) utilizadas para encapsular regras de negócio críticas e garantir a integridade dos dados na comunicação com a API.

Row Level Security (RLS): Políticas de segurança configuradas diretamente no banco para garantir que usuários só acessem ou modifiquem seus próprios dados.

Wipe and Replace: Arquitetura de atualização de dados em massa para o Drag and Drop do Plano de Estudos (utilizando ON DELETE CASCADE).

Mobile:

Capacitor: Encapsulamento da aplicação web em uma WebView, compilando o projeto para um APK Android nativo.

🧠 Metodologia (AI-Assisted Engineering)

Este projeto foi construído utilizando um fluxo moderno de divisão estratégica de papéis com Inteligência Artificial:

Tech Lead: Engenharia de prompts estruturais, modelagem do banco de dados relacional (SQL), auditorias de segurança de aplicações, mitigação de edge cases complexos de concorrência e refatoração arquitetural (migração LocalStorage > Nuvem para Client-Server).

Code Generator: Geração de blocos de código, boilerplate e tradução das regras de negócio para funções JavaScript ES6+.

⚙️ Como executar o projeto localmente

Como o projeto utiliza ES Modules (<script type="module">), ele precisa de um servidor local para rodar no navegador.

Clone o repositório:

git clone https://github.com/seu-usuario/streak-de-estudo.git

Abra a pasta do projeto no VS Code.

Instale a extensão Live Server (ou utilize ferramentas como http-server via Node).

Clique com o botão direito no arquivo login.html ou cadastro.html e selecione "Open with Live Server".

(Para compilar o APK Android, é necessário ter o Node.js, PNPM, Capacitor e o Android Studio instalados e configurados na máquina).