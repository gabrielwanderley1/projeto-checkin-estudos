// --- 1. AUTENTICAÇÃO E TEMA ---
const dadosSalvos = localStorage.getItem('minhaConta');

if (dadosSalvos === null) {
    window.location.href = 'login.html';
}

let conta = JSON.parse(dadosSalvos);

if (!conta.planoEstudo) {
    conta.planoEstudo = [];
}

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

function adicionarTopicoNaTela(titulo = '', concluido = false, subtopicos = []) {
    const card = document.createElement('div');
    card.classList.add('topico-editor-card');
    
    // NOVA REGRA: Diz ao navegador que este elemento pode ser arrastado
    card.setAttribute('draggable', 'true');

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

    const checkTopico = concluido ? 'checked' : '';
    card.innerHTML = `
        <div class="linha-topico-input topico-item-dom">
            <!-- NOVA REGRA: Ícone de alça para arrastar -->
            <span class="drag-handle" title="Arraste para reordenar">☰</span>
            
            <input type="checkbox" class="check-topico" ${checkTopico}>
            <input type="text" class="input-titulo-topico" value="${titulo}" placeholder="Nome do tópico (ex: JavaScript, SQL)">
            <button class="btn-icone btn-remover-topico" title="Remover tópico">✖</button>
        </div>
        <div class="container-subtopicos-editor">
            ${subtopicosHTML}
        </div>
        <button class="btn-add-subtopico">+ Adicionar Subtópico</button>
    `;

    // --- EVENTOS DE DRAG AND DROP DO CARTÃO ---
    card.addEventListener('dragstart', () => {
        card.classList.add('dragging'); // Escurece o cartão ao começar a arrastar
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging'); // Volta ao normal ao soltar
    });
    // ------------------------------------------

    card.querySelector('.btn-remover-topico').addEventListener('click', function() {
        card.remove();
    });

    const containerSub = card.querySelector('.container-subtopicos-editor');
    containerSub.addEventListener('click', function(evento) {
        if (evento.target.classList.contains('btn-remover-subtopico')) {
            evento.target.closest('.linha-subtopico-input').remove();
        }
    });

    card.querySelector('.btn-add-subtopico').addEventListener('click', function() {
        const divSub = document.createElement('div');
        divSub.className = 'linha-subtopico-input subtopico-item-dom';
        divSub.innerHTML = `
            <input type="checkbox" class="check-subtopico">
            <input type="text" class="input-titulo-subtopico" placeholder="Nome do subtópico...">
            <button class="btn-icone btn-remover-subtopico" title="Remover subtópico">✖</button>
        `;
        containerSub.appendChild(divSub);
    });

    containerPlano.appendChild(card);
}

// --- LÓGICA DE REORDENAÇÃO (ZONA DE DROP) ---
// Monitora a área do container enquanto o usuário move o mouse arrastando o cartão
containerPlano.addEventListener('dragover', (evento) => {
    evento.preventDefault(); // O navegador por padrão bloqueia drops, isso desativa o bloqueio
    
    // Descobre em cima de qual cartão o mouse está no momento
    const elementoAbaixoDoMouse = obterElementoAbaixo(containerPlano, evento.clientY);
    const elementoArrastado = document.querySelector('.dragging');
    
    if (elementoAbaixoDoMouse == null) {
        containerPlano.appendChild(elementoArrastado); // Joga pro final se estiver no fim da lista
    } else {
        containerPlano.insertBefore(elementoArrastado, elementoAbaixoDoMouse); // Insere antes do cartão focado
    }
});

// Função matemática que calcula a posição Y (vertical) do mouse em relação aos cartões
function obterElementoAbaixo(container, y) {
    const elementosArrastaveis = [...container.querySelectorAll('.topico-editor-card:not(.dragging)')];

    return elementosArrastaveis.reduce((maisProximo, filho) => {
        const box = filho.getBoundingClientRect();
        const offset = y - box.top - box.height / 2; // Pega exatamente o meio do cartão
        if (offset < 0 && offset > maisProximo.offset) {
            return { offset: offset, element: filho };
        } else {
            return maisProximo;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
// --------------------------------------------

// --- 3. INICIALIZAÇÃO DA TELA ---
if (conta.planoEstudo.length === 0) {
    adicionarTopicoNaTela();
} else {
    conta.planoEstudo.forEach(topico => {
        adicionarTopicoNaTela(topico.titulo, topico.concluido, topico.subtopicos);
    });
}

document.getElementById('btn-add-topico').addEventListener('click', function() {
    adicionarTopicoNaTela();
});

// --- 4. SALVAMENTO DOS DADOS (VARREDURA DO DOM) ---
document.getElementById('btn-salvar-plano').addEventListener('click', function() {
    const cardsNaTela = document.querySelectorAll('.topico-editor-card');
    const novoPlanoEstudo = [];

    cardsNaTela.forEach(card => {
        const tituloTopico = card.querySelector('.input-titulo-topico').value.trim();
        const concluidoTopico = card.querySelector('.check-topico').checked;

        if (tituloTopico !== '') {
            const subtopicos = [];
            const linhasSub = card.querySelectorAll('.subtopico-item-dom');

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

            novoPlanoEstudo.push({
                titulo: tituloTopico,
                concluido: concluidoTopico,
                subtopicos: subtopicos
            });
        }
    });

    conta.planoEstudo = novoPlanoEstudo;
    localStorage.setItem('minhaConta', JSON.stringify(conta));

    mostrarPopupSalvar();
});

// --- 5. POP-UP DE SUCESSO CUSTOMIZADO ---
function mostrarPopupSalvar() {
    const popup = document.createElement('div');
    
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