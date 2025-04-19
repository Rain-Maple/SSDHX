// 搜索建议功能
const searchInput = document.querySelector('.search-input');
        const suggestionsContainer = document.getElementById('suggestionsContainer');
        let suggestionTimeout;

        searchInput.addEventListener('input', function() {
            clearTimeout(suggestionTimeout);
            const query = this.value.trim();
            selectedSuggestionIndex = -1;
            if (query) {
                suggestionTimeout = setTimeout(() => {
                    fetchBaiduSuggestions(query);
                }, 300);
            } else {
                suggestionsContainer.style.display = 'none';
            }
        });

        // 键盘导航支持
        searchInput.addEventListener('keydown', (e) => {
            const suggestions = suggestionsContainer.children;
            if (!suggestions.length) return;

            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
                    updateSelection();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
                    updateSelection();
                    break;
                case 'Enter':
                    if (selectedSuggestionIndex > -1) {
                        const selected = suggestions[selectedSuggestionIndex];
                        searchInput.value = selected.textContent;
                        suggestionsContainer.style.display = 'none';
                        search();
                    }
                    break;
                case 'Escape':
                    suggestionsContainer.style.display = 'none';
                    break;
            }
        });

        function updateSelection() {
            const suggestions = suggestionsContainer.children;
            Array.from(suggestions).forEach((item, index) => {
                item.classList.toggle('selected', index === selectedSuggestionIndex);
            });

            if (selectedSuggestionIndex > -1) {
                suggestions[selectedSuggestionIndex].scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        }

        function fetchBaiduSuggestions(query) {
            const script = document.createElement('script');
            script.src = `https://www.baidu.com/su?wd=${encodeURIComponent(query)}&cb=handleBaiduSuggestion`;
            document.body.appendChild(script);
        }

        function handleBaiduSuggestion(data) {
            suggestionsContainer.innerHTML = '';
            if (data.s && data.s.length > 0) {
                data.s.forEach((suggestion, index) => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.textContent = suggestion;
                    div.addEventListener('click', () => {
                        searchInput.value = suggestion;
                        suggestionsContainer.style.display = 'none';
                        search();
                    });
                    suggestionsContainer.appendChild(div);
                });
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
            selectedSuggestionIndex = -1;
        }

        // 点击页面其他地方隐藏建议框
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-container')) {
                suggestionsContainer.style.display = 'none';
            }
        });

        // 防止建议框点击事件冒泡
        suggestionsContainer.addEventListener('click', function(e) {
            e.stopPropagation();
        });