const { roll, initializeDice, reduceDice, displayScoringOptions } = require('../lib/utils/gameLogic.js')

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

  test('testing if reduce of unheld dice provides displays number of each die', () => {
    const output = reduceDice(diceOne);
    expect(output).toEqual({
      '1': 1,
      '5': 3
    })

    const secondOutput = reduceDice(diceTwo);
    expect(secondOutput).toEqual({
      '1': 3,
      '4': 3
    })

  })

  it('displays the scoring options from a dice roll', () => {
    console.log('TWO THREE OF A KIND', displayScoringOptions( diceTwo))
    console.log('STRAIGHT DICE', displayScoringOptions(straightDice))
    console.log('1 FIVE AND 2 ONES', displayScoringOptions(fiveAndOnesArray));
    console.log('THREE PAIRS', displayScoringOptions(threePairsArray));
    console.log('ZILCH!!!', displayScoringOptions(zilchArray));
  })

  // it('takes in a dice roll and returns the three of a kind options', () => {
  //   const firstOutput = reduceDice(diceOne)
  //   const threeOfAKind = threeDie(firstOutput)

  //   expect(threeOfAKind).toEqual([
  //     {
  //       title: 'Three 5\'s',
  //       dieValue: 5,
  //       score: 500,
  //       numberOfDie: 3
  //     }
  //   ])

  //   const secondOutput = reduceDice(diceTwo)
  //   const secondThreeOfAKind = threeDie(secondOutput)

  //   expect(secondThreeOfAKind).toEqual(expect.arrayContaining([
  //     {
  //       title: 'Three 1\'s',
  //       dieValue: 1,
  //       score: 1000,
  //       numberOfDie: 3
  //     },
  //     {
  //       title: 'Three 4\'s',
  //       dieValue: 4,
  //       score: 400,
  //       numberOfDie: 3
  //     }
  //   ]))

  // })
})