const fs = require('fs');

const inputFile = '/home/zeth/Documentos/proyectos/test01/Pyt-1/frontend/src/app/public/pages/seguimiento/seguimiento.component.html';
const outputFile = '/home/zeth/Documentos/proyectos/test01/Pyt-1/frontend/src/app/public/pages/seguimiento/seguimiento.component.html.new';

let html = fs.readFileSync(inputFile, 'utf8');

// Contador para IDs únicos de templates
let templateCounter = 0;
const usedIds = new Set();

function generateId() {
  let id;
  do {
    id = 'else' + (++templateCounter) + '_' + Math.random().toString(36).substr(2, 5);
  } while (usedIds.has(id));
  usedIds.add(id);
  return id;
}

// Convertir @if ... @else ... a *ngIf con ng-template
html = html.replace(/@if\s*\(\s*([^)]+)\s*\)\s*\{([\s\S]*?)\}\s*@else\s*\{([\s\S]*?)\}/g, (match, condition, thenContent, elseContent) => {
  const templateId = generateId();
  return `<div [ngIf]="${condition}"><div>${thenContent.trim()}</div></div><ng-template [ngIfElse]="else${templateId}"><div></div></ng-template><ng-template #else${templateId}><div>${elseContent.trim()}</div></ng-template>`;
});

// Convertir @if ... } (sin else) a *ngIf
html = html.replace(/@if\s*\(\s*([^)]+)\s*\)\s*\{([\s\S]*?)\}/g, (match, condition, content) => {
  return `<div *ngIf="${condition}">${content.trim()}</div>`;
});

// Convertir @for (let item of items; track item.id) { ... } a *ngFor
html = html.replace(/@for\s*\(\s*let\s+(\w+)\s+of\s+([^;]+);\s*track\s+(\w+)\s*\)\s*\{/g, (match, itemName, itemsExpr, trackExpr) => {
  // Extraer solo el nombre de la propiedad para trackBy
  const trackProp = trackExpr.split('.').pop();
  return `@for (${itemName} of ${itemsExpr}; track ${trackExpr}) {`;
  // Lo convertiremos posteriormente a *ngFor con trackBy en el componente
  // Por ahora, dejamos @for pero debería funcionar en Angular 18
});

// NOTA: Angular 18 soporta @for y @if nativamente. 
// El problema original es el TS, no el HTML.
// Así que revertiré y dejaré el HTML como está porque Angular 18 los soporta.

fs.writeFileSync(outputFile, html);
console.log('Conversión terminada. Archivo guardado en:', outputFile);
