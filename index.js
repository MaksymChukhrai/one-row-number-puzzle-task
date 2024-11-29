async function loadFragments() {
    const response = await fetch('fragments.json');
    const data = await response.json();
    return data.fragments;
}

function findLongestSequence(fragments) {
    function tryBuildSequence(startFragment) {
        const usedFragments = new Set([startFragment]);
        let currentSequence = startFragment;
        let remainingFragments = new Set(fragments.filter(f => f !== startFragment));

        while (remainingFragments.size > 0) {
            let foundConnection = false;

            // Пробуем продолжить последовательность вперед
            for (let fragment of remainingFragments) {
                if (currentSequence.slice(-2) === fragment.slice(0, 2)) {
                    currentSequence += fragment.slice(2);
                    usedFragments.add(fragment);
                    remainingFragments.delete(fragment);
                    foundConnection = true;
                    break;
                }
            }

            // Если вперед не получилось, пробуем назад
            if (!foundConnection) {
                for (let fragment of remainingFragments) {
                    if (fragment.slice(-2) === currentSequence.slice(0, 2)) {
                        currentSequence = fragment + currentSequence.slice(2);
                        usedFragments.add(fragment);
                        remainingFragments.delete(fragment);
                        foundConnection = true;
                        break;
                    }
                }
            }

            // Если не нашли подходящее соединение, завершаем поиск
            if (!foundConnection) break;
        }

        return {
            sequence: currentSequence,
            usedFragments: Array.from(usedFragments),
            remainingFragments: Array.from(remainingFragments)
        };
    }

    let bestResult = { sequence: '', usedFragments: [], remainingFragments: fragments };

    // Пробуем старт с каждого фрагмента
    for (let startFragment of fragments) {
        const currentResult = tryBuildSequence(startFragment);

        // Критерии выбора лучшего результата:
        // 1. Максимальная длина последовательности
        // 2. Минимум оставшихся неиспользованных фрагментов
        if (currentResult.sequence.length > bestResult.sequence.length ||
            (currentResult.sequence.length === bestResult.sequence.length && 
             currentResult.remainingFragments.length < bestResult.remainingFragments.length)) {
            bestResult = currentResult;
        }
    }

    return bestResult;
}

function validateSequence(sequence, fragments) {
    const originalFragments = [...fragments];
    const usedFragments = [];
    const remainingFragments = new Set(originalFragments);
    let reconstructedSequence = '';

    function connectFragments(currentSequence, fragmentsLeft) {
        if (currentSequence === sequence) {
            reconstructedSequence = currentSequence; // Обновляем восстановленную последовательность
            return true; // Полная последовательность найдена
        }

        for (let fragment of Array.from(fragmentsLeft)) {
            const lastTwoDigits = currentSequence.slice(-2);
            const firstTwoDigits = fragment.slice(0, 2);

            if (lastTwoDigits === firstTwoDigits) {
                usedFragments.push(fragment);
                fragmentsLeft.delete(fragment);

                if (connectFragments(currentSequence + fragment.slice(2), fragmentsLeft)) {
                    return true;
                }

                // Откат, если путь оказался тупиковым
                usedFragments.pop();
                fragmentsLeft.add(fragment);
            }
        }
        return false;
    }

    // Запускаем соединение с первым фрагментом
    for (let fragment of fragments) {
        if (sequence.startsWith(fragment)) {
            usedFragments.push(fragment);
            remainingFragments.delete(fragment);
            reconstructedSequence = fragment;

            if (connectFragments(fragment, remainingFragments)) {
                break;
            }

            // Если не удалось построить последовательность, сброс
            usedFragments.pop();
            remainingFragments.add(fragment);
        }
    }

    const isValidConnection = reconstructedSequence === sequence;

    console.log(`Длина последовательности: ${reconstructedSequence.length}`);
    console.log(`Использовано фрагментов: ${usedFragments.length} из ${originalFragments.length}`);
    console.log('Использованные фрагменты:', usedFragments);
    console.log('Корректность соединения:', isValidConnection);
    console.log('Восстановленная последовательность:', reconstructedSequence);
    console.log('Исходная последовательность:', sequence);

    return {
        sequence,
        usedFragments,
        isValidConnection,
        reconstructedSequence,
        remainingFragments: Array.from(remainingFragments),
    };
}






async function main() {
    console.log('Main function started');
    try {
        const fragments = await loadFragments();
        console.log('Fragments loaded:', fragments.length);

        const longestSequenceResult = findLongestSequence(fragments);
        const validationResult = validateSequence(longestSequenceResult.sequence, fragments);
        
        document.getElementById('result').textContent = longestSequenceResult.sequence;
        document.getElementById('digits').textContent = longestSequenceResult.sequence.length;
        document.getElementById('fragments').textContent = new Set(validationResult.usedFragments).size;
        document.getElementById('loaded').textContent = fragments.length;
        console.log('Longest Sequence:', longestSequenceResult.sequence);

        console.log('Самая длинная последовательность:', longestSequenceResult.sequence);
        
        
        console.log('Использовано уникальных фрагментов:', new Set(validationResult.usedFragments).size);
        console.log('Осталось неиспользованных фрагментов:', validationResult.remainingFragments.length);
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main();