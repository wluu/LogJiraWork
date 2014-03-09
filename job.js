#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2)),
    exec = require('shelljs').exec,
    fs   = require('fs'),
    path = require('path');

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
    var jobs = {
        data: []
    };

    try {
        var j = JSON.parse(fs.readFileSync(TIME_FILE, {encoding: 'utf8'})),
            d = j.data[j.data.length - 1];

        if(d.endMs === -1){
            throw new Error('Already started timer on ' + d.startTimeSlice);
        } else {
            jobs = j;
        }
    }
    catch(err){

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

    jobs.data.push({
        startMs: Date.now(),
        endMs: -1,
        elapsed: -1,
        jira: '',
        startTimeSlice: timeSlice,
        endTimeSlice: ''
    });

    fs.writeFileSync(TIME_FILE, JSON.stringify(jobs));
} else if (args.stop){
    var jobs = {
        data: []
    };

    try {
        var j = JSON.parse(fs.readFileSync(TIME_FILE, {encoding: 'utf8'})),
            d = j.data[j.data.length - 1];

        if(d.endMs !== -1){
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

    var endMs     = Date.now(),
        timeSlice = getTimeSlice(new Date());

    var lastJob         = jobs.data.length - 1,
        lastJob              = jobs.data[lastJob];
        lastJob.endMs        = endMs,
        lastJob.elapsed      = endMs - lastJob.startMs,
        lastJob.jira         = getJiraFormat(lastJob.elapsed),
        lastJob.endTimeSlice = timeSlice;

    print('Ended timer at ' + timeSlice);
    print('Jira format: ' + lastJob.jira);

    fs.writeFileSync(TIME_FILE, JSON.stringify(jobs));
} else if(args.last) {
    try {
        var jobs    = JSON.parse(fs.readFileSync(TIME_FILE, {encoding: 'utf8'})),
            lastJob = jobs.data[jobs.data.length - 1];

        print(JSON.stringify(lastJob, null, 4));

    } catch(err) {

        if(err.message === 'ENOENT, no such file or directory \'' + TIME_FILE + '\''){
            print(TIME_FILE + ' doesn\'t exist. So .... nothing to show.');
        } else {
            print(err.message);
        }

    }
} else if(args.clean){
    // Unlink the stored file
    fs.unlinkSync(TIME_FILE);
    print("Successfully deleted.")
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
} else {
    print('Please specify either --start, --stop, --clean or --last as a flag.');
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

function print(s){
    console.log(s);
}
