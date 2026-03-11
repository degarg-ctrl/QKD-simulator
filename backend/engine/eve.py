"""
Eve Module — Adversarial Eavesdropping Attacks

Implements three attack strategies:
  1. Intercept-Resend  — measure in random basis, re-prepare
  2. CNOT Entanglement — entangle an ancilla qubit
  3. SWAP              — full qubit replacement
"""

import numpy as np
from qiskit import QuantumCircuit


def intercept_resend(circuit: QuantumCircuit) -> int:
    """
    Intercept-Resend attack.

    Eve measures the qubit in a randomly chosen basis, learns a (potentially
    wrong) bit value, then re-prepares the qubit in that basis.

    This is done gate-level (no mid-circuit measurement) by:
      1. Choose a random basis (0=rectilinear, 1=diagonal)
      2. If diagonal: apply H before measuring conceptually
      3. Measure → collapse → re-prepare

    Since Qiskit AerSimulator handles this per-shot, we simulate Eve's
    disruption by resetting the qubit and re-encoding with her guess.

    Returns Eve's measured bit (for logging/analysis).
    """
    eve_basis = np.random.randint(0, 2)

    # --- Measure in Eve's basis ---
    # We add a barrier to separate Alice's prep from Eve's interception
    circuit.barrier()

    if eve_basis == 1:
        circuit.h(0)  # Rotate to diagonal basis before measurement

    # Measure and reset
    circuit.measure(0, 0)
    circuit.reset(0)

    # --- Re-prepare based on Eve's measurement outcome ---
    # Since measurement outcome is probabilistic per-shot, we use
    # an if_test to conditionally re-prepare (Qiskit dynamic circuits)
    # For simplicity in gate-level sim, we re-insert the basis rotation:
    # The measured classical bit is in creg[0]. Re-prepare:
    # If measured 1 → apply X, then apply basis rotation
    with circuit.if_test((0, 1)):
        circuit.x(0)

    if eve_basis == 1:
        circuit.h(0)  # Rotate back to Eve's guessed basis

    circuit.barrier()
    return eve_basis


def intercept_resend_simple(
    circuit: QuantumCircuit,
    eve_basis: int | None = None,
) -> int:
    """
    Simplified Intercept-Resend for per-qubit classical simulation.

    Instead of using mid-circuit measurement, this function:
      1. Applies H if Eve chooses diagonal basis
      2. Measures
      3. Resets and re-prepares

    This version is designed for the single-shot-per-circuit approach
    where we build a fresh circuit for each qubit.
    """
    if eve_basis is None:
        eve_basis = np.random.randint(0, 2)

    circuit.barrier()

    # Rotate into Eve's measurement basis
    if eve_basis == 1:
        circuit.h(0)

    # Measure → collapses the state
    circuit.measure(0, 0)

    # Reset and re-prepare based on measurement outcome
    circuit.reset(0)
    with circuit.if_test((0, 1)):
        circuit.x(0)

    # Rotate back from Eve's basis
    if eve_basis == 1:
        circuit.h(0)

    circuit.barrier()
    return eve_basis


def entanglement_attack(circuit: QuantumCircuit) -> None:
    """
    CNOT Entanglement attack.

    Eve introduces an ancilla qubit and entangles it with Alice's qubit
    using a CNOT gate. This allows Eve to later measure her ancilla to
    gain information about the key bit.

    Note: This requires expanding the circuit to 2 qubits.
    The second qubit (index 1) is Eve's ancilla.
    """
    # Ensure circuit has at least 2 qubits for the ancilla
    if circuit.num_qubits < 2:
        # We can't dynamically add qubits to an existing circuit easily,
        # so this attack must be planned at circuit-creation time.
        # The simulator.py handles this by creating a 2-qubit circuit
        # when Eve's CNOT is in the instruction list.
        raise ValueError(
            "CNOT attack requires a 2-qubit circuit. "
            "Ensure the simulator creates QuantumCircuit(2, 2) when "
            "Eve's CNOT is present in the instruction sequence."
        )

    circuit.barrier()
    circuit.cx(0, 1)  # Entangle: Alice's qubit controls Eve's ancilla
    circuit.barrier()


def swap_attack(circuit: QuantumCircuit) -> None:
    """
    SWAP attack — Eve replaces Alice's qubit entirely.

    Eve swaps Alice's qubit with her own prepared qubit (ancilla at index 1).
    This effectively replaces the transmitted quantum state.
    """
    if circuit.num_qubits < 2:
        raise ValueError(
            "SWAP attack requires a 2-qubit circuit. "
            "Ensure the simulator creates QuantumCircuit(2, 2)."
        )

    circuit.barrier()
    circuit.swap(0, 1)
    circuit.barrier()
