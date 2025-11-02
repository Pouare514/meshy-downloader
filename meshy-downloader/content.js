// content.js

function extractTokenFromCookies() {
  let token = null;
  
  console.log('🔍 Recherche du token Supabase dans les cookies...');
  
  try {
    const cookies = document.cookie.split(';');
    let authTokenPart0 = null;
    let authTokenPart1 = null;
    
    for (let cookie of cookies) {
      const [name, value] = cookie.split('=');
      const trimmedName = name.trim();
      
      if (trimmedName === 'sb-auth-auth-token.0') {
        authTokenPart0 = value.trim();
        console.log('✓ Trouvé sb-auth-auth-token.0:', authTokenPart0.substring(0, 50) + '...');
      }
      if (trimmedName === 'sb-auth-auth-token.1') {
        authTokenPart1 = value.trim();
        console.log('✓ Trouvé sb-auth-auth-token.1:', authTokenPart1.substring(0, 50) + '...');
      }
    }

    if (authTokenPart0 && authTokenPart1) {
      console.log('📝 Combinaison des deux parties...');
      
      let part0 = authTokenPart0;
      if (part0.startsWith('base64-')) {
        part0 = part0.substring(7);
        console.log('✓ Préfixe "base64-" enlevé');
      }
      
      const combined = part0 + authTokenPart1;
      console.log('Combined length:', combined.length);
      
      try {
        console.log('📝 Tentative decodage base64 (direct)...');
        const decoded = atob(combined);
        console.log('✓ Base64 decodé, length:', decoded.length);
        
        const parsed = JSON.parse(decoded);
        console.log('✓ JSON parsé');
        
        if (parsed.access_token) {
          token = parsed.access_token;
          console.log('✓✓✓ TOKEN TROUVE DEPUIS LES COOKIES ✓✓✓');
          console.log('Token length:', token.length);
        } else {
          console.warn('⚠️ JSON parsé mais pas de access_token');
        }
      } catch (e) {
        console.error('❌ Erreur decodage:', e.message);
      }
    } else {
      console.error('❌ Cookies incomplets');
    }
  } catch (e) {
    console.error('❌ Erreur générale cookies:', e.message);
  }
  
  return token;
}


setTimeout(() => {
  const token = extractTokenFromCookies();
  
  if (token) {
    console.log('✓ Envoi du token au background...');
    chrome.runtime.sendMessage({
      action: 'saveToken',
      token: token
    });
  } else {
    console.warn('❌ Token PAS TROUVE');
  }
}, 1500);


let tokenSaved = false;
const originalFetch = window.fetch;

window.fetch = function(...args) {
  const request = args[0];
  const options = args[1] || {};
  
  if (typeof request === 'string' && request.includes('api.meshy.ai')) {
    const authHeader = options.headers?.Authorization || options.headers?.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ') && !tokenSaved) {
      const token = authHeader.replace('Bearer ', '');
      
      chrome.runtime.sendMessage({
        action: 'saveToken',
        token: token
      });
      
      tokenSaved = true;
      console.log('✓✓✓ TOKEN INTERCEPTE DEPUIS FETCH ✓✓✓');
    }
  }
  
  return originalFetch.apply(this, args);
};
