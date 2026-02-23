// 自动检测设备类型并加载壁纸
function loadWallpaper() {
  const isMobile = window.innerWidth <= 768;
  const wallpaperUrl = `/.netlify/functions/bing-wallpaper?size=${isMobile ? 'mobile' : 'desktop'}`;

  // 在URL中添加日期参数（强制每日刷新）
  const today = new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0];
  document.body.style.backgroundImage = `url("${wallpaperUrl}&d=${today}")`;
}

// 防抖函数：限制resize触发频率
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 初始化加载
loadWallpaper();

// 窗口大小变化时重新加载（使用防抖，避免频繁请求）
window.addEventListener('resize', debounce(loadWallpaper, 200));