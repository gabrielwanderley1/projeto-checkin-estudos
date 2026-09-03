// --- 1. AUTENTICAÇÃO E CARREGAMENTO DOS DADOS ---
const dadosSalvos = localStorage.getItem('minhaConta');

if (dadosSalvos === null) {
    alert('Você precisa fazer login primeiro!');
    window.location.href = '../../pages/login.html';
}

let conta = JSON.parse(dadosSalvos);

if (!conta.checkins) conta.checkins = {};
if (typeof conta.streak !== 'number') conta.streak = 0;
// NOVOS ATRIBUTOS: Recorde e última data de check-in
if (typeof conta.maxStreak !== 'number') conta.maxStreak = 0; 
if (!conta.ultimaDataCheckin) conta.ultimaDataCheckin = null;

document.getElementById('nome-usuario').innerText = conta.usuario;

const btnTema = document.getElementById('btn-tema');

function aplicarTema(modoEscuro) {
    document.body.classList.toggle('theme-dark', modoEscuro);
    btnTema.textContent = modoEscuro ? 'Light mode' : 'Dark mode';
    localStorage.setItem('tema', modoEscuro ? 'dark' : 'light');
}

const temaSalvo = localStorage.getItem('tema');
aplicarTema(temaSalvo === 'dark');

btnTema.addEventListener('click', function() {
    const modoEscuro = !document.body.classList.contains('theme-dark');
    aplicarTema(modoEscuro);
});

// --- 2. CONTROLE DE DATAS E ESTADO ---
const dataHoje = new Date();
dataHoje.setHours(0, 0, 0, 0);

let dataCentroVisualizacao = new Date(dataHoje);
let dataSelecionada = new Date(dataHoje);

// --- 3. NOVA LÓGICA: VERIFICAR SE A STREAK QUEBROU ---
if (conta.ultimaDataCheckin) {
    // Pegamos a última data (ex: '2026-08-28') e quebramos em pedaços para evitar bug de Fuso Horário
    const partes = conta.ultimaDataCheckin.split('-');
    const dataUltimoCheckin = new Date(partes[0], partes[1] - 1, partes[2]);
    dataUltimoCheckin.setHours(0, 0, 0, 0);

    // Calculamos a diferença de dias
    const diferencaTempo = dataHoje.getTime() - dataUltimoCheckin.getTime();
    const diferencaDias = Math.floor(diferencaTempo / (1000 * 3600 * 24));

    // Se passaram MAIS de 1 dia desde o último check-in (pulou o dia anterior)
    if (diferencaDias > 1) {
        conta.streak = 0; // Quebra a streak atual
        localStorage.setItem('minhaConta', JSON.stringify(conta));
    }
}

// --- 4. FUNÇÕES AUXILIARES ---
function formatarDataChave(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function obterNomeDiaSemana(data) {
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dias[data.getDay()];
}

// --- 5. RENDERIZAÇÃO ---
function renderizarCalendario() {
    // Atualiza o Mês na tela
    const mesAtualDisplay = document.getElementById('mes-atual');
    const nomeMes = dataCentroVisualizacao.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    mesAtualDisplay.innerText = nomeMes;

    const containerCalendario = document.getElementById('calendario');
    containerCalendario.innerHTML = '';

    let inicioDias = -3;
    let fimDias = 3;

    if (window.innerWidth < 600) {
        inicioDias = -1;
        fimDias = 1;
    } else if (window.innerWidth < 950) {
        inicioDias = -2;
        fimDias = 2;
    }

    for (let i = inicioDias; i <= fimDias; i++) {
        const diaLoop = new Date(dataCentroVisualizacao);
        diaLoop.setDate(dataCentroVisualizacao.getDate() + i);

        const card = document.createElement('div');
        card.classList.add('dia-card');

        const nomeDia = obterNomeDiaSemana(diaLoop);
        const numeroDia = diaLoop.getDate();
        card.innerHTML = `${nomeDia}<br>${numeroDia}`;

        if (diaLoop.getTime() === dataHoje.getTime()) {
            card.classList.add('hoje');
        }

        if (diaLoop.getTime() === dataSelecionada.getTime()) {
            card.style.border = '2px solid #3e2723';
            card.style.fontWeight = 'bold';
        }

        card.addEventListener('click', function() {
            dataSelecionada = new Date(diaLoop);
            renderizarCalendario();
            atualizarPainelAnotacao();
        });

        containerCalendario.appendChild(card);
    }
    atualizarPainelAnotacao();
}

function atualizarPainelAnotacao() {
    const chaveData = formatarDataChave(dataSelecionada);
    const textarea = document.getElementById('texto-anotacao');
    const tituloData = document.getElementById('titulo-data-anotacao');
    const btnCheckin = document.getElementById('btn-checkin');
    
    document.getElementById('streak-count').innerText = conta.streak;
    document.getElementById('max-streak-count').innerText = conta.maxStreak; // Atualiza o Recorde

    const ehHoje = dataSelecionada.getTime() === dataHoje.getTime();
    const jaFezCheckin = conta.checkins[chaveData] && conta.checkins[chaveData].feito;

    if (ehHoje) {
        tituloData.innerText = "O que você estudou hoje?";
    } else {
        tituloData.innerText = `Anotações do dia ${dataSelecionada.toLocaleDateString('pt-BR')}:`;
    }

    if (conta.checkins[chaveData] && conta.checkins[chaveData].anotacao) {
        textarea.value = conta.checkins[chaveData].anotacao;
    } else {
        textarea.value = '';
    }

    if (ehHoje && !jaFezCheckin) {
    textarea.disabled = false;
    btnCheckin.style.display = 'block';
    btnCheckin.disabled = false;
    btnCheckin.innerText = 'Registrar Check-in';
} else if (ehHoje && jaFezCheckin) {
    textarea.disabled = false;
    btnCheckin.style.display = 'block';
    btnCheckin.disabled = true;
    btnCheckin.innerText = 'Check-in já realizado hoje! ✅';
} else {
    textarea.disabled = false;
    btnCheckin.style.display = 'none';
}

}

// --- 6. NAVEGAÇÃO DE DIAS ---
document.getElementById('btn-voltar-dias').addEventListener('click', function() {
    dataCentroVisualizacao.setDate(dataCentroVisualizacao.getDate() - 7);
    renderizarCalendario();
});

// NOVA SETA DE AVANÇAR
document.getElementById('btn-avancar-dias').addEventListener('click', function() {
    dataCentroVisualizacao.setDate(dataCentroVisualizacao.getDate() + 7);
    renderizarCalendario();
});

// --- 7. CHECK-IN ---
document.getElementById('btn-checkin').addEventListener('click', function() {
    const chaveData = formatarDataChave(dataHoje);
    const textoAnotacao = document.getElementById('texto-anotacao').value;

    conta.checkins[chaveData] = {
        feito: true,
        anotacao: textoAnotacao
    };

    conta.streak += 1;
    
    // Atualiza o recorde se a streak atual for maior
    if (conta.streak > conta.maxStreak) {
        conta.maxStreak = conta.streak;
    }

    // Salva a data deste check-in para podermos validar amanhã se ele não pulou um dia
    conta.ultimaDataCheckin = chaveData; 

    localStorage.setItem('minhaConta', JSON.stringify(conta));
    mostrarPopupCheckin();
});

function mostrarPopupCheckin() {
    const diaDaSemana = dataHoje.getDay();
    const ehFimDeSemana = (diaDaSemana === 0 || diaDaSemana === 6);

    let mensagemPopup = "Um pouco a cada dia e você chega lá!";
    if (ehFimDeSemana) {
        mensagemPopup = "Um pouco a cada dia e você chega lá! Hoje pode um ARAM de Cartinha, foi merecido!";
    }

    const popup = document.createElement('div');
    popup.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: white; padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2); max-width: 400px;">
                <h3 style="margin-bottom: 15px; color: #3e2723;">Check-in Registrado! 🔥</h3>
                <p style="margin-bottom: 20px; color: #6d4c41; font-size: 15px;">${mensagemPopup}</p>
                <button class="btn-primary" style="width: 100px;" onclick="location.reload()">Ok</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
}

renderizarCalendario();

// --- 8. RENDERIZAÇÃO DINÂMICA DO PLANO DE ESTUDO ---
const containerListaTopicos = document.querySelector('.lista-topicos');

function renderizarPlanoEstudo() {
    // Limpa o HTML estático de exemplo
    containerListaTopicos.innerHTML = ''; 

    // Se o plano estiver vazio, mostra uma mensagem amigável
    if (!conta.planoEstudo || conta.planoEstudo.length === 0) {
        containerListaTopicos.innerHTML = '<p style="font-size: 14px; color: var(--text-muted); text-align: center; margin-top: 20px;">Nenhum plano cadastrado. Clique no menu para editar.</p>';
        return;
    }

    // Passa por cada tópico salvo no banco de dados
    conta.planoEstudo.forEach((topico, index) => {
        const checkedTopico = topico.concluido ? 'checked' : '';
        let subtopicosHTML = '';
        let temSubtopicos = topico.subtopicos && topico.subtopicos.length > 0;

        // Se houver subtópicos, gera o HTML deles
        if (temSubtopicos) {
            subtopicosHTML = `<div class="subtopicos-lista">`;
            topico.subtopicos.forEach(sub => {
                const checkedSub = sub.concluido ? 'checked' : '';
                subtopicosHTML += `
                    <label class="subtopico-item">
                        <input type="checkbox" disabled ${checkedSub}> ${sub.titulo}
                    </label>
                `;
            });
            subtopicosHTML += `</div>`;
        }

        // A seta só aparece se houver subtópicos
        const setaHTML = temSubtopicos ? `<span class="seta-dropdown">▼</span>` : `<span class="seta-dropdown" style="display: none;">▼</span>`;

        // Monta o cartão do tópico
        const htmlTopico = `
            <div class="topico-item">
                <div class="topico-cabecalho">
                    <input type="checkbox" disabled ${checkedTopico}>
                    <span class="topico-titulo">${index + 1}. ${topico.titulo}</span>
                    ${setaHTML}
                </div>
                ${subtopicosHTML}
            </div>
        `;

        // Injeta na tela
        containerListaTopicos.innerHTML += htmlTopico;
    });

    // Como recriamos os elementos do zero, precisamos reconectar o evento do clique da sanfona
    const cabecalhosTopicos = document.querySelectorAll('.topico-cabecalho');
    cabecalhosTopicos.forEach(cabecalho => {
        cabecalho.addEventListener('click', function() {
            const subtopicos = this.nextElementSibling;
            const seta = this.querySelector('.seta-dropdown');

            if (subtopicos && subtopicos.classList.contains('subtopicos-lista')) {
                subtopicos.classList.toggle('aberto');
                seta.classList.toggle('girada');
            }
        });
    });
}

// Executa a função assim que a tela de início carregar
renderizarPlanoEstudo();

window.addEventListener('resize', renderizarCalendario);