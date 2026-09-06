import { supabase } from './supabase.js';

const formCadastro = document.getElementById('register-form');
const campoSenha = document.getElementById('new-password');
const regraTamanho = document.getElementById('regra-tamanho');
const regraMaiuscula = document.getElementById('regra-maiuscula');
const regraNumero = document.getElementById('regra-numero');

campoSenha.addEventListener('input', function() {
    const valor = this.value;
    const atendeTamanho = valor.length >= 6;
    const atendeMaiuscula = /[A-Z]/.test(valor);
    const atendeNumero = /[0-9]/.test(valor);

    regraTamanho.style.color = atendeTamanho ? 'green' : '#666';
    regraMaiuscula.style.color = atendeMaiuscula ? 'green' : '#666';
    regraNumero.style.color = atendeNumero ? 'green' : '#666';
});

formCadastro.addEventListener('submit', async function(event) {
    event.preventDefault();

    const emailDigitado = document.getElementById('new-username').value;
    const senhaDigitada = campoSenha.value;
    const atendeTamanho = senhaDigitada.length >= 6;
    const atendeMaiuscula = /[A-Z]/.test(senhaDigitada);
    const atendeNumero = /[0-9]/.test(senhaDigitada);

    if (!atendeTamanho || !atendeMaiuscula || !atendeNumero) {
        alert('A senha não atende a todos os requisitos de segurança.');
        return;
    }

    const btnSubmit = formCadastro.querySelector('button[type="submit"]');
    const textoOriginalBotao = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Carregando...';

    try {
        const { data, error } = await supabase.auth.signUp({
            email: emailDigitado,
            password: senhaDigitada,
        });

        if (error) {
            alert('Erro ao criar conta: ' + error.message);
            return;
        }

        if (data.user) {
            const nomePadrao = emailDigitado.split('@')[0];
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

            mostrarPopup();
        }
    } catch (err) {
        console.error('Erro inesperado:', err);
        alert('Ocorreu um erro inesperado de conexão.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = textoOriginalBotao;
    }
});

function mostrarPopup() {
    const popup = document.createElement('div');

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
