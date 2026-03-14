// ===== 配置 =====
const STORAGE_KEY = 'letters_data';

const coverStyles = [
  { id: 0, icon: '🌸', name: '樱花粉', color: '#ffe0ec', pattern: '🌸  🌸  🌸' },
  { id: 1, icon: '💫', name: '星光紫', color: '#ffe8f5', pattern: '✦  ✦  ✦' },
  { id: 2, icon: '🦋', name: '蝴蝶梦', color: '#ffd6e8', pattern: '🦋  🦋  🦋' },
  { id: 3, icon: '🌹', name: '玫瑰红', color: '#ffeaf2', pattern: '🌹  🌹  🌹' },
  { id: 4, icon: '💕', name: '爱心甜', color: '#ffd8ed', pattern: '💕  💕  💕' },
];

// ===== 状态 =====
let currentLetter = null;
let selectedCover = 0;
let isAnimating = false;
let editingLetterId = null;
let modalCallback = null;

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  initHomePage();
  initWritePage();
  checkSharedLetter();
});

// ===== 页面切换 =====
function showPage(pageName) {
  // 隐藏所有页面
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // 显示目标页面
  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // 更新底部导航
  document.querySelectorAll('.tab-item').forEach((item, index) => {
    item.classList.remove('active');
    if ((pageName === 'home' && index === 0) || (pageName === 'write' && index === 1)) {
      item.classList.add('active');
    }
  });
  
  // 页面特定初始化
  if (pageName === 'home') {
    initHomePage();
  } else if (pageName === 'write') {
    initWritePage();
  }
}

// ===== 首页 =====
function initHomePage() {
  const letters = getLetters();
  const yearGroups = groupLettersByYear(letters);
  
  // 更新信件数量
  document.getElementById('letter-count').textContent = letters.length;
  
  // 渲染信件列表
  renderLetters(yearGroups);
}

function getLetters() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLetters(letters) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
}

function groupLettersByYear(letters) {
  // 按时间倒序
  letters.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // 按年份分组
  const groups = {};
  letters.forEach(letter => {
    const year = letter.date.split('-')[0];
    if (!groups[year]) groups[year] = [];
    groups[year].push(letter);
  });
  
  // 转换为数组
  return Object.keys(groups)
    .sort((a, b) => b - a)
    .map(year => ({
      year,
      letters: groups[year]
    }));
}

function renderLetters(yearGroups) {
  const container = document.getElementById('letters-container');
  
  if (yearGroups.length === 0) {
    container.innerHTML = `
      <div class="empty-state animate-fade-in">
        <div class="empty-icon">💌</div>
        <span class="empty-text">还没有写信呢</span>
        <span class="empty-sub">点击下方按钮写第一封信吧</span>
      </div>
    `;
    return;
  }
  
  let html = '';
  yearGroups.forEach(group => {
    html += `
      <div class="year-divider">
        <div class="year-line"></div>
        <div class="year-badge">
          <span class="year-text">${group.year}</span>
          <span class="year-deco"> 🎀</span>
        </div>
        <div class="year-line"></div>
      </div>
      <div class="letters-grid">
    `;
    
    group.letters.forEach(letter => {
      const style = coverStyles[letter.coverStyle] || coverStyles[0];
      html += `
        <div class="envelope-card cover-${letter.coverStyle}" onclick="openLetter('${letter.id}')">
          <div class="envelope-pattern">
            <span class="pattern-text">${style.pattern.replace(/  /g, '')}</span>
          </div>
          <div class="envelope-flap">
            <div class="flap-inner">
              <span class="flap-heart">♥</span>
            </div>
          </div>
          <div class="envelope-body">
            <div class="stamp">${style.icon}</div>
            <div class="letter-info">
              <span class="letter-date">${formatDate(letter.date)}</span>
              <span class="letter-title">${escapeHtml(letter.title)}</span>
              <span class="letter-preview">${escapeHtml(letter.preview)}</span>
            </div>
          </div>
          ${letter.opened ? '<div class="read-badge"><span>已读</span></div>' : ''}
        </div>
      `;
    });
    
    html += '</div>';
  });
  
  html += '<div style="height: 100px;"></div>';
  container.innerHTML = html;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== 写信页 =====
function initWritePage() {
  // 如果不是编辑模式，重置表单
  if (!editingLetterId) {
    resetWriteForm();
  }
  
  renderCoverSelector();
  updatePreview();
  
  // 绑定事件
  document.getElementById('letter-title').addEventListener('input', updatePreview);
  document.getElementById('letter-date').addEventListener('change', updatePreview);
  document.getElementById('letter-content').addEventListener('input', (e) => {
    document.getElementById('content-count').textContent = `${e.target.value.length} / 5000`;
  });
  
  // 绑定发送按钮
  document.getElementById('send-btn').onclick = saveLetter;
}

function resetWriteForm() {
  editingLetterId = null;
  document.getElementById('write-tip').textContent = '写下你的心意，传递给重要的人';
  document.getElementById('send-btn-text').textContent = '寄出这封信';
  
  document.getElementById('letter-title').value = '';
  document.getElementById('letter-content').value = '';
  document.getElementById('content-count').textContent = '0 / 5000';
  
  // 设置默认日期
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  document.getElementById('letter-date').value = dateStr;
  document.getElementById('preview-date').textContent = formatDate(dateStr);
  
  // 重置封面选择
  selectedCover = 0;
}

function renderCoverSelector() {
  const container = document.getElementById('cover-selector');
  container.innerHTML = coverStyles.map(style => `
    <div class="cover-option ${selectedCover === style.id ? 'cover-selected' : ''}" 
         style="background: ${style.color}"
         onclick="selectCover(${style.id})">
      <span class="cover-icon">${style.icon}</span>
      <span class="cover-name">${style.name}</span>
      ${selectedCover === style.id ? '<div class="cover-check">✓</div>' : ''}
    </div>
  `).join('');
}

function selectCover(id) {
  selectedCover = id;
  renderCoverSelector();
  updatePreview();
}

function updatePreview() {
  const title = document.getElementById('letter-title').value || '信件标题';
  const date = document.getElementById('letter-date').value;
  const style = coverStyles[selectedCover];
  
  document.getElementById('preview-title-text').textContent = title;
  document.getElementById('preview-date').textContent = date ? formatDate(date) : '';
  document.getElementById('preview-stamp').textContent = style.icon;
  document.getElementById('preview-pattern').textContent = style.pattern.replace(/  /g, '');
  
  const preview = document.getElementById('envelope-preview');
  preview.className = `envelope-preview cover-${selectedCover}`;
}

function saveLetter() {
  const title = document.getElementById('letter-title').value.trim();
  const content = document.getElementById('letter-content').value.trim();
  const date = document.getElementById('letter-date').value;
  
  if (!title) {
    showToast('请填写信件标题', '⚠️');
    return;
  }
  if (!content) {
    showToast('请写点什么吧...', '⚠️');
    return;
  }
  
  // 显示发送中状态
  const sendBtn = document.getElementById('send-btn');
  sendBtn.classList.add('sending');
  sendBtn.querySelector('.send-icon').textContent = '✈️';
  sendBtn.querySelector('.send-text').textContent = editingLetterId ? '保存中...' : '寄出中...';
  
  setTimeout(() => {
    const letters = getLetters();
    
    if (editingLetterId) {
      // 编辑模式：更新现有信件
      const letterIndex = letters.findIndex(l => l.id === editingLetterId);
      if (letterIndex !== -1) {
        letters[letterIndex] = {
          ...letters[letterIndex],
          title,
          date,
          content,
          preview: content.substring(0, 60) + (content.length > 60 ? '...' : ''),
          coverStyle: selectedCover,
        };
        saveLetters(letters);
        showToast('信件已保存 💌', '✓');
      }
    } else {
      // 新建模式：添加新信件
      const newLetter = {
        id: Date.now().toString(),
        title,
        date,
        content,
        preview: content.substring(0, 60) + (content.length > 60 ? '...' : ''),
        coverStyle: selectedCover,
        opened: false,
        createdAt: new Date().toISOString()
      };
      
      letters.push(newLetter);
      saveLetters(letters);
      showToast('信寄出去了 💌', '✓');
    }
    
    // 重置表单
    setTimeout(() => {
      sendBtn.classList.remove('sending');
      sendBtn.querySelector('.send-icon').textContent = '💌';
      sendBtn.querySelector('.send-text').textContent = '寄出这封信';
      
      editingLetterId = null;
      resetWriteForm();
      showPage('home');
    }, 1200);
  }, 600);
}

// ===== 看信页 =====
function openLetter(id) {
  const letters = getLetters();
  const letter = letters.find(l => l.id === id);
  
  if (!letter) {
    showToast('信件不存在', '⚠️');
    return;
  }
  
  // 标记为已读
  if (!letter.opened) {
    letter.opened = true;
    saveLetters(letters);
  }
  
  currentLetter = letter;
  
  // 重置动画状态
  resetAnimation();
  
  // 设置信封样式
  const style = coverStyles[letter.coverStyle] || coverStyles[0];
  const envelope3d = document.getElementById('envelope-3d');
  envelope3d.className = `envelope-3d cover-${letter.coverStyle}`;
  
  // 设置信封内容
  document.getElementById('env-pattern-text').textContent = style.pattern;
  document.getElementById('env-stamp-icon').textContent = style.icon;
  document.getElementById('postmark-date').textContent = letter.date;
  document.getElementById('paper-preview-text').textContent = letter.title;
  
  // 设置信件内容
  document.getElementById('view-title').textContent = letter.title;
  document.getElementById('view-date').textContent = letter.date;
  document.getElementById('view-content').textContent = letter.content;
  
  // 显示页面
  showPage('letter');
  
  // 绑定点击打开信封
  document.getElementById('envelope-scene').onclick = startOpenAnimation;
  document.getElementById('tap-hint').textContent = '点击打开信封';
}

function resetAnimation() {
  isAnimating = false;
  document.getElementById('envelope-scene').style.display = 'flex';
  document.getElementById('env-flap').classList.remove('flap-opened');
  document.getElementById('env-seal').classList.remove('seal-break');
  document.getElementById('letter-paper').classList.remove('paper-slide');
  document.getElementById('letter-content-page').classList.remove('show');
  document.getElementById('confetti-layer').innerHTML = '';
}

function startOpenAnimation() {
  if (isAnimating) return;
  isAnimating = true;
  
  document.getElementById('tap-hint').textContent = '正在打开信封...';
  
  // 第一步：封口翻开
  document.getElementById('env-flap').classList.add('flap-opened');
  document.getElementById('env-seal').classList.add('seal-break');
  
  // 生成爱心撒花效果
  generateHeartBurst();
  generateConfetti();
  
  // 第二步：信纸滑出
  setTimeout(() => {
    document.getElementById('letter-paper').classList.add('paper-slide');
  }, 600);
  
  // 第三步：显示内容
  setTimeout(() => {
    document.getElementById('envelope-scene').style.display = 'none';
    document.getElementById('letter-content-page').classList.add('show');
  }, 1200);
  
  // 第四步：持续撒花
  setTimeout(() => {
    generateMoreConfetti();
  }, 1400);
}

function generateHeartBurst() {
  // 从信封中心爆发爱心
  const envelope3d = document.getElementById('envelope-3d');
  const rect = envelope3d.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const hearts = ['❤', '♡', '💕', '💖', '💗', '💓', '💝'];
  const colors = ['#ff6b9d', '#ff8fb0', '#ffb6c1', '#ff1493', '#ff69b4', '#ffc0cb'];
  
  for (let i = 0; i < 30; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart-burst';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = centerX + 'px';
    heart.style.top = centerY + 'px';
    heart.style.color = colors[Math.floor(Math.random() * colors.length)];
    heart.style.fontSize = (Math.random() * 20 + 20) + 'px';
    
    // 随机方向
    const angle = (Math.PI * 2 * i) / 30;
    const distance = Math.random() * 150 + 100;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 100;
    
    heart.style.setProperty('--tx', tx + 'px');
    heart.style.setProperty('--ty', ty + 'px');
    heart.style.animationDelay = (Math.random() * 0.3) + 's';
    
    document.body.appendChild(heart);
    
    // 动画结束后移除
    setTimeout(() => {
      heart.remove();
    }, 1800);
  }
}

function generateConfetti() {
  const colors = ['#ff6b9d', '#ff8fb0', '#ffb6c1', '#ff1493', '#ffc0cb', '#ffd6e8', '#ffaec0'];
  const shapes = ['❤', '♡', '✿', '❀', '✦', '⭐', '🌸', '💕', '💖', '🌺'];
  const container = document.getElementById('confetti-layer');
  
  let html = '';
  for (let i = 0; i < 25; i++) {
    const left = Math.random() * 100;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const size = Math.random() * 15 + 20;
    const delay = Math.random() * 0.5;
    const duration = Math.random() * 2 + 2;
    
    html += `<div class="confetti-item" style="left:${left}%; color:${color}; font-size:${size}px; animation-delay:${delay}s; animation-duration:${duration}s;">${shape}</div>`;
  }
  
  container.innerHTML = html;
}

function generateMoreConfetti() {
  const colors = ['#ff6b9d', '#ff8fb0', '#ffb6c1', '#ff1493', '#ffc0cb', '#ffd6e8'];
  const shapes = ['❤', '♡', '💕', '💖', '✿', '🌸'];
  
  // 持续生成更多彩纸
  for (let batch = 0; batch < 3; batch++) {
    setTimeout(() => {
      const container = document.getElementById('confetti-layer');
      for (let i = 0; i < 10; i++) {
        const item = document.createElement('div');
        item.className = 'confetti-item';
        item.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        item.style.left = (Math.random() * 100) + '%';
        item.style.color = colors[Math.floor(Math.random() * colors.length)];
        item.style.fontSize = (Math.random() * 12 + 16) + 'px';
        item.style.animationDelay = '0s';
        item.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(item);
        
        setTimeout(() => {
          item.remove();
        }, 4000);
      }
    }, batch * 500);
  }
}

function replayAnimation() {
  resetAnimation();
  setTimeout(() => {
    document.getElementById('envelope-scene').style.display = 'flex';
    isAnimating = false;
    document.getElementById('tap-hint').textContent = '点击打开信封';
    document.getElementById('envelope-scene').onclick = startOpenAnimation;
  }, 300);
}

// ===== 编辑功能 =====
function editCurrentLetter() {
  if (!currentLetter || currentLetter.id.startsWith('shared_')) {
    showToast('分享的信件不能编辑', '⚠️');
    return;
  }
  
  // 设置编辑模式
  editingLetterId = currentLetter.id;
  
  // 填充表单
  document.getElementById('letter-title').value = currentLetter.title;
  document.getElementById('letter-date').value = currentLetter.date;
  document.getElementById('letter-content').value = currentLetter.content;
  document.getElementById('content-count').textContent = `${currentLetter.content.length} / 5000`;
  
  // 设置封面
  selectedCover = currentLetter.coverStyle || 0;
  
  // 更新提示文字
  document.getElementById('write-tip').textContent = '编辑你的心意';
  document.getElementById('send-btn-text').textContent = '保存修改';
  
  // 切换到写信页
  showPage('write');
}

// ===== 删除功能 =====
function deleteCurrentLetter() {
  if (!currentLetter || currentLetter.id.startsWith('shared_')) {
    showToast('分享的信件不能删除', '⚠️');
    return;
  }
  
  showModal('删除信件', '确定要删除这封信吗？此操作不可恢复。', () => {
    const letters = getLetters();
    const index = letters.findIndex(l => l.id === currentLetter.id);
    if (index !== -1) {
      letters.splice(index, 1);
      saveLetters(letters);
      showToast('信件已删除', '🗑️');
      showPage('home');
    }
  }, true);
}

// ===== 模态框 =====
function showModal(title, text, callback, isDelete = false) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-text').textContent = text;
  
  const confirmBtn = document.getElementById('modal-confirm-btn');
  confirmBtn.className = isDelete ? 'modal-btn delete' : 'modal-btn confirm';
  
  modalCallback = callback;
  document.getElementById('modal-overlay').classList.add('show');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('show');
  modalCallback = null;
}

function confirmModal() {
  if (modalCallback) {
    modalCallback();
  }
  closeModal();
}

// ===== 分享功能 =====
function copyShareLink() {
  if (!currentLetter) return;
  
  // 将信件数据编码到URL中
  const letterData = {
    t: currentLetter.title,
    d: currentLetter.date,
    c: currentLetter.content,
    s: currentLetter.coverStyle
  };
  
  // 使用Base64编码信件数据
  const encodedData = btoa(encodeURIComponent(JSON.stringify(letterData)));
  const shareUrl = `${window.location.origin}${window.location.pathname}?letter=${encodedData}`;
  
  // 更新分享预览的 meta 标签
  updateShareMeta(currentLetter);
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('链接已复制，快去分享吧！', '🔗');
    }).catch(() => {
      fallbackCopy(shareUrl);
    });
  } else {
    fallbackCopy(shareUrl);
  }
}

function fallbackCopy(text) {
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  showToast('链接已复制，快去分享吧！', '🔗');
}

// 更新分享预览的 meta 标签
function updateShareMeta(letter) {
  const style = coverStyles[letter.coverStyle] || coverStyles[0];
  const icon = style.icon;
  const title = `${icon} 写给你的信：${letter.title}`;
  const description = `有人给你写了一封信："${letter.preview}" 💌 点击打开查看`;
  
  // 更新标题
  document.title = title;
  
  // 更新 Open Graph
  document.querySelector('meta[property="og:title"]').setAttribute('content', title);
  document.querySelector('meta[property="og:description"]').setAttribute('content', description);
  document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);
  
  // 更新 Twitter Card
  document.querySelector('meta[name="twitter:title"]').setAttribute('content', title);
  document.querySelector('meta[name="twitter:description"]').setAttribute('content', description);
  document.querySelector('meta[name="twitter:url"]').setAttribute('content', window.location.href);
  
  // 更新 QQ 分享
  document.querySelector('meta[itemprop="name"]').setAttribute('content', title);
  document.querySelector('meta[itemprop="description"]').setAttribute('content', description);
}

function checkSharedLetter() {
  const urlParams = new URLSearchParams(window.location.search);
  const letterData = urlParams.get('letter');
  
  if (letterData) {
    // 延迟一点，确保页面加载完成
    setTimeout(() => {
      try {
        // 解码信件数据
        const decodedData = JSON.parse(decodeURIComponent(atob(letterData)));
        const sharedLetter = {
          id: 'shared_' + Date.now(),
          title: decodedData.t,
          date: decodedData.d,
          content: decodedData.c,
          coverStyle: decodedData.s || 0,
          preview: decodedData.c.substring(0, 60) + (decodedData.c.length > 60 ? '...' : ''),
          opened: false,
          createdAt: new Date().toISOString()
        };
        openSharedLetter(sharedLetter);
      } catch (e) {
        console.error('Failed to decode shared letter:', e);
        showToast('信件链接无效', '⚠️');
      }
    }, 100);
  }
}

// 打开分享的信件（不依赖localStorage）
function openSharedLetter(letter) {
  currentLetter = letter;
  
  // 更新分享预览的 meta 标签
  updateShareMeta(letter);
  
  // 重置动画状态
  resetAnimation();
  
  // 设置信封样式
  const style = coverStyles[letter.coverStyle] || coverStyles[0];
  const envelope3d = document.getElementById('envelope-3d');
  envelope3d.className = `envelope-3d cover-${letter.coverStyle}`;
  
  // 设置信封内容
  document.getElementById('env-pattern-text').textContent = style.pattern;
  document.getElementById('env-stamp-icon').textContent = style.icon;
  document.getElementById('postmark-date').textContent = letter.date;
  document.getElementById('paper-preview-text').textContent = letter.title;
  
  // 设置信件内容
  document.getElementById('view-title').textContent = letter.title;
  document.getElementById('view-date').textContent = letter.date;
  document.getElementById('view-content').textContent = letter.content;
  
  // 显示页面
  showPage('letter');
  
  // 绑定点击打开信封
  document.getElementById('envelope-scene').onclick = startOpenAnimation;
  document.getElementById('tap-hint').textContent = '点击打开信封';
}

// ===== Toast 提示 =====
function showToast(message, icon = '✓') {
  const toast = document.getElementById('toast');
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-text').textContent = message;
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}