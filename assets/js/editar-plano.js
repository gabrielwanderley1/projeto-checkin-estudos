// --- 1. AUTENTICAÇÃO E TEMA ---
const dadosSalvos = localStorage.getItem('minhaConta');

if (dadosSalvos === null) {
    window.location.href = 'login.html';
}

let conta = JSON.parse(dadosSalvos);

// Garante que o usuário tenha um array de plano de estudo salvo na conta
if (!conta.planoEstudo) {
    conta.planoEstudo = [];
}

// Lógica do Dark Mode
const btnTema = document.getElementById('btn-tema');
function aplicarTema(modoEscuro) {
    document.body.classList.toggle('theme-dark', modoEscuro);
    btnTema.textContent = modoEscuro ? 'Light mode' : 'Dark mode';
    localStorage.setItem('tema', modoEscuro ? 'dark' : 'light');
}
aplicarTema(localStorage.getItem('tema') === 'dark');

btnTema.addEventListener('click', function() {
    aplicarTema(!document.body.classList.contains('theme-dark'));
});

// --- 2. CONSTRUÇÃO DINÂMICA DO PLANO DE ESTUDO ---
const containerPlano = document.getElementById('container-editor-plano');

// Função central que injeta um novo cartão de Tópico na tela
function adicionarTopicoNaTela(titulo = '', concluido = false, subtopicos = []) {
    const card = document.createElement('div');
    card.classList.add('topico-editor-card');

    // 2.1. Monta o HTML dos subtópicos, caso existam
    let subtopicosHTML = '';
    subtopicos.forEach(sub => {
        const checkAtributo = sub.concluido ? 'checked' : '';
        subtopicosHTML += `
            <div class="linha-subtopico-input subtopico-item-dom">
                <input type="checkbox" class="check-subtopico" ${checkAtributo}>
                <input type="text" class="input-titulo-subtopico" value="${sub.titulo}" placeholder="Nome do subtópico...">
                <button class="btn-icone btn-remover-subtopico" title="Remover subtópico">✖</button>
            </div>
        `;
    });

    // 2.2. Monta o HTML do tópico principal
    const checkTopico = concluido ? 'checked' : '';
    card.innerHTML = `
        <div class="linha-topico-input topico-item-dom">
            <input type="checkbox" class="check-topico" ${checkTopico}>
            <input type="text" class="input-titulo-topico" value="${titulo}" placeholder="Nome do tópico (ex: JavaScript, SQL)">
            <button class="btn-icone btn-remover-topico" title="Remover tópico">✖</button>
        </div>
        <div class="container-subtopicos-editor">
            ${subtopicosHTML}
        </div>
        <button class="btn-add-subtopico">+ Adicionar Subtópico</button>
    `;

    // 2.3. Eventos de exclusão (Tópico e Subtópico)
    card.querySelector('.btn-remover-topico').addEventListener('click', function() {
        card.remove(); // Remove o cartão inteiro da tela
    });

    // Usamos 'event delegation' no container de subtópicos para pegar os cliques nos botões '✖'
    const containerSub = card.querySelector('.container-subtopicos-editor');
    containerSub.addEventListener('click', function(evento) {
        if (evento.target.classList.contains('btn-remover-subtopico')) {
            evento.target.closest('.linha-subtopico-input').remove();
        }
    });

    // 2.4. Evento para adicionar um novo subtópico em branco
    card.querySelector('.btn-add-subtopico').addEventListener('click', function() {
        const divSub = document.createElement('div');
        divSub.className = 'linha-subtopico-input subtopico-item-dom';
        divSub.innerHTML = `
            <input type="checkbox" class="check-subtopico">
            <input type="text" class="input-titulo-subtopico" placeholder="Nome do subtópico...">
            <button class="btn-icone btn-remover-subtopico" title="Remover subtópico">✖</button>
        `;
        containerSub.appendChild(divSub); // Injerta a nova linha na tela
    });

    containerPlano.appendChild(card);
}

// --- 3. INICIALIZAÇÃO DA TELA ---
// Se não houver nada salvo, cria um cartão vazio. Se houver, carrega todos.
if (conta.planoEstudo.length === 0) {
    adicionarTopicoNaTela();
} else {
    conta.planoEstudo.forEach(topico => {
        adicionarTopicoNaTela(topico.titulo, topico.concluido, topico.subtopicos);
    });
}

// Botão geral de adicionar novo tópico
document.getElementById('btn-add-topico').addEventListener('click', function() {
    adicionarTopicoNaTela();
});

// --- 4. SALVAMENTO DOS DADOS (VARREDURA DO DOM) ---
document.getElementById('btn-salvar-plano').addEventListener('click', function() {
    const cardsNaTela = document.querySelectorAll('.topico-editor-card');
    const novoPlanoEstudo = [];

    // O JavaScript passa por cada cartão visível na tela
    cardsNaTela.forEach(card => {
        const tituloTopico = card.querySelector('.input-titulo-topico').value.trim();
        const concluidoTopico = card.querySelector('.check-topico').checked;

        // Regra: Só vamos salvar tópicos que tenham algum título digitado
        if (tituloTopico !== '') {
            const subtopicos = [];
            const linhasSub = card.querySelectorAll('.subtopico-item-dom');

            // Passa por cada subtópico dentro deste cartão
            linhasSub.forEach(linha => {
                const tituloSub = linha.querySelector('.input-titulo-subtopico').value.trim();
                const concluidoSub = linha.querySelector('.check-subtopico').checked;

                if (tituloSub !== '') {
                    subtopicos.push({
                        titulo: tituloSub,
                        concluido: concluidoSub
                    });
                }
            });

            // Monta o objeto JSON deste bloco
            novoPlanoEstudo.push({
                titulo: tituloTopico,
                concluido: concluidoTopico,
                subtopicos: subtopicos
            });
        }
    });

    // Sobrescreve o plano antigo no objeto 'conta' e salva no localStorage
    conta.planoEstudo = novoPlanoEstudo;
    localStorage.setItem('minhaConta', JSON.stringify(conta));

    mostrarPopupSalvar();

    // --- 5. POP-UP DE SUCESSO CUSTOMIZADO ---
function mostrarPopupSalvar() {
    const popup = document.createElement('div');
    
    // Note o uso das variáveis CSS do seu :root para garantir compatibilidade com os temas
    popup.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div style="background-color: var(--bg-panel); border: 1px solid var(--border); padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 4px 12px var(--shadow); max-width: 400px; width: 90%;">
                <h3 style="margin-bottom: 15px; color: var(--accent-strong); font-size: 20px;">Plano Atualizado! 💾</h3>
                <p style="margin-bottom: 25px; color: var(--text-main); font-size: 15px;">Suas alterações no plano de estudo foram salvas com sucesso.</p>
                <button class="btn-primary" style="width: auto; padding: 10px 40px;" onclick="window.location.href='inicio.html'">Ok</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
}
});