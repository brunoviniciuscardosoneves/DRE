function adicionarLinha() {
    const tabela = document.getElementById('balancete').getElementsByTagName('tbody')[0];
    const novaLinha = tabela.insertRow(tabela.rows.length - 1); // Insere antes da linha de total

    const celulaConta = novaLinha.insertCell(0);
    const celulaDebito = novaLinha.insertCell(1);
    const celulaCredito = novaLinha.insertCell(2);

    celulaConta.innerHTML = '<input type="text" placeholder="Conta">';
    celulaDebito.innerHTML = '<input type="number" value="0" oninput="calcularTotal()">';
    celulaCredito.innerHTML = '<input type="number" value="0" oninput="calcularTotal()">';
}

function calcularTotal() {
    const linhas = document.querySelectorAll('#balancete tbody tr');
    let totalDebito = 0;
    let totalCredito = 0;

    linhas.forEach((linha, index) => {
        if (index < linhas.length - 1) { // Ignora a última linha (Total)
            const debito = parseFloat(linha.cells[1].querySelector('input').value) || 0;
            const credito = parseFloat(linha.cells[2].querySelector('input').value) || 0;
            totalDebito += debito;
            totalCredito += credito;
        }
    });

    document.getElementById('totalDebito').textContent = totalDebito;
    document.getElementById('totalCredito').textContent = totalCredito;
}