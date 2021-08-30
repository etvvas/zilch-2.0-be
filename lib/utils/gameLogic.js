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

const threeDie = (dice) => {
  const scoringArray = Object.entries(dice)
  let threes = []
  for(let i = 0; i < scoringArray.length; i++){
    if(scoringArray[i][0]=== '1' && scoringArray[i][1] === 3){
      const threeOnes = {
        'title': 'Three 1\'s',
        [scoringArray[i][0]]: scoringArray[i][0] * 1000
      }
      console.log('THREE ONES', threeOnes)
      threes.push(threeOnes)
    }
    if(scoringArray[i][1] === 3 && scoringArray[i][0] !== '1') {
      const threeOfAKind = {
        'title': `Three ${scoringArray[i][0]}'s`,
       [scoringArray[i][0]]: scoringArray[i][0] * 100
      }
      console.log('THREE OF A KIND', threeOfAKind)
      threes.push(threeOfAKind)
    }
  }
}

module.exports = {
  roll,
  initializeDice,
  reduceDice,
  threeDie
}