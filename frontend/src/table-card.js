import {
  LitElement,
  html,
  css,
} from "lit";

export class TableCard extends LitElement {
  static get properties() {
    return {
        hass: { type: Object },
        narrow: { type: Boolean },
        route: { type: Object },
        panel: { type: Object },
        config: {},
    };
  }

  setConfig(config) {
    this.config = config;
  }

  findByPath(obj, path) {
    const pathSplitted = path.split('.')
    const first = pathSplitted.shift()

    if (pathSplitted.length == 0) {
      return obj[first]
    } else {
      return this.findByPath(obj[first], pathSplitted.join('.'))
    }
  }

  render() {
    return html`
    <ha-card header="Pods">
      <table>
      <tr>
        ${Object.keys(this.config.columns).map(header => {
          return html`
          <th>${header}</th>
          `;
        })}
      </tr>
      ${Object.values(this.hass.states).
      filter(state => {
        for (const [key, value] of Object.entries(this.config.filters)) {
          if (this.findByPath(state, key) != value) {
            return false;
          }
        }
        return true;
      }).
      map(state => {
        return html`
          <tr>
            ${Object.values(this.config.columns).map(selector => {
              return html`
                <th>${this.findByPath(state, selector)}</th>
              `;
            })}
          </tr>
        `;
      })}
      </table>
    </ha-card>
    `;
  }

  getOverallPodHealth() {
    count = 0;
    healthy = 0;

    Object.values(tis.hass.state).map(state => {
      if (state.attributes.device_class == "Pod") {
        count++;
        if (state.state == "Ready") {
          healthy++;
        }
      }
    })

    return healthy / count;
  }

  static get styles() {
    return css`
      :host {
        background-color: #fafafa;
        padding: 16px;
        display: block;
      }
      table {
        width: 100%;
      }
    `;
  }
}

customElements.define("table-card", TableCard);