/**
 * Модуль візуалізації 3D-середовища.
 */
window.SolarModule = (function() {
    const state = { 
        zoom: 0.8, rotX: 60, rotY: 0, posX: 0, posY: 0, 
        isDragging: false, lastX: 0, lastY: 0, prevDist: 0,
        trackedBodyId: null 
    };
    
    let globalData = [];
    let animatedBodies = [];
    let evCache = [];

    const universe = document.getElementById('universe');
    const sceneContainer = document.getElementById('scene-container');

    /** Обробка подій маніпулятора */
    function initControls() {
        if (!sceneContainer) return;

        sceneContainer.addEventListener('pointerdown', e => { 
            evCache.push(e); 
            state.isDragging = true; 
            state.lastX = e.clientX; state.lastY = e.clientY; 
        });

        window.addEventListener('pointermove', e => {
            const index = evCache.findIndex(ev => ev.pointerId === e.pointerId);
            if (index === -1) return;
            evCache[index] = e;

            if (evCache.length === 1 && state.isDragging) {
                if (Math.abs(e.clientX - state.lastX) > 5) state.trackedBodyId = null;
                state.rotY += (e.clientX - state.lastX) * 0.4;
                state.rotX -= (e.clientY - state.lastY) * 0.4;
                state.rotX = Math.max(-90, Math.min(90, state.rotX));
            } else if (evCache.length === 2) {
                const dist = Math.hypot(evCache[0].clientX - evCache[1].clientX, evCache[0].clientY - evCache[1].clientY);
                if (state.prevDist > 0) state.zoom = Math.max(0.05, Math.min(5, state.zoom + (dist - state.prevDist) * 0.005));
                state.prevDist = dist;
            }
            state.lastX = e.clientX; state.lastY = e.clientY;
        });

        const stopDrag = e => { 
            evCache = evCache.filter(ev => ev.pointerId !== e.pointerId);
            if (evCache.length < 2) state.prevDist = 0;
            if (evCache.length === 0) state.isDragging = false;
        };
        window.addEventListener('pointerup', stopDrag);
        window.addEventListener('pointercancel', stopDrag);

        sceneContainer.addEventListener('wheel', e => { 
            if (e.ctrlKey) {
                e.preventDefault(); 
                state.zoom = Math.max(0.05, Math.min(5, state.zoom - e.deltaY * 0.001)); 
            }
        }, { passive: false });
    }

    /** Генерація графічних примітивів */
    function buildUniverse(data) {
        if (!universe) return;
        universe.innerHTML = '';
        animatedBodies = [];
        const elements = {};

        data.forEach(item => {
            const sim = item.simulation;
            const container = document.createElement('div');
            container.className = 'planet-container';
            
            const billboard = document.createElement('div');
            billboard.className = 'planet-billboard';

            const body = document.createElement('div');
            body.className = 'planet-body shadow-lg';
            body.style.cssText = `width:${sim.size}px; height:${sim.size}px; background:${sim.background}; box-shadow:${sim.boxShadow}; transition: opacity 0.5s; cursor: pointer; pointer-events: auto;`;
            
            body.addEventListener('click', (e) => {
                e.stopPropagation();
                focusAndShow(item.id);
            });

            billboard.appendChild(body);
            container.appendChild(billboard);
            elements[item.id] = container;

            animatedBodies.push({ 
                el: container, bodyEl: body, billboardEl: billboard, 
                distance: sim.distance || 0, angle: sim.angle || 0, 
                speed: sim.speed || 0, orbitsAround: sim.orbitsAround, id: item.id 
            });
        });

        animatedBodies.forEach(b => {
            (b.orbitsAround && elements[b.orbitsAround]) 
                ? elements[b.orbitsAround].appendChild(b.el) 
                : universe.appendChild(b.el);
        });
    }

    /** Кінематика об'єктів */
    function animate() {
        let fX = 0, fZ = 0, pos = {};
        animatedBodies.forEach(b => {
            b.angle += b.speed;
            const lX = Math.cos(b.angle) * b.distance;
            const lZ = Math.sin(b.angle) * b.distance;
            
            b.el.style.transform = `translate3d(${lX}px, 0, ${lZ}px)`;
            b.billboardEl.style.transform = `translate(-50%, -50%) rotateY(${-state.rotY}deg) rotateX(${-state.rotX}deg)`;
            
            let gX = lX, gZ = lZ;
            if (b.orbitsAround && pos[b.orbitsAround]) { 
                gX += pos[b.orbitsAround].x; 
                gZ += pos[b.orbitsAround].z; 
            }
            pos[b.id] = { x: gX, z: gZ };
            if (state.trackedBodyId === b.id) { fX = gX; fZ = gZ; }
        });

        universe.style.transform = `scale3d(${state.zoom}, ${state.zoom}, ${state.zoom}) rotateX(${state.rotX}deg) rotateY(${state.rotY}deg) translate3d(${state.posX - fX}px, ${state.posY}px, ${-fZ}px)`;
        requestAnimationFrame(animate);
    }

    /** Відображення параметрів об'єкта */
    function showModal(item) {
        const prev = document.getElementById('planet-modal');
        if (prev) prev.remove();

        const modal = document.createElement('div');
        modal.id = 'planet-modal';
        modal.className = 'fixed top-1/2 right-6 -translate-y-1/2 z-[100] w-80 bg-gray-950/90 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-6 shadow-2xl transform translate-x-[120%] transition-transform duration-500';
        modal.innerHTML = `
            <button id="close-modal" class="absolute top-4 right-4 text-gray-400 hover:text-cyan-400">✕</button>
            <div class="mb-6 aspect-square rounded-2xl flex items-center justify-center bg-black/50 border border-cyan-900/20">
                <div class="rounded-full w-24 h-24" style="background:${item.simulation.background}; box-shadow:${item.simulation.boxShadow};"></div>
            </div>
            <h3 class="font-sci-fi text-2xl text-cyan-400 mb-2">${item.name}</h3>
            <p class="text-sm text-gray-300 leading-relaxed">${item.shortDescription}</p>
        `;
        document.body.appendChild(modal);

        animatedBodies.forEach(b => b.bodyEl.style.opacity = b.id === item.id ? '1' : '0.1');
        requestAnimationFrame(() => modal.classList.remove('translate-x-[120%]'));

        modal.querySelector('#close-modal').addEventListener('click', () => {
            modal.classList.add('translate-x-[120%]');
            animatedBodies.forEach(b => b.bodyEl.style.opacity = '1');
            setTimeout(() => modal.remove(), 500);
        });
    }

    /** Наведення камери */
    function focusAndShow(id) {
        const item = globalData.find(p => p.id === id);
        if (item) {
            sceneContainer.scrollIntoView({ behavior: 'smooth' });
            state.trackedBodyId = id;
            state.zoom = 2.0;
            showModal(item);
        }
    }

    /** Експорт модуля */
    return {
        init: async function(files) {
            initControls();
            for (const file of files) {
                try {
                    const res = await fetch(`data/${file}`);
                    const data = await res.json();
                    data.forEach(item => { 
                        item.categoryId = file.replace('.json', ''); 
                        globalData.push(item); 
                    });
                } catch(e) { console.error(`Помилка I/O: ${file}`); }
            }
            buildUniverse(globalData);
            animate();
            return globalData;
        },
        focusAndShow
    };
})();
