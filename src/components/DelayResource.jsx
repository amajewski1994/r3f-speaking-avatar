function createDelay(ms) {
  let done = false;
  let promise = new Promise((resolve) => {
    setTimeout(() => {
      done = true;
      resolve();
    }, ms);
  });

  return {
    read() {
      if (!done) throw promise;
    },
  };
}

const delay3s = createDelay(3000);

export function Delay({ children }) {
  delay3s.read();
  return children;
}
