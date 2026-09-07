import { supabase } from './supabase.js';
import { mostrarModal } from './ui.js';

let perfilUsuario = null;

document.addEventListener('DOMContentLoaded', async () => {
    const { data: sessaoData, error: sessaoError } = await supabase.auth.getSession();

    if (sessaoError || !sessaoData.session) {
        window.location.href = 'login.html';
        return;
    }

    perfilUsuario = sessaoData.session.user.id;

    const btnTema = document.getElementById('btn-tema');
    const containerPlano = document.getElementById('container-editor-plano');

    function aplicarTema(modoEscuro) {
        document.body.classList.toggle('theme-dark', modoEscuro);
        btnTema.textContent = modoEscuro ? 'Light mode' : 'Dark mode';
        localStorage.setItem('tema', modoEscuro ? 'dark' : 'light');
    }

    aplicarTema(localStorage.getItem('tema') === 'dark');

    btnTema.addEventListener('click', () => {
        aplicarTema(!document.body.classList.contains('theme-dark'));
    });

    function adicionarTopicoNaTela(titulo = '', concluido = false, subtopicos = []) {
        const card = document.createElement('div');
        card.classList.add('topico-editor-card');
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

        card.addEventListener('dragstart', () => {
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });

        card.querySelector('.btn-remover-topico').addEventListener('click', () => {
            card.remove();
        });

        const containerSub = card.querySelector('.container-subtopicos-editor');
        containerSub.addEventListener('click', evento => {
            if (evento.target.classList.contains('btn-remover-subtopico')) {
                evento.target.closest('.linha-subtopico-input').remove();
            }
        });

        card.querySelector('.btn-add-subtopico').addEventListener('click', () => {
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

    function obterElementoAbaixo(container, y) {
        const elementosArrastaveis = [...container.querySelectorAll('.topico-editor-card:not(.dragging)')];

        return elementosArrastaveis.reduce((maisProximo, filho) => {
            const box = filho.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > maisProximo.offset) {
                return { offset, element: filho };
            }
            return maisProximo;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    containerPlano.addEventListener('dragover', evento => {
        evento.preventDefault();

        const elementoAbaixoDoMouse = obterElementoAbaixo(containerPlano, evento.clientY);
        const elementoArrastado = document.querySelector('.dragging');

        if (!elementoArrastado) {
            return;
        }

        if (elementoAbaixoDoMouse === null) {
            containerPlano.appendChild(elementoArrastado);
        } else {
            containerPlano.insertBefore(elementoArrastado, elementoAbaixoDoMouse);
        }
    });

    const { data: topicos, error: topicosError } = await supabase
        .from('topicos_estudo')
        .select('id, titulo, concluido, ordem, subtopicos(id, titulo, concluido)')
        .eq('usuario_id', perfilUsuario)
        .order('ordem', { ascending: true });

    if (topicosError) {
        console.error('Erro ao carregar plano de estudo:', topicosError);
        mostrarModal('Não foi possível carregar seu plano de estudo.');
        return;
    }

    if (topicos.length === 0) {
        adicionarTopicoNaTela();
    } else {
        topicos.forEach(topico => {
            adicionarTopicoNaTela(topico.titulo, topico.concluido, topico.subtopicos || []);
        });
    }

    document.getElementById('btn-add-topico').addEventListener('click', () => {
        adicionarTopicoNaTela();
    });

    document.getElementById('btn-salvar-plano').addEventListener('click', async () => {
        const btnSalvar = document.getElementById('btn-salvar-plano');
        const cardsNaTela = document.querySelectorAll('.topico-editor-card');

        btnSalvar.disabled = true;

        const { error: exclusaoError } = await supabase
            .from('topicos_estudo')
            .delete()
            .eq('usuario_id', perfilUsuario);

        if (exclusaoError) {
            console.error('Erro ao limpar plano de estudo:', exclusaoError);
            mostrarModal('Não foi possível salvar o plano de estudo.');
            btnSalvar.disabled = false;
            return;
        }

        let ordemAtual = 0;

        for (const card of cardsNaTela) {
            const tituloTopico = card.querySelector('.input-titulo-topico').value.trim();
            const concluidoTopico = card.querySelector('.check-topico').checked;

            if (tituloTopico === '') {
                continue;
            }

            const { data: novoTopico, error: topicoError } = await supabase
                .from('topicos_estudo')
                .insert({
                    usuario_id: perfilUsuario,
                    titulo: tituloTopico,
                    concluido: concluidoTopico,
                    ordem: ordemAtual
                })
                .select()
                .single();

            if (topicoError) {
                console.error('Erro ao salvar tópico:', topicoError);
                mostrarModal('Não foi possível salvar o plano de estudo.');
                btnSalvar.disabled = false;
                return;
            }

            ordemAtual += 1;
            const subtopicos = [];
            const linhasSub = card.querySelectorAll('.subtopico-item-dom');

            linhasSub.forEach(linha => {
                const tituloSub = linha.querySelector('.input-titulo-subtopico').value.trim();
                const concluidoSub = linha.querySelector('.check-subtopico').checked;

                if (tituloSub !== '') {
                    subtopicos.push({
                        topico_id: novoTopico.id,
                        titulo: tituloSub,
                        concluido: concluidoSub
                    });
                }
            });

            if (subtopicos.length > 0) {
                const { error: subtopicosError } = await supabase
                    .from('subtopicos')
                    .insert(subtopicos);

                if (subtopicosError) {
                    console.error('Erro ao salvar subtópicos:', subtopicosError);
                    mostrarModal('Não foi possível salvar os subtópicos.');
                    btnSalvar.disabled = false;
                    return;
                }
            }
        }

        btnSalvar.disabled = false;
        mostrarPopupSalvar();
    });

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
});
