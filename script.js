// ==========================================
// 1. CONFIGURAÇÃO DO SUPABASE
// ==========================================
const supabaseUrl = 'https://cnptvjdzqfsqbdkrnbbe.supabase.co';
const supabaseKey = 'sb_publishable_cCqmjnqgdSvOcKA6oyd28Q_4BpE1hQ6';
const clienteSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Variável global para guardar o e-mail verificado
window.emailUsuarioValido = "";

// ==========================================
// 2. FUNÇÃO DE LOGIN E VALIDAÇÃO
// ==========================================
async function validarAcesso() {
    const emailInput = document.getElementById('input-email').value.trim().toLowerCase();
    const msgErro = document.getElementById('msg-erro');
    const btnEntrar = document.getElementById('btn-entrar');

    // Esconde mensagem de erro anterior
    if(msgErro) msgErro.style.display = 'none';

    // Verifica se digitou algo
    if (!emailInput || !emailInput.includes('@coren-pe.gov.br')) {
        mostrarErro("Por favor, insira um e-mail válido do COREN-PE.");
        return;
    }

    // Altera o botão para mostrar que está a carregar
    btnEntrar.innerText = "Validando dados...";
    btnEntrar.disabled = true;

    try {
        // Passo A: Limpa rigorosamente o e-mail e busca no banco ignorando maiúsculas/minúsculas
        const emailLimpo = emailInput.trim().toLowerCase();

        const { data: colaborador, error: erroColab } = await clienteSupabase
            .from('colaboradores')
            .select('*')
            .ilike('email', emailLimpo)
            .maybeSingle();

        if (erroColab) {
            console.error("Erro Supabase:", erroColab);
        }

        if (!colaborador) {
            mostrarErro("E-mail não localizado na base do COREN-PE. Verifique se digitou corretamente.");
            btnEntrar.innerText = "Acessar Urna";
            btnEntrar.disabled = false;
            return;
        }

        // Passo B: Verifica se este e-mail já registou um voto
        const { data: voto, error: erroVoto } = await clienteSupabase
            .from('votos')
            .select('email')
            .eq('email', emailLimpo)
            .maybeSingle();

        if (voto) {
            mostrarErro("Acesso negado: Este e-mail já registou um voto no sistema.");
            btnEntrar.innerText = "Acessar Urna";
            btnEntrar.disabled = false;
            return;
        }

        // Passo C: Se tudo estiver certo, liberta a urna!
        window.emailUsuarioValido = emailLimpo; 
        
        document.getElementById('tela-login').style.display = 'none';
        document.getElementById('tela-urna').style.display = 'block';
        
        // Exibe os dados personalizados vindos da planilha
        document.getElementById('saudacao-usuario').innerText = `Olá, ${colaborador.nome}!`;
        document.getElementById('cargo-usuario').innerText = `Setor: ${colaborador.setor} | Cargo: ${colaborador.cargo}`;
        
    } catch (err) {
        mostrarErro("Erro de conexão com o servidor. Tente novamente.");
        console.error(err);
        btnEntrar.innerText = "Acessar Urna";
        btnEntrar.disabled = false;
    }
}

// Função auxiliar para exibir o erro no ecrã
function mostrarErro(mensagem) {
    const msgErro = document.getElementById('msg-erro');
    if(msgErro) {
        msgErro.innerText = mensagem;
        msgErro.style.display = 'block';
    } else {
        alert(mensagem);
    }
}

// ==========================================
// 3. FUNÇÃO DE ENVIAR O VOTO PARA O BANCO
// ==========================================
async function enviarVoto(event) {
    event.preventDefault(); 
    const btnVotar = document.getElementById('btn-votar');

    // Pega todos os dados do formulário
    const form = document.getElementById('form-voto');
    const formData = new FormData(form);
    
    // Monta o objeto com os votos
    const dadosVoto = {
        email: window.emailUsuarioValido,
        voto_asplaq: formData.get('voto_asplaq'),
        voto_ti: formData.get('voto_ti')
        // Adicione aqui os outros setores quando os criar no HTML
    };

    // Altera o botão
    btnVotar.innerText = "Registrando voto...";
    btnVotar.disabled = true;

    try {
        // Envia para a tabela 'votos' no Supabase
        const { error } = await clienteSupabase
            .from('votos')
            .insert([dadosVoto]);

        if (error) throw error;

        // Sucesso!
        alert("Voto registado com sucesso! Obrigado pela participação.");
        
        // Recarrega a página para voltar ao Início
        window.location.reload();
        
    } catch (err) {
        alert("Erro ao registar voto. Verifique a sua ligação.");
        console.error(err);
        btnVotar.innerText = "Confirmar Meu Voto";
        btnVotar.disabled = false;
    }
}