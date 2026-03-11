"""
Channel Module — Physical Fiber Optic Impairments

Simulates realistic noise and loss in a quantum channel:
  - Bit-flip noise (Pauli-X errors from thermal interference)
  - Phase-flip noise (Pauli-Z errors from fiber decoherence)
  - Attenuation / photon loss (distance-dependent)
  - Polarization drift / rotation (Rx, Ry)
"""

import numpy as np
from qiskit import QuantumCircuit


def _error_probability(distance_km: float, error_rate_per_km: float = 0.01) -> float:
    """
    Compute the probability of a single error event over a given distance.
    Uses the depolarizing model: p = 1 - e^(-λ·d)
    Clamped to [0, 0.5] to remain physically meaningful.
    """
    p = 1.0 - np.exp(-error_rate_per_km * distance_km)
    return min(p, 0.5)


def apply_fiber_noise(
    circuit: QuantumCircuit,
    distance_km: float = 50.0,
    bit_flip_rate: float = 0.005,
    phase_flip_rate: float = 0.005,
) -> None:
    """
    Apply probabilistic Pauli-X (bit-flip) and Pauli-Z (phase-flip)
    noise to qubit 0 based on fiber distance.

    In a real Qiskit noise model you'd use a NoiseModel, but for our
    gate-level simulation we probabilistically insert X and Z gates
    to model the channel errors deterministically per shot.
    """
    p_x = _error_probability(distance_km, bit_flip_rate)
    p_z = _error_probability(distance_km, phase_flip_rate)

    if np.random.random() < p_x:
        circuit.x(0)  # Bit-flip error
    if np.random.random() < p_z:
        circuit.z(0)  # Phase-flip error


def apply_pauli_x_noise(circuit: QuantumCircuit) -> None:
    """Apply a deterministic bit-flip (X) error — for manual rail placement."""
    circuit.x(0)


def apply_pauli_z_noise(circuit: QuantumCircuit) -> None:
    """Apply a deterministic phase-flip (Z) error — for manual rail placement."""
    circuit.z(0)


def apply_rotation(
    circuit: QuantumCircuit,
    rx_angle: float = 0.0,
    ry_angle: float = 0.0,
) -> None:
    """
    Apply rotation gates to simulate polarization drift or fiber twisting.
    Rx(θ) and Ry(θ) rotate around the X and Y axes respectively.
    """
    if rx_angle != 0.0:
        circuit.rx(rx_angle, 0)
    if ry_angle != 0.0:
        circuit.ry(ry_angle, 0)


def photon_survival_probability(
    distance_km: float,
    loss_db_per_km: float = 0.2,
) -> float:
    """
    Calculate the probability that a photon survives transmission.
    Uses the fiber attenuation model:
      P_survive = 10^(-loss_dB_per_km · distance / 10)

    Typical values:
      - Standard fiber: 0.2 dB/km at 1550nm
      - Short-range: 0.35 dB/km at 1310nm
    """
    total_loss_db = loss_db_per_km * distance_km
    return 10.0 ** (-total_loss_db / 10.0)


def apply_attenuation(distance_km: float, loss_db_per_km: float = 0.2) -> bool:
    """
    Determine if a photon survives the channel.
    Returns True if the photon arrives, False if lost.
    """
    p_survive = photon_survival_probability(distance_km, loss_db_per_km)
    return np.random.random() < p_survive
