// background.js

// Stocker le bearer token
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveToken') {
    chrome.storage.local.set({ meshy_token: request.token });
    console.log('✓ Token sauvegardé:', request.token.substring(0, 20) + '...');
  }
  
  if (request.action === 'getTasks') {
    getTasks().then(tasks => {
      sendResponse({ success: true, tasks: tasks });
    }).catch(error => {
      console.error('Erreur getTasks:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Important pour les requêtes asynchrones
  }
  
  if (request.action === 'downloadModel') {
    downloadModel(request.taskId, request.modelUrl, request.filename);
  }
  
  if (request.action === 'downloadTexture') {
    downloadTexture(request.taskId, request.textureUrl, request.filename);
  }
});

// Récupérer les tâches de l'utilisateur
async function getTasks() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('meshy_token', async (result) => {
      const token = result.meshy_token;
      
      if (!token) {
        console.error('❌ Token non trouvé dans le stockage');
        reject(new Error('Token non trouvé. Assure-toi d\'être sur meshy.ai et d\'attendre le chargement complet.'));
        return;
      }
      
      console.log('✓ Token trouvé, tentative de récupération des tâches...');
      
      try {
        // Récupérer les tâches
        const response = await fetch('https://api.meshy.ai/web/v2/tasks', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Réponse API:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Erreur API:', errorData);
          throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Données reçues (structure):', typeof data, Array.isArray(data) ? 'array' : 'object');
        console.log('Données reçues (keys):', Object.keys(data || {}));
        console.log('Données reçues (first 200 chars):', JSON.stringify(data).substring(0, 200));
        
        // Extraire les tâches avec leurs modelUrl
        // L'API peut retourner plusieurs formats
        let tasksList = [];
        
        // Format 1: Array direct
        if (Array.isArray(data)) {
          tasksList = data;
        }
        // Format 2: {data: [...]}
        else if (data.data && Array.isArray(data.data)) {
          tasksList = data.data;
        }
        // Format 3: {result: [...]} (Meshy API standard)
        else if (data.result && Array.isArray(data.result)) {
          tasksList = data.result;
        }
        // Format 4: {tasks: [...]}
        else if (data.tasks && Array.isArray(data.tasks)) {
          tasksList = data.tasks;
        }
        
        console.log('Tasks list trouvée:', tasksList.length, 'tâches');
        
        if (!Array.isArray(tasksList)) {
          console.error('Structure inattendue, pas de tableau trouvé');
          console.log('Structure complète:', JSON.stringify(data).substring(0, 500));
          throw new Error('Structure de réponse API inattendue');
        }
        
        const tasks = tasksList.map(task => ({
          id: task.id,
          title: task.prompt || task.name || 'Sans titre',
          status: task.status,
          modelUrl: task.model_url || task.modelUrl || task.result?.generate?.modelUrl || task.generate?.modelUrl || task.result?.texture?.modelUrl,
          createdAt: task.created_at || task.createdAt,
          prompt: task.args?.draft?.prompt || task.args?.texture?.prompt || task.prompt || '',
          imageUrl: task.result?.previewUrl || '',
          textureUrl: task.result?.texture?.textureUrls?.[0]?.colorMapUrl || ''
        })).filter(task => task.modelUrl)
          .sort((a, b) => {
            // Trier par date décroissante (plus récent en premier)
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
        
        console.log(`✓ ${tasks.length} tâche(s) avec modèle trouvée(s)`);
        resolve(tasks);
      } catch (error) {
        console.error('Erreur lors de la récupération des tâches:', error);
        reject(error);
      }
    });
  });
}

// Télécharger le fichier model
function downloadModel(taskId, modelUrl, filename) {
  chrome.downloads.download({
    url: modelUrl,
    filename: `meshy_models/${filename || taskId}.glb`,
    saveAs: true
  });
}

// Télécharger la texture
function downloadTexture(taskId, textureUrl, filename) {
  chrome.downloads.download({
    url: textureUrl,
    filename: `meshy_models/${filename || taskId}_texture.png`,
    saveAs: true
  });
}
