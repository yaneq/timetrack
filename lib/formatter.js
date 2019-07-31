const easyTable = require('easy-table')
const parser = require('./parser')

const totalOptions = (name) => {
  return {
    init: [0,0],
    printer: function(val, width) {
      return `${val[0] ? val[0].toFixed(1) : ''} (${val[1]})`
    },
    reduce: (acc, val) => {
      let values = (val || '0 0').split(' ')
      acc[0] += parseFloat(values[0] || 0)
      acc[1] += parseFloat(values[1].replace(/[()]/g, '') || 0);
      return acc
    }
  }
}

const prettyOutput = (namedRanges) => {
  let t = new easyTable();
  let projects = parser.getProjectsFromNamedRanges(namedRanges);
  projects.forEach((project) => {
    t.cell('Project', project)
    Object.keys(namedRanges).forEach((rangeKey) => {
      ranges = namedRanges[rangeKey]
      range = ranges.filter((range) => {return range.project === project})
      if(range.length > 0) {
        t.cell(rangeKey, `${range[0].hours.toFixed(1)} (${range[0].total.toFixed()})`)
      }
    })
    t.newRow()
  })

  Object.keys(namedRanges).forEach((name) => {
    t.total(name, totalOptions())
  })
  console.log(t.toString())
}

module.exports = {
  prettyOutput: prettyOutput
}
