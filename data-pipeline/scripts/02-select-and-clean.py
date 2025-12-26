#!/usr/bin/env python3
"""
Step 2: Select relevant columns, map detection methods, clean data

- Select only columns needed for visualization
- Map detection methods to visualization categories
- Handle missing values
- Calculate derived fields (separation from period if missing)
- Classify planet types

Input:  02-processed/step1-defaults-only.csv
Output: 02-processed/step2-cleaned.csv
"""

import csv
import math
from pathlib import Path
from collections import Counter

# Paths
SCRIPT_DIR = Path(__file__).parent
INPUT_DIR = SCRIPT_DIR.parent / "02-processed"
OUTPUT_DIR = INPUT_DIR

input_file = INPUT_DIR / "step1-defaults-only.csv"
output_file = OUTPUT_DIR / "step2-cleaned.csv"

# Column mapping: archive name -> output name
COLUMN_MAP = {
    'pl_name': 'name',
    'hostname': 'hostStar',
    'pl_orbper': 'period',
    'pl_orbsmax': 'separation',
    'pl_rade': 'radius',
    'pl_bmasse': 'mass',
    'pl_bmassprov': 'massProvenance',
    'discoverymethod': 'detectionMethod',
    'disc_year': 'discoveryYear',
    'disc_facility': 'facility',
    'pl_eqt': 'temperature',
    'pl_dens': 'density',
    'pl_orbeccen': 'eccentricity',
    'pl_insol': 'insolation',
    'st_spectype': 'starSpectralType',
    'st_teff': 'starTemperature',
    'st_rad': 'starRadius',
    'st_mass': 'starMass',
    'sy_dist': 'distance',
    'ra': 'ra',
    'dec': 'dec',
}

# Detection method mapping
# Transit will be split based on facility
DETECTION_METHOD_MAP = {
    'Transit': 'transit',  # Will be refined below
    'Radial Velocity': 'radial-velocity',
    'Microlensing': 'microlensing',
    'Imaging': 'direct-imaging',
    'Astrometry': 'astrometry',
    'Transit Timing Variations': 'transit-other',
    'Eclipse Timing Variations': 'other',
    'Pulsar Timing': 'other',
    'Orbital Brightness Modulation': 'other',
    'Pulsation Timing Variations': 'other',
    'Disk Kinematics': 'other',
}

# Kepler/K2 facilities
KEPLER_FACILITIES = {'Kepler', 'K2', 'Kepler/K2'}


def parse_float(value):
    """Safely parse a float, returning None for empty/invalid values."""
    if value is None or value == '' or value == 'nan':
        return None
    try:
        f = float(value)
        return None if math.isnan(f) else f
    except (ValueError, TypeError):
        return None


def calculate_separation(period_days, star_mass_solar=1.0):
    """Calculate semi-major axis from period using Kepler's third law."""
    if period_days is None:
        return None
    # a^3 = (P/365.25)^2 * M_star (in AU, days, solar masses)
    period_years = period_days / 365.25
    return (period_years ** 2 * star_mass_solar) ** (1/3)


def map_detection_method(method, facility):
    """Map archive detection method to visualization category."""
    if method == 'Transit':
        # Check if Kepler/K2
        if facility and any(k in facility for k in KEPLER_FACILITIES):
            return 'transit-kepler'
        else:
            return 'transit-other'
    return DETECTION_METHOD_MAP.get(method, 'other')


def classify_planet(mass, radius, period):
    """Classify planet type based on mass, radius, and period."""
    # If we have neither mass nor radius, can't classify
    if mass is None and radius is None:
        return 'unknown'

    # Use mass if available, otherwise estimate from radius
    m = mass
    r = radius if radius else (mass ** 0.28 if mass and mass < 10 else None)

    if m is None and r is not None:
        # Estimate mass from radius (rough)
        if r < 1.5:
            m = r ** 3.3
        else:
            m = r ** 2.1 * 2

    if m is None:
        return 'unknown'

    # Ultra-short period: P < 1 day and small
    if period and period < 1 and m < 10:
        return 'ultra-short-period'

    # Hot Jupiter: massive + short period
    if m > 100 and period and period < 10:
        return 'hot-jupiter'

    # Cold Jupiter: massive + long period
    if m > 100:
        return 'cold-jupiter'

    # Neptune-like: 10-50 Earth masses
    if m >= 10 and m < 50:
        return 'neptune-like'

    # Sub-Neptune: by radius 2-4 Earth radii
    if r and r >= 2 and r < 4:
        return 'sub-neptune'

    # Super-Earth: 2-10 Earth masses, smaller radius
    if m >= 2 and m < 10:
        return 'super-earth'

    # Rocky: < 2 Earth masses
    if m < 2:
        return 'rocky'

    return 'sub-neptune'  # Default


# Process
print(f"Reading: {input_file}")

stats = {
    'total': 0,
    'missing_period': 0,
    'missing_mass': 0,
    'missing_radius': 0,
    'calculated_separation': 0,
}
detection_methods = Counter()
planet_types = Counter()

output_fields = list(COLUMN_MAP.values()) + ['planetType']

with open(input_file, 'r', encoding='utf-8') as infile:
    reader = csv.DictReader(infile)

    with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=output_fields)
        writer.writeheader()

        for row in reader:
            stats['total'] += 1

            # Parse numeric fields
            period = parse_float(row.get('pl_orbper'))
            mass = parse_float(row.get('pl_bmasse'))
            radius = parse_float(row.get('pl_rade'))
            separation = parse_float(row.get('pl_orbsmax'))
            star_mass = parse_float(row.get('st_mass'))

            # Skip planets without period (can't visualize)
            if period is None:
                stats['missing_period'] += 1
                continue

            # Calculate separation if missing
            if separation is None and period is not None:
                separation = calculate_separation(period, star_mass or 1.0)
                if separation:
                    stats['calculated_separation'] += 1

            if mass is None:
                stats['missing_mass'] += 1
            if radius is None:
                stats['missing_radius'] += 1

            # Map detection method
            method = map_detection_method(
                row.get('discoverymethod', ''),
                row.get('disc_facility', '')
            )
            detection_methods[method] += 1

            # Classify planet type
            planet_type = classify_planet(mass, radius, period)
            planet_types[planet_type] += 1

            # Build output row
            out_row = {
                'name': row.get('pl_name', ''),
                'hostStar': row.get('hostname', ''),
                'period': period,
                'separation': separation,
                'radius': radius,
                'mass': mass,
                'massProvenance': row.get('pl_bmassprov', ''),
                'detectionMethod': method,
                'discoveryYear': row.get('disc_year', ''),
                'facility': row.get('disc_facility', ''),
                'temperature': parse_float(row.get('pl_eqt')),
                'density': parse_float(row.get('pl_dens')),
                'eccentricity': parse_float(row.get('pl_orbeccen')),
                'insolation': parse_float(row.get('pl_insol')),
                'starSpectralType': row.get('st_spectype', ''),
                'starTemperature': parse_float(row.get('st_teff')),
                'starRadius': parse_float(row.get('st_rad')),
                'starMass': star_mass,
                'distance': parse_float(row.get('sy_dist')),
                'ra': parse_float(row.get('ra')),
                'dec': parse_float(row.get('dec')),
                'planetType': planet_type,
            }

            writer.writerow(out_row)

print(f"\nOutput: {output_file}")

print(f"\n=== Processing Stats ===")
print(f"  Total input rows: {stats['total']:,}")
print(f"  Skipped (no period): {stats['missing_period']:,}")
print(f"  Output rows: {stats['total'] - stats['missing_period']:,}")
print(f"  Missing mass: {stats['missing_mass']:,}")
print(f"  Missing radius: {stats['missing_radius']:,}")
print(f"  Calculated separation: {stats['calculated_separation']:,}")

print(f"\n=== Detection Methods (mapped) ===")
for method, count in detection_methods.most_common():
    print(f"  {method}: {count:,}")

print(f"\n=== Planet Types ===")
for ptype, count in planet_types.most_common():
    print(f"  {ptype}: {count:,}")
