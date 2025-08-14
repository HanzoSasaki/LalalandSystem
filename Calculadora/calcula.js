function abrirCalculadora(tipo) {
  let title = "";
  let content = "";
  switch (tipo) {
    case "venda":
      title = "Calculadora de Precificação Shopee";
      content = `
          <div class="modal-header">
        
            <span class="close" onclick="fecharModal()"></span>
        </div>
<div class="modal-body">
  <div class="form-group">
    <label for="custo">Custo do Produto (R$)</label>
    <input type="number" id="custo" class="form-control" placeholder="Valor de custo do produto (R$)">
  </div>

  <div class="input-grid">
    <div class="form-group">
      <label for="imposto">Imposto (%)</label>
      <input type="number" id="imposto" class="form-control" placeholder="imposto padrão 1,08%">
    </div>

    <div class="form-group">
      <label for="comissao">Comissão Marketplace (%)</label>
      <input type="number" id="comissao" class="form-control" placeholder="Comissão padrão de 20%">
    </div>
  </div>

  <div class="input-grid">
    <div class="form-group">
      <label for="taxa">Taxa por Pedido (R$)</label>
      <input type="number" id="taxa" class="form-control" placeholder="Taxa padrão de R$ 4,00">
    </div>

    <div class="form-group">
      <label for="valorOperacional">Valor Operacional (%)</label>
      <input type="number" id="valorOperacional" class="form-control" placeholder="valor em (%)">
    </div>
  </div>

  <div class="input-grid">
    <div class="form-group">
      <label for="decimo">Décimo Terceiro (%)</label>
      <input type="number" id="decimo" class="form-control" placeholder="valor em (%)">
    </div>

    <div class="form-group">
      <label for="antecipa">Antecipação (%)</label>
      <input type="number" id="antecipa" class="form-control" placeholder="valor em (%)">
    </div>
  </div>

  <div class="form-group">
    <label for="margem">Margem de Lucro Desejada (%)</label>
    <input type="number" id="margem" class="form-control" placeholder="Porcentagem recomendada de pelo menos 15%">
  </div>


            <button onclick="calcularPreco()" class="btn btn-primary">Calcular Preço de Venda</button>

            <div id="resultado" class="result-box"></div>
            <div id="promocoes" class="table-container"></div>
          </div>
      `;
      break;

    case "lucro":
      title = "Calculadora Tributária (ICMS e IPI)";
      content = `
          <div class="modal-header">
        
            <span class="close" onclick="fecharModal()"></span>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="tipoNota">Tipo da Nota</label>
              <select id="tipoNota" class="form-control">
                <option value="inteira">Nota Inteira</option>
                <option value="meiaNota">Meia Nota</option>
                <option value="nota3">Nota 1/3</option>
              </select>
            </div>

            <div class="input-grid">
              <div class="form-group">
                <label for="custo">Custo do Produto (R$)</label>
                <input type="number" id="custo" class="form-control" placeholder="Valor do produto em nota" required>
              </div>

              <div class="form-group">
                <label for="icms">ICMS (%)</label>
                <input type="number" id="icms" class="form-control" placeholder="valor em (%)">
              </div>
            </div>

            <div class="input-grid">
              <div class="form-group">
                <label for="ipi">IPI (%)</label>
                <input type="number" id="ipi" class="form-control" placeholder="Valor em (%)">
              </div>

              <div class="form-group">
                <label for="porcentagem">Porcentagem Adicional (%)</label>
                <input type="number" id="porcentagem" class="form-control" step="0.01" placeholder="Não constante, favor atenção">
              </div>
            </div>

            <button onclick="calcularValorFinal()" class="btn btn-primary">Calcular</button>
            <div id="resultado" class="result-box"></div>
          </div>
      `;
      break;
  }
  document.getElementById("modal-title").innerText = title;
  document.getElementById("modal-body").innerHTML = content;
  document.getElementById("resultado").innerText = "";
  // Em vez de alterar o display, adicionamos a classe "show" para ativar a animação
  document.getElementById("modal").classList.add("show");
}

function fecharModal() {
  // Remove a classe "show" para disparar a animação de fechamento
  document.getElementById("modal").classList.remove("show");
}

// Função principal de cálculo (CORRIGIDA)
function calcularPreco() {
  // Obter valores dos inputs
  const custo = parseFloat(document.getElementById("custo").value) || NaN;
  const imposto = (parseFloat(document.getElementById("imposto").value) || NaN) / 100;
  const comissao = (parseFloat(document.getElementById("comissao").value) || NaN) / 100;
  const taxa = parseFloat(document.getElementById("taxa").value) || NaN;
  const margem = (parseFloat(document.getElementById("margem").value) || NaN) / 100;
  
  const valorOperacional = (parseFloat(document.getElementById("valorOperacional").value) || 0) / 100;
  const decimo = (parseFloat(document.getElementById("decimo").value) || 0) / 100;
  const antecipa = (parseFloat(document.getElementById("antecipa").value) || 0) / 100;

  // Validar campos obrigatórios
  if ([custo, imposto, comissao, taxa, margem].some(isNaN)) {
      alert("Preencha todos os campos obrigatórios!");
      return;
  }

  // Calcular total de percentuais
  const totalPercentuais = imposto + comissao + margem + valorOperacional + decimo + antecipa;

  // Validar soma de percentuais
  if (totalPercentuais >= 1) {
      alert("Erro! A soma dos percentuais não pode ser 100% ou mais");
      return;
  }

  // Calcular preço de venda CORRETO
  const precoVenda = (custo + taxa) / (1 - totalPercentuais);

  // Calcular custo total para verificação
  const custoTotal = custo + taxa + 
    (precoVenda * (imposto + comissao + valorOperacional + decimo + antecipa));

  // Calcular resultados
  const lucro = precoVenda - custoTotal;
  const margemLucro = (lucro / precoVenda) * 100;

  // Exibir resultados
  const resultadoHTML = `
    <div class="result-item">
      <span class="result-label">Preço de Venda:</span>
      <span class="result-value">R$ ${precoVenda.toFixed(2)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Margem Líquida:</span>
      <span class="result-value green">${margemLucro.toFixed(2)}%</span>
    </div>
    <div class="result-item">
      <span class="result-label">Lucro por Unidade:</span>
      <span class="result-value green">R$ ${lucro.toFixed(2)}</span>
    </div>
  `;
  document.getElementById("resultado").innerHTML = resultadoHTML;

  // Calcular promoções
  let promocoesHTML = `
    <h3>Promoções Possíveis</h3>
    <table class="promo-table">
      <thead>
        <tr>
          <th>Desconto</th>
          <th>Preço Promo</th>
          <th>Lucro</th>
          <th>Margem</th>
        </tr>
      </thead>
      <tbody>`;

  for (let desconto = 5; desconto <= 50; desconto += 5) {
      const precoPromo = precoVenda * (1 - desconto/100);
      const custoPromo = custo + taxa + 
        (precoPromo * (imposto + comissao + valorOperacional + decimo + antecipa));
      const lucroPromo = precoPromo - custoPromo;
      const margemPromo = (lucroPromo / precoPromo) * 100;

      if (lucroPromo > 0 && margemPromo > 0) { // Apenas se ambos forem positivos
        promocoesHTML += `
          <tr>
            <td>${desconto}%</td>
            <td>R$ ${precoPromo.toFixed(2)}</td>
            <td class="green">R$ ${lucroPromo.toFixed(2)}</td>
            <td class="green">${margemPromo.toFixed(2)}%</td>
          </tr>`;
      }
  }

  promocoesHTML += `</tbody></table>`;
  document.getElementById("promocoes").innerHTML = promocoesHTML;
}

function calcularValorFinal() {
  const custo = parseFloat(document.getElementById("custo").value);
  const icms = parseFloat(document.getElementById("icms").value);
  const ipi = parseFloat(document.getElementById("ipi").value);
  const tipoNota = document.getElementById("tipoNota").value;
  const porcentagemAdicional = parseFloat(document.getElementById("porcentagem").value);

  // Verificação de campos vazios
  if (
    isNaN(custo) ||
    isNaN(icms) ||
    isNaN(ipi) ||
    isNaN(porcentagemAdicional)
  ) {
    alert("Por favor, preencha todos os campos para efetuar o cálculo.");
    return;
  }

  let valorFinal;
  if (icms === 18 && ipi === 0) {
    valorFinal = custo;
  } else if (icms === 18) {
    valorFinal = custo + (custo * ipi) / 100;
  } else {
    const diferencaICMS = 18 - icms;
    valorFinal =
      custo +
      (custo * diferencaICMS) / 100 +
      (custo * ipi) / 100;
  }

  // Condições baseadas no tipo da nota
  if (tipoNota === "meiaNota") {
    valorFinal += custo;
  } else if (tipoNota === "nota3") {
    valorFinal += custo * 2;
  }

  // Somando a porcentagem adicional sobre o valor do custo
  if (porcentagemAdicional > 0) {
    valorFinal += custo * (porcentagemAdicional / 100);
  }

  document.getElementById("resultado").style.display = "block";
  document.getElementById("resultado").textContent = `Valor Final: R$ ${valorFinal.toFixed(2)}`;
}
function calcularPromocao() {
  const custo = parseFloat(document.getElementById("promo-custo").value);
  const precoVenda = parseFloat(
    document.getElementById("promo-precoVenda").value
  );
  const imposto = 0.0108; // imposto de 1,08%
  const comissao = 0.20;
  const taxaPedido = 4;

  // Verificação de campos vazios
  if (isNaN(custo) || isNaN(precoVenda)) {
    alert("Por favor, preencha todos os campos para efetuar o cálculo.");
    return;
  }

  let tableHTML = `<table>
                 <thead>
                   <tr>
                     <th>Desconto (%)</th>
                     <th>Preço com Desconto (R$)</th>
                     <th>Lucro (R$)</th>
                     <th>Margem Líquida (%)</th>
                   </tr>
                 </thead>
                 <tbody>`;

  for (let desconto = 5; desconto <= 90; desconto += 5) {
    const precoComDesconto =
      precoVenda - precoVenda * (desconto / 100);
    const valorImposto = precoComDesconto * imposto;
    const valorComissao = precoComDesconto * comissao;
    const lucro =
      precoComDesconto - custo - valorImposto - valorComissao - taxaPedido;
    const descontoValor = precoVenda - precoComDesconto;

    // Calcular margem líquida em %
    const margemLiquida = (lucro / precoComDesconto) * 100;

    let classeLucro = "";
    let classeMargem = "";

    // Lógica de cores para a célula de lucro
    if (descontoValor >= 1 && descontoValor <= 10) {
      classeLucro = "green";
    } else if (lucro > 0) {
      classeLucro = "green";
    } else if (lucro === 0) {
      classeLucro = "green";
    } else {
      classeLucro = "red";
    }

    // Lógica de cores para a célula de margem líquida
    if (margemLiquida > 0) {
      classeMargem = "green";
    } else if (margemLiquida < 0) {
      classeMargem = "red";
    } else {
      classeMargem = "green"; // Para margem 0, podemos manter como verde
    }

    tableHTML += `<tr>
        <td>${desconto}%</td>
        <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(precoComDesconto)}</td>
        <td class="${classeLucro}">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucro)}</td>
        <td class="${classeMargem}">${margemLiquida.toFixed(2)}%</td>
      </tr>`;
  }

  tableHTML += `</tbody></table>`;
  document.getElementById("promo-result").innerHTML = tableHTML;
}
