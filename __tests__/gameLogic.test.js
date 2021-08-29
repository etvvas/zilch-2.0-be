const { roll, initializeDice } = require('../lib/utils/gameLogic.js')

describe('tests game logic functions', () => {
  it('initializes dice array', async () => {
    const sixDice = initializeDice()

    expect(sixDice.length).toBe(6)
    expect(sixDice).toEqual(expect.arrayContaining([{ held: false, value: expect.any(Number) }]))
  })

  it('rerolls unheld dice and returns an intact dice array', () => {
    const dice = [
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

    const newDiceArray = roll(dice)

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
})