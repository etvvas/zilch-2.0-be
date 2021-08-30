const roll = (dice) => {
  return dice.map(item => {
    if (item.held) return item;
    return {
      held: false,
      value: Math.ceil(Math.random() * 6)
    }
  })
}

const initializeDice = () => {
  return [...Array(6)].map(() => {
    return {
      held: false,
      value: Math.ceil(Math.random() * 6)
    }
  })
}

// shoutout to Dani
const filterDiceValue = (diceArray, number) => diceArray.filter(dice => dice.value === number)

const filterDiceHeld = (diceArray) => diceArray.filter(dice => !dice.held)

// calculate score function
// inspiration from zilch 1.0
const calculateScore = (arrayLength, dieValue) => {
  let i = 3;
  let number = 500;

  if (dieValue == 2) number = 100;
  if (dieValue == 3) number = 150;
  if (dieValue == 4) number = 200;
  if (dieValue == 5) number = 250;
  if (dieValue == 6) number = 300;

  while (i <= arrayLength) {
    number = number * 2
    i++
  }

  return number
}

const displayScoringOptions = (diceArray) => {
  let possibleScoringOptions = [];

  const filterDice = filterDiceHeld(diceArray);

  const onesArray = filterDiceValue(filterDice, 1)
  const twosArray = filterDiceValue(filterDice, 2)
  const threesArray = filterDiceValue(filterDice, 3)
  const foursArray = filterDiceValue(filterDice, 4)
  const fivesArray = filterDiceValue(filterDice, 5)
  const sixesArray = filterDiceValue(filterDice, 6)

  const numbersArray = [onesArray, twosArray, threesArray, foursArray, fivesArray, sixesArray]

  numbersArray.forEach((value, index) => {
    if (value.length >= 3) {
      const score = calculateScore(value.length, index + 1);
      const choice = `${value.length} ${index + 1}s: Score: ${score}`;
      possibleScoringOptions.push({ score, choice, dice: value })
    }
  })

  if (onesArray.length === 1 && twosArray.length === 1 && threesArray.length === 1 && foursArray.length === 1 && fivesArray.length === 1 && sixesArray.length === 1) {
    const choice = 'Straight 1500 pts'
    const score = 1500;
    possibleScoringOptions.push({ score, choice, dice: diceArray })
  }

  //Clean up!!!
  if (onesArray.length === 1) {
    const score = 100;
    const choice = `${onesArray.length} 1's Score: ${score}`
    possibleScoringOptions.push({ score, choice, dice: onesArray })
  }
  if (fivesArray.length === 1) {
    const score = 50;
    const choice = `${fivesArray.length} 5's Score: ${score}`
    possibleScoringOptions.push({ score, choice, dice: fivesArray })
  }
  if (onesArray.length === 2) {
    const score = 100 * onesArray.length;
    const choice = `${onesArray.length} 1's Score: ${score}`
    possibleScoringOptions.push({ score, choice, dice: onesArray }, { score: score / 2, choice: `${1} 1 Score: ${score / 2}`, dice: [{ value: 1, held: false }] })
  }
  if (fivesArray.length === 2) {
    const score = 50 * fivesArray.length;
    const choice = `${fivesArray.length} 5's Score: ${score}`
    possibleScoringOptions.push({ score, choice, dice: fivesArray }, { score: score / 2, choice: `${1} 5 Score: ${score / 2}`, dice: [{ value: 5, held: false }] })
  }

  const matchingPairs = numbersArray.filter(die => die.length === 2)

  if (matchingPairs.length === 3) {
    const choice = '3 Pairs: 1500pts';
    const score = 1500;
    possibleScoringOptions.push({ score, choice, dice: diceArray })

  }

  if (possibleScoringOptions.length === 0) return [{ score: 0, choice: 'ZILCH', dice: [] }]
  return possibleScoringOptions;
}

module.exports = {
  roll,
  initializeDice,
  displayScoringOptions
}