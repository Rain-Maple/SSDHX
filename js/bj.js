// 自动检测设备类型，加载壁纸并显示版权信息
async function loadWallpaper() {
  const isMobile = window.innerWidth <= 768;
  const size = isMobile ? 'mobile' : 'desktop';

  // 请求信息端点，获取版权和图片 URL
  const infoUrl = `/.netlify/functions/bing-wallpaper?info=true&size=${size}`;

  try {
    const response = await fetch(infoUrl);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    // 设置背景图片
    document.body.style.backgroundImage = `url("${data.imageUrl}")`;

    // 显示版权信息
    showCopyright(data.copyright);
  } catch (error) {
    console.error('Failed to load wallpaper:', error);
    // 可选：设置纯色背景作为 fallback
    document.body.style.backgroundColor = '#333';
  }
}

// 在右下角创建/更新版权信息元素
function showCopyright(text) {
  let copyrightDiv = document.getElementById('bing-copyright');
  if (!copyrightDiv) {
    copyrightDiv = document.createElement('div');
    copyrightDiv.id = 'bing-copyright';
    copyrightDiv.style.position = 'fixed';
    copyrightDiv.style.bottom = '10px';
    copyrightDiv.style.right = '20px';
    copyrightDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    copyrightDiv.style.color = '#fff';
    copyrightDiv.style.padding = '6px 12px';
    copyrightDiv.style.fontSize = '14px';
    copyrightDiv.style.borderRadius = '20px';
    copyrightDiv.style.zIndex = '9999';
    copyrightDiv.style.backdropFilter = 'blur(4px)';
    copyrightDiv.style.border = '1px solid rgba(255,255,255,0.2)';
    document.body.appendChild(copyrightDiv);
  }
  copyrightDiv.textContent = text;
}

// 初始化加载
loadWallpaper();

// 窗口大小变化时重新加载（适配移动/桌面切换）
window.addEventListener('resize', () => loadWallpaper());