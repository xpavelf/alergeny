const allergens = require('./allergens.json')
const removeDiacritics = require('diacritics').remove
const allStriped = Object.keys(allergens).reduce((sum, k) => {
  let striped = allergens[k].map(s => removeDiacritics(s).toLowerCase())
  return Object.assign({}, sum, {[k]: striped})
}, {})

const replaceRx = RegExp('(' + allStriped.ignore.join('|') + ')', "g")

const __isOverlaping = (hitX, hitY) => {
  let hitX0 = hitX.index
  let hitX1 = hitX0 + hitX.length - 1
  let hitY0 = hitY.index
  let hitY1 = hitY0 + hitY.length - 1

  return hitX0 <= hitY1 && hitY0 <= hitX1
}

const getAllergens = (ingredients, e = []) => {
  let ing = Array.isArray(ingredients) ? ingredients.join(',') : ingredients
  let ingStriped = removeDiacritics(ing + ',' + e.join(','))
    .toLowerCase()
    .replace(replaceRx, '')

  let allHits = []

  Object.keys(allStriped)
    .forEach(key => {
      let names = allStriped[key]
      names.forEach(name => {
        let regexp = new RegExp(name, "g")
        let match
        while (match = regexp.exec(ingStriped)) {
          allHits.push({ index: match.index, length: name.length, a: parseInt(key)})
        }
      })
    })

  let hits = []

  allHits.sort((a, b) => b.length - a.length)
    .forEach(hit => {
      let overlaping = hits.some(hx => __isOverlaping(hx, hit))
      if (!overlaping) {
        hits.push(hit)
      }
    })

  let allergens = hits.map(hit => hit.a).sort()

  return [...new Set(allergens)]
}

// getAllergens("vajecny konak, jecny, rybi tuk, pouzio v zite")

module.exports.getAllergens = getAllergens
