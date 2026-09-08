import { useEffect, useContext, useMemo, type CSSProperties } from 'react';
import { SettingsContext } from "./context/SettingsContextWrapper";
import { SceneContext } from "./context/SceneContextWrapper";
import { animated, easings, useTransition, type AnimatedProps } from '@react-spring/web';
import ColorBlobInput from "./components/ColorBlobInput";
import ChooseColor from "./ChooseColor";
import ThreejsRenderer from './components/threeJs/ThreeJsRenderer';
import useTopographies from "./hooks/useTopographies";
import ProgressButton from "./components/ProgressButton";
import useTopography from "./hooks/useTopography";
import Card from "./components/Card";
import ParallaxTilt from "./components/ParallaxTilt";

type AnimationProps = AnimatedProps<CSSProperties>

function App() {
  const {
    grid,
    isLight,
    setLight,
    width,
    height,
    numberOfLayers,
    setColorFrom,
    setColorTo,
    setNumberOfLayers,
    setAnimationState,
    colorFrom,
    colorTo,
    hasSingleTopograhy,
  } = useContext(SettingsContext);
  const {
    setSceneName,
    isColorChoose,
    isIntro,
    is3DScene,
  } = useContext(SceneContext);

  const { generate: generateTopographies, shapes: shapesTopographies } = useTopographies({
    grid,
    width,
    height,
    numberOfLayers,
    fromToColors: [colorFrom, colorTo]
  });

  const { generate: generateTopography, shapes: shapesTopography } = useTopography({
    width,
    height,
    numberOfLayers,
    fromToColors: [colorFrom, colorTo]
  });

  useEffect(() => {
    setSceneName("intro")
  }, []);

  const shapes = useMemo(() => hasSingleTopograhy ? shapesTopography : shapesTopographies,
    [hasSingleTopograhy, shapesTopography, shapesTopographies]
    );


  const transitionIntroProps  = useTransition(
      isIntro() ? [1] : [],
      {
        from: { position: "relative", top: "-100%", display: "flex" },
        enter: { position: "relative", top: "0%", display: "flex" },
        leave: { position: "relative", top: "-100%", display: "flex" },
        config: { duration: 500, easing: easings.easeInBack },
      }
  );

  const transitionChooseColorProps  = useTransition(
      isColorChoose() ? [2] : [],
      {
        from: { position: "relative", top: "-100%", display: "block" },
        enter: { position: "relative", top: "0%", display: "block" },
        leave: { position: "relative", top: "-100%", display: "block" },
        config: { duration: 500, easing: easings.easeInBack },
      }
  );

  const transitionThreeJsRendererProps  = useTransition(
      is3DScene() ? [3] : [],
      {
        from: { position: "relative", opacity: 0.3, top: "-100%", display: "none" },
        enter: { position: "relative", opacity: 1, top: "0%", display: "block" },
        config: { duration: 500, easing: easings.easeOutBack  },
      }
  );

  function onGenerate() {
    if(hasSingleTopograhy) {
      generateTopography();
    } else {
      generateTopographies();
    }
    setAnimationState("started")
  }

  return (
    <>
      <div className="
        absolute -z-10 inset-0 h-full w-full
        bg-[linear-gradient(to_right,#73737320_1px,#03030349_1px),linear-gradient(to_bottom,#73737320_1px,#03030349_1px)]
        bg-[size:30px_30px]"
      />
      <div className="w-full h-screen md:p-5 p-2 flex flex-col">
        {
          transitionIntroProps(style => (
            <animated.div className="w-full h-full p-5 items-center justify-center" style={style as AnimationProps}>
              <ParallaxTilt/>
            </animated.div>
          ))
        }
        {
          transitionChooseColorProps(style => (
            <animated.div
            className="w-full h-screen"
            style={style as AnimationProps}
            >
              <ChooseColor onSubmit={(colorFrom, colorTo, layers) => {
                // Handle the color submission
                setColorFrom(colorFrom);
                setColorTo(colorTo);
                setNumberOfLayers(layers);

                onGenerate();

                setSceneName("3d-scene");
              }} />
            </animated.div>
          ))
        }
        {
          transitionThreeJsRendererProps(style => (
            <animated.div
              className="w-full h-screen"
              style={style as AnimationProps}
            >
              <Card kustomClass="absolute left-2 lg:left-5  top-2 lg:top-5 z-10 opacity-70">
                <ProgressButton
                  label="Generate"
                  onClick={() => {
                      generateTopographies();
                      setAnimationState("started")
                    }
                  } />
                <button className="btn btn-xs btn-secondary" onClick={() => setLight(!isLight)}>
                  {isLight ? "Dark" : "Light"}
                </button>
                <div className="flex flex-row gap-1">
                  <ColorBlobInput
                    value={colorFrom}
                    onChange={(newColor) => setColorFrom(newColor)}
                    animate={false}
                  />
                  <ColorBlobInput
                    value={colorTo}
                    onChange={(newColor) => setColorTo(newColor)}
                    animate={false}
                  />
                </div>
              </Card>
              <ThreejsRenderer shapes={shapes}/>
            </animated.div>
          ))
        }
      </div>
    </>
  )
}

export default App
