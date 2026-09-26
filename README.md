# CIRCUIT BREAKER: OVERLINK
**IEEE Gameathon 2026 Submission**  
**Organized by:** BLDEACET, Vijayapura (STB 30721) & IEEE Bangalore Section  
**Theme:** *ROBOT REVOLT* ("The robots were created to help humans... but something has gone wrong. Your mission: Turn this conflict into a game.")

---

## 🛡️ Code Integrity & Rule Compliance Statement

This project strictly adheres to all **Development Guidelines & Code Integrity** rules specified for the IEEE Gameathon:

1. **Time Window (4 Hours):** Core design, logic, 3D math, procedural shaders, and testing were initiated and developed entirely within the allocated 4-hour window following theme release.
2. **Original Work:** 100% of game logic, AI state machines, body-swapping algorithms, camera physics, trauma-based screen shake, and procedural audio synthesizers were written from scratch on-site.
3. **No Pre-built Projects:** No pre-existing game templates, downloaded games, or pre-authored repositories were used. All files were built organically in this repository during the competition window.
4. **Third-Party & Open-Source Asset Attribution:**
   - **Three.js (`three`):** Open-source 3D WebGL library under MIT License (Used for real-time 3D scene graph, math, and rendering).
   - **React 19 & Vite:** Standard open-source web application framework and build tooling under MIT License.
   - **Tailwind CSS:** Open-source utility-first styling system under MIT License.
   - **Lucide React (`lucide-react`):** Open-source UI iconography under ISC License.
   - **Audio:** 100% Procedural Web Audio API synthesis (`AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`). Zero downloaded MP3 or WAV audio assets.
   - **3D Assets & Textures:** 100% Procedural code-generated geometries and canvas textures. Zero external 3D model downloads.

---

## 🎮 Narrative & Gameplay Synopsis

*"The robots were created to help humans... but something has gone wrong."*

OmniCorp’s central manufacturing hub has suffered a critical logic corruption, turning its automated war-machine workforce against its human creators. You play as **Unit-7**, a loyal cyber-droid equipped with a cutting-edge **Neural Tether**.

### Core Innovations & Mechanics:
- **Neural Tether Hacking:** Aim and project a high-frequency electric cyan arc into hostile automatons like the heavy MK-IV Titan Mech to hijack their neural bus.
- **Body-Swapping Leap:** Press `[E]` to embody overridden war mechs, gaining heavy armor, hydraulic footsteps, a **Hydraulic Slam Cannon**, and the **Aegis Riot Energy Shield**.
- **Human Evacuation Escort:** Protect and guide trapped scientists wearing yellow hazard jumpsuits through rogue automaton swarms to the southern extraction airlock.
- **CORE-X Mechanical Spider Apex Encounter:** Face the facility's apex rogue AI featuring a 360-degree rotating red death ray, tracking plasma missiles, and kinetic ground shockwaves.

---

## 🕹️ Controls Quick Reference

- **`WASD`**: Move chassis
- **`Mouse`**: 360° Raycast crosshair aim
- **`Left-Click`**: Fire weapon (Unit-7 Blaster / Titan Cannon)
- **`Right-Click` (Hold)**: Fire Neural Tether to hack MK-IV Titan
- **`[E]`**: Embody Titan Mech / Eject back to Unit-7
- **`Shift` (Hold)**: Deploy Aegis Riot Shield (Titan) / Sprint (Unit-7)
- **`[F]`**: Toggle Borderless Fullscreen
- **`[M]`**: Mute / Unmute procedural audio synthesizer
- **`[F1]` or `[G]`**: Judge Demo Invulnerability (God-Mode)
- **`Spacebar`**: Instant Match Start / Restart

---

## 🏗️ Technical Architecture

- **`src/games/overlink/FactoryArena.ts`**: Reflective industrial metallic floor, glowing cyan power conduits, catwalk with safety railings, structural pillars, hazard-striped cover crates, and rotating emergency sirens.
- **`src/games/overlink/EntityModels.ts`**: Procedural multi-part 3D models for Unit-7, MK-IV Titan Mech, yellow hazmat scientists, and scout drones.
- **`src/games/overlink/BossModel.ts`**: 6-legged articulated mechanical spider boss with rotating death ray and ocular point lighting.
- **`src/games/overlink/TetherEngine.ts`**: Dynamic electric cyan arc with high-frequency sine jitter and additive particle emission.
- **`src/games/overlink/VFXSystem.ts`**: 3D gravity-affected spark particles and 2D projected floating combat text.
- **`src/engine/audio.ts`**: Real-time Web Audio API procedural synthesizer for laser discharges, heavy hydraulic thuds, alarm sirens, and dynamic synthwave BGM.
- **`src/engine/screenshake.ts`**: Non-linear trauma damping physics for kinetic camera shake.
- **`src/components/OverlinkHUD.tsx`**: Retro-futuristic HUD overlay with circular SVG thermal stability gauge, tactical radar, and boss HP tracker.
