// 百度搜索建议
function getSuggestions(keyword, callback) {
    const script = document.createElement('script');
    script.src = `https://www.baidu.com/su?wd=${encodeURIComponent(keyword)}&cb=baiduSuggestion`;
    document.body.appendChild(script);
    
    window.baiduSuggestion = (data) => {
        callback(data.s || []);
        document.body.removeChild(script);
        delete window.baiduSuggestion;
    }
}

// 防抖函数
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// 显示搜索建议
function showSuggestions(keywords) {
    const container = document.querySelector('.search-suggestions');
    container.innerHTML = '';
    
    keywords.slice(0, 8).forEach(keyword => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <img src="images/search.svg" class="suggestion-icon">
            ${keyword}
        `;
        
        item.addEventListener('click', () => {
            document.querySelector('.search-input').value = keyword;
            search();
            container.style.display = 'none';
        });
        
        container.appendChild(item);
    });
    
    container.style.display = keywords.length ? 'block' : 'none';
}

// 输入监听
document.querySelector('.search-input').addEventListener('input', debounce(e => {
    const keyword = e.target.value.trim();
    if (!keyword) {
        document.querySelector('.search-suggestions').style.display = 'none';
        return;
    }
    
    getSuggestions(keyword, suggestions => {
        showSuggestions(suggestions || []);
    });
}, 300));

// 点击外部关闭建议
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        document.querySelector('.search-suggestions').style.display = 'none';
    }
});