#!/usr/bin/env python3
"""
Step 3: Enrich cleaned data with narrative content

- Load notable planet descriptions from narrative/notable-planets.json
- Merge with cleaned observational data
- Mark which fields are observed vs narrative

Input:  02-processed/step2-cleaned.csv
        narrative/notable-planets.json
Output: 03-enriched/planets-enriched.json
"""

import csv
import json
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent
INPUT_FILE = DATA_DIR / "02-processed" / "step2-cleaned.csv"
NARRATIVE_FILE = DATA_DIR / "narrative" / "notable-planets.json"
OUTPUT_DIR = DATA_DIR / "03-enriched"
OUTPUT_FILE = OUTPUT_DIR / "planets-enriched.json"

# Ensure output directory exists
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def parse_value(value, field_type='string'):
    """Parse a CSV value to the appropriate type."""
    if value is None or value == '' or value == 'None':
        return None
    if field_type == 'float':
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    if field_type == 'int':
        try:
            return int(float(value))
        except (ValueError, TypeError):
            return None
    return value


def generate_id(name):
    """Generate a stable ID from planet name."""
    return 'exo-' + name.lower().replace(' ', '-').replace('+', 'plus')


# Field types for parsing
FIELD_TYPES = {
    'period': 'float',
    'separation': 'float',
    'radius': 'float',
    'mass': 'float',
    'discoveryYear': 'int',
    'temperature': 'float',
    'density': 'float',
    'eccentricity': 'float',
    'insolation': 'float',
    'starTemperature': 'float',
    'starRadius': 'float',
    'starMass': 'float',
    'distance': 'float',
    'ra': 'float',
    'dec': 'float',
}


print(f"Reading cleaned data: {INPUT_FILE}")

# Load narrative content
narrative_data = {}
if NARRATIVE_FILE.exists():
    with open(NARRATIVE_FILE, 'r', encoding='utf-8') as f:
        narrative_json = json.load(f)
        narrative_data = narrative_json.get('planets', {})
    print(f"Loaded narrative for {len(narrative_data)} notable planets")
else:
    print("Warning: No narrative file found")

# Process planets
planets = []
notable_count = 0

with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)

    for row in reader:
        name = row['name']

        # Build planet object
        planet = {
            'id': generate_id(name),
            'name': name,
            'hostStar': row['hostStar'],
            'isSolarSystem': False,
        }

        # Add numeric fields
        for field, field_type in FIELD_TYPES.items():
            if field in row:
                planet[field] = parse_value(row[field], field_type)

        # Add string fields
        for field in ['massProvenance', 'detectionMethod', 'facility',
                      'starSpectralType', 'planetType']:
            if field in row:
                planet[field] = row[field] if row[field] else None

        # Track which fields are observed
        planet['_observed'] = {
            'period': planet.get('period') is not None,
            'mass': planet.get('mass') is not None,
            'radius': planet.get('radius') is not None,
            'temperature': planet.get('temperature') is not None,
            'separation': row.get('separation') is not None and row['separation'] != '',
        }

        # Add narrative content if available
        if name in narrative_data:
            notable_count += 1
            narrative = narrative_data[name]
            planet['_narrative'] = {
                'isNotable': narrative.get('isNotable', False),
                'notableReason': narrative.get('notableReason'),
                'description': narrative.get('description'),
                'sources': narrative.get('sources', []),
            }
        else:
            planet['_narrative'] = None

        planets.append(planet)

# Sort by discovery year, then name
planets.sort(key=lambda p: (p.get('discoveryYear') or 9999, p['name']))

# Output
output = {
    'metadata': {
        'processedDate': '2025-12-26',
        'planetCount': len(planets),
        'notableCount': notable_count,
        'step': 'enriched',
    },
    'planets': planets,
}

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2)

print(f"\nOutput: {OUTPUT_FILE}")
print(f"  Total planets: {len(planets):,}")
print(f"  Notable planets with narrative: {notable_count}")
