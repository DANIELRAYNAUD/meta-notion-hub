/* ============================================
   META NOTION HUB - DASHBOARD APP
   ============================================ */

const API_BASE = '';

// ============================================
// NAVIGATION
// ============================================

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;

        // Update active nav
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Show section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(`section-${section}`).classList.add('active');

        // Update header
        const titles = {
            overview: 'Visão Geral',
            posts: 'Posts',
            leads: 'Leads',
            messages: 'Mensagens',
            metrics: 'Métricas'
        };
        document.getElementById('page-title').textContent = titles[section] || section;
    });
});

// ============================================
// FETCH DATA
// ============================================

async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}

// ============================================
// LOAD DATA
// ============================================

async function loadHealthStatus() {
    const data = await fetchAPI('/health');

    if (data) {
        // Update connection status
        updateConnectionStatus('conn-meta', data.services?.meta);
        updateConnectionStatus('conn-notion', data.services?.notion);
        updateConnectionStatus('conn-instagram', data.services?.meta); // Instagram uses meta
        updateConnectionStatus('conn-webhook', true); // Webhook is always ready

        // Update system status
        const statusDot = document.querySelector('.status-dot');
        if (data.status === 'healthy') {
            statusDot.classList.add('online');
        }
    }
}

function updateConnectionStatus(elementId, isOnline) {
    const element = document.getElementById(elementId);
    const statusSpan = element.querySelector('.conn-status');

    statusSpan.classList.remove('loading', 'online', 'offline');

    if (isOnline) {
        statusSpan.textContent = 'Conectado';
        statusSpan.classList.add('online');
    } else {
        statusSpan.textContent = 'Desconectado';
        statusSpan.classList.add('offline');
    }
}

async function loadPosts() {
    const data = await fetchAPI('/api/posts');
    const tbody = document.getElementById('posts-table');

    if (data && data.posts && data.posts.length > 0) {
        tbody.innerHTML = data.posts.map(post => {
            const content = extractText(post.properties?.['Conteúdo'] || post.properties?.['Conteudo']);
            const platform = extractText(post.properties?.['Plataforma']);
            const date = post.properties?.['DataPublicacao']?.date?.start || 'Sem data';
            const status = post.properties?.['Status']?.status?.name || 'Rascunho';

            return `
                <tr>
                    <td>${truncate(content, 50)}</td>
                    <td>${getPlatformBadge(platform)}</td>
                    <td>${formatDate(date)}</td>
                    <td><span class="status-badge ${getStatusClass(status)}">${status}</span></td>
                    <td>
                        <button class="btn btn-secondary" onclick="viewPost('${post.id}')">Ver</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Update stats
        document.getElementById('stat-posts').textContent = data.posts.length;
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Nenhum post encontrado</td></tr>';
    }
}

async function loadLeads() {
    const data = await fetchAPI('/api/leads');
    const tbody = document.getElementById('leads-table');

    if (data && data.leads && data.leads.length > 0) {
        tbody.innerHTML = data.leads.map(lead => {
            return `
                <tr>
                    <td>${lead.name || 'N/A'}</td>
                    <td>${lead.email || 'N/A'}</td>
                    <td>${lead.phone || 'N/A'}</td>
                    <td>${lead.source || 'Direto'}</td>
                    <td>${formatDate(lead.createdAt)}</td>
                </tr>
            `;
        }).join('');

        // Update stats
        document.getElementById('stat-leads').textContent = data.leads.length;
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Nenhum lead encontrado</td></tr>';
    }
}

async function loadMessages() {
    const data = await fetchAPI('/api/messages');
    const container = document.getElementById('messages-list');

    if (data && data.messages && data.messages.length > 0) {
        container.innerHTML = data.messages.map(msg => `
            <div class="message-item">
                <div class="message-avatar">${getAvatarEmoji(msg.platform)}</div>
                <div class="message-content">
                    <div class="message-header">
                        <strong>${msg.from || 'Desconhecido'}</strong>
                        <span class="message-time">${formatDate(msg.createdAt)}</span>
                    </div>
                    <p>${msg.text || 'Sem conteúdo'}</p>
                    <span class="status-badge ${getPlatformClass(msg.platform)}">${msg.platform || 'Direto'}</span>
                </div>
            </div>
        `).join('');

        // Update stats
        document.getElementById('stat-messages').textContent = data.messages.length;
    } else {
        container.innerHTML = `
            <div class="message-item">
                <div class="message-avatar">📭</div>
                <div class="message-content">
                    <p>Nenhuma mensagem ainda. Configure os webhooks para receber mensagens automaticamente.</p>
                </div>
            </div>
        `;
    }
}

async function loadMetrics() {
    const data = await fetchAPI('/api/metrics');

    if (data && data.metrics) {
        document.getElementById('metric-impressions').textContent = formatNumber(data.metrics.impressions);
        document.getElementById('metric-reach').textContent = formatNumber(data.metrics.reach);
        document.getElementById('metric-clicks').textContent = formatNumber(data.metrics.clicks);
        document.getElementById('metric-spend').textContent = formatCurrency(data.metrics.spend);

        document.getElementById('stat-reach').textContent = formatNumber(data.metrics.reach);
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function extractText(prop) {
    if (!prop) return '';
    if (prop.title) return prop.title.map(t => t.plain_text).join('');
    if (prop.rich_text) return prop.rich_text.map(t => t.plain_text).join('');
    if (prop.select) return prop.select.name;
    if (prop.status) return prop.status.name;
    return String(prop);
}

function truncate(str, length) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
}

function formatDate(dateStr) {
    if (!dateStr || dateStr === 'Sem data') return dateStr;
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateStr;
    }
}

function formatNumber(num) {
    if (!num) return '0';
    return new Intl.NumberFormat('pt-BR').format(num);
}

function formatCurrency(num) {
    if (!num) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(num);
}

function getStatusClass(status) {
    const classes = {
        'Agendado': 'scheduled',
        'Publicado': 'published',
        'Rascunho': 'draft',
        'Erro': 'error'
    };
    return classes[status] || 'draft';
}

function getPlatformBadge(platform) {
    const icons = {
        'Instagram': '📷 Instagram',
        'Facebook': '📘 Facebook',
        'WhatsApp': '📱 WhatsApp'
    };
    return icons[platform] || platform || 'N/A';
}

function getPlatformClass(platform) {
    return platform?.toLowerCase().replace(' ', '-') || '';
}

function getAvatarEmoji(platform) {
    const emojis = {
        'Instagram': '📷',
        'Instagram DM': '📷',
        'Facebook': '📘',
        'Messenger': '💬',
        'WhatsApp': '📱'
    };
    return emojis[platform] || '👤';
}

// ============================================
// ACTIONS
// ============================================

function refreshData() {
    loadHealthStatus();
    loadPosts();
    loadLeads();
    loadMessages();
    loadMetrics();
    addActivity('🔄', 'Dados atualizados');
}

async function syncMetrics() {
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = '⏳ Sincronizando...';

    try {
        await fetchAPI('/api/metrics/sync');
        await loadMetrics();
        addActivity('📊', 'Métricas sincronizadas com sucesso');
    } catch (error) {
        addActivity('❌', 'Erro ao sincronizar métricas');
    }

    btn.disabled = false;
    btn.textContent = '🔄 Sincronizar';
}

function addActivity(icon, message) {
    const list = document.getElementById('activity-list');
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
        <span class="activity-icon">${icon}</span>
        <div class="activity-content">
            <p><strong>${message}</strong></p>
            <span class="activity-time">Agora</span>
        </div>
    `;
    list.insertBefore(item, list.firstChild);

    // Keep only last 10 activities
    while (list.children.length > 10) {
        list.removeChild(list.lastChild);
    }
}

// ============================================
// MODAL - Criação de Posts
// ============================================

let currentMediaFile = null;

function openNewPostModal() {
    document.getElementById('new-post-modal').classList.add('active');

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.querySelector('input[name="publishDate"]');
    if (dateInput) {
        dateInput.value = tomorrow.toISOString().split('T')[0];
    }

    // Reset form
    document.getElementById('new-post-form').reset();
    clearMediaPreview();

    // Setup post type selection
    setupPostTypeSelection();

    // Setup file upload
    setupFileUpload();
}

function setupPostTypeSelection() {
    document.querySelectorAll('.post-type-option').forEach(option => {
        option.addEventListener('click', () => {
            // Remove selection from all
            document.querySelectorAll('.post-type-option').forEach(opt => {
                opt.style.borderColor = 'var(--border-color)';
            });
            // Add selection to clicked
            option.style.borderColor = 'var(--accent-blue)';
        });
    });
}

function setupFileUpload() {
    const dropZone = document.getElementById('drop-zone');
    const mediaInput = document.getElementById('media-input');

    if (!dropZone || !mediaInput) return;

    // Click to open file picker
    dropZone.addEventListener('click', () => mediaInput.click());

    // Handle file selection
    mediaInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent-blue)';
        dropZone.style.background = 'rgba(74, 144, 226, 0.1)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.background = 'transparent';

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
}

function handleFileSelect(file) {
    currentMediaFile = file;

    const placeholder = document.getElementById('upload-placeholder');
    const preview = document.getElementById('upload-preview');
    const previewImage = document.getElementById('preview-image');
    const previewVideo = document.getElementById('preview-video');
    const fileName = document.getElementById('file-name');
    const thumbnailGroup = document.getElementById('thumbnail-group');

    placeholder.style.display = 'none';
    preview.style.display = 'block';
    fileName.textContent = `${file.name} (${formatFileSize(file.size)})`;

    // Show preview based on file type
    if (file.type.startsWith('video/')) {
        previewVideo.style.display = 'block';
        previewImage.style.display = 'none';
        previewVideo.src = URL.createObjectURL(file);
        thumbnailGroup.style.display = 'block';
    } else {
        previewImage.style.display = 'block';
        previewVideo.style.display = 'none';
        previewImage.src = URL.createObjectURL(file);
        thumbnailGroup.style.display = 'none';
    }
}

function clearMediaPreview() {
    currentMediaFile = null;

    const placeholder = document.getElementById('upload-placeholder');
    const preview = document.getElementById('upload-preview');
    const previewImage = document.getElementById('preview-image');
    const previewVideo = document.getElementById('preview-video');
    const uploadedUrl = document.getElementById('uploaded-media-url');

    if (placeholder) placeholder.style.display = 'block';
    if (preview) preview.style.display = 'none';
    if (previewImage) { previewImage.style.display = 'none'; previewImage.src = ''; }
    if (previewVideo) { previewVideo.style.display = 'none'; previewVideo.src = ''; }
    if (uploadedUrl) uploadedUrl.value = '';
}

async function uploadMediaFile(file) {
    const formData = new FormData();
    formData.append('media', file);

    const progressBar = document.getElementById('progress-bar');
    const progressDiv = document.getElementById('upload-progress');
    const progressText = document.getElementById('progress-text');

    progressDiv.style.display = 'block';
    progressBar.style.width = '0%';

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percent + '%';
                progressText.textContent = `Enviando... ${percent}%`;
            }
        });

        xhr.addEventListener('load', () => {
            progressDiv.style.display = 'none';
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
            } else {
                reject(new Error('Erro no upload'));
            }
        });

        xhr.addEventListener('error', () => {
            progressDiv.style.display = 'none';
            reject(new Error('Erro de conexão'));
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
    });
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function closeModal() {
    document.getElementById('new-post-modal').classList.remove('active');
}

function saveDraft() {
    const form = document.getElementById('new-post-form');
    const formData = new FormData(form);
    const draft = {
        content: formData.get('content'),
        mediaUrl: formData.get('mediaUrl'),
        postType: formData.get('postType'),
        publishDate: formData.get('publishDate'),
        publishTime: formData.get('publishTime')
    };

    localStorage.setItem('postDraft', JSON.stringify(draft));
    addActivity('💾', 'Rascunho salvo');
    alert('Rascunho salvo com sucesso!');
}

// Close modal on outside click
document.getElementById('new-post-modal').addEventListener('click', (e) => {
    if (e.target.id === 'new-post-modal') {
        closeModal();
    }
});

// Handle form submit
document.getElementById('new-post-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    // Get selected platforms
    const platforms = [];
    document.querySelectorAll('input[name="platforms"]:checked').forEach(cb => {
        platforms.push(cb.value);
    });

    if (platforms.length === 0) {
        alert('Selecione pelo menos uma plataforma!');
        return;
    }

    const date = formData.get('publishDate');
    const time = formData.get('publishTime') || '10:00';

    let mediaUrl = '';

    // Upload file if selected
    if (currentMediaFile) {
        try {
            addActivity('⏳', 'Enviando mídia...');
            const uploadResult = await uploadMediaFile(currentMediaFile);
            mediaUrl = uploadResult.url;
            addActivity('✅', 'Mídia enviada com sucesso');
        } catch (error) {
            alert('Erro ao enviar mídia: ' + error.message);
            return;
        }
    }

    const postData = {
        content: formData.get('content'),
        mediaUrl: mediaUrl,
        postType: formData.get('postType'),
        firstComment: formData.get('firstComment'),
        location: formData.get('location'),
        platforms: platforms,
        publishDate: `${date}T${time}:00`
    };

    // Create a post for each platform
    const results = [];
    for (const platform of platforms) {
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: postData.content,
                    imageUrl: postData.mediaUrl,
                    platform: platform,
                    publishDate: postData.publishDate,
                    postType: postData.postType
                })
            });

            if (response.ok) {
                results.push({ platform, success: true });
            } else {
                results.push({ platform, success: false });
            }
        } catch (error) {
            results.push({ platform, success: false, error: error.message });
        }
    }

    const successCount = results.filter(r => r.success).length;

    if (successCount > 0) {
        closeModal();
        loadPosts();
        addActivity('📝', `Post agendado para ${successCount} plataforma(s)`);
    } else {
        alert('Erro ao criar post. Tente novamente.');
    }
});

function viewPost(id) {
    alert(`Ver post: ${id}\n\nEm breve: Visualização detalhada do post`);
}

// ============================================
// BATCH SCHEDULING - Agendamento em Lote
// ============================================

let batchPostCount = 0;

function openBatchModal() {
    document.getElementById('batch-modal').classList.add('active');
    document.getElementById('batch-posts-container').innerHTML = '';
    document.getElementById('batch-result').style.display = 'none';
    batchPostCount = 0;

    // Add first post form
    addBatchPost();
    addBatchPost();
}

function closeBatchModal() {
    document.getElementById('batch-modal').classList.remove('active');
}

function addBatchPost() {
    batchPostCount++;
    const container = document.getElementById('batch-posts-container');

    // Default date: now + (batchPostCount days)
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + batchPostCount);
    defaultDate.setHours(10, 0, 0, 0);

    const postHtml = `
        <div class="batch-post-item" id="batch-post-${batchPostCount}" style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <strong style="color: var(--accent-blue);">📝 Post ${batchPostCount}</strong>
                <button type="button" class="btn btn-secondary" onclick="removeBatchPost(${batchPostCount})" style="padding: 4px 12px; font-size: 12px;">✖ Remover</button>
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
                <textarea name="content-${batchPostCount}" rows="3" placeholder="Conteúdo do post..." style="width: 100%; padding: 10px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: white; resize: none;"></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                <div>
                    <label style="font-size: 12px; color: var(--text-secondary);">Plataforma</label>
                    <select name="platform-${batchPostCount}" style="width: 100%; padding: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: white;">
                        <option value="Instagram">📷 Instagram</option>
                        <option value="Facebook">📘 Facebook</option>
                    </select>
                </div>
                <div>
                    <label style="font-size: 12px; color: var(--text-secondary);">Data</label>
                    <input type="date" name="date-${batchPostCount}" value="${defaultDate.toISOString().split('T')[0]}" style="width: 100%; padding: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: white;">
                </div>
                <div>
                    <label style="font-size: 12px; color: var(--text-secondary);">Horário</label>
                    <input type="time" name="time-${batchPostCount}" value="10:00" style="width: 100%; padding: 8px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: white;">
                </div>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', postHtml);
}

function removeBatchPost(id) {
    const element = document.getElementById(`batch-post-${id}`);
    if (element) {
        element.remove();
    }
}

async function submitBatchPosts() {
    const container = document.getElementById('batch-posts-container');
    const postItems = container.querySelectorAll('.batch-post-item');
    const posts = [];

    postItems.forEach((item, index) => {
        const id = item.id.replace('batch-post-', '');
        const content = item.querySelector(`textarea[name="content-${id}"]`)?.value;
        const platform = item.querySelector(`select[name="platform-${id}"]`)?.value;
        const date = item.querySelector(`input[name="date-${id}"]`)?.value;
        const time = item.querySelector(`input[name="time-${id}"]`)?.value || '10:00';

        if (content && content.trim()) {
            posts.push({
                content: content.trim(),
                platform: platform || 'Instagram',
                publishDate: `${date}T${time}:00`
            });
        }
    });

    if (posts.length === 0) {
        alert('Adicione pelo menos um post com conteúdo.');
        return;
    }

    const resultDiv = document.getElementById('batch-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p style="color: var(--accent-orange);">⏳ Agendando posts...</p>';

    try {
        const response = await fetch('/api/posts/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ posts })
        });

        const data = await response.json();

        if (response.ok) {
            resultDiv.innerHTML = `
                <p style="color: var(--accent-green); margin-bottom: 10px;">✅ ${data.message}</p>
                <ul style="font-size: 13px; color: var(--text-secondary);">
                    ${data.results.map(r => `<li>${r.success ? '✅' : '❌'} ${r.content}</li>`).join('')}
                </ul>
            `;
            loadPosts();
            addActivity('📅', `${data.success} posts agendados em lote`);

            // Close modal after 2 seconds
            setTimeout(() => {
                closeBatchModal();
            }, 2000);
        } else {
            resultDiv.innerHTML = `<p style="color: var(--accent-red);">❌ Erro: ${data.error}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: var(--accent-red);">❌ Erro: ${error.message}</p>`;
    }
}

// Close batch modal on outside click
document.getElementById('batch-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'batch-modal') {
        closeBatchModal();
    }
});

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Meta Notion Hub Dashboard loaded');

    // Initial load
    loadHealthStatus();
    loadPosts();
    loadLeads();
    loadMessages();
    loadMetrics();

    // Add initial activity
    addActivity('🚀', 'Dashboard carregado');

    // Auto-refresh every 5 minutes
    setInterval(refreshData, 5 * 60 * 1000);
});

