LogJiraWork
===========
A crude method for keeping track of the amount of time you worked on a Jira task. And, returns the tracked work time in Jira format.

Setup
=====
1. Make sure you have node.js installed on your machine; this script has only been tested on Mavericks (10.9.1) with node.js (v0.10.13)
2. Clone this repo to your machine or copy and paste the contents from LogJiraWork/job.js to your machine
3. In the job.js file, you want to change 'TIME_FILE' to point to a different file; this file will store data about your Jira task
4. Save and that's it!

Note: Since this script will be used from the terminal, it'll be more useful to create aliases with this script (see below for more commands) e.g.

```javascript
alias startTime='node ~/fromGit/LogJiraWork/job.js start'
```

Commands
========
Each command is an argument to job.js e.g.
```javascript
node job.js start
```

### start
Starts the job timer e.g.

```javascript
$ node job.js start
Started timer at 2/18/2014;00:59:40
```

### stop
Stops the job timer and returns the tracked work time in Jira format e.g.

```javascript
$ node job.js stop
Ended timer at 2/18/2014;01:01:12
Jira format: 2m 
```

### last
Shows the last finished job in JSON e.g.

```javascript
$ node job.js last
{
	"startMs": 1392685860245,
	"endMs": 1392685951067,
	"elapsed": 90822,
	"jira": "2m ",
	"startTimeSlice": "2/17/2014;17:11:00",
	"endTimeSlice": "2/17/2014;17:12:31"
}
```

### clean
Deletes the file that TIME_FILE is pointing to.
