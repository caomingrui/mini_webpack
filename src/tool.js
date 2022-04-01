//

const data = {};

export const fn = () => {
   const getVal = (key) => {
       return data[key];
   }

   const setVal = (key, value) => {
       if (!key) return;
       return data[key] = value;
   }

   return {
       getVal,
       setVal
   };
}