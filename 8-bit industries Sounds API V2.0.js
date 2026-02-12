/* 8-BIT INDUSTRIES SOUNDS V2.0 
   Engine: new-sound-8BI (Automatic Tags)
*/

const AudioEngine = {
    ctx: null,
    playing: false,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
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
        "coin": () => {
            const now = AudioEngine.ctx.currentTime;
            AudioEngine.osc(523, now, 0.1, 'square', 0.1);
            AudioEngine.osc(783, now + 0.1, 0.2, 'square', 0.1);
        },
        "error": () => {
            const now = AudioEngine.ctx.currentTime;
            AudioEngine.osc(130, now, 0.2, 'sawtooth', 0.2);
            AudioEngine.osc(110, now + 0.1, 0.3, 'sawtooth', 0.2);
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
        const loop = () => {
            if (!this.playing) return;
            for(let i=0; i<4; i++) this.osc(110, now + i*0.4, 0.4, 'sawtooth', 0.1);
            this.osc(80, now + 1.6, 0.6, 'triangle', 0.4); 
            this.osc(150, now + 1.6, 0.2, 'square', 0.2);
            now += 5.5;
            if (this.playing) setTimeout(loop, 5500);
        };
        loop();
    },

    stop() {
        this.playing = false;
        if (this.ctx) this.ctx.suspend();
    }
};

// A TAG PERSONALIZADA
class Sound8BI extends HTMLElement {
    connectedCallback() {
        this.style.cursor = 'pointer';
        this.style.display = 'inline-block';
        this.onclick = () => {
            const s = this.getAttribute('sound');
            AudioEngine.init(); // ACORDA O ÁUDIO
            if (AudioEngine.library[s]) AudioEngine.library[s]();
        };
    }
}
customElements.define('new-sound-8bi', Sound8BI);
