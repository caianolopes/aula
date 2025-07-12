document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÕES ---
    // Defina sua senha de acesso aqui
    const SENHA_CORRETA = "caianolopes"; // Pode mudar esta senha para o que quiser

    // URL do seu túnel Cloudflare, que aponta para o seu PC com Ollama
    const OLLAMA_HOST = "https://outlined-cells-livestock-largest.trycloudflare.com";

    // Modelo do Ollama que você baixou e quer usar
    const OLLAMA_MODEL = "llama3:8b"; 

    // --- ELEMENTOS DA TELA DE SENHA ---
    const telaSenha = document.getElementById('tela-senha');
    const formSenha = document.getElementById('form-senha');
    const inputSenha = document.getElementById('input-senha');
    const erroSenha = document.getElementById('erro-senha');
    const appContainer = document.getElementById('app-container');

    // --- ELEMENTOS DA APLICAÇÃO PRINCIPAL ---
    const telaInicial = document.getElementById('tela-inicial');
    const telaPlano = document.getElementById('tela-plano');
    const formGerador = document.getElementById('form-gerador');
    const inputMateria = document.getElementById('materia');
    const inputAssunto = document.getElementById('assunto');
    const btnGerar = document.getElementById('btn-gerar');
    const btnText = document.querySelector('.btn-text');
    const loader = document.querySelector('.loader');
    const btnVoltar = document.getElementById('btn-voltar');
    const btnImprimir = document.getElementById('btn-imprimir');
    const conteudoGerado = document.getElementById('conteudo-gerado');
    const formBuscaImagens = document.getElementById('form-busca-imagens');
    const inputTermoBusca = document.getElementById('termo-busca');

    // --- LÓGICA DE SENHA ---
    formSenha.addEventListener('submit', (event) => {
        event.preventDefault();
        if (inputSenha.value === SENHA_CORRETA) {
            // Se a senha estiver correta, esconde a tela de senha e mostra o app
            telaSenha.classList.add('hidden');
            appContainer.classList.remove('hidden');
        } else {
            // Se incorreta, mostra a mensagem de erro
            erroSenha.classList.remove('hidden');
            inputSenha.value = '';
            inputSenha.focus();
        }
    });

    // --- LÓGICA PRINCIPAL DA APLICAÇÃO ---
    formGerador.addEventListener('submit', (event) => {
        event.preventDefault();
        const materia = inputMateria.value;
        const assunto = inputAssunto.value;
        gerarPlanoDeAula(materia, assunto);
    });

    async function gerarPlanoDeAula(materia, assunto) {
        // Lógica de cache para não sobrecarregar a IA local com pedidos repetidos
        const cacheKey = `plano-aula:${materia}-${assunto}`;
        const cachedResult = localStorage.getItem(cacheKey);
        if (cachedResult) {
            console.log("Resultado encontrado no cache do navegador! Exibindo sem chamar a API.");
            processarConteudo(cachedResult); // Usa o resultado salvo
            telaInicial.classList.add('hidden');
            telaPlano.classList.remove('hidden');
            return; // Encerra a função aqui
        }

        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        btnGerar.disabled = true;

        const prompt = `Crie um exercício de ${materia} para o ensino fundamental no Brasil sobre "${assunto}". O formato deve ser limpo e pronto para imprimir. Inclua o seguinte:
1.  Um cabeçalho simples com campos para "Escola:", "Data:", "Turma:" e "Aluno:".
2.  Um título chamativo para a atividade.
3.  Exercício 1: "Dê nomes aos desenhos.", com 4 espaços. Para cada espaço, insira um placeholder no formato [SUGESTÃO DE IMAGEM: descrição clara e simples da imagem].
4.  Exercício 2: "Escolha duas palavras que você escreveu acima e forme frases criativas usando o ponto de exclamação (!)." com 2 linhas para resposta.
5.  Exercício 3: "Siga o exemplo:", mostrando uma manipulação de palavras (como separação de sílabas ou troca de letras). Forneça um exemplo claro e mais 5 palavras para o aluno praticar.
Responda APENAS com o conteúdo da atividade, sem introduções ou comentários adicionais.`;

        try {
            // Chamada para a API LOCAL DO OLLAMA através do túnel Cloudflare
            const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    stream: false // Recebe a resposta completa de uma vez
                }),
            });

            if (!response.ok) {
                throw new Error(`Erro de rede ou do servidor Ollama: ${response.statusText}`);
            }

            const data = await response.json();
            const apiResponseText = data.message.content;

            // Salva o novo resultado no cache do navegador
            localStorage.setItem(cacheKey, apiResponseText);

            processarConteudo(apiResponseText);
            
            telaInicial.classList.add('hidden');
            telaPlano.classList.remove('hidden');

        } catch (error) {
            console.error("Erro ao conectar com o Ollama via Cloudflare:", error);
            alert(`Não foi possível conectar à IA local. Verifique se o Ollama e o Cloudflared Tunnel estão rodando no seu PC.\n\nDetalhe do erro: ${error.message}`);
        } finally {
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            btnGerar.disabled = false;
        }
    }
    
    function processarConteudo(texto) {
        let html = texto
            .replace(/\n/g, '<br>')
            .replace(/\[SUGESTÃO DE IMAGEM: (.*?)\]/g, (match, p1) => {
                return `<div class="placeholder-imagem" data-sugestao="${p1}">
                            <strong>Clique para adicionar imagem</strong>
                            <br>
                            <small>Sugestão: ${p1}</small>
                        </div>`;
            });
        conteudoGerado.innerHTML = html;
    }

    conteudoGerado.addEventListener('click', (event) => {
        const placeholder = event.target.closest('.placeholder-imagem');
        if (placeholder) {
            const imageUrl = prompt('Cole aqui o endereço (URL) da imagem:', placeholder.dataset.sugestao || '');
            if (imageUrl) {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = placeholder.dataset.sugestao;
                placeholder.replaceWith(img);
            }
        }
    });

    btnVoltar.addEventListener('click', () => {
        telaPlano.classList.add('hidden');
        telaInicial.classList.remove('hidden');
        conteudoGerado.innerHTML = '';
    });

    btnImprimir.addEventListener('click', () => {
        window.print();
    });

    formBuscaImagens.addEventListener('submit', (event) => {
        event.preventDefault();
        const termo = inputTermoBusca.value;
        if (termo) {
            const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(termo)}`;
            window.open(googleImagesUrl, '_blank');
        }
    });
});
