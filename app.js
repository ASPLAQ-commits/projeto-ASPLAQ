const supabaseUrl = 'https://cnptvjdzqfsqbdkrnbbe.supabase.co';
const supabaseKey = 'sb_publishable_cCqmjnqgdSvOcKA6oyd28Q_4BpE1hQ6';

// MANTENHA A SUA ARRAY "candidatosData" COMPLETA AQUI
const candidatosData = [
    // === ASPLAQ ===
    { id: "c1", nome: "Mariana Costa", cargo: "Estagiário", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Mariana+Costa&background=random&color=fff" },
    { id: "c2", nome: "João Vítor", cargo: "Estagiário", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Joao+Vitor&background=random&color=fff" },
    { id: "c3", nome: "Beatriz Souza", cargo: "Estagiário", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Beatriz+Souza&background=random&color=fff" },
    { id: "c4", nome: "João Pedro Silva", cargo: "Terceirizado", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Joao+Pedro&background=random&color=fff" },
    { id: "c5", nome: "Carla Dias", cargo: "Terceirizado", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Carla+Dias&background=random&color=fff" },
    { id: "c6", nome: "Rodrigo Alves", cargo: "Terceirizado", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Rodrigo+Alves&background=random&color=fff" },
    { id: "c7", nome: "Carlos Eduardo", cargo: "Comissionado", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Carlos+Eduardo&background=random&color=fff" },
    { id: "c8", nome: "Amanda Nogueira", cargo: "Comissionado", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Amanda+Nogueira&background=random&color=fff" },
    { id: "c9", nome: "Felipe Rocha", cargo: "Comissionado", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Felipe+Rocha&background=random&color=fff" },
    { id: "c10", nome: "Dra. Juliana Souza", cargo: "Conselheiro", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Juliana+Souza&background=random&color=fff" },
    { id: "c11", nome: "Dr. Renato Mendes", cargo: "Conselheiro", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Renato+Mendes&background=random&color=fff" },
    { id: "c12", nome: "Dra. Patrícia Lima", cargo: "Conselheiro", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Patricia+Lima&background=random&color=fff" },
    { id: "c13", nome: "Roberto Alves", cargo: "Funcionário", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Roberto+Alves&background=random&color=fff" },
    { id: "c14", nome: "Camila Fernandes", cargo: "Funcionário", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Camila+Fernandes&background=random&color=fff" },
    { id: "c15", nome: "Tiago Ribeiro", cargo: "Funcionário", setor: "ASPLAQ", foto: "https://ui-avatars.com/api/?name=Tiago+Ribeiro&background=random&color=fff" },

    // === Tecnologia da Informação ===
    { id: "c16", nome: "Luiz Gabriel Sarmento", cargo: "Estagiário", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Luiz+Gabriel&background=random&color=fff" },
    { id: "c17", nome: "Paulo Barroca", cargo: "Estagiário", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Paulo+Barroca&background=random&color=fff" },
    { id: "c18", nome: "Ana Clara", cargo: "Estagiário", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Ana+Clara&background=random&color=fff" },
    { id: "c19", nome: "Marcos Vinícius", cargo: "Terceirizado", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Marcos+Vinicius&background=random&color=fff" },
    { id: "c20", nome: "Letícia Gomes", cargo: "Terceirizado", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Leticia+Gomes&background=random&color=fff" },
    { id: "c21", nome: "Bruno Henrique", cargo: "Terceirizado", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Bruno+Henrique&background=random&color=fff" },
    { id: "c22", nome: "Felipe Costa", cargo: "Comissionado", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Felipe+Costa&background=random&color=fff" },
    { id: "c23", nome: "Juliana Almeida", cargo: "Comissionado", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Juliana+Almeida&background=random&color=fff" },
    { id: "c24", nome: "Ricardo Fontes", cargo: "Comissionado", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Ricardo+Fontes&background=random&color=fff" },
    { id: "c25", nome: "Dr. Marcos Lima", cargo: "Conselheiro", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Marcos+Lima&background=random&color=fff" },
    { id: "c26", nome: "Dra. Fernanda Costa", cargo: "Conselheiro", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Fernanda+Costa&background=random&color=fff" },
    { id: "c27", nome: "Dr. Eduardo Silva", cargo: "Conselheiro", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Eduardo+Silva&background=random&color=fff" },
    { id: "c28", nome: "Ricardo Silva", cargo: "Funcionário", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Ricardo+Silva&background=random&color=fff" },
    { id: "c29", nome: "Vanessa Martins", cargo: "Funcionário", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Vanessa+Martins&background=random&color=fff" },
    { id: "c30", nome: "André Castro", cargo: "Funcionário", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Andre+Castro&background=random&color=fff" },

    // === Comunicação ===
    { id: "c31", nome: "Sofia Almeida", cargo: "Estagiário", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Sofia+Almeida&background=random&color=fff" },
    { id: "c32", nome: "Pedro Lucas", cargo: "Estagiário", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Pedro+Lucas&background=random&color=fff" },
    { id: "c33", nome: "Laura Monteiro", cargo: "Estagiário", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Laura+Monteiro&background=random&color=fff" },
    { id: "c34", nome: "Lucas Mendes", cargo: "Terceirizado", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Lucas+Mendes&background=random&color=fff" },
    { id: "c35", nome: "Thaís Pereira", cargo: "Terceirizado", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Thais+Pereira&background=random&color=fff" },
    { id: "c36", nome: "Renato Góes", cargo: "Terceirizado", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Renato+Goes&background=random&color=fff" },
    { id: "c37", nome: "Fernanda Lima", cargo: "Comissionado", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Fernanda+Lima&background=random&color=fff" },
    { id: "c38", nome: "Diego Souza", cargo: "Comissionado", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Diego+Souza&background=random&color=fff" },
    { id: "c39", nome: "Bianca Castro", cargo: "Comissionado", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Bianca+Castro&background=random&color=fff" },
    { id: "c40", nome: "Dra. Camila Rocha", cargo: "Conselheiro", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Camila+Rocha&background=random&color=fff" },
    { id: "c41", nome: "Dr. Henrique Viana", cargo: "Conselheiro", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Henrique+Viana&background=random&color=fff" },
    { id: "c42", nome: "Dra. Alice Borges", cargo: "Conselheiro", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Alice+Borges&background=random&color=fff" },
    { id: "c43", nome: "Thiago Martins", cargo: "Funcionário", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Thiago+Martins&background=random&color=fff" },
    { id: "c44", nome: "Natália Ribeiro", cargo: "Funcionário", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Natalia+Ribeiro&background=random&color=fff" },
    { id: "c45", nome: "Gustavo Lima", cargo: "Funcionário", setor: "Comunicação", foto: "https://ui-avatars.com/api/?name=Gustavo+Lima&background=random&color=fff" },

    // === DLCC ===
    { id: "c46", nome: "Pedro Henrique", cargo: "Estagiário", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Pedro+Henrique&background=random&color=fff" },
    { id: "c47", nome: "Alice Farias", cargo: "Estagiário", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Alice+Farias&background=random&color=fff" },
    { id: "c48", nome: "Mateus Costa", cargo: "Estagiário", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Mateus+Costa&background=random&color=fff" },
    { id: "c49", nome: "Gabriela Nunes", cargo: "Terceirizado", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Gabriela+Nunes&background=random&color=fff" },
    { id: "c50", nome: "Rafael Almeida", cargo: "Terceirizado", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Rafael+Almeida&background=random&color=fff" },
    { id: "c51", nome: "Mariana Barros", cargo: "Terceirizado", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Mariana+Barros&background=random&color=fff" },
    { id: "c52", nome: "Rafael Gomes", cargo: "Comissionado", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Rafael+Gomes&background=random&color=fff" },
    { id: "c53", nome: "Carolina Mendes", cargo: "Comissionado", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Carolina+Mendes&background=random&color=fff" },
    { id: "c54", nome: "Fernando Souza", cargo: "Comissionado", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Fernando+Souza&background=random&color=fff" },
    { id: "c55", nome: "Dr. Bruno Castro", cargo: "Conselheiro", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Bruno+Castro&background=random&color=fff" },
    { id: "c56", nome: "Dra. Letícia Ramos", cargo: "Conselheiro", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Leticia+Ramos&background=random&color=fff" },
    { id: "c57", nome: "Dr. Tiago Silva", cargo: "Conselheiro", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Tiago+Silva&background=random&color=fff" },
    { id: "c58", nome: "Amanda Freitas", cargo: "Funcionário", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Amanda+Freitas&background=random&color=fff" },
    { id: "c59", nome: "Leandro Carvalho", cargo: "Funcionário", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Leandro+Carvalho&background=random&color=fff" },
    { id: "c60", nome: "Priscila Rocha", cargo: "Funcionário", setor: "DLCC", foto: "https://ui-avatars.com/api/?name=Priscila+Rocha&background=random&color=fff" },

    // === PROGER ===
    { id: "c61", nome: "Letícia Carvalho", cargo: "Estagiário", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Leticia+Carvalho&background=random&color=fff" },
    { id: "c62", nome: "Cauã Silva", cargo: "Estagiário", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Caua+Silva&background=random&color=fff" },
    { id: "c63", nome: "Isadora Martins", cargo: "Estagiário", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Isadora+Martins&background=random&color=fff" },
    { id: "c64", nome: "Diego Monteiro", cargo: "Terceirizado", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Diego+Monteiro&background=random&color=fff" },
    { id: "c65", nome: "Renata Alves", cargo: "Terceirizado", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Renata+Alves&background=random&color=fff" },
    { id: "c66", nome: "Samuel Costa", cargo: "Terceirizado", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Samuel+Costa&background=random&color=fff" },
    { id: "c67", nome: "Patrícia Santos", cargo: "Comissionado", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Patricia+Santos&background=random&color=fff" },
    { id: "c68", nome: "Vinícius Rocha", cargo: "Comissionado", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Vinicius+Rocha&background=random&color=fff" },
    { id: "c69", nome: "Tatiana Lima", cargo: "Comissionado", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Tatiana+Lima&background=random&color=fff" },
    { id: "c70", nome: "Dr. Marcelo Ferreira", cargo: "Conselheiro", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Marcelo+Ferreira&background=random&color=fff" },
    { id: "c71", nome: "Dra. Sandra Gomes", cargo: "Conselheiro", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Sandra+Gomes&background=random&color=fff" },
    { id: "c72", nome: "Dr. Roberto Nunes", cargo: "Conselheiro", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Roberto+Nunes&background=random&color=fff" },
    { id: "c73", nome: "Luciana Dias", cargo: "Funcionário", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Luciana+Dias&background=random&color=fff" },
    { id: "c74", nome: "Márcio Silva", cargo: "Funcionário", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Marcio+Silva&background=random&color=fff" },
    { id: "c75", nome: "Eliane Costa", cargo: "Funcionário", setor: "PROGER", foto: "https://ui-avatars.com/api/?name=Eliane+Costa&background=random&color=fff" }
];

let eleitorAtual = { nome: '', email: '' };
const ordemCargos = ["Estagiário", "Terceirizado", "Comissionado", "Conselheiro", "Funcionário"];
let etapaAtual = 0;

// Função auxiliar para procurar a foto do candidato pelo nome
function getFotoCandidato(nomeCand) {
    const cand = candidatosData.find(c => c.nome === nomeCand);
    return cand ? cand.foto : 'https://via.placeholder.com/90';
}

// LOGIN E VALIDAÇÃO NO SUPABASE
document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nomeDigitado = document.getElementById('nome-login').value.trim();
    const emailDigitado = document.getElementById('email-login').value.trim().toLowerCase();

    if (!emailDigitado.endsWith('@coren-pe.gov.br')) {
        alert("Por favor, utilize o seu e-mail institucional (@coren-pe.gov.br).");
        return;
    }

    const btnLogin = document.getElementById('btn-login');
    btnLogin.innerText = "Verificando...";
    btnLogin.disabled = true;

    try {
        // Verifica no banco de dados se este email já votou
        const url = `${supabaseUrl}/rest/v1/votos?email=eq.${encodeURIComponent(emailDigitado)}&select=*`;
        const resposta = await fetch(url, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        
        const dados = await resposta.json();

        if (dados && dados.length > 0) {
            // JÁ VOTOU - Mostrar ecrã de recibo apenas como leitura
            mostrarEcraRecibo(dados[0]);
        } else {
            // NÃO VOTOU - Iniciar votação
            eleitorAtual.nome = nomeDigitado;
            eleitorAtual.email = emailDigitado;
            
            // Atualiza os nomes exibidos na tela
            document.querySelectorAll('.nome-exibicao').forEach(el => el.innerText = nomeDigitado);
            
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('votacao-section').style.display = 'block';
        }
    } catch (erro) {
        alert("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
        btnLogin.innerText = "Entrar";
        btnLogin.disabled = false;
    }
});

// RENDERIZAR CARTÕES DE VOTAÇÃO
function renderizarCandidatos() {
    const container = document.getElementById('secoes-votacao');
    const agrupado = candidatosData.reduce((acc, candidato) => {
        if (!acc[candidato.cargo]) acc[candidato.cargo] = {};
        if (!acc[candidato.cargo][candidato.setor]) acc[candidato.cargo][candidato.setor] = [];
        acc[candidato.cargo][candidato.setor].push(candidato);
        return acc;
    }, {});

    let html = '';
    ordemCargos.forEach((cargo, index) => {
        html += `<div class="etapa-votacao" id="etapa-${index}" style="display: ${index === 0 ? 'block' : 'none'};">`;
        html += `
            <div class="cargo-header">
                <h2>${cargo} Destaque </h2>
                <p>Selecione <strong>apenas 1 candidato</strong> desta categoria.</p>
            </div>
        `;
        if (agrupado[cargo]) {
            for (const setor in agrupado[cargo]) {
                html += `<h3>${setor}</h3><div class="grid-candidatos">`;
                agrupado[cargo][setor].forEach(cand => {
                    const nameAttr = cargo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
                    html += `
                        <label>
                            <input type="radio" name="${nameAttr}" value="${cand.nome}">
                            <div class="card-candidato">
                                <img src="${cand.foto}" alt="${cand.nome}">
                                <p>${cand.nome}</p>
                            </div>
                        </label>
                    `;
                });
                html += `</div>`;
            }
        }
        html += `</div>`;
    });
    container.innerHTML = html;
    atualizarInterfaceNavegacao();
}
renderizarCandidatos();

// CONTROLE DA BARRA E BOTÕES WIZARD
function atualizarInterfaceNavegacao() {
    const progresso = ((etapaAtual + 1) / ordemCargos.length) * 100;
    document.getElementById('progresso-barra').style.width = `${progresso}%`;
    document.getElementById('progresso-texto').innerText = `Passo ${etapaAtual + 1} de ${ordemCargos.length}: ${ordemCargos[etapaAtual]}`;

    document.getElementById('btn-anterior').style.display = etapaAtual === 0 ? 'none' : 'block';
    
    if (etapaAtual === ordemCargos.length - 1) {
        document.getElementById('btn-proximo').style.display = 'none';
        document.getElementById('btn-revisar').style.display = 'block';
    } else {
        document.getElementById('btn-proximo').style.display = 'block';
        document.getElementById('btn-revisar').style.display = 'none';
    }
}

document.getElementById('btn-proximo').addEventListener('click', () => {
    const cargoAtual = ordemCargos[etapaAtual];
    const nameAttr = cargoAtual.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
    if (!document.querySelector(`input[name="${nameAttr}"]:checked`)) {
        alert(`Selecione quem receberá o seu voto para ${cargoAtual} antes de avançar.`); return;
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

// BOTÃO "REVISAR VOTOS" (Abre a tela de resumo antes de confirmar)
document.getElementById('btn-revisar').addEventListener('click', () => {
    const cargoAtual = ordemCargos[etapaAtual];
    const nameAttr = cargoAtual.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
    if (!document.querySelector(`input[name="${nameAttr}"]:checked`)) {
        alert("Selecione a sua última opção antes de revisar os votos."); return;
    }
    
    // Coleta as escolhas atuais
    const votos = {
        estagiario: document.querySelector('input[name="estagiario"]:checked').value,
        terceirizado: document.querySelector('input[name="terceirizado"]:checked').value,
        comissionado: document.querySelector('input[name="comissionado"]:checked').value,
        conselheiro: document.querySelector('input[name="conselheiro"]:checked').value,
        funcionario: document.querySelector('input[name="funcionario"]:checked').value
    };

    preencherListaResumo(votos);
    
    // Ocultar form, mostrar resumo interativo
    document.getElementById('votacao-section').style.display = 'none';
    document.getElementById('resumo-section').style.display = 'block';
    window.scrollTo(0, 0);
});

// BOTÃO "VOLTAR PARA EDIÇÃO"
document.getElementById('btn-voltar-edicao').addEventListener('click', () => {
    document.getElementById('resumo-section').style.display = 'none';
    document.getElementById('votacao-section').style.display = 'block';
});

// ENVIO FINAL DEFINITIVO
document.getElementById('btn-confirmar-final').addEventListener('click', async function() {
    const votosParaEnvio = {
        estagiario: document.querySelector('input[name="estagiario"]:checked').value,
        terceirizado: document.querySelector('input[name="terceirizado"]:checked').value,
        comissionado: document.querySelector('input[name="comissionado"]:checked').value,
        conselheiro: document.querySelector('input[name="conselheiro"]:checked').value,
        funcionario: document.querySelector('input[name="funcionario"]:checked').value
    };

    this.innerText = "Enviando...";
    this.disabled = true;
    document.getElementById('btn-voltar-edicao').style.display = 'none';

    try {
        const resposta = await fetch(`${supabaseUrl}/rest/v1/votos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
                nome_completo: eleitorAtual.nome,
                email: eleitorAtual.email,
                ...votosParaEnvio
            })
        });

        if (resposta.ok) {
            // Sucesso! Mostrar mensagem e bloquear alterações
            this.style.display = 'none';
            document.getElementById('header-resumo').innerHTML = `<h2>Comprovante de Votação</h2><p>Votos enviados por <strong>${eleitorAtual.email}</strong>.</p>`;
            document.getElementById('mensagem-sucesso').style.display = 'block';
        } else {
            alert("Erro: O seu E-mail já consta na base de dados.");
            this.innerText = "Confirmar e Enviar";
            this.disabled = false;
            document.getElementById('btn-voltar-edicao').style.display = 'block';
        }
    } catch (erro) {
        alert("Erro de comunicação com o servidor.");
        this.innerText = "Confirmar e Enviar";
        this.disabled = false;
        document.getElementById('btn-voltar-edicao').style.display = 'block';
    }
});

// FUNÇÃO PARA PREENCHER O HTML DO RESUMO (Usado tanto para revisar quanto para ver votos antigos)
function preencherListaResumo(votosDB) {
    const lista = document.getElementById('lista-resumo');
    lista.innerHTML = ''; // limpa

    ordemCargos.forEach(cargo => {
        const key = cargo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
        const nomeVotado = votosDB[key];
        const foto = getFotoCandidato(nomeVotado);

        lista.innerHTML += `
            <div class="resumo-card">
                <span class="cargo-label">${cargo}</span>
                <img src="${foto}" alt="${nomeVotado}">
                <span class="nome-label">${nomeVotado}</span>
            </div>
        `;
    });
}

// MOSTRAR TELA DE RECIBO PARA QUEM JÁ VOTOU (Modo Leitura)
function mostrarEcraRecibo(dadosDB) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('resumo-section').style.display = 'block';
    
    // Altera Textos
    document.getElementById('header-resumo').innerHTML = `
        <h2 style="color: #1a7f37;">Voto Já Registrado!</h2>
        <p>Identificamos que <strong>${dadosDB.nome_completo}</strong> (${dadosDB.email}) já participou da votação. Abaixo estão as suas escolhas:</p>
    `;
    
    // Esconde botões de edição/envio
    document.getElementById('botoes-resumo').style.display = 'none';
    document.getElementById('mensagem-sucesso').style.display = 'none';

    preencherListaResumo(dadosDB);
}