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

function obterConta() {
    const dadosSalvos = localStorage.getItem('minhaConta');

    if (dadosSalvos === null) {
        mostrarModal('Nenhuma conta encontrada. Faça o cadastro antes de continuar.', true);
        return null;
    }

    try {
        return JSON.parse(dadosSalvos);
    } catch (erro) {
        mostrarModal('Não foi possível carregar os dados da conta.', true);
        return null;
    }
}

function mostrarModal(mensagem, redirecionarParaLogin) {
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
        if (redirecionarParaLogin) {
            window.location.href = 'login.html';
            return;
        }

        overlay.remove();
    });

    cartao.append(texto, botao);
    overlay.appendChild(cartao);
    document.body.appendChild(overlay);
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

document.getElementById('btn-logout').addEventListener('click', function() {
    mostrarModal('Você saiu da sua conta.', true);
});

document.getElementById('form-nome').addEventListener('submit', function(event) {
    event.preventDefault();

    const novoNome = document.getElementById('novo-nome').value.trim();
    const conta = obterConta();

    if (conta === null) {
        return;
    }

    if (novoNome === '') {
        mostrarModal('Informe um nome de usuário válido.', false);
        return;
    }

    if (novoNome === conta.usuario) {
        mostrarModal('O novo nome deve ser diferente do nome atual.', false);
        return;
    }

    conta.usuario = novoNome;
    localStorage.setItem('minhaConta', JSON.stringify(conta));
    mostrarModal('Nome de usuário alterado com sucesso. Faça login novamente.', true);
});

document.getElementById('form-senha').addEventListener('submit', function(event) {
    event.preventDefault();

    const senhaAtual = document.getElementById('senha-atual').value;
    const novaSenha = document.getElementById('nova-senha').value;
    const conta = obterConta();

    if (conta === null) {
        return;
    }

    if (senhaAtual !== conta.senha) {
        mostrarModal('A senha atual está incorreta.', false);
        return;
    }

    if (novaSenha.trim() === '') {
        mostrarModal('Informe uma nova senha válida.', false);
        return;
    }

    if (novaSenha === conta.senha) {
        mostrarModal('A nova senha deve ser diferente da senha atual.', false);
        return;
    }

    conta.senha = novaSenha;
    localStorage.setItem('minhaConta', JSON.stringify(conta));
    mostrarModal('Senha alterada com sucesso. Faça login novamente.', true);
});
