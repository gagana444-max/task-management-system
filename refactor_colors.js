const fs = require('fs');
const path = require('path');

const filesToRefactor = [
  'frontend/src/pages/Dashboard.jsx',
  'frontend/src/pages/TasksList.jsx',
  'frontend/src/pages/TaskDetail.jsx',
  'frontend/src/pages/AdminPanel.jsx',
  'frontend/src/pages/Notifications.jsx',
  'frontend/src/components/TaskCard.jsx',
  'frontend/src/components/TaskTableView.jsx',
  'frontend/src/components/PageHeader.jsx',
];

const replacements = [
  { regex: /bg-\[#f6f9fc\]/g, replacement: 'bg-[var(--bg)]' },
  { regex: /bg-\[#1c1e54\]/g, replacement: 'bg-[var(--brand-dark-900)]' },
  { regex: /background:\s*'#f6f9fc'/g, replacement: "background: 'var(--bg)'" },
  { regex: /background:\s*'#fff'/g, replacement: "background: 'var(--bg-card)'" },
  { regex: /background:\s*'#ffffff'/g, replacement: "background: 'var(--bg-card)'" },
  
  { regex: /color:\s*'#0d253d'/g, replacement: "color: 'var(--text)'" },
  { regex: /color:\s*'#273951'/g, replacement: "color: 'var(--text-secondary)'" },
  { regex: /color:\s*'#64748d'/g, replacement: "color: 'var(--text-muted)'" },
  { regex: /color:\s*'#a8c3de'/g, replacement: "color: 'var(--border-input)'" },
  
  { regex: /border:\s*'1px solid #e3e8ee'/g, replacement: "border: '1px solid var(--border)'" },
  { regex: /borderBottom:\s*'1px solid #e3e8ee'/g, replacement: "borderBottom: '1px solid var(--border)'" },
  { regex: /borderTop:\s*'1px solid #e3e8ee'/g, replacement: "borderTop: '1px solid var(--border)'" },
  
  { regex: /color:\s*'#533afd'/g, replacement: "color: 'var(--primary)'" },
  { regex: /background:\s*'#533afd'/g, replacement: "background: 'var(--primary)'" },
  { regex: /border:\s*'1px solid #533afd'/g, replacement: "border: '1px solid var(--primary)'" },
  { regex: /borderBottom:\s*'2px solid #533afd'/g, replacement: "borderBottom: '2px solid var(--primary)'" },
];

filesToRefactor.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(({ regex, replacement }) => {
      content = content.replace(regex, replacement);
    });

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Refactored ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  } else {
    console.warn(`File not found: ${file}`);
  }
});
