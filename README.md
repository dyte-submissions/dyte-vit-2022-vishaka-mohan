### Built With

* [Node.js](https://nodejs.org/)
* [Commander.js](https://github.com/tj/commander.js)


<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Project description 

This is a command-line tool to make sure that the dependencies of the given repository links are up to date. This folder contains a csv file - data.csv which contains the name and github link of the repositories. The data_res.csv contains the result after verifying the dependency versions.
The index.js code contains the command line code using commander.js. Upon running the update command, the code in the update.js file will get executed.

<br>

Firstly, the data.csv file is read and the package.json file from all the given repo links are extracted as strings. The dependency and version are provided as command-line arguments. The given dependency version is verified in the extracted package.json files. If the dependency version in the repo is up-to-date, "TRUE" is written to the result CSV file else "FALSE". The dependency version is mentioned alongside it. 

<br>
If the -u or --update flag is included in the command line, the repos with outdated versions of the dependency are forked to the user's github account, version changes are committed to the package.json and the package-lock.json files and a pull request is created. All these functions are achieved by using Octokit. The corresponding pull request URL is added to the CSV file.


### Installation and usage

1. Get a Github Access Token for Octokit
2. Clone the repo
   ```sh
   git clone https://github.com/dyte-submissions/dyte-vit-2022-vishaka-mohan
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your Access Token and other detials in `config.js`
5. In the root directory, type this command to use the command-line tool
```sh
   npm install -g .
```
6. Type the command to execute
```sh
   update-deps update axios@0.23.0 -u
```
   

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- CONTACT -->
## Contact

Vishaka Mohan -  vmohan0211@gmail.com

Project Link: [https://github.com/dyte-submissions/dyte-vit-2022-vishaka-mohan](https://github.com/github_username/repo_name)

<p align="right">(<a href="#top">back to top</a>)</p>

