/*
	this bot is a ping pong bot, and every time a message
	beginning with "ping" is sent, it will reply with
	"pong".
*/

var Discord = require("discord.js");

var yt = require("./youtube_plugin");
var youtube_plugin = new yt();

var gi = require("./google_image_plugin");
var google_image_plugin = new gi();

// Get the email and password
var AuthDetails = require("./auth.json");
var qs = require("querystring");

var htmlToText = require('html-to-text');

var config = {
    "api_key": "dc6zaTOxFJmzC",
    "rating": "r",
    "url": "http://api.giphy.com/v1/gifs/search",
    "permission": ["NORMAL"]
};

var botKeywords = ["bees"];


//https://api.imgflip.com/popular_meme_ids
var meme = {
	"brace": 61546,
	"mostinteresting": 61532,
	"fry": 61520,
	"onedoesnot": 61579,
	"yuno": 61527,
	"success": 61544,
	"allthethings": 61533,
	"doge": 8072285,
	"drevil": 40945639,
	"skeptical": 101711,
	"notime": 442575,
	"yodawg": 101716,
    "aliens" : 101470,
    "morpheus" : 100947,
    "squidward" : 101511
};

var game_abbreviations = {
    "cs": "Counter-Strike",
    "hon": "Heroes of Newerth",
    "hots": "Heroes of the Storm",
    "sc2": "Starcraft II",
    "gta": "Grand Theft Auto"
};

var commands = {
	"gif": {
		usage: "<image tags>",
        description: "returns a random gif matching the tags passed",
		process: function(bot, msg, suffix) {
		    var tags = suffix.split(" ");
		    get_gif(tags, function(id) {
			if (typeof id !== "undefined") {
			    bot.sendMessage(msg.channel, "http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
			}
			else {
			    bot.sendMessage(msg.channel, "Invalid tags, try something different. [Tags: " + (tags ? tags : "Random GIF") + "]");
			}
		    });
		},
        shouldBeInHelp: true
	},
    "ping": {
        description: "responds pong, useful for checking if bot is alive",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, msg.sender+" pong!");
            if(suffix){
                bot.sendMessage(msg.channel, "note that !ping takes no arguments!");
            }
        },
        shouldBeInHelp: true
    },
    "game": {
        usage: "<name of game>",
        description: "pings channel asking if anyone wants to play",
        process: function(bot,msg,suffix){
            var game = game_abbreviations[suffix];
            if(!game) {
                game = suffix;
            }
            bot.sendMessage(msg.channel, "@everyone Anyone up for " + game + "?");
            console.log("sent game invites for " + game);
        },
        shouldBeInHelp: true
    },
    "servers": {
        description: "lists servers bot is connected to",
        process: function(bot,msg){bot.sendMessage(msg.channel,bot.servers);},
        shouldBeInHelp: true
    },
    "channels": {
        description: "lists channels bot is connected to",
        process: function(bot,msg) { bot.sendMessage(msg.channel,bot.channels);},
        shouldBeInHelp: true
    },
    "myid": {
        description: "returns the user id of the sender",
        process: function(bot,msg){bot.sendMessage(msg.channel,msg.author.id);},
        shouldBeInHelp: true
    },
    "idle": {
        description: "sets bot status to idle",
        process: function(bot,msg){ bot.setStatusIdle();},
        shouldBeInHelp: true
    },
    "online": {
        description: "sets bot status to online",
        process: function(bot,msg){ bot.setStatusOnline();},
        shouldBeInHelp: true
    },
    "youtube": {
        usage: "<video tags>",
        description: "gets youtube video matching tags",
        process: function(bot,msg,suffix){
            youtube_plugin.respond(suffix,msg.channel,bot);
        },
        shouldBeInHelp: true
    },
    "say": {
        usage: "<message>",
        description: "bot says message",
        process: function(bot,msg,suffix){ bot.sendMessage(msg.channel,suffix,true);},
        shouldBeInHelp: true
    },
    "image": {
        usage: "<image tags>",
        description: "gets image matching tags from google",
        process: function(bot,msg,suffix){ google_image_plugin.respond(suffix,msg.channel,bot);},
        shouldBeInHelp: true
    },
    "pullanddeploy": {
        description: "bot will perform a git pull master and restart with the new code",
        process: function(bot,msg,suffix) {
            bot.sendMessage(msg.channel,"fetching updates...",function(error,sentMsg){
                console.log("updating...");
	            var spawn = require('child_process').spawn;
                var log = function(err,stdout,stderr){
                    if(stdout){console.log(stdout);}
                    if(stderr){console.log(stderr);}
                };
                var fetch = spawn('git', ['fetch']);
                fetch.stdout.on('data',function(data){
                    console.log(data.toString());
                });
                fetch.on("close",function(code){
                    var reset = spawn('git', ['reset','--hard','origin/master']);
                    reset.stdout.on('data',function(data){
                        console.log(data.toString());
                    });
                    reset.on("close",function(code){
                        var npm = spawn('npm', ['install']);
                        npm.stdout.on('data',function(data){
                            console.log(data.toString());
                        });
                        npm.on("close",function(code){
                            console.log("goodbye");
                            bot.sendMessage(msg.channel,"brb!",function(){
                                bot.logout(function(){
                                    process.exit();
                                });
                            });
                        });
                    });
                });
            });
        },
        shouldBeInHelp: false
    },
    "meme": {
        usage: 'meme "top text" "bottom text"',
        process: function(bot,msg,suffix) {
            var tags = msg.content.split('"');
            var memetype = tags[0].split(" ")[1];
            //bot.sendMessage(msg.channel,tags);
            var Imgflipper = require("imgflipper");
            var imgflipper = new Imgflipper(AuthDetails.imgflip_username, AuthDetails.imgflip_password);
            imgflipper.generateMeme(meme[memetype], tags[1]?tags[1]:"", tags[3]?tags[3]:"", function(err, image){
                //console.log(arguments);
                bot.sendMessage(msg.channel,image);
            });
        },
        shouldBeInHelp: true
    },
    "memehelp": { //TODO: this should be handled by !help
        description: "returns available memes for !meme",
        process: function(bot,msg) {
            var str = "Currently available memes:\n"
            for (var m in meme){
                str += m + "\n"
            }
            bot.sendMessage(msg.channel,str);
        },
        shouldBeInHelp: true
    },
    "version": {
        description: "returns the git commit this bot is running",
        process: function(bot,msg,suffix) {
            var commit = require('child_process').spawn('git', ['log','-n','1']);
            commit.stdout.on('data', function(data) {
                bot.sendMessage(msg.channel,data);
            });
            commit.on('close',function(code) {
                if( code != 0){
                    bot.sendMessage(msg.channel,"failed checking git version!");
                }
            });
        },
        shouldBeInHelp: true
    },
    "log": {
        usage: "<log message>",
        description: "logs message to bot console",
        process: function(bot,msg,suffix){console.log(msg.content);},
        shouldBeInHelp: true
    },
    "wiki": {
        usage: "<search terms>",
        description: "returns the summary of the first matching search result from Wikipedia",
        process: function(bot,msg,suffix) {
            var query = suffix;
            if(!query) {
                bot.sendMessage(msg.channel,"usage: !wiki search terms");
                return;
            }
            var Wiki = require('wikijs');
            new Wiki().search(query,1).then(function(data) {
                new Wiki().page(data.results[0]).then(function(page) {
                    page.summary().then(function(summary) {
                        var sumText = summary.toString().split('\n');
                        var continuation = function() {
                            var paragraph = sumText.shift();
                            if(paragraph){
                                bot.sendMessage(msg.channel,paragraph,continuation);
                            }
                        };
                        continuation();
                    });
                });
            },function(err){
                bot.sendMessage(msg.channel,err);
            });
        },
        shouldBeInHelp: true
    },
    "join-server": {
        usage: "<invite>",
        description: "joins the server it's invited to",
        process: function(bot,msg,suffix) {
            console.log(bot.joinServer(suffix,function(error,server) {
                console.log("callback: " + arguments);
                if(error){
                    bot.sendMessage(msg.channel,"failed to join: " + error);
                } else {
                    console.log("Joined server " + server);
                    bot.sendMessage(msg.channel,"Successfully joined " + server);
                }
            }));
        },
        shouldBeInHelp: true
    },
    "create": {
        usage: "<text|voice> <channel name>",
        description: "creates a channel with the given type and name.",
        process: function(bot,msg,suffix) {
            var args = suffix.split(" ");
            var type = args.shift();
            if(type != "text" && type != "voice"){
                bot.sendMessage(msg.channel,"you must specify either voice or text!");
                return;
            }
            bot.createChannel(msg.channel.server,args.join(" "),type, function(error,channel) {
                if(error){
                    bot.sendMessage(msg.channel,"failed to create channel: " + error);
                } else {
                    bot.sendMessage(msg.channel,"created " + channel);
                }
            });
        },
        shouldBeInHelp: false
    },
    "delete": {
        usage: "<channel name>",
        description: "deletes the specified channel",
        process: function(bot,msg,suffix) {
            var channel = bot.getChannel("name",suffix);
            bot.sendMessage(msg.channel.server.defaultChannel, "deleting channel " + suffix + " at " +msg.author + "'s request");
            if(msg.channel.server.defaultChannel != msg.channel){
                bot.sendMessage(msg.channel,"deleting " + channel);
            }
            bot.deleteChannel(channel,function(error,channel){
                if(error){
                    bot.sendMessage(msg.channel,"couldn't delete channel: " + error);
                } else {
                    console.log("deleted " + suffix + " at " + msg.author + "'s request");
                }
            });
        },
        shouldBeInHelp: false

    },
    "stock": {
        usage: "<stock to fetch>",
        process: function(bot,msg,suffix) {
            var yahooFinance = require('yahoo-finance');
            yahooFinance.snapshot({
              symbol: suffix,
              fields: ['s', 'n', 'd1', 'l1', 'y', 'r'],
            }, function (error, snapshot) {
                if(error){
                    bot.sendMessage(msg.channel,"couldn't get stock: " + error);
                } else {
                    //bot.sendMessage(msg.channel,JSON.stringify(snapshot));
                    bot.sendMessage(msg.channel,snapshot.name
                        + "\nprice: $" + snapshot.lastTradePriceOnly);
                }  
            });
        },
        shouldBeInHelp: true

    },
    "rss": {
        description: "lists available rss feeds",
        process: function(bot,msg,suffix) {
            /*var args = suffix.split(" ");
            var count = args.shift();
            var url = args.join(" ");
            rssfeed(bot,msg,url,count,full);*/
            bot.sendMessage(msg.channel,"Available feeds:", function(){
                for(var c in rssFeeds){
                    bot.sendMessage(msg.channel,c + ": " + rssFeeds[c].url);
                }
            });
        },
        shouldBeInHelp: false
    },
    "reddit": {
        usage: "[subreddit]",
        description: "Returns the top post on reddit. Can optionally pass a subreddit to get the top psot there instead",
        process: function(bot,msg,suffix) {
            var path = "/.rss"
            if(suffix){
                path = "/r/"+suffix+path;
            }
            rssfeed(bot,msg,"https://www.reddit.com"+path,1,false);
        },
        shouldBeInHelp: true
    },
    "bees": {
        description: "Gives everyone bees to enjoy",
        process: function(bot,msg,suffix) {
            bot.sendMessage(msg.channel,"https://i.imgur.com/0RRdP.jpg");
        },
        shouldBeInHelp: false
    },
    "saveFile": {
        description: "saves a file",
        process: function(bot,msg,suffix) {
            var txtFile = new File(testFile.txt);
            txtFile.writeln(msg);
            txtFile.close();
            bot.sendMessage("look!");
        },
        shouldBeInHelp: false
    }
};

try{
var rssFeeds = require("./rss.json");
function loadFeeds(){
    for(var cmd in rssFeeds){
        commands[cmd] = {
            usage: "[count]",
            description: rssFeeds[cmd].description,
            url: rssFeeds[cmd].url,
            process: function(bot,msg,suffix){
                var count = 1;
                if(suffix != null && suffix != "" && !isNaN(suffix)){
                    count = suffix;
                }
                rssfeed(bot,msg,this.url,count,false);
            }
        };
    }
}
} catch(e) {
    console.log("Couldn't load rss.json. See rss.json.example if you want rss feed commands. error: " + e);
}

function rssfeed(bot,msg,url,count,full){
    var FeedParser = require('feedparser');
    var feedparser = new FeedParser();
    var request = require('request');
    request(url).pipe(feedparser);
    feedparser.on('error', function(error){
        bot.sendMessage(msg.channel,"failed reading feed: " + error);
    });
    var shown = 0;
    feedparser.on('readable',function() {
        var stream = this;
        shown += 1
        if(shown > count){
            return;
        }
        var item = stream.read();
        bot.sendMessage(msg.channel,item.title + " - " + item.link, function() {
            if(full === true){
                var text = htmlToText.fromString(item.description,{
                    wordwrap:false,
                    ignoreHref:true
                });
                bot.sendMessage(msg.channel,text);
            }
        });
        stream.alreadyRead = true;
    });
}

//MESSAGE DETECTION CODE

function messageHasKeywords(message) {
    for (var i = 0; i < botKeywords.length; i++) {
        var keyword = botKeywords[i]
        if (message.toString().indexOf(keyword) > -1) {
            return true
        };
    }
    return false
}

function getKeywordsFromMessage(message) {
    var botKeyWord
    for (var i = 0; i < botKeywords.length; i++) {
        var keyword = botKeywords[i]
        if (message.toString().indexOf(keyword) > -1) {
            botKeyWord = keyword
        };
    }
    return botKeyWord
}

function isValidCommand(msg) {
   return msg.author.id != bot.user.id && (msg.content[0] === '!' || msg.content.indexOf(bot.user.mention()) == 0) || messageHasKeywords(msg.content.toLowerCase());
}

function formatSuffixFromCommandText(cmdTxt, user, msg) {
    var suffix = msg.content.substring(cmdTxt.length+2);//add one for the ! and one for the space
     if(msg.content.indexOf(user.mention()) == 0){
        suffix = msg.content.substring(user.mention().length+cmdTxt.length+2);
     }
     return suffix;
}

function formatMessageToCommandText(msg) {
    var cmdTxt;
    if (messageHasKeywords(msg.content.toLowerCase())) {
        var keyword = getKeywordsFromMessage(msg.content.toLowerCase())
        cmdTxt = keyword;
    } 
    else {
        cmdTxt = msg.content.split(" ")[0].substring(1);

        if(msg.content.indexOf(bot.user.mention()) == 0){
            cmdTxt = msg.content.split(" ")[1];
        }
    }
    return cmdTxt;
}

function handleCommand(cmd, bot, msg, cmdTxt, suffix) {
    if(cmdTxt === "help"){
        handleHelpCommand(cmd, bot, msg)
    }
    else if(cmd) {
        cmd.process(bot,msg,suffix);
    }
    else {
        bot.sendMessage(msg.channel, "Invalid command " + cmdTxt);
    }
}

function handleHelpCommand(cmd,bot,msg) {
    //help is special since it iterates over the other commands
    for(var cmd in commands) {
        var shouldBeInHelp = commands[cmd].shouldBeInHelp;
        if (shouldBeInHelp) {
            var info = "!" + cmd;
            var usage = commands[cmd].usage;
            if(usage){
                info += " " + usage;
            }
            var description = commands[cmd].description;
            if(description){
                info += "\n\t" + description;
            }
            bot.sendMessage(msg.channel,info);
        }
    }
}

var bot = new Discord.Client();

bot.on("ready", function () {
    loadFeeds();
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
});

bot.on("disconnected", function () {

	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error
	
});

bot.on("message", function (msg) {
	//check if message is a command
	if(isValidCommand(msg)){
        console.log("treating " + msg.content + " from " + msg.author + " as command");
        var cmdTxt = formatMessageToCommandText(msg);
        var suffix = formatSuffixFromCommandText(cmdTxt, bot.user, msg);
        var cmd = commands[cmdTxt];
        handleCommand(cmd, bot, msg, cmdTxt, suffix);
	} else {
		//message isn't a command or is from us
        //drop our own messages to prevent feedback loops
        if(msg.author == bot.user){
            return;
        }
        
        if (msg.author != bot.user && msg.isMentioned(bot.user)) {
                bot.sendMessage(msg.channel,msg.author + ", you called?");
        }
    }
});
 

//Log user status changes
bot.on("presence", function(data) {
	//if(status === "online"){
	//console.log("presence update");
	console.log(data.user+" went "+data.status);
	//}
});

function get_gif(tags, func) {
        //limit=1 will only return 1 gif
        var params = {
            "api_key": config.api_key,
            "rating": config.rating,
            "format": "json",
            "limit": 1
        };
        var query = qs.stringify(params);

        if (tags !== null) {
            query += "&q=" + tags.join('+')
        }

        //wouldnt see request lib if defined at the top for some reason:\
        var request = require("request");
        //console.log(query)

        request(config.url + "?" + query, function (error, response, body) {
            //console.log(arguments)
            if (error || response.statusCode !== 200) {
                console.error("giphy: Got error: " + body);
                console.log(error);
                //console.log(response)
            }
            else {
                var responseObj = JSON.parse(body)
                console.log(responseObj.data[0])
                if(responseObj.data.length){
                    func(responseObj.data[0].id);
                } else {
                    func(undefined);
                }
            }
        }.bind(this));
    }

bot.login(AuthDetails.email, AuthDetails.password);
