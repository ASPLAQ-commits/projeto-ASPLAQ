// ... (MANTENHA OS SEUS CONSTANTES supabaseUrl e supabaseKey E A SUA LISTA candidatosData AQUI NO TOPO!) ...

let eleitorAtual = { nome: '', cpf: '' };
const ordemCargos = ["Estagiário", "Terceirizado", "Comissionado", "Conselheiro", "Funcionário"];
let etapaAtual = 0;

// Máscara do CPF
document.getElementById('cpf-login').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = value;
});

// Login
document.getElementById('form-login').addEventListener('submit', function(e) {
    e.preventDefault();
    const cpfDigitado = document.getElementById('cpf-login').value.replace(/\D/g, '');
    const nomeDigitado = document.getElementById('nome-login').value.trim();

    if (cpfDigitado.length !== 11) {
        alert("Por favor, insira um CPF válido com 11 dígitos.");
        return;
    }

    eleitorAtual.nome = nomeDigitado;
    eleitorAtual.cpf = cpfDigitado;
    document.getElementById('nome-exibicao').innerText = nomeDigitado;
    
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('votacao-section').style.display = 'block';
});

// Função para Limitar a 3 seleções
window.limitarSelecao = function(checkbox) {
    const nomeAtributo = checkbox.name;
    const selecionados = document.querySelectorAll(`input[name="${nomeAtributo}"]:checked`);
    
    if (selecionados.length > 3) {
        checkbox.checked = false; // Desmarca o 4º clique
        alert("Pode selecionar no máximo 3 candidatos por categoria.");
    }
};

// Agrupar e Renderizar os candidatos em "Páginas"
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
                <h2>Melhor ${cargo}</h2>
                <p>Selecione <strong>até 3 candidatos</strong> desta categoria (pode ser de setores diferentes).</p>
            </div>
        `;

        if (agrupado[cargo]) {
            for (const setor in agrupado[cargo]) {
                html += `<h3>${setor}</h3>`;
                html += `<div class="grid-candidatos">`;
                
                agrupado[cargo][setor].forEach(cand => {
                    const nameAttr = cargo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
                    html += `
                        <label>
                            <!-- Mudou de type="radio" para type="checkbox" -->
                            <input type="checkbox" name="${nameAttr}" value="${cand.nome}" onchange="limitarSelecao(this)">
                            <div class="card-candidato">
                                <img src="${cand.foto}" alt="${cand.nome}">
                                <p>${cand.nome}</p>
                            </div>
                        </label>
                    `;
                });
                
                html += `</div>`;
            }
        } else {
            html += `<p style="text-align:center; color:#999;">Nenhum candidato cadastrado para este cargo.</p>`;
        }
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
    atualizarInterfaceNavegacao();
}

renderizarCandidatos();

// Atualiza botões e barra de progresso
function atualizarInterfaceNavegacao() {
    const progresso = ((etapaAtual + 1) / ordemCargos.length) * 100;
    document.getElementById('progresso-barra').style.width = `${progresso}%`;
    document.getElementById('progresso-texto').innerText = `Passo ${etapaAtual + 1} de ${ordemCargos.length}: ${ordemCargos[etapaAtual]}`;

    document.getElementById('btn-anterior').style.display = etapaAtual === 0 ? 'none' : 'block';
    
    if (etapaAtual === ordemCargos.length - 1) {
        document.getElementById('btn-proximo').style.display = 'none';
        document.getElementById('btn-confirmar').style.display = 'block';
    } else {
        document.getElementById('btn-proximo').style.display = 'block';
        document.getElementById('btn-confirmar').style.display = 'none';
    }
}

// Botão "Avançar"
document.getElementById('btn-proximo').addEventListener('click', () => {
    // Validação: Exigir pelo menos 1 candidato selecionado
    const cargoAtual = ordemCargos[etapaAtual];
    const nameAttr = cargoAtual.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
    const selecionados = document.querySelectorAll(`input[name="${nameAttr}"]:checked`);
    
    if (selecionados.length === 0) {
        alert(`Por favor, selecione pelo menos 1 candidato para ${cargoAtual} antes de avançar.`);
        return;
    }

    document.getElementById(`etapa-${etapaAtual}`).style.display = 'none';
    etapaAtual++;
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'block';
    
    atualizarInterfaceNavegacao();
    window.scrollTo(0, 0); 
});

// Botão "Voltar"
document.getElementById('btn-anterior').addEventListener('click', () => {
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'none';
    etapaAtual--;
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'block';
    
    atualizarInterfaceNavegacao();
    window.scrollTo(0, 0);
});

// Função Auxiliar para agrupar as escolhas
function getValoresSelecionados(nameAttr) {
    const selecionados = document.querySelectorAll(`input[name="${nameAttr}"]:checked`);
    // Extrai o nome de cada opção selecionada e une com vírgulas
    return Array.from(selecionados).map(el => el.value).join(", ") || null;
}

// Envio Final para o Supabase
document.getElementById('form-votacao').addEventListener('submit', async function(event) {
    event.preventDefault();

    const cargoAtual = ordemCargos[etapaAtual];
    const nameAttr = cargoAtual.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
    if (document.querySelectorAll(`input[name="${nameAttr}"]:checked`).length === 0) {
        alert("Selecione a sua última opção antes de finalizar.");
        return;
    }

    // Coleta todos os votos múltiplos
    const botoesClicados = {
        estagiario: getValoresSelecionados("estagiario"),
        terceirizado: getValoresSelecionados("terceirizado"),
        comissionado: getValoresSelecionados("comissionado"),
        conselheiro: getValoresSelecionados("conselheiro"),
        funcionario: getValoresSelecionados("funcionario")
    };

    const btnConfirmar = document.getElementById('btn-confirmar');
    btnConfirmar.innerText = "A enviar os votos...";
    btnConfirmar.disabled = true;

    try {
        const resposta = await fetch(`${supabaseUrl}/rest/v1/votos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                nome_completo: eleitorAtual.nome,
                cpf: eleitorAtual.cpf,
                ...botoesClicados
            })
        });

        if (resposta.ok) {
            alert("Votação concluída! Os seus votos foram registados com sucesso.");
            window.location.reload(); 
        } else {
            alert("Falha no registo: O seu CPF já consta na base de dados de votação.");
            btnConfirmar.innerText = "Finalizar e Enviar Votos";
            btnConfirmar.disabled = false;
        }
    } catch (erro) {
        console.error("Falha de comunicação:", erro);
        alert("Erro de comunicação com o servidor.");
        btnConfirmar.innerText = "Finalizar e Enviar Votos";
        btnConfirmar.disabled = false;
    }
});