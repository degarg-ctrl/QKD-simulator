"""
BB84 QKD Simulator — FastAPI Backend

Provides a REST API for the React frontend to submit rail instructions
and receive simulation results.

Run with:
    uvicorn backend.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any

from .engine.simulator import run_simulation

app = FastAPI(
    title="QKD Simulator — BB84 Backend",
    description="Quantum Key Distribution simulation engine using Qiskit",
    version="1.0.0",
)

# Allow CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ──

class SimulationRequest(BaseModel):
    """Request body for /simulate endpoint."""
    instructions: list[str] = Field(
        ...,
        description="Ordered list of component labels from the frontend rail",
        examples=[["alice", "H", "ATTN", "bob"]],
    )
    num_qubits: int = Field(
        default=256,
        ge=1,
        le=10000,
        description="Number of qubits (photon pulses) to simulate",
    )
    params: dict[str, Any] = Field(
        default={},
        description="Optional per-instruction parameters",
    )


class SimulationResponse(BaseModel):
    """Response body from /simulate endpoint."""
    success: bool
    data: dict[str, Any] | None = None
    error: str | None = None


# ── Endpoints ──

@app.get("/")
async def root():
    """Health check."""
    return {
        "service": "QKD Simulator Backend",
        "protocol": "BB84",
        "status": "operational",
        "engine": "Qiskit AerSimulator",
    }


@app.post("/simulate", response_model=SimulationResponse)
async def simulate(request: SimulationRequest):
    """
    Run a BB84 QKD simulation.

    Accepts a list of rail instructions from the frontend and returns
    complete simulation results including QBER, SKR, sifted key, and
    security verdict.
    """
    try:
        result = run_simulation(
            instructions=request.instructions,
            num_qubits=request.num_qubits,
            params=request.params,
        )
        return SimulationResponse(success=True, data=result)

    except Exception as e:
        return SimulationResponse(
            success=False,
            error=f"{type(e).__name__}: {str(e)}",
        )


@app.get("/components")
async def list_components():
    """
    Return the list of available simulation components
    and their configurable parameters.
    """
    return {
        "components": [
            {
                "category": "Entities",
                "items": [
                    {"id": "alice", "label": "Alice", "description": "Sender — random bit/basis generation + qubit preparation"},
                    {"id": "bob", "label": "Bob", "description": "Receiver — basis selection + measurement"},
                    {"id": "eve", "label": "Eve", "description": "Eavesdropper — adversarial marker"},
                ],
            },
            {
                "category": "Gates & Modules",
                "items": [
                    {"id": "H", "label": "Hadamard", "description": "Switch between rectilinear/diagonal basis", "params": []},
                    {"id": "X", "label": "Pauli-X", "description": "NOT gate, set qubit to |1⟩", "params": []},
                    {"id": "I", "label": "Identity", "description": "No-op, ideal noiseless state", "params": []},
                    {"id": "X-ERR", "label": "X Error", "description": "Bit-flip noise (thermal)", "params": []},
                    {"id": "Z-ERR", "label": "Z Error", "description": "Phase-flip noise (decoherence)", "params": []},
                    {"id": "ROT", "label": "Rotation", "description": "Polarization drift", "params": ["rx_angle", "ry_angle"]},
                    {"id": "ATTN", "label": "Attenuation", "description": "Fiber loss model", "params": ["distance_km", "loss_db_per_km"]},
                    {"id": "MEAS", "label": "Measurement", "description": "Eve's Intercept-Resend attack", "params": []},
                    {"id": "CNOT", "label": "CNOT", "description": "Eve's entanglement attack", "params": []},
                    {"id": "SWAP", "label": "SWAP", "description": "Full qubit replacement", "params": []},
                    {"id": "DARK", "label": "Dark Count", "description": "Random dark count injection", "params": ["dark_count_rate"]},
                    {"id": "EFF", "label": "Efficiency", "description": "Detector efficiency filter", "params": ["efficiency"]},
                ],
            },
            {
                "category": "Infrastructure",
                "items": [
                    {"id": "DET", "label": "Detector", "description": "Single photon detector", "params": []},
                    {"id": "POL", "label": "Polarizer", "description": "Polarization filter", "params": []},
                ],
            },
        ]
    }
