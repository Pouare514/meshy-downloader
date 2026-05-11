// popup.js

document.getElementById('loadTasks').addEventListener('click', loadTasks);

// Listen for decrypt status updates from content script
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'decryptStatus') {
    const btn = document.querySelector(`.btn-download[data-id="${request.requestId}"]`);
    if (!btn) return;

    if (request.status === 'fetching') {
      btn.innerHTML = '<span class="download-icon">📥</span><span class="download-text">Fetching...</span>';
    } else if (request.status === 'decrypting') {
      btn.innerHTML = '<span class="download-icon">🔓</span><span class="download-text">Decrypting...</span>';
    } else if (request.status === 'done') {
      btn.innerHTML = '<span class="download-icon">✅</span><span class="download-text">Done!</span>';
    } else if (request.status === 'error') {
      btn.innerHTML = '<span class="download-icon">❌</span><span class="download-text">Error</span>';
      btn.title = request.error;
      btn.disabled = false;
    }
  }
});

async function loadTasks() {
  const statusDiv = document.getElementById('status');
  const tasksList = document.getElementById('tasksList');

  statusDiv.innerHTML = '<span class="status-icon">⏳</span><span class="status-text">Fetching your models...</span>';
  statusDiv.classList.add('loading');
  tasksList.innerHTML = '';

  chrome.runtime.sendMessage({ action: 'getTasks' }, async (response) => {
    statusDiv.classList.remove('loading');

    if (response.success && response.tasks.length > 0) {
      statusDiv.innerHTML = `<span class="status-icon">✓</span><span class="status-text">${response.tasks.length} model(s) found</span>`;
      statusDiv.classList.add('success');

      displayTasks(response.tasks, tasksList);

    } else {
      statusDiv.innerHTML = `<span class="status-icon">❌</span><span class="status-text">${response.error || 'No models found'}</span>`;
      statusDiv.classList.add('error');
    }
  });
}

function displayTasks(tasks, tasksList) {
  tasks.forEach((task) => {
    const taskEl = document.createElement('div');
    taskEl.className = 'task-card';

    const date = new Date(task.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const statusClass = task.status.toLowerCase();

    const imageDisplay = task.imageUrl ? `<img src="${task.imageUrl}" alt="Preview" class="task-image" />` : '';

    const displayTitle = (task.prompt && task.prompt.length < 25)
      ? task.prompt
      : (task.title || 'Untitled Model');
    const formatNumber = (num) => num ? num.toLocaleString('en-US') : '';

    const polyInfo = (task.faceCount || task.vertexCount || task.triangleCount)
      ? `<div class="meta-item">
          <span class="meta-label">Polygons:</span>
          <span class="meta-value">${task.faceCount ? formatNumber(task.faceCount) + ' faces' : ''}${task.faceCount && task.vertexCount ? ', ' : ''}${task.vertexCount ? formatNumber(task.vertexCount) + ' vertices' : ''}</span>
        </div>`
      : '';

    const isMeshy = task.modelUrl.includes('.meshy');
    const downloadLabel = isMeshy ? 'Download GLB' : 'Download Model';
    const downloadFilename = isMeshy ? `meshy_${task.id}.glb` : `meshy_${task.id}.glb`;

    const textureCount = task.textures ? Object.values(task.textures).filter(u => u).length : 0;
    const hasTextures = textureCount > 0;

    taskEl.innerHTML = `
      <div class="task-header">
        ${imageDisplay}
        <div class="task-header-content">
          <div class="task-title">${displayTitle}</div>
          <span class="status-badge ${statusClass}">${task.status}</span>
        </div>
      </div>
      <div class="task-meta">
        ${polyInfo}
        <div class="meta-item">
          <span class="meta-label">ID:</span>
          <span class="meta-value">${task.id.substring(0, 12)}...</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Date:</span>
          <span class="meta-value">${date}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-download" data-id="${task.id}" data-url="${task.modelUrl}" data-filename="${downloadFilename}">
          <span class="download-icon">⬇️</span>
          <span class="download-text">${downloadLabel}</span>
        </button>
        ${hasTextures ? `<button class="btn-download-texture" data-id="${task.id}" data-textures='${JSON.stringify(task.textures)}' data-taskname="${displayTitle}">
          <span class="download-icon">🖼️</span>
          <span class="download-text">Download Textures (${textureCount})</span>
        </button>` : ''}
      </div>
    `;

    tasksList.appendChild(taskEl);
  });

  // Download model buttons
  document.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', () => {
      const taskId = btn.dataset.id;
      const modelUrl = btn.dataset.url;
      const filename = btn.dataset.filename;

      chrome.runtime.sendMessage({
        action: 'downloadModel',
        taskId: taskId,
        modelUrl: modelUrl,
        filename: filename
      });

      btn.innerHTML = '<span class="download-icon">⏳</span><span class="download-text">Starting...</span>';
      btn.disabled = true;
    });
  });

  // Download all textures buttons
  document.querySelectorAll('.btn-download-texture').forEach(btn => {
    btn.addEventListener('click', () => {
      const taskId = btn.dataset.id;
      const textures = JSON.parse(btn.dataset.textures);
      const taskName = btn.dataset.taskname;

      chrome.runtime.sendMessage({
        action: 'downloadAllTextures',
        taskId: taskId,
        textures: textures,
        taskName: taskName
      });

      btn.innerHTML = '<span class="download-icon">✓</span><span class="download-text">Downloading...</span>';
      btn.disabled = true;
    });
  });
}
