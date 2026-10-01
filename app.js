// ============================================================
// 🌙 TEMA CLARO / ESCURO
// ============================================================
(function initTema() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') document.body.classList.add('dark-mode');
})();

document.addEventListener('DOMContentLoaded', () => {
    const btnTema = document.getElementById('theme-toggle');
    if (!btnTema) return;
    btnTema.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('tema', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
});

// ============================================================
// ⚠️ Credenciais do Supabase
// ============================================================
const supabaseUrl = 'https://ypyhbuoglipxsyazsxoj.supabase.co';
const supabaseKey = 'sb_publishable_ufcIVBj-f_fHQqnecaxEfw_50Cslvyx';

// ============================================================
// CONFIGURAÇÃO DO COREN
// ============================================================
const EMAIL_DOMINIO = '@coren-pe.gov.br';
const ordemCargos = ["Estagiário", "Terceirizado", "Comissionado", "Conselheiro", "Funcionário"];

// ============================================================
// ESTADO GLOBAL
// ============================================================
let candidatosData = [];
let eleitorAtual = { nome: '', email: '' };
let etapaAtual = 0;
let carregando = true;

// Uma única escolha por categoria
const escolhas = {
    estagiario: null,
    terceirizado: null,
    comissionado: null,
    conselheiro: null,
    funcionario: null
};

// ============================================================
// ÍCONES DO MODAL
// ============================================================
const ICONES_MODAL = {
    aviso: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    confirmacao: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    erro: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
};

// ============================================================
// MODAL CUSTOMIZADO
// ============================================================
const modalEl = document.getElementById('modal-custom');
const modalIconWrapper = document.getElementById('modal-icon-wrapper');
const modalIcon = document.getElementById('modal-icon');
const modalTitulo = document.getElementById('modal-titulo');
const modalMensagem = document.getElementById('modal-mensagem');
const modalBotoes = document.getElementById('modal-botoes');
let modalResolver = null;

function abrirModal({ tipo = 'aviso', titulo, mensagem, botoes }) {
    return new Promise(resolve => {
        modalResolver = resolve;
        modalIconWrapper.className = 'modal-icon-wrapper tipo-' + tipo;
        modalIcon.innerHTML = ICONES_MODAL[tipo] || ICONES_MODAL.aviso;
        modalTitulo.innerText = titulo;
        modalMensagem.innerHTML = mensagem;

        modalBotoes.innerHTML = '';
        botoes.forEach(btn => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn-' + (btn.estilo || 'primary');
            b.innerHTML = btn.texto;
            b.addEventListener('click', () => fecharModal(btn.valor));
            modalBotoes.appendChild(b);
        });

        modalEl.style.display = 'flex';

        const escHandler = (e) => {
            if (e.key === 'Escape') { fecharModal(null); document.removeEventListener('keydown', escHandler); }
        };
        document.addEventListener('keydown', escHandler);
    });
}

function fecharModal(valor) {
    modalEl.style.display = 'none';
    if (modalResolver) { modalResolver(valor); modalResolver = null; }
}

function modalAviso(titulo, mensagem) {
    return abrirModal({
        tipo: 'aviso', titulo, mensagem,
        botoes: [{ texto: 'Entendi', valor: true, estilo: 'primary' }]
    });
}

function modalConfirmacao(titulo, mensagem, textoSim = 'Sim, trocar', textoNao = 'Não, manter') {
    return abrirModal({
        tipo: 'confirmacao', titulo, mensagem,
        botoes: [
            { texto: textoNao, valor: false, estilo: 'cancelar' },
            { texto: textoSim, valor: true, estilo: 'primary' }
        ]
    });
}

// ============================================================
// BUSCA CANDIDATOS DO SUPABASE
// ============================================================
async function carregarCandidatos() {
    const url = `${supabaseUrl}/rest/v1/candidatos?select=*&ativo=eq.true&order=serie.asc,nome.asc`;
    const resposta = await fetch(url, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    if (!resposta.ok) throw new Error("Falha ao buscar candidatos");
    return await resposta.json();
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
async function inicializar() {
    const btnLogin = document.getElementById('btn-login');
    const htmlOriginal = btnLogin.innerHTML;
    btnLogin.innerHTML = "Carregando candidatos...";
    btnLogin.disabled = true;

    try {
        candidatosData = await carregarCandidatos();
        if (!candidatosData.length) throw new Error("Nenhum candidato cadastrado");
        renderizarCandidatos();
        carregando = false;
        btnLogin.innerHTML = htmlOriginal;
        btnLogin.disabled = false;
    } catch (erro) {
        console.error('Erro ao carregar candidatos:', erro);
        await modalAviso('Erro ao carregar', 'Não foi possível carregar os candidatos.<br>Verifique a conexão e recarregue a página.');
        btnLogin.innerHTML = "Erro ao carregar";
    }
}

function getFotoCandidato(nomeCand) {
    const cand = candidatosData.find(c => c.nome === nomeCand);
    return cand ? cand.foto : 'https://via.placeholder.com/90';
}

function chaveCategoria(cargo) {
    return cargo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
}

// ============================================================
// LOGIN (com validação @coren-pe.gov.br)
// ============================================================
document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (carregando) {
        await modalAviso('Aguarde', 'Os candidatos ainda estão sendo carregados.');
        return;
    }

    const nomeDigitado = document.getElementById('nome-login').value.trim();
    const emailDigitado = document.getElementById('email-login').value.trim().toLowerCase();

    // 🔒 Validação específica do COREN
    if (!emailDigitado.endsWith(EMAIL_DOMINIO)) {
        await modalAviso(
            'E-mail inválido',
            `Por favor, utilize o seu e-mail institucional (<strong>${EMAIL_DOMINIO}</strong>).`
        );
        return;
    }

    const btnLogin = document.getElementById('btn-login');
    const htmlOriginal = btnLogin.innerHTML;
    btnLogin.innerHTML = "Verificando...";
    btnLogin.disabled = true;

    try {
        const url = `${supabaseUrl}/rest/v1/votos?email=eq.${encodeURIComponent(emailDigitado)}&select=*`;
        const resposta = await fetch(url, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const dados = await resposta.json();

        if (dados && dados.length > 0) {
            mostrarEcraRecibo(dados[0]);
        } else {
            eleitorAtual.nome = nomeDigitado;
            eleitorAtual.email = emailDigitado;
            document.querySelectorAll('.nome-exibicao').forEach(el => el.innerText = nomeDigitado);
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('votacao-section').style.display = 'block';
        }
    } catch (erro) {
        await modalAviso('Erro de conexão', 'Não foi possível conectar ao servidor.<br>Tente novamente em instantes.');
    } finally {
        btnLogin.innerHTML = htmlOriginal;
        btnLogin.disabled = false;
    }
});

// ============================================================
// RENDERIZAR CANDIDATOS
// ============================================================
function renderizarCandidatos() {
    const container = document.getElementById('secoes-votacao');
    const agrupado = candidatosData.reduce((acc, candidato) => {
        if (!acc[candidato.cargo]) acc[candidato.cargo] = {};
        if (!acc[candidato.cargo][candidato.serie]) acc[candidato.cargo][candidato.serie] = [];
        acc[candidato.cargo][candidato.serie].push(candidato);
        return acc;
    }, {});

    let html = '';
    ordemCargos.forEach((cargo, index) => {
        const key = chaveCategoria(cargo);
        html += `<div class="etapa-votacao" id="etapa-${index}" style="display: ${index === 0 ? 'block' : 'none'};">`;
        html += `
            <div class="cargo-header">
                <h2>${cargo} Destaque</h2>
                <p>Escolha <strong>apenas 1 candidato</strong>. Clique no card para selecionar; clique novamente para desmarcar.</p>
            </div>
            <div class="instrucao-escolha" data-cat="${key}">
                <span>Escolhido:</span>
                <span class="contador" id="contador-${key}">— nenhum —</span>
            </div>
        `;
        if (agrupado[cargo]) {
            for (const serie in agrupado[cargo]) {
                html += `<h3>${serie}</h3><div class="grid-candidatos">`;
                agrupado[cargo][serie].forEach(cand => {
                    html += `
                        <div class="candidato-item" data-nome="${cand.nome}" data-cat="${key}">
                            <div class="badge-pos"></div>
                            <div class="card-candidato">
                                <img src="${cand.foto}" alt="${cand.nome}" loading="lazy">
                                <p>${cand.nome}</p>
                            </div>
                        </div>
                    `;
                });
                html += `</div>`;
            }
        }
        html += `</div>`;
    });
    container.innerHTML = html;

    document.querySelectorAll('.candidato-item').forEach(item => {
        item.addEventListener('click', () => toggleCandidato(item.dataset.cat, item.dataset.nome));
    });

    atualizarInterfaceNavegacao();
}

// ============================================================
// 🎯 TOGGLE DE CANDIDATO (seleção única por categoria)
// - Se não escolheu nada → seleciona
// - Se clicou no mesmo → desmarca
// - Se já tinha outro → pergunta se quer trocar
// ============================================================
async function toggleCandidato(catKey, nomeCand) {
    const atual = escolhas[catKey];

    // 1) Clicou no mesmo que já estava selecionado → desmarcar
    if (atual === nomeCand) {
        escolhas[catKey] = null;
        atualizarBadges();
        atualizarContador();
        return;
    }

    // 2) Já tinha outro escolhido → pergunta se quer trocar
    if (atual && atual !== nomeCand) {
        const confirmou = await modalConfirmacao(
            'Trocar de candidato?',
            `Você já escolheu <strong>${atual}</strong> nesta categoria.<br><br>Deseja trocar por <strong>${nomeCand}</strong>?`,
            'Sim, trocar',
            'Não, manter'
        );
        if (!confirmou) return;
    }

    // 3) Sem escolha anterior, ou troca confirmada → marca o novo
    escolhas[catKey] = nomeCand;
    atualizarBadges();
    atualizarContador();
}

// ============================================================
// ATUALIZA BADGES E ESTADOS VISUAIS
// ============================================================
function atualizarBadges() {
    document.querySelectorAll('.badge-pos').forEach(el => el.innerHTML = '');
    document.querySelectorAll('.card-candidato').forEach(el => el.classList.remove('tem-posicao'));

    ordemCargos.forEach(cargo => {
        const catKey = chaveCategoria(cargo);
        const nome = escolhas[catKey];
        if (!nome) return;

        const item = document.querySelector(`.candidato-item[data-cat="${catKey}"][data-nome="${CSS.escape(nome)}"]`);
        if (!item) return;

        const card = item.querySelector('.card-candidato');
        const badgeContainer = item.querySelector('.badge-pos');
        card.classList.add('tem-posicao');

        const badge = document.createElement('span');
        badge.className = 'badge-item selecionado';
        badge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="20 6 9 17 4 12"/></svg>';
        badgeContainer.appendChild(badge);
    });
}

// ============================================================
// ATUALIZA CONTADOR DE CADA CATEGORIA
// ============================================================
function atualizarContador() {
    ordemCargos.forEach(cargo => {
        const catKey = chaveCategoria(cargo);
        const nome = escolhas[catKey];
        const contador = document.getElementById(`contador-${catKey}`);
        const aviso = document.querySelector(`.instrucao-escolha[data-cat="${catKey}"]`);

        if (contador) {
            contador.innerText = nome ? nome : '— nenhum —';
        }
        if (aviso) {
            aviso.classList.toggle('completo', !!nome);
        }
    });
}

// ============================================================
// NAVEGAÇÃO
// ============================================================
function atualizarInterfaceNavegacao() {
    const progresso = ((etapaAtual + 1) / ordemCargos.length) * 100;
    document.getElementById('progresso-barra').style.width = `${progresso}%`;
    document.getElementById('progresso-texto').innerText = `Passo ${etapaAtual + 1} de ${ordemCargos.length}: ${ordemCargos[etapaAtual]}`;

    document.getElementById('btn-anterior').style.display = etapaAtual === 0 ? 'none' : 'flex';

    if (etapaAtual === ordemCargos.length - 1) {
        document.getElementById('btn-proximo').style.display = 'none';
        document.getElementById('btn-revisar').style.display = 'flex';
    } else {
        document.getElementById('btn-proximo').style.display = 'flex';
        document.getElementById('btn-revisar').style.display = 'none';
    }
}

document.getElementById('btn-proximo').addEventListener('click', async () => {
    const cargoAtual = ordemCargos[etapaAtual];
    const catKey = chaveCategoria(cargoAtual);

    if (!escolhas[catKey]) {
        await modalAviso(
            'Escolha um candidato',
            `Você precisa escolher <strong>1 candidato</strong> na categoria <strong>${cargoAtual}</strong> antes de avançar.`
        );
        return;
    }

    document.getElementById(`etapa-${etapaAtual}`).style.display = 'none';
    etapaAtual++;
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'block';
    atualizarInterfaceNavegacao();
    window.scrollTo(0, 0);
});

document.getElementById('btn-anterior').addEventListener('click', () => {
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'none';
    etapaAtual--;
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'block';
    atualizarInterfaceNavegacao();
    window.scrollTo(0, 0);
});

document.getElementById('btn-revisar').addEventListener('click', async () => {
    const cargoAtual = ordemCargos[etapaAtual];
    const catKey = chaveCategoria(cargoAtual);

    if (!escolhas[catKey]) {
        await modalAviso(
            'Escolha um candidato',
            `Antes de revisar, escolha <strong>1 candidato</strong> na categoria <strong>${cargoAtual}</strong>.`
        );
        return;
    }

    preencherListaResumo();
    document.getElementById('votacao-section').style.display = 'none';
    document.getElementById('resumo-section').style.display = 'block';
    window.scrollTo(0, 0);
});

document.getElementById('btn-voltar-edicao').addEventListener('click', () => {
    document.getElementById('resumo-section').style.display = 'none';
    document.getElementById('votacao-section').style.display = 'block';
});

// ============================================================
// ENVIO FINAL
// ============================================================
document.getElementById('btn-confirmar-final').addEventListener('click', async function() {
    const votosParaEnvio = {
        nome_completo: eleitorAtual.nome,
        email: eleitorAtual.email,
        estagiario: escolhas.estagiario,
        terceirizado: escolhas.terceirizado,
        comissionado: escolhas.comissionado,
        conselheiro: escolhas.conselheiro,
        funcionario: escolhas.funcionario
    };

    const htmlOriginal = this.innerHTML;
    this.innerHTML = "Enviando...";
    this.disabled = true;
    document.getElementById('btn-voltar-edicao').style.display = 'none';

    try {
        const resposta = await fetch(`${supabaseUrl}/rest/v1/votos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Prefer': 'return=minimal' },
            body: JSON.stringify(votosParaEnvio)
        });

        if (resposta.ok) {
            this.style.display = 'none';
            document.getElementById('header-resumo').innerHTML = `<h2>Comprovante de Votação</h2><p>Votos enviados por <strong>${eleitorAtual.email}</strong>.</p>`;
            document.getElementById('mensagem-sucesso').style.display = 'block';
        } else {
            await modalAviso('Voto já registado', 'Este e-mail já consta na base de dados.<br>Você não pode votar novamente.');
            this.innerHTML = htmlOriginal;
            this.disabled = false;
            document.getElementById('btn-voltar-edicao').style.display = 'flex';
        }
    } catch (erro) {
        await modalAviso('Erro de comunicação', 'Não foi possível enviar os seus votos.<br>Tente novamente em instantes.');
        this.innerHTML = htmlOriginal;
        this.disabled = false;
        document.getElementById('btn-voltar-edicao').style.display = 'flex';
    }
});

// ============================================================
// RESUMO
// ============================================================
function preencherListaResumo(votosDB) {
    const lista = document.getElementById('lista-resumo');
    lista.innerHTML = '';
    const dados = votosDB || null;

    ordemCargos.forEach(cargo => {
        const key = chaveCategoria(cargo);
        const nomeVotado = dados ? dados[key] : escolhas[key];
        const foto = getFotoCandidato(nomeVotado);

        lista.innerHTML += `
            <div class="resumo-card">
                <span class="cargo-label">${cargo}</span>
                <img src="${foto}" alt="${nomeVotado || 'Não escolhido'}">
                <span class="nome-label">${nomeVotado || '—'}</span>
            </div>
        `;
    });
}

// ============================================================
// RECIBO PARA QUEM JÁ VOTOU
// ============================================================
function mostrarEcraRecibo(dadosDB) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('resumo-section').style.display = 'block';

    document.getElementById('header-resumo').innerHTML = `
        <h2 style="color: #1a7f37;">Voto Já Registrado!</h2>
        <p>Identificamos que <strong>${dadosDB.nome_completo}</strong> (${dadosDB.email}) já participou da votação. Abaixo estão as suas escolhas:</p>
    `;

    document.getElementById('botoes-resumo').style.display = 'none';
    document.getElementById('mensagem-sucesso').style.display = 'none';

    preencherListaResumo(dadosDB);
}

// ============================================================
// 🚀 Start
// ============================================================
inicializar();