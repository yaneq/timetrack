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

/**
 * Displays ranges in table form
 * @param Range[] namedRanges: array of ranges with accumulated time per project
 * @param string[] rangeNamesActiveProject: list of active time range names. Projects that do not have active logged hours in any of the passed named time ranges will not be shown
 */
const prettyOutput = (namedRanges, activeRangeNames = ['Last month', 'Month']) => {
  let t = new easyTable();
  let projects = parser.getProjectsFromNamedRanges(namedRanges);
  projects.forEach((project) => {
    const activeRanges = activeRangeNames
      .map(rangeKey => namedRanges[rangeKey])
    const isProjectActive = activeRanges.some(range => range.some(block => block.project === project))
    if(isProjectActive) {

      t.cell('Project', project)
      Object.keys(namedRanges).forEach((rangeKey) => {
        ranges = namedRanges[rangeKey]
        range = ranges.filter((range) => {return range.project === project})
        if(range.length > 0) {
          t.cell(rangeKey, `${range[0].hours.toFixed(1)} (${range[0].total.toFixed()})`)
        }
      })
      t.newRow()
    }
  })

  Object.keys(namedRanges).forEach((name) => {
    t.total(name, totalOptions())
  })
  console.log(t.toString())
}

module.exports = {
  prettyOutput: prettyOutput
}
