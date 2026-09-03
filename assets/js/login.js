const formLogin = document.getElementById('login-form');

formLogin.addEventListener('submit', function(event) {
    event.preventDefault(); 

    // 1. Pegar o que foi digitado na tela de login
    const usuarioDigitado = document.getElementById('username').value;
    const senhaDigitada = document.getElementById('password').value;

    // 2. Buscar a conta salva no localStorage
    const dadosSalvos = localStorage.getItem('minhaConta');

    // Verifica se existe alguma conta salva
    if (dadosSalvos !== null) {
        // Se existe, transformamos o texto salvo de volta em um objeto (JSON.parse)
        const conta = JSON.parse(dadosSalvos);

        // 3. Validar se bate com o que está salvo
        if (usuarioDigitado === conta.usuario && senhaDigitada === conta.senha) {
            mostrarModal('Login realizado com sucesso!', true);
            
        } else {
            mostrarModal('Usuário ou senha incorretos. Tente novamente.', false);
        }
    } else {
        mostrarModal('Nenhuma conta encontrada. Por favor, clique em "Criar uma nova conta".', false);
    }
});

function mostrarModal(mensagem, redirecionarParaInicio) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; inset: 0; z-index: 1000; display: flex; justify-content: center; align-items: center; padding: 20px; background: rgba(0, 0, 0, 0.55);';

    const cartao = document.createElement('div');
    cartao.style.cssText = 'width: min(100%, 380px); padding: 30px; background: var(--bg-panel); color: var(--text-main); border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 4px 12px var(--shadow); text-align: center;';

    const texto = document.createElement('p');
    texto.textContent = mensagem;
    texto.style.color = 'var(--text-main)';
    texto.style.marginBottom = '20px';

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn-primary';
    botao.textContent = 'Ok';
    botao.style.width = '100px';
    
    botao.addEventListener('click', function() {
        if (redirecionarParaInicio) {
            window.location.href = 'inicio.html';
        } else {
            overlay.remove();
        }
    });

    cartao.append(texto, botao);
    overlay.appendChild(cartao);
    document.body.appendChild(overlay);
}