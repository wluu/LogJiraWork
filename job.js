#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2)),
    exec = require('shelljs').exec,
    fs   = require('fs'),
    path = require('path'),
    print = console.log;

var CONFIG_FILE = path.join(__dirname, 'config.js');

var stat = fs.statSync(CONFIG_FILE);
if(!canWrite(process.uid === stat.uid, process.gid === stat.gid, stat.mode)) {
    exec('sudo chmod 777 ' + CONFIG_FILE, {
        async:false
    });
}

var config;
try {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE));
} catch(e) {
    // We don't care, because we default to current dir anyway
}
var TIME_FILE = config.path || path.join(process.cwd(), 'time.json');

if(args.start){
    pleaseEnter('start');
    var jobs = { };

    try {
        var j = JSON.parse(fs.readFileSync(TIME_FILE, {encoding: 'utf8'})),
            d = j[args.start];

        if(d && !~d.endMs){
            throw new Error('Already started timer on ' + d.startTimeSlice);
        } else {
            jobs = j;
        }
    } catch(err) {
        if(err.message === 'ENOENT, no such file or directory \'' + TIME_FILE + '\''){
            print(TIME_FILE + ' doesn\'t exist. Will create one.');
            fs.appendFileSync(TIME_FILE, '');
            // and continue forward to start the timer
        } else {
            print(err.message);
            return;
        }
    }

    var timeSlice = getTimeSlice(new Date());
    print('Started timer at ' + timeSlice);

    jobs[args.start] = {
        ticket: args.start, // Only here for the --last flag
        startMs: Date.now(),
        endMs: -1,
        pausesMs: [],
        elapsed: 0,
        jira: '',
        startTimeSlice: timeSlice,
        endTimeSlice: ''
    };
    fs.writeFileSync(TIME_FILE, JSON.stringify(jobs, null, 4));
} else if(args.pause){
    pleaseEnter('paus');

    var jobs    = null,
        lastJob = null;

    try {
        jobs    = JSON.parse(fs.readFileSync(TIME_FILE, {encoding: 'utf8'})),
        lastJob = jobs[args.pause];

        var totalPauses = lastJob.pausesMs.length;
        if(totalPauses > 0 && totalPauses%2){
            // assuming pausesMs = [pause_n, resume_m, pause_m]
            throw new Error('Cannot pause again since you already pause your current task.');
        }
    } catch(err) {
        if(err.message === 'ENOENT, no such file or directory \'' + TIME_FILE + '\''){
            print('Cannot pause if you didn\'t start a task.');
        } else {
            print(err.message);
        }
        return;
    }

    print('Pausing timer at ' + getTimeSlice(new Date()));
    lastJob.pausesMs.push(Date.now());
    fs.writeFileSync(TIME_FILE, JSON.stringify(jobs, null, 4));
} else if(args.resume){
    pleaseEnter('resume');

    var jobs    = null,
        lastJob = null;

    try {
        jobs      = JSON.parse(fs.readFileSync(TIME_FILE, {encoding: 'utf8'})),
        lastJob   = jobs[args.resume];

        var totalPauses = lastJob.pausesMs.length;
        if(!totalPauses || !(totalPauses%2)){
            // assuming pausesMs = [] or [pause_n, resume_m, pause_m, resume_p]
            throw new Error('Cannot resume if you didn\'t pause a task.');
        }
    } catch(err) {
        if(err.message === 'ENOENT, no such file or directory \'' + TIME_FILE + '\''){
            print('Cannot resume if you didn\'t pause a task.');
        } else {
            print(err.message);
        }
        return;
    }

    print('Resuming timer at ' + getTimeSlice(new Date()));
    lastJob.pausesMs.push(Date.now());
    fs.writeFileSync(TIME_FILE, JSON.stringify(jobs, null, 4));
} else if(args.stop){
    pleaseEnter('stop');

    var jobs = {
        data: []
    };

    try {
        var j = JSON.parse(fs.readFileSync(TIME_FILE, {encoding: 'utf8'})),
            d = j[args.stop];

        if(d && ~d.endMs){
            throw new Error('Previous job finished. Run \'node job.js start\' to start another timer.');
        } else {
            jobs = j;
        }
    } catch(err){
        if(err.message === 'ENOENT, no such file or directory \'' + TIME_FILE + '\''){
            print('A job does not exist. To start the timer, run \'node job.js start\'');
        } else {
            print(err.message);
        }
        return;
    }

    var lastJob = jobs[args.stop];

    lastJob.endMs        = Date.now();
    lastJob.endTimeSlice = getTimeSlice(new Date());
    var pauses = lastJob.pausesMs.length;

    // check if there has been any pauses/resumes between when the task started (startMs) and finished (endMs)
    if(pauses > 0){

        // assuming pausesMs has the [pause, resume] combination ...
        for(var i = 0; i < pauses; i++){
            if(!i){
                // get the elapsed time from start (startMs) to first pause (pausesMs[i].ms)
                lastJob.elapsed += lastJob.pausesMs[i] - lastJob.startMs;

            } else if(i%2 && (i === pauses - 1)){
                // if the last action was a resume in pausesMs, then get the elapsed time from last resume to when the task finished (endMs)
                lastJob.elapsed += lastJob.endMs - lastJob.pausesMs[i];

            } else if(!(i%2)){ // assuming [pause, resume] combo, pause will land on the even index
                // get the elapsed time from when the task started resuming (pausesMs[i - 1]) to the next pause (pausesMs[i])
                lastJob.elapsed += lastJob.pausesMs[i] - lastJob.pausesMs[i - 1];
            }
        }

    } else {
        // otherwise, get the elapsed time from start (startMs) to finish (endMs)
        lastJob.elapsed = lastJob.endMs - lastJob.startMs;
    }

    lastJob.jira = getJiraFormat(lastJob.elapsed);
    fs.writeFileSync(TIME_FILE, JSON.stringify(jobs, null, 4));

    print('Ended timer at ' + lastJob.endTimeSlice);
    print('Jira format: ' + lastJob.jira);
} else if(args.last) {

    // This gets slightly different here
    try {
        var jobs = JSON.parse(fs.readFileSync(TIME_FILE, {
            encoding:'utf8'
        }));
    } catch(e) {
        print("\nFile inaccessible... Are you sure you have stored data?");
        return;
    }

    var ended = { endMs:0 };
    for(var job in jobs){
        if(jobs[job].endMs > ended.endMs){
            ended = jobs[job];
        }
    }
    if(ended.endMs){
        print("\nHere is the record of the last finished job:\n");
        print(JSON.stringify(ended, null, 4));
    } else {
        print("Unable to find the last ended job.");
    }
} else if(args.clean){
    // Unlink the stored file
    fs.unlinkSync(TIME_FILE);
    print("Successfully deleted " + TIME_FILE);

} else if(args['set-time-path']) {

    var path = args['set-time-path'];
    if(path.toString() != "true" && path.substr(path.length - 5) == '.json'){
        config.path = args['set-time-path'];
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 4));
        print("Path successfully changed.");
    } else {
        print("Please enter a path in the format --set-time-path=/path/you/want.json");
    }

} else if(args['get-time-path']) {
    print('Logs will be saved to ' + TIME_FILE);
} else if(args['set-default-path']) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({}, null, 4));
    print('The logging path has been changed to the current working directory.');
} else if(args['list-jobs']){
    try {
        var jobs = JSON.parse(fs.readFileSync(TIME_FILE, {
            encoding:'utf8'
        }));
    } catch(e) {
        print("\nFile inaccessible... Are you sure you have stored data?");
        return;
    }
    var i = 1, unfinished = [];
    for(var job in jobs){
        if(!~jobs[job].endMs){
           unfinished.push(i++ + ". " + job);
        }
    }
    if(unfinished.length){
        print("\nHere is a list of all currently stored unfinished jobs:\n");
        for(var job in unfinished){
            print(unfinished[job]);
        }
        print("");
    } else {
        print("There are currently no unfinished jobs, good work!");
    }
} else {
    print('Please specify either --start, --pause, --resume, --stop, --clean or --last as a flag.');
    print('You may also edit the logging path with --set-time-path and --get-time-path');
}

// returns a Jira ready format to log work e.g. 3h 30m
function getJiraFormat(ms){
    var x = ms / 1000;
    // In case we need it
    // seconds = Math.floor(x % 60);
    x /= 60;
    minutes = Math.round(x % 60);
    x /= 60;
    hours = Math.floor(x % 24);
    x /= 24;
    days = Math.floor(x % 7);
    x /= 7;
    weeks = Math.floor(x);

    // Rounding normalization
    if(minutes == 60){
        minutes = 0;
        hours++;
    }
    if(hours == 24){
        hours = 0;
        days++;
    }
    if(days == 7){
        days = 0;
        weeks++;
    }

    var ret = (weeks ? weeks + 'w ' : '') + (days ? days + 'd ' : '') + (hours ? hours + 'h ' : '') + (minutes ? minutes + 'm' : '');
    return ret != '' ? ret : (ms + 'ms too small to process.');
}

// Check if file is writable
function canWrite(owner, inGroup, mode) {
    return owner && (mode & 00200) || // User is owner and owner can write.
        inGroup && (mode & 00020) || // User is in group and group can write.
        (mode & 00002); // Anyone can write.

}

// returns date and time in human readable format
function getTimeSlice(date){
    return new Date(date).toString();
}

// Check params
function pleaseEnter(action){
    if(args[action] == true){
        print("Please enter a JIRA ticket to " + action + ".");
        process.exit();
    }
}