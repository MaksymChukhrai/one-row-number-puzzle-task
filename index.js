async function loadFragments() {
  const response = await fetch("fragments.json");
  const data = await response.json();
  return data.fragments;
}

function findLongestSequence(fragments) {
  function tryBuildSequence(startFragment) {
    const usedFragments = new Set([startFragment]);
    let currentSequence = startFragment;
    let remainingFragments = new Set(
      fragments.filter((f) => f !== startFragment)
    );

    while (remainingFragments.size > 0) {
      let foundConnection = false;

      for (let fragment of remainingFragments) {
        if (currentSequence.slice(-2) === fragment.slice(0, 2)) {
          currentSequence += fragment.slice(2);
          usedFragments.add(fragment);
          remainingFragments.delete(fragment);
          foundConnection = true;
          break;
        }
      }

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

      // Якщо не знайшли відповідне з'єднання, завершуємо пошук
      if (!foundConnection) break;
    }

    return {
      sequence: currentSequence,
      usedFragments: Array.from(usedFragments),
      remainingFragments: Array.from(remainingFragments),
    };
  }

  let bestResult = {
    sequence: "",
    usedFragments: [],
    remainingFragments: fragments,
  };

  // Пробуємо старт із кожного фрагмента
  for (let startFragment of fragments) {
    const currentResult = tryBuildSequence(startFragment);

    // Критерії вибору найкращого результату:
    // 1. Максимальна довжина послідовності
    // 2. Мінімум невикористаних фрагментів, що залишилися
    if (
      currentResult.sequence.length > bestResult.sequence.length ||
      (currentResult.sequence.length === bestResult.sequence.length &&
        currentResult.remainingFragments.length <
          bestResult.remainingFragments.length)
    ) {
      bestResult = currentResult;
    }
  }

  return bestResult;
}

function validateSequence(sequence, fragments) {
  const originalFragments = [...fragments];
  const usedFragments = [];
  const remainingFragments = new Set(originalFragments);
  let reconstructedSequence = "";

  function connectFragments(currentSequence, fragmentsLeft) {
    if (currentSequence === sequence) {
      reconstructedSequence = currentSequence;
      return true; // Повну послідовність знайдено
    }

    for (let fragment of Array.from(fragmentsLeft)) {
      const lastTwoDigits = currentSequence.slice(-2);
      const firstTwoDigits = fragment.slice(0, 2);

      if (lastTwoDigits === firstTwoDigits) {
        usedFragments.push(fragment);
        fragmentsLeft.delete(fragment);

        if (
          connectFragments(currentSequence + fragment.slice(2), fragmentsLeft)
        ) {
          return true;
        }

        usedFragments.pop();
        fragmentsLeft.add(fragment);
      }
    }
    return false;
  }

  // Запускаємо з'єднання з першим фрагментом
  for (let fragment of fragments) {
    if (sequence.startsWith(fragment)) {
      usedFragments.push(fragment);
      remainingFragments.delete(fragment);
      reconstructedSequence = fragment;

      if (connectFragments(fragment, remainingFragments)) {
        break;
      }

      // Якщо не вдалося побудувати послідовність, скидання
      usedFragments.pop();
      remainingFragments.add(fragment);
    }
  }

  const isValidConnection = reconstructedSequence === sequence;

  console.log(`Довжина послідовності: ${reconstructedSequence.length}`);
  console.log(
    `Використано фрагментів: ${usedFragments.length} из ${originalFragments.length}`
  );
  console.log("Використані фрагменти:", usedFragments);
  console.log("Коректність поєднання фрагментів:", isValidConnection);

  return {
    sequence,
    usedFragments,
    isValidConnection,
    reconstructedSequence,
    remainingFragments: Array.from(remainingFragments),
  };
}

async function main() {
  console.log("Main function started");
  try {
    const fragments = await loadFragments();
    console.log("Fragments loaded:", fragments.length);

    const longestSequenceResult = findLongestSequence(fragments);
    const validationResult = validateSequence(
      longestSequenceResult.sequence,
      fragments
    );

    document.getElementById("result").textContent =
      longestSequenceResult.sequence;
    document.getElementById("digits").textContent =
      longestSequenceResult.sequence.length;
    document.getElementById("fragments").textContent = new Set(
      validationResult.usedFragments
    ).size;
    document.getElementById("loaded").textContent = fragments.length;

    console.log("Найдовша послідовність:", longestSequenceResult.sequence);

    console.log(
      "Використано унікальних фрагментів:",
      new Set(validationResult.usedFragments).size
    );
    console.log(
      "Залишилося невикористаних фрагментів:",
      validationResult.remainingFragments.length
    );
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();
