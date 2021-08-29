const { roll, initializeDice, reduceDice } = require('../lib/utils/gameLogic.js')

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
        held: true,
        value: 4
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
    expect(output).toEqual({
      '1': 2,
      '4': 2,
      '5': 1,
      '6':1
    })
  })
})