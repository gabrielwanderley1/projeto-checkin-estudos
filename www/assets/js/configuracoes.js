import { supabase } from './supabase.js';

let usuarioLogado = null;

function mostrarModal(mensagem, destinoUrl = null) {
    const overlay = document.createElement('div');
    overlay.style.cssText = [
        'position: fixed',
        'inset: 0',
        'z-index: 1000',
        'display: flex',
        'justify-content: center',
        'align-items: center',
        'padding: 20px',
        'background: rgba(0, 0, 0, 0.55)'
    ].join(';');

    const cartao = document.createElement('div');
    cartao.style.cssText = [
        'width: min(100%, 380px)',
        'padding: 30px',
        'background: var(--bg-panel)',
        'color: var(--text-main)',
        'border: 1px solid var(--border)',
        'border-radius: 8px',
        'box-shadow: 0 4px 12px var(--shadow)',
        'text-align: center'
    ].join(';');

    const texto = document.createElement('p');
    texto.textContent = mensagem;
    texto.style.color = 'var(--text-main)';

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn-primary';
    botao.textContent = 'Ok';
    botao.style.width = '100px';
    botao.addEventListener('click', function() {
        if (destinoUrl) {
            window.location.href = destinoUrl;
            return;
        }

        overlay.remove();
    });

    cartao.append(texto, botao);
    overlay.appendChild(cartao);
    document.body.appendChild(overlay);
}

document.addEventListener('DOMContentLoaded', async () => {
    const { data: sessaoData, error: sessaoError } = await supabase.auth.getSession();

    if (sessaoError || !sessaoData.session) {
        window.location.href = 'login.html';
        return;
    }

    usuarioLogado = sessaoData.session.user;

    const viewMenu = document.getElementById('view-menu');
    const viewNome = document.getElementById('view-nome');
    const viewSenha = document.getElementById('view-senha');
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

    function mostrarView(view) {
        viewMenu.style.display = 'none';
        viewNome.style.display = 'none';
        viewSenha.style.display = 'none';
        view.style.display = 'block';
    }

    document.getElementById('btn-editar-nome').addEventListener('click', function() {
        mostrarView(viewNome);
    });

    document.getElementById('btn-editar-senha').addEventListener('click', function() {
        mostrarView(viewSenha);
    });

    document.getElementById('btn-voltar-inicio').addEventListener('click', function() {
        window.location.href = 'inicio.html';
    });

    document.getElementById('btn-voltar-nome').addEventListener('click', function() {
        mostrarView(viewMenu);
    });

    document.getElementById('btn-voltar-senha').addEventListener('click', function() {
        mostrarView(viewMenu);
    });

    const campoNovaSenha = document.getElementById('nova-senha');
    const regraTamanho = document.getElementById('regra-tamanho');
    const regraMaiuscula = document.getElementById('regra-maiuscula');
    const regraNumero = document.getElementById('regra-numero');

    campoNovaSenha.addEventListener('input', function() {
        const valor = this.value;
        const atendeTamanho = valor.length >= 6;
        const atendeMaiuscula = /[A-Z]/.test(valor);
        const atendeNumero = /[0-9]/.test(valor);
        const corAtiva = 'green';
        const corInativa = 'var(--text-muted)';

        regraTamanho.style.color = atendeTamanho ? corAtiva : corInativa;
        regraMaiuscula.style.color = atendeMaiuscula ? corAtiva : corInativa;
        regraNumero.style.color = atendeNumero ? corAtiva : corInativa;
    });

    document.getElementById('btn-logout').addEventListener('click', async function() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Erro ao sair da conta:', error);
            mostrarModal('Não foi possível sair da conta.');
            return;
        }

        window.location.href = 'login.html';
    });

    document.getElementById('form-nome').addEventListener('submit', async function(event) {
        event.preventDefault();

        const novoNome = document.getElementById('novo-nome').value.trim();

        if (novoNome === '') {
            mostrarModal('Informe um nome de usuário válido.');
            return;
        }

        const { error } = await supabase
            .from('usuarios')
            .update({ nome_usuario: novoNome })
            .eq('id', usuarioLogado.id);

        if (error) {
            console.error('Erro ao atualizar nome:', error);
            mostrarModal('Não foi possível atualizar o nome.');
            return;
        }

        mostrarModal('Nome atualizado com sucesso!', 'inicio.html');
    });

    document.getElementById('form-senha').addEventListener('submit', async function(event) {
        event.preventDefault();

        const senhaAtual = document.getElementById('senha-atual').value;
        const novaSenha = document.getElementById('nova-senha').value;

        if (novaSenha.trim() === '') {
            mostrarModal('Informe uma nova senha válida.');
            return;
        }

        const atendeRequisitos = novaSenha.length >= 6
            && /[A-Z]/.test(novaSenha)
            && /[0-9]/.test(novaSenha);

        if (!atendeRequisitos) {
            mostrarModal('A nova senha não atende a todos os requisitos de segurança.');
            return;
        }

        const { error: validacaoError } = await supabase.auth.signInWithPassword({
            email: usuarioLogado.email,
            password: senhaAtual
        });

        if (validacaoError) {
            mostrarModal('A senha atual está incorreta');
            return;
        }

        const { error: atualizacaoError } = await supabase.auth.updateUser({
            password: novaSenha
        });

        if (atualizacaoError) {
            console.error('Erro ao atualizar senha:', atualizacaoError);
            mostrarModal('Atenção: ' + atualizacaoError.message);
            return;
        }

        mostrarModal('Senha alterada com sucesso! Faça login novamente.', 'login.html');
    });
});
