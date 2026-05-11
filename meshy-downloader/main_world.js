// main_world.js — Runs in the page's MAIN world (not isolated)
// Hooks Worker.postMessage to capture WASM auth credentials

(function () {
    const _origPostMessage = Worker.prototype.postMessage;

    Worker.prototype.postMessage = function (msg, transfer) {
        try {
            if (msg && msg.type === 'authorize' && msg.hostname && msg.signature) {
                // Send auth data to the content script via CustomEvent
                window.dispatchEvent(new CustomEvent('__meshy_auth__', {
                    detail: JSON.stringify({
                        hostname: msg.hostname,
                        timestamp: msg.timestamp,
                        signature: msg.signature
                    })
                }));
                console.log('[Meshy DL] ✓ WASM auth intercepted:', msg.hostname);
            }
        } catch (e) {
            console.error('[Meshy DL] Hook error:', e);
        }
        return _origPostMessage.call(this, msg, transfer);
    };

    console.log('[Meshy DL] ✓ Worker.postMessage hook installed (MAIN world)');
})();
