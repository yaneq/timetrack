#!/usr/bin/env node

// ========= configurable

const NON_BILLABLE_PROJECTS = ['[project]', '[chores]']
const FILE_PATH = '/Users/Jan/Dropbox/times.txt'

// ========= includes

const readline = require('readline');
const fs = require('fs');
const moment = require('moment')
const easyTable = require('easy-table')
const chalk = require('chalk')

// ========= helpers

let lines = []
let linenumber = 0

let extract_info = (line) => {
  let results = line.match(/(\d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}) \| (\[.+?\])?\s?(.*)/);
  if (results) {
    return {
      'timestamp': moment(results[1], 'YYYY/MM/DD HH:mm'),
      'project': results[2],
      'text': results[3],
    }
  }
}

let collectBlocks = (lines) => {
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

  if (Object.values(active_blocks).filter((obj) => obj ).length > 0) {
    console.log(chalk.yellow('\n========================================================='))
    console.log(chalk.yellow.bold(`\n  Warning: open block remaining: ${Object.entries(active_blocks).filter((e)=>{return !!e[1]}).map((e)=>e[0])}\n`))
    console.log(chalk.yellow('=========================================================\n'))
  }
  return blocks;
}

let combineBlocks = (blocks, filterStart, filterEnd) => {
  let sums = {}
  blocks.forEach((block) => {
    let blockStart = block.start, blockEnd = block.end;
    if (blockEnd > filterStart && blockStart < filterEnd) {
      if(!sums[block.project]) {
        sums[block.project] = 0
      }
      if(blockStart < filterStart) { blockStart = filterStart }
      if(blockEnd > filterEnd) { blockEnd = filterEnd }
      let duration = moment.duration(blockEnd.diff(blockStart)).asMinutes()
      sums[block.project] += duration
    }
  })
  let totals = Object.keys(sums).map((key) => {
    sum = sums[key]
    return {
      project: key,
      minutes: sum,
      hours: sum/60,
      total: NON_BILLABLE_PROJECTS.indexOf(key) === -1 ? sum/60*50 : 0
    }
  })
  return totals
}

let onReadLine = (line) => {
  linenumber++;
  let info = extract_info(line)
  if(info) {
    lines.push({
      ...info,
      number: linenumber,
    });
  }
};

let combineRanges = (ranges) => {
  let total = {}
  Object.keys(ranges).forEach((rangeKey) => {
    Object.keys(sums).forEach((sumKey) => {
      entry = sums[sumKey]

    })
  })
}

let getProjectsFromNamedRanges = (namedRanges) => {
  let projects = new Set()
  Object.keys(namedRanges).forEach((rangeKey) => {
    range = namedRanges[rangeKey]
    range.forEach((entry) => {projects.add(entry.project)})
  })
  return projects
}

const totalOptions = (name) => {
  return {
    printer: function(val, width) {
      return val.toFixed(1)
    },
    reduce: (acc, val) => {
      return acc + parseFloat(val || 0)
    }
  }
}

let prettyOutput = (namedRanges) => {
  let t = new easyTable();
  let projects = getProjectsFromNamedRanges(namedRanges);
  projects.forEach((project) => {
    t.cell('Project', project)
    Object.keys(namedRanges).forEach((rangeKey) => {
      ranges = namedRanges[rangeKey]
      range = ranges.filter((range) => {return range.project === project})
      if(range.length > 0) {
        t.cell(rangeKey + ' hours', range[0].hours.toFixed(1))
        t.cell(rangeKey + ' USD', range[0].total.toFixed())
      }
    })
    t.newRow()
  })

  Object.keys(namedRanges).forEach((name) => {
    t.total(name + ' hours', totalOptions())
    t.total(name + ' USD', totalOptions())
  })
  console.log(t.toString())
}

// =============== main

let main = () => {
  let blocks = collectBlocks(lines)
  let today = moment(moment.now())
  let yesterday = moment().subtract(1, 'day')
  let lastMonth = moment().subtract(1, 'month')
  let sumsToday = combineBlocks(blocks, moment(today.startOf('day')), moment(today.endOf('day')))
  let sumsYesterday = combineBlocks(blocks, moment(yesterday.startOf('day')), moment(yesterday.endOf('day')))
  let sums2days = combineBlocks(blocks, moment(yesterday.startOf('day')), moment(today.endOf('day')))
  let sumsWeek = combineBlocks(blocks, moment(today.startOf('week')), moment(today.endOf('week')))
  let sumsMonth = combineBlocks(blocks, moment(today.startOf('month')), moment(today.endOf('month')))
  let sumsLastMonth = combineBlocks(blocks, moment(lastMonth.startOf('month')), moment(lastMonth.endOf('month')))
  let namedRanges = { "Last month": sumsLastMonth, "This month": sumsMonth, "This week": sumsWeek, "Last two days": sums2days, "Yesterday": sumsYesterday, "Today": sumsToday}
  prettyOutput(namedRanges)
}

let rl = readline.createInterface({
  input: fs.createReadStream(FILE_PATH)
});

rl.on('line', onReadLine)
rl.on('close', main)
