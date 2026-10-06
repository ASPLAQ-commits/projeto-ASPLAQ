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
    aplicarLogoTema();
    if (!btnTema) return;
    btnTema.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('tema', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        aplicarLogoTema();
    });
});

// ==========================================
// 📧 CONFIGURAÇÃO EMAILJS
// ==========================================
const EMAILJS_PUBLIC_KEY        = 'TRc_bmFL_d8s4e7vg';
const EMAILJS_SERVICE_ID        = 'service_v7hu19x';
const EMAILJS_TEMPLATE_ID       = 'template_jnjq8ma';
const EMAILJS_TEMPLATE_SOLICITA = 'template_ey79bns';

(function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
        console.log('✅ EmailJS inicializado');
    } else {
        console.error('❌ EmailJS não carregado');
    }
})();

// ==========================================
// 1. CONFIGURAÇÃO DO SUPABASE
// ==========================================
const supabaseUrl = 'https://cnptvjdzqfsqbdkrnbbe.supabase.co';
const supabaseKey = 'sb_publishable_cCqmjnqgdSvOcKA6oyd28Q_4BpE1hQ6';
const clienteSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);

window.emailUsuarioValido = "";
window.nomeUsuarioValido = "";
let dadosColaboradorPendente = null;
let intervaloReenvio = null;

// Estado do perfil ativo (para o botão "Escolher este")
let perfilAtual = null;

const SESSION_KEY = 'votacao_sessao';
const SESSION_DURATION_MS = 4 * 60 * 60 * 1000;

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

function nomeCurto(nome) {
    const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '';
    if (partes.length === 1) return formatarNome(partes[0]);
    let prefixo = '';
    let nomes = partes;
    const p0 = partes[0].toLowerCase().replace(/\.$/, '');
    if (p0 === 'dr')       { prefixo = 'Dr. ';  nomes = partes.slice(1); }
    else if (p0 === 'dra') { prefixo = 'Dra. '; nomes = partes.slice(1); }
    if (nomes.length === 0) return prefixo.trim();
    if (nomes.length === 1) return prefixo + formatarNome(nomes[0]);
    return prefixo + formatarNome(nomes[0]) + ' ' + formatarNome(nomes[nomes.length - 1]);
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
// 🔑 SESSÃO PERSISTENTE
// ==========================================
function salvarSessao(info) {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            email: info.email,
            nome: info.nome,
            setor: info.setor,
            cargo: info.cargo,
            foto: info.foto,
            expira: Date.now() + SESSION_DURATION_MS
        }));
    } catch (e) { console.warn('Erro ao salvar sessão:', e); }
}

function limparSessao() {
    try { localStorage.removeItem(SESSION_KEY); }
    catch (e) { console.warn('Erro ao limpar sessão:', e); }
}

async function restaurarSessao() {
    let sessao;
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return false;
        sessao = JSON.parse(raw);
    } catch (e) { limparSessao(); return false; }

    if (!sessao.expira || sessao.expira < Date.now()) {
        limparSessao();
        return false;
    }

    try {
        const { data: jaVotou, error } = await clienteSupabase.rpc('verificar_voto_existente', {
            p_email: sessao.email
        });
        if (error) throw error;

        if (jaVotou === true) {
            limparSessao();
            return false;
        }
    } catch (e) {
        console.warn('Erro ao verificar voto:', e);
        limparSessao();
        return false;
    }

    dadosColaboradorPendente = sessao;
    await liberarVotacao();
    return true;
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
// 3. CARREGAR CANDIDATOS (via RPC)
// ==========================================
async function carregarCandidatos(emailVotante) {
    const { data, error } = await clienteSupabase.rpc('listar_candidatos', {
        p_email_votante: emailVotante
    });

    if (error) throw error;

    candidatos = [];
    (data || []).forEach(p => {
        const categoria = categoriaDe(p.cargo);
        if (categoria) {
            candidatos.push({
                nome: p.nome,
                setor: p.setor || 'Sem setor',
                cargo: p.cargo,
                foto: p.foto,
                categoria
            });
        }
    });
    candidatos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));

    etapas = ordemCargos.filter(cat => candidatos.some(c => c.categoria === cat));
    if (etapas.length === 0) throw new Error("Nenhum candidato encontrado");
}

// ==========================================
// 4. LOGIN — com modal para e-mail não encontrado
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

    btnEntrar.innerText = "Validando...";
    btnEntrar.disabled = true;

    try {
        // 🔍 1. Verifica se é e-mail de teste
        const { data: ehTeste, error: errTeste } = await clienteSupabase.rpc('email_e_teste', {
            p_email: emailLimpo
        });

        if (!errTeste && ehTeste === true) {
            console.log('🧪 E-mail de teste detectado — pulando OTP');

            const { data: dados, error: errDados } = await clienteSupabase.rpc('dados_colaborador', {
                p_email: emailLimpo
            });

            if (errDados) throw errDados;
            if (!dados || dados.length === 0) {
                await tratarEmailNaoEncontrado(emailLimpo);
                return;
            }

            const info = dados[0];

            const { data: jaVotou } = await clienteSupabase.rpc('verificar_voto_existente', {
                p_email: emailLimpo
            });

            if (jaVotou === true) {
                mostrarErro("Este e-mail já registrou um voto.");
                return;
            }

            dadosColaboradorPendente = {
                email: emailLimpo,
                nome: info.nome,
                setor: info.setor,
                cargo: info.cargo,
                foto: info.foto
            };

            await liberarVotacao();
            return;
        }

        // 🔒 2. Fluxo normal: gera OTP
        const { data: codigo, error } = await clienteSupabase.rpc('gerar_codigo', {
            p_email: emailLimpo
        });

        if (error) {
            const msg = (error.message || '').toLowerCase();
            if (msg.includes('não encontrado')) {
                await tratarEmailNaoEncontrado(emailLimpo);
                return;
            }
            throw error;
        }

        dadosColaboradorPendente = { email: emailLimpo };

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                to_email: emailLimpo,
                codigo: codigo,
                to_name: 'Colaborador'
            });
            console.log('📧 E-mail enviado');
        } catch (emailErr) {
            console.error('Erro no envio:', emailErr);
            await modalAviso(
                'Erro ao enviar e-mail',
                'Não foi possível enviar o código.<br><br>' +
                '<small style="color:#888; font-size:12px;">' +
                (emailErr.text || emailErr.message || '') + '</small>'
            );
            return;
        }

        document.getElementById('tela-login').style.display = 'none';
        document.getElementById('tela-codigo').style.display = 'block';
        document.getElementById('email-verificacao').innerText = emailLimpo;
        document.getElementById('input-codigo').value = '';
        document.getElementById('msg-erro-codigo').style.display = 'none';
        document.getElementById('input-codigo').focus();

        iniciarTimerReenvio(60);

    } catch (err) {
        console.error(err);
        const msg = (err.message || '').toLowerCase();

        if (msg.includes('não encontrado')) {
            await tratarEmailNaoEncontrado(emailLimpo);
        } else if (msg.includes('já registrou')) {
            mostrarErro("Este e-mail já registrou um voto.");
        } else if (msg.includes('@coren-pe.gov.br')) {
            mostrarErro("Apenas e-mails institucionais podem votar.");
        } else {
            mostrarErro("Erro ao validar acesso. Tente novamente.");
        }
    } finally {
        btnEntrar.innerText = "Acessar Urna";
        btnEntrar.disabled = false;
    }
}

// ==========================================
// 🎯 MODAL: E-mail não encontrado
// ==========================================
async function tratarEmailNaoEncontrado(emailLimpo) {
    const irParaSolicitacao = await abrirModal({
        tipo: 'aviso',
        titulo: 'E-mail não encontrado',
        mensagem:
            'O e-mail <strong>' + emailLimpo + '</strong> não está cadastrado na base de votação.<br><br>' +
            'Deseja solicitar a inclusão do seu cadastro para verificação?<br><br>' +
            '<small style="color:#888; font-size:13px; line-height:1.4;">' +
            'Você precisará informar:<br>' +
            '• <strong>Nome completo</strong><br>' +
            '• <strong>Setor</strong><br>' +
            '• <strong>E-mail institucional</strong>' +
            '</small>',
        botoes: [
            { texto: 'Tentar outro e-mail', valor: false, estilo: 'cancelar' },
            { texto: 'Solicitar inclusão', valor: true, estilo: 'primary' }
        ]
    });

    if (irParaSolicitacao) {
        mostrarTelaSolicitacao();
        document.getElementById('solic-email').value = emailLimpo;
        document.getElementById('solic-nome').focus();
    } else {
        const inputEmail = document.getElementById('input-email');
        inputEmail.focus();
        inputEmail.select();
    }
}

function mostrarErro(mensagem) {
    const msgErro = document.getElementById('msg-erro');
    msgErro.innerText = mensagem;
    msgErro.style.display = 'block';
}

document.getElementById('input-email').addEventListener('input', function () {
    if (this.value.endsWith('@') && !this.value.toLowerCase().includes('coren-pe.gov.br')) {
        this.value += 'coren-pe.gov.br';
    }
});

// ==========================================
// 5. CONFIRMAR CÓDIGO
// ==========================================
async function confirmarCodigo() {
    const codigoDigitado = document.getElementById('input-codigo').value.trim();
    const msgErroCodigo = document.getElementById('msg-erro-codigo');

    msgErroCodigo.style.display = 'none';

    if (!/^\d{6}$/.test(codigoDigitado)) {
        msgErroCodigo.innerText = "Digite os 6 dígitos do código.";
        msgErroCodigo.style.display = 'block';
        return;
    }

    try {
        const emailPendente = (dadosColaboradorPendente.email || '').trim().toLowerCase();

        const { data, error } = await clienteSupabase.rpc('validar_codigo', {
            p_email: emailPendente,
            p_codigo: codigoDigitado
        });

        if (error) throw error;

        if (data === true) {
            await liberarVotacao();
        }
    } catch (err) {
        console.error(err);
        msgErroCodigo.innerText = err.message || "Código incorreto.";
        msgErroCodigo.style.display = 'block';
    }
}

async function reenviarCodigo() {
    if (!dadosColaboradorPendente) return;
    await validarAcesso();
}

function iniciarTimerReenvio(segundos) {
    const btnReenviar = document.getElementById('btn-reenviar');
    const timerSpan = document.getElementById('timer-reenvio');
    let contador = segundos;

    btnReenviar.disabled = true;
    timerSpan.innerText = `(${contador}s)`;

    if (intervaloReenvio) clearInterval(intervaloReenvio);

    intervaloReenvio = setInterval(() => {
        contador--;
        if (contador <= 0) {
            clearInterval(intervaloReenvio);
            btnReenviar.disabled = false;
            timerSpan.innerText = '';
        } else {
            timerSpan.innerText = `(${contador}s)`;
        }
    }, 1000);
}

// ==========================================
// 6. LIBERAR VOTAÇÃO
// ==========================================
async function liberarVotacao() {
    try {
        const email = dadosColaboradorPendente.email;

        if (!dadosColaboradorPendente.nome) {
            const { data: dados, error } = await clienteSupabase.rpc('dados_colaborador', {
                p_email: email
            });
            if (error) throw error;
            if (!dados || dados.length === 0) throw new Error('Dados não encontrados');
            Object.assign(dadosColaboradorPendente, dados[0]);
        }

        const info = dadosColaboradorPendente;

        await carregarCandidatos(email);

        window.emailUsuarioValido = email;
        window.nomeUsuarioValido = formatarNome(info.nome);

        salvarSessao(info);

        Object.keys(escolhas).forEach(k => delete escolhas[k]);
        etapaAtual = 0;
        renderizarCandidatos();

        document.getElementById('tela-login').style.display = 'none';
        document.getElementById('tela-codigo').style.display = 'none';
        document.getElementById('tela-solicitacao').style.display = 'none';
        document.getElementById('tela-urna').style.display = 'block';

        document.getElementById('saudacao-usuario').innerText = `Olá, ${nomeCurto(info.nome)}!`;
        document.getElementById('badge-setor-usuario').innerText = info.setor || '';
        document.getElementById('badge-cargo-usuario').innerText = info.cargo || '';

        const fotoUsuario = document.getElementById('foto-usuario');
        fotoUsuario.src = info.foto || avatarIniciais(info.nome);
        fotoUsuario.alt = formatarNome(info.nome);
        fotoUsuario.onerror = () => {
            fotoUsuario.onerror = null;
            fotoUsuario.src = avatarIniciais(info.nome);
        };

        atualizarNavegacao();

    } catch (err) {
        console.error(err);
        await modalAviso('Erro', 'Erro ao carregar a urna. Recarregue a página.');
    }
}

// ==========================================
// 7. RENDERIZAR CANDIDATOS (com botão de ver perfil)
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
                const foto = c.foto || avatarIniciais(c.nome);
                html += `<label data-cat="${chaveCargo}" data-nome="${esc(c.nome)}">
                    <input type="radio" name="${chaveCargo}" value="${esc(c.nome)}">
                    <button type="button" class="btn-ver-perfil" aria-label="Ver perfil completo" title="Ver perfil completo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <div class="card-candidato">
                        <img src="${esc(foto)}" alt="${esc(c.nome)}">
                        <p>${esc(formatarNome(c.nome))}</p>
                    </div>
                </label>`;
            });
            html += `</div>`;
        });
        html += `</div>`;
    });

    const container = document.getElementById('secoes-votacao');
    container.innerHTML = html;

    // Tratamento de erro de imagem
    container.querySelectorAll('img').forEach(img =>
        img.addEventListener('error', () => { img.src = avatarIniciais(img.alt); }, { once: true }));

    // 👁️ Eventos do botão de ver perfil
    container.querySelectorAll('.btn-ver-perfil').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const label = btn.closest('label[data-cat]');
            if (label) abrirPerfilCandidato(label.dataset.cat, label.dataset.nome);
        });
    });
}

// ==========================================
// 8. SINCRONIZAÇÃO VISUAL
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
// 9. SELEÇÃO DE CANDIDATO (extraído para reuso)
// ==========================================
async function selecionarCandidato(catKey, nome) {
    const anterior = escolhas[catKey];

    // Clicou no mesmo → desmarcar
    if (anterior === nome) {
        delete escolhas[catKey];
        sincronizarVisual();
        return;
    }

    // Já tem outro → confirmação
    if (anterior && anterior !== nome) {
        const confirmou = await modalConfirmacao(
            'Trocar de candidato?',
            `Você já escolheu <strong>${formatarNome(anterior)}</strong> nesta categoria.<br><br>Deseja trocar por <strong>${formatarNome(nome)}</strong>?`,
            'Sim, trocar',
            'Não, manter'
        );
        if (confirmou) escolhas[catKey] = nome;
        sincronizarVisual();
        return;
    }

    // Primeira escolha
    escolhas[catKey] = nome;
    sincronizarVisual();
}

// ==========================================
// 10. DELEGAÇÃO DE EVENTOS
// ==========================================
document.getElementById('secoes-votacao').addEventListener('click', async function(e) {
    // Ignora cliques no botão de ver perfil (já tratado no render)
    if (e.target.closest('.btn-ver-perfil')) return;

    const label = e.target.closest('label[data-cat]');
    if (!label) return;

    e.preventDefault();
    e.stopPropagation();

    await selecionarCandidato(label.dataset.cat, label.dataset.nome);
});

// ==========================================
// 🎬 11. MODAL DE PERFIL DO CANDIDATO
// ==========================================
function abrirPerfilCandidato(catKey, nome) {
    const cand = candidatos.find(c =>
        c.nome === nome && chave(c.categoria) === catKey
    );
    if (!cand) return;

    perfilAtual = { cat: catKey, nome: nome };

    const fotoEl = document.getElementById('perfil-foto');
    fotoEl.src = cand.foto || avatarIniciais(cand.nome);
    fotoEl.onerror = function() {
        this.onerror = null;
        this.src = avatarIniciais(cand.nome);
    };
    fotoEl.alt = formatarNome(cand.nome);

    document.getElementById('perfil-nome').innerText = formatarNome(cand.nome);
    document.getElementById('perfil-setor').innerText = cand.setor;
    document.getElementById('perfil-cargo').innerText = cand.cargo;

    document.getElementById('modal-perfil').style.display = 'flex';
}

function fecharPerfilCandidato() {
    document.getElementById('modal-perfil').style.display = 'none';
    perfilAtual = null;
}

async function escolherDoPerfil() {
    if (!perfilAtual) return;
    const { cat, nome } = perfilAtual;
    fecharPerfilCandidato();
    await selecionarCandidato(cat, nome);
}

// Fecha o modal de perfil com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modalPerfil = document.getElementById('modal-perfil');
        if (modalPerfil && modalPerfil.style.display === 'flex') {
            fecharPerfilCandidato();
        }
    }
});

// ==========================================
// 🔍 12. BARRA DE PESQUISA
// ==========================================
document.getElementById('barra-pesquisa').addEventListener('input', function() {
    const termo = this.value.trim();
    document.getElementById('limpar-pesquisa').style.display = termo ? 'flex' : 'none';
    filtrarCandidatos(termo);
});

document.getElementById('limpar-pesquisa').addEventListener('click', function() {
    document.getElementById('barra-pesquisa').value = '';
    this.style.display = 'none';
    filtrarCandidatos('');
    document.getElementById('barra-pesquisa').focus();
});

function filtrarCandidatos(termo) {
    const termoNorm = norm(termo);

    // Filtra cada card
    document.querySelectorAll('#secoes-votacao label[data-cat]').forEach(label => {
        const nomeNorm = norm(label.dataset.nome || '');
        const match = !termoNorm || nomeNorm.includes(termoNorm);
        label.style.display = match ? '' : 'none';
    });

    // Esconde blocos (h3 + grid) que ficaram sem candidatos visíveis
    document.querySelectorAll('#secoes-votacao .grid-candidatos').forEach(grid => {
        const visiveis = Array.from(grid.querySelectorAll('label[data-cat]'))
            .filter(l => l.style.display !== 'none');
        const h3 = grid.previousElementSibling;

        if (visiveis.length === 0) {
            grid.style.display = 'none';
            if (h3 && h3.tagName === 'H3') h3.style.display = 'none';
        } else {
            grid.style.display = '';
            if (h3 && h3.tagName === 'H3') h3.style.display = '';
        }
    });
}

// ==========================================
// 13. NAVEGAÇÃO
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

    // 🔄 Limpa a pesquisa ao mudar de categoria
    const barra = document.getElementById('barra-pesquisa');
    if (barra) {
        barra.value = '';
        document.getElementById('limpar-pesquisa').style.display = 'none';
        filtrarCandidatos('');
    }

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
// 14. REVISÃO
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

// ==========================================
// 15. ENVIO FINAL
// ==========================================
document.getElementById('btn-confirmar-final').addEventListener('click', async function () {
    const btnVoltar = document.getElementById('btn-voltar-edicao');
    const htmlOriginal = this.innerHTML;

    this.innerHTML = "Enviando...";
    this.disabled = true;
    btnVoltar.disabled = true;
    document.getElementById('btn-voltar-edicao').style.display = 'none';

    try {
        const { data, error } = await clienteSupabase.rpc('registrar_voto', {
            p_nome_completo: window.nomeUsuarioValido,
            p_email: window.emailUsuarioValido,
            p_estagiario:   escolhas.estagiario,
            p_terceirizado: escolhas.terceirizado,
            p_comissionado: escolhas.comissionado,
            p_conselheiro:  escolhas.conselheiro,
            p_funcionario:  escolhas.funcionario
        });

        if (error) throw error;

        if (data === true) {
            limparSessao();
            this.style.display = 'none';
            document.getElementById('header-resumo').innerHTML =
                `<h2>Comprovante de Votação</h2><p>Votos enviados por <strong>${esc(window.nomeUsuarioValido)}</strong>.</p>`;
            document.getElementById('mensagem-sucesso').style.display = 'block';
        } else {
            await modalAviso('Erro ao enviar', 'Não foi possível registrar o seu voto.');
            this.innerHTML = htmlOriginal;
            this.disabled = false;
            btnVoltar.disabled = false;
            document.getElementById('btn-voltar-edicao').style.display = 'flex';
        }
    } catch (err) {
        console.error('Erro ao enviar voto:', err);
        let msg = 'Erro ao registrar o voto. Tente novamente.';
        const erroTxt = (err.message || '').toLowerCase();

        if (erroTxt.includes('não autorizado')) {
            msg = 'O seu e-mail não consta na lista de colaboradores autorizados.';
        } else if (erroTxt.includes('já registrou')) {
            msg = 'Este e-mail já registrou um voto.';
        } else if (erroTxt.includes('@coren-pe.gov.br')) {
            msg = 'Apenas e-mails institucionais podem votar.';
        } else if (erroTxt.includes('em si mesmo')) {
            msg = 'Não é permitido votar em si mesmo.';
        }

        await modalAviso('Erro ao enviar', msg);
        this.innerHTML = htmlOriginal;
        this.disabled = false;
        btnVoltar.disabled = false;
        document.getElementById('btn-voltar-edicao').style.display = 'flex';
    }
});

// ==========================================
// 16. RECIBO PARA QUEM JÁ VOTOU
// ==========================================
function mostrarEcraRecibo(dadosDB) {
    document.getElementById('tela-login').style.display = 'none';
    document.getElementById('tela-resumo').style.display = 'block';

    document.getElementById('header-resumo').innerHTML = `
        <h2 style="color: #1a7f37;">Voto Já Registrado!</h2>
        <p>Identificamos que <strong>${dadosDB.nome_completo}</strong> (${dadosDB.email}) já participou da votação.</p>
    `;

    document.getElementById('botoes-resumo').style.display = 'none';
    document.getElementById('mensagem-sucesso').style.display = 'none';
}

// ==========================================
// 17. SOLICITAÇÃO DE CADASTRO
// ==========================================
function mostrarTelaSolicitacao() {
    document.getElementById('tela-login').style.display = 'none';
    document.getElementById('tela-codigo').style.display = 'none';
    document.getElementById('tela-solicitacao').style.display = 'block';
    document.getElementById('form-solicitacao').reset();
    document.getElementById('msg-solicitacao').style.display = 'none';
    document.getElementById('solic-nome').focus();
}

function voltarParaLogin() {
    document.getElementById('tela-solicitacao').style.display = 'none';
    document.getElementById('tela-login').style.display = 'block';
    document.getElementById('msg-erro').style.display = 'none';
}

document.getElementById('btn-voltar-login').addEventListener('click', voltarParaLogin);

document.getElementById('solic-email').addEventListener('input', function () {
    if (this.value.endsWith('@') && !this.value.toLowerCase().includes('coren-pe.gov.br')) {
        this.value += 'coren-pe.gov.br';
    }
});

document.getElementById('form-solicitacao').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('solic-nome').value.trim();
    const setor = document.getElementById('solic-setor').value.trim();
    const email = document.getElementById('solic-email').value.trim().toLowerCase();
    const msg = document.getElementById('msg-solicitacao');
    const btn = document.getElementById('btn-enviar-solicitacao');

    msg.style.display = 'none';

    if (!nome) {
        msg.innerText = "Por favor, preencha o seu nome completo.";
        msg.style.display = 'block';
        return;
    }

    if (!setor) {
        msg.innerText = "Por favor, informe o seu setor.";
        msg.style.display = 'block';
        return;
    }

    if (!email.endsWith('@coren-pe.gov.br')) {
        msg.innerText = "⚠️ Use apenas o e-mail institucional do COREN-PE (terminado em @coren-pe.gov.br).";
        msg.style.display = 'block';
        return;
    }

    const htmlOriginal = btn.innerHTML;
    btn.innerHTML = "Enviando...";
    btn.disabled = true;

    try {
        const { data, error } = await clienteSupabase.rpc('registrar_solicitacao', {
            p_nome_completo: nome,
            p_setor: setor,
            p_email_institucional: email
        });

        if (error) throw error;

        try {
            const resp = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_SOLICITA, {
                nome_completo: nome,
                setor: setor,
                email_institucional: email,
                to_email: 'planejamento.qualidade@coren-pe.gov.br'
            });
            console.log('📧 Solicitação enviada com sucesso:', resp);
        } catch (emailErr) {
            console.error('❌ Erro EmailJS detalhado:', emailErr);
        }

        await modalAviso(
            'Solicitação Enviada!',
            'A comissão organizadora recebeu a sua solicitação.<br><br>' +
            'Você receberá uma resposta em breve por e-mail. ' +
            'Assim que o seu cadastro for corrigido, tente fazer login novamente.'
        );

        voltarParaLogin();

    } catch (err) {
        console.error(err);
        const erroTxt = (err.message || '').toLowerCase();

        if (erroTxt.includes('já existe')) {
            msg.innerText = "Já existe uma solicitação pendente para este e-mail. Aguarde o retorno da comissão.";
        } else if (erroTxt.includes('@coren-pe.gov.br')) {
            msg.innerText = "⚠️ Use apenas o e-mail institucional do COREN-PE.";
        } else {
            msg.innerText = "Erro ao enviar solicitação. Tente novamente em instantes.";
        }
        msg.style.display = 'block';
    } finally {
        btn.innerHTML = htmlOriginal;
        btn.disabled = false;
    }
});

// ==========================================
// 🚀 Start — tenta restaurar sessão ao carregar
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    await restaurarSessao();
});