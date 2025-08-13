// Configurações iniciais
const ITEMS_PER_PAGE = 15;
let allSalesData = [];
let filteredData = [];
let currentPage = 1;
let salesChart, marginChart;

// Elementos do DOM
const dateRangeInput = document.getElementById('dateRange');
const dateDisplay = document.getElementById('dateDisplay');
const filterBtn = document.getElementById('filterBtn');
const storeFilter = document.getElementById('storeFilter');
const productFilter = document.getElementById('productFilter');
const evaluationFilter = document.getElementById('evaluationFilter');
const totalOrdersEl = document.getElementById('totalOrders');
const totalGrossEl = document.getElementById('totalGross');
const totalNetEl = document.getElementById('totalNet');
const avgMarginEl = document.getElementById('avgMargin');
const tableBody = document.getElementById('tableBody');
const paginationEl = document.getElementById('pagination');

// Função para formatar valores em moeda brasileira
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    }).format(value);
}

// Função para converter string de data em objeto Date (corrigida e mais robusta)
function parseDate(dateStr) {
    if (!dateStr) return null;
    
    // Suporta múltiplos formatos: dd/mm/yyyy ou dd-mm-yyyy
    const dateParts = dateStr.split(/[\/-]/);
    if (dateParts.length !== 3) return null;
    
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Mês é 0-indexed
    const year = parseInt(dateParts[2], 10);
    
    // Validação básica da data
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 2000) return null;
    
    return new Date(year, month, day);
}

// Inicializar o datepicker sem data padrão
flatpickr(dateRangeInput, {
    mode: "range",
    dateFormat: "d/m/Y",
    locale: {
        firstDayOfWeek: 0,
        weekdays: {
            shorthand: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
            longhand: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]
        },
        months: {
            shorthand: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
            longhand: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
        }
    },
    onChange: function(selectedDates, dateStr, instance) {
        if (selectedDates.length === 2) {
            const startDate = instance.formatDate(selectedDates[0], "d/m/Y");
            const endDate = instance.formatDate(selectedDates[1], "d/m/Y");
            dateDisplay.textContent = `Período selecionado: ${startDate} a ${endDate}`;
            applyFilters();
        } else if (selectedDates.length === 0) {
            dateDisplay.textContent = "Período selecionado: Todos os registros";
            applyFilters();
        }
    }
});

// Carregar dados da planilha
async function loadSalesData() {
    try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQNCgNfCiiKtwWXHPRlNJidnyDzo1lQ2oq6jJrwW_tphthSn7GcBu9K6FS9abQcjNXcZiULYNqSA7Ds/pub?gid=0&single=true&output=tsv');
        const tsvData = await response.text();
        parseTsvData(tsvData);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showError('Falha ao carregar dados da planilha. Verifique sua conexão e tente novamente.');
    }
}

// Parse dos dados TSV
function parseTsvData(tsv) {
    const rows = tsv.split('\n');
    const headers = rows[0].split('\t').map(h => h.trim());
    
    allSalesData = [];
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split('\t');
        if (row.length < headers.length) continue;
        
        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header] = row[index] ? row[index].trim() : '';
        });
        
        // Converter valores numéricos
        rowData['CUSTO POR PRODUTO'] = parseCurrency(rowData['CUSTO POR PRODUTO']);
        rowData['Custo'] = parseCurrency(rowData['Custo']);
        rowData['PREÇO VENDA'] = parseCurrency(rowData['PREÇO VENDA']);
        rowData['MARGEM $'] = parseCurrency(rowData['MARGEM $']);
        rowData['MARGEM %'] = parsePercentage(rowData['MARGEM %']);
        rowData['Quantidade'] = parseInt(rowData['Quantidade']) || 1;
        
        // Formatar data para objeto Date com validação
        rowData['DateObj'] = parseDate(rowData['DATA']);
        if (!rowData['DateObj'] || isNaN(rowData['DateObj'].getTime())) {
            console.warn('Data inválida ignorada:', rowData['DATA']);
            continue;
        }
        
        allSalesData.push(rowData);
    }
    
    // Preencher filtros
    populateStoreFilter();
    applyFilters();
}

// Função para converter valores monetários
function parseCurrency(value) {
    if (!value) return 0;
    // Remove "R$" e espaços, substitui vírgula por ponto
    const num = parseFloat(value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
    return isNaN(num) ? 0 : num;
}

// Função para converter porcentagens
function parsePercentage(value) {
    if (!value) return 0;
    // Remove o símbolo de porcentagem
    const num = parseFloat(value.replace('%', '').replace(',', '.').trim());
    return isNaN(num) ? 0 : num;
}

// Preencher filtro de lojas
function populateStoreFilter() {
    const stores = new Set();
    allSalesData.forEach(item => {
        if (item['LOJA']) stores.add(item['LOJA']);
    });
    
    storeFilter.innerHTML = '<option value="">Todas as Lojas</option>';
    stores.forEach(store => {
        const option = document.createElement('option');
        option.value = store;
        option.textContent = store;
        storeFilter.appendChild(option);
    });
}

// Aplicar todos os filtros (CORREÇÃO PRINCIPAL)
function applyFilters() {
    const dates = dateRangeInput.value.split(' a ');
    const startDateStr = dates[0];
    const endDateStr = dates[1] || dates[0];
    
    const startDate = startDateStr ? parseDate(startDateStr) : null;
    const endDate = endDateStr ? parseDate(endDateStr) : null;
    
    const store = storeFilter.value;
    const product = productFilter.value.toLowerCase();
    const evaluation = evaluationFilter.value;
    
    filteredData = allSalesData.filter(item => {
        // Filtro de data - aplica apenas se datas válidas foram selecionadas
        if (startDate && endDate) {
            const itemDate = item.DateObj;
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            if (itemDate < start || itemDate > end) {
                return false;
            }
        }
        
        // Filtro de loja
        if (store && item['LOJA'] !== store) return false;
        
        // Filtro de produto
        if (product && !item['NOME DO PRODUTO'].toLowerCase().includes(product)) return false;
        
        // Filtro de avaliação
        if (evaluation && item['AVALIAÇÃO DE PREÇO'] !== evaluation) return false;
        
        return true;
    });
    
    currentPage = 1; // Resetar para primeira página
    updateDashboard();
    renderTable();
    updateCharts();
}

// Atualizar o dashboard com os totais
function updateDashboard() {
    const totalOrders = filteredData.reduce((sum, item) => sum + item['Quantidade'], 0);
    const totalGross = filteredData.reduce((sum, item) => sum + (item['PREÇO VENDA'] * item['Quantidade']), 0);
    const totalNet = filteredData.reduce((sum, item) => sum + (item['MARGEM $'] * item['Quantidade']), 0);
    
    const totalMarginPercent = filteredData.reduce((sum, item) => sum + (item['MARGEM %'] * item['Quantidade']), 0);
    const avgMargin = totalOrders > 0 ? totalMarginPercent / totalOrders : 0;
    
    totalOrdersEl.textContent = totalOrders.toLocaleString('pt-BR');
    totalGrossEl.textContent = formatCurrency(totalGross);
    totalNetEl.textContent = formatCurrency(totalNet);
    avgMarginEl.textContent = `${avgMargin.toFixed(2)}%`;
}

// Renderizar a tabela com os dados
function renderTable() {
    tableBody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length);
    const pageData = filteredData.slice(startIndex, endIndex);
    
    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Nenhum dado encontrado com os filtros aplicados</td></tr>';
        paginationEl.innerHTML = '';
        return;
    }
    
    pageData.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item['ID']}</td>
            <td>${item['NOME DO PRODUTO']}</td>
            <td>${item['variação']}</td>
            <td>${item['DATA']}</td>
            <td>${item['LOJA']}</td>
            <td>${item['Quantidade']}</td>
            <td>${formatCurrency(item['PREÇO VENDA'])}</td>
            <td class="${item['MARGEM $'] >= 0 ? 'positive' : 'negative'}">${formatCurrency(item['MARGEM $'])}</td>
            <td class="${item['MARGEM %'] >= 0 ? 'positive' : 'negative'}">${item['MARGEM %'].toFixed(2)}%</td>
            <td>${item['AVALIAÇÃO DE PREÇO']}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    renderPagination();
}

// Renderizar controles de paginação
function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    
    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Botão Anterior
    paginationHTML += `<button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="changePage(${currentPage - 1})">Anterior</button>`;
    
    // Páginas
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="pagination-btn active">${i}</button>`;
        } else if (
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            paginationHTML += `<button class="pagination-btn" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
    }
    
    // Botão Próximo
    paginationHTML += `<button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="changePage(${currentPage + 1})">Próximo</button>`;
    
    paginationEl.innerHTML = paginationHTML;
}

// Mudar página
function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredData.length / ITEMS_PER_PAGE)) return;
    currentPage = page;
    renderTable();
}

// Atualizar gráficos
function updateCharts() {
    updateSalesChart();
    updateMarginChart();
}

// Atualizar gráfico de vendas
function updateSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Agrupar por data
    const salesByDate = {};
    filteredData.forEach(item => {
        const date = item['DATA'];
        if (!salesByDate[date]) {
            salesByDate[date] = {
                amount: 0,
                value: 0
            };
        }
        salesByDate[date].amount += item['Quantidade'];
        salesByDate[date].value += (item['PREÇO VENDA'] * item['Quantidade']);
    });
    
    const dates = Object.keys(salesByDate).sort();
    const amounts = dates.map(date => salesByDate[date].amount);
    const values = dates.map(date => salesByDate[date].value);
    
    if (salesChart) salesChart.destroy();
    
    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Quantidade de Pedidos',
                data: amounts,
                backgroundColor: 'rgba(41, 128, 185, 0.7)',
                borderColor: 'rgba(41, 128, 185, 1)',
                borderWidth: 1
            }, {
                label: 'Valor Total (R$)',
                data: values,
                backgroundColor: 'rgba(46, 204, 113, 0.7)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 1,
                type: 'line',
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantidade de Pedidos'
                    }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Valor Total (R$)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR', {maximumFractionDigits: 0});
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 0) {
                                label += context.parsed.y;
                            } else {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Atualizar gráfico de margem
function updateMarginChart() {
    const ctx = document.getElementById('marginChart').getContext('2d');
    
    // Agrupar por produto
    const marginByProduct = {};
    filteredData.forEach(item => {
        const product = item['NOME DO PRODUTO'];
        if (!marginByProduct[product]) {
            marginByProduct[product] = {
                value: 0,
                percentage: 0,
                count: 0
            };
        }
        marginByProduct[product].value += (item['MARGEM $'] * item['Quantidade']);
        marginByProduct[product].percentage += item['MARGEM %'];
        marginByProduct[product].count++;
    });
    
    // Converter para array e ordenar
    const products = Object.entries(marginByProduct)
        .map(([product, data]) => ({
            product,
            avgValue: data.value / data.count,
            avgPercentage: data.percentage / data.count
        }))
        .sort((a, b) => b.avgValue - a.avgValue)
        .slice(0, 10);
    
    const productNames = products.map(p => p.product);
    const avgValues = products.map(p => p.avgValue);
    const avgPercentages = products.map(p => p.avgPercentage);
    
    if (marginChart) marginChart.destroy();
    
    marginChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: productNames,
            datasets: [{
                label: 'Margem Média (R$)',
                data: avgValues,
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }, {
                label: 'Margem Média (%)',
                data: avgPercentages,
                backgroundColor: 'rgba(155, 89, 182, 0.7)',
                borderColor: 'rgba(155, 89, 182, 1)',
                borderWidth: 1,
                type: 'line',
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR', {maximumFractionDigits: 0});
                        }
                    }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Margem Média (%)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 0) {
                                label += formatCurrency(context.parsed.x);
                            } else {
                                label += context.parsed.x.toFixed(2) + '%';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Mostrar mensagem de erro
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    document.querySelector('.container').insertBefore(errorDiv, document.querySelector('.dashboard-stats'));
}

// Event Listeners
filterBtn.addEventListener('click', applyFilters);
storeFilter.addEventListener('change', applyFilters);
productFilter.addEventListener('input', applyFilters);
evaluationFilter.addEventListener('change', applyFilters);

// Inicializar o dashboard
window.onload = loadSalesData;
window.changePage = changePage;