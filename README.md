# Multitemporal LULC Change Detection (2016–2026)

## 🎯 Objective
This project monitors land use and land cover (LULC) dynamics over a 10-year period in Ikeja local government area,lagos,Nigeria. The goal was to quantify urban expansion and environmental shifts using automated cloud-based geospatial analysis.

## 🛰️ Data Sources & Tools
- **Data:** Landsat 8 and Landsat 9 OLI/TIRS Surface Reflectance (Collection 2 Level 2).
- **Platform:** Google Earth Engine (JavaScript API),ArcGIS.
- **Study Period:** 2016 – 2026 (Annual monitoring + Decadal transition analysis).

## 📂 Repository Structure
- **/Scripts**: Contains JavaScript code for annual LULC classification and decadal transition mapping.
- **/Results**: Contains exported classification maps and statistical change matrices.

## 📊 Key Methodology
The workflow utilizes  [e.e Random Forest] algorithm. I developed two distinct scripts:
1. **Annual Series:** To observe year-on-year spatial trends.
2. **Transition Analysis:** A direct comparison between 2016 and 2026 to calculate net gains and losses in land classes.

## 📈 Major Findings (2016 vs 2026)
- **Built-up Area:** decreased by 4.46%.
- **Vegetation/Forestry:** increased by 3.49%.
- **Overall Accuracy:** 0.97% (Kappa Coefficient: 0.95.
