function adicionarLinha() {
    const tabela = document.getElementById('balancete').getElementsByTagName('tbody')[0];
    const novaLinha = tabela.insertRow();

    const celulaConta = novaLinha.insertCell(0);
    const celulaDebito = novaLinha.insertCell(1);
    const celulaCredito = novaLinha.insertCell(2);

    celulaConta.innerHTML = '<input type="text" placeholder="Conta">';
    celulaDebito.innerHTML = '<input type="number" placeholder="Débito">';
    celulaCredito.innerHTML = '<input type="number" placeholder="Crédito">';
}