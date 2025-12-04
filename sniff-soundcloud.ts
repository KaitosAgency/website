import { chromium, Page } from 'playwright';

// 🛡️ Techniques anti-détection pour éviter le blocage

async function launchStealthBrowser() {
    console.log('🕵️  Lancement du navigateur furtif...');

    // Trouver le chemin de Chrome installé sur le système
    const chromePath = await findChromePath();

    // 1. Utiliser le vrai Chrome au lieu de Chromium (moins facilement détecté)
    const browser = await chromium.launch({
        headless: false,
        executablePath: chromePath,
        timeout: 60000, // 60 secondes de timeout
        args: [
            // 🛡️ Arguments pour passer les tests anti-bot
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--start-maximized',
            '--disable-extensions',
            '--disable-plugins-discovery',
            '--disable-default-apps',
            '--lang=fr-FR',
        ],
    });

    // 2. Créer un contexte avec un vrai profil utilisateur
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        locale: 'fr-FR',
        timezoneId: 'Europe/Paris',
        permissions: ['geolocation'],
        screen: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        extraHTTPHeaders: {
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
    });

    return { browser, context };
}

async function findChromePath(): Promise<string | undefined> {
    const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    ];

    for (const path of possiblePaths) {
        try {
            const fs = await import('fs');
            if (fs.existsSync(path)) {
                console.log(`✅ Chrome trouvé: ${path}`);
                return path;
            }
        } catch { }
    }

    console.log('⚠️  Chrome non trouvé, utilisation de Chromium par défaut');
    return undefined;
}

async function injectStealthScripts(page: Page) {
    await page.addInitScript(() => {
        // Supprimer la propriété webdriver
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });

        // Masquer que c'est Chrome automatisé
        Object.defineProperty(navigator, 'plugins', {
            get: () => [
                {
                    0: { type: 'application/x-google-chrome-pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                    description: 'Portable Document Format',
                    filename: 'internal-pdf-viewer',
                    length: 1,
                    name: 'Chrome PDF Plugin',
                },
                {
                    0: { type: 'application/pdf', suffixes: 'pdf', description: '' },
                    description: '',
                    filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
                    length: 1,
                    name: 'Chrome PDF Viewer',
                },
            ],
        });

        Object.defineProperty(navigator, 'languages', {
            get: () => ['fr-FR', 'fr', 'en-US', 'en'],
        });

        Object.defineProperty(navigator, 'hardwareConcurrency', {
            get: () => 8,
        });

        Object.defineProperty(navigator, 'deviceMemory', {
            get: () => 8,
        });

        // @ts-ignore
        window.chrome = {
            runtime: {},
            loadTimes: function () { },
            csi: function () { },
            app: {},
        };

        // @ts-ignore
        delete window.callPhantom;
        // @ts-ignore
        delete window._phantom;
    });
}

async function humanLikeDelay(min: number = 500, max: number = 2000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
}

async function humanLikeMouseMove(page: Page) {
    const viewportSize = page.viewportSize();
    if (viewportSize) {
        const x = Math.floor(Math.random() * viewportSize.width);
        const y = Math.floor(Math.random() * viewportSize.height);
        await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 10) + 5 });
    }
}

(async () => {
    const { browser, context } = await launchStealthBrowser();
    const page = await context.newPage();

    // Augmenter le timeout par défaut
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    // Injecter les scripts anti-détection AVANT toute navigation
    await injectStealthScripts(page);

    console.log('🚀 Navigation vers SoundCloud...');

    // Écouter toutes les requêtes sortantes
    page.on('request', (request) => {
        if (
            (request.method() === 'PUT' || request.method() === 'POST') &&
            request.url().includes('api-v2.soundcloud.com') &&
            !request.url().includes('event')
        ) {
            console.log('\n🎯 BINGO ! Requête potentielle détectée :');
            console.log(`METHOD: ${request.method()}`);
            console.log(`URL: ${request.url()}`);

            const headers = request.headers();
            console.log('HEADERS (Authorization):', headers['authorization'] || 'Pas de header Authorization direct');

            const postData = request.postData();
            console.log('DATA:', postData);
            console.log('---------------------------------------------------\n');
        }
    });

    // Simuler un comportement humain avant la navigation
    await humanLikeDelay(1000, 2000);

    // Aller directement sur SoundCloud signin (sans passer par Google)
    console.log('🎵 Accès direct à SoundCloud...');

    try {
        // Utiliser 'domcontentloaded' au lieu de 'networkidle' (plus rapide et moins de timeout)
        await page.goto('https://soundcloud.com/signin', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
    } catch (error) {
        console.log('⚠️  Navigation lente, mais on continue...');
    }

    // Bouger la souris pour paraître humain
    await humanLikeMouseMove(page);
    await humanLikeDelay(1000, 2000);

    console.log('🛑 En attente... Connectez-vous et changez votre bio.');
    console.log('Une fois que vous avez vu la requête s\'afficher dans ce terminal, vous pouvez fermer le navigateur.');

    await page.waitForTimeout(3600000); // 1 heure
    await browser.close();
})();
