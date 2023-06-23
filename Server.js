const http = require("http");
const fs = require('fs').promises;

const host = 'localhost';
const port = 8000;

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017/";
const mongoClient = new MongoClient(url);

const db = mongoClient.db("playersdb");
const collection = db.collection("players");

const leader_count = 3;
let leaders = [];
let outLeaders = "";

async function run() {
    try {
        await mongoClient.connect();
        console.log("Start of connection");
        const results = await collection.find().toArray();
        console.log(results);
        //await collection.drop();
    }catch(err) {
        console.log(err);
    }
}

async function addPlayer(newPlayer) {
    if (collection == null) {
        return false;
    }

    try {
        console.log("Adding");
        const result = await collection.findOneAndUpdate({name: newPlayer.name}, { $set: {score: newPlayer.score}});
        if (result.value == null)
            await collection.insertOne({ name: newPlayer.name, score: newPlayer.score });
        return true;
    }
    catch (err) {
        console.error(err);
    }

    return false;
}

async function checkPlayer(newPlayer) {
    if (collection == null) {
        console.log("error");
        return false;
    }

    const results = await collection.find().toArray();
    let better_count = 0;
    results.forEach(player => {
        if (player.score > newPlayer.score) {
            better_count++;
        }
    });
    
    console.log("Checking");

    if (better_count < leader_count) {
        addPlayer(newPlayer);
        if (results.length == leader_count) {
            let minPlayer = results[0];
            results.forEach(player => {
                if (player.score < minPlayer.score)
                    minPlayer = player;
            });

            await collection.deleteOne({name: minPlayer.name});
        }
    }
    return true;
}

async function getLeaders() {
    leaders = await collection.find().toArray();
    leaders.sort(function (a, b) {
        if (a.score < b.score) {
            return 1;
        }
        if (a.score > b.score) {
            return -1;
        }
        return 0;
    });
    return leaders;        
}

async function getOutLeaders() {
    let pr = await getLeaders();
    A = leaders;
    let outS = "";
    
    for (let i = 0; i < A.length; i++)
        outS += A[i].name + ':' + A[i].score + ';';
    outLeaders = outS;
    return pr;
}

run().catch(console.log);

const requestListener = function (req, res) {
    let fileName;
    let contentType;

    console.log(typeof req.method, req.method, req.url);
    if (req.method == "GET") {
        if (req.url === "/") {
            fileName = "dist/index.html";
            contentType = "text/html";
        }
        else if (req.url.endsWith(".css")) {
            fileName = req.url.substr(1);
            contentType = "text/css";
        }
        else if (req.url.endsWith(".js")) {
            fileName = "dist/" + req.url.substr(1);
            contentType = "text/javascript";
        }
        else if (req.url.endsWith(".ico")) {
            res.writeHead(404)
            res.end()
            return;
        }
        else if (req.method === 'GET' && req.url == '/a') {
            res.writeHead(200);
            getOutLeaders().then(() => {
                res.end(outLeaders);

                fs.readFile(`${__dirname}/${fileName}`)
                    .then(contents => {
                        res.setHeader("Content-Type", contentType);
                        res.writeHead(200);
                        res.end(contents);
                    })
                    .catch(err => {
                        console.log("121");
                        res.writeHead(500);
                        res.end(err.message);
                        return;
                    });
            });
        }
        else {
            console.log("109");
            res.writeHead(404);
            res.end("Not found");
            return;
        }
    } else if (req.method == "POST") {
        let data = "";
        console.log("Start");
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            console.log(data);
            
            /*let i = 0;
            while (data[i] != ':')
                i++;
            let newPlayer = {
                name: data.substr(0, i),
                score: parseInt(data.substr(i + 1, data.length)),
            };
            checkPlayer(newPlayer);*/

            data = JSON.parse(data);

            console.log(data);

            let newPlayer = {
                name: data.name,
                score: data.score,
            };
            checkPlayer(newPlayer);

            res.writeHead(200)
            res.end()
        });
    }

    if (req.method != 'GET' || req.url != '/a') {
        fs.readFile(`${__dirname}/${fileName}`)
            .then(contents => {
                res.setHeader("Content-Type", contentType);
                res.writeHead(200);
                res.end(contents);
            })
            .catch(err => {
                console.log("121");
                res.writeHead(500);
                res.end(err.message);
                return;
            });
    }
};

const server = http.createServer(requestListener);
server.listen(port);
