import { useState } from "react";

export const useAsyncState = (initialValue) => {
  const [value, setValue] = useState(initialValue);

  const setter = async (newValue) => {
    setValue(newValue);
    return Promise.resolve();
  };

  return [value, setter];
};
