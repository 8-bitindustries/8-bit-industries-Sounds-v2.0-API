/* 8-BIT INDUSTRIES SOUNDS V2.0 
   Engine: new-sound-8BI (Automatic Tags)
   Integrated with: config. Of 8BI sounds
*/

const AudioEngine = {
    ctx: null,
    playing: false,
    config: {
        showSplash: true,
        enableSound: true,
        autoPlay: true,
        loopSound: false,
        debugMode: false
    },

    init() {
        this.loadUserConfigs();
        
        if (!this.config.enableSound) {
            if(this.config.debugMode) console.log("8BI-Debug: Som desativado.");
            return;
        }

        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        this.renderSplash();
    },

    loadUserConfigs() {
        const saved = localStorage.getItem("config. Of 8BI sounds");
        if (saved) {
            this.config = JSON.parse(saved);
        }
    },

    renderSplash() {
        if (!this.config.showSplash || document.getElementById('8bi-splash')) return;
        const splash = document.createElement('div');
        splash.id = '8bi-splash';
        splash.style = "position:fixed; bottom:15px; right:15px; z-index:9999; pointer-events:none; opacity:0.8; transition: 0.5s;";
        splash.innerHTML = `
            <svg width="100" height="50" viewBox="0 0 800 400">
                <rect width="800" height="400" fill="#111" rx="40"/>
                <rect x="20" y="20" width="760" height="360" fill="none" stroke="#00FF88" stroke-width="12"/>
                <text x="400" y="240" font-family="monospace" font-size="120" font-weight="bold" fill="#00CC66" text-anchor="middle">8BI</text>
            </svg>`;
        document.body.appendChild(splash);
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

    exec(command) {
        this.loadUserConfigs();
        if (typeof command === 'string' && command.includes('&double_sound=')) {
            const sounds = command.split('=')[1].split(' and ');
            sounds.forEach(s => {
                const cleanName = s.replace(/"/g, '').trim();
                if (this.library[cleanName]) this.library[cleanName]();
            });
        } else if (this.library[command]) {
            this.library[command]();
        }
    },

    library: {
        "click": () => {
            const now = AudioEngine.ctx.currentTime;
            // Som de clique de rato (agudo e curto)
            AudioEngine.osc(800, now, 0.01, 'square', 0.1);
        },
        "coin": () => {
            const now = AudioEngine.ctx.currentTime;
            // Som de moeda (clássico 8-bit)
            AudioEngine.osc(987.77, now, 0.1, 'square', 0.1); // Nota Si
            AudioEngine.osc(1318.51, now + 0.1, 0.4, 'square', 0.1); // Nota Mi
        },
        "jump": () => {
            const now = AudioEngine.ctx.currentTime;
            // Som de pulo (frequência subindo)
            const o = AudioEngine.ctx.createOscillator();
            const g = AudioEngine.ctx.createGain();
            o.frequency.setValueAtTime(150, now);
            o.frequency.exponentialRampToTimeAtTime(600, now + 0.2);
            g.gain.setValueAtTime(0.1, now);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            o.connect(g); g.connect(AudioEngine.ctx.destination);
            o.start(now); o.stop(now + 0.2);
        },
        "credits": () => AudioEngine.playCredits()
    },

    playCredits() {
        if (!this.config.enableSound) return;
        this.init();
        if (this.playing) return;
        this.playing = true;
        let now = this.ctx.currentTime;

        const sequence = () => {
            if (!this.playing) return;
            // Melodia de créditos 8BI
            for(let i=0; i<4; i++) this.osc(110, now + i*0.4, 0.4, 'sawtooth', 0.1);
            this.osc(80, now + 1.6, 0.6, 'triangle', 0.3); 
            this.osc(150, now + 1.6, 0.2, 'square', 0.2);
            
            now += 5.5;
            if (this.playing) {
                if (this.config.loopSound || this.playing) setTimeout(sequence, 5500);
            }
        };
        sequence();
    },

    stop() {
        this.playing = false;
        if (this.ctx) this.ctx.suspend();
    }
};
window.AudioEngine = AudioEngine;
