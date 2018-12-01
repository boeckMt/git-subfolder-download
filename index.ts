import gitSparseCheckout from "git-sparse-checkout";

const _package = require('../package.json');
const _deps = _package.dependencies;
let _sparsDeps:any = {
    giturl:'',
    branch: '',
    dependencies:{}
};
Object.keys(_deps).forEach((key)=>{
    let giturl = _deps[key];
    let path = giturl.split('::')[1];
    let branch = giturl.split('#')[1].split('::')[0];
    let baseurl = giturl.split('#')[0].replace('git+https//','git@');
    gitSparseCheckout(baseurl,branch, {[key]:path})
    //console.log(baseurl, branch, path)
})
