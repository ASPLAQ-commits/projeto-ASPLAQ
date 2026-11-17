const supabaseUrl = 'https://cnptvjdzqfsqbdkrnbbe.supabase.co';
const supabaseKey = 'sb_publishable_cCqmjnqgdSvOcKA6oyd28Q_4BpE1hQ6';

// LOGIN DO ADMINISTRADOR
document.getElementById('form-admin-login').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim().toLowerCase();
    const senha = document.getElementById('admin-senha').value;
    const btnLogin = document.getElementById('btn-admin-login');

    btnLogin.innerText = "Autenticando...";
    btnLogin.disabled = true;

    try {
        // Procura o administrador no Supabase
        const url = `${supabaseUrl}/rest/v1/admin_users?email=eq.${encodeURIComponent(email)}&select=*`;
        const resposta = await fetch(url, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const admins = await resposta.json();

        if (admins.length > 0 && admins[0].senha === senha) {
            // Login com sucesso!
            document.getElementById('admin-login-section').style.display = 'none';
            document.getElementById('admin-dashboard-section').style.display = 'block';
            carregarApuracao(); // Inicia a contagem de votos
        } else {
            alert("Acesso negado. E-mail ou senha de administrador incorretos.");
            btnLogin.innerText = "Acessar Apuração";
            btnLogin.disabled = false;
        }
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
        btnLogin.innerText = "Acessar Apuração";
        btnLogin.disabled = false;
    }
});

// FUNÇÃO PARA BUSCAR VOTOS E CALCULAR RESULTADOS
async function carregarApuracao() {
    const btnAtualizar = document.getElementById('btn-atualizar');
    btnAtualizar.innerText = "Atualizando...";

    try {
        // Baixa todos os votos
        const url = `${supabaseUrl}/rest/v1/votos?select=*`;
        const resposta = await fetch(url, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const votos = await resposta.json();

        document.getElementById('total-votos').innerText = votos.length;
        
        // Estrutura para contar os votos
        const contagem = {
            estagiario: {},
            terceirizado: {},
            comissionado: {},
            conselheiro: {},
            funcionario: {}
        };

        // Percorre todos os votos e soma
        votos.forEach(voto => {
            if (voto.estagiario) { contagem.estagiario[voto.estagiario] = (contagem.estagiario[voto.estagiario] || 0) + 1; }
            if (voto.terceirizado) { contagem.terceirizado[voto.terceirizado] = (contagem.terceirizado[voto.terceirizado] || 0) + 1; }
            if (voto.comissionado) { contagem.comissionado[voto.comissionado] = (contagem.comissionado[voto.comissionado] || 0) + 1; }
            if (voto.conselheiro) { contagem.conselheiro[voto.conselheiro] = (contagem.conselheiro[voto.conselheiro] || 0) + 1; }
            if (voto.funcionario) { contagem.funcionario[voto.funcionario] = (contagem.funcionario[voto.funcionario] || 0) + 1; }
        });

        renderizarResultados(contagem);

    } catch (erro) {
        alert("Erro ao buscar a apuração dos votos.");
    } finally {
        btnAtualizar.innerText = "🔄 Atualizar Resultados";
    }
}

// FUNÇÃO PARA GERAR O HTML COM OS VENCEDORES
function renderizarResultados(contagem) {
    const container = document.getElementById('apuracao-resultados');
    container.innerHTML = ''; // Limpa antes de renderizar
    
    const categorias = [
        { chave: 'estagiario', titulo: 'Estagiário' },
        { chave: 'terceirizado', titulo: 'Terceirizado' },
        { chave: 'comissionado', titulo: 'Comissionado' },
        { chave: 'conselheiro', titulo: 'Conselheiro' },
        { chave: 'funcionario', titulo: 'Funcionário' }
    ];

    categorias.forEach(cat => {
        // Transforma o objeto de contagem num Array e ordena do maior para o menor
        const ranking = Object.entries(contagem[cat.chave])
            .map(([nome, total]) => ({ nome, total }))
            .sort((a, b) => b.total - a.total); // Ordenação Decrescente

        let html = `
            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
                <h3 style="color: var(--primary-color); border-bottom: 2px solid var(--gold-color); padding-bottom: 10px; margin-top:0;">
                    Melhor ${cat.titulo}
                </h3>
        `;

        if (ranking.length === 0) {
            html += `<p style="color: #999;">Nenhum voto registrado ainda.</p>`;
        } else {
            html += `<ul style="list-style: none; padding: 0;">`;
            ranking.forEach((cand, index) => {
                // Destacar o primeiro lugar
                const isPrimeiro = index === 0;
                const estiloLinha = isPrimeiro ? 'font-weight: bold; font-size: 16px; color: var(--text-dark); background: var(--gold-light); padding: 8px; border-radius: 4px;' : 'font-size: 14px; color: var(--text-muted); padding: 4px 8px; border-bottom: 1px solid #eee;';
                const medalha = isPrimeiro ? '🏆 ' : `${index + 1}º - `;
                
                html += `
                    <li style="display: flex; justify-content: space-between; margin-bottom: 5px; ${estiloLinha}">
                        <span>${medalha}${cand.nome}</span>
                        <span>${cand.total} voto(s)</span>
                    </li>
                `;
            });
            html += `</ul>`;
        }
        
        html += `</div>`;
        container.innerHTML += html;
    });
}

// Botão de atualizar manualmente
document.getElementById('btn-atualizar').addEventListener('click', carregarApuracao);