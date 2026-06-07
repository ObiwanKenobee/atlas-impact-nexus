export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .status { margin: 0 0 1rem; font-size: 13px; color: #6b7280; min-height: 1.25rem; }
      .status.err { color: #b91c1c; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .primary[disabled] { opacity: 0.6; cursor: progress; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div id="status" class="status"></div>
      <div class="actions">
        <button id="retry" class="primary" type="button">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
    <script>
      (function () {
        var btn = document.getElementById('retry');
        var status = document.getElementById('status');
        function setStatus(msg, isErr) {
          status.textContent = msg || '';
          status.className = 'status' + (isErr ? ' err' : '');
        }
        // Clear any stale client error markers so the next render starts clean.
        try {
          for (var i = sessionStorage.length - 1; i >= 0; i--) {
            var k = sessionStorage.key(i);
            if (k && k.indexOf('lovable-error') === 0) sessionStorage.removeItem(k);
          }
        } catch (e) { /* ignore */ }

        btn.addEventListener('click', async function () {
          btn.setAttribute('disabled', 'true');
          setStatus('Re-attempting render…', false);
          try {
            var url = location.pathname + location.search + (location.search ? '&' : '?') + '_retry=' + Date.now();
            var res = await fetch(url, { headers: { 'cache-control': 'no-cache' }, credentials: 'same-origin' });
            var text = await res.text();
            var stillBroken = res.status >= 500 || text.indexOf("This page didn't load") !== -1;
            if (stillBroken) {
              setStatus('Still failing (status ' + res.status + '). Please try again in a moment.', true);
              btn.removeAttribute('disabled');
              return;
            }
            // Server recovered — do a hard reload to remount the app cleanly.
            setStatus('Recovered — reloading…', false);
            location.reload();
          } catch (err) {
            setStatus('Network error: ' + (err && err.message ? err.message : err), true);
            btn.removeAttribute('disabled');
          }
        });
      })();
    </script>
  </body>
</html>`;
}
