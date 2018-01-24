import { injectGlobal } from 'styled-components'

const bodyFont = `'Oxygen'`
const headerFont = `'Asap'`

export function applyGlobalStyles() {
  injectGlobal`
    html, body {
      font-family: ${bodyFont}, sans-serif;
      font-size: 16px;
      font-weight: 400;
    }

    h1, h2, h3, h4, h5 {
      font-family: ${headerFont}, sans-serif;
    }

    input, button {
      font-family: ${bodyFont}, sans-serif;
    }
  `
}
