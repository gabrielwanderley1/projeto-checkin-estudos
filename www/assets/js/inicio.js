import { supabase } from './supabase.js';

let perfilUsuario = null;

document.addEventListener('DOMContentLoaded', async () => {
    const btnTema = document.getElementById('btn-tema');
    const textarea = document.getElementById('texto-anotacao');
    const btnCheckin = document.getElementById('btn-checkin');
    const dataHoje = normalizarData(new Date());
    let dataCentroVisualizacao = new Date(dataHoje);
    let dataSelecionada = new Date(dataHoje);

    const { data: sessaoData, error: sessaoError } = await supabase.auth.getSession();

    if (sessaoError || !sessaoData.session) {
        window.location.href = 'login.html';
        return;
    }

    const { data: perfil, error: perfilError } = await supabase
        .from('usuarios')
        .select('id, nome_usuario, streak_atual, recorde_streak, ultimo_checkin')
        .eq('id', sessaoData.session.user.id)
        .single();

    if (perfilError) {
        console.error('Erro ao carregar o perfil:', perfilError);
        alert('Não foi possível carregar seu perfil.');
        return;
    }

    perfilUsuario = perfil;
    document.getElementById('nome-usuario').innerText = perfilUsuario.nome_usuario;

    await verificarQuebraStreak();
    const temaSalvo = localStorage.getItem('tema');
    aplicarTema(temaSalvo === 'dark');

    btnTema.addEventListener('click', () => {
        aplicarTema(!document.body.classList.contains('theme-dark'));
    });

    document.getElementById('btn-voltar-dias').addEventListener('click', () => {
        dataCentroVisualizacao.setDate(dataCentroVisualizacao.getDate() - 7);
        renderizarCalendario();
    });

    document.getElementById('btn-avancar-dias').addEventListener('click', () => {
        dataCentroVisualizacao.setDate(dataCentroVisualizacao.getDate() + 7);
        renderizarCalendario();
    });

    btnCheckin.addEventListener('click', async () => {
        const chaveData = formatarDataChave(dataHoje);
        const anotacao = textarea.value;

        btnCheckin.disabled = true;
        textarea.disabled = true;

        const anotacaoSalva = await salvarAnotacaoNoBanco(chaveData, anotacao);
        if (!anotacaoSalva) {
            btnCheckin.disabled = false;
            return;
        }

        const novaStreak = perfilUsuario.streak_atual + 1;
        const novoRecorde = Math.max(perfilUsuario.recorde_streak, novaStreak);
        const { error: perfilUpdateError } = await supabase
            .from('usuarios')
            .update({
                streak_atual: novaStreak,
                ultimo_checkin: chaveData,
                recorde_streak: novoRecorde
            })
            .eq('id', perfilUsuario.id);

        if (perfilUpdateError) {
            console.error('Erro ao atualizar a streak:', perfilUpdateError);
            alert('O check-in foi salvo, mas não foi possível atualizar sua streak.');
            btnCheckin.disabled = false;
            return;
        }

        perfilUsuario.streak_atual = novaStreak;
        perfilUsuario.recorde_streak = novoRecorde;
        perfilUsuario.ultimo_checkin = chaveData;
        atualizarContadores();
        atualizarPainelAnotacao();
        mostrarPopupCheckin();
    });

    textarea.addEventListener('blur', async function() {
        const chaveData = formatarDataChave(dataSelecionada);
        await salvarAnotacaoNoBanco(chaveData, this.value);
    });

    let filaSalvamentoAnotacao = Promise.resolve();

    async function salvarAnotacaoNoBanco(chaveData, texto) {
        const operacao = filaSalvamentoAnotacao.then(async () => {
            const { data: checkin, error: buscaError } = await supabase
                .from('checkins')
                .select('id')
                .eq('usuario_id', perfilUsuario.id)
                .eq('data_registro', chaveData)
                .maybeSingle();

            if (buscaError) {
                console.error('Erro ao buscar anotação:', buscaError);
                alert('Não foi possível salvar a anotação.');
                return false;
            }

            const consulta = checkin
                ? supabase.from('checkins').update({ anotacao: texto }).eq('id', checkin.id)
                : supabase.from('checkins').insert({
                    usuario_id: perfilUsuario.id,
                    data_registro: chaveData,
                    anotacao: texto
                });
            const { error: salvamentoError } = await consulta;

            if (salvamentoError) {
                console.error('Erro ao salvar anotação:', salvamentoError);
                alert('Não foi possível salvar a anotação.');
                return false;
            }

            return true;
        });

        filaSalvamentoAnotacao = operacao.catch(() => undefined);
        return operacao;
    }

    function aplicarTema(modoEscuro) {
        document.body.classList.toggle('theme-dark', modoEscuro);
        btnTema.textContent = modoEscuro ? 'Light mode' : 'Dark mode';
        localStorage.setItem('tema', modoEscuro ? 'dark' : 'light');
    }

    async function verificarQuebraStreak() {
        if (!perfilUsuario.ultimo_checkin) {
            return;
        }

        const ultimoCheckin = normalizarData(perfilUsuario.ultimo_checkin);
        const diferencaDias = Math.floor(
            (dataHoje.getTime() - ultimoCheckin.getTime()) / (1000 * 3600 * 24)
        );

        if (diferencaDias > 1) {
            const { error } = await supabase
                .from('usuarios')
                .update({ streak_atual: 0 })
                .eq('id', perfilUsuario.id);

            if (error) {
                console.error('Erro ao quebrar a streak:', error);
                alert('Não foi possível atualizar sua streak.');
                return;
            }

            perfilUsuario.streak_atual = 0;
        }
    }

    function formatarDataChave(data) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }

    function normalizarData(data) {
        if (typeof data === 'string') {
            const [ano, mes, dia] = data.slice(0, 10).split('-').map(Number);
            return new Date(ano, mes - 1, dia);
        }

        const resultado = new Date(data);
        resultado.setHours(0, 0, 0, 0);
        return resultado;
    }

    function obterNomeDiaSemana(data) {
        return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][data.getDay()];
    }

    function atualizarContadores() {
        document.getElementById('streak-count').innerText = perfilUsuario.streak_atual;
        document.getElementById('max-streak-count').innerText = perfilUsuario.recorde_streak;
    }

    function renderizarCalendario() {
        document.getElementById('mes-atual').innerText =
            dataCentroVisualizacao.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        const calendario = document.getElementById('calendario');
        calendario.innerHTML = '';

        let inicioDias = -3;
        let fimDias = 3;
        if (window.innerWidth < 600) {
            inicioDias = -1;
            fimDias = 1;
        } else if (window.innerWidth < 950) {
            inicioDias = -2;
            fimDias = 2;
        }

        for (let i = inicioDias; i <= fimDias; i += 1) {
            const diaLoop = new Date(dataCentroVisualizacao);
            diaLoop.setDate(dataCentroVisualizacao.getDate() + i);

            const card = document.createElement('div');
            card.classList.add('dia-card');
            card.innerHTML = `${obterNomeDiaSemana(diaLoop)}<br>${diaLoop.getDate()}`;

            if (diaLoop.getTime() === dataHoje.getTime()) {
                card.classList.add('hoje');
            }
            if (diaLoop.getTime() === dataSelecionada.getTime()) {
                card.style.border = '2px solid #3e2723';
                card.style.fontWeight = 'bold';
            }

            card.addEventListener('click', () => {
                dataSelecionada = new Date(diaLoop);
                renderizarCalendario();
            });
            calendario.appendChild(card);
        }

        atualizarPainelAnotacao();
    }

    async function atualizarPainelAnotacao() {
        const chaveData = formatarDataChave(dataSelecionada);
        const { data: checkin, error } = await supabase
            .from('checkins')
            .select('anotacao')
            .eq('usuario_id', perfilUsuario.id)
            .eq('data_registro', chaveData)
            .maybeSingle();

        if (error) {
            console.error('Erro ao carregar anotação:', error);
            alert('Não foi possível carregar a anotação.');
            return;
        }

        atualizarContadores();
        const ehHoje = chaveData === formatarDataChave(dataHoje);
        const jaFezCheckin = (perfilUsuario.ultimo_checkin === formatarDataChave(dataHoje));
        document.getElementById('titulo-data-anotacao').innerText = ehHoje
            ? 'O que você estudou hoje?'
            : `Anotações do dia ${dataSelecionada.toLocaleDateString('pt-BR')}:`;
        textarea.value = checkin?.anotacao || '';
        textarea.disabled = ehHoje ? jaFezCheckin : true;
        btnCheckin.style.display = ehHoje ? 'block' : 'none';
        btnCheckin.disabled = ehHoje && jaFezCheckin;
        btnCheckin.innerText = jaFezCheckin
            ? 'Check-in já realizado hoje! ✅'
            : 'Registrar Check-in';
    }

    function mostrarPopupCheckin() {
        const ehFimDeSemana = [0, 6].includes(dataHoje.getDay());
        const mensagem = ehFimDeSemana
            ? 'Um pouco a cada dia e você chega lá! Hoje pode um ARAM de Cartinha, foi merecido!'
            : 'Um pouco a cada dia e você chega lá!';
        const popup = document.createElement('div');
        popup.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
                <div style="background: white; padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2); max-width: 400px;">
                    <h3 style="margin-bottom: 15px; color: #3e2723;">Check-in Registrado! 🔥</h3>
                    <p style="margin-bottom: 20px; color: #6d4c41; font-size: 15px;">${mensagem}</p>
                    <button class="btn-primary" style="width: 100px;" onclick="location.reload()">Ok</button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
    }

    renderizarCalendario();
    await carregarE_RenderizarPlanoEstudo();
    window.addEventListener('resize', renderizarCalendario);

    async function carregarE_RenderizarPlanoEstudo() {
        const containerListaTopicos = document.querySelector('.lista-topicos');
        containerListaTopicos.innerHTML = '';

        const { data: topicos, error } = await supabase
            .from('topicos_estudo')
            .select('id, titulo, concluido, ordem, subtopicos(id, titulo, concluido)')
            .eq('usuario_id', perfilUsuario.id)
            .order('ordem', { ascending: true });

        if (error) {
            console.error('Erro ao carregar plano de estudo:', error);
            containerListaTopicos.innerHTML =
                '<p style="font-size: 14px; color: var(--text-muted); text-align: center; margin-top: 20px;">Não foi possível carregar seu plano de estudo.</p>';
            return;
        }

        if (!topicos || topicos.length === 0) {
            containerListaTopicos.innerHTML =
                '<p style="font-size: 14px; color: var(--text-muted); text-align: center; margin-top: 20px;">Nenhum plano cadastrado. Vá ao menu para criar seu plano.</p>';
            return;
        }

        topicos.forEach((topico, index) => {
            const checkedTopico = topico.concluido ? 'checked' : '';
            const subtopicos = topico.subtopicos || [];
            let subtopicosHTML = '';

            if (subtopicos.length > 0) {
                subtopicosHTML = '<div class="subtopicos-lista">';
                subtopicos.forEach(subtopico => {
                    const checkedSubtopico = subtopico.concluido ? 'checked' : '';
                    subtopicosHTML += `
                        <label class="subtopico-item">
                            <input type="checkbox" disabled ${checkedSubtopico}> ${subtopico.titulo}
                        </label>
                    `;
                });
                subtopicosHTML += '</div>';
            }

            const setaHTML = subtopicos.length > 0
                ? '<span class="seta-dropdown">▼</span>'
                : '<span class="seta-dropdown" style="display: none;">▼</span>';

            containerListaTopicos.innerHTML += `
                <div class="topico-item">
                    <div class="topico-cabecalho">
                        <input type="checkbox" disabled ${checkedTopico}>
                        <span class="topico-titulo">${index + 1}. ${topico.titulo}</span>
                        ${setaHTML}
                    </div>
                    ${subtopicosHTML}
                </div>
            `;
        });

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
});
