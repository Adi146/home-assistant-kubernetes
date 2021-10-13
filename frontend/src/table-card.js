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
    const pathSplitted = path.split(/\.|\[|\]\.|\]/);
    const first = pathSplitted.shift();

    if (pathSplitted.length == 0) {
      return obj[first];
    } else {
      return this.findByPath(obj[first], pathSplitted.join('.'));
    }
  }

  getStateClass(obj, value, colorMap) {
    if (colorMap) {
      for (const [k, v] of Object.entries(colorMap)) {
        if (value == v) {
          return k;
        }
        else if (value == this.findByPath(obj, v)) {
          return k;
        }
      }
    }

    return "";
  }

  getData() {
    var data = [];

    Object.values(this.hass.states).
      filter(state => {
        for (const [key, value] of Object.entries(this.config.filters)) {
          if (this.findByPath(state, key) != value) {
            return false;
          }
        }
        return true;
      }).
      forEach(state => {
        var obj = {};
        this.config.columns.forEach(column => {
          obj[column.header] = this.findByPath(state, column.path);
        });

        data.push(obj);
      })

    return data;
  }

  sortData(data) {
    if (!this.config.sortBy) {
      return
    }

    data.sort((a, b) => {
      var valA = a[this.config.sortBy].toUpperCase();
      var valB = b[this.config.sortBy].toUpperCase();
      if (valA < valB) {
        return this.config.sortDESC ? 1 : -1;
      }
      if (valA > valB) {
        return this.config.sortDESC ? -1 : 1;
      }

      return 0;
    });
  }

  render() {
    var data = this.getData();
    this.sortData(data);

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
          <th class="table-header-cell ${(this.config.sortBy == column.header) ? `sort-by` : ``}" @click="${(e) => {
            this.config.sortDESC = this.config.sortBy == column.header && !this.config.sortDESC;
            this.config.sortBy = column.header;

            this.requestUpdate()
          }}"><h4>${column.header}</h4></th>
          `;
      })}
      </tr>
      ${data.map(row => {
        return html`
          <tr class="table-row">
          ${Object.values(row).map(cell => {
          return html`
              <th class="table-cell">${cell}</th>
            `;
        })}
          </tr>`
      })}
      </table>
    </ha-card>
    `;
  }

  static get styles() {
    return css`
      table {
        width: 100%;
      }
      .table-header {
        font-weight: bold;
        text-transform: uppercase;
        cursor: pointer;
      }
      .sort-by {
        text-decoration: underline;
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