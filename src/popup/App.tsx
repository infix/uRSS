import React, { useEffect, useState } from "react";
import { browser } from "webextension-polyfill-ts";

export const App = () => {
  const [list, setList] = useState([]);
  useEffect(() => {
    browser.runtime.sendMessage({}).then(e => {
      setList(e);
    });
  }, []);

  return (
    <>
      <div>popup</div>
      {list.map(i => <div key={i}>Item{i}</div>)}
    </>
  );
};
