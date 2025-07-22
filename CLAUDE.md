## General

This application uses React, Typescript, Tailwindcss.

## Components

All components should live under the `src/components` folder. Each component inside this folder follows a structure of:

```
// located in src/components

Button/index.tsx // react component 
Button/styles.css // any styles relevant to the component. This is an optional file. It should only contain styles that pertain to the component defined in the folder.

```

Each component should follow this pattern for defining itself and the props/types available to it:

```typescript

export namespace Button {
  export type Props = {
    color: 'red' | 'blue';
  }
}

export function Button(props: Button.Props) {
  /**
   * State vars
   */
  // state vars and declarations

  /**
   * Side effects
   */
  // put any useEffects here

  /**
   * Render
   */
   return (
    <>component here</>
   )
}

```

We should not use default exports.