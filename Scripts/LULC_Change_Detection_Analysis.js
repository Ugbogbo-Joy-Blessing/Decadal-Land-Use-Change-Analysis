// ==============================================================================
// 1. DEFINE REGION OF INTEREST 
// ==============================================================================
var nigeria = ee.FeatureCollection("FAO/GAUL/2015/level2");
var ikeja = nigeria.filter(ee.Filter.eq('ADM2_NAME', 'Ikeja'));
Map.centerObject(ikeja, 13);

// ==============================================================================
// 2. CLOUD MASKING, SCALING & SPECTRAL INDICES
// ==============================================================================
function prepLandsat(image) {
  var qa = image.select('QA_PIXEL');
  var cloudShadowBitMask = (1 << 4);
  var cloudsBitMask = (1 << 3);
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
    .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
    
  var maskedImage = image.updateMask(mask);
  var opticalBands = maskedImage.select('SR_B.').multiply(0.0000275).add(-0.2);
  var scaledImage = maskedImage.addBands(opticalBands, null, true);
  
  var ndvi = scaledImage.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI'); 
  var ndbi = scaledImage.normalizedDifference(['SR_B6', 'SR_B5']).rename('NDBI'); 
  var ui = scaledImage.normalizedDifference(['SR_B7', 'SR_B5']).rename('UI');     
  
  return scaledImage.addBands([ndvi, ndbi, ui]);
}

// ==============================================================================
// 3. CREATE ROBUST CLOUD-FREE COMPOSITES
// ==============================================================================
var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2").filterBounds(ikeja).map(prepLandsat);
var bands = ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7', 'NDVI', 'NDBI', 'UI'];

var image2016 = l8.filterDate('2015-01-01', '2017-12-31').median().select(bands).clip(ikeja);
var image2026 = l8.filterDate('2024-01-01', '2026-04-10').median().select(bands).clip(ikeja);

// ==============================================================================
// 4. TRAINING DATA GENERATION
// ==============================================================================
var worldCover = ee.ImageCollection("ESA/WorldCover/v200").first().clip(ikeja);
var remappedWC = worldCover.remap([10, 20, 30, 40, 50, 60, 80], [1, 1, 1, 1, 2, 3, 4]).rename('class');

var trainingPoints = remappedWC.stratifiedSample({
  numPoints: 300, classBand: 'class', region: ikeja, scale: 30, geometries: true
});

var imageTrain = l8.filterDate('2019-01-01', '2022-12-31').median().select(bands).clip(ikeja);
var trainingDataRaw = imageTrain.sampleRegions({
  collection: trainingPoints, properties: ['class'], scale: 30, tileScale: 4
});

var trainingData = trainingDataRaw.filter(ee.Filter.or(
  ee.Filter.and(ee.Filter.eq('class', 1), ee.Filter.gt('NDVI', 0.15)),
  ee.Filter.and(ee.Filter.eq('class', 2), ee.Filter.gt('NDBI', -0.1)),
  ee.Filter.eq('class', 3), ee.Filter.eq('class', 4)
));

var withRandom = trainingData.randomColumn('random');
var trainPartition = withRandom.filter(ee.Filter.lt('random', 0.7));
var testPartition = withRandom.filter(ee.Filter.gte('random', 0.7));

// ==============================================================================
// 5. TRAIN RANDOM FOREST AND CLASSIFY 
// ==============================================================================
var classifier = ee.Classifier.smileRandomForest(100).train({
  features: trainPartition, classProperty: 'class', inputProperties: bands
});

var classified2016 = image2016.classify(classifier);
var classified2026 = image2026.classify(classifier);

// ==============================================================================
// 6. ADVANCED ACCURACY ASSESSMENT
// ==============================================================================
var testClassified = testPartition.classify(classifier);
var confusionMatrix = testClassified.errorMatrix('class', 'classification');

print('1. Validation Confusion Matrix:', confusionMatrix);
print('2. Validation Overall Accuracy:', confusionMatrix.accuracy());
print('3. Validation Kappa Coefficient:', confusionMatrix.kappa());

// ==============================================================================
// 7. SMOOTHING & TOTAL AREA CALCULATIONS
// ==============================================================================
var smooth2016 = classified2016.focalMode({radius: 1, kernelType: 'square', units: 'pixels'});
var smooth2026 = classified2026.focalMode({radius: 1, kernelType: 'square', units: 'pixels'});

var classPalette = ['2ca02c', 'd62728', 'ff7f0e', '1f77b4'];
Map.addLayer(smooth2016, {min: 1, max: 4, palette: classPalette}, 'Smoothed LULC 2016', false);
Map.addLayer(smooth2026, {min: 1, max: 4, palette: classPalette}, 'Smoothed LULC 2026', false);

var area2016 = ee.Image.pixelArea().addBands(smooth2016).reduceRegion({
  reducer: ee.Reducer.sum().group({groupField: 1, groupName: 'class'}),
  geometry: ikeja, scale: 30, maxPixels: 1e10
});
print('4. Class Areas 2016 (Square Meters):', area2016);

var area2026 = ee.Image.pixelArea().addBands(smooth2026).reduceRegion({
  reducer: ee.Reducer.sum().group({groupField: 1, groupName: 'class'}),
  geometry: ikeja, scale: 30, maxPixels: 1e10
});
print('5. Class Areas 2026 (Square Meters):', area2026);

// ==============================================================================
// 8. THE LULC TRANSITION MAP (FROM-TO)
// ==============================================================================
var transitionMap = smooth2016.multiply(10).add(smooth2026);
var noChange = smooth2016.eq(smooth2026);
var actualChangeMap = transitionMap.updateMask(noChange.eq(0));

Map.addLayer(actualChangeMap, {min: 12, max: 43, palette: ['purple', 'yellow', 'cyan']}, 'All Changes');

var transitionArea = ee.Image.pixelArea().addBands(transitionMap).reduceRegion({
  reducer: ee.Reducer.sum().group({groupField: 1, groupName: 'transition_code'}),
  geometry: ikeja, scale: 30, maxPixels: 1e10
});
print('6. Transition Matrix Areas (Square Meters):', transitionArea);

// ==============================================================================
// 9. EXPORT FOR ARCGIS LAYOUT
// ==============================================================================
Export.image.toDrive({
  image: smooth2016.toInt(), description: 'Ikeja_LULC_2016_Smoothed', folder: 'GEE_Exports_Ikeja', scale: 30, region: ikeja, maxPixels: 1e10
});
Export.image.toDrive({
  image: smooth2026.toInt(), description: 'Ikeja_LULC_2026_Smoothed', folder: 'GEE_Exports_Ikeja', scale: 30, region: ikeja, maxPixels: 1e10
});
Export.image.toDrive({
  image: transitionMap.toInt(), description: 'Ikeja_Transition_Change_Map', folder: 'GEE_Exports_Ikeja', scale: 30, region: ikeja, maxPixels: 1e10
});