/* 8-BIT INDUSTRIES SOUNDS V2.0 
   Engine: new-sound-8BI (Automatic Tags)
   Status: Credits Restored & Dynamic Splash
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

    // A logo só aparece quando esta função é chamada pelos sons
    showLogo() {
        if (!this.config.showSplash) return;
        
        let splash = document.getElementById('8bi-splash');
        if (!splash) {
            splash = document.createElement('div');
            splash.id = '8bi-splash';
            splash.style = "position:fixed; bottom:20px; right:20px; z-index:9999; pointer-events:none; transition: opacity 0.2s;";
            splash.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <svg width="120" height="60" viewBox="0 0 800 400">
                        <rect width="800" height="400" fill="#111" rx="10"/>
                        <rect x="20" y="20" width="760" height="360" fill="none" stroke="#00FF88" stroke-width="15"/>
                        <g transform="translate(400,170)">
                            <rect x="-40" y="-80" width="80" height="40" fill="#00FF88"/>
                            <rect x="-40" y="40" width="80" height="40" fill="#00FF88"/>
                            <rect x="-80" y="-40" width="40" height="80" fill="#00FF88"/>
                            <rect x="40" y="-40" width="40" height="80" fill="#00FF88"/>
                            <rect x="-60" y="-60" width="120" height="120" fill="#00CC66"/>
                            <rect x="-30" y="-30" width="60" height="60" fill="#111"/>
                        </g>
                        <text x="400" y="350" font-family="monospace" font-size="45" font-weight="bold" fill="#00CC66" text-anchor="middle">8 BITS INDUSTRIES</text>
                    </svg>
                    <span style="color:#00FF88; font-family:monospace; font-size:14px; font-weight:bold; letter-spacing:3px; margin-top:5px; text-shadow: 2px 2px #000;">SOUNDS</span>
                </div>`;
            document.body.appendChild(splash);
        }
        splash.style.opacity = "1";
    },

    hideLogo(delay = 500) {
        const splash = document.getElementById('8bi-splash');
        if (splash) {
            setTimeout(() => {
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

    exec(command) {
        this.loadUserConfigs();
        if (this.library[command]) {
            this.showLogo();
            this.library[command]();
            if (command !== 'credits') this.hideLogo(800);
        }
    },

    library: {
        "click": () => {
            const now = AudioEngine.ctx.currentTime;
            AudioEngine.osc(700, now, 0.02, 'square', 0.1);
        },
        "coin": () => {
            const now = AudioEngine.ctx.currentTime;
            AudioEngine.osc(987, now, 0.08, 'square', 0.1);
            AudioEngine.osc(1318, now + 0.08, 0.3, 'square', 0.1);
        },
        "jump": () => {
            const now = AudioEngine.ctx.currentTime;
            const o = AudioEngine.ctx.createOscillator();
            const g = AudioEngine.ctx.createGain();
            o.frequency.setValueAtTime(150, now);
            o.frequency.exponentialRampToValueAtTime(600, now + 0.15);
            g.gain.setValueAtTime(0.1, now);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            o.connect(g); g.connect(AudioEngine.ctx.destination);
            o.start(now); o.stop(now + 0.15);
        },
        "credits": () => AudioEngine.playCredits()
    },

    playCredits() {
        if (!this.config.enableSound) return;
        this.init();
        if (this.playing) return;
        this.playing = true;
        this.showLogo();
        
        let now = this.ctx.currentTime;
        const sequence = () => {
            if (!this.playing) return;
            
            // MELODIA ORIGINAL RESTAURADA
            for(let i=0; i<4; i++) this.osc(110, now + i*0.4, 0.4, 'sawtooth', 0.1);
            this.osc(80, now + 1.6, 0.6, 'triangle', 0.3); 
            this.osc(150, now + 1.6, 0.2, 'square', 0.2);
            for(let i=0; i<16; i++) {
                let t = now + 2.2 + (i * 0.2);
                let f = [440, 523, 587, 659, 783][i % 5];
                this.osc(f, t, 0.15, 'square', 0.1);
                if(i % 4 === 0) this.osc(60, t, 0.3, 'sine', 0.2); 
            }
            
            now += 5.5;
            setTimeout(sequence, 5500);
        };
        sequence();
    },

    stop() {
        this.playing = false;
        if (this.ctx) this.ctx.suspend();
        this.hideLogo(0);
    }
};
window.AudioEngine = AudioEngine;
