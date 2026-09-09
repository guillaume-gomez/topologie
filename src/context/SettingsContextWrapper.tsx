import { createContext, useState, type ReactNode } from 'react';
import useGrid from "../hooks/useGrid";

type GenerationAnimationState = "started" | "ended";

export interface SettingsContextParams {
  isLight: boolean;
  setLight: (newLight: boolean) => void;
  width: number;
  height: number;
  numberOfLayers: number;
  setNumberOfLayers: (layers: number) => void;
  timerSwitch: number;
  timerGeneration: number;
  animationState: GenerationAnimationState;
  setAnimationState: (status: GenerationAnimationState ) => void;
  colorFrom: string;
  setColorFrom: (color: string) => void;
  colorTo: string;
  setColorTo: (color: string) => void;
  colorChosen: boolean;
  setColorChosen: (chosen: boolean) => void;
  hasSingleTopograhy: boolean;
  grid: Grid;
}
export const SettingsContext = createContext<SettingsContextParams>(null!);

interface Props {
  children: ReactNode;
}

function SettingsContextWrapper({children}: Props) {
  const [isLight, setLight] = useState<boolean>(true);
  const [numberOfLayers, setNumberOfLayers] = useState<number>(7);
  const [colorFrom, setColorFrom] = useState<string>("#abe2ab");
  const [colorTo, setColorTo] = useState<string>("#742906");
  const [animationState, setAnimationState] = useState<GenerationAnimationState>("ended");
  const [colorChosen, setColorChosen] = useState<boolean>(false);
  const [hasSingleTopograhy, ] = useState<boolean>(false);
  const { grid, width, height } = useGrid({filepath: "bretagne.json", typeOfFile: "real-data" });

  return (
    <SettingsContext value={{
      hasSingleTopograhy,
      isLight, setLight,
      timerSwitch: 2000,
      timerGeneration: 4000,
      animationState, setAnimationState,
      width,
      height,
      numberOfLayers, setNumberOfLayers,
      colorFrom, setColorFrom,
      colorTo, setColorTo,
      colorChosen, setColorChosen,
      grid
    }}>
      {children}
    </SettingsContext >
  );
}

export default SettingsContextWrapper;