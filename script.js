
(function() {
    const burgerBtn = document.getElementById('burger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const greetBtn = document.getElementById('greet-btn');
    const searchInput = document.getElementById('search-input');

    if (burgerBtn && mobileMenu) {
        burgerBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
        });

        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
            });
        });
    }

    /** Авторизація користувача */
    if (greetBtn) {
        greetBtn.addEventListener('click', function() {
            const input = document.getElementById('username-input');
            const greeting = document.getElementById('greeting-message');
            if (input.value.trim()) {
                greeting.innerText = `ВІТАЮ, ${input.value.toUpperCase()}!`;
                greeting.classList.remove('hidden');
                input.classList.add('hidden');
                this.classList.add('hidden');
            }
        });
    }

    /** Ініціалізація даних */
    const dataFiles = [
        'planets.json', 'dwarf-planets.json', 'satellites.json', 
        'stars.json', 'asteroids-comets.json'
    ];
    
    if (window.SolarModule) {
        window.SolarModule.init(dataFiles).then(data => {
            renderCatalog(data);
            setupFilters(data);
        });
    }

    /** Рендеринг елементів каталогу */
    function renderCatalog(planets) {
        const grid = document.getElementById('cards-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        planets.forEach(item => {
            const card = document.createElement('div');
            card.className = "group bg-gray-950/60 backdrop-blur-md border border-cyan-900/20 rounded-2xl p-6 transition-all duration-500 neon-border";
            card.innerHTML = `
                <div class="relative mb-6 rounded-xl h-32 flex items-center justify-center bg-black/40">
                    <div class="rounded-full w-16 h-16 transition duration-500 group-hover:scale-110" 
                         style="background:${item.simulation.background}; box-shadow:${item.simulation.boxShadow};"></div>
                </div>
                <h4 class="font-sci-fi text-lg text-white mb-4 group-hover:text-cyan-400 transition-colors">${item.name}</h4>
                <p class="text-xs text-gray-400 mb-6 line-clamp-2">${item.shortDescription}</p>
                <button class="view-btn w-full text-center font-sci-fi text-[10px] tracking-widest text-cyan-400 py-3 border border-cyan-500/30 rounded-lg hover:bg-cyan-500 hover:text-black transition-all">ПОКАЗАТИ</button>
            `;
            
            card.querySelector('.view-btn').addEventListener('click', () => {
                window.SolarModule.focusAndShow(item.id);
            });
            grid.appendChild(card);
        });
    }

    /** Фільтрація та пошук */
    function setupFilters(allData) {
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = allData.filter(p => p.name.toLowerCase().includes(term));
                renderCatalog(filtered);
            });
        }

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                const filtered = filter === 'all' 
                    ? allData 
                    : allData.filter(p => p.categoryId === filter);
                renderCatalog(filtered);
                
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'text-cyan-400'));
                btn.classList.add('active', 'text-cyan-400');
            });
        });
    }
})();
