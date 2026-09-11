const fs = require('fs');
const filePath = 'src/admin/pages/Quotations.jsx';
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(
  /{viewquotation\.customer\?\.name \|\| '}/,
  "{viewquotation.customer?.name || 'N/A'}"
);
fs.writeFileSync(filePath, content);
console.log('Fixed unterminated string literal in Quotations.jsx');
