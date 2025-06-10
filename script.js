// Tabelas e valores atualizados para 2025
let INSS_2025 = [
    { min: 0, max: 1412.00, aliquota: 0.075 },
    { min: 1412.01, max: 2666.68, aliquota: 0.09 },
    { min: 2666.69, max: 4000.03, aliquota: 0.12 },
    { min: 4000.04, max: 7786.02, aliquota: 0.14 }
];

let IR_2025 = [
    { min: 0, max: 2259.20, aliquota: 0, deducao: 0 },
    { min: 2259.21, max: 2826.65, aliquota: 0.075, deducao: 169.44 },
    { min: 2826.66, max: 3751.05, aliquota: 0.15, deducao: 381.44 },
    { min: 3751.06, max: 4664.68, aliquota: 0.225, deducao: 662.77 },
    { min: 4664.69, max: Infinity, aliquota: 0.275, deducao: 896.00 }
];

let DEPENDENTE_IR = 189.59;

// Modal Sobre
const modal = document.getElementById("aboutModal");
const aboutBtn = document.getElementById("aboutBtn");
const closeModal = document.querySelector(".close-modal");

// Event Listeners para toggles
document.querySelectorAll('.toggle-group').forEach(group => {
    group.addEventListener('click', (e) => {
        if (e.target.classList.contains('toggle-option')) {
            group.querySelectorAll('.toggle-option').forEach(opt => opt.classList.remove('active'));
            e.target.classList.add('active');
            
            const hiddenInput = group.parentElement.querySelector('input[type="hidden"]');
            if (hiddenInput) {
                hiddenInput.value = e.target.dataset.value;
            }
        }
    });
});

// Função para calcular INSS
function calcularINSS(salario) {
    let inss = 0;
    let salarioRestante = salario;

    for (let faixa of INSS_2025) {
        if (salarioRestante <= 0) break;
        
        const baseCalculo = Math.min(salarioRestante, faixa.max - faixa.min + 0.01);
        if (baseCalculo > 0) {
            inss += baseCalculo * faixa.aliquota;
            salarioRestante -= baseCalculo;
        }
    }

    return Math.min(inss, 908.85); // Teto do INSS 2025
}

// Função para calcular IR
function calcularIR(salario, dependentes, pensao = 0) {
    const inss = calcularINSS(salario);
    const baseIR = salario - inss - pensao - (dependentes * DEPENDENTE_IR);
    
    if (baseIR <= 0) return 0;

    for (let faixa of IR_2025) {
        if (baseIR >= faixa.min && baseIR <= faixa.max) {
            return Math.max(0, (baseIR * faixa.aliquota) - faixa.deducao);
        }
    }
    return 0;
}

// Função para calcular dias de férias baseado em faltas
function calcularDiasFerias(faltasInjustificadas) {
    if (faltasInjustificadas <= 5) return 30;
    if (faltasInjustificadas <= 14) return 24;
    if (faltasInjustificadas <= 23) return 18;
    if (faltasInjustificadas <= 32) return 12;
    return 0; // Perde o direito às férias
}

// Função principal de cálculo
function calcularFerias() {
    const salarioBruto = parseFloat(document.getElementById('salarioBruto').value) || 0;
    const outrosProventos = parseFloat(document.getElementById('outrosProventos').value) || 0;
    const dependentes = parseInt(document.getElementById('dependentes').value) || 0;
    const pensaoAlimenticia = parseFloat(document.getElementById('pensaoAlimenticia').value) || 0;
    const diasFerias = parseInt(document.getElementById('diasFerias').value);
    const abonoPecuniario = document.getElementById('abonoPecuniario').value === 'true';
    const adiantamento13 = document.getElementById('adiantamento13').value === 'true';
    const faltasInjustificadas = parseInt(document.getElementById('faltasInjustificadas').value) || 0;
    
    // Novos campos adicionados
    const periodo1 = parseInt(document.getElementById('feriasPeriodo1').value) || 0;
    const periodo2 = parseInt(document.getElementById('feriasPeriodo2').value) || 0;
    const tipoAdicional = document.getElementById('tipoAdicional').value;
    const grauInsalubridade = parseFloat(document.getElementById('grauInsalubridade').value) || 0;
    const tipoRegime = document.getElementById('tipoRegime').value;

    // Validações
    if (salarioBruto <= 0) {
        alert('Por favor, informe um salário bruto válido.');
        return;
    }

    const diasDireito = calcularDiasFerias(faltasInjustificadas);
    
    if (diasDireito === 0) {
        alert('Com mais de 32 faltas injustificadas, o empregado perde o direito às férias.');
        return;
    }

    // Validar períodos de férias
    const totalDiasPeriodos = periodo1 + periodo2;
    const diasUsados = totalDiasPeriodos > 0 ? totalDiasPeriodos : diasFerias;
    
    if (diasUsados > diasDireito) {
        alert(`Com ${faltasInjustificadas} faltas injustificadas, o direito é de apenas ${diasDireito} dias de férias.`);
        return;
    }

    // Base de cálculo das férias
    let salarioBase = salarioBruto + outrosProventos;
    
    // Calcular adicionais
    let adicional = 0;
    if (tipoAdicional === 'periculosidade') {
        adicional = salarioBase * 0.3;
    } else if (tipoAdicional === 'insalubridade') {
        adicional = salarioBase * grauInsalubridade;
    }
    
    // Ajustar salário base para regime estatutário se necessário
    if (tipoRegime === 'estatutario') {
        // Implementar lógica específica para estatutários se necessário
    }
    
    salarioBase += adicional;

    // Cálculo das férias proporcionais
    const valorFerias = (salarioBase / 30) * diasUsados;
    
    // Terço constitucional (1/3 das férias)
    const tercoConstitucional = valorFerias / 3;
    
    // Abono pecuniário (se optou por vender)
    let valorAbono = 0;
    let tercoAbono = 0;
    if (abonoPecuniario) {
        const diasAbono = Math.min(10, Math.floor(diasUsados / 3));
        valorAbono = (salarioBase / 30) * diasAbono;
        tercoAbono = valorAbono / 3;
    }
    
    // Adiantamento do 13º salário (50% do salário base)
    let adiantamento13Valor = 0;
    if (adiantamento13) {
        adiantamento13Valor = salarioBase / 2;
    }
    
    // Total bruto
    const totalBruto = valorFerias + tercoConstitucional + valorAbono + tercoAbono + adiantamento13Valor;
    
    // Cálculo dos descontos
    const inssDesconto = calcularINSS(totalBruto);
    const irDesconto = calcularIR(totalBruto, dependentes, pensaoAlimenticia);
    
    // Total líquido
    const totalLiquido = totalBruto - inssDesconto - irDesconto - pensaoAlimenticia;

    // Exibir resultados
    exibirResultados({
        valorFerias,
        tercoConstitucional,
        valorAbono,
        tercoAbono,
        adiantamento13Valor,
        totalBruto,
        inssDesconto,
        irDesconto,
        pensaoAlimenticia,
        totalLiquido,
        diasFerias: diasUsados,
        diasDireito,
        faltasInjustificadas,
        dependentes,
        adicional,
        tipoRegime
    });
}

function exibirResultados(calc) {
    const resultsDiv = document.getElementById('results');
    const itemsDiv = document.getElementById('resultItems');
    
    let html = '';
    
    // Informações sobre direito às férias
    if (calc.faltasInjustificadas > 0) {
        html += `
            <div class="warning">
                ⚠️ <strong>Atenção:</strong> Com ${calc.faltasInjustificadas} faltas injustificadas, 
                o direito às férias é de ${calc.diasDireito} dias (ao invés de 30 dias).
            </div>
        `;
    }
    
    // Informações sobre adicionais
    if (calc.adicional > 0) {
        html += `
            <div class="result-item">
                <div style="flex-grow: 1;">
                    <span class="result-label">📌 Adicional</span>
                    <div class="result-explanation">Valor adicional calculado sobre o salário base</div>
                </div>
                <span class="result-value">R$ ${calc.adicional.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }
    
    // Valores das férias
    html += `
        <div class="result-item">
            <div style="flex-grow: 1;">
                <span class="result-label">🏖️ Valor das Férias (${calc.diasFerias} dias)</span>
                <div class="result-explanation">Cálculo proporcional: (Salário base ÷ 30 dias) × ${calc.diasFerias} dias gozados</div>
            </div>
            <span class="result-value">R$ ${calc.valorFerias.toFixed(2).replace('.', ',')}</span>
        </div>
        
        <div class="result-item">
            <div style="flex-grow: 1;">
                <span class="result-label">📈 Terço Constitucional (1/3)</span>
                <div class="result-explanation">Adicional de 1/3 sobre o valor das férias, garantido pela Constituição Federal</div>
            </div>
            <span class="result-value">R$ ${calc.tercoConstitucional.toFixed(2).replace('.', ',')}</span>
        </div>
    `;
    
    // Abono pecuniário
    if (calc.valorAbono > 0) {
        const diasAbono = Math.min(10, Math.floor(calc.diasFerias / 3));
        html += `
            <div class="result-item">
                <div style="flex-grow: 1;">
                    <span class="result-label">💰 Abono Pecuniário (${diasAbono} dias)</span>
                    <div class="result-explanation">Venda de até 1/3 das férias em dinheiro (máximo 10 dias). Art. 143 da CLT</div>
                </div>
                <span class="result-value">R$ ${calc.valorAbono.toFixed(2).replace('.', ',')}</span>
            </div>
            
            <div class="result-item">
                <div style="flex-grow: 1;">
                    <span class="result-label">📈 1/3 do Abono Pecuniário</span>
                    <div class="result-explanation">Adicional constitucional de 1/3 sobre o valor do abono pecuniário</div>
                </div>
                <span class="result-value">R$ ${calc.tercoAbono.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }
    
    // Adiantamento 13º
    if (calc.adiantamento13Valor > 0) {
        html += `
            <div class="result-item">
                <div style="flex-grow: 1;">
                    <span class="result-label">🎄 Adiantamento 13º Salário</span>
                    <div class="result-explanation">1ª parcela do 13º salário (50% do salário base) paga junto com as férias</div>
                </div>
                <span class="result-value">R$ ${calc.adiantamento13Valor.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }
    
    // Total bruto
    html += `
        <div class="result-item" style="background: #e8f5e8; border-left: 4px solid #27ae60;">
            <div style="flex-grow: 1;">
                <span class="result-label">📊 Total Bruto</span>
                <div class="result-explanation">Soma de todos os valores antes dos descontos legais</div>
            </div>
            <span class="result-value" style="color: #27ae60; font-weight: bold;">R$ ${calc.totalBruto.toFixed(2).replace('.', ',')}</span>
        </div>
    `;
    
    // Descontos
    html += `
        <div class="result-item" style="background: #ffeaea; border-left: 4px solid #e74c3c;">
            <div style="flex-grow: 1;">
                <span class="result-label">➖ INSS (${((calc.inssDesconto/calc.totalBruto)*100).toFixed(1)}%)</span>
                <div class="result-explanation">Contribuição previdenciária calculada sobre o total bruto, limitada ao teto</div>
            </div>
            <span class="result-value" style="color: #e74c3c;">-R$ ${calc.inssDesconto.toFixed(2).replace('.', ',')}</span>
        </div>
        
        <div class="result-item" style="background: #ffeaea; border-left: 4px solid #e74c3c;">
            <div style="flex-grow: 1;">
                <span class="result-label">➖ Imposto de Renda${calc.dependentes > 0 ? ` (${calc.dependentes} dependente${calc.dependentes > 1 ? 's' : ''})` : ''}</span>
                <div class="result-explanation">${calc.irDesconto > 0 ? 'Calculado sobre base: total bruto - INSS - pensão - dependentes' : 'Isento por estar abaixo da faixa de tributação'}</div>
            </div>
            <span class="result-value" style="color: #e74c3c;">-R$ ${calc.irDesconto.toFixed(2).replace('.', ',')}</span>
        </div>
    `;
    
    // Pensão alimentícia
    if (calc.pensaoAlimenticia > 0) {
        html += `
            <div class="result-item" style="background: #ffeaea; border-left: 4px solid #e74c3c;">
                <div style="flex-grow: 1;">
                    <span class="result-label">➖ Pensão Alimentícia</span>
                    <div class="result-explanation">Desconto judicial de pensão alimentícia conforme determinação legal</div>
                </div>
                <span class="result-value" style="color: #e74c3c;">-R$ ${calc.pensaoAlimenticia.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }
    
    // Total líquido
    html += `
        <div class="result-item total" style="margin-top: 20px;">
            <div style="flex-grow: 1;">
                <span class="result-label">💵 VALOR LÍQUIDO A RECEBER</span>
                <div class="result-explanation" style="color: rgba(255,255,255,0.9);">Valor final após todos os descontos legais - Este é o valor que será depositado</div>
            </div>
            <span class="result-value">R$ ${calc.totalLiquido.toFixed(2).replace('.', ',')}</span>
        </div>
        
        <div class="result-item" style="margin-top: 10px; background: #f8f9fa;">
            <div style="flex-grow: 1;">
                <span class="result-label">ℹ️ Regime</span>
                <div class="result-explanation">${calc.tipoRegime === 'estatutario' ? 'Estatutário (regime próprio)' : 'CLT (Consolidação das Leis do Trabalho)'}</div>
            </div>
        </div>
    `;
    
    itemsDiv.innerHTML = html;
    resultsDiv.classList.add('show');
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Event listener para o formulário
document.getElementById('feriasForm').addEventListener('submit', (e) => {
    e.preventDefault();
    calcularFerias();
});

// Formatação de moeda nos inputs
document.querySelectorAll('input[type="number"]').forEach(input => {
    if (input.step === '0.01') {
        input.addEventListener('blur', (e) => {
            const value = parseFloat(e.target.value);
            if (!isNaN(value)) {
                e.target.value = value.toFixed(2);
            }
        });
    }
});

// Controle do modal Sobre
if (aboutBtn && modal && closeModal) {
    aboutBtn.onclick = function() {
        modal.style.display = "block";
    }

    closeModal.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

// Mostrar/ocultar grau de insalubridade
document.getElementById('tipoAdicional')?.addEventListener('change', function() {
    const grauGroup = document.getElementById('grauInsalubridadeGroup');
    if (grauGroup) {
        grauGroup.style.display = this.value === 'insalubridade' ? 'block' : 'none';
    }
});

// Exportar PDF
document.getElementById('exportPdf')?.addEventListener('click', () => {
    const element = document.getElementById('results');
    if (element) {
        const opt = {
            margin: 10,
            filename: 'calculo-ferias.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save();
    }
});

// Sistema de atualização de tabelas
async function carregarTabelas() {
    try {
        const response = await fetch('tabelas.json');
        if (!response.ok) throw new Error('Falha ao carregar tabelas');
        
        const tabelas = await response.json();
        if (tabelas.INSS && tabelas.IR) {
            INSS_2025 = tabelas.INSS;
            IR_2025 = tabelas.IR;
            DEPENDENTE_IR = tabelas.DEPENDENTE_IR || 189.59;
            console.log('Tabelas atualizadas com sucesso');
        }
    } catch (error) {
        console.error('Usando tabelas padrão:', error);
    }
}

// Carregar tabelas ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    carregarTabelas();
    
    // Configurar valores padrão para períodos de férias
    const diasFeriasSelect = document.getElementById('diasFerias');
    if (diasFeriasSelect) {
        diasFeriasSelect.addEventListener('change', function() {
            const totalDias = parseInt(this.value);
            const periodo1 = document.getElementById('feriasPeriodo1');
            const periodo2 = document.getElementById('feriasPeriodo2');
            
            if (periodo1 && periodo2) {
                periodo1.value = Math.floor(totalDias / 2);
                periodo2.value = 0;
            }
        });
    }
});