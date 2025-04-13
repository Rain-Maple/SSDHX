// 自动检测设备类型并加载壁纸
function loadWallpaper() {
  const isMobile = window.innerWidth <= 768;
  const wallpaperUrl = `/.netlify/functions/bing-wallpaper?size=${isMobile ? 'mobile' : 'desktop'}`;
  
  // 关键改进：在URL中添加日期参数（强制每日刷新）
  const today = new Date(Date.now() + 8*3600*1000).toISOString().split('T')[0];
  document.body.style.backgroundImage = `url("${wallpaperUrl}&d=${today}")`;
}

// 初始化加载
loadWallpaper();

// 窗口大小变化时重新加载（可选）
window.addEventListener('resize', () => loadWallpaper());