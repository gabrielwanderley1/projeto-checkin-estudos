import { supabase } from './supabase.js';

const formLogin = document.getElementById('login-form');
const campoEmail = document.getElementById('login-username');
const btnEsqueciSenha = document.getElementById('btn-esqueci-senha');
const modalRecuperacao = document.getElementById('modal-recuperacao');
const btnFecharRecuperacao = document.getElementById('btn-fechar-recuperacao');
const formRecuperacao = document.getElementById('form-recuperacao');
const campoOtpNovaSenha = document.getElementById('otp-nova-senha');
const regraOtpTamanho = document.getElementById('otp-regra-tamanho');
const regraOtpMaiuscula = document.getElementById('otp-regra-maiuscula');
const regraOtpNumero = document.getElementById('otp-regra-numero');

btnEsqueciSenha.addEventListener('click', async function() {
    const email = campoEmail.value.trim();

    if (!email) {
        mostrarModal('Preencha o e-mail para recuperar sua senha.');
        return;
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            mostrarModal(error.message);
            return;
        }

        modalRecuperacao.style.display = 'flex';
    } catch (err) {
        console.error('Erro ao solicitar recuperação de senha:', err);
        mostrarModal('Ocorreu um erro de conexão com o servidor.');
    }
});

btnFecharRecuperacao.addEventListener('click', function() {
    modalRecuperacao.style.display = 'none';
});

campoOtpNovaSenha.addEventListener('input', function() {
    const valor = this.value;
    const atendeTamanho = valor.length >= 6;
    const atendeMaiuscula = /[A-Z]/.test(valor);
    const atendeNumero = /[0-9]/.test(valor);

    regraOtpTamanho.style.color = atendeTamanho ? 'green' : '#666';
    regraOtpMaiuscula.style.color = atendeMaiuscula ? 'green' : '#666';
    regraOtpNumero.style.color = atendeNumero ? 'green' : '#666';
});

formRecuperacao.addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = campoEmail.value.trim();
    const codigoDigitado = document.getElementById('otp-codigo').value.trim();
    const novaSenha = campoOtpNovaSenha.value;
    const atendeTamanho = novaSenha.length >= 6;
    const atendeMaiuscula = /[A-Z]/.test(novaSenha);
    const atendeNumero = /[0-9]/.test(novaSenha);

    if (!atendeTamanho || !atendeMaiuscula || !atendeNumero) {
        mostrarModal('A senha não atende a todos os requisitos de segurança.');
        return;
    }

    try {
        const { error: otpError } = await supabase.auth.verifyOtp({
            email,
            token: codigoDigitado,
            type: 'recovery'
        });

        if (otpError) {
            mostrarModal(otpError.message);
            return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: novaSenha
        });

        if (updateError) {
            mostrarModal(updateError.message);
            return;
        }

        mostrarModal('Senha alterada com sucesso!');
        modalRecuperacao.style.display = 'none';
        await supabase.auth.signOut();
    } catch (err) {
        console.error('Erro ao recuperar senha:', err);
        mostrarModal('Ocorreu um erro de conexão com o servidor.');
    }
});

formLogin.addEventListener('submit', async function(event) {
    event.preventDefault();

    const emailDigitado = campoEmail.value;
    const senhaDigitada = document.getElementById('password').value;

    const btnSubmit = formLogin.querySelector('button[type="submit"]');
    const textoOriginalBotao = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Entrando...';

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailDigitado,
            password: senhaDigitada,
        });

        if (error) {
            mostrarModal('Erro ao fazer login: E-mail ou senha incorretos.');
            return;
        }

        if (data.session) {
            window.location.href = 'inicio.html';
        }
        
    } catch (err) {
        console.error('Erro inesperado:', err);
        mostrarModal('Ocorreu um erro de conexão com o servidor.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = textoOriginalBotao;
    }
});

function mostrarModal(mensagem) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; inset: 0; z-index: 2000; display: flex; justify-content: center; align-items: center; padding: 20px; background: rgba(0, 0, 0, 0.55);';

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
    botao.addEventListener('click', () => overlay.remove());

    cartao.append(texto, botao);
    overlay.appendChild(cartao);
    document.body.appendChild(overlay);
}