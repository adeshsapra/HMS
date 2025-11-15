import React, { createContext, useContext, useReducer, useMemo, ReactNode } from "react";

interface MaterialTailwindState {
  openSidenav: boolean;
  sidenavColor: string;
  sidenavType: string;
  transparentNavbar: boolean;
  fixedNavbar: boolean;
  openConfigurator: boolean;
}

type MaterialTailwindAction =
  | { type: "OPEN_SIDENAV"; value: boolean }
  | { type: "SIDENAV_TYPE"; value: string }
  | { type: "SIDENAV_COLOR"; value: string }
  | { type: "TRANSPARENT_NAVBAR"; value: boolean }
  | { type: "FIXED_NAVBAR"; value: boolean }
  | { type: "OPEN_CONFIGURATOR"; value: boolean };

type MaterialTailwindDispatch = React.Dispatch<MaterialTailwindAction>;

type MaterialTailwindContextValue = [MaterialTailwindState, MaterialTailwindDispatch];

export const MaterialTailwind = createContext<MaterialTailwindContextValue | null>(null);
MaterialTailwind.displayName = "MaterialTailwindContext";

export function reducer(
  state: MaterialTailwindState,
  action: MaterialTailwindAction
): MaterialTailwindState {
  switch (action.type) {
    case "OPEN_SIDENAV": {
      return { ...state, openSidenav: action.value };
    }
    case "SIDENAV_TYPE": {
      return { ...state, sidenavType: action.value };
    }
    case "SIDENAV_COLOR": {
      return { ...state, sidenavColor: action.value };
    }
    case "TRANSPARENT_NAVBAR": {
      return { ...state, transparentNavbar: action.value };
    }
    case "FIXED_NAVBAR": {
      return { ...state, fixedNavbar: action.value };
    }
    case "OPEN_CONFIGURATOR": {
      return { ...state, openConfigurator: action.value };
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as MaterialTailwindAction).type}`);
    }
  }
}

interface MaterialTailwindControllerProviderProps {
  children: ReactNode;
}

export function MaterialTailwindControllerProvider({
  children,
}: MaterialTailwindControllerProviderProps): JSX.Element {
  const initialState: MaterialTailwindState = {
    openSidenav: false,
    sidenavColor: "dark",
    sidenavType: "white",
    transparentNavbar: true,
    fixedNavbar: false,
    openConfigurator: false,
  };

  const [controller, dispatch] = useReducer(reducer, initialState);
  const value: MaterialTailwindContextValue = useMemo(
    () => [controller, dispatch],
    [controller, dispatch]
  );

  return (
    <MaterialTailwind.Provider value={value}>
      {children}
    </MaterialTailwind.Provider>
  );
}

export function useMaterialTailwindController(): MaterialTailwindContextValue {
  const context = useContext(MaterialTailwind);

  if (!context) {
    throw new Error(
      "useMaterialTailwindController should be used inside the MaterialTailwindControllerProvider."
    );
  }

  return context;
}

MaterialTailwindControllerProvider.displayName = "/src/context/index.tsx";

export const setOpenSidenav = (dispatch: MaterialTailwindDispatch, value: boolean): void =>
  dispatch({ type: "OPEN_SIDENAV", value });
export const setSidenavType = (dispatch: MaterialTailwindDispatch, value: string): void =>
  dispatch({ type: "SIDENAV_TYPE", value });
export const setSidenavColor = (dispatch: MaterialTailwindDispatch, value: string): void =>
  dispatch({ type: "SIDENAV_COLOR", value });
export const setTransparentNavbar = (dispatch: MaterialTailwindDispatch, value: boolean): void =>
  dispatch({ type: "TRANSPARENT_NAVBAR", value });
export const setFixedNavbar = (dispatch: MaterialTailwindDispatch, value: boolean): void =>
  dispatch({ type: "FIXED_NAVBAR", value });
export const setOpenConfigurator = (dispatch: MaterialTailwindDispatch, value: boolean): void =>
  dispatch({ type: "OPEN_CONFIGURATOR", value });

