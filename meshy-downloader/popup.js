// popup.js

document.getElementById('loadTasks').addEventListener('click', loadTasks);

async function loadTasks() {
  const statusDiv = document.getElementById('status');
  const tasksList = document.getElementById('tasksList');
  
  statusDiv.innerHTML = '<span class="status-icon">⏳</span><span class="status-text">Fetching your models...</span>';
  statusDiv.classList.add('loading');
  tasksList.innerHTML = '';
  
  chrome.runtime.sendMessage({ action: 'getTasks' }, (response) => {
    statusDiv.classList.remove('loading');
    
    if (response.success && response.tasks.length > 0) {
      statusDiv.innerHTML = `<span class="status-icon">✓</span><span class="status-text">${response.tasks.length} model(s) found</span>`;
      statusDiv.classList.add('success');
      
      response.tasks.forEach((task) => {
        const taskEl = document.createElement('div');
        taskEl.className = 'task-card';
        
        const date = new Date(task.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        const statusClass = task.status.toLowerCase();
        
        const imageDisplay = task.imageUrl ? `<img src="${task.imageUrl}" alt="Preview" class="task-image" />` : '';
        
        // Utiliser le prompt comme titre s'il fait moins de 25 caractères
        const displayTitle = (task.prompt && task.prompt.length < 25) 
          ? task.prompt 
          : (task.title || 'Untitled Model');
        
        taskEl.innerHTML = `
          <div class="task-header">
            ${imageDisplay}
            <div class="task-header-content">
              <div class="task-title">${displayTitle}</div>
              <span class="status-badge ${statusClass}">${task.status}</span>
            </div>
          </div>
          <div class="task-meta">
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
            <button class="btn-download" data-id="${task.id}" data-url="${task.modelUrl}" data-filename="meshy_${task.id}.glb">
              <span class="download-icon">⬇️</span>
              <span class="download-text">Download Model</span>
            </button>
            ${task.textureUrl ? `<button class="btn-download-texture" data-id="${task.id}" data-url="${task.textureUrl}" data-filename="meshy_${task.id}_texture.png">
              <span class="download-icon">🖼️</span>
              <span class="download-text">Download Texture</span>
            </button>` : ''}
          </div>
        `;
        
        tasksList.appendChild(taskEl);
      });
      
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
          
          btn.innerHTML = '<span class="download-icon">✓</span><span class="download-text">Downloading...</span>';
          btn.disabled = true;
        });
      });
      
      document.querySelectorAll('.btn-download-texture').forEach(btn => {
        btn.addEventListener('click', () => {
          const taskId = btn.dataset.id;
          const textureUrl = btn.dataset.url;
          const filename = btn.dataset.filename;
          
          chrome.runtime.sendMessage({
            action: 'downloadTexture',
            taskId: taskId,
            textureUrl: textureUrl,
            filename: filename
          });
          
          btn.innerHTML = '<span class="download-icon">✓</span><span class="download-text">Downloading...</span>';
          btn.disabled = true;
        });
      });
      
    } else {
      statusDiv.innerHTML = `<span class="status-icon">❌</span><span class="status-text">${response.error || 'No models found'}</span>`;
      statusDiv.classList.add('error');
    }
  });
}
