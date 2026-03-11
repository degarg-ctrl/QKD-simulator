"""
Bob Module — Receiver & Decoder

Handles Bob's random basis selection and final qubit measurement
for the BB84 protocol.
"""

import numpy as np
from qiskit import QuantumCircuit


def generate_bases(n: int) -> np.ndarray:
    """
    Generate n random basis choices for Bob.
      0 = rectilinear (+)
      1 = diagonal    (×)
    """
    return np.random.randint(0, 2, size=n)


def measure_qubit(circuit: QuantumCircuit, basis: int) -> None:
    """
    Measure qubit 0 in Bob's chosen basis.

    If basis == 1 (diagonal), apply H before measurement to rotate
    from the diagonal basis back to the computational basis.

    The measurement result is stored in classical register bit 0.
    """
    circuit.barrier()

    if basis == 1:
        circuit.h(0)  # Rotate diagonal → computational for measurement

    circuit.measure(0, 0)
