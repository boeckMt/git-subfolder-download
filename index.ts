/**
 * clone fubfolder from git to a folder like npm dependencies
 * "<npm-package-name>": "<git-url>"
 * e.g. "@my/package": "git+https://github.com/boeckMt/node-browser-log.git#master::test"
 * 
 * <protocol>://[<user>[:<password>]@]<hostname>[:<port>][:][/]<path>[#<commit-ish> | #semver:<semver>]
 * git+ssh://git@github.com:npm/cli.git#v1.0.27
 * git+ssh://git@github.com:npm/cli#semver:^5.0
 * git+https://isaacs@github.com/npm/cli.git
 * git://github.com/npm/cli.git#v1.0.27
 *
 */
import { exec } from 'child_process';
import { join } from 'path';
const FS = require('fs-extra');
import {version, parse, option, command} from 'commander';

let program = version('1.0.0')
  .option('-p, --package, <package>', 'path to package.json')
  .option('-d, --deps, [deps]', 'dependencies to use e.g. dependencies or myDependencies')
  .option('-t, --tempdir, [tempdir]', 'the tmp folder to clone the git')
  .parse(process.argv);

//console.dir(program)
  try {
    getDeps(program.package);
  } catch (error) {
      console.error(error);
  }


function getDeps(packagePath:any, cb?:Function){
    if(!packagePath){
       return  console.error(`provide a path -p to a package.json with dependencies`)
    }

    var _package = require(join(__dirname, packagePath));
    var _deps = _package.dependencies;
    if(program.deps && _package[program.deps]){
        _deps = _package[program.deps];
    }

    Object.keys(_deps).forEach((key)=>{
        var giturl:string = _deps[key], path, branch, baseurl;
        //console.log(key, giturl)
        if(/::/g.test(giturl)){
            path = giturl.split('::')[1];

            if(/#/g.test(giturl)){
                branch = giturl.split('#')[1].split('::')[0];
                baseurl = giturl.split('#')[0].replace('git+','');
            }else{
                baseurl = giturl.split('.git')[0]+'.git'.replace('git+','');
            }

            cloneSubfolder(baseurl, path, key, branch);
        }else{
            if(/#/g.test(giturl)){
                branch = giturl.split('#')[1];
                baseurl = giturl.split('#')[0].replace('git+','');
            }else{
                baseurl = giturl.split('.git')[0]+'.git'.replace('git+','');
            }
            cloneSubfolder(baseurl, '', key, branch);
        }      
    })
}


function cloneSubfolder(repoUrl:string, repoPath:string, localPath:string, checkout?:string){

    let tempdir = join(__dirname,'.tmp');
    if(program.tempdir){
        tempdir = program.tempdir;
    }

    let execommand = `git clone ${repoUrl} ${tempdir} --depth=10`;
    if(checkout){
        execommand = `git clone ${repoUrl} ${tempdir} --depth=10 --branch ${checkout}`
    }

    console.log(`clone ${repoUrl} to ${tempdir}`);

    exec(execommand,(error)=>{
        if(error){
            return console.error(error);
        }
        
        console.log(`move files from ${join(tempdir,repoPath)} to ${localPath}`)
        FS.move(join(tempdir,repoPath), localPath, (err:any) => {
            if (err) return console.error(err)

            FS.removeSync(tempdir)
            console.log(`remove ${tempdir}`)
          })
    });
}
