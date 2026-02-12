import { useState, useEffect, useCallback, useRef } from "react";

const BUTTON_NAMES: Record<number, string> = {
  0: "L",
  1: "M",
  2: "R",
};

/** デバッグ表示用。押下中のマウスボタン一覧を返す（L=左, M=中, R=右） */
export function useDebugMouse(): string[] {
  const [buttons, setButtons] = useState<string[]>([]);
  const setRef = useRef<Set<number>>(new Set());

  const update = useCallback(() => {
    setButtons(Array.from(setRef.current).map((b) => BUTTON_NAMES[b] ?? `B${b}`));
  }, []);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      setRef.current.add(e.button);
      update();
    },
    [update]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      setRef.current.delete(e.button);
      update();
    },
    [update]
  );

  const handleMouseLeave = useCallback(() => {
    setRef.current.clear();
    setButtons([]);
  }, []);

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseDown, handleMouseUp, handleMouseLeave]);

  return buttons;
}
