import { useState, useEffect } from "react";
import { Vector2, Color } from "three";
import { createNoise2D } from 'simplex-noise';
import { lerpColors } from "../colorUtils";

interface TopographyProps {
  width: number;
  height: number;
  numberOfLayers: number;
  fromToColors?: [string, string];
}

interface Point {
  x: number;
  y: number;
}

export interface Shape {
  color: Color;
  points: Vector2[];
  elevation: number;
}

const COLORS_SAMPLE = [
"#F05D5E",
"#0F7173",
"#E7ECEF",
"#272932",
"#D8A47F",
"#CA2E55",
"#FFE0B5",
"#8A6552",
"#462521",
"#BDB246",
"#394053",
"#4E4A59",
"#6E6362",
"#839073",
"#7CAE7A"
]

function mapRange (n: number, start1: number, stop1: number, start2: number, stop2: number) : number {
  return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
}

function useTopography({ width, height, numberOfLayers, fromToColors } : TopographyProps) {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [frequency, _setFrequency] = useState<number>(0.5);
  const [minRadiusRatio, _setMinRadiusRatio] = useState<number>(0.7);
  const [maxRadiusRatio, _setMaxRadiusRatio] = useState<number>(1.1);

  useEffect(() => {
    generate();
  }, [width, height, numberOfLayers])

  function generateRandomPolygon(radius: number, width: number, height: number, numPoints: number): [Point[], number] {
      if (numPoints < 3) throw new Error("Needs at least 3 points to create a shape");

      const simplex = new (createNoise2D as any)();
      const points = [];
      const step = (Math.PI * 2)/ numPoints;
      let minRadius = radius * (maxRadiusRatio - 0.1);

      for (let m = 0; m < Math.PI * 2; m += step) {
        const noiseValue = simplex(
          Math.cos(m) * frequency,
          Math.sin(m) * frequency
        );

        // Convertir le bruit (-1 à 1) en variation de rayon (0.7 à 1.3)
        const noisyRadius = mapRange(noiseValue, -1, 1, minRadiusRatio, maxRadiusRatio) * radius;

        const x = Math.cos(m) * noisyRadius;
        const y = Math.sin(m) * noisyRadius;
        points.push({x, y});

        if(noisyRadius < minRadius) {
          minRadius = noisyRadius;
        }

      }
      return [centeredPoints(points, width/2, height/2), minRadius];
  }

  // function generateSquaredRandomPolygon(radius: number, numPoints: number = 8): [Point[], number] {
  //   if (numPoints < 2) throw new Error("Needs at least 2 points to create a shape");

  //   const simplex = new (createNoise2D as any)();
  //   const points = [];
  //   let minRadius = radius * (maxRadiusRatio - 0.1);

  //   const step = (Math.PI /2)/(numPoints - 2); // push 2 points at the end
  //   for (let m = 0; m < Math.PI/2; m += step) {
  //       const noiseValue = simplex(
  //         Math.cos(m) * frequency,
  //         Math.sin(m) * frequency
  //       );
  //       const noisyRadius = mapRange(noiseValue, -1, 1, minRadiusRatio, maxRadiusRatio) * radius;

  //       const x = Math.cos(m) * noisyRadius;
  //       const y = Math.sin(m) * noisyRadius;
  //       points.push({x, y});

  //       if(noisyRadius < minRadius) {
  //         minRadius = noisyRadius;
  //       }
  //   }
  //   const lastPointAdded = points[points.length -1];

  //   points.push({x: 0, y: lastPointAdded.y})
  //   points.push({x: 0, y: 0})
  //   return [points, minRadius];
  // }

  function generate(): Shape[] {
    const shapes = [];
    let radius = width/2 //width for generateSquaredRandomPolygon;
    const offset = maxRadiusRatio;
    for(let elevation = 0; elevation < numberOfLayers; elevation++) {
      const [shapePoints, newRadius] = generateRandomPolygon(
        radius,
        width,
        height,
        100,
      );

      // const [shapePoints, newRadius] = generateSquaredRandomPolygon(
      //   radius,
      //   100,
      // );

      const shape = {
        color: colorByElevation(elevation),
        points: shapePoints.map(point => new Vector2(point.x, point.y)),
        elevation
      }

      shapes.push(shape);
      radius = Math.max(1, newRadius - offset);
    }
    setShapes(shapes);
    return shapes;
  }

  function centeredPoints(points: Point[], offsetX: number, offsetY: number) {
    return points.map(point => ({ x: point.x + offsetX, y: point.y + offsetY }) );
  }

  function colorByElevation(number: number): Color {
    if(fromToColors) {
      const colors = lerpColors(fromToColors[0], fromToColors[1], numberOfLayers);
      return new Color(...colors[number % colors.length]);
    }

    return new Color(COLORS_SAMPLE[number % COLORS_SAMPLE.length])
  }

  return { generate, shapes };
}

export default useTopography;