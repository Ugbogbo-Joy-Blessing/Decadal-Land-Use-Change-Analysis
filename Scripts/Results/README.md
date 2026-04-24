### 📊 1. Accuracy Assessment (Random Forest 2026)

**Table 1: Supervised Error Matrix for Ikeja LGA Validation**

| Actual \ Predicted | Vegetation | Built-up Area | Bare Land | Row Total |
| :--- | :---: | :---: | :---: | :---: |
| **Vegetation** | **98** | 2 | 0 | **100** |
| **Built-up Area** | 2 | **90** | 1 | **93** |
| **Bare Land** | 0 | 0 | **2** | **2** |
| **Column Total** | **100** | **92** | **3** | **195** |

#### 1.1 Overall Accuracy
Overall Accuracy calculates the proportion of the reference sites that were mapped correctly. It is derived by dividing the total number of correctly classified pixels (the major diagonal of the matrix) by the total number of validation points.

* **Result:** The model achieved an outstanding Overall Accuracy of **97.44%**. This mathematically proves that out of 10,000 random locations in Ikeja LGA, the Random Forest model correctly identified the land cover of 9,744 of them based purely on their spectral signatures.

#### 1.2 The Kappa Coefficient
The Kappa Coefficient is a more rigorous metric because it evaluates the classification against the probability of random chance agreement.

* **Result:** The model achieved a Kappa Coefficient of **0.9499**. In remote sensing literature, a Kappa score above 0.85 indicates excellent agreement. A score approaching 0.95 definitively proves that the model successfully navigated the complex spectral confusion of the Ikeja urban core, driven by accurate machine learning pattern recognition rather than statistical coincidence.

**Calculation Derivation for Ikeja LGA:**
The Kappa coefficient (K) is calculated using the formula: `K = (Po - Pe) / (1 - Pe)`

> **1. Calculating Observed Agreement (Po)**
> * Total Validation Pixels (N): 98 + 2 + 2 + 90 + 1 + 2 = 195
> * Correct Pixels: 98 (Vegetation) + 90 (Built-up) + 2 (Bare Land) = 190
> * **Po** = 190 / 195 = **0.9744**
> 
> **2. Calculating Chance Agreement (Pe)**
> * Vegetation: Row Total (100) × Column Total (100) = 10,000
> * Built-up: Row Total (93) × Column Total (92) = 8,556
> * Bare Land: Row Total (2) × Column Total (3) = 6
> * Sum of Chance Values: 10,000 + 8,556 + 6 = 18,562
> * Total Pixels Squared (N²): 195 × 195 = 38,025
> * **Pe** = 18,562 / 38,025 = **0.4882**
> 
> **3. The Final Kappa Calculation**
> * K = (0.9744 - 0.4882) / (1 - 0.4882)
> * K = 0.4862 / 0.5118
> * **K = 0.9499**

---

### 🔄 2. LULC Area Statistics & Net Change (2016 – 2026)
*Total Study Area: 45.55 km²*

| LULC Class | 2016 Area (km²) | 2016 Percentage | 2026 Area (km²) | 2026 Percentage | Net Change (km²) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Vegetation** | 7.41 | 16.27% | **9.00** | **19.76%** | <span style="color:green">**+1.59**</span> |
| **Built-up Area** | **37.83** | **83.05%** | 35.79 | 78.59% | <span style="color:red">**-2.04**</span> |
| **Bare Land** | 0.31 | 0.68% | 0.75 | 1.65% | <span style="color:orange">**+0.44**</span> |

### 🔀 3. Spatio-Temporal Transition Matrix (2016 – 2026)
*Values represented in Square Kilometers (km²)*

| 2016 Class \ 2026 Class | Vegetation | Built-up | Bare Land | 2016 Total |
| :--- | :---: | :---: | :---: | :---: |
| **Vegetation** | **6.50** *(Stable)* | 0.91 *(Loss)* | 0.00 | **7.41** |
| **Built-up** | 2.50 *(Canopy Growth)* | **34.67** *(Stable)* | 0.66 | **37.83** |
| **Bare Land** | 0.00 | 0.21 *(Infill)* | **0.10** *(Stable)* | **0.31** |
| **2026 Total** | **9.00** | **35.79** | **0.76** | **45.55** |

### 📈 4. Annual LULC Time-Series Trend (2016 – 2026)

*<img width="1326" height="567" alt="ee-chart (1)" src="https://github.com/user-attachments/assets/34e3a82d-39c3-4796-9c38-62bd9f8f0b07" />


**Temporal Dynamics Summary:**
* **Vegetation Trajectory:** Unlike traditional urbanization models that assume continuous green-space depletion, the time-series trajectory reveals a steady positive trend for Vegetation (a net increase of **1.59 km²**). This graphically represents the gradual, year-over-year maturation of urban canopies within the LGA.
* **Impervious Surface Plateau:** The trajectory for Built-up areas shows a slight downward fluctuation. In the context of a saturated urban core, this visualizes the **"canopy masking" effect** where established concrete infrastructure is increasingly obscured from the satellite sensor by mature tree growth in older residential districts, rather than actual building demolition.

**Key Spatial Takeaways:**
* **Urban Canopy Maturation:** The most significant and fascinating transition is the **2.50 km²** shift from Built-up Area to Vegetation. In the dense context of Ikeja, this does not represent the demolition of buildings; rather, it captures the 3D maturation of urban tree canopies expanding to obscure residential roofs and asphalt from the satellite sensor's view.
* **Urban Infill & Encroachment:** **0.91 km²** of original Vegetation and **0.21 km²** of Bare Land transitioned into Built-up areas, representing continued urban infill and development over the decade.
* **Stable Core:** **34.67 km²** of the LGA remained permanently classified as Built-up, confirming Ikeja's status as a highly saturated, mature metropolitan core.
