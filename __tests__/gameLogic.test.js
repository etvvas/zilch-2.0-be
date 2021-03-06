const { roll, initializeDice, displayScoringOptions, updateDice, filterSelected } = require('../lib/utils/gameLogic.js')

describe('tests game logic functions', () => {
  it('initializes dice array', async () => {
    const sixDice = initializeDice()

    expect(sixDice.length).toBe(6)
    expect(sixDice).toEqual(expect.arrayContaining([{ held: false, value: expect.any(Number) }]))
  })

  const diceOne = [
    {
      held: true,
      value: 4
    },
    {
      held: false,
      value: 1
    },
    {
      held: true,
      value: 2
    },
    {
      held: false,
      value: 5
    },
    {
      held: false,
      value: 5
    },
    {
      held: false,
      value: 5
    },
  ]

  const diceTwo = [
    {
      held: false,
      value: 1
    },
    {
      held: false,
      value: 1
    },
    {
      held: false,
      value: 1
    },
    {
      held: false,
      value: 4
    },
    {
      held: false,
      value: 4
    },
    {
      held: false,
      value: 4
    },
  ]
  const diceThree = [
    {
      held: false,
      value: 4
    },
    {
      held: false,
      value: 4
    },
    {
      held: false,
      value: 4
    },
    {
      held: false,
      value: 4
    },
    {
      held: false,
      value: 4
    },
    {
      held: false,
      value: 4
    },
  ]
  const straightDice = [
    {
      held: false,
      value: 1
    },
    {
      held: false,
      value: 2
    },
    {
      held: false,
      value: 3
    },
    {
      held: false,
      value: 4
    },
    {
      held: false,
      value: 5
    },
    {
      held: false,
      value: 6
    },
  ]
  const fiveAndOnesArray = [
    {
      held: false,
      value: 1
    },
    {
      held: false,
      value: 1
    },
    {
      held: false,
      value: 6
    },
    {
      held: false,
      value: 4
    },
    {
      held: false,
      value: 5
    },
    {
      held: false,
      value: 6
    },
  ]
  const threePairsArray = [
    {
      held: false,
      value: 1
    },
    {
      held: false,
      value: 1
    },
    {
      held: false,
      value: 2
    },
    {
      held: false,
      value: 2
    },
    {
      held: false,
      value: 5
    },
    {
      held: false,
      value: 5
    },
  ]
  const zilchArray = [
    {
      held: true,
      value: 1
    },
    {
      held: true,
      value: 1
    },
    {
      held: true,
      value: 1
    },
    {
      held: false,
      value: 6
    },
    {
      held: false,
      value: 4
    },
    {
      held: false,
      value: 2
    },
  ]
  const fourFives = [
    {
      held: false,
      value: 5
    },
    {
      held: false,
      value: 5
    },
    {
      held: false,
      value: 5
    },
    {
      held: false,
      value: 5
    },
    {
      held: false,
      value: 4
    },
    {
      held: false,
      value: 4
    },
  ]
  const fourThrees = [
    {
      held: false,
      value: 3
    },
    {
      held: false,
      value: 3
    },
    {
      held: false,
      value: 3
    },
    {
      held: false,
      value: 3
    },
    {
      held: false,
      value: 4
    },
    {
      held: false,
      value: 4
    },
  ]
  const fiveThrees = [
    {
      held: false,
      value: 3
    },
    {
      held: false,
      value: 3
    },
    {
      held: false,
      value: 3
    },
    {
      held: false,
      value: 3
    },
    {
      held: false,
      value: 3
    },
    {
      held: false,
      value: 4
    },
  ]

  it('rerolls unheld dice and returns an intact dice array', () => {
    const newDiceArray = roll(diceOne)

    expect(newDiceArray.length).toBe(6)
    expect(newDiceArray).toEqual([
      {
        held: true,
        value: 4
      },
      {
        held: false,
        value: expect.any(Number)
      },
      {
        held: true,
        value: 2
      },
      {
        held: false,
        value: expect.any(Number)
      },
      {
        held: false,
        value: expect.any(Number)
      },
      {
        held: false,
        value: expect.any(Number)
      },
    ])
  })


  it('displays the scoring options from a dice roll', () => {
    console.log('TWO THREE OF A KIND', displayScoringOptions(diceTwo))
    console.log('STRAIGHT DICE', displayScoringOptions(straightDice))
    console.log('1 FIVE AND 2 ONES', displayScoringOptions(fiveAndOnesArray));
    console.log('THREE PAIRS', displayScoringOptions(threePairsArray));
    console.log('ZILCH!!!', displayScoringOptions(zilchArray));
    console.log('FOUR FIVES', displayScoringOptions(fourFives))
    console.log('FOUR THREES', displayScoringOptions(fourThrees))
    console.log('FIVE THREES', displayScoringOptions(fiveThrees))
  })

  it('tests updating scoring options', () => {
    const selectedOptions = filterSelected([
      {
        score: 300,
        choice: '3 3s: Score: 300',
        dice: [['1'], ['1'], ['1']],
        id: 0,
        selected: true
      },
      {
        score: 200,
        choice: "2 1's Score: 200",
        dice: [['1'], ['1'], ['1'], ['1']],
        id: 1,
        selected: true
      },
      {
        score: 100,
        choice: '1 1 Score: 100',
        dice: [[Object], [Object], [Object]],
        id: 2,
        selected: false
      }
    ])
    const dice = initializeDice();
    const scoringOptions = displayScoringOptions(dice)
    console.log('DICE AND OPTIONS', dice, scoringOptions);
    // console.log('FILTERED OPTIONS', selectedOptions);
    // console.log('FLAT', updateDice(selectedOptions));
    console.log('UPDATED DICE', updateDice(dice, scoringOptions));
  })


})