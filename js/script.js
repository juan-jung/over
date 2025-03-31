// 게임 상태 관리
let selectedItems = [];
let targetNumber = null;
let lastItemWasNumber = false;
let isCalculating = false;

// DOM 요소
const selectedItemsContainer = document.getElementById('selected-items');
const targetNumberInput = document.getElementById('target-number');
const calculateButton = document.getElementById('calculate-btn');
const resultArea = document.getElementById('result');
const loadingIndicator = document.createElement('div');
loadingIndicator.id = 'loading-indicator';
loadingIndicator.textContent = '계산 중...';
loadingIndicator.style.display = 'none';
loadingIndicator.style.color = '#007bff';
loadingIndicator.style.marginTop = '10px';
document.getElementById('result').parentNode.insertBefore(loadingIndicator, resultArea.nextSibling);

// 숫자 버튼 이벤트 리스너
document.querySelectorAll('.number-btn').forEach(button => {
    button.addEventListener('click', () => {
        const number = button.textContent;
        addSelectedItem(number);
    });
});

// 연산자 버튼 이벤트 리스너
document.querySelectorAll('.operator-btn').forEach(button => {
    button.addEventListener('click', () => {
        const operator = button.textContent;
        addSelectedItem(operator);
    });
});

// 선택된 항목 추가
function addSelectedItem(item) {
    const isNumber = !isNaN(item);
    
    if (isNumber && lastItemWasNumber && selectedItems.length > 0) {
        // 마지막 항목이 숫자이고 현재 항목도 숫자인 경우
        const lastItem = selectedItems[selectedItems.length - 1];
        const combinedNumber = lastItem + item;
        
        // 연결된 숫자가 20 이하인 경우에만 연결
        if (parseInt(combinedNumber) <= 20) {
            selectedItems[selectedItems.length - 1] = combinedNumber;
        } else {
            selectedItems.push(item);
        }
    } else {
        selectedItems.push(item);
    }
    
    lastItemWasNumber = isNumber;
    updateSelectedItems();
}

// 선택된 항목 업데이트
function updateSelectedItems() {
    selectedItemsContainer.innerHTML = '';
    
    selectedItems.forEach((item, index) => {
        const itemSpan = document.createElement('span');
        itemSpan.className = 'selected-item';
        itemSpan.textContent = item;
        itemSpan.onclick = () => removeSelectedItem(index);
        selectedItemsContainer.appendChild(itemSpan);
    });
}

// 선택된 항목 삭제
function removeSelectedItem(index) {
    selectedItems.splice(index, 1);
    // 마지막 항목이 숫자인지 확인
    lastItemWasNumber = selectedItems.length > 0 && !isNaN(selectedItems[selectedItems.length - 1]);
    updateSelectedItems();
}

// 개선된 숫자 조합 생성 알고리즘
function generateAllNumberCombinations(numbers) {
    // 결과 저장
    const allCombinations = [];
    
    // 재귀적으로 모든 가능한 조합 생성
    function generateCombinations(currentNumbers, usedIndices, currentCombination) {
        // 현재 조합 저장
        if (currentCombination.length > 0) {
            allCombinations.push([...currentCombination]);
        }
        
        // 이미 모든 숫자를 사용했으면 종료
        if (usedIndices.size === numbers.length) {
            return;
        }
        
        // 숫자 추가 시도
        for (let i = 0; i < numbers.length; i++) {
            if (usedIndices.has(i)) continue;
            
            // 새 숫자 추가
            currentCombination.push(numbers[i]);
            usedIndices.add(i);
            
            // 재귀 호출
            generateCombinations(numbers, usedIndices, currentCombination);
            
            // 연결 시도 (마지막 숫자와 합치기)
            if (currentCombination.length >= 2) {
                const lastIndex = currentCombination.length - 1;
                const secondLastIndex = lastIndex - 1;
                
                // 마지막 두 숫자를 연결
                const combined = currentCombination[secondLastIndex] + currentCombination[lastIndex];
                
                // 연결된 숫자가 너무 크지 않으면
                if (parseInt(combined) <= 9999) {
                    // 현재 조합에서 마지막 두 항목 제거
                    currentCombination.splice(secondLastIndex, 2);
                    // 연결된 숫자 추가
                    currentCombination.push(combined);
                    
                    // 새 조합으로 재귀
                    generateCombinations(numbers, usedIndices, currentCombination);
                    
                    // 원상 복구
                    currentCombination.pop();
                    currentCombination.push(numbers[i-1]);
                    currentCombination.push(numbers[i]);
                }
            }
            
            // 백트래킹
            usedIndices.delete(i);
            currentCombination.pop();
        }
    }
    
    // 조합 생성 시작
    generateCombinations(numbers, new Set(), []);
    
    return allCombinations;
}

// 개선된 숫자 조합 생성 메인 함수 
function generateImprovedNumberCombinations(numbers) {
    const combinations = new Set();
    const numCount = numbers.length;
    
    // 가능한 모든 숫자 순서 생성 (순열)
    function generatePermutations(arr) {
        const result = [];
        if (arr.length === 0) return [[]];
        
        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
            const perms = generatePermutations(remaining);
            
            for (const perm of perms) {
                result.push([current, ...perm]);
            }
        }
        
        return result;
    }
    
    // 모든 가능한 숫자 순서 생성
    const allPermutations = generatePermutations(numbers);
    
    // 각 순열에 대해
    for (const perm of allPermutations) {
        // 다양한 연결 방식 시도
        // 1. 단일 숫자들
        combinations.add(JSON.stringify(perm));
        
        // 2. 인접한 숫자들 연결 시도
        for (let i = 0; i < perm.length - 1; i++) {
            // 두 숫자 연결
            const connected = [...perm.slice(0, i), perm[i] + perm[i+1], ...perm.slice(i+2)];
            combinations.add(JSON.stringify(connected));
            
            // 세 숫자 연결 (있다면)
            if (i < perm.length - 2) {
                const tripleConnected = [...perm.slice(0, i), perm[i] + perm[i+1] + perm[i+2], ...perm.slice(i+3)];
                combinations.add(JSON.stringify(tripleConnected));
                
                // 네 숫자 연결 (있다면)
                if (i < perm.length - 3) {
                    const quadConnected = [...perm.slice(0, i), perm[i] + perm[i+1] + perm[i+2] + perm[i+3], ...perm.slice(i+4)];
                    combinations.add(JSON.stringify(quadConnected));
                }
            }
        }
    }
    
    // JSON 문자열에서 실제 배열로 변환
    return Array.from(combinations).map(json => JSON.parse(json));
}

// 개선된 목표 숫자를 위한 표현식 찾기 함수
function findExpressionForTarget(numbers, operators, target) {
    // 숫자와 연산자가 없으면 빈 결과 반환
    if (numbers.length === 0 || operators.length === 0) {
        return [];
    }
    
    // 숫자 조합 생성 - 개선된 알고리즘 사용
    const numberCombinations = generateImprovedNumberCombinations(numbers);
    
    // 결과 저장용
    const results = [];
    
    // 가능한 모든 연산자 조합 생성
    function generateOperatorCombinations(ops, len) {
        if (len === 0) return [[]];
        
        const result = [];
        for (let i = 0; i < ops.length; i++) {
            const subCombos = generateOperatorCombinations(
                [...ops.slice(0, i), ...ops.slice(i+1)], 
                len - 1
            );
            
            for (const subCombo of subCombos) {
                result.push([ops[i], ...subCombo]);
            }
        }
        
        return result;
    }
    
    // 각 숫자 조합에 대해
    for (const numCombo of numberCombinations) {
        // 숫자가 하나인 경우
        if (numCombo.length === 1 && Math.abs(parseInt(numCombo[0]) - target) < 0.0001) {
            results.push({
                expression: numCombo[0].toString(),
                result: parseInt(numCombo[0])
            });
            continue;
        }
        
        // 숫자가 여러 개인 경우, 필요한 연산자 개수는 (숫자 개수 - 1)
        const neededOps = numCombo.length - 1;
        
        // 충분한 연산자가 없으면 건너뛰기
        if (neededOps > operators.length) continue;
        
        // 가능한 연산자 조합 생성
        const opCombinations = generateOperatorCombinations(operators, neededOps);
        
        // 각 연산자 조합에 대해
        for (const ops of opCombinations) {
            // 수식 생성
            const expr = [];
            for (let i = 0; i < numCombo.length; i++) {
                expr.push(numCombo[i]);
                if (i < ops.length) {
                    expr.push(ops[i]);
                }
            }
            
            // 수식 계산
            const result = calculateExpression(expr);
            if (!isNaN(result) && Math.abs(result - target) < 0.0001) {
                results.push({
                    expression: expr.join(' '),
                    result: result
                });
                return results; // 첫 번째 결과 찾으면 바로 반환
            }
        }
    }
    
    return results;
}

// 수식 계산 (연산자 우선순위 적용)
function calculateExpression(items) {
    if (items.length === 0) return 0;
    if (items.length === 1) return parseFloat(items[0]);
    
    // 표현식 복사
    const expr = [...items];
    
    // 곱셈과 나눗셈 먼저 처리
    for (let i = 1; i < expr.length; i += 2) {
        if (expr[i] === '×' || expr[i] === '*' || expr[i] === '÷' || expr[i] === '/') {
            const left = parseFloat(expr[i-1]);
            const right = parseFloat(expr[i+1]);
            
            if (isNaN(left) || isNaN(right)) return NaN;
            
            let result;
            if (expr[i] === '×' || expr[i] === '*') {
                result = left * right;
            } else {
                if (right === 0) return NaN; // 0으로 나누기 방지
                result = left / right;
            }
            
            // 계산 결과로 대체
            expr.splice(i-1, 3, result);
            i -= 2; // 인덱스 조정
        }
    }
    
    // 덧셈과 뺄셈 처리
    let result = parseFloat(expr[0]);
    for (let i = 1; i < expr.length; i += 2) {
        const operand = parseFloat(expr[i+1]);
        if (isNaN(operand)) return NaN;
        
        if (expr[i] === '+') {
            result += operand;
        } else if (expr[i] === '-') {
            result -= operand;
        }
    }
    
    return result;
}

// 계산 버튼 이벤트 리스너
calculateButton.addEventListener('click', () => {
    // 이미 계산 중이면 중복 실행 방지
    if (isCalculating) return;
    
    const target = parseFloat(targetNumberInput.value);
    if (isNaN(target)) {
        showResult('올바른 숫자를 입력해주세요.', false);
        return;
    }

    // 숫자와 연산자 분리
    const numbers = selectedItems.filter(item => !isNaN(item)).map(item => item.toString());
    const operators = selectedItems.filter(item => isNaN(item));

    if (numbers.length === 0) {
        showResult('숫자를 선택해주세요.', false);
        return;
    }
    
    // 로딩 표시
    loadingIndicator.style.display = 'block';
    resultArea.textContent = '';
    isCalculating = true;
    
    // 계산을 백그라운드에서 수행
    setTimeout(() => {
        try {
            // 계산 수행
            const startTime = performance.now();
            const results = findExpressionForTarget(numbers, operators, target);
            const endTime = performance.now();
            
            // 로딩 숨기기
            loadingIndicator.style.display = 'none';
            
            if (results.length > 0) {
                // 첫 번째 가능한 수식 표시
                const expression = results[0];
                showResult(`가능한 수식: ${expression.expression} = ${expression.result}`, true);
                
                // 계산 시간 정보 표시
                const timeInfo = document.createElement('div');
                timeInfo.textContent = `계산 시간: ${((endTime - startTime) / 1000).toFixed(2)}초`;
                timeInfo.style.color = '#888';
                timeInfo.style.fontSize = '0.8em';
                timeInfo.style.marginTop = '5px';
                resultArea.appendChild(timeInfo);
            } else {
                showResult('주어진 숫자와 연산자로 만들 수 없습니다.', false);
            }
        } catch (error) {
            console.error('계산 중 오류 발생:', error);
            showResult('계산 중 오류가 발생했습니다: ' + error.message, false);
        } finally {
            isCalculating = false;
        }
    }, 50);
});

// 결과 표시
function showResult(message, isSuccess) {
    resultArea.textContent = message;
    resultArea.style.color = isSuccess ? '#28a745' : '#dc3545';
}

// 입력 필드 엔터 키 이벤트
targetNumberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        calculateButton.click();
    }
});

// 초기화 버튼 추가
const resetButton = document.createElement('button');
resetButton.textContent = '초기화';
resetButton.className = 'btn btn-secondary';
resetButton.style.marginLeft = '10px';
resetButton.addEventListener('click', () => {
    selectedItems = [];
    updateSelectedItems();
    resultArea.textContent = '';
    loadingIndicator.style.display = 'none';
});
calculateButton.parentNode.appendChild(resetButton);