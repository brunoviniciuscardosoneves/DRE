const razonetes = {};
let lastEntry = null;

document.getElementById('razoneteForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const tipo = document.getElementById('tipo').value;
    const lancamento = document.getElementById('lancamento').value;
    const valor = parseFloat(document.getElementById('valor').value);

    // Inicializa o razonete se não existir
    if (!razonetes[tipo]) {
        razonetes[tipo] = { lancamentos: [], credito: 0, debito: 0 };
    }

    // Adiciona o valor ao array de lançamentos e ao crédito ou débito
    razonetes[tipo].lancamentos.push({ tipo: lancamento, valor: valor });

    if (lancamento === 'credito') {
        razonetes[tipo].credito += valor;
    } else {
        razonetes[tipo].debito += valor;
    }

    // Armazena o último lançamento para desfazer
    lastEntry = { tipo, lancamento, valor };

    // Atualiza a interface
    atualizarRazonetes();
    atualizarBalancetes();
    atualizarDemonstracao();

    // Limpa o campo valor
    document.getElementById('valor').value = '';
});

// Função para desfazer o último lançamento
document.getElementById('undoButton').addEventListener('click', function() {
    if (lastEntry) {
        const { tipo, lancamento, valor } = lastEntry;

        // Remove o último lançamento
        const index = razonetes[tipo].lancamentos.findIndex(l => l.tipo === lancamento && l.valor === valor);
        if (index !== -1) {
            razonetes[tipo].lancamentos.splice(index, 1);
            if (lancamento === 'credito') {
                razonetes[tipo].credito -= valor;
            } else {
                razonetes[tipo].debito -= valor;
            }
        }
        lastEntry = null; // Limpa o último lançamento

        // Atualiza a interface
        atualizarRazonetes();
        atualizarBalancetes();
        atualizarDemonstracao();
    }
});

function atualizarRazonetes() {
    const container = document.getElementById('razonetesContainer');
    container.innerHTML = ''; // Limpa o container

    for (const tipo in razonetes) {
        const credito = razonetes[tipo].credito;
        const debito = razonetes[tipo].debito;
        const saldo = Math.abs(credito - debito);
        const tipoSaldo = credito >= debito ? `C ${saldo}` : `D ${saldo}`;

        const razoneteCard = document.createElement('div');
        razoneteCard.className = 'razoneteCard';
        razoneteCard.innerHTML = `\
            <h3>${tipo}</h3>\
            <p>Créditos:</p>\
            <ul>${razonetes[tipo].lancamentos.filter(l => l.tipo === 'credito').map(l => `<li>${l.valor.toFixed(2)}</li>`).join('')}</ul>\
            <p>Débitos:</p>\
            <ul>${razonetes[tipo].lancamentos.filter(l => l.tipo === 'debito').map(l => `<li>${l.valor.toFixed(2)}</li>`).join('')}</ul>\
            <p>Saldo: ${tipoSaldo}</p>\
        `;

        container.appendChild(razoneteCard);
    }
}

function atualizarBalancetes() {
    const balancetesBody = document.getElementById('balancetesBody');
    balancetesBody.innerHTML = ''; // Limpa o corpo da tabela

    let totalSaldo = 0;
    let totalCredito = 0;
    let totalDebito = 0;

    for (const tipo in razonetes) {
        const credito = razonetes[tipo].credito;
        const debito = razonetes[tipo].debito;
        const saldo = credito >= debito ? credito - debito : debito - credito;

        const row = document.createElement('tr');
        row.innerHTML = `\
            <td>${tipo}</td>\
            <td>${saldo.toFixed(2)}</td>\
            <td>${debito > credito ? saldo.toFixed(2) : '0.00'}</td> <!-- Saldo de Débito -->\
            <td>${credito >= debito ? saldo.toFixed(2) : '0.00'}</td> <!-- Saldo de Crédito -->\
        `;
        balancetesBody.appendChild(row);

        // Acumula os totais somente para valores visíveis na tabela
        if (saldo > 0) {
            totalSaldo += saldo;
            totalCredito += credito >= debito ? saldo : 0;
            totalDebito += debito > credito ? saldo : 0;
        }
    }

    document.getElementById('totalSaldo').innerText = totalSaldo.toFixed(2);
    document.getElementById('totalDebito').innerText = totalDebito.toFixed(2);
    document.getElementById('totalCredito').innerText = totalCredito.toFixed(2);
}

function atualizarDemonstracao() {
    const receitaBruta = razonetes['Receita de Vendas'] ? razonetes['Receita de Vendas'].credito : 0;
    const deducoes = parseFloat(document.getElementById('deducoesReceitaBruta').value) || 0;
    const custoMercadorias = parseFloat(document.getElementById('custoMercadoriasVendidas').value) || 0;
    const despesasOperacionais = parseFloat(document.getElementById('despesasOperacionais').value) || 0;
    const despesasAdministrativas = parseFloat(document.getElementById('despesasAdministrativas').value) || 0;
    const despesasFinanceiras = parseFloat(document.getElementById('despesasFinanceiras').value) || 0;
    const receitasFinanceiras = parseFloat(document.getElementById('receitasFinanceiras').value) || 0;
    
    const receitaLiquida = receitaBruta - deducoes;
    const resultadoOperacionalBruto = receitaLiquida - custoMercadorias;
    
    document.getElementById('receitaOperacionalBruta').innerText = receitaBruta.toFixed(2);
    document.getElementById('receitaOperacionalLiquida').innerText = resultadoOperacionalBruto.toFixed(2);
    document.getElementById('resultadoOperacionalBruto').innerText = resultadoOperacionalBruto.toFixed(2);
    
    const resultadoAntesIR = resultadoOperacionalBruto - (despesasOperacionais + despesasAdministrativas + despesasFinanceiras) + receitasFinanceiras;
    document.getElementById('resultadoOperacionalAntesIR').innerText = resultadoAntesIR.toFixed(2);

    // Atualiza os valores dos impostos, lucro líquido e debêntures
    atualizarValoresImpostos();
    atualizarLucroLiquido();
    atualizarDebenturesParticipacoes();
}

function atualizarValoresImpostos() {
    const resultadoAntesIR = parseFloat(document.getElementById('resultadoOperacionalAntesIR').innerText) || 0;
    const porcentagemIR = parseFloat(document.getElementById('porcentagemIR').value) || 0;
    const porcentagemCSLL = parseFloat(document.getElementById('porcentagemCSLL').value) || 0;

    const valorIR = resultadoAntesIR * (porcentagemIR / 100);
    const valorCSLL = resultadoAntesIR * (porcentagemCSLL / 100);

    document.getElementById('valorIR').innerText = valorIR.toFixed(2);
    document.getElementById('valorCSLL').innerText = valorCSLL.toFixed(2);
}

function atualizarLucroLiquido() {
    const resultadoAntesIR = parseFloat(document.getElementById('resultadoOperacionalAntesIR').innerText) || 0;
    const valorIR = parseFloat(document.getElementById('valorIR').innerText) || 0;
    const valorCSLL = parseFloat(document.getElementById('valorCSLL').innerText) || 0;

    const lucroLiquido = resultadoAntesIR - (valorIR + valorCSLL);
    document.getElementById('lucroLiquido').innerText = lucroLiquido.toFixed(2);
}

function atualizarDebenturesParticipacoes() {
    const lucroLiquido = parseFloat(document.getElementById('lucroLiquido').innerText) || 0;
    const porcentagemDebentures = parseFloat(document.getElementById('porcentagemDebentures').value) || 0;

    const valorDebentures = lucroLiquido * (porcentagemDebentures / 100);
    document.getElementById('valorDebentures').innerText = valorDebentures.toFixed(2);
}
function atualizarParticipacoes() {
    const lucroLiquido = parseFloat(document.getElementById('lucroLiquido').innerText) || 0;
    const participacoesPercent = parseFloat(document.getElementById('participacoes').value) || 0;

    // Calcula o valor das participações
    const valorParticipacoes = (lucroLiquido * participacoesPercent) / 100;

    // Atualiza o valor exibido na tabela
    document.getElementById('valorParticipacoes').innerText = valorParticipacoes.toFixed(2);

    // Atualiza o RESULTADO LÍQUIDO DO EXERCÍCIO
    atualizarResultadoLiquido();
}

function atualizarResultadoLiquido() {
    const lucroLiquido = parseFloat(document.getElementById('lucroLiquido').innerText) || 0;
    const valorParticipacoes = parseFloat(document.getElementById('valorParticipacoes').innerText) || 0;

    // Calcula o resultado líquido
    const resultadoLiquido = lucroLiquido - valorParticipacoes;

    // Atualiza o valor exibido no RESULTADO LÍQUIDO DO EXERCÍCIO
    document.getElementById('resultadoLiquido').innerText = resultadoLiquido.toFixed(2);
}

// Atualiza a tabela de demonstração ao alterar os campos
document.getElementById('deducoesReceitaBruta').addEventListener('input', atualizarDemonstracao);
document.getElementById('custoMercadoriasVendidas').addEventListener('input', atualizarDemonstracao);
document.getElementById('despesasOperacionais').addEventListener('input', atualizarDemonstracao);
document.getElementById('despesasAdministrativas').addEventListener('input', atualizarDemonstracao);
document.getElementById('despesasFinanceiras').addEventListener('input', atualizarDemonstracao);
document.getElementById('receitasFinanceiras').addEventListener('input', atualizarDemonstracao);
document.getElementById('porcentagemIR').addEventListener('input', atualizarDemonstracao);
document.getElementById('porcentagemCSLL').addEventListener('input', atualizarDemonstracao);
document.getElementById('porcentagemDebentures').addEventListener('input', atualizarDebenturesParticipacoes);
