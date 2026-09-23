const supabaseUrl = 'https://cnptvjdzqfsqbdkrnbbe.supabase.co';
const supabaseKey = 'sb_publishable_cCqmjnqgdSvOcKA6oyd28Q_4BpE1hQ6';

// Dados de exemplo com os 6 candidatos solicitados
const candidatosData = [
    { id: "c1", nome: "Luiz Gabriel Sarmento Pereira", cargo: "Estagiário", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Luiz+Gabriel&background=random&color=fff" },
    { id: "c2", nome: "Paulo Barroca", cargo: "Estagiário", setor: "Tecnologia da Informação", foto: "https://ui-avatars.com/api/?name=Paulo+Barroca&background=random&color=fff" },
    { id: "c3", nome: "Maria Silva", cargo: "Terceirizado", setor: "Serviços Gerais", foto: "https://ui-avatars.com/api/?name=Maria+Silva&background=random&color=fff" },
    { id: "c4", nome: "Carlos Mendes", cargo: "Comissionado", setor: "Assessoria de Comunicação", foto: "https://ui-avatars.com/api/?name=Carlos+Mendes&background=random&color=fff" },
    { id: "c5", nome: "Dra. Ana Sousa", cargo: "Conselheiro", setor: "Câmara Técnica", foto: "https://ui-avatars.com/api/?name=Ana+Sousa&background=random&color=fff" },
    { id: "c6", nome: "João Pedro", cargo: "Funcionário", setor: "Fiscalização", foto: "https://ui-avatars.com/api/?name=Joao+Pedro&background=random&color=fff" }
];

let eleitorAtual = { nome: '', cpf: '' };

// Máscara para o campo de CPF (formata automaticamente enquanto digita)
document.getElementById('cpf-login').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo o que não for número
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = value;
});

// Lógica de Login e Validação Prévia
document.getElementById('form-login').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const cpfDigitado = document.getElementById('cpf-login').value.replace(/\D/g, '');
    const nomeDigitado = document.getElementById('nome-login').value.trim();

    if (cpfDigitado.length !== 11) {
        alert("Por favor, insira um CPF válido com 11 dígitos.");
        return;
    }

    // Armazena os dados do eleitor em memória para o envio posterior
    eleitorAtual.nome = nomeDigitado;
    eleitorAtual.cpf = cpfDigitado;

    // Transição de ecrã
    document.getElementById('nome-exibicao').innerText = nomeDigitado;
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('votacao-section').style.display = 'block';
});

// Renderização dos cartões (mantida da versão anterior)
function renderizarCandidatos() {
    const container = document.getElementById('secoes-votacao');
    const agrupado = candidatosData.reduce((acc, candidato) => {
        if (!acc[candidato.cargo]) acc[candidato.cargo] = {};
        if (!acc[candidato.cargo][candidato.setor]) acc[candidato.cargo][candidato.setor] = [];
        acc[candidato.cargo][candidato.setor].push(candidato);
        return acc;
    }, {});

    let html = '';
    for (const cargo in agrupado) {
        html += `<h2>${cargo}</h2>`;
        for (const setor in agrupado[cargo]) {
            html += `<h3>${setor}</h3>`;
            html += `<div class="grid-candidatos">`;
            agrupado[cargo][setor].forEach(cand => {
                const nameAttr = cargo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
                html += `
                    <label>
                        <input type="radio" name="${nameAttr}" value="${cand.nome}" required>
                        <div class="card-candidato">
                            <img src="${cand.foto}" alt="Foto de ${cand.nome}">
                            <p>${cand.nome}</p>
                        </div>
                    </label>
                `;
            });
            html += `</div>`;
        }
    }
    container.innerHTML = html;
}

renderizarCandidatos();

// Envio dos Votos ao Supabase
document.getElementById('form-votacao').addEventListener('submit', async function(event) {
    event.preventDefault();

    const votoEstagiario = document.querySelector('input[name="estagiario"]:checked')?.value || null;
    const votoTerceirizado = document.querySelector('input[name="terceirizado"]:checked')?.value || null;
    const votoComissionado = document.querySelector('input[name="comissionado"]:checked')?.value || null;
    const votoConselheiro = document.querySelector('input[name="conselheiro"]:checked')?.value || null;
    const votoFuncionario = document.querySelector('input[name="funcionario"]:checked')?.value || null;

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
                estagiario: votoEstagiario,
                terceirizado: votoTerceirizado,
                comissionado: votoComissionado,
                conselheiro: votoConselheiro,
                funcionario: votoFuncionario
            })
        });

        if (resposta.ok) {
            alert("Os seus votos foram registados com sucesso!");
            window.location.reload(); // Recarrega a página para voltar ao ecrã inicial
        } else {
            alert("Falha no registo: Este CPF já foi utilizado na votação.");
        }
    } catch (erro) {
        console.error("Falha de comunicação:", erro);
        alert("Erro de comunicação com o servidor.");
    }
});