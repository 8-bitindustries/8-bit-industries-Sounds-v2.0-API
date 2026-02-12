/* 8-BIT INDUSTRIES SOUNDS V2.0 
   Engine: new-sound-8BI (Automatic Tags)
   New Sound: Mouse Click Added
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

    library: {
        "click": () => {
            const now = AudioEngine.ctx.currentTime;
            // Som curto e percussivo (simulando clique de mouse)
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

    playCredits() {
        this.init();
        if (this.playing) return;
        this.playing = true;
        let now = this.ctx.currentTime;
        const sequence = () => {
            if (!this.playing) return;
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
            if (this.playing) setTimeout(sequence, 5500);
        };
        sequence();
    },

    stop() {
        this.playing = false;
        if (this.ctx && this.ctx.state !== 'closed') {
            this.ctx.suspend();
        }
    }
};

class Sound8BI extends HTMLElement {
    connectedCallback() {
        this.onclick = () => {
            const s = this.getAttribute('sound');
            AudioEngine.init(); 
            if (AudioEngine.library[s]) AudioEngine.library[s]();
        };
    }
}
customElements.define('new-sound-8bi', Sound8BI);
document.addEventListener('touchstart', () => AudioEngine.init(), { once: true });
