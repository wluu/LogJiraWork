LogJiraWork
===========
A crude method for keeping track of the amount of time you worked on a Jira task. And, returns the tracked work time in Jira format.

Setup
=====
Make sure you have node.js installed on your machine; this script has only been tested on Mavericks (10.9.1) with node.js (v0.10.13 & v0.10.26)

There are a couple of ways to use this module on your machine, with the simplest being installing as a global node module. This is pretty easy to do:

```
$ sudo npm install -g wluu/LogJiraWork
```

You then access the module just by running `jiratrack`.

An alternate way is to use the module locally;

1. Clone this repo to your machine or copy and paste the contents from LogJiraWork/job.js to your machine
2. In the job.js file, you want to change 'TIME_FILE' to point to a different file; this file will store data about your Jira task
3. Save and that's it!

You then need to access via `node job.js`. You can substitute "jiratrack" for "node job.js" below.

Commands
========
Each command is an argument to job.js e.g.
```javascript
jiratrack --start
```

### start
Starts the job timer e.g.

```javascript
$ jiratrack --start
Started timer at 2/18/2014;00:59:40
```

### stop
Stops the job timer and returns the tracked work time in Jira format e.g.

```javascript
$ jiratrack --stop
Ended timer at 2/18/2014;01:01:12
Jira format: 2m
```

### last
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

### set-time-path
Sets the path that jiratrack should log out to e.g.

```
$ jiratrack --set-time-path=/Users/User/Desktop/tracker.json
```

### set-default-path
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

### get-time-path
Returns the current path that jiratrack is using to log out to

### clean
Deletes the file that TIME_FILE is pointing to.