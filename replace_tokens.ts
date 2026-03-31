import fs from 'fs';
import path from 'path';

const replacements: Record<string, string> = {
  'bg-slate-950': 'bg-background',
  'bg-slate-900': 'bg-surface',
  'bg-slate-800': 'bg-surface-hover',
  'bg-slate-700': 'bg-border-hover',
  'text-slate-100': 'text-primary',
  'text-slate-200': 'text-secondary',
  'text-slate-300': 'text-secondary',
  'text-slate-400': 'text-muted',
  'text-slate-500': 'text-subtle',
  'text-slate-600': 'text-subtle',
  'text-slate-900': 'text-background',
  'border-slate-800': 'border-border',
  'border-slate-700': 'border-border-hover',
  'text-primary-500': 'text-accent',
  'bg-primary-500': 'bg-accent',
  'border-primary-500': 'border-accent',
  'ring-primary-500': 'ring-accent',
  'text-primary-400': 'text-accent-hover',
  'bg-primary-400': 'bg-accent-hover',
  'border-primary-400': 'border-accent-hover',
  'text-primary-300': 'text-accent-muted',
  'bg-primary-600': 'bg-accent-active',
  'text-emerald-500': 'text-success',
  'bg-emerald-500': 'bg-success',
  'border-emerald-500': 'border-success',
  'text-emerald-400': 'text-success-muted',
  'bg-emerald-900': 'bg-success-bg',
  'text-red-500': 'text-error',
  'bg-red-500': 'bg-error',
  'border-red-500': 'border-error',
  'text-red-400': 'text-error-muted',
  'bg-red-900': 'bg-error-bg',
  'border-red-900': 'border-error-bg',
  'bg-red-800': 'bg-error-bg',
  'border-red-800': 'border-error-bg',
  'bg-red-950': 'bg-background',
  'text-blue-500': 'text-info',
  'bg-blue-500': 'bg-info',
  'border-blue-500': 'border-info',
  'text-blue-400': 'text-info-muted',
  'text-yellow-500': 'text-warning',
  'bg-yellow-500': 'bg-warning',
  'border-yellow-500': 'border-warning',
  'text-yellow-400': 'text-warning-muted',
  'text-purple-400': 'text-info-muted',
  'text-amber-400': 'text-warning-muted',
};

const exactReplacements: Record<string, string> = {
  'from-primary-500': 'from-accent',
  'via-primary-500': 'via-accent',
  'to-primary-500': 'to-accent',
  'border-t-primary-500': 'border-t-accent',
  'bg-primary-900': 'bg-accent-active',
  'text-primary-50': 'text-primary',
  'border-emerald-400': 'border-success-muted',
  'bg-[rgba(55,114,255,0.3)]': 'bg-accent/30',
  'shadow-[0_4px_20px_rgba(55,114,255,0.3)]': 'shadow-lg shadow-accent/30',
  'shadow-[0_6px_30px_rgba(55,114,255,0.5)]': 'shadow-xl shadow-accent/50',
  'shadow-[0_6px_25px_rgba(55,114,255,0.4)]': 'shadow-xl shadow-accent/40',
  'shadow-[0_0_20px_rgba(55,114,255,0.3)]': 'shadow-lg shadow-accent/30',
  'shadow-[0_0_30px_rgba(55,114,255,0.5)]': 'shadow-xl shadow-accent/50',
  'shadow-[0_0_15px_rgba(139,92,246,0.3)]': 'shadow-md shadow-accent/30',
  'shadow-[0_0_30px_rgba(55,114,255,0.1)]': 'shadow-xl shadow-accent/10',
  'shadow-[0_0_20px_rgba(239,68,68,0.15)]': 'shadow-lg shadow-error/15',
  'drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]': 'drop-shadow-md drop-shadow-error/30',
  'shadow-[0_10px_40px_rgba(0,0,0,0.4)]': 'shadow-2xl shadow-black/40',
  'shadow-[0_0_40px_rgba(55,114,255,0.2)]': 'shadow-2xl shadow-accent/20',
  'shadow-[0_4px_15px_rgba(139,92,246,0.1)]': 'shadow-md shadow-accent/10',
  'shadow-[0_0_10px_rgba(55,114,255,0.8)]': 'shadow-sm shadow-accent/80',
  'shadow-[0_0_10px_rgba(55,114,255,0.2)]': 'shadow-sm shadow-accent/20',
  'shadow-[0_0_5px_rgba(55,114,255,0.8)]': 'shadow-sm shadow-accent/80',
  'bg-purple-900/20': 'bg-info/10',
  'bg-purple-500/10': 'bg-info/10',
  'border-purple-500/20': 'border-info/20',
  'bg-amber-900/20': 'bg-warning/10',
  'shadow-black/40': 'shadow-background/40',
  'border-white/5': 'border-border-subtle',
  'bg-black': 'bg-background',
  'text-white': 'text-primary',
};

function walkDir(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Replace word-boundary tokens
    for (const [oldClass, newClass] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newClass);
        modified = true;
      }
    }

    // Replace exact string tokens (for arbitrary values)
    for (const [oldClass, newClass] of Object.entries(exactReplacements)) {
      if (content.includes(oldClass)) {
        content = content.split(oldClass).join(newClass);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated ${filePath}`);
    }
  }
});
