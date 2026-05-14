const fs = require('fs');
const path = require('path');

const filePath = '/home/zeth/Documentos/proyectos/test01/Pyt-1/frontend/src/app/public/pages/seguimiento/seguimiento.component.html';
let content = fs.readFileSync(filePath, 'utf8');

// Reemplazar @if (cond) { ... } con *ngIf="cond"
// Patrón: @if (condition) { contenido } @else { contenidoElse }
content = content.replace(/@if\s*\(\s*([^)]+)\s*\)\s*\{([^@]*?)\}\s*@else\s*\{([^@]*?)\}/g, (match, cond, thenPart, elsePart) => {
  const thenTrim = thenPart.trim();
  const elseTrim = elsePart.trim();
  return `<ng-container *ngIf="${cond}; else elseBlock_${Math.random().toString(36).substr(2, 9)}"><div>${thenTrim}</div></ng-container><ng-template #elseBlock_${Math.random().toString(36).substr(2, 9)}><div>${elseTrim}</div></ng-template>`;
});

// Reemplazar @if (cond) { ... } sin @else
content = content.replace(/@if\s*\(\s*([^)]+)\s*\)\s*\{([^@]*?)\}/g, (match, cond, body) => {
  const bodyTrim = body.trim();
  return `<div *ngIf="${cond}">${bodyTrim}</div>`;
});

// Reemplazar @for (item of items; track item.id) { ... }
content = content.replace(/@for\s*\(\s*([^;]+)\s+of\s+([^;]+);\s*track\s+([^)]+)\s*\)\s*\{/g, '*ngFor="let $1 of $2; trackBy: trackById" {');

console.log('Conversión completada. Escribiendo archivo...');
fs.writeFileSync(filePath, content);
console.log('Listo.');
