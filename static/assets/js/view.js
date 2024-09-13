import { loadProxyWorker, encoder, storage, loadCJS, setTransport } from './utils.js';
import { loadSettings } from './settings.js';

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console[type](`[${timestamp}] ${message}`);
}

await loadCJS('/baremux/bare.cjs');

log('Loaded bare.cjs');

loadSettings();

const params = new URLSearchParams(location.search);
const parsedData = JSON.parse(atob(params.get('load')));

log(parsedData.target)

window.history.replaceState({}, '', location.pathname);

log('Replaced history state');

if (params.get('load')) {
    try {
        const parsedData = JSON.parse(atob(params.get('load')));
        document.querySelector("#loadframe").src = parsedData.target
        if (Boolean(parsedData.target && parsedData.title && parsedData.return)) {
            log('Load data valid, proceeding...');
            document.body.classList.remove('hidden');

            sessionStorage.setItem('loaddata', JSON.stringify(parsedData));
            log('Setting target directly (fuck proxies)');
            document.querySelector('#loadframe').src = parsedData.target;

            document.querySelector('#loadframe').addEventListener('load', () => {
                log('Loaded frame');
                document.querySelector('.title').textContent = parsedData.title;

                document.querySelector('#loadframe').style.transition = 'none';
                document.querySelector('#loadframe').style.background = '#fff';

                document.querySelector('#loadframe').addEventListener('mouseover', () => {
                    document.querySelector('.gamebar').classList.add('collapsed');
                    document.querySelector('.hitbox').classList.remove('active');
                });

                document.querySelector('#loadframe').addEventListener('mouseout', () => {
                    document.querySelector('.gamebar').classList.remove('collapsed');
                    document.querySelector('.hitbox').classList.add('active');
                });

                setTimeout(() => {
                    log('Timeout reached, restoring gamebar');
                    document.querySelector('.gamebar').classList.remove('collapsed');
                    document.querySelector('.hitbox').classList.add('active');
                }, 1000);
            });

            document.querySelector('#fullscreen').addEventListener('click', () => {
                log('Fullscreen button clicked');
                const frame = document.querySelector('#loadframe');

                if (frame.requestFullscreen) frame.requestFullscreen();
                else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
                else if (frame.mozRequestFullScreen) frame.mozRequestFullScreen();
                else if (frame.msRequestFullscreen) frame.msRequestFullscreen();
            });

            window.addEventListener('fullscreenchange', () => {
                log('Fullscreen change detected');
                if (document.fullscreenElement) document.querySelector('#loadframe').style.borderRadius = '0px';
                else document.querySelector('#loadframe').style.borderRadius = '';
            });

            document.querySelector('#return').addEventListener('click', () => {
                log('Return button clicked');
                document.body.style.opacity = '0.7';

                setTimeout(() => {
                    log('Returning to previous page');
                    window.location.href = parsedData.return;
                }, 500);
            });
        } else if (parsedData.target && parsedData.redirect === true) {
            log('Redirect data found, redirecting...');

            window.history.replaceState({}, '', '/redirect');

            if (parsedData.trusted) {
                log('Target is trusted, redirecting immediately');
                window.location.replace(parsedData.target);
            } else {
                log(`Target is untrusted, showing notice for ${parsedData.target}`);
                document.documentElement.textContent = `Redirecting to ${parsedData.target}`;
                setTimeout(() => window.location.replace(parsedData.target), 1000);
            }
        } else {
            log('Invalid parsed data, returning to default location');
            window.location.replace(parsedData.return || '/');
        }
    } catch (e) {
        log(`Error encountered: ${e}`, 'error');
        alert(e);
        window.location.replace('/');
    }
} else if (sessionStorage.getItem('loaddata')) {
    log('Found loaddata in session storage, reloading...');
    window.location.replace(`/view?load=${btoa(sessionStorage.getItem('loaddata'))}`);
} else {
    log('No load data found, redirecting to root');
    window.location.replace('/');
}
