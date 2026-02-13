/* 8-BIT INDUSTRIES SOUNDS V2.0 
   Engine: new-sound-8BI (Automatic Tags)
   Status: ORIGINAL CREDITS & LOGO FIXED
*/

const AudioEngine = {
    ctx: null,
    playing: false,
    // Configurações Padrão
    config: {
        showSplash: true,
        enableSound: true,
        autoPlay: true,
        loopSound: false,
        debugMode: false
    },

    init() {
        this.loadUserConfigs();
        if (!this.config.enableSound) return;

        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    },

    loadUserConfigs() {
        const saved = localStorage.getItem("config. Of 8BI sounds");
        if (saved) {
            this.config = JSON.parse(saved);
        }
    },

    // --- VISUAL: SPLASH SCREEN (LOGO ORIGINAL) ---
    showLogo() {
        if (!this.config.showSplash) return;
        
        let splash = document.getElementById('8bi-splash');
        if (!splash) {
            splash = document.createElement('div');
            splash.id = '8bi-splash';
            // Posição fixa no canto direito inferior
            splash.style = "position:fixed; bottom:20px; right:20px; z-index:9999; pointer-events:none; transition: opacity 0.3s; opacity:0; transform: scale(0.8); transform-origin: bottom right;";
            
            // SVG ORIGINAL DA 8-BIT INDUSTRIES + TEXTO SOUNDS
            splash.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; background: rgba(0,0,0,0.85); padding:15px; border-radius:12px; border: 2px solid #00FF88; box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);">
                    <svg width="200" height="100" viewBox="0 0 800 400">
                        <rect width="800" height="400" fill="#111111"/>
                        <rect x="20" y="20" width="760" height="360" fill="none" stroke="#00FF88" stroke-width="15"/>
                        <g transform="translate(400,170)">
                            <rect x="-40" y="-80" width="80" height="40" fill="#00FF88"/>
                            <rect x="-40" y="40" width="80" height="40" fill="#00FF88"/>
                            <rect x="-80" y="-40" width="40" height="80" fill="#00FF88"/>
                            <rect x="40" y="-40" width="40" height="80" fill="#00FF88"/>
                            <rect x="-60" y="-60" width="120" height="120" fill="#00CC66"/>
                            <rect x="-30" y="-30" width="60" height="60" fill="#111111"/>
                        </g>
                        <text x="400" y="340" font-family="monospace" font-size="60" font-weight="bold" fill="#00CC66" text-anchor="middle">8 BIT INDUSTRIES</text>
                    </svg>
                    <div style="color:#00FF88; font-family:monospace; font-size:18px; font-weight:bold; letter-spacing:6px; margin-top:8px; text-shadow: 0px 0px 5px rgba(0,255,136,0.5);">SOUNDS</div>
                </div>`;
            document.body.appendChild(splash);
        }
        // Pequeno delay para a transição de opacidade funcionar
        setTimeout(() => splash.style.opacity = "1", 10);
    },

    hideLogo(delay = 500) {
        const splash = document.getElementById('8bi-splash');
        if (splash) {
            setTimeout(() => {
                // Só esconde se o som realmente parou
                if (!this.playing) splash.style.opacity = "0";
            }, delay);
        }
    },

    osc(freq, start, dur, type, vol) {
        if (!this.config.enableSound) return;
        this.init();
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(vol, start);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(start);
        o.stop(start + dur);
    },

    // Executa comandos (Simples ou Double)
    exec(command) {
        this.loadUserConfigs();
        
        if (typeof command === 'string' && command.includes('&double_sound=')) {
            // Suporte para double_sound
            const sounds = command.split('=')[1].split(' and ');
            this.showLogo();
            let maxDuration = 0;
            
            sounds.forEach(s => {
                const cleanName = s.replace(/"/g, '').trim();
                if (this.library[cleanName]) {
                    this.library[cleanName]();
                    // Define tempo estimado para esconder logo (baseado no som)
                    if(cleanName === 'credits') maxDuration = 5500;
                    else maxDuration = Math.max(maxDuration, 1000);
                }
            });
            
            if(maxDuration < 5000) this.hideLogo(maxDuration);
            
        } else if (this.library[command]) {
            // Execução normal
            this.showLogo();
            this.library[command]();
            // Se não for credits (que tem loop próprio), esconde logo rápido
            if (command !== 'credits') this.hideLogo(800);
        }
    },

    library: {
        "click": () => {
            const now = AudioEngine.ctx.currentTime;
            // Som de mouse clicando (Seco)
            AudioEngine.osc(700, now, 0.02, 'square', 0.1);
            AudioEngine.osc(300, now + 0.01, 0.01, 'sine', 0.05);
        },
        "coin": () => {
            const now = AudioEngine.ctx.currentTime;
            AudioEngine.osc(523, now, 0.1, 'square', 0.1);
            AudioEngine.osc(783, now + 0.1, 0.2, 'square', 0.1);
        },
        "jump": () => {
            const now = AudioEngine.ctx.currentTime;
            for(let i=0; i<10; i++) AudioEngine.osc(300 + (i*40), now + (i*0.01), 0.05, 'square', 0.1);
        },
        "credits": () => AudioEngine.playCredits()
    },

    // --- SOM DE CRÉDITOS (VERSÃO ORIGINAL SOLICITADA) ---
    playCredits() {
        if (!this.config.enableSound) return;
        this.init();
        if (this.playing) return;
        this.playing = true;
        this.showLogo(); // Mostra logo ao iniciar

        let now = this.ctx.currentTime;

        const sequence = () => {
            if (!this.playing) return;

            // O Loop exato que você pediu:
            for(let i=0; i<4; i++) {
                this.osc(110, now + i*0.4, 0.4, 'sawtooth', 0.1);
            }
            this.osc(150, now + 1.6, 0.2, 'square', 0.2);
            
            now += 5.5;

            // Lógica de Loop / Parada
            if (this.playing) {
                if(this.config.loopSound) {
                    setTimeout(sequence, 5500);
                } else {
                    setTimeout(() => {
                        if(this.playing) { // Verifica novamente
                            this.playing = false;
                            this.hideLogo(0);
                        }
                    }, 2000); // Para após o ciclo se não tiver loop
                }
            }
        };
        sequence();
    },

    stop() {
        this.playing = false;
        if (this.ctx) this.ctx.suspend();
        this.hideLogo(0); // Esconde logo imediatamente
    }
};

window.AudioEngine = AudioEngine;
