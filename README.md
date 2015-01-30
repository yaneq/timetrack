# timetrack
simple command line tool to record free text with a time-stamp

Clone this repo and add it to your PATH.

Now any text you write on the command line starting with an `i` will be logged into the text-file `times.txt`, together with the current time-stamp.

```
> i just pushed timetrack to github
> cat times.txt
2015/01/30 18:27 | just pushed timetrack to github
```

Timetrack also supports subjects for certain topics by passing the `-project` parameter. You can either do this manually, via an alias or via `wrapper files`.

Writing `timetrack '-project' 'some-project' some text with a subject` will create the following entry

```
> tail times.txt
2015/01/30 18:28 | [some-project] some text with a subject
```

I wrote this project initially to track my hours I spent on different projects, but later also started to use it as a kind of diary for more than 4 years now.

Enjoy!
