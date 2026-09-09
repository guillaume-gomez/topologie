import { Vector2, Shape, Color } from 'three';
import { useMemo, type ReactElement } from 'react';
import { animated, SpringValue } from '@react-spring/three';
//import WavyPhysicalMaterial from './Material/WavyPhysicalMaterial';


interface TopologyShapeProps {
    points: Vector2[];
    color: Color;
		position: [number, number, number];
    scale: SpringValue<number> | number;
    thickness?: number;
    opacity?: SpringValue<number>;
    optimized?: boolean;
};


function TopologyShape({ points, color, position, scale = new SpringValue(1), thickness = 1, opacity = new SpringValue(1), optimized = true  }: TopologyShapeProps): ReactElement {
	const shape = useMemo(() => {
    return new Shape(points);
  },
  [points]
  );

	const extrudeSettings = useMemo(() => ({
		depth: thickness,
		bevelEnabled: true,
    bevelThickness: thickness * 0.5,
    bevelSize: thickness * 0.5,
    bevelOffset: 0,
    bevelSegments: 10
	}), []);


  return (
    <animated.mesh
      position-x={position[0]}
      position-y={position[1]}
      position-z={position[2]}
      scale={scale}
      castShadow
      receiveShadow
      visible={opacity.to((v: number) => v > 0.001)}

    >
      <extrudeGeometry attach="geometry" args={[shape, extrudeSettings]} />
      {optimized ?
        <animated.meshLambertMaterial
          wireframe={false}
          color={color}
          emissive={"black"}
          opacity={opacity}
          transparent={true}
        />
        :
        <animated.meshPhysicalMaterial
          wireframe={false}
          opacity={opacity}
          transparent={true}
          color={color}
          emissive={"black"}
          roughness={1}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      }
      {/*<meshNormalMaterial/>*/}
      {/*<WavyPhysicalMaterial
        color={color}
        emissive={"black"}
        roughness={1.}
        metalness={0.1}
        amplitude={4}
        frequency={10}
      />*/}
    </animated.mesh>
  );
};

export default TopologyShape;
