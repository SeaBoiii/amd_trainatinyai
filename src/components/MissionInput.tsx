import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { Mission } from '../types';
import DrawingCanvas, { type DrawingCanvasHandle } from './DrawingCanvas';
import SliderStudio from './SliderStudio';
import { canvasToVector, hasEnoughInk } from '../utils/canvasProcessing';
import { defaultFeatureValues, featuresToVector } from '../utils/featureProcessing';

/** Unified imperative handle so screens treat every mission the same way. */
export interface MissionInputHandle {
  /** Returns the current example as a vector, or null if there isn't a valid one yet. */
  getVector: () => number[] | null;
  /** Clears the drawing / resets the sliders. */
  reset: () => void;
  /** Whether the visitor has produced something to add. */
  isDirty: () => boolean;
}

interface MissionInputProps {
  mission: Mission;
  size?: number;
  disabled?: boolean;
  /** Called on the first interaction (used to clear warnings). */
  onInteract?: () => void;
}

/**
 * Renders the right input for a mission — a drawing canvas for 'draw' missions,
 * or feature sliders for 'sliders' missions — behind one common handle. This
 * lets the Training and Test screens stay simple and modality-agnostic.
 */
const MissionInput = forwardRef<MissionInputHandle, MissionInputProps>(function MissionInput(
  props,
  ref,
) {
  if (props.mission.inputType === 'sliders') {
    return <SliderInput ref={ref} {...props} />;
  }
  return <DrawInput ref={ref} {...props} />;
});

export default MissionInput;

/* ---- Drawing modality ---- */
const DrawInput = forwardRef<MissionInputHandle, MissionInputProps>(function DrawInput(
  { size = 340, disabled, onInteract },
  ref,
) {
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  useImperativeHandle(ref, () => ({
    getVector: () => {
      const canvas = canvasRef.current?.getCanvas();
      if (!canvas || !canvasRef.current?.isDirty()) return null;
      const vector = canvasToVector(canvas);
      if (!hasEnoughInk(vector)) return null;
      return vector;
    },
    reset: () => canvasRef.current?.clear(),
    isDirty: () => canvasRef.current?.isDirty() ?? false,
  }));

  return (
    <DrawingCanvas ref={canvasRef} size={size} disabled={disabled} onDrawStart={onInteract} />
  );
});

/* ---- Sliders modality ---- */
const SliderInput = forwardRef<MissionInputHandle, MissionInputProps>(function SliderInput(
  { mission, disabled, onInteract },
  ref,
) {
  const axes = mission.features ?? [];
  const [values, setValues] = useState<Record<string, number>>(() =>
    defaultFeatureValues(axes),
  );
  const touched = useRef(false);

  // Reset to defaults whenever the mission changes.
  useEffect(() => {
    setValues(defaultFeatureValues(axes));
    touched.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission.id]);

  useImperativeHandle(
    ref,
    () => ({
      // Sliders always have valid values, so an example can always be made.
      getVector: () => featuresToVector(values, axes),
      reset: () => {
        setValues(defaultFeatureValues(axes));
        touched.current = false;
      },
      isDirty: () => true,
    }),
    [values, axes],
  );

  const handleChange = (id: string, value: number) => {
    if (!touched.current) {
      touched.current = true;
      onInteract?.();
    }
    setValues((v) => ({ ...v, [id]: value }));
  };

  return (
    <SliderStudio
      axes={axes}
      values={values}
      preview={mission.preview}
      onChange={handleChange}
      disabled={disabled}
    />
  );
});
