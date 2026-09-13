"""Fixed Live Monitor location. Not a browser fix and not a live observation."""

from __future__ import annotations

from typing import Any


def live_location() -> dict[str, Any]:
    return {
        "id": "delhi",
        "name": "Delhi",
        "country": "India",
        "display": "Delhi, India",
        "district": "New Delhi",
        "lat": 28.6139,
        "lon": 77.2090,
        "anchor": "Central Delhi viewing point. Not a GPS fix.",
        "source": "Fixed product location. Not browser geolocation. Not a live flood observation.",
        "classification": "selected",
        "river_context": "Delhi flood operations track the Yamuna. No live gauge reading is connected.",
        "river_source_name": "Irrigation and Flood Control Department, GNCTD",
        "river_source_url": "https://ifc.delhi.gov.in/ifc/organizational-setup",
    }


def emergency_contacts() -> list[dict[str, Any]]:
    """Published Delhi and national numbers only. No facility coordinates."""
    return [
        {
            "id": "erss-112",
            "role": "Emergency",
            "number": "112",
            "tel": "tel:112",
            "source_name": "Emergency Response Support System",
            "source_url": "https://112.gov.in/",
            "scope": "National",
            "classification": "published",
        },
        {
            "id": "ddma-1077",
            "role": "Disaster management",
            "number": "1077",
            "tel": "tel:1077",
            "source_name": "District New Delhi disaster page",
            "source_url": "https://dmnewdelhi.delhi.gov.in/disaster-management/",
            "scope": "Delhi, 24x7 disaster helpline",
            "classification": "published",
        },
        {
            "id": "police-100",
            "role": "Police",
            "number": "100",
            "tel": "tel:100",
            "source_name": "District Outer North helpline page",
            "source_url": "https://dmouternorth.delhi.gov.in/helpline/",
            "scope": "Listed on a Delhi district helpline page",
            "classification": "published",
        },
        {
            "id": "ambulance-102",
            "role": "Ambulance",
            "number": "102",
            "tel": "tel:102",
            "source_name": "District Outer North helpline page",
            "source_url": "https://dmouternorth.delhi.gov.in/helpline/",
            "scope": "Listed on a Delhi district helpline page",
            "classification": "published",
        },
        {
            "id": "fire-101",
            "role": "Fire and rescue",
            "number": "101",
            "tel": "tel:101",
            "source_name": "District Outer North helpline page",
            "source_url": "https://dmouternorth.delhi.gov.in/helpline/",
            "scope": "Listed on a Delhi district helpline page",
            "classification": "published",
        },
        {
            "id": "ifc-flood-room",
            "role": "Flood control room",
            "number": "011-21210867",
            "tel": "tel:+911121210867",
            "source_name": "Irrigation and Flood Control Department",
            "source_url": "https://ifc.delhi.gov.in/ifc/organizational-setup",
            "scope": "Delhi Central Flood Control Room",
            "classification": "published",
        },
    ]
