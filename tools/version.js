/* Sube la versión en todos lados a la vez:  node tools/version.js 61 */
const fs=require('fs'),path=require('path');const D=path.join(__dirname,'..')+'/',n=+process.argv[2];
if(!(n>0))throw new Error('Pasá el número de versión, por ejemplo: node tools/version.js 61');
const ed=(f,re,to,min)=>{let s=fs.readFileSync(D+f,'utf8');const c=(s.match(re)||[]).length;if(c<min)throw new Error(f+': no encontré la versión');fs.writeFileSync(D+f,s.replace(re,to));};
ed('sw.js',/const V = \d+;/g,'const V = '+n+';',1);
ed('index.html',/\?v=\d+"/g,'?v='+n+'"',8);
ed('LEEME.md',/`swole-v\d+` → `swole-v\d+`/g,'`swole-v'+n+'` → `swole-v'+(n+1)+'`',1);
console.log('versión '+n);
