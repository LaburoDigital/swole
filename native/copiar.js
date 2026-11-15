/* Copia la app web (la carpeta de arriba) a native/www, que es lo que Capacitor mete adentro de la app nativa. */
const fs=require('fs'),path=require('path');const src=path.join(__dirname,'..'),dst=path.join(__dirname,'www');
fs.rmSync(dst,{recursive:true,force:true});fs.mkdirSync(dst);
['index.html','app.css','sw.js','manifest.webmanifest','js','icons','img'].forEach(f=>fs.cpSync(path.join(src,f),path.join(dst,f),{recursive:true}));
console.log('www listo');
