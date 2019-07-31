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


const parser = require('./lib/parser')
const formatter = require('./lib/formatter')

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

// =============== main
const main = () => {
  let blocks = parser.collectBlocks(lines)
  let today = moment(moment.now())
  let yesterday = moment().subtract(1, 'day')
  let lastWeek = moment().subtract(1, 'week')
  let lastMonth = moment().subtract(1, 'month')
  let sumsToday = parser.combineBlocks(blocks, moment(today.clone().startOf('day')), moment(today.clone().endOf('day')), PROJECT_RATES)
  let sumsYesterday = parser.combineBlocks(blocks, moment(yesterday.clone().startOf('day')), moment(yesterday.clone().endOf('day')), PROJECT_RATES)
  let sums2days = parser.combineBlocks(blocks, moment(yesterday.clone().startOf('day')), moment(today.clone().endOf('day')), PROJECT_RATES)
  let sumsWeek = parser.combineBlocks(blocks, moment(today.clone().startOf('week')), moment(today.clone().endOf('week')), PROJECT_RATES)
  let sumsLastWeek = parser.combineBlocks(blocks, moment(lastWeek.clone().startOf('week')), moment(lastWeek.clone().endOf('week')), PROJECT_RATES)
  let sumsMonth = parser.combineBlocks(blocks, moment(today.clone().startOf('month')), moment(today.clone().endOf('month')), PROJECT_RATES)
  let sumsLastMonth = parser.combineBlocks(blocks, moment(lastMonth.clone().startOf('month')), moment(lastMonth.clone().endOf('month')), PROJECT_RATES)
  let namedRanges = {
    "Last month": sumsLastMonth,
    "Month": sumsMonth,
    "Last Week": sumsLastWeek,
    "Week": sumsWeek,
    "Last two days": sums2days,
    "Yesterday": sumsYesterday,
    "Today": sumsToday
  }
  formatter.prettyOutput(namedRanges)
}

let rl = readline.createInterface({
  input: fs.createReadStream(FILE_PATH)
});

rl.on('line', onReadLine)
rl.on('close', main)
