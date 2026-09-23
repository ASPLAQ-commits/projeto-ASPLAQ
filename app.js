// Substitua pelas suas chaves do Supabase
const supabaseUrl = 'https://cnptvjdzqfsqbdkrnbbe.supabase.co/rest/v1/';
const supabaseKey = 'sb_publishable_cCqmjnqgdSvOcKA6oyd28Q_4BpE1hQ6';

document.getElementById('form-votacao').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita que a página recarregue ao clicar em enviar

    // Captura os valores digitados
    const matricula = document.getElementById('matricula').value.trim();
    const estagiario = document.getElementById('estagiario').value.trim();
    const terceirizado = document.getElementById('terceirizado').value.trim();
    const comissionado = document.getElementById('comissionado').value.trim();
    const conselheiro = document.getElementById('conselheiro').value.trim();
    const funcionario = document.getElementById('funcionario').value.trim();

    // Envia os dados para a API do Supabase
    const resposta = await fetch(`${supabaseUrl}/rest/v1/votos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
            matricula: matricula,
            estagiario: estagiario,
            terceirizado: terceirizado,
            comissionado: comissionado,
            conselheiro: conselheiro,
            funcionario: funcionario
        })
    });

    if (resposta.ok) {
        alert("Seus votos foram registrados com sucesso!");
        document.getElementById('form-votacao').reset(); // Limpa o formulário
    } else {
        alert("Erro: Sua matrícula já registrou voto ou ocorreu uma falha na conexão.");
    }
});