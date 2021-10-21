import { LitElement, html, css } from "lit";

import { moreInfo } from "card-tools/src/more-info";
import { popUp } from "card-tools/src/popup";

export class TableCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
      _config: {
        hasChanged(newVal, oldVal) {
          return true;
        },
      },
    };
  }

  set config(config) {
    this._config = config;
    if (!this.sort) {
      this.sort = this._config.sort;
    }
  }

  get config() {
    return this._config;
  }

  set sort(sort) {
    this._sort = sort;
  }

  get sort() {
    if (!this._sort) {
      return {
        by: null,
        DESC: false,
      };
    }
    return this._sort;
  }

  getAsFunction(func, defaultValue, ...args) {
    if (!func) {
      return function () {
        return defaultValue;
      };
    }

    if (typeof func === "function") {
      return func;
    } else {
      return Function(args, func);
    }
  }

  getData() {
    var data = [];
    Object.values(this.hass.states)
      .filter((state) => {
        if (this.config.filter_functions) {
          for (const filter_function of this.config.filter_functions) {
            var func = this.getAsFunction(filter_function, true, "entity_row");
            if (!func(state)) {
              return false;
            }
          }
        }
        return true;
      })
      .forEach((state) => {
        var obj = {
          _entityID: state.entity_id,
        };
        for (const [header, column] of Object.entries(this.config.columns)) {
          var func = this.getAsFunction(column.function, "", "entity_row");
          obj[header] = {
            value: this.getAsFunction(column.function, "", "entity_row")(state),
            state: this.getAsFunction(
              column.state_function,
              "",
              "entity_row"
            )(state),
          };
        }

        data.push(obj);
      });

    return data;
  }

  sortData(data) {
    if (!this.sort.by) {
      return;
    }

    data.sort((a, b) => {
      var valA = this.sort.by in a ? a[this.sort.by].value : 0;
      var valB = this.sort.by in b ? b[this.sort.by].value : 0;
      if (valA < valB) {
        return this.sort.DESC ? 1 : -1;
      }
      if (valA > valB) {
        return this.sort.DESC ? -1 : 1;
      }

      return 0;
    });
  }

  render() {
    var data = this.getData();
    this.sortData(data);

    return html`
      <ha-card>
        ${this.config.header
          ? html`<h1 class="card-header">${this.config.header.title}</h1>`
          : html``}
        <table>
          <tr>
            ${Object.keys(this.config.columns).map((header) => {
              return html`
                <th
                  class="${this.sort.by == header ? `sort-by` : ``}"
                  @click="${(e) => {
                    this.sort = {
                      by: header,
                      DESC: this.sort.by == header && !this.sort.DESC,
                    };

                    this.requestUpdate();
                  }}"
                >
                  <h4>${header}</h4>
                </th>
              `;
            })}
          </tr>

          ${data.map((row) => {
            return html` <tr
              @click="${(e) => {
                if (this.config.popUpCard) {
                  var cardConfig = this.config.popUpCard;
                  cardConfig.entity = row._entityID;

                  popUp(
                    `Node: ${Object.values(row)[1].value}`,
                    this.config.popUpCard,
                    true
                  );
                } else {
                  moreInfo(row._entityID);
                }
              }}"
            >
              ${Object.keys(this.config.columns).map((header) => {
                return html`
                  <td class="${row[header].state}">
                    ${this.getAsFunction(
                      this.config.columns[header].transformation,
                      html`${row[header].value}`,
                      "value"
                    )(row[header].value)}
                  </td>
                `;
              })}
            </tr>`;
          })}
        </table>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      table {
        width: 100%;
        background-color: var(--table-row-background-color);
      }
      th {
        font-weight: bold;
        text-transform: uppercase;
        cursor: pointer;
      }
      td {
        text-align: center;
      }
      .table-row {
        cursor: pointer;
      }
      .table-row:hover {
        background-color: var(--table-row-alternative-background-color);
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
