const { roll, initializeDice, reduceDice, threeDie } = require('../lib/utils/gameLogic.js')

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
        held: true,
        value: 4
      },
    ])
  })

  test('testing if reduce of unheld dice provides displays number of each die', () => {
    const output = reduceDice(diceTwo);
    threeDie(output)
    expect(output).toEqual({
      '1': 3,
      '4': 3,
      '5': 1,
      '6':1
    })
    const secondOutput = reduceDice(diceOne);
    threeDie(secondOutput)
    expect(secondOutput).toEqual({
      '1': 1,
      '2': 1,
      '5': 3,
      '6':1
    })

  })
})