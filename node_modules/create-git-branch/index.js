var Promise = require("promise");
var async = require('async');
var fs = require('fs');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var path = require('path');
var rimraf = require('rimraf');
var spawn = require('child_process').spawn;

module.exports = function (repository, branch, tmpFolder) {

  var tmpRepoFolder;
  var remoteBranch = branch || null;
  var remoteRepository = repository || '';

  if (tmpFolder) {
    tmpRepoFolder = tmpFolder.replace('/', path.sep);
  } else {
    tmpRepoFolder = 'tmp-repo';
  }

  function removeTmpRepoFolder(cb) {
    gutil.log('Removing tmp repo folder');
    try {
      if (fs.lstatSync(tmpRepoFolder).isDirectory()) {
        rimraf(tmpRepoFolder, cb);
      }
    } catch (err) {
      cb(null);
    }
  }

  function cmdLog(cmd, cmdText) {
    cmd.on('data', function (data) {
      gutil.log(cmdText + ': ' + data.toString().trim());
    });
    cmd.stderr.on('data', function (data) {
      gutil.log(cmdText + ': ' + data.toString().trim());
    });
    cmd.stdout.on('data', function (data) {
      gutil.log(cmdText + ': ' + data.toString().trim());
    });
  }

  function cloneRemoteRepository(cb) {
    gutil.log('Cloning remote repository');
    var cmd = spawn('git', ['clone', remoteRepository, tmpRepoFolder]);
    cmd.on('close', function (code) {
      if (code) {
        return cb('git clone error with code: ' + code);
      }
      return cb(null);
    });
    cmdLog(cmd, 'git clone');
  }

  function createLocalBranch(cb) {
    gutil.log('Creating remote branch');
    var cmd = spawn('git', ['checkout', '-b', remoteBranch], {cwd: tmpRepoFolder});
    cmd.on('close', function (code) {
      if (code) {
        return cb('git clone error with code: ' + code);
      }
      return cb(null);
    });
    cmdLog(cmd, 'git checkout');
  }

  function gitPush(cb) {
    gutil.log('Pushing to remote repository');
    var cmd = spawn('git', ['push', 'origin', remoteBranch], {cwd: tmpRepoFolder});
    cmd.on('close', function (code) {
      if (code !== 0) {
        return cb('git push exited with code ' + code);
      }
      return cb(null);
    });
    cmdLog(cmd, 'git push');
  }

  return new Promise(function(resolve, reject) {
    async.waterfall([
      removeTmpRepoFolder,
      cloneRemoteRepository,
      createLocalBranch,
      gitPush,
      removeTmpRepoFolder
    ], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

};
