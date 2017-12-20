import { injectGlobal } from 'styled-components'

export function applyGlobalStyles() {
  injectGlobal`
    html, body {
      font-family: 'Muli', Helvetica, system-ui;
      font-size: 16px;
    }
  `
}
