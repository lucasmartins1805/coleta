const URL_API = "https://script.google.com/macros/s/AKfycbzr3-LyqL1nzwI3f3zOUKhyNwwrcsDS0crMgbH8ZjwjTCkclYnzsnl84StpHtwuXtR-hg/exec";

// Função para criar o HTML do card (para não repetir código)
function criarCardHTML(item) {
    // Limpeza de horário que já fizemos antes
    let horaLimpa = item.horario;
    if (typeof horaLimpa === 'string' && horaLimpa.includes('T')) {
        horaLimpa = horaLimpa.split('T')[1].substring(0, 5);
    }

    return `
        <div class="card-coleta" id="card-${item.nome.replace(/\s+/g, '')}">
            <div class="info">
                <strong>${item.nome.toUpperCase()}</strong>
                <span>🚚 ${item.tipo} | 🕒 ${horaLimpa}</span>
            </div>
            <button class="btn-liberar" onclick="liberarColeta('${item.nome}')">Liberar</button>
        </div>`;
}

async function adicionarColeta() {
    const nomeInput = document.getElementById('nome');
    const tipoInput = document.getElementById('tipo');
    const lista = document.getElementById('listaColetas');

    if (!nomeInput.value) return alert("Preencha o nome!");

    const novoItem = {
        nome: nomeInput.value,
        tipo: tipoInput.value,
        horario: "'" + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    // 1. Inserir visualmente NA HORA no topo da lista
    lista.insertAdjacentHTML('afterbegin', criarCardHTML(novoItem));

    // 2. Enviar para o Google em segundo plano
    await fetch(URL_API, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(novoItem)
    });

    nomeInput.value = "";
    // Não precisamos limpar a tela toda, o item já está lá!
}

async function liberarColeta(nome) {
    if (confirm(`Liberar cliente ${nome}?`)) {
        // 1. Remover visualmente IMEDIATAMENTE
        const idCard = `card-${nome.replace(/\s+/g, '')}`;
        const elemento = document.getElementById(idCard);
        if (elemento) {
            elemento.style.opacity = "0.3"; // Efeito visual de saindo
            setTimeout(() => elemento.remove(), 500);
        }

        // 2. Avisar o Google para deletar
        await fetch(URL_API, { 
            method: 'POST', 
            mode: 'no-cors',
            body: JSON.stringify({ "action": "delete", "nome": nome }) 
        });
    }
}

async function buscarColetas() {
    const lista = document.getElementById('listaColetas');
    // Só mostramos "Carregando" na primeira vez que abre a página
    if (lista.innerHTML === "") lista.innerHTML = "<p>Buscando dados...</p>";

    try {
        const response = await fetch(URL_API);
        const dados = await response.json();
        
        // Em vez de limpar tudo, vamos reconstruir de forma suave
        let novoConteudo = "";
        dados.forEach(item => {
            novoConteudo += criarCardHTML(item);
        });
        lista.innerHTML = novoConteudo;
    } catch (e) {
        console.error(e);
    }
}

// Inicia a lista
buscarColetas();