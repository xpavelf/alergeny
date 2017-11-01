const { ignore: IGNORED_ALLERGENS, ...ALLERGENS_MAP} = require('./allergens.json')
const rDiac = require('diacritics').remove

const ALLERGENS = Object.keys(ALLERGENS_MAP)
  .reduce((sum, code) => {
    let arr = ALLERGENS_MAP[code].map(a => ({ rx: RegExp(rDiac(a), 'gi'), length: a.length, code: parseInt(code) }))
    return sum.concat(arr)
  }, [])

const replaceRx = RegExp('(' + rDiac(IGNORED_ALLERGENS.join('|')) + ')', "g")

const __isOverlaping = (hitX, hitY) => {
  let hitX0 = hitX.index
  let hitX1 = hitX0 + hitX.length - 1
  let hitY0 = hitY.index
  let hitY1 = hitY0 + hitY.length - 1

  return hitX0 <= hitY1 && hitY0 <= hitX1
}

const getAllergens = (ingredients, e = []) => {
  let ing = Array.isArray(ingredients) ? ingredients.join(',') : ingredients
  let ingStriped = rDiac(ing + ',' + e.join(','))
    .toLowerCase()
    .replace(replaceRx, '')

  let allHits = []

  ALLERGENS.forEach(a => {
    let match
    while (match = a.rx.exec(ingStriped)) {
      allHits.push({ index: match.index, length: a.length, a: a.code})
    }
  })


  let hits = []

  allHits.sort((a, b) => b.length - a.length)
    .forEach(hit => {
      let overlaping = hits.some(hx => __isOverlaping(hx, hit))
      if (!overlaping) {
        hits.push(hit)
      }
    })

  let allergens = hits.map(hit => hit.a)

  return [...new Set(allergens)].sort((a, b) => a - b)
}

//console.log(getAllergens("vajecny konak, jecny, rybi tuk, pouzio v zite"))

module.exports.getAllergens = getAllergens
