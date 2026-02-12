/* 8-BIT INDUSTRIES SOUNDS V2.0 
   Engine: new-sound-8BI (Automatic Tags)
   Feature: double_sound support enabled
*/

const AudioEngine = {
    ctx: null,
    playing: false,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    },

    osc(freq, start, dur, type, vol) {
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

    // Nova função para interpretar execução dupla
    exec(command) {
        if (command.includes('&double_sound=')) {
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
            AudioEngine.osc(700, now, 0.02, 'square', 0.1);
        },
        "coin": () => {
            const now = AudioEngine.ctx.currentTime;
            AudioEngine.osc(523, now, 0.1, 'square', 0.1);
            AudioEngine.osc(783, now + 0.1, 0.2, 'square', 0.1);
        },
        "credits": () => AudioEngine.playCredits()
    },

    playCredits() {
        this.init();
        if (this.playing) return;
        this.playing = true;
        let now = this.ctx.currentTime;
        const sequence = () => {
            if (!this.playing) return;
            for(let i=0; i<4; i++) this.osc(110, now + i*0.4, 0.4, 'sawtooth', 0.1);
            now += 5.5;
            if (this.playing) setTimeout(sequence, 5500);
        };
        sequence();
    },

    stop() {
        this.playing = false;
        if (this.ctx) this.ctx.suspend();
    }
};

window.AudioEngine = AudioEngine;
