#!/usr/bin/env python3
"""
Step 1: Extract default parameter sets from NASA Exoplanet Archive

Filters the raw CSV to only include:
- default_flag = 1 (canonical parameter set)
- pl_controv_flag = 0 (non-controversial detections)

Input:  01-raw/NASA-Exoplanet-Archive_PS_*.csv
Output: 02-processed/step1-defaults-only.csv

Uses only standard library (no pandas required).
"""

import csv
from pathlib import Path
from collections import Counter

# Paths
SCRIPT_DIR = Path(__file__).parent
RAW_DIR = SCRIPT_DIR.parent / "01-raw"
OUTPUT_DIR = SCRIPT_DIR.parent / "02-processed"

# Find the raw CSV file
csv_files = list(RAW_DIR.glob("NASA-Exoplanet-Archive_PS_*.csv"))
if not csv_files:
    raise FileNotFoundError(f"No NASA archive CSV found in {RAW_DIR}")

input_file = csv_files[0]
print(f"Reading: {input_file.name}")

# Read and filter
rows_total = 0
rows_default = 0
rows_output = 0
planet_names = set()
discovery_methods = Counter()
discovery_years = []

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
output_file = OUTPUT_DIR / "step1-defaults-only.csv"

with open(input_file, 'r', encoding='utf-8') as infile:
    # Skip comment lines
    lines = (line for line in infile if not line.startswith('#'))
    reader = csv.DictReader(lines)

    # Get header
    fieldnames = reader.fieldnames

    with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()

        for row in reader:
            rows_total += 1

            # Filter: default_flag = 1
            if row.get('default_flag') != '1':
                continue
            rows_default += 1

            # Filter: not controversial
            if row.get('pl_controv_flag') == '1':
                continue

            # Write row
            writer.writerow(row)
            rows_output += 1

            # Track stats
            planet_names.add(row['pl_name'])
            discovery_methods[row.get('discoverymethod', 'Unknown')] += 1
            year = row.get('disc_year')
            if year:
                try:
                    discovery_years.append(int(float(year)))
                except ValueError:
                    pass

print(f"\n=== Filtering Results ===")
print(f"Total rows (all parameter sets): {rows_total:,}")
print(f"Rows with default_flag=1: {rows_default:,}")
print(f"After removing controversial: {rows_output:,}")
print(f"Unique planet names: {len(planet_names):,}")

# Check for duplicates
if rows_output != len(planet_names):
    print(f"WARNING: Row count ({rows_output}) != unique planets ({len(planet_names)})")

print(f"\nOutput: {output_file}")

print("\n=== Detection Method Distribution ===")
for method, count in discovery_methods.most_common():
    print(f"  {method}: {count:,}")

if discovery_years:
    print(f"\n=== Discovery Year Range ===")
    print(f"  Earliest: {min(discovery_years)}")
    print(f"  Latest: {max(discovery_years)}")
