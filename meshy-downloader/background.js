// background.js

let wasmAuth = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveToken') {
    chrome.storage.local.set({ meshy_token: request.token });
  }

  if (request.action === 'saveWasmAuth') {
    wasmAuth = request.auth;
    console.log('✓ WASM auth credentials stored');
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

  if (request.action === 'downloadAllTextures') {
    downloadAllTextures(request.taskId, request.textures, request.taskName);
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

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        // Step 1: Fetch root tasks (all pages)
        let allRootTasks = [];
        let pageNum = 1;
        const pageSize = 50;
        let hasMore = true;

        while (hasMore) {
          const url = `https://api.meshy.ai/web/v2/tasks/?sortBy=-created_at&pageNum=${pageNum}&pageSize=${pageSize}`;
          const response = await fetch(url, { method: 'GET', headers });

          if (!response.ok) {
            throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
          }

          const data = await response.json();
          let tasksList = extractTasksList(data);

          if (tasksList.length === 0) {
            hasMore = false;
          } else {
            allRootTasks = allRootTasks.concat(tasksList);
            hasMore = tasksList.length >= pageSize;
            pageNum++;
          }
        }

        // Filter to only keep root tasks (avoid duplicates with children)
        allRootTasks = allRootTasks.filter(t => !t.rootId || t.rootId === t.id);

        console.log(`[Meshy] Found ${allRootTasks.length} root tasks`);

        // Step 2: For each root task, fetch related tasks to find the best (textured) version
        const finalTasks = await Promise.all(allRootTasks.map(async (rootTask) => {
          try {
            const relatedUrl = `https://api.meshy.ai/web/v2/tasks/${rootTask.id}/related?sortBy=-created_at&pageNum=1&pageSize=20`;
            const relRes = await fetch(relatedUrl, { method: 'GET', headers });

            if (relRes.ok) {
              const relData = await relRes.json();
              const relatedTasks = extractTasksList(relData);

              if (relatedTasks.length > 0) {
                // Pick the best task: prefer texture > generate > draft phase, and SUCCEEDED status
                const bestTask = relatedTasks.find(t => t.phase === 'texture' && t.status === 'SUCCEEDED')
                  || relatedTasks.find(t => t.phase === 'generate' && t.status === 'SUCCEEDED')
                  || relatedTasks.find(t => t.status === 'SUCCEEDED')
                  || relatedTasks[0];

                return mapTask(bestTask, rootTask);
              }
            }
          } catch (e) {
            console.warn(`[Meshy] Failed to fetch related for ${rootTask.id}:`, e.message);
          }

          // Fallback: use the root task itself
          return mapTask(rootTask);
        }));

        const filteredTasks = finalTasks.filter(task => task.modelUrl)
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });

        console.log(`[Meshy] ${filteredTasks.length} downloadable models found`);
        resolve(filteredTasks);
      } catch (error) {
        reject(error);
      }
    });
  });
}

function extractTasksList(data) {
  if (Array.isArray(data)) return data;
  if (data.result && Array.isArray(data.result)) return data.result;
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.tasks && Array.isArray(data.tasks)) return data.tasks;
  return [];
}

function mapTask(task, rootTask) {
  const prompt = task.args?.draft?.prompt || task.args?.texture?.prompt || task.prompt || rootTask?.args?.draft?.prompt || '';
  const texSet = task.result?.texture?.textureUrls?.[0] || {};
  return {
    id: task.id,
    title: task.name || prompt || 'Sans titre',
    status: task.status,
    modelUrl: task.result?.texture?.modelUrl || task.result?.generate?.modelUrl || task.result?.draft?.modelUrl || task.result?.stylize?.modelUrl || task.model_url || task.modelUrl || '',
    createdAt: task.created_at || task.createdAt,
    prompt: prompt,
    imageUrl: task.result?.previewUrl || rootTask?.result?.previewUrl || '',
    textures: {
      colorMapUrl: texSet.colorMapUrl || '',
      metallicMapUrl: texSet.metallicMapUrl || '',
      roughnessMapUrl: texSet.roughnessMapUrl || '',
      normalMapUrl: texSet.normalMapUrl || ''
    },
    quadJsonUrl: task.result?.texture?.quadJsonUrl || task.result?.generate?.quadJsonUrl || '',
    triangleCount: task.triangleCount || task.faceCount || 0,
    vertexCount: task.vertexCount || 0,
    faceCount: task.faceCount || 0
  };
}

async function downloadModel(taskId, modelUrl, filename) {
  // Check if it's an encrypted .meshy file
  if (modelUrl.includes('.meshy')) {
    // Find an active meshy.ai tab for decryption
    const tabs = await chrome.tabs.query({ url: ['https://meshy.ai/*', 'https://www.meshy.ai/*'] });
    if (tabs.length === 0) {
      console.error('No meshy.ai tab found for decryption');
      return;
    }

    const glbFilename = filename.replace('.meshy', '.glb');
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'decryptAndDownload',
      modelUrl: modelUrl,
      filename: glbFilename,
      requestId: taskId
    });
  } else {
    // Direct download for non-encrypted files
    chrome.downloads.download({
      url: modelUrl,
      filename: `meshy_models/${filename}`,
      saveAs: true
    });
  }
}

function downloadTexture(taskId, textureUrl, filename) {
  chrome.downloads.download({
    url: textureUrl,
    filename: `meshy_models/${filename || taskId}_texture.png`,
    saveAs: true
  });
}

function downloadAllTextures(taskId, textures, taskName) {
  const safeName = (taskName || taskId).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  const maps = [
    { url: textures.colorMapUrl, suffix: 'color' },
    { url: textures.metallicMapUrl, suffix: 'metallic' },
    { url: textures.roughnessMapUrl, suffix: 'roughness' },
    { url: textures.normalMapUrl, suffix: 'normal' }
  ];

  maps.forEach(({ url, suffix }) => {
    if (url) {
      chrome.downloads.download({
        url: url,
        filename: `meshy_models/${safeName}_${suffix}.png`,
        saveAs: false
      });
    }
  });
}
