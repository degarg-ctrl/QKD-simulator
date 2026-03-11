"""
Alice Module — Sender & Key Generator

Handles random bit generation, random basis selection,
and qubit state preparation for the BB84 protocol.
"""

import numpy as np
from qiskit import QuantumCircuit


def generate_bits(n: int) -> np.ndarray:
    """Generate n random classical bits (0 or 1)."""
    return np.random.randint(0, 2, size=n)


def generate_bases(n: int) -> np.ndarray:
    """
    Generate n random basis choices.
      0 = rectilinear (+)  → {|0⟩, |1⟩}
      1 = diagonal    (×)  → {|+⟩, |−⟩}
    """
    return np.random.randint(0, 2, size=n)


def prepare_qubit(circuit: QuantumCircuit, bit: int, basis: int) -> None:
    """
    Prepare a single qubit on circuit[0] according to Alice's bit and basis.

    Encoding table:
      bit=0, basis=0 → |0⟩         (rectilinear, value 0)
      bit=1, basis=0 → |1⟩         (rectilinear, value 1)
      bit=0, basis=1 → |+⟩ = H|0⟩  (diagonal,    value 0)
      bit=1, basis=1 → |−⟩ = H|1⟩  (diagonal,    value 1)

    Steps:
      1. If bit == 1 → apply X gate to flip |0⟩ → |1⟩
      2. If basis == 1 → apply H gate to rotate into diagonal basis
    """
    if bit == 1:
        circuit.x(0)
    if basis == 1:
        circuit.h(0)
