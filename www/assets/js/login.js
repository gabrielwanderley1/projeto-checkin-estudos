// Importamos a conexão com o banco de dados
import { supabase } from './supabase.js';

// Pegamos o formulário pelo ID dele
const formLogin = document.getElementById('login-form');

// Escutamos o evento de "submit" com função assíncrona
formLogin.addEventListener('submit', async function(event) {
    // Impede o recarregamento automático da página
    event.preventDefault();

    // 1. Pegar os valores digitados
    // ATENÇÃO: Lembre-se que agora o login é feito via e-mail
    const emailDigitado = document.getElementById('username').value;
    const senhaDigitada = document.getElementById('password').value;

    // Feedback visual (desabilita o botão para evitar duplos cliques)
    const btnSubmit = formLogin.querySelector('button[type="submit"]');
    const textoOriginalBotao = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Entrando...';

    try {
        // 2. Chamar a API de Autenticação do Supabase para validar o login
        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailDigitado,
            password: senhaDigitada,
        });

        // 3. Se houver erro (senha errada, e-mail não cadastrado)
        if (error) {
            alert('Erro ao fazer login: E-mail ou senha incorretos.');
            return;
        }

        // 4. Se o login for bem-sucedido, o Supabase já salva um "Token de Sessão" seguro no navegador
        if (data.session) {
            // Redireciona o usuário para a tela inicial do aplicativo
            window.location.href = 'inicio.html';
        }
        
    } catch (err) {
        console.error('Erro inesperado:', err);
        alert('Ocorreu um erro de conexão com o servidor.');
    } finally {
        // Restaura o botão ao estado normal caso dê erro
        btnSubmit.disabled = false;
        btnSubmit.textContent = textoOriginalBotao;
    }
});