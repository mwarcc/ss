const ACCOUNTS_URL = 'https://cdn.jsdelivr.net/gh/mwarcc/mwarcc@latest/ws.txt';
const TOKEN_POST_URL = 'https://loveit.msp2.lol/save-token';

async function fetchAccounts() {
    try {
        const response = await fetch(ACCOUNTS_URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const text = await response.text();
        return text.split('\n').map(line => line.trim()).filter(line => line);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return [];
    }
}

async function login(username, password, countryCode) {
    try {
        const params = new URLSearchParams({
            client_id: 'unity.client',
            client_secret: 'secret',
            grant_type: 'password',
            scope: 'openid nebula offline_access',
            username: `${countryCode}|${username}`,
            password: password,
            acr_values: 'gameId:j68d'
        });

        const loginResponse = await fetch('https://eu-secure.mspapis.com/loginidentity/connect/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        }).then(res => res.json());

        if (loginResponse.error) throw new Error('Login failed: ' + loginResponse.error);

        const { access_token, refresh_token } = loginResponse;
        if (!access_token) throw new Error('No access token received');

        const [, payloadBase64] = access_token.split('.');
        const payload = JSON.parse(atob(payloadBase64));
        const sub = payload?.sub;
        if (!sub) throw new Error('Invalid token payload');

        const profilesResponse = await fetch(`https://eu.mspapis.com/profileidentity/v1/logins/${sub}/profiles?filter=region:${countryCode}`, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });

        const profiles = await profilesResponse.json();
        if (!profiles.length) throw new Error('No profiles found');

        const profileId = profiles[0].id;

        const finalTokenResponse = await fetch('https://eu-secure.mspapis.com/loginidentity/connect/token', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic dW5pdHkuY2xpZW50OnNlY3JldA==',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token,
                acr_values: `gameId:j68d profileId:${profileId}`
            })
        }).then(res => res.json());

        if (finalTokenResponse.error) throw new Error('Token refresh failed');
        return finalTokenResponse.access_token;
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
}

async function sendToken(token) {
    try {
        const response = await fetch(TOKEN_POST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jwt: token })
        });
        if (!response.ok) throw new Error(`Failed to send token: ${response.statusText}`);
        console.log('Token sent successfully');
    } catch (error) {
        console.error('Token submission error:', error);
    }
}

async function run() {
    const accounts = await fetchAccounts();
    if (accounts.length === 0) return console.error('No accounts available');

    const randomAccount = accounts[Math.floor(Math.random() * accounts.length)];
    const [username, password, countryCode] = randomAccount.split(':');
    if (!username || !password || !countryCode) return console.error('Invalid account format');

    console.log(`Attempting login for: ${username}`);
    const token = await login(username, password, countryCode);
    if (token) await sendToken(token);
}

run();
setInterval(run, 5 * 60 * 1000);
