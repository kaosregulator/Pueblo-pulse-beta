/**
 * Every source the Pueblo data hub serves. To add one: write a
 * SourceDefinition (most Pueblo GIS layers are one arcgisLayer call) and add
 * it to this list. The map's layer drawer picks it up from /api/pueblo/sources
 * with no front-end change.
 */
import { arcgisLayer, PUEBLO_COUNTY_GIS } from "./sources/arcgis";
import { cotripConstruction, cotripIncidents } from "./sources/cotrip";
import { streamGauges } from "./sources/water";
import { airQuality, nwsAlerts, nwsObservation } from "./sources/weather";
import { transitRoutes, transitStops, transitVehicles } from "./transit/sources";
import type { SourceDefinition } from "./types";

const OPENGOV = `${PUEBLO_COUNTY_GIS}/Miscellaneous/PuebloCounty_OpenGovLayers/MapServer`;

export const PUEBLO_SOURCES: SourceDefinition[] = [
  // Live conditions
  nwsObservation,
  airQuality,
  transitVehicles,
  transitRoutes,
  transitStops,
  cotripIncidents,
  cotripConstruction,

  // Geographic information
  arcgisLayer({
    id: "city-limits",
    name: "City limits",
    category: "geo",
    description: "The City of Pueblo boundary",
    color: "#c2410c",
    service: `${PUEBLO_COUNTY_GIS}/Hosted/DBO_CityLimits1/FeatureServer`,
    simplifyM: 5,
    defaultOn: true,
  }),
  arcgisLayer({
    id: "parks",
    name: "Parks",
    category: "geo",
    description: "City and county parks",
    color: "#15803d",
    service: `${PUEBLO_COUNTY_GIS}/Landbase/PuebloCounty_Parks/MapServer`,
    layerId: 1,
    outFields: ["PARK_NAME", "ACRES"],
    nameProperty: "PARK_NAME",
    simplifyM: 2,
  }),
  arcgisLayer({
    id: "trails",
    name: "Trails",
    category: "geo",
    description: "Riverwalk, river trails and park paths",
    color: "#65a30d",
    service: `${PUEBLO_COUNTY_GIS}/Transportation/PuebloCounty_Trails/MapServer`,
    simplifyM: 2,
  }),
  arcgisLayer({
    id: "bike-routes",
    name: "Bike routes",
    category: "geo",
    description: "Signed bicycle routes and bike lanes",
    color: "#0d9488",
    service: `${PUEBLO_COUNTY_GIS}/Transportation/PuebloCounty_BicycleRoutesTrails/MapServer`,
    simplifyM: 2,
  }),
  arcgisLayer({
    id: "council-districts",
    name: "City council districts",
    category: "geo",
    description: "Pueblo City Council districts",
    color: "#6d28d9",
    service: `${PUEBLO_COUNTY_GIS}/Landbase/PuebloCity_CityCouncilDistricts/MapServer`,
    simplifyM: 5,
  }),
  arcgisLayer({
    id: "zoning",
    name: "Zoning",
    category: "geo",
    description: "City zoning districts",
    color: "#a16207",
    service: `${PUEBLO_COUNTY_GIS}/Hosted/ZoningDistricts/FeatureServer`,
    simplifyM: 5,
    maxFeatures: 8000,
  }),
  arcgisLayer({
    id: "future-land-use",
    name: "Future land use",
    category: "geo",
    description: "Pueblo County future land use plan (2022 update)",
    color: "#b45309",
    service: OPENGOV,
    layerId: 6,
    simplifyM: 10,
  }),
  arcgisLayer({
    id: "railroads",
    name: "Railroads",
    category: "geo",
    description: "Rail lines through Pueblo",
    color: "#57534e",
    service: `${PUEBLO_COUNTY_GIS}/Transportation/PuebloCounty_Railroads/MapServer`,
    simplifyM: 5,
  }),

  // Public safety and environment
  nwsAlerts,
  streamGauges,
  arcgisLayer({
    id: "floodplains",
    name: "Flood zones",
    category: "safety",
    description: "FEMA 100-year floodplains",
    color: "#2563eb",
    service: OPENGOV,
    layerId: 9,
    simplifyM: 5,
  }),
  arcgisLayer({
    id: "fire-districts",
    name: "Fire protection districts",
    category: "safety",
    description: "Which fire district covers each area",
    color: "#b91c1c",
    service: OPENGOV,
    layerId: 12,
    simplifyM: 10,
  }),
];
