var fs=require('fs');
var exec = require('child_process').exec;
var args = process.argv;
var filePath, dirPath, outputdir;
while(args.length){
	switch(args.shift()){
        case "-f":
		case "--file":
			filePath = args.shift();
		break;
		case "-d":
		case "--dir":
			dirPath = args.shift();
		break;
		case "-od":
		case "--outputdir":
			outputdir = args.shift();
		break;
	}
}

var dirs = fs.readdirSync(dirPath);
var text = fs.readFileSync(filePath, 'UTF-8').match(/\S+/g);

dirs.forEach(function(dir){
	for(var i=0, len=text.length;i<len;i++){
		if(new RegExp(text[i]).test(dir)){
			console.log(["xcopy", '"'+dirPath+"/"+dir+'"', '"'+outputdir+"/"+dir+'"', "/e /Y /I"].join(' '));
			exec(["xcopy", '"'+dirPath+"/"+dir+'"', '"'+outputdir+"/"+dir+'"', "/e /Y /I"].join(' '), function(dir, err){
				if(err){
					console.log("程序出错！");
					throw err;
				}
				console.log(dir, "拷贝完成");
			}.bind(null, dirPath+"/"+dir));
		}
	}
});