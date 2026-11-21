/* Mail de soporte: cuando exista, ponerlo acá y aparece en las dos páginas. */
var SOPORTE_MAIL='';
if(SOPORTE_MAIL)document.querySelectorAll('[data-mail]').forEach(function(s){
  s.innerHTML=' o por mail a <a href="mailto:'+SOPORTE_MAIL+'">'+SOPORTE_MAIL+'</a>';
});
