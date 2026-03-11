"""
Key Manager Module — Sifting, Security Evaluation & Key Rotation

Handles:
  - Key sifting (basis comparison, discard mismatches)
  - Security threshold evaluation (QBER vs 11%)
  - Key rotation with 20-minute TTL for password generator
"""

import time
import hashlib
import numpy as np
from typing import NamedTuple

from .metrics import compute_qber


class KeyResult(NamedTuple):
    """Result of a key exchange round."""
    sifted_key: np.ndarray
    matching_indices: np.ndarray
    qber: float
    is_secure: bool
    verdict: str


class RotatingKey(NamedTuple):
    """A key with time-to-live metadata."""
    key_hex: str
    created_at: float
    expires_at: float
    ttl_minutes: int
    is_valid: bool


def sift_keys(
    alice_bits: np.ndarray,
    bob_bits: np.ndarray,
    alice_bases: np.ndarray,
    bob_bases: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Perform key sifting: compare bases, keep only matching positions.

    In BB84, Alice and Bob publicly announce their basis choices (but NOT
    their bit values). They discard all positions where bases differ.

    Returns:
      matching_indices — array of indices where bases matched
      sifted_key — Alice's bits at matching positions (the raw key)
    """
    matching_indices = np.where(alice_bases == bob_bases)[0]
    sifted_key = alice_bits[matching_indices]
    return matching_indices, sifted_key


def evaluate_security(qber: float, threshold: float = 0.11) -> tuple[bool, str]:
    """
    Evaluate the security of the key based on QBER.

    BB84 Security Threshold:
      - QBER ≤ 11% → Secure key, safe to use
      - QBER > 11% → Insecure, eavesdropping likely, discard batch

    Returns (is_secure, verdict_string).
    """
    if qber <= threshold:
        return True, f"✓ SECURE — QBER {qber:.2%} ≤ {threshold:.0%} threshold"
    else:
        return False, f"✗ INSECURE — QBER {qber:.2%} > {threshold:.0%} threshold. Key discarded."


def full_key_exchange(
    alice_bits: np.ndarray,
    bob_bits: np.ndarray,
    alice_bases: np.ndarray,
    bob_bases: np.ndarray,
    threshold: float = 0.11,
) -> KeyResult:
    """
    Perform a complete key exchange evaluation:
      1. Sift keys (basis comparison)
      2. Compute QBER on sifted key
      3. Evaluate security against threshold
    """
    matching_indices, sifted_key = sift_keys(
        alice_bits, bob_bits, alice_bases, bob_bases
    )

    qber = compute_qber(alice_bits, bob_bits, matching_indices)
    is_secure, verdict = evaluate_security(qber, threshold)

    return KeyResult(
        sifted_key=sifted_key,
        matching_indices=matching_indices,
        qber=qber,
        is_secure=is_secure,
        verdict=verdict,
    )


def rotate_key(
    sifted_key: np.ndarray,
    rotation_minutes: int = 20,
) -> RotatingKey:
    """
    Create a rotating key with a 20-minute TTL for the password generator.

    The raw sifted key bits are hashed (SHA-256) to produce a fixed-length
    hexadecimal key suitable for use as a password seed.

    Returns a RotatingKey with creation time, expiration, and validity.
    """
    now = time.time()
    expires = now + rotation_minutes * 60

    # Convert bit array to bytes, then hash
    key_bytes = np.packbits(sifted_key).tobytes()
    key_hex = hashlib.sha256(key_bytes).hexdigest()

    return RotatingKey(
        key_hex=key_hex,
        created_at=now,
        expires_at=expires,
        ttl_minutes=rotation_minutes,
        is_valid=True,
    )


def check_key_validity(key: RotatingKey) -> bool:
    """Check if a rotating key is still within its TTL window."""
    return time.time() < key.expires_at
