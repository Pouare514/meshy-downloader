// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveToken') {
    chrome.storage.local.set({ meshy_token: request.token });
  }

  if (request.action === 'getTasks') {
    getTasks().then(tasks => {
      sendResponse({ success: true, tasks: tasks });
    }).catch(error => {
      console.error('Erreur getTasks:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }

  if (request.action === 'downloadModel') {
    downloadModel(request.taskId, request.modelUrl, request.filename);
  }

  if (request.action === 'downloadTexture') {
    downloadTexture(request.taskId, request.textureUrl, request.filename);
  }
});

async function getTasks() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('meshy_token', async (result) => {
      const token = result.meshy_token;

      if (!token) {
        reject(new Error('Token non trouvé. Assure-toi d\'être sur meshy.ai et d\'attendre le chargement complet.'));
        return;
      }

      try {
        const response = await fetch('https://api.meshy.ai/web/v2/tasks', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        let tasksList = [];

        if (Array.isArray(data)) {
          tasksList = data;
        }
        else if (data.data && Array.isArray(data.data)) {
          tasksList = data.data;
        }
        else if (data.result && Array.isArray(data.result)) {
          tasksList = data.result;
        }
        else if (data.tasks && Array.isArray(data.tasks)) {
          tasksList = data.tasks;
        }

        if (!Array.isArray(tasksList)) {
          throw new Error('Structure de réponse API inattendue');
        }

        const tasks = await Promise.all(tasksList.map(async (task) => {
          const baseTask = {
            id: task.id,
            title: task.prompt || task.name || 'Sans titre',
            status: task.status,
            modelUrl: task.model_url || task.modelUrl || task.result?.generate?.modelUrl || task.generate?.modelUrl || task.result?.texture?.modelUrl,
            createdAt: task.created_at || task.createdAt,
            prompt: task.args?.draft?.prompt || task.args?.texture?.prompt || task.prompt || '',
            imageUrl: task.result?.previewUrl || '',
            textureUrl: task.result?.texture?.textureUrls?.[0]?.colorMapUrl || '',
            quadJsonUrl: task.result?.texture?.quadJsonUrl || task.result?.generate?.quadJsonUrl || ''
          };

          return baseTask;
        }));

        const filteredTasks = tasks.filter(task => task.modelUrl)
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });

        resolve(filteredTasks);
      } catch (error) {
        reject(error);
      }
    });
  });
}

function downloadModel(taskId, modelUrl, filename) {
  chrome.downloads.download({
    url: modelUrl,
    filename: `meshy_models/${filename || taskId}.glb`,
    saveAs: true
  });
}

function downloadTexture(taskId, textureUrl, filename) {
  chrome.downloads.download({
    url: textureUrl,
    filename: `meshy_models/${filename || taskId}_texture.png`,
    saveAs: true
  });
}
