/**
 * Blocking inline script that runs before first paint. Reads the user's
 * saved theme choice (localStorage key `lf-theme`), falls back to the OS
 * preference, and writes `data-theme` onto <html>. Without this, dark
 * users flash light on every navigation.
 */

const SCRIPT = `(() => {
  try {
    const saved = localStorage.getItem('lf-theme');
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const t = saved === 'light' || saved === 'dark' ? saved : sys;
    document.documentElement.setAttribute('data-theme', t);
  } catch { document.documentElement.setAttribute('data-theme', 'light'); }
})();`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
}
