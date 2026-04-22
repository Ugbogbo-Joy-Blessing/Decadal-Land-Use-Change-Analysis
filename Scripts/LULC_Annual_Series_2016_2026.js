// ==============================================================================
// 1. REGION & PREPARATION
// ==============================================================================
var nigeria = ee.FeatureCollection("FAO/GAUL/2015/level2");
var ikeja = nigeria.filter(ee.Filter.eq('ADM2_NAME', 'Ikeja'));
Map.centerObject(ikeja, 13);

function prepLandsat(image) {
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(1 << 4).eq(0).and(qa.bitwiseAnd(1 << 3).eq(0));
  var scaled = image.updateMask(mask).addBands(image.updateMask(mask).select('SR_B.').multiply(0.0000275).add(-0.2), null, true);
  return scaled.addBands([
    scaled.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI'),
    scaled.normalizedDifference(['SR_B6', 'SR_B5']).rename('NDBI'),
    scaled.normalizedDifference(['SR_B7', 'SR_B5']).rename('UI')
  ]);
}

var l8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2").filterBounds(ikeja).map(prepLandsat);
var bands = ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7', 'NDVI', 'NDBI', 'UI'];

// ==============================================================================
// 2. TRAINING DATA 
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

var classifier = ee.Classifier.smileRandomForest(100).train({
  features: trainingData, classProperty: 'class', inputProperties: bands
});

// ==============================================================================
// 3. THE TIME-SERIES LOOP
// ==============================================================================
var startYear = 2016;
var endYear = 2026;
var yearsList = ee.List.sequence(startYear, endYear);

var annualStats = ee.FeatureCollection(yearsList.map(function(year) {
  var startDate = ee.Date.fromYMD(year, 1, 1).advance(-1, 'year'); 
  var endDate = ee.Date.fromYMD(year, 12, 31);
  
  var annualImg = l8.filterDate(startDate, endDate).median().select(bands).clip(ikeja);
  var classified = annualImg.classify(classifier);
  var smooth = classified.focalMode({radius: 1, kernelType: 'square', units: 'pixels'});
  
  var areaImage = ee.Image.pixelArea().updateMask(smooth.eq(2));
  var areaSqMeters = areaImage.reduceRegion({
    reducer: ee.Reducer.sum(), geometry: ikeja, scale: 30, maxPixels: 1e10
  }).get('area');
  
  return ee.Feature(null, {
    'Year': year,
    'Built_Up_Area_SqKm': ee.Number(areaSqMeters).divide(1e6)
  });
}));

var chart = ui.Chart.feature.byFeature(annualStats, 'Year', 'Built_Up_Area_SqKm')
  .setOptions({
    title: 'Ikeja LGA: Annual Urban Expansion (2016-2026)',
    hAxis: {title: 'Year', format: '####'},
    vAxis: {title: 'Built-up Area (Square Kilometers)'},
    lineWidth: 2, pointSize: 5, colors: ['#d62728'] 
  });
print(chart);

// ==============================================================================
// 4. GENERATE 11 EXPORT TASKS
// ==============================================================================
for (var y = startYear; y <= endYear; y++) {
  var sDate = ee.Date.fromYMD(y, 1, 1).advance(-1, 'year');
  var eDate = ee.Date.fromYMD(y, 12, 31);
  
  var img = l8.filterDate(sDate, eDate).median().select(bands).clip(ikeja);
  var classMap = img.classify(classifier).focalMode({radius: 1, kernelType: 'square', units: 'pixels'});
  
  Export.image.toDrive({
    image: classMap.toInt(), 
    description: 'Ikeja_LULC_' + y,
    folder: 'GEE_Annual_Exports_Ikeja',
    scale: 30,
    region: ikeja,
    maxPixels: 1e10
  });
}