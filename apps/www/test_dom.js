import fs from 'fs';
fetch('http://localhost:4321/library/')
  .then(res => res.text())
  .then(html => {
    fs.writeFileSync('dom.html', html);
    console.log("DOM saved to dom.html");
  })
  .catch(console.error);
