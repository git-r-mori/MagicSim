import { useState, useEffect, useCallback, useRef } from "react";

/** デバッグ表示用。押下中のキーコード一覧を返す */
export function useDebugKeys(): string[] {
  const [keys, setKeys] = useState<string[]>([]);
  const setRef = useRef<Set<string>>(new Set());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setRef.current.add(e.code);
    setKeys(Array.from(setRef.current));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setRef.current.delete(e.code);
    setKeys(Array.from(setRef.current));
  }, []);

  const handleBlur = useCallback(() => {
    setRef.current.clear();
    setKeys([]);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleBlur);
    };
  }, [handleKeyDown, handleKeyUp, handleBlur]);

  return keys;
}
