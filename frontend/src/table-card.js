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

  getStateClass(obj, value, colorMap) {
    if (colorMap) {
      for (const [k, v] of Object.entries(colorMap)) {
        if (value == v) {
          return k;
        }
        else if (value == this.findByPath(obj, v)){
          return k;
        }
      }
    }

    return "";
  }

  render() {
    return html`
    <ha-card>
      ${this.config.header ?
        html`<h1 class="card-header">${this.config.header.title}</h1>` :
        html``
      }
      <table>
      <tr class="table-header">
        ${this.config.columns.map(column => {
          return html`
          <th><h4>${column.header}</h4></th>
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
          <tr class="table-row">
            ${this.config.columns.map(column => {
              const value = this.findByPath(state, column.path);
              const stateClass = this.getStateClass(state, value, column.states);

              return html`
                <th class="table-cell ${stateClass}">${value}</th>
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
      table {
        width: 100%;
      }
      .table-header {
        font-weight: bold;
        text-transform: uppercase;
      }
      .success {
        color: var(--success-color);
      }
      .warning {
        color: var(--warning-color);
      }
      .error {
        color: var(--error-color);
      }
    `;
  }
}

customElements.define("table-card", TableCard);