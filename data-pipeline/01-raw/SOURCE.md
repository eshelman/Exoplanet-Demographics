# Data Source Documentation

## File
`NASA-Exoplanet-Archive_PS_2025.12.26_07.44.02.csv`

## Source
NASA Exoplanet Archive - Planetary Systems Table (PS)
https://exoplanetarchive.ipac.caltech.edu/

## Download Details
- **Date**: December 26, 2025, 07:44:02 UTC
- **Table**: Planetary Systems (PS)
- **Format**: CSV with header comments

## Query Parameters
Full table download including all columns and all parameter sets (not just defaults).

## Record Counts
- **Total rows**: 39,505 (parameter sets from multiple publications)
- **Unique planets**: 6,065 (confirmed exoplanets)
- **Default parameter sets**: 6,065 (rows where `default_flag=1`)

## Key Columns for Deduplication
- `default_flag`: 1 = recommended parameter set, 0 = alternative measurement
- `pl_controv_flag`: 0 = confirmed, 1 = controversial

## Archive Documentation
- Column definitions: https://exoplanetarchive.ipac.caltech.edu/docs/API_PS_columns.html
- Data access: https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=PS

## Citation
When using this data, cite:
> NASA Exoplanet Archive, which is operated by the California Institute of Technology,
> under contract with the National Aeronautics and Space Administration under the
> Exoplanet Exploration Program.
