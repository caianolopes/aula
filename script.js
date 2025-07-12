document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos da página
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

    // Evento para o formulário principal que gera a atividade
    formGerador.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const materia = inputMateria.value;
        const assunto = inputAssunto.value;

        gerarPlanoDeAula(materia, assunto);
    });

    // Função que simula a chamada à API e processa o resultado
    async function gerarPlanoDeAula(materia, assunto) {
        // Mostra o loader e desabilita o botão
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        btnGerar.disabled = true;

        try {
            // =================================================================
            // PARTE A IMPLEMENTAR COM A API REAL
            // Aqui você faria a chamada para o seu backend que, por sua vez,
            // chamaria a API do Gemini com o prompt.
            // Exemplo:
            // const response = await fetch('URL_DO_SEU_BACKEND', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ materia, assunto })
            // });
            // const apiResponseText = await response.text();
            // =================================================================
            
            // MOCKUP: Simulação de uma resposta da API Gemini
            const apiResponseText = await callGeminiAPI_mock(materia, assunto);

            // Processa a resposta e exibe na tela
            processarConteudo(apiResponseText);
            
            // Troca para a tela do plano de aula
            telaInicial.classList.add('hidden');
            telaPlano.classList.remove('hidden');

        } catch (error) {
            console.error("Erro ao gerar plano de aula:", error);
            alert("Ocorreu um erro ao gerar a atividade. Tente novamente.");
        } finally {
            // Esconde o loader e reabilita o botão
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            btnGerar.disabled = false;
        }
    }

    // Função que formata o texto da API e insere na página
    function processarConteudo(texto) {
        // Converte quebras de linha em <br> e placeholders em divs clicáveis
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

    // Adiciona evento de clique para os placeholders de imagem (usando delegação de evento)
    conteudoGerado.addEventListener('click', (event) => {
        if (event.target.classList.contains('placeholder-imagem') || event.target.parentElement.classList.contains('placeholder-imagem')) {
            const placeholder = event.target.closest('.placeholder-imagem');
            const imageUrl = prompt('Cole aqui o endereço (URL) da imagem:');
            
            if (imageUrl) {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = placeholder.dataset.sugestao; // Usa a sugestão como texto alternativo
                placeholder.replaceWith(img);
            }
        }
    });

    // Evento para o botão de voltar
    btnVoltar.addEventListener('click', () => {
        telaPlano.classList.add('hidden');
        telaInicial.classList.remove('hidden');
        conteudoGerado.innerHTML = ''; // Limpa o conteúdo anterior
    });

    // Evento para o botão de imprimir
    btnImprimir.addEventListener('click', () => {
        window.print();
    });

    // Evento para o formulário de busca de imagens
    formBuscaImagens.addEventListener('submit', (event) => {
        event.preventDefault();
        const termo = inputTermoBusca.value;
        if (termo) {
            const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(termo)}`;
            window.open(googleImagesUrl, '_blank');
        }
    });

    // Função MOCK que simula a chamada à API do Gemini
    function callGeminiAPI_mock(materia, assunto) {
        console.log(`Simulando chamada à API para: Matéria="${materia}", Assunto="${assunto}"`);
        
        const promptExemplo = `Crie um exercício de ${materia} para o ensino fundamental sobre "${assunto}", no mesmo estilo da imagem de exemplo fornecida. Inclua:
1.  Um cabeçalho para Escola, Data, Turma e Aluno.
2.  Um título como "Mostre que você sabe...".
3.  Exercício 1: "Dê nomes aos desenhos", com 4 espaços para imagens. Use o placeholder [SUGESTÃO DE IMAGEM: descrição da imagem].
4.  Exercício 2: "Escolha duas palavras que você escreveu acima e forme frases com elas. Use o ponto de exclamação (!)." com 2 linhas.
5.  Exercício 3: "Siga o exemplo", mostrando a separação de sílabas ou manipulação de palavras. Forneça um exemplo e mais 5 palavras.`;
        
        console.log("Prompt que seria enviado para a API:\n", promptExemplo);
        
        // Simula o atraso de uma chamada de rede
        return new Promise(resolve => {
            setTimeout(() => {
                const respostaSimulada = `Escola: ____________________________________
Data: ____/____/______ Turma: _______________
Aluno: _____________________________________

<hr>

<h3>Mostre que você sabe...</h3>

<h4>1) Dê nomes aos desenhos.</h4>

[SUGESTÃO DE IMAGEM: um casaco de frio]
___________________

[SUGESTÃO DE IMAGEM: uma flor bonita]
___________________

[SUGESTÃO DE IMAGEM: um globo terrestre]
___________________

[SUGESTÃO DE IMAGEM: uma flauta]
___________________


<h4>2) Escolha duas palavras que você escreveu acima e forme frases com elas. Use o ponto de exclamação (!).</h4>

_________________________________________________________________

_________________________________________________________________


<h4>3) Siga o exemplo:</h4>

<strong>foco</strong> → <strong>floco</strong> → flo - co
<strong>for</strong> → ___________ → ___________
<strong>fecha</strong> → ___________ → ___________
<strong>paca</strong> → ___________ → ___________
<strong>cara</strong> → ___________ → ___________
<strong>coro</strong> → ___________ → ___________
`;
                resolve(respostaSimulada);
            }, 1500); // 1.5 segundos de atraso
        });
    }
});