const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'public');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
files.forEach(f => {
  let content = fs.readFileSync(path.join(dir, f), 'utf8');
  
  // Replace standard nav link
  content = content.replace(
    /<a href="\/calendar\.html" class="nav-link"><span class="icon">📅<\/span><span>Calendar<\/span><\/a>/g,
    '<a href="/calendar.html" class="nav-link"><span class="icon">📅</span><span>Calendar</span></a>\n    <a href="/revisions.html" class="nav-link nav-neon"><span class="icon">🔥</span><span>Revisions</span></a>'
  );
  
  // Replace active nav link (in calendar.html)
  content = content.replace(
    /<a href="\/calendar\.html" class="nav-link active"><span class="icon">📅<\/span><span>Calendar<\/span><\/a>/g,
    '<a href="/calendar.html" class="nav-link active"><span class="icon">📅</span><span>Calendar</span></a>\n    <a href="/revisions.html" class="nav-link nav-neon"><span class="icon">🔥</span><span>Revisions</span></a>'
  );

  fs.writeFileSync(path.join(dir, f), content);
  console.log(`Updated ${f}`);
});
