import * as React from 'react';

export const navigationRef = React.createRef();
//@ts-ignore
export function navigate(name, params) {
  //@ts-ignore
  navigationRef.current?.navigate(name, params);
}

export function setNavigationRef(ref: any) {
  //@ts-ignore
  navigationRef.current = ref;
}
