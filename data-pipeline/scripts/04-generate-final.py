#!/usr/bin/env python3
"""
Step 4: Generate final visualization-ready JSON

- Add metadata with source attribution
- Validate required fields
- Generate statistics summary
- Output final JSON for visualization

Input:  03-enriched/planets-enriched.json
Output: 04-final/exoplanets.json
        04-final/STATS.md
"""

import json
from pathlib import Path
from collections import Counter
from datetime import datetime

# Paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent
INPUT_FILE = DATA_DIR / "03-enriched" / "planets-enriched.json"
OUTPUT_DIR = DATA_DIR / "04-final"
OUTPUT_FILE = OUTPUT_DIR / "exoplanets.json"
STATS_FILE = OUTPUT_DIR / "STATS.md"

# Ensure output directory exists
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print(f"Reading enriched data: {INPUT_FILE}")

with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

planets = data['planets']

# Validation and statistics
stats = {
    'total': len(planets),
    'with_mass': 0,
    'with_radius': 0,
    'with_temperature': 0,
    'with_narrative': 0,
    'detection_methods': Counter(),
    'planet_types': Counter(),
    'discovery_years': Counter(),
    'facilities': Counter(),
}

valid_planets = []
issues = []

for planet in planets:
    # Required fields check
    if not planet.get('period'):
        issues.append(f"{planet['name']}: missing period")
        continue

    # Count statistics
    if planet.get('mass'):
        stats['with_mass'] += 1
    if planet.get('radius'):
        stats['with_radius'] += 1
    if planet.get('temperature'):
        stats['with_temperature'] += 1
    if planet.get('_narrative'):
        stats['with_narrative'] += 1

    stats['detection_methods'][planet.get('detectionMethod', 'unknown')] += 1
    stats['planet_types'][planet.get('planetType', 'unknown')] += 1
    stats['discovery_years'][planet.get('discoveryYear', 'unknown')] += 1

    facility = planet.get('facility', 'Unknown')
    if facility:
        # Simplify facility names
        if 'Kepler' in facility:
            facility = 'Kepler'
        elif 'K2' in facility:
            facility = 'K2'
        elif 'TESS' in facility:
            facility = 'TESS'
        elif 'HARPS' in facility:
            facility = 'HARPS'
        stats['facilities'][facility] += 1

    valid_planets.append(planet)

# Build final output
output = {
    'metadata': {
        'source': 'NASA Exoplanet Archive',
        'sourceUrl': 'https://exoplanetarchive.ipac.caltech.edu/',
        'dataTable': 'Planetary Systems (PS)',
        'downloadDate': '2025-12-26',
        'processedDate': datetime.now().strftime('%Y-%m-%d'),
        'pipelineVersion': '1.0.0',
        'planetCount': len(valid_planets),
        'citation': 'NASA Exoplanet Archive, operated by Caltech under contract with NASA',
    },
    'planets': valid_planets,
}

# Write final JSON
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2)

print(f"\nOutput: {OUTPUT_FILE}")
print(f"  Total planets: {len(valid_planets):,}")

# Generate statistics report
stats_md = f"""# Exoplanet Dataset Statistics

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Overview

| Metric | Count |
|--------|-------|
| Total planets | {stats['total']:,} |
| With mass measurement | {stats['with_mass']:,} ({100*stats['with_mass']/stats['total']:.1f}%) |
| With radius measurement | {stats['with_radius']:,} ({100*stats['with_radius']/stats['total']:.1f}%) |
| With temperature estimate | {stats['with_temperature']:,} ({100*stats['with_temperature']/stats['total']:.1f}%) |
| With narrative description | {stats['with_narrative']:,} |

## Detection Methods

| Method | Count | Percentage |
|--------|-------|------------|
"""

for method, count in stats['detection_methods'].most_common():
    pct = 100 * count / stats['total']
    stats_md += f"| {method} | {count:,} | {pct:.1f}% |\n"

stats_md += """
## Planet Types

| Type | Count | Percentage |
|------|-------|------------|
"""

for ptype, count in stats['planet_types'].most_common():
    pct = 100 * count / stats['total']
    stats_md += f"| {ptype} | {count:,} | {pct:.1f}% |\n"

stats_md += """
## Top Discovery Facilities

| Facility | Count |
|----------|-------|
"""

for facility, count in stats['facilities'].most_common(10):
    stats_md += f"| {facility} | {count:,} |\n"

stats_md += """
## Discovery Timeline

| Decade | Count |
|--------|-------|
"""

decade_counts = Counter()
for year, count in stats['discovery_years'].items():
    if isinstance(year, int):
        decade = (year // 10) * 10
        decade_counts[decade] += count

for decade in sorted(decade_counts.keys()):
    stats_md += f"| {decade}s | {decade_counts[decade]:,} |\n"

if issues:
    stats_md += f"""
## Data Issues

{len(issues)} planets excluded:

"""
    for issue in issues[:20]:
        stats_md += f"- {issue}\n"
    if len(issues) > 20:
        stats_md += f"- ... and {len(issues) - 20} more\n"

with open(STATS_FILE, 'w', encoding='utf-8') as f:
    f.write(stats_md)

print(f"Stats report: {STATS_FILE}")

# Summary
print(f"\n=== Final Dataset ===")
print(f"  Planets: {len(valid_planets):,}")
print(f"  With mass: {stats['with_mass']:,}")
print(f"  With radius: {stats['with_radius']:,}")
print(f"  Notable: {stats['with_narrative']:,}")
