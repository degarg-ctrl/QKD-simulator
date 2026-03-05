# QKD-simulator
This project proposes the development of a Python-based simulator for the BB84 Quantum Key Distribution (QKD) protocol. The objective is to design a realistic and configurable simulation framework to analyze quantum-secure communication under practical operating conditions. The simulator will enable performance evaluation of QKD systems by
incorporating physical channel effects and adversarial attacks.
As quantum computing advances, traditional public-key cryptographic schemes (e.g., RSA,
ECC) face potential compromise. QKD offers information-theoretic security based on
quantum mechanics principles. However, practical performance evaluation under realistic
constraints remains a critical research need.

Problem Statement -

Although QKD protocols such as BB84 provide theoretically secure communication, real-
world deployments are affected by:

• Channel attenuation (distance-dependent photon loss)
• Detector inefficiency
• Dark counts and background noise
• Eavesdropping attacks
Existing studies often assume ideal conditions, limiting practical understanding. There is a
need for an accessible and configurable simulation platform that models both physical
impairments and adversarial strategies to evaluate security performance metrics such as
QBER and SKR.

Proposed Solution -

The proposed solution is a software-based QKD simulation framework implemented in
Python. The system will replicate the complete BB84 protocol workflow:
1. Random bit generation by Alice
2. Random basis selection (rectilinear/diagonal)
3. Quantum state encoding and transmission
4. Bob’s random basis measurement
5. Basis reconciliation (sifting phase)
6. Error estimation and secure key extraction

The simulator will integrate realistic channel modeling and configurable attack modules to
evaluate system robustness.

MainTech Stack for Front-End - 
Language: JavaScript / TypeScript with the React library.
Key Library: React Flow. This is the industry standard for creating "node-based" editors. It allows us to:
React.js or XyFlow (formerly React Flow) is ideal for building the drag-and-drop workspace. It allows us to create Custom Nodes for components like Alice, Bob, and the Fiber Channel, which can embed interactive elements such as sliders for distance or noise.
Create custom nodes for Alice, Bob, and Eve.
Drag and drop them onto a canvas.
Connect them with lines representing the Quantum Channel.
Styling: Tailwind CSS - 
This allows us to create that clean, professional look (whether modern or classic/utilitarian) easily.

