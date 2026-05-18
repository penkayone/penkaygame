(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const toast = document.getElementById("toast");
    const soundToggle = document.getElementById("soundToggle");
    const shareBtn = document.getElementById("shareBtn");
    const cursorOrbit = document.getElementById("cursorOrbit");
    const canvas = document.getElementById("stageCanvas");
    const ctx = canvas.getContext("2d", {alpha: true});

    let audioContext;
    let soundEnabled = false;

    const showToast = (message) => {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("is-visible");
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 1600);
    };

    const initAudio = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
    };

    const tone = (frequency, duration, type = "sine", gainValue = 0.06, delay = 0) => {
        if (!soundEnabled || !audioContext) return;
        const now = audioContext.currentTime + delay;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + duration + 0.03);
    };

    const noise = (duration = 0.1, gainValue = 0.05, delay = 0) => {
        if (!soundEnabled || !audioContext) return;
        const now = audioContext.currentTime + delay;
        const bufferSize = Math.max(1, Math.floor(audioContext.sampleRate * duration));
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i += 1) {
            output[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const source = audioContext.createBufferSource();
        const gain = audioContext.createGain();
        source.buffer = buffer;
        gain.gain.setValueAtTime(gainValue, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        source.connect(gain);
        gain.connect(audioContext.destination);
        source.start(now);
    };

    const playSound = (name = "chip") => {
        if (!soundEnabled) return;
        initAudio();

        if (name === "chip") {
            tone(650, 0.08, "triangle", 0.045);
            tone(980, 0.08, "triangle", 0.035, 0.045);
            noise(0.05, 0.018);
            return;
        }

        if (name === "rocket") {
            tone(220, 0.18, "sawtooth", 0.025);
            tone(660, 0.22, "triangle", 0.045, 0.06);
            tone(1100, 0.12, "sine", 0.035, 0.2);
            return;
        }

        if (name === "drop") {
            tone(840, 0.06, "triangle", 0.032);
            tone(560, 0.06, "triangle", 0.03, 0.08);
            tone(420, 0.08, "triangle", 0.028, 0.16);
            return;
        }

        if (name === "spin") {
            noise(0.18, 0.034);
            tone(320, 0.1, "square", 0.018, 0.02);
            tone(480, 0.1, "square", 0.018, 0.11);
            return;
        }

        if (name === "slot") {
            tone(520, 0.06, "square", 0.03);
            tone(620, 0.06, "square", 0.03, 0.07);
            tone(780, 0.1, "square", 0.034, 0.14);
            return;
        }

        if (name === "win") {
            tone(523, 0.08, "triangle", 0.04);
            tone(659, 0.08, "triangle", 0.04, 0.08);
            tone(784, 0.12, "triangle", 0.05, 0.16);
            return;
        }

        if (name === "coin") {
            tone(980, 0.045, "triangle", 0.035);
            tone(1320, 0.055, "sine", 0.03, 0.045);
            tone(1720, 0.05, "sine", 0.02, 0.09);
            noise(0.035, 0.01);
        }
    };

    const setSound = (nextState) => {
        soundEnabled = nextState;
        if (soundEnabled) initAudio();
        soundToggle.classList.toggle("is-on", soundEnabled);
        soundToggle.setAttribute("aria-pressed", String(soundEnabled));
        soundToggle.lastChild.textContent = soundEnabled ? " Sound on" : " Sound off";
        if (soundEnabled) {
            playSound("win");
            showToast("Casino sounds enabled");
        } else {
            showToast("Sound disabled");
        }
    };

    if (soundToggle) {
        soundToggle.addEventListener("click", () => setSound(!soundEnabled));
    }

    document.querySelectorAll(".casino-sound").forEach((element) => {
        element.addEventListener("pointerenter", () => {
            playSound(element.classList.contains("primary-button") || element.classList.contains("play-button") ? "coin" : (element.dataset.sound || "chip"));
        });
        element.addEventListener("click", () => playSound(element.dataset.sound || "chip"));
    });

    if (shareBtn) {
        shareBtn.addEventListener("click", async () => {
            const shareData = {title: document.title, url: window.location.href};
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                    return;
                } catch (error) {
                    if (error.name === "AbortError") return;
                }
            }

            try {
                await navigator.clipboard.writeText(shareData.url);
                showToast("Link copied");
            } catch {
                showToast("Copy is unavailable");
            }
        });
    }

    const revealItems = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, {threshold: 0.16});

        revealItems.forEach((item, index) => {
            item.style.transitionDelay = `${Math.min(index * 40, 240)}ms`;
            observer.observe(item);
        });
    } else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const roadStory = document.getElementById("road");
    const coinField = document.getElementById("coinField");
    let roadProgress = 0;
    let nextCoinSoundAt = 0.12;
    let scrollTicking = false;

    if (coinField) {
        const coins = Array.from({length: 34}, (_, index) => {
            const coin = document.createElement("span");
            const row = index % 5;
            const column = Math.floor(index / 5);
            coin.style.setProperty("--x", String(12 + column * 13 + Math.random() * 7));
            coin.style.setProperty("--y", String(18 + row * 13 + Math.random() * 7));
            coin.style.setProperty("--s", String(Math.random().toFixed(2)));
            coin.style.animationDelay = `${-Math.random() * 2.5}s`;
            coinField.appendChild(coin);
            return coin;
        });

        coinField.dataset.coins = String(coins.length);
    }

    const updateRoadProgress = () => {
        scrollTicking = false;
        if (!roadStory) return;

        const rect = roadStory.getBoundingClientRect();
        const available = Math.max(1, rect.height - window.innerHeight);
        const progress = Math.min(1, Math.max(0, -rect.top / available));
        roadProgress = progress;
        roadStory.style.setProperty("--road-progress", progress.toFixed(4));

        if (soundEnabled && progress > nextCoinSoundAt && progress < 0.96) {
            playSound("coin");
            nextCoinSoundAt += 0.14;
        }

        if (progress < 0.05) {
            nextCoinSoundAt = 0.12;
        }
    };

    const requestRoadUpdate = () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(updateRoadProgress);
    };

    window.addEventListener("scroll", requestRoadUpdate, {passive: true});
    window.addEventListener("resize", updateRoadProgress);
    updateRoadProgress();

    if (canHover) {
        document.addEventListener("pointermove", (event) => {
            if (!cursorOrbit) return;
            cursorOrbit.style.opacity = "1";
            cursorOrbit.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
        });

        document.querySelectorAll("[data-tilt]").forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const rotateY = ((x / rect.width) - 0.5) * 9;
                const rotateX = ((y / rect.height) - 0.5) * -9;
                card.style.transform = `perspective(950px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });

            card.addEventListener("pointerleave", () => {
                card.style.transform = "";
            });
        });
    }

    const stage = {
        width: 0,
        height: 0,
        dpr: 1,
        time: 0,
        chips: [],
        cards: [],
    };

    const randomRange = (min, max) => min + Math.random() * (max - min);

    const resizeCanvas = () => {
        stage.dpr = Math.min(window.devicePixelRatio || 1, 2);
        stage.width = window.innerWidth;
        stage.height = window.innerHeight;
        canvas.width = Math.floor(stage.width * stage.dpr);
        canvas.height = Math.floor(stage.height * stage.dpr);
        canvas.style.width = `${stage.width}px`;
        canvas.style.height = `${stage.height}px`;
        ctx.setTransform(stage.dpr, 0, 0, stage.dpr, 0, 0);
    };

    const resetScene = () => {
        stage.chips = Array.from({length: 26}, () => ({
            x: randomRange(-0.1, 1.1),
            y: randomRange(-0.1, 1.05),
            z: randomRange(0.35, 1),
            r: randomRange(5, 16),
            speed: randomRange(0.08, 0.26),
            hue: Math.random() > 0.55 ? "#c5ff34" : "#48e6ff",
        }));

        stage.cards = Array.from({length: 8}, () => ({
            x: randomRange(0, 1),
            y: randomRange(0, 1),
            z: randomRange(0.25, 0.9),
            angle: randomRange(-0.8, 0.8),
            speed: randomRange(0.04, 0.14),
        }));
    };

    const drawChip = (chip, time) => {
        const drift = time * chip.speed;
        const x = ((chip.x + drift * 0.035) % 1.2 - 0.1) * stage.width;
        const y = (chip.y + Math.sin(time * chip.speed + chip.x * 8) * 0.025) * stage.height;
        const radius = chip.r * chip.z;

        ctx.save();
        ctx.globalAlpha = 0.35 + chip.z * 0.35;
        ctx.translate(x, y);
        ctx.rotate(time * chip.speed);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(3, 4, 7, 0.64)";
        ctx.fill();
        ctx.lineWidth = Math.max(1, radius * 0.16);
        ctx.strokeStyle = chip.hue;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.42, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.stroke();
        ctx.restore();
    };

    const drawCard = (card, time) => {
        const x = card.x * stage.width;
        const y = ((card.y + time * card.speed * 0.018) % 1.15 - 0.08) * stage.height;
        const width = 46 + card.z * 42;
        const height = width * 1.42;

        ctx.save();
        ctx.globalAlpha = 0.18 + card.z * 0.28;
        ctx.translate(x, y);
        ctx.rotate(card.angle + Math.sin(time * card.speed) * 0.2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-width / 2, -height / 2, width, height, 8);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, width * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = card.z > 0.55 ? "rgba(197, 255, 52, 0.4)" : "rgba(72, 230, 255, 0.34)";
        ctx.fill();
        ctx.restore();
    };

    const drawStage = (timestamp) => {
        if (prefersReducedMotion) return;
        stage.time = timestamp * 0.001;
        ctx.clearRect(0, 0, stage.width, stage.height);

        const cx = stage.width * 0.68;
        const cy = stage.height * 0.44;
        const radius = Math.min(stage.width, stage.height) * 0.28;

        ctx.save();
        ctx.globalAlpha = 0.2;
        for (let i = 0; i < 4; i += 1) {
            ctx.beginPath();
            ctx.ellipse(cx, cy, radius + i * 44, (radius + i * 44) * 0.36, stage.time * 0.18 + i, 0, Math.PI * 2);
            ctx.strokeStyle = i % 2 ? "rgba(72, 230, 255, 0.46)" : "rgba(197, 255, 52, 0.42)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();

        stage.cards.forEach((card) => drawCard(card, stage.time));
        stage.chips.forEach((chip) => drawChip(chip, stage.time));

        requestAnimationFrame(drawStage);
    };

    if (ctx) {
        resizeCanvas();
        resetScene();
        window.addEventListener("resize", () => {
            resizeCanvas();
            resetScene();
        });

        if (!prefersReducedMotion) {
            requestAnimationFrame(drawStage);
        }
    }
})();
