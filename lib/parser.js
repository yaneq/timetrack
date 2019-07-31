const moment = require('moment')
const chalk = require('chalk')

const extract_info = (line) => {
  let results = line.match(/(\d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}) \| (\[.+?\])?\s?(.*)/);
  if (results) {
    return {
      'timestamp': moment(results[1], 'YYYY/MM/DD HH:mm'),
      'project': results[2],
      'text': results[3],
    }
  }
}

const collectBlocks = (lines) => {
  let active_blocks = {};
  let blocks = [];
  lines.forEach((line) => {
    if(line.project) {
      if(line.text.match(/^start( |$)/)) {
        if (active_blocks[line.project]) {
          throw chalk.red.bold(`[line ${line.number}] block for ${line.project} already open`)
        }
        active_blocks[line.project] = line.timestamp

      }
      if(line.text.match(/^stop( |$)/)) {
        if (!active_blocks[line.project]) {
          throw chalk.red.bold(`[line ${line.number}] block for ${line.project} ended, but was not open`)
        }
        minutes = moment.duration(line.timestamp.diff(active_blocks[line.project])).asMinutes()
        blocks.push({
          project: line.project,
          start: active_blocks[line.project],
          end: line.timestamp,
          minutes: minutes
        })
        active_blocks[line.project] = null
        if(minutes > 500) {
          throw chalk.yellow.bold(`[line ${line.number}] is ${minutes} long, split in several`)
        }
        // console.log('closed block', line.project, line.number, minutes)
      }
    }
  })

  let open_blocks = Object
    .entries(active_blocks)
    .filter((e)=>{return !!e[1]})
    .map((block) => `${block[0]}: ${moment.duration(moment(moment.now()).diff(block[1])).asMinutes().toFixed()} mins\n`)

  if (open_blocks.length > 0) {
    console.log(chalk.yellow('\n========================================================='))
    console.log(chalk.yellow.bold(`\n  Active blocks: ${open_blocks}`))
    console.log(chalk.yellow('=========================================================\n'))
  }
  return blocks;
}

const combineBlocks = (blocks, filterStart, filterEnd, project_rates) => {
  let sums = {}
  blocks.forEach((block) => {
    let blockStart = block.start, blockEnd = block.end;
    if (blockEnd > filterStart && blockStart < filterEnd) {
      if (!sums[block.project]) {
        sums[block.project] = 0
      }
      if (blockStart < filterStart) { blockStart = filterStart }
      if (blockEnd > filterEnd) { blockEnd = filterEnd }
      let duration = moment.duration(blockEnd.diff(blockStart)).asMinutes()
      sums[block.project] += duration
    }
  })
  let totals = Object.keys(sums).map((key) => {
    sum = sums[key]
    rate = project_rates ? project_rates[key] || project_rates['default'] || 0 : 0
    return {
      project: key,
      minutes: sum,
      hours: sum/60,
      total: sum/60 * rate,
    }
  })
  return totals
}

const getProjectsFromNamedRanges = (namedRanges) => {
  let projects = new Set()
  Object.keys(namedRanges).forEach((rangeKey) => {
    range = namedRanges[rangeKey]
    range.forEach((entry) => {projects.add(entry.project)})
  })
  return projects
}

module.exports = {
  extract_info: extract_info,
  collectBlocks: collectBlocks,
  combineBlocks: combineBlocks,
  getProjectsFromNamedRanges: getProjectsFromNamedRanges,
}
