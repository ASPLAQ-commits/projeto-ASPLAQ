// ==========================================
// 🌓 LOGO MEETING — troca src conforme o tema
// ==========================================
function aplicarLogoTema() {
    const isDark = document.body.classList.contains('dark-mode');
    document.querySelectorAll('.logo-meeting').forEach(img => {
        const novaSrc = isDark ? img.dataset.dark : img.dataset.light;
        if (novaSrc && img.getAttribute('src') !== novaSrc) {
            img.setAttribute('src', novaSrc);
        }
    });
}

// ==========================================
// 🌙 TEMA CLARO / ESCURO
// ==========================================
(function initTema() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') document.body.classList.add('dark-mode');
})();

document.addEventListener('DOMContentLoaded', () => {
    const btnTema = document.getElementById('theme-toggle');

    // 🔑 Aplica a logo correta no carregamento inicial
    aplicarLogoTema();

    if (!btnTema) return;
    btnTema.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('tema', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        // 🔑 Troca a logo imediatamente ao alternar o tema
        aplicarLogoTema();
    });
});

// ==========================================
// 1. CONFIGURAÇÃO DO SUPABASE
// ==========================================
const supabaseUrl = 'https://cnptvjdzqfsqbdkrnbbe.supabase.co';
const supabaseKey = 'sb_publishable_cCqmjnqgdSvOcKA6oyd28Q_4BpE1hQ6';
const clienteSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);

window.emailUsuarioValido = "";
window.nomeUsuarioValido = "";

const ordemCargos = ["Estagiário", "Terceirizado", "Comissionado", "Conselheiro", "Funcionário"];
let candidatos = [];
let etapas = [];
let etapaAtual = 0;

const escolhas = {};

const norm = t => (t || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const chave = cargo => norm(cargo).replace(/\s+/g, "_");
const esc = t => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const conectivos = new Set(['de', 'da', 'do', 'dos', 'das', 'e']);

function formatarNome(nome) {
    return (nome || '').toLowerCase().split(' ').filter(Boolean).map((palavra, i) => {
        if (palavra === 'dr.' || palavra === 'dr') return 'Dr.';
        if (palavra === 'dra.' || palavra === 'dra') return 'Dra.';
        if (i > 0 && conectivos.has(palavra)) return palavra;
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    }).join(' ');
}

// 🆕 Mostra apenas o primeiro + último nome
// "LUIZ GABRIEL SARMENTO PEREIRA" → "Luiz Pereira"
// "DRA. MARIA APARECIDA SILVA"    → "Dra. Maria Silva"
function nomeCurto(nome) {
    const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '';
    if (partes.length === 1) return formatarNome(partes[0]);

    // Detecta Dr. / Dra. como prefixo
    let prefixo = '';
    let nomes = partes;
    const p0 = partes[0].toLowerCase().replace(/\.$/, '');
    if (p0 === 'dr')      { prefixo = 'Dr. ';  nomes = partes.slice(1); }
    else if (p0 === 'dra'){ prefixo = 'Dra. '; nomes = partes.slice(1); }

    if (nomes.length === 0) return prefixo.trim();
    if (nomes.length === 1) return prefixo + formatarNome(nomes[0]);

    const primeiro = formatarNome(nomes[0]);
    const ultimo   = formatarNome(nomes[nomes.length - 1]);
    return prefixo + primeiro + ' ' + ultimo;
}

function categoriaDe(cargo) {
    const c = norm(cargo);
    return ordemCargos.find(cat => c.includes(norm(cat).slice(0, 6)));
}

function avatarIniciais(nome) {
    const iniciais = String(nome).replace(/^Dra?\.\s*/, '').split(' ').filter(Boolean)
        .slice(0, 2).map(p => p[0]).join('').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#F5E8EE"/><text x="50" y="50" dy=".35em" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700" fill="#8B1E5C">${iniciais}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ==========================================
// 2. MODAL CUSTOMIZADO
// ==========================================
const ICONES_MODAL = {
    aviso: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    confirmacao: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    erro: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
};

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
    return abrirModal({ tipo: 'aviso', titulo, mensagem, botoes: [{ texto: 'Entendi', valor: true, estilo: 'primary' }] });
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

// ==========================================
// 3. CARREGAR CANDIDATOS
// ==========================================
async function carregarCandidatos() {
    let { data, error } = await clienteSupabase.from('colaboradores').select('nome, setor, cargo, email, foto');
    if (error) ({ data, error } = await clienteSupabase.from('colaboradores').select('nome, setor, cargo, email'));
    if (error) throw error;

    candidatos = [];
    data.forEach(p => {
        const categoria = categoriaDe(p.cargo);
        if (categoria) {
            candidatos.push({ nome: p.nome, setor: p.setor || 'Sem setor', cargo: p.cargo, email: p.email, foto: p.foto, categoria });
        }
    });
    candidatos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));

    etapas = ordemCargos.filter(cat => candidatos.some(c => c.categoria === cat));
    if (etapas.length === 0) throw new Error("Nenhum candidato encontrado");
}

// ==========================================
// 4. LOGIN
// ==========================================
async function validarAcesso() {
    const emailLimpo = document.getElementById('input-email').value.trim().toLowerCase();
    const msgErro = document.getElementById('msg-erro');
    const btnEntrar = document.getElementById('btn-entrar');

    msgErro.style.display = 'none';

    if (!emailLimpo.endsWith('@coren-pe.gov.br')) {
        mostrarErro("Por favor, insira um e-mail válido do COREN-PE.");
        return;
    }

    btnEntrar.innerText = "Validando dados...";
    btnEntrar.disabled = true;

    try {
        const { data: colaborador, error: erroColab } = await clienteSupabase
            .from('colaboradores').select('*').ilike('email', emailLimpo).maybeSingle();
        if (erroColab) throw erroColab;

        if (!colaborador) {
            mostrarErro("E-mail não localizado na base do COREN-PE.");
            return;
        }

        const { data: voto, error: erroVoto } = await clienteSupabase
            .from('votos').select('email').eq('email', emailLimpo).maybeSingle();
        if (erroVoto) throw erroVoto;

        if (voto) {
            mostrarErro("Acesso negado: este e-mail já registrou um voto.");
            return;
        }

        await carregarCandidatos();

        // 🔑 Guarda o nome COMPLETO para o banco de dados
        window.emailUsuarioValido = emailLimpo;
        window.nomeUsuarioValido = formatarNome(colaborador.nome);

        Object.keys(escolhas).forEach(k => delete escolhas[k]);
        etapaAtual = 0;
        renderizarCandidatos();

        document.getElementById('tela-login').style.display = 'none';
        document.getElementById('tela-urna').style.display = 'block';

        // 🆕 Saudação com apenas primeiro + último nome
        document.getElementById('saudacao-usuario').innerText =
            `Olá, ${nomeCurto(colaborador.nome)}!`;

        document.getElementById('badge-setor-usuario').innerText = colaborador.setor || '';
        document.getElementById('badge-cargo-usuario').innerText = colaborador.cargo || '';

        const fotoUsuario = document.getElementById('foto-usuario');
        fotoUsuario.src = colaborador.foto || avatarIniciais(colaborador.nome);
        fotoUsuario.alt = formatarNome(colaborador.nome);
        fotoUsuario.onerror = () => { fotoUsuario.onerror = null; fotoUsuario.src = avatarIniciais(colaborador.nome); };

        atualizarNavegacao();

    } catch (err) {
        console.error(err);
        mostrarErro("Erro de conexão com o servidor.");
    } finally {
        btnEntrar.innerText = "Acessar Urna";
        btnEntrar.disabled = false;
    }
}

function mostrarErro(mensagem) {
    const msgErro = document.getElementById('msg-erro');
    msgErro.innerText = mensagem;
    msgErro.style.display = 'block';
}

document.getElementById('input-email').addEventListener('input', function () {
    if (this.value.endsWith('@')) {
        const p = this.value.length;
        this.value += 'coren-pe.gov.br';
        this.setSelectionRange(p, this.value.length);
    }
});

// ==========================================
// 5. RENDERIZAR CANDIDATOS
// ==========================================
function renderizarCandidatos() {
    let html = '';
    etapas.forEach((cargo, i) => {
        const chaveCargo = chave(cargo);
        html += `<div class="etapa-votacao" id="etapa-${i}" style="display:${i === 0 ? 'block' : 'none'};">
            <div class="cargo-header">
                <h2>${cargo} Destaque</h2>
                <p>Escolha <strong>1 candidato</strong>. Clique novamente para desmarcar.</p>
            </div>`;

        const doCargo = candidatos.filter(c => c.categoria === cargo);
        [...new Set(doCargo.map(c => c.setor))].sort((a, b) => a.localeCompare(b, 'pt')).forEach(setor => {
            html += `<h3>${esc(setor)}</h3><div class="grid-candidatos">`;
            doCargo.filter(c => c.setor === setor).forEach(c => {
                const emailCandidato = (c.email || '').trim().toLowerCase();
                const souEu = (emailCandidato === window.emailUsuarioValido);
                const foto = c.foto || avatarIniciais(c.nome);

                if (souEu) {
                    html += `<label class="bloqueado" title="Você não pode votar em si mesmo">
                        <input type="radio" disabled name="${chaveCargo}" value="${esc(c.nome)}">
                        <div class="card-candidato">
                            <img src="${esc(foto)}" alt="${esc(c.nome)}">
                            <p>${esc(formatarNome(c.nome))}</p>
                            <span style="display:block; font-size:11px; color:#e53e3e; margin-top:5px; font-weight:bold;">Seu Perfil</span>
                        </div>
                    </label>`;
                } else {
                    html += `<label data-cat="${chaveCargo}" data-nome="${esc(c.nome)}">
                        <input type="radio" name="${chaveCargo}" value="${esc(c.nome)}">
                        <div class="card-candidato">
                            <img src="${esc(foto)}" alt="${esc(c.nome)}">
                            <p>${esc(formatarNome(c.nome))}</p>
                        </div>
                    </label>`;
                }
            });
            html += `</div>`;
        });
        html += `</div>`;
    });

    const container = document.getElementById('secoes-votacao');
    container.innerHTML = html;

    container.querySelectorAll('img').forEach(img =>
        img.addEventListener('error', () => { img.src = avatarIniciais(img.alt); }, { once: true }));
}

// ==========================================
// 6. SINCRONIZAÇÃO VISUAL
// ==========================================
function sincronizarVisual() {
    document.querySelectorAll('#secoes-votacao label[data-cat]').forEach(label => {
        const cat = label.dataset.cat;
        const nome = label.dataset.nome;
        const radio = label.querySelector('input[type="radio"]');
        const selecionado = (escolhas[cat] === nome);
        if (radio) radio.checked = selecionado;
        label.classList.toggle('selecionado', selecionado);
    });
}

// ==========================================
// 7. DELEGAÇÃO DE EVENTOS
// ==========================================
document.getElementById('secoes-votacao').addEventListener('click', async function(e) {
    const label = e.target.closest('label[data-cat]');
    if (!label) return;

    e.preventDefault();
    e.stopPropagation();

    const catKey = label.dataset.cat;
    const nome = label.dataset.nome;
    const anterior = escolhas[catKey];

    if (anterior === nome) {
        delete escolhas[catKey];
        sincronizarVisual();
        return;
    }

    if (anterior && anterior !== nome) {
        const confirmou = await modalConfirmacao(
            'Trocar de candidato?',
            `Você já escolheu <strong>${formatarNome(anterior)}</strong> nesta categoria.<br><br>Deseja trocar por <strong>${formatarNome(nome)}</strong>?`,
            'Sim, trocar',
            'Não, manter'
        );
        if (confirmou) {
            escolhas[catKey] = nome;
            sincronizarVisual();
        } else {
            sincronizarVisual();
        }
        return;
    }

    escolhas[catKey] = nome;
    sincronizarVisual();
});

// ==========================================
// 8. NAVEGAÇÃO
// ==========================================
function atualizarNavegacao() {
    const ultima = etapaAtual === etapas.length - 1;
    document.getElementById('progresso-barra').style.width = `${((etapaAtual + 1) / etapas.length) * 100}%`;
    document.getElementById('progresso-texto').innerText = `Passo ${etapaAtual + 1} de ${etapas.length}: ${etapas[etapaAtual]}`;
    document.getElementById('btn-anterior').style.display = etapaAtual === 0 ? 'none' : 'flex';
    document.getElementById('btn-proximo').style.display = ultima ? 'none' : 'flex';
    document.getElementById('btn-votar').style.display = ultima ? 'flex' : 'none';
}

function irParaEtapa(nova) {
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'none';
    etapaAtual = nova;
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'block';
    atualizarNavegacao();
    window.scrollTo(0, 0);
}

function categoriaMarcada(cargo) {
    return document.querySelector(`input[name="${chave(cargo)}"]:checked`);
}

document.getElementById('btn-proximo').addEventListener('click', async () => {
    if (!categoriaMarcada(etapas[etapaAtual])) {
        await modalAviso(
            'Escolha um candidato',
            `Você precisa escolher <strong>1 candidato</strong> em <strong>${etapas[etapaAtual]}</strong> antes de avançar.`
        );
        return;
    }
    irParaEtapa(etapaAtual + 1);
});

document.getElementById('btn-anterior').addEventListener('click', () => irParaEtapa(etapaAtual - 1));

// ==========================================
// 9. REVISÃO E CONFIRMAÇÃO
// ==========================================
function fotoDoCandidato(nome) {
    const c = candidatos.find(x => x.nome === nome);
    return (c && c.foto) || avatarIniciais(nome);
}

async function revisarVoto(event) {
    event.preventDefault();

    const faltando = etapas.find(c => !categoriaMarcada(c));
    if (faltando) {
        await modalAviso('Falta uma escolha', `Falta escolher um candidato em <strong>${faltando}</strong>.`);
        return;
    }

    const lista = document.getElementById('lista-resumo');
    lista.innerHTML = etapas.map(cargo => {
        const nome = categoriaMarcada(cargo).value;
        return `<div class="resumo-card">
            <span class="cargo-label">${cargo}</span>
            <img src="${esc(fotoDoCandidato(nome))}" alt="${esc(nome)}">
            <span class="nome-label">${esc(formatarNome(nome))}</span>
        </div>`;
    }).join('');
    lista.querySelectorAll('img').forEach(img =>
        img.addEventListener('error', () => { img.src = avatarIniciais(img.alt); }, { once: true }));

    document.getElementById('tela-urna').style.display = 'none';
    document.getElementById('tela-resumo').style.display = 'block';
    window.scrollTo(0, 0);
}

document.getElementById('btn-voltar-edicao').addEventListener('click', () => {
    document.getElementById('tela-resumo').style.display = 'none';
    document.getElementById('tela-urna').style.display = 'block';
    window.scrollTo(0, 0);
});

document.getElementById('btn-confirmar-final').addEventListener('click', async function () {
    const btnVoltar = document.getElementById('btn-voltar-edicao');
    const dadosVoto = { nome_completo: window.nomeUsuarioValido, email: window.emailUsuarioValido };
    etapas.forEach(cargo => { dadosVoto[chave(cargo)] = categoriaMarcada(cargo).value; });

    this.innerText = "Enviando...";
    this.disabled = true;
    btnVoltar.disabled = true;

    try {
        const { error } = await clienteSupabase.from('votos').insert([dadosVoto]);
        if (error) throw error;

        document.getElementById('header-resumo').innerHTML =
            `<h2>Comprovante de votação</h2><p>Votos registrados por <strong>${esc(window.nomeUsuarioValido)}</strong>.</p>`;
        document.getElementById('botoes-resumo').style.display = 'none';
        document.getElementById('mensagem-sucesso').style.display = 'block';
        window.scrollTo(0, 0);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            await modalAviso('Voto já registado', 'Este e-mail já registrou um voto.');
        } else {
            await modalAviso('Erro ao enviar', 'Erro ao registrar o voto. Verifique sua conexão e tente novamente.');
        }
        this.innerText = "Confirmar voto";
        this.disabled = false;
        btnVoltar.disabled = false;
    }
});