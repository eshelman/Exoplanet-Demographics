# Exoplanet Data Pipeline

Transforms NASA Exoplanet Archive data into visualization-ready JSON.

## Quick Start

```bash
# Run the full pipeline
python scripts/01-extract-defaults.py
python scripts/02-select-and-clean.py
python scripts/03-enrich-narrative.py
python scripts/04-generate-final.py

# Copy to visualization
cp 04-final/exoplanets.json ../public/data/
```

## Directory Structure

```
data-pipeline/
├── 01-raw/           # Untouched source data from NASA
├── 02-processed/     # Intermediate processing steps
├── 03-enriched/      # Data with narrative additions
├── 04-final/         # Ready for visualization
├── scripts/          # Python processing scripts
└── narrative/        # Editorial content (sourced)
```

## Pipeline Steps

1. **Extract Defaults** - Filter to canonical parameter sets (`default_flag=1`)
2. **Select & Clean** - Choose relevant columns, handle missing values
3. **Enrich** - Add narrative content for notable planets
4. **Generate Final** - Create visualization-ready JSON

## Updating Data

1. Download fresh CSV from NASA Exoplanet Archive
2. Place in `01-raw/` with timestamped filename
3. Update `01-raw/SOURCE.md` with download details
4. Re-run pipeline scripts
5. Review changes in `04-final/`

## Data Provenance

All data clearly marked:
- `_observed`: Fields from NASA archive
- `_narrative`: Editorial additions with sources

See `01-raw/SOURCE.md` for full citation requirements.
