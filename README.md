# QKD-simulator
This project proposes the development of a Python-based simulator for the BB84 Quantum Key Distribution (QKD) protocol. The objective is to design a realistic and configurable simulation framework to analyze quantum-secure communication under practical operating conditions. The simulator will enable performance evaluation of QKD systems by incorporating physical channel effects and adversarial attacks. As quantum computing advances, traditional public-key cryptographic schemes (e.g., RSA, ECC) face potential compromise. QKD offers information-theoretic security based on quantum mechanics principles. However, practical performance evaluation under realistic constraints remains a critical research need.

## What It Simulates
The full BB84 workflow:
- Alice's random bit generation
- Random basis selection (rectilinear/diagonal)
- Quantum state encoding & transmission
- Bob's random basis measurement
- Basis reconciliation (sifting)
- Error estimation & secure key extraction
Plus real-world impairments: channel attenuation, detector inefficiency, dark counts, background noise, and eavesdropping attacks.

## FrontEnd
Now thinking about the forntend the main thing would be to how to approach it which would be mainly using React.js with React Flow (XyFlow) for a node based editor.
Styled with Tailwind CSS

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
