import { supabase } from './supabase.js';
import { mostrarModal } from './ui.js';

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

function tratarErroSupabase(erroMensagem, origem = 'auth') {
    
    const mensagem = erroMensagem.toLowerCase();

    if (mensagem.includes('rate limit')) {
        return 'Muitas tentativas, aguarde 1 minuto.';
    }

    if (mensagem.includes('invalid login')) {
        return 'E-mail ou senha inválidos.';
    }

    if (mensagem.includes('expired')) {
        return 'O código expirou. Solicite um novo código.';
    }

    if (mensagem.includes('invalid otp')) {
        return 'Código inválido. Verifique o código informado.';
    }

    return 'Não foi possível concluir a operação. Tente novamente.';
}

btnEsqueciSenha.addEventListener('click', async function() {
    const email = campoEmail.value.trim();

    if (!email) {
        mostrarModal('Preencha o e-mail para recuperar sua senha.');
        return;
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            mostrarModal(tratarErroSupabase(error.message));
            return;
        }

        mostrarModal('Se o e-mail estiver cadastrado, enviaremos as instruções contendo o código.');
        modalRecuperacao.style.display = 'flex';
        btnEsqueciSenha.disabled = true;

        let segundosRestantes = 60;
        btnEsqueciSenha.textContent = `Aguarde ${segundosRestantes}s`;

        const intervaloCooldown = setInterval(() => {
            segundosRestantes -= 1;

            if (segundosRestantes === 0) {
                clearInterval(intervaloCooldown);
                btnEsqueciSenha.disabled = false;
                btnEsqueciSenha.textContent = 'Esqueci minha senha';
                return;
            }

            btnEsqueciSenha.textContent = `Aguarde ${segundosRestantes}s`;
        }, 1000);
    } catch (err) {
        console.error('Erro ao solicitar recuperação de senha:', err);
        mostrarModal(tratarErroSupabase('connection error', 'reset'));
    }
});

btnFecharRecuperacao.addEventListener('click', async function() {
    modalRecuperacao.style.display = 'none';
    await supabase.auth.signOut();
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

    if (!/^\d{8}$/.test(codigoDigitado)) {
        mostrarModal('Digite um código válido com exatamente 8 dígitos numéricos.');
        return;
    }

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
            mostrarModal(tratarErroSupabase(otpError.message));
            return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: novaSenha
        });

        if (updateError) {
            mostrarModal('A validação foi feita, mas não foi possível atualizar sua senha. Por favor, solicite um novo código.');
            await supabase.auth.signOut();
            modalRecuperacao.style.display = 'none';
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
            mostrarModal(tratarErroSupabase(error.message));
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
