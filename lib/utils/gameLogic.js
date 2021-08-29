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

const reduceDice = (dice) => {
  const unheldDice = dice.filter(die => !die.held)
 return unheldDice.reduce((accumulator, current) => {
   if (!accumulator.hasOwnProperty(current.value)) accumulator[current.value] = 1
   else {
     accumulator[current.value] = accumulator[current.value]+= 1
    }
    return accumulator
  },{})
}

module.exports = {
  roll,
  initializeDice,
  reduceDice
}