# create-git-branch
> It creates a new branch in the specified repository

## Installation

Install the package with npm and add it to your development dependencies:

`npm install --save create-git-branch`

## Usage

### Basic

```javascript
var branch = require('create-git-branch');

branch('git@github.com:adamnowocin/create-git-branch.git', '1.0.0').then(function() {
  // do something
});
```

### Handle errors

```javascript
var branch = require('create-git-branch');

branch('git@github.com:adamnowocin/create-git-branch.git', '1.0.0').then(function() {
  // do something
}, function(err) {
  // do something
});
```

### Specify temp repository folder

```javascript
var branch = require('gulp-create-git-branch');

branch('git@github.com:adamnowocin/create-git-branch.git', '1.0.0', 'tmp-repo').then(function() {
  // do something
});
```

## License

**create-git-branch** is licensed under the [MIT license](http://opensource.org/licenses/MIT).
For the full license, see the `LICENSE` file.
