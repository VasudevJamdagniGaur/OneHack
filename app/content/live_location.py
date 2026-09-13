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


def nearest_help() -> dict[str, Any]:
    origin = "Netaji Subhas University of Technology, Sector 3, Dwarka, New Delhi"
    return {
        "based_on": "NSUT, Sector 3, Dwarka",
        "origin": origin,
        "places": [
            {
                "id": "venkateshwar",
                "name": "Venkateshwar Super Speciality Hospital",
                "detail": "Sector 18, Dwarka",
                "kind": "hospital",
                "action": "navigate",
                "query": "Venkateshwar Hospital, Sector 18A, Dwarka, New Delhi",
                "source_name": "Venkateshwar Hospital",
                "source_url": "https://www.venkateshwarhospitals.com/contact-us.php",
            },
            {
                "id": "dwarka-north-ps",
                "name": "Police Station Dwarka North",
                "detail": "Sector 17, Dwarka",
                "kind": "police",
                "action": "navigate",
                "query": "Dwarka North Police Station, Sector 17, Dwarka, New Delhi",
                "source_name": "District South West police list",
                "source_url": "https://dmsouthwest.delhi.gov.in/police/",
            },
            {
                "id": "dwarka-fire",
                "name": "Fire Station Dwarka",
                "detail": "Sector 6, Dwarka",
                "kind": "fire",
                "action": "navigate",
                "query": "Fire Station Dwarka, Sector 6, Dwarka, New Delhi",
            },
            {
                "id": "rain-basera",
                "name": "Rain Basera",
                "detail": "Sector 12, Dwarka",
                "kind": "shelter",
                "action": "view",
                "query": "Rain Basera, Sector 12, Dwarka, New Delhi",
            },
            {
                "id": "emergency-112",
                "name": "Emergency",
                "detail": "112",
                "kind": "emergency",
                "action": "call",
                "tel": "tel:112",
                "source_name": "Emergency Response Support System",
                "source_url": "https://112.gov.in/",
            },
            {
                "id": "nsut-support",
                "name": "NSUT Campus Support",
                "detail": "011-2509-9017",
                "kind": "campus",
                "action": "call",
                "tel": "tel:+911125099017",
                "source_name": "NSUT contact page",
                "source_url": "http://www.nsut.ac.in/index.php/en/contact-us",
            },
        ],
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
