document.addEventListener('DOMContentLoaded', () => {
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
        
        const initialNumValue = parseFloat(input.value);
        valueSpan.textContent = initialNumValue.toLocaleString('es-ES', { minimumFractionDigits: precision, maximumFractionDigits: precision }) + unit;
    }

    const retirementForm = document.getElementById('retirement-form');

    const currentAgeInput = document.getElementById('rc-current-age');
    const currentAgeRange = document.getElementById('rc-current-age-range');
    const desiredAgeInput = document.getElementById('rc-desired-age');
    const desiredAgeRange = document.getElementById('rc-desired-age-range');
    const initialContributionInput = document.getElementById('rc-initial-contribution');
    const initialContributionRange = document.getElementById('rc-initial-contribution-range');
    const annualContributionInput = document.getElementById('rc-annual-contribution');
    const annualContributionRange = document.getElementById('rc-annual-contribution-range');
    const preInterestRateInput = document.getElementById('rc-pre-interest-rate');
    const preInterestRateRange = document.getElementById('rc-pre-interest-rate-range');
    const yearsOfEnjoymentInput = document.getElementById('rc-years-of-enjoyment');
    const yearsOfEnjoymentRange = document.getElementById('rc-years-of-enjoyment-range');
    const postInterestRateInput = document.getElementById('rc-post-interest-rate');
    const postInterestRateRange = document.getElementById('rc-post-interest-rate-range');

    const totalSavingsSpan = document.getElementById('rc-total-savings');
    const monthlyIncomeSpan = document.getElementById('rc-monthly-income');
    const capitalDepletionSpan = document.getElementById('rc-capital-depletion');

    if (currentAgeInput && currentAgeRange && currentAgeRange.nextElementSibling) {
        syncSlider(currentAgeInput, currentAgeRange, currentAgeRange.nextElementSibling, ' Años');
    }
    if (desiredAgeInput && desiredAgeRange && desiredAgeRange.nextElementSibling) {
        syncSlider(desiredAgeInput, desiredAgeRange, desiredAgeRange.nextElementSibling, ' Años');
    }
    if (initialContributionInput && initialContributionRange && initialContributionRange.nextElementSibling) {
        syncSlider(initialContributionInput, initialContributionRange, initialContributionRange.nextElementSibling, ' €');
    }
    if (annualContributionInput && annualContributionRange && annualContributionRange.nextElementSibling) {
        syncSlider(annualContributionInput, annualContributionRange, annualContributionRange.nextElementSibling, ' €');
    }
    if (preInterestRateInput && preInterestRateRange && preInterestRateRange.nextElementSibling) {
        syncSlider(preInterestRateInput, preInterestRateRange, preInterestRateRange.nextElementSibling, ' %', 2);
    }
    if (yearsOfEnjoymentInput && yearsOfEnjoymentRange && yearsOfEnjoymentRange.nextElementSibling) {
        syncSlider(yearsOfEnjoymentInput, yearsOfEnjoymentRange, yearsOfEnjoymentRange.nextElementSibling, ' Años');
    }
    if (postInterestRateInput && postInterestRateRange && postInterestRateRange.nextElementSibling) {
        syncSlider(postInterestRateInput, postInterestRateRange, postInterestRateRange.nextElementSibling, ' %', 2);
    }

    if (retirementForm) {
        retirementForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const currentAge = parseInt(currentAgeInput.value);
            const desiredRetirementAge = parseInt(desiredAgeInput.value);
            let initialSavings = parseFloat(initialContributionInput.value);
            const annualContribution = parseFloat(annualContributionInput.value);
            const preRetirementInterestRate = parseFloat(preInterestRateInput.value) / 100;
            const yearsOfEnjoyment = parseInt(yearsOfEnjoymentInput.value);
            const postRetirementInterestRate = parseFloat(postInterestRateInput.value) / 100;

            if (isNaN(currentAge) || isNaN(desiredRetirementAge) || isNaN(initialSavings) || isNaN(annualContribution) ||
                isNaN(preRetirementInterestRate) || isNaN(yearsOfEnjoyment) || isNaN(postRetirementInterestRate) ||
                currentAge < 1 || desiredRetirementAge <= currentAge || yearsOfEnjoyment < 1 ||
                initialSavings < 0 || annualContribution < 0 || preRetirementInterestRate < 0 || postRetirementInterestRate < 0) {
                alert('Por favor, introduce valores válidos para todos los campos. Asegúrate de que la edad de retiro sea mayor que la edad actual y los años de disfrute sean al menos 1.');
                return;
            }

            const yearsToRetirement = desiredRetirementAge - currentAge;
            let totalSavingsAtRetirement = initialSavings;

            for (let i = 0; i < yearsToRetirement; i++) {
                totalSavingsAtRetirement += annualContribution;
                totalSavingsAtRetirement *= (1 + preRetirementInterestRate);
            }
            if (yearsToRetirement === 0) {
                totalSavingsAtRetirement = initialSavings + annualContribution;
            }

            let monthlyIncome = 0;
            let finalCapitalDepletionYears = 0;
            
            if (yearsOfEnjoyment > 0 && totalSavingsAtRetirement > 0) {
                const n_months_enjoyment = yearsOfEnjoyment * 12;
                const i_monthly_post = postRetirementInterestRate / 12;

                if (postRetirementInterestRate === 0 || i_monthly_post === 0) { 
                    monthlyIncome = totalSavingsAtRetirement / n_months_enjoyment;
                } else {
                    const compoundFactor = Math.pow(1 + i_monthly_post, n_months_enjoyment);
                    if (compoundFactor === 1) { 
                         monthlyIncome = totalSavingsAtRetirement / n_months_enjoyment;
                    } else {
                        monthlyIncome = (totalSavingsAtRetirement * i_monthly_post * compoundFactor) / (compoundFactor - 1);
                    }
                }
                if (isNaN(monthlyIncome) || !isFinite(monthlyIncome) || monthlyIncome <=0) { 
                     monthlyIncome = (totalSavingsAtRetirement > 0 && n_months_enjoyment > 0) ? totalSavingsAtRetirement / n_months_enjoyment : 0;
                }
                
                let tempCapital = totalSavingsAtRetirement;
                let monthsLasted = 0;
                if (monthlyIncome > 0) {
                    
                    const max_simulation_months = Math.max(n_months_enjoyment * 2, 12 * 100); 
                    while (tempCapital > 0.01 && monthsLasted < max_simulation_months) { 
                        tempCapital = tempCapital * (1 + i_monthly_post) - monthlyIncome;
                        if (tempCapital >= -0.01) { 
                           monthsLasted++;
                        } else { 
                            break; 
                        }
                    }
                    finalCapitalDepletionYears = monthsLasted / 12;

                    if (postRetirementInterestRate > 0 && Math.abs(finalCapitalDepletionYears - yearsOfEnjoyment) < 0.1 && finalCapitalDepletionYears > yearsOfEnjoyment) {
                        let capitalCheck = totalSavingsAtRetirement;
                        for (let m = 0; m < n_months_enjoyment; m++) {
                            capitalCheck = capitalCheck * (1 + i_monthly_post) - monthlyIncome;
                        }
                        if (capitalCheck <= 0.01) { 
                            finalCapitalDepletionYears = yearsOfEnjoyment;
                        }
                    }
                } else if (totalSavingsAtRetirement <= 0) {
                    monthlyIncome = 0;
                    finalCapitalDepletionYears = 0;
                } else { 
                    finalCapitalDepletionYears = (monthlyIncome === 0 && totalSavingsAtRetirement > 0) ? Infinity : 0; 
                }


            } else {
                monthlyIncome = 0;
                finalCapitalDepletionYears = (totalSavingsAtRetirement > 0) ? Infinity : 0;
            }

            totalSavingsSpan.textContent = totalSavingsAtRetirement.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
            monthlyIncomeSpan.textContent = monthlyIncome.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
            if (finalCapitalDepletionYears === Infinity) {
                 capitalDepletionSpan.textContent = 'No se agota';
            } else {
                capitalDepletionSpan.textContent = Math.floor(finalCapitalDepletionYears) + ' Años';
            }
        });
    } else {
        console.error("Retirement form not found!");
    }
});