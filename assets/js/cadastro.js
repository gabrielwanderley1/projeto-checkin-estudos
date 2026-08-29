// Pegamos o formulário pelo ID dele
const formCadastro = document.getElementById('register-form');

// Escutamos o evento de "submit" (quando o botão Cadastrar é clicado)
formCadastro.addEventListener('submit', function(event) {
    // Essa linha é essencial: ela impede que a página recarregue sozinha
    event.preventDefault();

    // 1. Pegar os valores que o usuário digitou
    const usuarioDigitado = document.getElementById('new-username').value;
    const senhaDigitada = document.getElementById('new-password').value;

    // 2. Criar um "objeto" com os dados do novo usuário
    const novoUsuario = {
        usuario: usuarioDigitado,
        senha: senhaDigitada
    };

    // 3. Salvar no localStorage. Usamos JSON.stringify para converter o objeto em texto
    localStorage.setItem('minhaConta', JSON.stringify(novoUsuario));

    // 4. Chamar a função que mostra o pop-up na tela
    mostrarPopup();
});

function mostrarPopup() {
    // Criamos uma <div> nova através do JavaScript
    const popup = document.createElement('div');
    
    // Injetamos um HTML simples dentro dela. 
    // Repare no botão com o onclick direcionando para o login.html!
    popup.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;">
            <div style="background: white; padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                <h3 style="margin-bottom: 20px; color: #3e2723;">Conta criada com sucesso!</h3>
                <button class="btn-primary" style="width: 100px;" onclick="window.location.href='login.html'">Ok</button>
            </div>
        </div>
    `;

    // Adicionamos esse pop-up no corpo (body) da nossa página
    document.body.appendChild(popup);
}