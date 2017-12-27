import { injectGlobal } from 'styled-components'

export function applyGlobalStyles() {
  injectGlobal`
    html, body {
      font-family: 'Oxygen', sans-serif;
      font-size: 16px;
      font-weight: 300;
    }

    input {
      font-family: 'Oxygen', sans-serif;
    }
  `
}
