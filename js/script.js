// 搜索引擎配置
const engines = {
    bing: { icon: 'images/bing.svg', url: 'https://www.bing.com/search?q=' },
    baidu: { icon: 'images/baidu.svg', url: 'https://www.baidu.com/s?wd=' },
    google: { icon: 'images/google.svg', url: 'https://www.google.com/search?q=' },
    zhihu: { icon: 'images/zhihu.svg', url: 'https://www.zhihu.com/search?q=' },
    sogou: { icon: 'images/sogou.svg', url: 'https://www.sogou.com/web?query=' },
    toutiao: { icon: 'images/toutiao.svg', url: 'https://www.toutiao.com/search?keyword=' },
    360: { icon: 'images/360.svg', url: 'https://www.so.com/s?q=' }
};

let currentEngine = 'bing';

//引擎选择功能
document.querySelectorAll('.engine-option').forEach(option => {
    option.addEventListener('click', () => {
        currentEngine = option.dataset.engine;
        document.querySelector('.engine-btn').innerHTML = 
            `<img src="${engines[currentEngine].icon}" class="engine-icon" alt="${currentEngine}">`;
        document.querySelector('.engine-list').classList.remove('show');
    });
});

//显示/隐藏引擎列表
document.querySelector('.engine-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelector('.engine-list').classList.toggle('show');
});

//点击空白处隐藏引擎列表
document.addEventListener('click', (e) => {
    if (!e.target.closest('.engine-select')) {
        document.querySelector('.engine-list').classList.remove('show');
    }
});

//搜索功能
document.querySelector('.search-btn').addEventListener('click', search);
document.querySelector('.search-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') search();
});

function search() {
    const query = document.querySelector('.search-input').value;
    window.open(engines[currentEngine].url + encodeURIComponent(query));
}
document.querySelector('.search-input').foucs();

// 导航栏高亮功能
function updateHighlight(target) {
    const highlight = document.querySelector('.nav-highlight');
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
        const container = target.parentElement;
        const scrollLeft = container.scrollLeft;
        const relativeLeft = target.offsetLeft - (container.offsetWidth/2 - target.offsetWidth/2);
        
        highlight.style.width = `${target.offsetWidth}px`;
        highlight.style.left = `${target.offsetLeft}px`;
        highlight.style.top = '50%';
        highlight.style.transform = 'translateY(-50%)';
    } else {
        highlight.style.width = 'calc(100% - 24px)';
        highlight.style.left = '12px';
        highlight.style.height = `${target.offsetHeight}px`;
        highlight.style.top = `${target.offsetTop}px`;
        highlight.style.transform = 'none';
    }
}

//导航分类点击事件
document.querySelectorAll('.nav-category').forEach(category => {
    category.addEventListener('click', function() {
        document.querySelectorAll('.nav-category').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        updateHighlight(this);
        
        document.querySelectorAll('.nav-items').forEach(item => {
            item.classList.remove('active');
            if(item.dataset.category === this.dataset.category) item.classList.add('active');
        });
        //移动端自动滚动
        if (window.matchMedia("(max-width: 768px)").matches) {
            this.parentElement.scrollTo({
                left: this.offsetLeft - (this.parentElement.offsetWidth/2 - this.offsetWidth/2),
                behavior: 'smooth'
            });
        }
    });
});

// 监听窗口大小变化，更新高亮位置
window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-category.active');
    if (active) {
        document.querySelector('.nav-highlight').style.transition = 'none';
        updateHighlight(active);
        setTimeout(() => {
            document.querySelector('.nav-highlight').style.transition = '';
        }, 10);
    }
});

// 初始化高亮位置
updateHighlight(document.querySelector('.nav-category.active'));