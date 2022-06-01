var fs = require('fs'); 
var {parse} = require('csv-parse');
const fetch = require('node-fetch');
const { writeToPath } = require('@fast-csv/format');
const { Octokit } = require("@octokit/core");
const Buffer = require('buffer')
const base64 = require('base-64')
const utf8 = require('utf8')
const {
    GITHUB_TOKEN,
    OWNER,
    USER,
    USER_NAME,
    USER_EMAIL
  } = require('./config.js')

const filename = "./data.csv"
const path = "./data_res.csv"



var dataToWrite = []
const options = { headers: true, quoteColumns: true };
//var arg = process.argv.slice(2)[0]


var child_process = require('child_process');

async function act(arg){
    await child_process.execSync('npm install ' + arg,{stdio:[0,1,2]});
    console.log("installed package")
}



/*
package.json - dependencies - change package version
package-lock.json - packages-""-packagename
                    packages-node-modules/packagename - change

*/






const getJSON = async(url) => {
    try {
      const names = await fetch(url);
      const textData = await names.text();
      return textData;
    } catch (err) {
      console.log('fetch error', err);
    }
  };


module.exports = function(arg, options)  {

        var i = arg.indexOf('@')
        const packageName = arg.substring(0, i)
        const version = arg.substring(i+1)
        console.log("Package: " + packageName + " Version: " + version)
        const octokit = new Octokit({ auth: GITHUB_TOKEN }),
        owner = OWNER,
        title = 'Dependency update ' + packageName + ' ' + version,
        head  =  USER + ':main',
        base  = 'main';
        var repo = ''
        act(arg)
        let packageJsonLock = fs.readFileSync('package-lock.json');
        let packageJsonLock1 = JSON.parse(packageJsonLock);
        //console.log(packageJsonLock1);
        var newUpdate = packageJsonLock1["dependencies"][packageName]





        fs.createReadStream(filename)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", async function (row) {
            //console.log(row);
            var newOb = {}
            newOb.name = row[0]
            newOb.repo = row[1]
            var repoLinkOg = row[1]
            var repoLinkNew = "https://raw.githubusercontent.com/" + repoLinkOg.substring(19)  
            if(repoLinkNew[repoLinkNew.length - 1] === '/')
                repoLinkNew += "main/package.json"
            else
                repoLinkNew += "/main/package.json"
            

            
            //console.log(repoLinkNew);

            
            const getText = await getJSON(repoLinkNew);
            var jsonOb = JSON.parse(getText);
            if(!jsonOb.dependencies.hasOwnProperty(packageName)){
                newOb.version = "None"
                newOb.version_satisfied = "False"
                if(newOb.repo[newOb.repo.length - 1] === '/'){
                    repo = newOb.repo.slice(0, -1)
                }
                else{
                    repo = newOb.repo
                }
                if(options.update){
                    var n = repo.lastIndexOf('/');
                        repo = repo.substring(n + 1);
                        //console.log(repo)
                        jsonOb.dependencies[packageName] = "^" + version
                        try{
                            const response = await octokit.request('POST /repos/{owner}/{repo}/forks', {
                                owner: owner ,
                                repo: repo
                            })
                            //console.log(response)
                            var myRepoLink = "https://raw.githubusercontent.com/" + USER + "/" + repo + "/main/package.json"
                            var newText = await getJSON(myRepoLink);
                            //var jsonObNew = JSON.parse(getText);
                            var myRepoLink1 = "https://raw.githubusercontent.com/" + USER + "/" + repo + "/main/package-lock.json"
                            var newText1 = await getJSON(myRepoLink1);
                            var jsonObNew = JSON.parse(newText1);
                            jsonObNew["packages"][""]["dependencies"][packageName] = "^" + version
                            jsonObNew["packages"]["node_modules/"+packageName] =  newUpdate
                            jsonObNew["dependencies"][packageName] =  newUpdate

                            //console.log(jsonObNew.dependencies[packageName])

                            var sha = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                                owner: USER,
                                repo: repo,
                                path: 'package.json'
                            })
                            //console.log("SHAAAAA")
                            var shaLock = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                                owner: USER,
                                repo: repo,
                                path: 'package-lock.json'
                            })
                            //console.log("SHAAAAA")
                            //console.log(sha)

                            var res = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                                owner: USER,
                                repo: repo,
                                path: 'package.json',
                                message: 'update package',
                                committer: {
                                name: USER_NAME,
                                email: USER_EMAIL
                                },
                                content: base64.encode(utf8.encode(JSON.stringify(jsonOb))),
                                branch : "main",
                                sha : sha.data.sha
                            })
                            //console.log("COMMITTED")
                            //console.log(jsonOb.dependencies)
                            //console.log(res)



                            var res1 = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                                owner: USER,
                                repo: repo,
                                path: 'package-lock.json',
                                message: 'update packagelock',
                                committer: {
                                name: USER_NAME,
                                email: USER_EMAIL
                                },
                                content: base64.encode(utf8.encode(JSON.stringify(jsonObNew))),
                                branch : "main",
                                sha : shaLock.data.sha
                            })
                            //console.log("COMMITTED")
                            //console.log(jsonObNew.dependencies)
                            //console.log(res1)


                            var r = await octokit.request(
                                `POST /repos/{owner}/{repo}/pulls`, { owner, repo, title, head, base }
                            );
                            //console.log("PULL REQUEST DONE")
                            //console.log(r)
                            newOb.update_pr = r.data.html_url

                        }
                        catch(err){
                            console.log(err)
                        }
                }
            }
            else{
                //console.log(jsonOb.dependencies[packageName])
                var currVersion = jsonOb.dependencies[packageName]
                currVersion = currVersion.substring(1)
                newOb.version = currVersion

                if(currVersion.length >= version.length && currVersion >= version){
                    //console.log("satisfied: true" + currVersion)
                    newOb.version_satisfied = "true"
                    newOb.update_pr = ''

                }
                else{
                    //console.log("satisfied: false" + currVersion)
                    newOb.version_satisfied = "false"
                    if(newOb.repo[newOb.repo.length - 1] === '/'){
                        repo = newOb.repo.slice(0, -1)
                    }
                    else{
                        repo = newOb.repo
                    }

                    if(options.update){
                        var n = repo.lastIndexOf('/');
                        repo = repo.substring(n + 1);
                        //console.log(repo)
                        jsonOb.dependencies[packageName] = "^" + version
                        try{
                            const response = await octokit.request('POST /repos/{owner}/{repo}/forks', {
                                owner: owner ,
                                repo: repo
                            })
                            //console.log(response)
                            var myRepoLink = "https://raw.githubusercontent.com/"+ USER + "/"  + repo + "/main/package.json"
                            var newText = await getJSON(myRepoLink);
                            //var jsonObNew = JSON.parse(getText);
                            var myRepoLink1 = "https://raw.githubusercontent.com/" + USER + "/" + repo + "/main/package-lock.json"
                            var newText1 = await getJSON(myRepoLink1);
                            var jsonObNew = JSON.parse(newText1);
                            jsonObNew["packages"][""]["dependencies"][packageName] = "^" + version
                            jsonObNew["packages"]["node_modules/"+packageName] =  newUpdate
                            jsonObNew["dependencies"][packageName] =  newUpdate

                            //console.log(jsonObNew.dependencies[packageName])

                            var sha = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                                owner: USER,
                                repo: repo,
                                path: 'package.json'
                            })
                            //console.log("SHAAAAA")
                            var shaLock = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                                owner: USER,
                                repo: repo,
                                path: 'package-lock.json'
                            })
                            //console.log("SHAAAAA")
                            //console.log(sha)

                            var res = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                                owner: USER,
                                repo: repo,
                                path: 'package.json',
                                message: 'update package',
                                committer: {
                                name: USER_NAME,
                                email: USER_EMAIL
                                },
                                content: base64.encode(utf8.encode(JSON.stringify(jsonOb))),
                                branch : "main",
                                sha : sha.data.sha
                            })
                            //console.log("COMMITTED")
                            //console.log(jsonOb.dependencies)
                            //console.log(res)



                            var res1 = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                                owner: USER,
                                repo: repo,
                                path: 'package-lock.json',
                                message: 'update packagelock',
                                committer: {
                                name: USER_NAME,
                                email: USER_EMAIL
                                },
                                content: base64.encode(utf8.encode(JSON.stringify(jsonObNew))),
                                branch : "main",
                                sha : shaLock.data.sha
                            })
                            //console.log("COMMITTED")
                            //console.log(jsonObNew.dependencies)
                            //console.log(res1)


                            var r = await octokit.request(
                                `POST /repos/{owner}/{repo}/pulls`, { owner, repo, title, head, base }
                            );
                            //console.log("PULL REQUEST DONE")
                            //console.log(r)
                            newOb.update_pr = r.data.html_url

                        }
                        catch(err){
                            console.log(err)
                        }
                    }
                    
                }
            }
            
            dataToWrite.push(newOb)
            //console.log(dataToWrite[dataToWrite.length - 1])
            writeToPath(path, dataToWrite, options)
                .on('error', err => console.error(err))
                .on('finish', () => console.log('')
                );
            
            
        }).on("end", function () {
            //console.log("finished");
            
        })
        .on("error", function (error) {
            console.log(error.message);
        });

    };