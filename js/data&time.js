function updateClock() {
	const now = new Date();

	// 格式化时间
	const timeOptions = {
		hour12: false,
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit'
	};
	const formattedTime = now.toLocaleTimeString('zh-CN', timeOptions);

	// 格式化日期
	const dateOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	};
	const formattedDate = now.toLocaleDateString('zh-CN', dateOptions);

	// 更新显示内容
	document.getElementById('show_time').textContent = formattedTime;
	document.getElementById('show_date').textContent = formattedDate;
}

// 初始加载时立即更新时间
updateClock();
// 每秒更新一次时间
setInterval(updateClock, 1000);