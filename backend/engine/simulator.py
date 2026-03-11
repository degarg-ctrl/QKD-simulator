"""
Simulator Module — Core BB84 Orchestrator

The heart of the backend: parses a sequence of instructions from the
frontend rail, builds a Qiskit QuantumCircuit dynamically for each
qubit, executes the simulation, and returns comprehensive results.

Instruction types (from frontend component labels):
  - 'alice'       → Alice prepares a qubit (random bit + basis)
  - 'H'           → Hadamard gate
  - 'X'           → Pauli-X gate
  - 'I'           → Identity (no-op)
  - 'X-ERR'       → Pauli-X bit-flip noise
  - 'Z-ERR'       → Pauli-Z phase-flip noise
  - 'ROT'         → Phase/Rotation gate (Rx, Ry)
  - 'ATTN'        → Attenuation node (photon loss check)
  - 'MEAS'        → Eve's Intercept-Resend measurement
  - 'CNOT'        → Eve's entanglement attack
  - 'SWAP'        → Eve's SWAP attack
  - 'DARK'        → Dark count injector
  - 'EFF'         → Efficiency filter
  - 'DET'         → Detector (acts like measurement)
  - 'POL'         → Polarizer
  - 'bob'         → Bob measures the qubit
"""

import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from typing import Any

from . import alice as alice_mod
from . import bob as bob_mod
from . import channel as channel_mod
from . import eve as eve_mod
from . import metrics
from . import key_manager


# ─────────────────────────────────────────────
#  Instruction → Gate mapping
# ─────────────────────────────────────────────

# Instructions that require Eve's ancilla qubit (2-qubit circuit)
NEEDS_ANCILLA = {'CNOT', 'SWAP'}


def _needs_ancilla(instructions: list[str]) -> bool:
    """Check if any instruction requires a 2-qubit circuit."""
    return any(instr.upper() in NEEDS_ANCILLA for instr in instructions)


def _apply_instruction(
    circuit: QuantumCircuit,
    instruction: str,
    params: dict[str, Any] | None = None,
) -> None:
    """
    Apply a single instruction to the circuit.

    This is the gate-level mapping from frontend component labels
    to actual Qiskit gate operations.
    """
    params = params or {}
    instr = instruction.upper()

    if instr == 'H':
        circuit.h(0)

    elif instr == 'X':
        circuit.x(0)

    elif instr == 'I':
        circuit.id(0)  # Identity — no effect

    elif instr == 'X-ERR':
        channel_mod.apply_pauli_x_noise(circuit)

    elif instr == 'Z-ERR':
        channel_mod.apply_pauli_z_noise(circuit)

    elif instr == 'ROT':
        rx = params.get('rx_angle', 0.1)
        ry = params.get('ry_angle', 0.1)
        channel_mod.apply_rotation(circuit, rx_angle=rx, ry_angle=ry)

    elif instr == 'ATTN':
        # Attenuation is handled at the simulation loop level (photon loss),
        # not as a gate. This is a marker; see run_simulation().
        pass

    elif instr == 'MEAS':
        eve_mod.intercept_resend_simple(circuit)

    elif instr == 'CNOT':
        eve_mod.entanglement_attack(circuit)

    elif instr == 'SWAP':
        eve_mod.swap_attack(circuit)

    elif instr == 'DARK':
        # Dark count: randomly flip the measurement bit with small probability
        # Modeled as a small X error just before measurement
        dark_rate = params.get('dark_count_rate', 0.001)
        if np.random.random() < dark_rate:
            circuit.x(0)

    elif instr == 'EFF':
        # Efficiency filter: like attenuation, chance the photon is lost
        # Handled at simulation loop level as a photon-loss check
        pass

    elif instr in ('DET', 'POL'):
        # Detector and Polarizer: functional markers
        # Detector triggers measurement (handled by Bob's measure)
        # Polarizer is implicitly handled by basis selection
        pass

    else:
        # Unknown instruction — skip silently
        pass


# ─────────────────────────────────────────────
#  Main Simulation Runner
# ─────────────────────────────────────────────

def run_simulation(
    instructions: list[str],
    num_qubits: int = 256,
    params: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Run a full BB84 simulation.

    Args:
        instructions: Ordered list of component labels from the frontend rail.
                      Must start with 'alice' and end with 'bob'.
        num_qubits:   Number of qubits (photon pulses) to simulate.
        params:       Optional per-instruction parameters, keyed by instruction.
                      e.g. {'ATTN': {'distance_km': 50, 'loss_db_per_km': 0.2},
                            'ROT': {'rx_angle': 0.05}}

    Returns:
        Dictionary containing:
          - alice_bits, alice_bases, bob_bits, bob_bases
          - sifted_key, matching_indices
          - qber, skr, efficiency
          - is_secure, verdict
          - rotating_key (hex string with TTL)
          - photons_lost, photons_arrived
          - raw_results (per-qubit measurement outcomes)
    """
    params = params or {}
    backend = AerSimulator()

    use_ancilla = _needs_ancilla(instructions)
    num_circuit_qubits = 2 if use_ancilla else 1
    num_classical_bits = 2 if use_ancilla else 1

    # Extract attenuation and efficiency filter parameters
    attn_params = params.get('ATTN', {'distance_km': 0, 'loss_db_per_km': 0.2})
    eff_params = params.get('EFF', {'efficiency': 1.0})

    has_attenuation = 'ATTN' in [i.upper() for i in instructions]
    has_efficiency = 'EFF' in [i.upper() for i in instructions]

    # ── Step 1: Alice generates random bits and bases ──
    alice_bits = alice_mod.generate_bits(num_qubits)
    alice_bases = alice_mod.generate_bases(num_qubits)
    bob_bases = bob_mod.generate_bases(num_qubits)

    # ── Step 2: Simulate each qubit independently ──
    bob_bits = np.zeros(num_qubits, dtype=int)
    photons_lost = 0
    photons_arrived = 0
    photon_survived = np.ones(num_qubits, dtype=bool)

    # Parse which instructions are "middle" gates (between alice and bob)
    # Strip alice from front and bob from back
    gate_instructions = []
    for instr in instructions:
        normalized = instr.upper()
        if normalized in ('ALICE', 'BOB', 'EVE'):
            continue
        gate_instructions.append(instr)

    for i in range(num_qubits):
        # ── Attenuation check (photon loss) ──
        if has_attenuation:
            dist = attn_params.get('distance_km', 50)
            loss = attn_params.get('loss_db_per_km', 0.2)
            if not channel_mod.apply_attenuation(dist, loss):
                photons_lost += 1
                photon_survived[i] = False
                continue  # Photon lost, skip this qubit

        # ── Efficiency filter ──
        if has_efficiency:
            eta = eff_params.get('efficiency', 0.9)
            if np.random.random() > eta:
                photons_lost += 1
                photon_survived[i] = False
                continue

        photons_arrived += 1

        # ── Build circuit for this qubit ──
        qc = QuantumCircuit(num_circuit_qubits, num_classical_bits)

        # Alice prepares her qubit
        alice_mod.prepare_qubit(qc, alice_bits[i], alice_bases[i])

        # Apply middle gates in order
        for instr in gate_instructions:
            instr_params = params.get(instr.upper(), {})
            _apply_instruction(qc, instr, instr_params)

        # Bob measures
        bob_mod.measure_qubit(qc, bob_bases[i])

        # ── Execute the circuit ──
        job = backend.run(qc, shots=1, memory=True)
        result = job.result()
        memory = result.get_memory()

        # Extract Bob's measurement result (rightmost bit in the bitstring)
        measured_bits = memory[0]
        bob_bits[i] = int(measured_bits[-1])  # Last char = qubit 0

    # ── Step 3: Key sifting and security evaluation ──
    # Only consider qubits that survived the channel
    survived_indices = np.where(photon_survived)[0]

    if len(survived_indices) > 0:
        key_result = key_manager.full_key_exchange(
            alice_bits[survived_indices],
            bob_bits[survived_indices],
            alice_bases[survived_indices],
            bob_bases[survived_indices],
        )
    else:
        key_result = key_manager.KeyResult(
            sifted_key=np.array([], dtype=int),
            matching_indices=np.array([], dtype=int),
            qber=1.0,
            is_secure=False,
            verdict="✗ No photons survived — channel too lossy",
        )

    # ── Step 4: Compute metrics ──
    sifted_count = len(key_result.sifted_key)
    efficiency = metrics.sifting_efficiency(sifted_count, num_qubits)
    skr = metrics.secret_key_rate(efficiency, key_result.qber)

    # ── Step 5: Generate rotating key (if secure) ──
    rotating_key = None
    if key_result.is_secure and sifted_count > 0:
        rotating_key = key_manager.rotate_key(key_result.sifted_key)

    # ── Build response ──
    return {
        'num_qubits': num_qubits,
        'instructions': instructions,

        # Raw data
        'alice_bits': alice_bits.tolist(),
        'alice_bases': alice_bases.tolist(),
        'bob_bits': bob_bits.tolist(),
        'bob_bases': bob_bases.tolist(),

        # Sifted key
        'sifted_key': key_result.sifted_key.tolist(),
        'sifted_key_length': sifted_count,
        'matching_indices': key_result.matching_indices.tolist(),

        # Metrics
        'qber': round(key_result.qber, 6),
        'qber_percent': round(key_result.qber * 100, 2),
        'secret_key_rate': round(skr, 6),
        'efficiency': round(efficiency, 4),
        'efficiency_percent': round(efficiency * 100, 2),

        # Channel stats
        'photons_sent': num_qubits,
        'photons_arrived': photons_arrived,
        'photons_lost': photons_lost,
        'transmission_rate': round(photons_arrived / num_qubits, 4) if num_qubits > 0 else 0,

        # Security verdict
        'is_secure': key_result.is_secure,
        'verdict': key_result.verdict,

        # Rotating key for password generator
        'rotating_key': {
            'key_hex': rotating_key.key_hex,
            'ttl_minutes': rotating_key.ttl_minutes,
            'created_at': rotating_key.created_at,
            'expires_at': rotating_key.expires_at,
        } if rotating_key else None,
    }


# ─────────────────────────────────────────────
#  CLI entry point for quick testing
# ─────────────────────────────────────────────

if __name__ == '__main__':
    import json

    print("=" * 60)
    print("BB84 Quantum Key Distribution — Simulation Engine")
    print("=" * 60)

    # Test 1: Clean channel (no Eve)
    print("\n── Test 1: Clean Channel (Alice → Bob) ──")
    result = run_simulation(
        instructions=['alice', 'bob'],
        num_qubits=256,
    )
    print(f"  QBER:       {result['qber_percent']}%")
    print(f"  SKR:        {result['secret_key_rate']}")
    print(f"  Efficiency: {result['efficiency_percent']}%")
    print(f"  Sifted Key: {result['sifted_key_length']} bits")
    print(f"  Verdict:    {result['verdict']}")

    # Test 2: Eve intercepts
    print("\n── Test 2: Eve Intercept-Resend ──")
    result_eve = run_simulation(
        instructions=['alice', 'MEAS', 'bob'],
        num_qubits=256,
    )
    print(f"  QBER:       {result_eve['qber_percent']}%")
    print(f"  SKR:        {result_eve['secret_key_rate']}")
    print(f"  Sifted Key: {result_eve['sifted_key_length']} bits")
    print(f"  Verdict:    {result_eve['verdict']}")

    # Test 3: Noisy fiber channel
    print("\n── Test 3: Fiber Channel with Attenuation ──")
    result_fiber = run_simulation(
        instructions=['alice', 'ATTN', 'bob'],
        num_qubits=256,
        params={'ATTN': {'distance_km': 100, 'loss_db_per_km': 0.2}},
    )
    print(f"  QBER:         {result_fiber['qber_percent']}%")
    print(f"  Photons Sent: {result_fiber['photons_sent']}")
    print(f"  Photons Lost: {result_fiber['photons_lost']}")
    print(f"  Transmission: {result_fiber['transmission_rate'] * 100:.1f}%")
    print(f"  Verdict:      {result_fiber['verdict']}")

    # Test 4: Full pipeline
    print("\n── Test 4: Full Pipeline (Alice → H → Fiber → Eve → H → Bob) ──")
    result_full = run_simulation(
        instructions=['alice', 'H', 'X-ERR', 'MEAS', 'H', 'bob'],
        num_qubits=256,
    )
    print(f"  QBER:       {result_full['qber_percent']}%")
    print(f"  SKR:        {result_full['secret_key_rate']}")
    print(f"  Verdict:    {result_full['verdict']}")
    print(f"\n  Full result JSON keys: {list(result_full.keys())}")
