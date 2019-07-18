# timetrack
simple command line tool to record free text with a time-stamp and aggregate time spent on projects

Clone this repo and add it to your PATH.

Now any text you write on the command line starting with an `i` will be logged into the text-file `times.txt`, together with the current time-stamp.

```
> i just pushed timetrack to github
> cat times.txt
2015/01/30 18:27 | just pushed timetrack to github
```

Timetrack also supports subjects for certain topics by passing the `-project` parameter. You can either do this manually, via an alias or via `wrapper files`.

Writing `timetrack '-project' 'some-project' some text with a subject` will create the following entry

``` bash
~ tail times.txt
2015/01/30 18:28 | [some-project] some text with a subject

# using an alias
alias ibm='~/timetrack/timetrack.py "-project" "IBM"'

~ ibm fixing thing A
2019/07/18 07:23 | [IBM] fixing thing A
```

## Time spent
You can get an overview of time spent on a project for today, current week, current month

``` bash
# enter some data (using aliases)
~ ibm start
~ ibm doing some work
~ ibm stop
~ lin start
~ lin working on prototype
~ lin done: oauth login
~ lin stop

# contents of source file
~ cat times.txt
2019/07/18 07:21 | [IBM] start
2019/07/18 07:23 | [IBM] fixing thing A
2019/07/18 12:23 | [IBM] stop
2019/07/18 13:25 | [LinkedIn] start
2019/07/18 13:25 | [LinkedIn] working on prototype
2019/07/18 15:26 | [LinkedIn] done: oauth login
2019/07/18 15:26 | [LinkedIn] stop

~ idid.js
Project     This month hours  This week hours  Last two days hours  Today hours
----------  ----------------  ---------------  -------------------  -----------
[IBM]       5.0               5.0              5.0                  5.0
[LinkedIn]  2.0               2.0              2.0                  2.0
----------  ----------------  ---------------  -------------------  -----------
            7.0               7.0              7.0                  7.0
```

## Recommended aliases
``` bash
  # add aliases for the main files for tracking and reporting
  alias i='~/projects/timetrack/timetrack.py'
  alias idid='~/projects/timetrack/idid.js'

  # add aliases for the projects you want to track
  alias ibm='~/projects/timetrack/timetrack.py "-project" "IBM"'
  alias lin='~/projects/timetrack/timetrack.py "-project" "LinkedIn"'
```

Enjoy!
