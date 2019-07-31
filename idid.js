#!/usr/bin/env node

// ========= configurable

const PROJECT_RATES = {
  project: 0,
  chores: 0,
  corsair: 30,
  default: 50,
}
const FILE_PATH = '/Users/Jan/Dropbox/times.txt'

// ========= includes

const readline = require('readline');
const fs = require('fs');
const moment = require('moment')
const easyTable = require('easy-table')

const parser = require('./parser')

// ========= helpers

let lines = []
let linenumber = 0

let onReadLine = (line) => {
  linenumber++;
  let info = parser.extract_info(line)
  if(info) {
    lines.push({
      ...info,
      number: linenumber,
    });
  }
};

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

let prettyOutput = (namedRanges) => {
  let t = new easyTable();
  let projects = getProjectsFromNamedRanges(namedRanges);
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

// =============== main

let main = () => {
  let blocks = parser.collectBlocks(lines)
  let today = moment(moment.now())
  let yesterday = moment().subtract(1, 'day')
  let lastWeek = moment().subtract(1, 'week')
  let lastMonth = moment().subtract(1, 'month')
  let sumsToday = parser.combineBlocks(blocks, moment(today.clone().startOf('day')), moment(today.clone().endOf('day')))
  let sumsYesterday = parser.combineBlocks(blocks, moment(yesterday.clone().startOf('day')), moment(yesterday.clone().endOf('day')))
  let sums2days = parser.combineBlocks(blocks, moment(yesterday.clone().startOf('day')), moment(today.clone().endOf('day')))
  console.log(today.clone().startOf('week').toString())
  let sumsWeek = parser.combineBlocks(blocks, moment(today.clone().startOf('week')), moment(today.clone().endOf('week')))
  let sumsLastWeek = parser.combineBlocks(blocks, moment(lastWeek.clone().startOf('week')), moment(lastWeek.clone().endOf('week')))
  let sumsMonth = parser.combineBlocks(blocks, moment(today.clone().startOf('month')), moment(today.clone().endOf('month')))
  let sumsLastMonth = parser.combineBlocks(blocks, moment(lastMonth.clone().startOf('month')), moment(lastMonth.clone().endOf('month')))
  let namedRanges = {
    "Last month": sumsLastMonth,
    "Month": sumsMonth,
    "Last Week": sumsLastWeek,
    "Week": sumsWeek,
    "Last two days": sums2days,
    "Yesterday": sumsYesterday,
    "Today": sumsToday
  }
  prettyOutput(namedRanges)
}

let rl = readline.createInterface({
  input: fs.createReadStream(FILE_PATH)
});

rl.on('line', onReadLine)
rl.on('close', main)
