var fs 	 = require('fs'),
	path = require('path'),
	exec = require('child_process').exec;

var TIME_FILE = path.join('\/Users', 'wluu', 'Desktop', 'time.json');

var arg = process.argv[2];
switch(arg){

	case 'start':

		var jobs = {
			data: []
		};

		try{
			var j = JSON.parse(fs.readFileSync(TIME_FILE, {encoding: 'utf8'})),
				d = j.data[j.data.length - 1];

			if(d.endMs === -1){
				throw new Error('Already started timer on ' + d.startTimeSlice);
			}
			else{
				jobs = j;
			}
		}
		catch(err){

			if(err.message === 'ENOENT, no such file or directory \'' + TIME_FILE + '\''){
				print(TIME_FILE + ' doesn\'t exist. Will create one.');	
				fs.appendFileSync(TIME_FILE, '');
				// and continue forward to start the timer
			}
			else{
				print(err.message);
				// print(err.stack);
				break;
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

	break;

	case 'stop':
		var jobs = {
			data: []
		};

		try{
			var j = JSON.parse(fs.readFileSync(TIME_FILE, {encoding: 'utf8'})),
				d = j.data[j.data.length - 1];

			if(d.endMs !== -1){
				throw new Error('Previous job finished. Run \'node job.js start\' to start another timer.');
			}
			else{
				jobs = j;
			}
		}
		catch(err){

			if(err.message === 'ENOENT, no such file or directory \'' + TIME_FILE + '\''){
				print('A job does not exist. To start the timer, run \'node job.js start\'');
			}
			else{
				print(err.message);	
			}
			
			break;
		}

		var endMs 		= Date.now(),
			timeSlice 	= getTimeSlice(new Date());

		var lastJob  		= jobs.data.length - 1,
			lj 		 		= jobs.data[lastJob];
			lj.endMs 		= endMs,
			lj.elapsed 		= endMs - lj.startMs,
			lj.jira			= getJiraFormat(lj.elapsed),
			lj.endTimeSlice = timeSlice;

		print('Ended timer at ' + timeSlice);
		print('Jira format: ' + lj.jira);

		fs.writeFileSync(TIME_FILE, JSON.stringify(jobs));

	break;

	case 'last':

		try{
			var jobs    = JSON.parse(fs.readFileSync(TIME_FILE, {encoding: 'utf8'})),
			  	lastJob = jobs.data[jobs.data.length - 1];
			
			print(JSON.stringify(lastJob, null, '\t'));

		}
		catch(err){

			if(err.message === 'ENOENT, no such file or directory \'' + TIME_FILE + '\''){
				print(TIME_FILE + ' doesn\'t exist. So .... nothing to show.');	
			}
			else{
				print(err.message);
			}
			
		}

	break;

	case 'clean':
		// this command wouldn't work on Windows based machines;
		// unless the machine supports the 'rm' command

		var cmd = 'rm ' + TIME_FILE;
		exec(cmd, function(err, stdout, stderr){
			if(err !== null){
				print(err.message);	
			}
		})
		.on('exit', function(code, signal){
			print('done: ' + code);
		});
		
	break;

	default:
		print('What is ' + arg + '???');
	break;

}

// returns a Jira ready format to log work e.g. 3h 30m
function getJiraFormat(elapsedMs){

	// time units supported by Jira
	var timeUnits  =  [
						{unit: 'w', ms: 604800000},
						{unit: 'd', ms: 86400000}, 
						{unit: 'h', ms: 3600000},
						{unit: 'm', ms: 60000}
					  ],
		jiraFormat = '',
		changedMs  = elapsedMs;
	
	for(var i = 0; i < timeUnits.length; i++){
		var jira = timeUnits[i];
		
		if(changedMs >= jira.ms){
			var quotient    = (changedMs/jira.ms).toString(10).split('.')[0],
				remainderMs = changedMs%jira.ms;

			jiraFormat += quotient + jira.unit + ' ';

			if(remainderMs === 0){
				return jiraFormat;
			}
			else if(jira.unit === 'm' && remainderMs !== 0){ 

				if(remainderMs >= 30000){
					// rounding up to another minute then process again
					var leftMs = 60000 - remainderMs;
					return getJiraFormat(elapsedMs + leftMs);
				}

				return jiraFormat;
			}
			else{
				changedMs = remainderMs;
			}
		}
	}

	// if previous condtions can't process ...
	return (changedMs + 'ms too small to process.');
}

// returns date and time in human readable format e.g. 2/16/2014;22:30:05
function getTimeSlice(date){
	return (date.getMonth() + 1) + '\/' + date.getDate() + '\/' + date.getFullYear() + ';'
		 + (date.getHours() < 10 ? (0 + '' + date.getHours()) : date.getHours()) + ':' 
		 + (date.getMinutes() < 10 ? (0 + '' + date.getMinutes()) : date.getMinutes()) + ':'
		 + (date.getSeconds() < 10 ? (0 + '' + date.getSeconds()) : date.getSeconds());
}

function print(s){
	console.log(s);
}