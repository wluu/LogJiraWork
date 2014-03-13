LogJiraWork
===========
A crude method for keeping track of the amount of time you worked on a Jira task. And, returns the tracked work time in Jira format.

Also, because I don't like wasting post-its.

Setup
=====
Make sure you have node.js installed on your machine; this script has only been tested on Mavericks (10.9.2) with node.js (v0.10.13 & v0.10.26)

There are a couple of ways to use this module on your machine, with the simplest being installing as a global node module. This is pretty easy to do:

```
$ sudo npm install -g wluu/LogJiraWork
```

You then access the module just by running `jiratrack`.

An alternate way is to:

1. Clone this repo to your machine
2. Globally install the repo:

```$ sudo npm install -g LogJiraWork/```

or inside the repo

```$ sudo npm install -g .```

Then, start using this module by running `jiratrack`.


Commands
========

**Note:** The commands below will refer to <TICKET_NUM> as any jobs that you started (e.g. TIMOB-123, task1, etc).
However, jiratrack is not case-sensitive, so ```jiratrack --start TIMOB-123``` is different from
```jiratrack --start timob-123```.

### --start <TICKET_NUM>
Starts the job timer e.g.

```javascript
$ jiratrack --start TIMOB-1234
Started timer at Tue Mar 11 2014 22:12:08 GMT-0700 (PDT)
```

### --pause <TICKET_NUM>
Pause the job timer.

**Note:** Can only be used after calling the --start flag or the --resume flag.

```javascript
$ jiratrack --start TIMOB-1234
Started timer at Tue Mar 11 2014 22:30:04 GMT-0700 (PDT)

$ jiratrack --pause TIMOB-1234
Pausing timer at Tue Mar 11 2014 22:42:05 GMT-0700 (PDT)

$ jiratrack --resume TIMOB-1234
Resuming timer at Tue Mar 11 2014 22:43:13 GMT-0700 (PDT)

$ jiratrack --pause TIMOB-1234
Pausing timer at Tue Mar 11 2014 22:45:02 GMT-0700 (PDT)
```

### --resume <TICKET_NUM>
Resume the job timer.

**Note:** Can only be used after using the --pause flag.

```javascript
$ jiratrack --start TIMOB-1234
Started timer at Tue Mar 11 2014 22:30:04 GMT-0700 (PDT)

$ jiratrack --pause TIMOB-1234
Pausing timer at Tue Mar 11 2014 22:42:05 GMT-0700 (PDT)

$ jiratrack --resume TIMOB-1234
Resuming timer at Tue Mar 11 2014 22:43:13 GMT-0700 (PDT)
```

### --stop <TICKET_NUM>
Stops the job timer and returns the tracked work time in Jira format e.g.

```javascript
$ jiratrack --stop TIMOB-1234
Ended timer at Tue Mar 11 2014 22:19:18 GMT-0700 (PDT)
Jira format: 2m
```

### --last
Shows the last finished job in JSON e.g.

```javascript
$ jiratrack --last
{
	"startMs": 1392685860245,
	"endMs": 1392685951067,
	"elapsed": 90822,
	"jira": "2m ",
	"startTimeSlice": "2/17/2014;17:11:00",
	"endTimeSlice": "2/17/2014;17:12:31"
}
```

### --set-time-path
Sets the path that jiratrack will store your log data to e.g.

```
$ jiratrack --set-time-path=/Users/User/Desktop/tracker.json
```

**Note:** By default, jiratrack will use **any** directory that you are currently in to store
your log data. However, jiratrack will not save the location that you are currently in until you use
this flag.

### --set-default-path
Sets the path that jiratrack should use to be the current working directory

```
$ jiratrack --set-default-path

Example:

$ pwd
/Users/iwhitfield
$ jiratrack --get-default-path
Logs will be saved to /Users/iwhitfield/time.json
$ cd /Users/iwhitfield/Desktop
$ jiratrack --get-time-path
Logs will be saved to /Users/iwhitfield/Desktop/time.json
```

### --get-time-path
Returns the current path that jiratrack is using to log out to.

```
$ jiratrack --get-time-path
Logs will be saved to /Users/iwhitfield/Desktop/time.json
```

### --list-jobs
Returns a list of started jobs, but not finished jobs (--stop).

```
$ jiratrack --list-jobs

Here is a list of all currently stored unfinished jobs:

1. TIMOB-1234
2. TIMOB-230
3. TIMOB-9879

```

### --clean
Deletes the file that --set-time-path is pointing to.
