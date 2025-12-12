import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        // 🔒 SECURITY: Verify user authentication
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { bio, oauthToken } = await req.json();

        if (!bio || !oauthToken) {
            return NextResponse.json(
                { error: 'Bio and OAuth token are required' },
                { status: 400 }
            );
        }

        // 🔒 SECURITY: Verify that the oauthToken belongs to this authenticated user
        const { data: soundcloudUser, error: tokenError } = await supabase
            .from('soundcloud_users')
            .select('access_token')
            .eq('user_id', user.id)
            .single();

        if (tokenError || !soundcloudUser) {
            return NextResponse.json(
                { error: 'SoundCloud account not connected' },
                { status: 403 }
            );
        }

        // Verify token matches
        if (oauthToken !== soundcloudUser.access_token) {
            return NextResponse.json(
                { error: 'Invalid OAuth token' },
                { status: 403 }
            );
        }

        // Lancement du navigateur (headless: true pour ne pas voir la fenêtre)
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();

        // Injection du cookie d'authentification
        // SoundCloud utilise principalement le cookie 'oauth_token'
        await context.addCookies([
            {
                name: 'oauth_token',
                value: oauthToken,
                domain: '.soundcloud.com',
                path: '/',
            },
        ]);

        const page = await context.newPage();

        // Navigation directe vers la page d'édition du profil
        // L'URL peut varier, mais généralement c'est /you/edit ou via le profil
        // On va sur la home d'abord pour vérifier la connexion, puis on navigue
        await page.goto('https://soundcloud.com/you/edit', { waitUntil: 'networkidle' });

        // Vérification si on est bien connecté (si on est redirigé vers /signin, le token est invalide)
        if (page.url().includes('signin')) {
            await browser.close();
            return NextResponse.json({ error: 'Invalid OAuth Token' }, { status: 401 });
        }

        // Sélecteurs pour SoundCloud (à vérifier car ils peuvent changer)
        // On cherche le champ de description (souvent un textarea ou un input spécifique)
        // Note: Les classes CSS de SoundCloud sont souvent obfusquées, on vise les attributs stables

        // Attendre que le formulaire soit visible
        const descriptionSelector = 'textarea[id="user-description"]'; // Exemple générique, peut nécessiter d'être ajusté
        // Si l'ID n'est pas stable, on peut utiliser le texte ou d'autres attributs
        // await page.getByLabel('Description').fill(bio); // Alternative Playwright plus robuste

        // Tentative de remplissage plus générique si l'ID change
        try {
            // On essaie de trouver le champ par son label visible ou placeholder
            await page.getByLabel('Description', { exact: false }).fill(bio);
        } catch (e) {
            // Fallback sur un sélecteur CSS plus précis si le label échoue
            // C'est ici qu'il faudra peut-être inspecter votre page SoundCloud manuellement si ça échoue
            await page.locator('.user-edit-form textarea').first().fill(bio);
        }

        // Cliquer sur le bouton Save
        // Souvent "Save changes" ou une classe spécifique
        await page.getByText('Save changes', { exact: false }).click();

        // Attendre la confirmation (souvent un toast ou un changement d'état)
        await page.waitForTimeout(2000); // Petite pause pour laisser la requête partir

        await browser.close();

        return NextResponse.json({ success: true, message: 'Bio updated successfully' });
    } catch (error) {
        console.error('SoundCloud Update Error:', error);
        return NextResponse.json(
            { error: 'Failed to update bio', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
