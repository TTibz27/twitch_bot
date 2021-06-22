const tmi = require('tmi.js');
const auth = require('./auth.js');



let game_queue = [];
// Define configuration options
const opts = {
    identity: {
        username: auth.BOT_USERNAME,
            password: auth.OATH_TOKEN
                },
                channels: [
                auth.CHANNEL_NAME
                    ]
                    };

                    // Create a client with our options
                    const client = new tmi.client(opts);

                    // Register our event handlers (defined below)
                    client.on('message', onMessageHandler);
                    client.on('connected', onConnectedHandler);

                    // Connect to Twitch:
                    client.connect();

                    // Called every time a message comes in
                    function onMessageHandler (channel, context, msg, self) {
                        console.log(context);
                    if (self) { return; } // Ignore messages from the bot

                    // Remove whitespace from chat message
                    const commandName = msg.trim();

                    let args = "";
                    let cmd = "";

                    if (msg.substring(0, 1) === '!') {
                             args = msg.substring(1).split(' ');
                             cmd = args[0].toLowerCase();
                    }


                    // MOD ACTIONS
                    if (auth.PRIVILEGED_USER_IDS.includes(context['user-id'] )){
                        console.log(" Privileged user found!");
                        if(commandName === "!queuehelp"){
                            client.say(channel,  'Use !game to start a game, use !player to grab a single player. use !add to add someone to front of queue, use !clearqueue to restart the queue. !showqueue to show the current line.');
                        }
                        else if (commandName === "!game"){
                            if (game_queue.length < 3){
                                if (game_queue.length === 0 ){
                                    client.say(channel,  'Nobody is in the queue. This makes tibz_bot sad.');
                                }
                                client.say(channel,  'There are only  ' + game_queue.length  + ' players in the queue.');
                                return;
                            }
                            const p1 = game_queue.shift();
                            const p2 = game_queue.shift();
                            const p3 = game_queue.shift();
                            client.say(channel, p1.username + ', '+ p2.username + ', ' + p3.username + ', it\'s your turn to play!!!');
                        }
                        else if (commandName === "!player"){
                            if (game_queue.length < 1){
                                client.say(channel,  'Nobody is in the queue. This makes tibz_bot sad.');
                                return;
                            }
                            const p1 = game_queue.shift();
                            client.say(channel,  p1.username + ', it\'s your turn to play!!!');
                        }
                        else if (cmd === "add"){
                                game_queue.unshift({username:args[1], id: null}); // Mod added players do not need ID fields to verify identity.
                                client.say(channel,  '@'+args[1] + ' was added to the front of the queue.');
                        }

                        else if (cmd === "clearqueue"){
                            game_queue = [];
                            client.say(channel,  'Queue has been reset!');
                        }

                        else if (cmd === "showqueue"){
                            let outstr = '';
                            for (let i= 0; i < game_queue.length; i++){
                                const user = game_queue[i];
                                outstr = outstr + (i+1) +":[" + user.username +"]  ";
                            }
                            client.say(channel,  outstr);
                            if (outstr === ''){
                                client.say(channel,  'Queue is empty...');
                            }
                        }
                    }

                    // USER ACTIONS
                    else if(commandName === "!queuehelp"){
                        client.say(channel,  'Use !queue to enter the queue. use !leave to leave the queue early. If you are already in the queue, !queue will tell you your current position.');
                    }
                    else if(commandName === "!queue"){
                            let newUser = true;
                            for (let i= 0; i < game_queue.length; i++){
                                const user = game_queue[i];
                                if (user.id === context['user-id']){
                                    newUser =false;
                                    client.say(channel,  context.username +', You are already in the queue. You are in position ' + game_queue.length  + '.');
                                }
                            }
                            if (newUser){
                                game_queue.push({username: context.username, id: context['user-id']});
                                console.log( "Added user : "+ context.username + "  |   " + context['user-id']);
                                client.say(channel,  context.username +', You have been added to the queue! you are in position ' + game_queue.length  + '.');
                            }

                    }
                    else if (commandName === "!leave"){
                        let index = -1;
                        for (let i= 0; i < game_queue.length; i++){
                            const user = game_queue[i];
                            if (user.id === context['user-id']){
                                index = i;
                            }
                        }
                        if (index >=0 ){
                            game_queue.splice(index, 1);
                            client.say(channel,  context.username +', You have been removed from the queue.' );
                        }
                    }

                    else {
                    console.log(`* Unknown command ${commandName}`);
                }

                }

                    // Function called when the "dice" command is issued
                    function rollDice () {
                    const sides = 6;
                    return Math.floor(Math.random() * sides) + 1;
                }

                    // Called every time the bot connects to Twitch chat
                    function onConnectedHandler (addr, port) {
                    console.log(`* Connected to ${addr}:${port}`);
                }