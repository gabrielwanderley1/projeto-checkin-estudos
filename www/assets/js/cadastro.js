// Importamos a conexão que acabamos de criar no arquivo supabase.js
import { supabase } from './supabase.js';

// Pegamos o formulário pelo ID dele
const formCadastro = document.getElementById('register-form');

// Escutamos o evento de "submit". Adicionamos 'async' pois consultaremos a nuvem
formCadastro.addEventListener('submit', async function(event) {
    // Impede que a página recarregue sozinha
    event.preventDefault();

    // 1. Pegar os valores que o usuário digitou
    // ATENÇÃO: O Supabase exige um formato de E-MAIL válido para criar a conta.
    const emailDigitado = document.getElementById('new-username').value;
    const senhaDigitada = document.getElementById('new-password').value;

    // Feedback visual: desabilitar o botão e mostrar que está carregando
    const btnSubmit = formCadastro.querySelector('button[type="submit"]');
    const textoOriginalBotao = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Carregando...';

    try {
        // 2. Chamar a API de Autenticação do Supabase
        const { data, error } = await supabase.auth.signUp({
            email: emailDigitado,
            password: senhaDigitada,
        });

        // Se o Supabase barrar (senha curta, e-mail já em uso, formato inválido)
        if (error) {
            alert('Erro ao criar conta: ' + error.message);
            return; // Interrompe a execução aqui
        }

        // 3. Se a conta foi criada com sucesso, vinculamos ela à nossa tabela 'usuarios'
        if (data.user) {
            // Como ainda não temos um campo "Nome", pegamos a primeira parte do e-mail
            const nomePadrao = emailDigitado.split('@')[0];

            // Inserimos a linha na tabela passando a ID gerada pelo Auth
            const { error: dbError } = await supabase
                .from('usuarios')
                .insert([
                    { 
                        id: data.user.id, 
                        nome_usuario: nomePadrao 
                    }
                ]);

            if (dbError) {
                alert('Conta criada, mas ocorreu um erro ao salvar o perfil: ' + dbError.message);
                return;
            }

            // 4. Se tudo deu certo no Auth e no Banco de Dados, exibe o pop-up
            mostrarPopup();
        }
    } catch (err) {
        console.error('Erro inesperado:', err);
        alert('Ocorreu um erro inesperado de conexão.');
    } finally {
        // Restaura o botão ao estado normal
        btnSubmit.disabled = false;
        btnSubmit.textContent = textoOriginalBotao;
    }
});

function mostrarPopup() {
    // Criamos uma <div> nova através do JavaScript
    const popup = document.createElement('div');
    
    // Injetamos um HTML simples dentro dela. 
    popup.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 999;">
            <div style="background: var(--bg-card, white); padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                <h3 style="margin-bottom: 20px; color: var(--text-color, #3e2723);">Conta criada com sucesso!</h3>
                <p style="margin-bottom: 20px; color: var(--text-muted, #666); font-size: 14px;">Faça login com seu e-mail para começar.</p>
                <button class="btn-primary" style="width: 100px;" onclick="window.location.href='login.html'">Ok</button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);
}