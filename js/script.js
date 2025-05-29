document.addEventListener('DOMContentLoaded', () => {
    // --- Funciones de Sincronización Slider/Input ---
    function syncSlider(input, range, valueSpan, unit = '', precision = 0) {
        const updateValue = (element) => {
            const val = element.value;
            if (element.type === 'range') {
                input.value = val;
            } else {
                range.value = val;
            }
            const numValue = parseFloat(val);
            valueSpan.textContent = numValue.toLocaleString('es-ES', { minimumFractionDigits: precision, maximumFractionDigits: precision }) + unit;
        };

        input.addEventListener('input', () => updateValue(input));
        range.addEventListener('input', () => updateValue(range));
        
        // Initial sync to set the correct display value on load
        // Ensure the span is updated based on the input's initial value
        const initialNumValue = parseFloat(input.value);
        valueSpan.textContent = initialNumValue.toLocaleString('es-ES', { minimumFractionDigits: precision, maximumFractionDigits: precision }) + unit;
    }

    // --- Calculadora de Jubilación ---
    const retirementForm = document.getElementById('retirement-form');
    const retirementCurrentAgeInput = document.getElementById('retirement-current-age');
    const retirementCurrentAgeRange = document.getElementById('retirement-current-age-range');
    const retirementDesiredAgeInput = document.getElementById('retirement-desired-age');
    const retirementDesiredAgeRange = document.getElementById('retirement-desired-age-range');
    const retirementInitialContributionInput = document.getElementById('retirement-initial-contribution');
    const retirementInitialContributionRange = document.getElementById('retirement-initial-contribution-range');
    const retirementAnnualContributionInput = document.getElementById('retirement-annual-contribution');
    const retirementAnnualContributionRange = document.getElementById('retirement-annual-contribution-range');
    const retirementPreInterestRateInput = document.getElementById('retirement-pre-interest-rate');
    const retirementPreInterestRateRange = document.getElementById('retirement-pre-interest-rate-range');
    const retirementYearsOfEnjoymentInput = document.getElementById('retirement-years-of-enjoyment');
    const retirementYearsOfEnjoymentRange = document.getElementById('retirement-years-of-enjoyment-range');
    const retirementPostInterestRateInput = document.getElementById('retirement-post-interest-rate');
    const retirementPostInterestRateRange = document.getElementById('retirement-post-interest-rate-range');

    const retirementTotalSavingsSpan = document.getElementById('retirement-total-savings');
    const retirementMonthlyIncomeSpan = document.getElementById('retirement-monthly-income');
    const retirementCapitalDepletionSpan = document.getElementById('retirement-capital-depletion');

    // Sincronizar sliders e inputs de Jubilación
    syncSlider(retirementCurrentAgeInput, retirementCurrentAgeRange, retirementCurrentAgeRange.nextElementSibling, ' Años');
    syncSlider(retirementDesiredAgeInput, retirementDesiredAgeRange, retirementDesiredAgeRange.nextElementSibling, ' Años');
    syncSlider(retirementInitialContributionInput, retirementInitialContributionRange, retirementInitialContributionRange.nextElementSibling, ' €');
    syncSlider(retirementAnnualContributionInput, retirementAnnualContributionRange, retirementAnnualContributionRange.nextElementSibling, ' €');
    syncSlider(retirementPreInterestRateInput, retirementPreInterestRateRange, retirementPreInterestRateRange.nextElementSibling, ' %', 2);
    syncSlider(retirementYearsOfEnjoymentInput, retirementYearsOfEnjoymentRange, retirementYearsOfEnjoymentRange.nextElementSibling, ' Años');
    syncSlider(retirementPostInterestRateInput, retirementPostInterestRateRange, retirementPostInterestRateRange.nextElementSibling, ' %', 2);


    // Lógica de Cálculo de Jubilación
    retirementForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentAge = parseInt(retirementCurrentAgeInput.value);
        const desiredRetirementAge = parseInt(retirementDesiredAgeInput.value);
        let initialSavings = parseFloat(retirementInitialContributionInput.value);
        const annualContribution = parseFloat(retirementAnnualContributionInput.value);
        const preRetirementInterestRate = parseFloat(retirementPreInterestRateInput.value) / 100;
        const yearsOfEnjoyment = parseInt(retirementYearsOfEnjoymentInput.value);
        const postRetirementInterestRate = parseFloat(retirementPostInterestRateInput.value) / 100;

        // Validaciones
        if (isNaN(currentAge) || isNaN(desiredRetirementAge) || isNaN(initialSavings) || isNaN(annualContribution) ||
            isNaN(preRetirementInterestRate) || isNaN(yearsOfEnjoyment) || isNaN(postRetirementInterestRate) ||
            currentAge < 1 || desiredRetirementAge <= currentAge || yearsOfEnjoyment < 1 ||
            initialSavings < 0 || annualContribution < 0 || preRetirementInterestRate < 0 || postRetirementInterestRate < 0) {
            alert('Por favor, introduce valores válidos para todos los campos de la calculadora de jubilación. Asegúrate de que la edad de retiro sea mayor que la edad actual y los años de disfrute sean al menos 1.');
            return;
        }

        const yearsToRetirement = desiredRetirementAge - currentAge;
        let totalSavingsAtRetirement = initialSavings;

        // Crecimiento del ahorro antes de jubilarse
        for (let i = 0; i < yearsToRetirement; i++) {
            totalSavingsAtRetirement += annualContribution; // Contribución al inicio del año
            totalSavingsAtRetirement *= (1 + preRetirementInterestRate); // Interés al final del año
        }
         // Si hay contribución inicial pero 0 años para retirarse, no debería crecer con interés pre-retiro.
        if (yearsToRetirement === 0) {
             // Si no hay años para retirarse, el ahorro total es la inicial más la contribución anual de este "año 0"
             // No se aplica interés pre-retiro si no transcurre al menos un año de inversión.
            totalSavingsAtRetirement = initialSavings + annualContribution;
        }


        // Simulación de consumo de ahorros después de jubilarse
        let monthlyIncome = 0;
        let finalCapitalDepletionYears = 0;
        
        if (yearsOfEnjoyment > 0 && totalSavingsAtRetirement > 0) {
            const n_months_enjoyment = yearsOfEnjoyment * 12;
            const i_monthly_post = postRetirementInterestRate / 12;

            if (postRetirementInterestRate === 0) {
                monthlyIncome = totalSavingsAtRetirement / n_months_enjoyment;
            } else {
                // Fórmula de anualidad para calcular el pago mensual (ingreso)
                monthlyIncome = (totalSavingsAtRetirement * i_monthly_post * Math.pow(1 + i_monthly_post, n_months_enjoyment)) / (Math.pow(1 + i_monthly_post, n_months_enjoyment) - 1);
                if (isNaN(monthlyIncome) || !isFinite(monthlyIncome)) { // Fallback si el cálculo es muy sensible
                     monthlyIncome = totalSavingsAtRetirement / n_months_enjoyment;
                }
            }
            
            // Recalcular cuánto duraría el capital con ese ingreso mensual exacto
            let tempCapital = totalSavingsAtRetirement;
            let monthsLasted = 0;
            if (monthlyIncome > 0) { // Solo simular si hay un ingreso mensual positivo
                while (tempCapital > 0 && monthsLasted < (yearsOfEnjoyment * 12 * 2)) { // Limitar iteraciones para evitar bucles infinitos
                    tempCapital = tempCapital * (1 + i_monthly_post) - monthlyIncome;
                    if (tempCapital >= 0) { // Contar el mes si el capital sigue siendo positivo o cero después del retiro
                       monthsLasted++;
                    } else { 
                        break; 
                    }
                }
                finalCapitalDepletionYears = monthsLasted / 12;

                // Ajuste para que, si el ingreso se calculó para agotar el capital en "yearsOfEnjoyment",
                // la simulación no muestre más años debido a la precisión decimal.
                if (monthlyIncome > 0 && postRetirementInterestRate > 0) {
                    let capitalCheck = totalSavingsAtRetirement;
                    for (let m = 0; m < n_months_enjoyment; m++) {
                        capitalCheck = capitalCheck * (1 + i_monthly_post) - monthlyIncome;
                    }
                     // Si el capital se agota según lo previsto (o queda un residuo muy pequeño)
                    if (capitalCheck <= 0.01 && monthsLasted > n_months_enjoyment) {
                        finalCapitalDepletionYears = yearsOfEnjoyment;
                    }
                }


            } else if (totalSavingsAtRetirement > 0) { // Si no se puede calcular un ingreso (ej. 0 interés y 0 años disfrute)
                 finalCapitalDepletionYears = 0; // o 'N/A'
            }


        } else { // yearsOfEnjoyment es 0 o no hay ahorros
            monthlyIncome = 0;
            finalCapitalDepletionYears = 0;
        }


        retirementTotalSavingsSpan.textContent = totalSavingsAtRetirement.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
        retirementMonthlyIncomeSpan.textContent = monthlyIncome.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
        retirementCapitalDepletionSpan.textContent = Math.floor(finalCapitalDepletionYears) + ' Años';
    });
});