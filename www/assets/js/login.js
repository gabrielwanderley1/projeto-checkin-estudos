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
        alert('Preencha o e-mail para recuperar sua senha.');
        return;
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            alert(error.message);
            return;
        }

        modalRecuperacao.style.display = 'flex';
    } catch (err) {
        console.error('Erro ao solicitar recuperação de senha:', err);
        alert('Ocorreu um erro de conexão com o servidor.');
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
        alert('A senha não atende a todos os requisitos de segurança.');
        return;
    }

    try {
        const { error: otpError } = await supabase.auth.verifyOtp({
            email,
            token: codigoDigitado,
            type: 'recovery'
        });

        if (otpError) {
            alert(otpError.message);
            return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: novaSenha
        });

        if (updateError) {
            alert(updateError.message);
            return;
        }

        alert('Senha alterada com sucesso!');
        modalRecuperacao.style.display = 'none';
        await supabase.auth.signOut();
    } catch (err) {
        console.error('Erro ao recuperar senha:', err);
        alert('Ocorreu um erro de conexão com o servidor.');
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
            alert('Erro ao fazer login: E-mail ou senha incorretos.');
            return;
        }

        if (data.session) {
            window.location.href = 'inicio.html';
        }
        
    } catch (err) {
        console.error('Erro inesperado:', err);
        alert('Ocorreu um erro de conexão com o servidor.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = textoOriginalBotao;
    }
});