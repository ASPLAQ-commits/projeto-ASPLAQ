// ==========================================
// 1. CONFIGURAÇÃO DO SUPABASE
// ==========================================
const supabaseUrl = 'https://cnptvjdzqfsqbdkrnbbe.supabase.co';
const supabaseKey = 'sb_publishable_cCqmjnqgdSvOcKA6oyd28Q_4BpE1hQ6';
const clienteSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);

window.emailUsuarioValido = "";
window.nomeUsuarioValido = "";

const ordemCargos = ["Estagiário", "Terceirizado", "Comissionado", "Conselheiro", "Funcionário"];
let candidatos = [];   // colaboradores vindos da tabela "colaboradores"
let etapas = [];       // só as categorias que têm candidatos
let etapaAtual = 0;

const norm = t => (t || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const chave = cargo => norm(cargo).replace(/\s+/g, "_"); // "Estagiário" -> "estagiario" (coluna em votos)
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// "LUIZ GABRIEL SARMENTO" -> "Luiz Gabriel Sarmento" (mantém "de/da/do/dos/das" em minúsculo)
const conectivos = new Set(['de', 'da', 'do', 'dos', 'das', 'e']);
function formatarNome(nome) {
    return (nome || '').toLowerCase().split(' ').filter(Boolean).map((palavra, i) => {
        if (palavra === 'dr.' || palavra === 'dr') return 'Dr.';
        if (palavra === 'dra.' || palavra === 'dra') return 'Dra.';
        if (i > 0 && conectivos.has(palavra)) return palavra;
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    }).join(' ');
}

// "Estagiário(a)", "Funcionário(a) Efetivo", "Conselheiro(a)"... -> categoria da votação
function categoriaDe(cargo) {
    const c = norm(cargo);
    return ordemCargos.find(cat => c.includes(norm(cat).slice(0, 6)));
}

// ==========================================
// 2. CARREGAR CANDIDATOS DO SUPABASE
// ==========================================
async function carregarCandidatos() {
    // Busca os dados e trazemos o 'email' para usar na trava de segurança
    let { data, error } = await clienteSupabase.from('colaboradores').select('nome, setor, cargo, email, foto');
    if (error) ({ data, error } = await clienteSupabase.from('colaboradores').select('nome, setor, cargo, email'));
    if (error) throw error;

    candidatos = [];
    data.forEach(p => {
        const categoria = categoriaDe(p.cargo);
        if (categoria) {
            // Guardamos o e-mail no objeto do candidato para bloquear o voto depois
            candidatos.push({ nome: p.nome, setor: p.setor || 'Sem setor', cargo: p.cargo, email: p.email, foto: p.foto, categoria });
        } else {
            console.warn("Cargo sem categoria de votação:", p.cargo, "-", p.nome);
        }
    });
    candidatos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));

    etapas = ordemCargos.filter(cat => candidatos.some(c => c.categoria === cat));
    if (etapas.length === 0) throw new Error("Nenhum candidato encontrado na tabela colaboradores");
}

// ==========================================
// 3. LOGIN E VALIDAÇÃO
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
            mostrarErro("E-mail não localizado na base do COREN-PE. Verifique se digitou corretamente.");
            return;
        }

        const { data: voto, error: erroVoto } = await clienteSupabase
            .from('votos').select('email').eq('email', emailLimpo).maybeSingle();
        if (erroVoto) throw erroVoto;

        if (voto) {
            mostrarErro("Acesso negado: este e-mail já registrou um voto no sistema.");
            return;
        }

        // Trazemos todos os candidatos
        await carregarCandidatos();
        
        const nomeFormatado = formatarNome(colaborador.nome);
        window.emailUsuarioValido = emailLimpo;
        window.nomeUsuarioValido = nomeFormatado;

        etapaAtual = 0;
        renderizarCandidatos(); // Agora renderiza passando pelas travas

        document.getElementById('tela-login').style.display = 'none';
        document.getElementById('tela-urna').style.display = 'block';
        document.getElementById('saudacao-usuario').innerText = `Olá, ${nomeFormatado}!`;
        document.getElementById('badge-setor-usuario').innerText = colaborador.setor || '';
        document.getElementById('badge-cargo-usuario').innerText = colaborador.cargo || '';

        const fotoUsuario = document.getElementById('foto-usuario');
        fotoUsuario.src = colaborador.foto || avatarIniciais(colaborador.nome);
        fotoUsuario.alt = nomeFormatado;
        fotoUsuario.onerror = () => { fotoUsuario.onerror = null; fotoUsuario.src = avatarIniciais(colaborador.nome); };

        atualizarNavegacao();

    } catch (err) {
        console.error(err);
        mostrarErro("Erro de conexão com o servidor. Tente novamente.");
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

// Ao digitar "@", completa automaticamente com o domínio institucional.
document.getElementById('input-email').addEventListener('input', function () {
    if (this.value.endsWith('@')) {
        const posicaoArroba = this.value.length;
        this.value += 'coren-pe.gov.br';
        this.setSelectionRange(posicaoArroba, this.value.length);
    }
});

// ==========================================
// 4. CARTÕES DE CANDIDATOS (por categoria, agrupados por setor)
// ==========================================
// Sem foto, mostra um círculo com as iniciais
function avatarIniciais(nome) {
    const iniciais = nome.replace(/^Dra?\.\s*/, '').split(' ').filter(Boolean)
        .slice(0, 2).map(p => p[0]).join('').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#EFEAFC"/><text x="50" y="50" dy=".35em" text-anchor="middle" font-family="Arial" font-size="38" font-weight="700" fill="#6D4CE0">${iniciais}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function renderizarCandidatos() {
    let html = '';
    etapas.forEach((cargo, i) => {
        html += `<div class="etapa-votacao" id="etapa-${i}" style="display:${i === 0 ? 'block' : 'none'};">
            <div class="cargo-header">
                <h2>${cargo} Destaque</h2>
                <p>Selecione <strong>apenas 1 candidato</strong> desta categoria.</p>
            </div>`;

        const doCargo = candidatos.filter(c => c.categoria === cargo);
        [...new Set(doCargo.map(c => c.setor))].sort((a, b) => a.localeCompare(b, 'pt')).forEach(setor => {
            html += `<h3>${esc(setor)}</h3><div class="grid-candidatos">`;
            doCargo.filter(c => c.setor === setor).forEach(c => {
                
                // Trava de Segurança Segura: compara o e-mail do candidato com o do utilizador logado
                const emailCandidato = (c.email || '').trim().toLowerCase();
                const souEu = (emailCandidato === window.emailUsuarioValido);

                if (souEu) {
                    // Cartão cinza e bloqueado (Não pode votar em si mesmo)
                    html += `<label title="Você não pode votar em si mesmo">
                        <input type="radio" disabled name="${chave(cargo)}" value="${esc(c.nome)}">
                        <div class="card-candidato" style="opacity: 0.4; cursor: not-allowed; filter: grayscale(100%);">
                            <img src="${esc(c.foto || avatarIniciais(c.nome))}" alt="${esc(c.nome)}">
                            <p>${esc(formatarNome(c.nome))}</p>
                            <span style="display:block; font-size:11px; color:#e53e3e; margin-top:5px; font-weight:bold;">Seu Perfil</span>
                        </div>
                    </label>`;
                } else {
                    // Cartão normal e funcional
                    html += `<label>
                        <input type="radio" name="${chave(cargo)}" value="${esc(c.nome)}">
                        <div class="card-candidato">
                            <img src="${esc(c.foto || avatarIniciais(c.nome))}" alt="${esc(c.nome)}">
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

    // Se o link de uma foto estiver quebrado, volta para as iniciais
    container.querySelectorAll('img').forEach(img =>
        img.addEventListener('error', () => { img.src = avatarIniciais(img.alt); }, { once: true }));
}

// ==========================================
// 5. NAVEGAÇÃO ENTRE CATEGORIAS
// ==========================================
function atualizarNavegacao() {
    const ultima = etapaAtual === etapas.length - 1;
    document.getElementById('progresso-barra').style.width = `${((etapaAtual + 1) / etapas.length) * 100}%`;
    document.getElementById('progresso-texto').innerText = `Passo ${etapaAtual + 1} de ${etapas.length}: ${etapas[etapaAtual]}`;
    document.getElementById('btn-anterior').style.display = etapaAtual === 0 ? 'none' : 'block';
    document.getElementById('btn-proximo').style.display = ultima ? 'none' : 'block';
    document.getElementById('btn-votar').style.display = ultima ? 'block' : 'none';
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

document.getElementById('btn-proximo').addEventListener('click', () => {
    if (!categoriaMarcada(etapas[etapaAtual])) {
        alert(`Selecione um candidato para ${etapas[etapaAtual]} antes de avançar.`);
        return;
    }
    irParaEtapa(etapaAtual + 1);
});

document.getElementById('btn-anterior').addEventListener('click', () => irParaEtapa(etapaAtual - 1));

// ==========================================
// 6. REVISÃO E CONFIRMAÇÃO DO VOTO
// ==========================================
function fotoDoCandidato(nome) {
    const c = candidatos.find(x => x.nome === nome);
    return (c && c.foto) || avatarIniciais(nome);
}

// Passo 1: mostra todas as escolhas antes de enviar
function revisarVoto(event) {
    event.preventDefault();

    const faltando = etapas.find(c => !categoriaMarcada(c));
    if (faltando) {
        alert(`Falta escolher um candidato em: ${faltando}.`);
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

// Passo 2: grava o voto e mostra a confirmação
document.getElementById('btn-confirmar-final').addEventListener('click', async function () {
    const btnVoltar = document.getElementById('btn-voltar-edicao');

    // Colunas iguais às que o painel admin lê: estagiario, terceirizado, comissionado, conselheiro, funcionario
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
        alert(err.code === '23505'
            ? "Este e-mail já registrou um voto."
            : "Erro ao registrar o voto. Verifique sua conexão e tente novamente.");
        this.innerText = "Confirmar voto";
        this.disabled = false;
        btnVoltar.disabled = false;
    }
});