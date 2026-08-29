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
            alert('Login realizado com sucesso!');
            
            window.location.href = '../../Streak%20de%20Estudo/pages/principal.html';
            
        } else {
            alert('Usuário ou senha incorretos. Tente novamente.');
        }
    } else {
        alert('Nenhuma conta encontrada. Por favor, clique em "Criar uma nova conta".');
    }
});