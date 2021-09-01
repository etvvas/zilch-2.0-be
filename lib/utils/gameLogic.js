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

const wordify = (value) => {
  if (value === 1) {
    return 'ONE';
  }
  if (value === 2) {
    return 'TWO';
  }
  if (value === 3) {
    return 'THREE';
  }
  if (value === 4) {
    return 'FOUR';
  }
  if (value === 5) {
    return 'FIVE';
  }
  if (value === 6) {
    return 'SIX';
  }
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

  // three of a kind and higher eg. four of a kind, five of a kind

  if (onesArray.length === 1 && twosArray.length === 1 && threesArray.length === 1 && foursArray.length === 1 && fivesArray.length === 1 && sixesArray.length === 1) {
    const choice = 'STRAIGHT 1500 PTS'
    const score = 1500;
    possibleScoringOptions.push({ score, choice, dice: diceArray })
    return possibleScoringOptions
  }

  const matchingPairs = numbersArray.filter(die => die.length === 2)

  if (matchingPairs.length === 3) {
    const choice = '3 PAIRS: 1500 PTS';
    const score = 1500;
    possibleScoringOptions.push({ score, choice, dice: diceArray })
    return possibleScoringOptions
  }

  //Clean up!!!
  if (onesArray.length === 1) {
    const score = 100;
    const choice = `1 ONE: ${score} PTS`
    possibleScoringOptions.push({ score, choice, dice: onesArray })
  }
  if (fivesArray.length === 1) {
    const score = 50;
    const choice = `1 FIVE: ${score} PTS`
    possibleScoringOptions.push({ score, choice, dice: fivesArray })
  }
  if (onesArray.length === 2) {
    const score = 100 * onesArray.length;
    const choice = `${onesArray.length} ONES: ${score} PTS`
    possibleScoringOptions.push({ score, choice, dice: onesArray })
  }
  if (fivesArray.length === 2) {
    const score = 50 * fivesArray.length;
    const choice = `${fivesArray.length} FIVES: ${score} PTS`
    possibleScoringOptions.push({ score, choice, dice: fivesArray })
  }

  numbersArray.forEach((value, index) => {
    if (value.length >= 3) {
      if (value[0].value == 3 || value[0].value == 5) {
        possibleScoringOptions.filter(option => option.dice[0].value !== value)
      }
      const score = calculateScore(value.length, index + 1);
      const valueToWord = wordify((index + 1))
      const choice = `${value.length} ${valueToWord}S: ${score} PTS`;
      possibleScoringOptions.push({ score, choice, dice: value })
    }
  })


  if (possibleScoringOptions.length === 0) return [{ score: 0, choice: 'ZILCH', dice: [] }]
  return possibleScoringOptions;
}

//given scoring options and dice, sets dice with scoring option selected to held true
const filterSelected = (scoringOptions) => scoringOptions.filter(option => option.selected === true)

const updateDice = (dice, filteredOptions) => {
  const diceOptions = []
  filteredOptions.flat().forEach(option => {
    diceOptions.push(option.dice)
  })
  // return diceOptions.flat(2)
  const updatedDice = dice.map(die => {
    if (diceOptions.flat(2).find(option => option.value === die.value)) return { ...die, held: true }
    return die
  })

  return updatedDice

}

// const optimizeScoringOptions = (scoringOptions) => {
//   const newArray = []
//   const sortedOptions = scoringOptions.sort((a, b) => a.score - b.score)

// }

module.exports = {
  filterSelected,
  updateDice,
  roll,
  initializeDice,
  displayScoringOptions
}