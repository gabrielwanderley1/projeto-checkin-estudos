export function mostrarModal(mensagem) {
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