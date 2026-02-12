/* 8-BIT INDUSTRIES SOUNDS V2.0 
   Module: 8bit-industries-credits
   Engine: new-sound-8BI (Automatic Tags)
   Developer: Richard Rangel Donatti Jung Mancy
*/

const AudioEngine = {
    ctx: null,
    playing: false,

    // Inicializa o contexto de áudio (obrigatório para navegadores modernos)
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    // Gerador de Oscilador Básico (O coração do som 8-bit)
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

    // --- BIBLIOTECA DE SONS 8BI ---
    library: {
        // O SOM DOS CRÉDITOS QUE VOCÊ CRIOU
        "credits": function() {
            AudioEngine.playCredits();
        },
        
        // SOM DE CONFIRMAÇÃO / MOEDA
        "coin": function() {
            const now = AudioEngine.ctx.currentTime;
            AudioEngine.osc(523.25, now, 0.1, 'square', 0.1); // C5
            AudioEngine.osc(783.99, now + 0.1, 0.2, 'square', 0.1); // G5
        },

        // SOM DE ERRO
        "error": function() {
            const now = AudioEngine.ctx.currentTime;
            AudioEngine.osc(130.81, now, 0.2, 'sawtooth', 0.2); // C3
            AudioEngine.osc(110.00, now + 0.1, 0.3, 'sawtooth', 0.2); // A2
        },

        // SOM DE PULO (JUMP)
        "jump": function() {
            const now = AudioEngine.ctx.currentTime;
            for(let i=0; i<10; i++) {
                AudioEngine.osc(300 + (i*40), now + (i*0.01), 0.05, 'square', 0.1);
            }
        }
    },

    // LÓGICA DA MÚSICA DE CRÉDITOS (O SOM DO TAM)
    playCredits() {
        this.init();
        if (this.playing) return;
        this.playing = true;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        let now = this.ctx.currentTime;

        const loop = () => {
            if (!this.playing) return;

            // --- FASE 1: O BAIXO CLASSICO ---
            for(let i=0; i<4; i++) {
                this.osc(110, now + i*0.4, 0.4, 'sawtooth', 0.1);
            }

            // --- FASE 2: O "TAM" (IMPACTO) ---
            this.osc(80, now + 1.6, 0.6, 'triangle', 0.4); 
            this.osc(150, now + 1.6, 0.2, 'square', 0.2);

            // --- FASE 3: MELODIA MODERNA (PÓS-TAM) ---
            for(let i=0; i<16; i++) {
                let t = now + 2.2 + (i * 0.2);
                let scale = [440, 523, 587, 659, 783]; 
                let f = scale[i % scale.length];
                this.osc(f, t, 0.15, 'square', 0.08);
                if(i % 4 === 0) {
                    this.osc(60, t, 0.3, 'sine', 0.25);
                }
            }

            now += 5.5; 
            if (this.playing) setTimeout(() => loop(), 5500);
        };

        loop();
    },

    stop() {
        this.playing = false;
        if (this.ctx) this.ctx.suspend();
    }
};

// --- COMPONENTE HTML CUSTOMIZADO: new-sound-8BI ---
class Sound8BI extends HTMLElement {
    connectedCallback() {
        // Pega o nome do som definido na tag
        const soundKey = this.getAttribute('sound');
        this.style.cursor = 'pointer';
        this.style.display = 'inline-block';
        
        this.onclick = () => {
            AudioEngine.init();
            if (AudioEngine.library[soundKey]) {
                AudioEngine.library[soundKey]();
                console.log("8BI Playing:", soundKey);
            } else {
                console.error("8BI Error: Som não encontrado ->", soundKey);
            }
        };
    }
}

// Registra a tag no navegador
customElements.define('new-sound-8bi', Sound8BI);
