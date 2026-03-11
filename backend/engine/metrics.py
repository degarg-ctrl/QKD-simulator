"""
Metrics Module — Security & Performance Calculations

Implements:
  - QBER (Quantum Bit Error Rate)
  - Binary entropy H(p)
  - Secret Key Rate (SKR)
  - Sifting efficiency
"""

import numpy as np


def compute_qber(
    alice_bits: np.ndarray,
    bob_bits: np.ndarray,
    matching_indices: np.ndarray,
) -> float:
    """
    Compute the Quantum Bit Error Rate (QBER).

    QBER = (number of mismatched bits) / (total bits compared)

    Only compares bits where Alice and Bob chose the same basis
    (the "sifted" key positions).

    Returns 0.0 if no matching indices exist.
    """
    if len(matching_indices) == 0:
        return 0.0

    alice_sifted = alice_bits[matching_indices]
    bob_sifted = bob_bits[matching_indices]

    errors = np.sum(alice_sifted != bob_sifted)
    return float(errors) / len(matching_indices)


def binary_entropy(p: float) -> float:
    """
    Binary entropy function H(p).

    H(p) = -p·log₂(p) - (1-p)·log₂(1-p)

    Edge cases:
      H(0) = 0, H(1) = 0, H(0.5) = 1
    """
    if p <= 0.0 or p >= 1.0:
        return 0.0
    return -p * np.log2(p) - (1 - p) * np.log2(1 - p)


def secret_key_rate(sifted_rate: float, qber: float) -> float:
    """
    Compute the Secret Key Rate (SKR).

    R = S · [1 - 2·H(Q)]

    Where:
      S = sifted key rate (bits per second or fraction of total)
      Q = QBER
      H = binary entropy function

    Returns 0.0 if the key rate would be negative (completely insecure).
    """
    rate = sifted_rate * (1.0 - 2.0 * binary_entropy(qber))
    return max(0.0, rate)


def sifting_efficiency(sifted_count: int, total_count: int) -> float:
    """
    Compute sifting efficiency.

    Efficiency = sifted_count / total_count

    In ideal BB84, this is ~50% since Alice and Bob each choose
    randomly from 2 bases.
    """
    if total_count == 0:
        return 0.0
    return float(sifted_count) / total_count
