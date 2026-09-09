import { useContext } from 'react';
import TopologyShape from './TopologyShape';
import TopologyLine from "./TopologyLine";
import { useSpring } from '@react-spring/three';

import { SettingsContext } from "../../context/SettingsContextWrapper";
import { SoundsContext } from "../../context/SoundsContextWrapper";

import { type Shape } from "../hooks/useTopography";

interface TopographyWrapperProps {
  shape: Shape;
  optimized: boolean;
}

const Thickness = 2.5;
const OriginalPosition = 400;

function TopographyWrapper({ shape, optimized } : TopographyWrapperProps) {
  const {
    isLight,
    timerSwitch,
    timerGeneration,
    numberOfLayers,
    setAnimationState,
    animationState
  } = useContext(SettingsContext);

  const {
    playTopographyPieceSound,
    stopTopographyPieceSound
  } = useContext(SoundsContext);
  
  const shapeToDisplay = useSpring({
    opacity: isLight ? 1.0 : 0.0,
    config: { duration: timerSwitch}
  });

  const lineToDisplay = useSpring({
    opacity: isLight ? 0.0 : 1.0,
    config: { duration: timerSwitch}
  });

  const durationByLayer = timerGeneration / numberOfLayers;

  const [springPosition, ] = useSpring(() => {
      // ugly hack because useSprings 10.0.3 rerun everytime Scene props changes
      if(animationState === "ended") {
        return { y: shape.elevation * (Thickness * 2.), delay: shape.elevation * durationByLayer };
      }

      return {
        from: { y: OriginalPosition },
        to: async (next, _cancel) => {
          await next({ y: OriginalPosition, immediate: true });
          await next({ y: shape.elevation * (Thickness * 2.), delay: shape.elevation * durationByLayer });
        },
        config: {
          duration: durationByLayer
        },
        onStart:() => {
          if(shape.elevation === 0) {
            setAnimationState("started");
          }
        },
        onRest: () => {
          if(shape.elevation === numberOfLayers-1) {
            setAnimationState("ended");
          }
          stopTopographyPieceSound();
          playTopographyPieceSound();
        },
        reset: true,
        delay: 1000
      }
    },
    [animationState]
  );


  return (
    <>
      <TopologyShape
        points={shape.points}
        color={shape.color}
        position={[0, 0, springPosition.y as unknown as number]}
        //position={[0, 0, shape.elevation * Thickness]}
        thickness={Thickness}
        opacity={shapeToDisplay.opacity}
        optimized={optimized}
      />
      <TopologyLine
        points={shape.points}
        color={shape.color}
        position={[0, 0, springPosition.y as unknown as number]}
        //position={[0, 0, shape.elevation * Thickness]}
        thickness={Thickness * 0.5}
        opacity={lineToDisplay.opacity}
      />
    </>
  );
}

export default TopographyWrapper;