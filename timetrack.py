#!/usr/bin/python
import sys
import os
from datetime import datetime, date, time

FILENAME = os.path.expanduser("~/Dropbox") + '/times.txt'

DATEFORMAT = "%Y/%m/%d %H:%M"
DAYSEPERATOR = "\n============================================================\n\n"
TIMETASKSEPARATOR = " | "

now = datetime.now()
newday = False

f_track = open(FILENAME,"r")
lines = f_track.readlines()
f_track.close()

if lines:
	lastline = lines[-1]
	if lastline.find("|")>=0:
		lastdates = lastline[:lastline.find("|")].strip()
		lastdate = datetime.strptime(lastdates,DATEFORMAT)
		if lastdate.day != now.day:
			newday = True

buf = ""

if newday:
	buf+=DAYSEPERATOR
buf+=now.strftime(DATEFORMAT)
buf+=TIMETASKSEPARATOR
args = sys.argv[1:]
if len(args) > 1:
	if args[0] == "-project":
		buf+= "[" + args[1] + "] "
		args = args[2:]
buf+=" ".join(args)
buf+="\n"

f_track = open(FILENAME,"a")
f_track.write(buf)
f_track.close()
print buf
