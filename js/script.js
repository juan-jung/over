// 게임 상태 관리
let selectedItems = [];
let targetNumber = null;
let lastItemWasNumber = false;

// DOM 요소
const selectedItemsContainer = document.getElementById('selected-items');
const targetNumberInput = document.getElementById('target-number');
const calculateButton = document.getElementById('calculate-btn');
const resultArea = document.getElementById('result');

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

// 가능한 모든 수식 조합 찾기
function findPossibleExpressions(numbers, operators, target) {
    const results = [];
    
    // 숫자 배열의 모든 순열 생성
    function getPermutations(arr) {
        if (arr.length <= 1) return [arr];
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
            const remainingPerms = getPermutations(remaining);
            for (const perm of remainingPerms) {
                result.push([current, ...perm]);
            }
        }
        return result;
    }

    // 연산자 배열의 모든 조합 생성
    function getOperatorCombinations(length) {
        const result = [];
        function generate(current) {
            if (current.length === length) {
                result.push([...current]);
                return;
            }
            for (const op of operators) {
                current.push(op);
                generate(current);
                current.pop();
            }
        }
        generate([]);
        return result;
    }

    // 숫자 연결 (예: 1,0,1,8 -> 1018)
    function connectNumbers(numArray) {
        // 모든 가능한 숫자 연결 조합을 생성
        const result = [];
        
        // 기본 케이스: 연결 없이 원래 배열 반환
        result.push([...numArray.map(n => parseInt(n))]);
        
        // 2개 이상의 숫자가 있을 경우에만 연결 시도
        if (numArray.length >= 2) {
            // 모든 가능한 숫자 쌍 시도
            for (let i = 0; i < numArray.length; i++) {
                for (let j = 0; j < numArray.length; j++) {
                    if (i !== j) {
                        // 두 숫자 연결
                        const connected = numArray[i] + numArray[j];
                        const newArray = [...numArray];
                        newArray.splice(Math.max(i, j), 1);
                        newArray.splice(Math.min(i, j), 1, connected);
                        
                        // 재귀적으로 더 많은 연결 시도
                        const moreConnections = connectNumbers(newArray);
                        result.push(...moreConnections);
                        
                        // 순서를 바꿔서도 연결 시도 (예: 10+18 vs 18+10)
                        const reversedConnected = numArray[j] + numArray[i];
                        const reversedArray = [...numArray];
                        reversedArray.splice(Math.max(i, j), 1);
                        reversedArray.splice(Math.min(i, j), 1, reversedConnected);
                        
                        const moreReversedConnections = connectNumbers(reversedArray);
                        result.push(...moreReversedConnections);
                    }
                }
            }
        }
        
        // 중복 제거를 위해 문자열화한 Set 사용
        const uniqueResults = new Set(result.map(arr => JSON.stringify(arr)));
        return Array.from(uniqueResults).map(str => JSON.parse(str));
    }

    // 숫자 순열 생성
    const numberPermutations = getPermutations(numbers);
    
    // 연산자 조합 생성
    let maxOperators = numbers.length - 1;
    const operatorCombinations = [];
    
    // 연산자의 조합 수가 1부터 maxOperators까지 다양할 수 있음
    for (let i = 1; i <= maxOperators; i++) {
        operatorCombinations.push(...getOperatorCombinations(i));
    }

    // 모든 가능한 조합 시도
    for (const numPerm of numberPermutations) {
        // 숫자 연결 조합 생성
        const connectedNumberSets = connectNumbers(numPerm);
        
        for (const connectedNumbers of connectedNumberSets) {
            for (const ops of operatorCombinations) {
                // 숫자와 연산자 조합이 유효한지 확인
                if (ops.length !== connectedNumbers.length - 1) continue;
                
                const expression = [];
                for (let i = 0; i < connectedNumbers.length; i++) {
                    expression.push(connectedNumbers[i]);
                    if (i < ops.length) {
                        expression.push(ops[i]);
                    }
                }
                
                const result = calculateExpression(expression);
                if (!isNaN(result) && Math.abs(result - target) < 0.0001) {
                    results.push({
                        expression: expression.join(' '),
                        result: result
                    });
                }
            }
        }
    }

    return results;
}

// 계산 버튼 이벤트 리스너
calculateButton.addEventListener('click', () => {
    const target = parseFloat(targetNumberInput.value);
    if (isNaN(target)) {
        showResult('올바른 숫자를 입력해주세요.');
        return;
    }

    // 숫자와 연산자 분리
    const numbers = selectedItems.filter(item => !isNaN(item)).map(item => item.toString());
    const operators = selectedItems.filter(item => isNaN(item));

    if (numbers.length === 0) {
        showResult('숫자를 선택해주세요.');
        return;
    }

    // 가능한 수식 찾기
    const possibleExpressions = findPossibleExpressions(numbers, operators, target);

    if (possibleExpressions.length > 0) {
        // 첫 번째 가능한 수식 표시
        const expression = possibleExpressions[0];
        showResult(`가능한 수식: ${expression.expression} = ${expression.result}`);
    } else {
        showResult('주어진 숫자와 연산자로 만들 수 없습니다.');
    }
});

// 수식 계산
function calculateExpression(items) {
    if (items.length === 0) return 0;

    let result = parseFloat(items[0]);
    for (let i = 1; i < items.length; i += 2) {
        const operator = items[i];
        const operand = parseFloat(items[i + 1]);

        if (isNaN(operand)) {
            return NaN;
        }

        switch (operator) {
            case '+':
                result += operand;
                break;
            case '-':
                result -= operand;
                break;
            case '×':
            case '*':  // * 기호도 처리
                result *= operand;
                break;
            case '÷':
            case '/':  // / 기호도 처리
                if (operand === 0) {
                    return NaN;
                }
                result /= operand;
                break;
        }
    }

    return result;
}

// 결과 표시
function showResult(message) {
    resultArea.textContent = message;
    resultArea.style.color = message.includes('가능한 수식') ? '#28a745' : '#dc3545';
}

// 입력 필드 엔터 키 이벤트
targetNumberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        calculateButton.click();
    }
});